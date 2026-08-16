# Design (How) — installer-stale-cleanup

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end
> **ฉบับที่ 3** — ผ่าน review panel 5 role (40 blocker) · สรุปการแก้อยู่ §10

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` (`src/bin/cli.mjs` + `src/tests/`) — payload ใต้ `CORE` ปัจจุบัน **91 ไฟล์**
- **แนวทาง:** เพิ่มเฟส **prune** ต่อจาก `copyTree` โดยตัดสินจาก **manifest ที่ผูก hash** ไม่ใช่ส่วนต่างของไดเรกทอรี — เพราะ 2 ใน 5 CORE dir **แชร์กับผู้ใช้** (`.claude/skills/`, `.claude/agents/`)
- **★ security posture:** manifest เป็นไฟล์ในโปรเจกต์ที่ **commit ได้ = untrusted input** ⇒ ทุกการลบผ่าน **guard 6 ชั้นอิสระ: C4 (path) · C5 (scope allowlist) · C7 (hash) · C8 (fs containment) · C9 (blast cap) · C12 (mode)** — แต่ละชั้นต้องพอตัดสิน "ไม่ลบ" ได้ด้วยตัวเอง (ลิสต์นี้เป็น canonical — `proposal.md §5` และ `tasks/*/rule.md` copy จากที่นี่)

## 2. Vertical slices + file ownership (exclusive)

| # | Slice | ไฟล์ที่เป็นเจ้าของแต่ผู้เดียว | → task |
|---|---|---|---|
| 1 | **prune ทำงานจริงและปลอดภัย** — manifest I/O + pure fn + guard ทุกชั้น + flag + รายงาน + wiring | `src/bin/cli.mjs` · `src/tests/installer-prune.test.mjs` (unit ใหม่) | `tasks/prune/` |
| 2 | **upgrade path ถูกพิสูจน์** — black-box + mutant harness | `src/tests/installer-upgrade.test.mjs` | `tasks/upgrade-path-test/` |
| 3 | **release `0.30.1`** — surface ของ flag + CHANGELOG + runbook + MIN_PASS + full gate | `CHANGELOG.md` · `package.json` · `docs/infra.md` · `src/scripts/check-test-count.mjs` · `README.md` · `src/.warnyin/workflow/README.md` · `src/.warnyin/installer/templates/CLAUDE.md` · `src/tests/verify-pack.test.mjs` · แก้บรรทัด `--help` assert ใน `src/tests/installer.test.mjs` | `tasks/release-hygiene/` |

> **ยุบ slice 1+2 เดิมเข้าด้วยกัน** (panel: SA B7 · TL B1) — การแยก pure fn ออกจาก I/O เป็น horizontal split ที่แก้ไฟล์เดียวกัน จึงไม่ได้ parallelism และทำให้ขอบเขต prune มี 2 เจ้าของ
> **`docs/techstack/installer/*` ไม่อยู่ใน slice ใด** — `build.md §3 ข้อ 6` ห้าม BUILD แตะ rule/standard กลาง ⇒ note ไว้ใน `tasks/*/rule.md §2` รอ SHIP (รวม `node:crypto` ที่ต้องเพิ่มในรายการ built-in ที่อนุญาต)

## 3. Data model / schema
**`.warnyin/.warnyin-manifest`** — `# warnyin manifest v1 — เขียนโดย installer <version> · ห้ามแก้มือ` แล้วบรรทัดละ `<sha256 hex64>␠␠<path POSIX>` เรียง A→Z · LF เสมอ
- **hash = sha256 ของ buffer ที่เขียนจริง (หลัง `normalizeEol`)** — ไม่ใช่ไฟล์ดิบใน `pkgRoot`; tarball ที่ pack จาก checkout CRLF จะทำให้ hash ไม่ตรงทุกไฟล์ ⇒ prune กลายเป็น no-op เงียบ (KB #30)
- **entry เข้า manifest เมื่อ** (เขียนจริงรอบนี้) **หรือ** (มีบนดิสก์และ byte-equal กับ payload หลัง normalize) — ครอบทั้ง byte-equal skip และเคส **first-install `overwrite:false` ที่ไฟล์ผู้ใช้ชื่อชน** (ห้ามเคลมเป็นของเรา)
- **`--global`: ไม่บันทึก entry ใต้ `.claude/{agents,skills}` เลย** ให้สมมาตรกับ C11 (กัน manifest ก้อนเดียวถูกใช้ข้ามโหมด)
- **ขอบเขต:** ไม่รวม `docs/`, scaffold, IDE adapter doc, `.warnyin-version`, ตัว manifest เอง

## 4. Interface / contract
> task **copy คำต่อคำ** เป็น needle ของเทส · รายละเอียดเคสอยู่ `tasks/*/spec.md`

| # | contract |
|---|---|
| **C1** | `readManifest(target)` (fs, มี `statSync` guard `maxBytes = 1 MB` ก่อนอ่าน) → ส่งข้อความให้ `parseManifest(text, {maxEntries: 5000})` (pure) → `{ entries: {path,sha256}[], rejected: {line,reason}[] }` · ข้ามบรรทัดว่าง/`#` · trim `\r` · `sha256` ต้องเป็น hex 64 ไม่งั้น reject · **duplicate path → ทิ้งทั้งคู่** (fail-closed) · เกิน `maxEntries` → ถือว่าทั้งไฟล์ใช้ไม่ได้ + ⚠ · **ไม่ throw ทุกกรณี** |
| **C2** | `computeStale({manifestOld, payloadNew, knownStale, prunableRoots, statOnDisk})` → `{ stale: {path, sha256\|null, source}[], rejected: {path,reason}[] }` — pure · `source ∈ {'manifest','known-stale'}` · **`knownStale` ถูกรวมก็ต่อเมื่อ `manifestOld` ว่าง** (ไม่มี/อ่านไม่ได้) · `stale = (ที่รวมแล้ว) − payloadNew` เฉพาะที่ `statOnDisk` = true · เรียง A→Z · unique · **คืน `rejected` เสมอ** |
| **C3** | **fail-closed:** `source==='manifest' && !sha256` → reject (`hash:missing`) ห้ามลบ · `source==='known-stale'` → `sha256 = null` โดยเจตนา (ยกเว้น C7) |
| **C4** | **path guard (pure, รันก่อน `statOnDisk`) — reject ถ้า:** (1) มี `\` (2) มี segment `..` หรือ `.` (3) ขึ้นต้น `/` หรือมี `:` ใน segment แรก (4) มี control char `\x00–\x1f\x7f` (5) **ไม่ขึ้นต้นด้วย entry ใน `prunableRoots` แบบ segment-wise** (`rel === root \|\| rel.startsWith(root + '/')`) · **rationale ห้ามยุบ:** (2) load-bearing เพราะ `.warnyin/workflow/../../x` ผ่าน (5) ได้ · เทียบเป็น POSIX เสมอ แปลง native ที่จุดลบเท่านั้น |
| **C5** | **scope allowlist ใน dir ที่แชร์:** ใต้ `.claude/agents/` เฉพาะ `warnyin-*.md` · ใต้ `.claude/skills/` เฉพาะ `explore/`, `next/`, `update-codemaps/` — **append-only** (ห้ามลบชื่อออกเมื่อเลิก ship skill นั้น ไม่งั้นลบของตกรุ่นไม่ได้) + มีเทส structural ว่า allowlist ⊇ skill dir ใน payload จริง |
| **C6** | **POSIX/native:** `toPosix(rel) = rel.split(sep).join('/')` เป็น helper เดียว · `CORE_POSIX` derive จาก `CORE` · **input ของ `computeStale` ทุกตัวเป็น POSIX** · `computeStale` รับ `sep` ได้เพื่อ unit-test รูป `\` บน Linux (CI ไม่มี Windows runner) |
| **C7** | **hash gate:** `source==='manifest'` ลบได้เมื่อ sha256 ของไฟล์บนดิสก์ (อ่านแล้ว `normalizeEol` ก่อน hash) **ตรง** — ไม่ตรง → ข้าม + `⚠ <path> [hash:mismatch]` (ใช้ตามเซตปิด C15 เสมอ) · `lstat().size > 5 MB` → ข้าม + `[prune:too-large]` (ใช้ `lstat` ตัวเดียวกับ C8) |
| **C8** | **fs containment:** `root = realpathSync(target/<prunableRoot>)` · `parent = realpathSync(dirname(abs))` → ต้อง `path.relative(root, parent)` ไม่ขึ้นต้น `..` และไม่ absolute · `realpath` throw → ข้าม · แล้ว `lstat(abs)` ต้องเป็น regular file · **ใช้ `fs.realpathSync` ตัวเดียวกันทั้งสองฝั่ง** (ห้ามผสม `.native`) · วาง `lstat` ติด `unlink` ไม่แทรก I/O |
| **C9** | **blast cap:** นับ **2 ชั้น** — ชั้นแรกบน `stale` ก่อนอ่านไฟล์ (กัน I/O จาก manifest ปลอม) ชั้นตัดสินบนรายการที่ผ่าน C7/C8 แล้ว · เกิน **50** (≈ ครึ่งของ payload 91 ไฟล์) → **ไม่ลบเลย** + `⚠ [prune:blast-cap] N ไฟล์ …` + exit 0 · **`--dry-run` ยกเว้น cap เสมอ** (ต้อง list ได้ ไม่งั้นคำแนะนำพาไปตัน) · escape = `--prune-force` (บันทึกใน runbook) |
| **C10** | **empty-dir:** candidate = **`dirname` ของไฟล์ที่ถูกลบใน run นี้เท่านั้น** ไต่ขึ้นได้จนถึงแต่ **ไม่รวม** `prunableRoot` · ต้องผ่าน C8 · เป็น dir จริงไม่ใช่ symlink · `readdir` ว่าง · **ต้องไม่ว่างมาก่อนเริ่ม prune** (สแกน snapshot ก่อน) — dir ว่างของผู้ใช้ต้องรอด |
| **C11** | **mode:** prune เฉพาะ `--update` และไม่มี `--no-prune`/`WARNYIN_NO_PRUNE=1` · `--global` → `prunableRoots` = 3 dir (`.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`) · project → 5 dir · **`prunableRoots` เป็น input ของ `computeStale`** (C11 จึง pure และเทสได้ที่ slice เดียว) |
| **C12** | **error ใดก็ตาม**ระหว่างลบ → `⚠ <path> [prune:io]` แล้วทำงานต่อ ไม่ล้มทั้ง run (ห้าม enumerate errno — Windows ให้ `EBUSY`/`EPERM`) |
| **C13** | **`writeManifest`:** `manifestNew = payloadNew ∪ (manifestOld ∩ statOnDisk)` — **คง hash เดิมของ entry เก่าที่ยังอยู่** ⇒ `--no-prune` / ติดตั้งซ้ำแบบไม่มี `--update` / cap trip **ไม่ทำให้ข้อมูลหาย** (ปิดถาวรไม่ได้โดยอุบัติเหตุ) · เขียนหลัง copy ก่อน prune · `--dry-run` ไม่เขียน · นับ `stats` + พิมพ์ `+`/`↻` แบบ `writeVersionStamp` · header ใช้ `readPkgVersion()` |
| **C14** | **known-stale (transition):** `KNOWN_STALE = ['.warnyin/template/stages/[topic]/test.md', '.warnyin/template/stages/[topic]/verify.md']` — รายชื่อตายตัว ห้าม glob · **apply เฉพาะเมื่อ `.warnyin-version` หายหรือ `semverLt(stamp,'0.30.1')`** — **★ implement `semverLt` ใน `cli.mjs` เอง ห้าม import จาก `src/scripts/setup-dogfood.mjs`**: path นั้นไม่อยู่ใน `package.json files` ⇒ ไม่ถูก publish (ยืนยันด้วย tarball จริง: 0 ไฟล์ใต้ `src/scripts/`) ⇒ import แล้วผู้ใช้ crash ขณะที่เทสในรีโปเขียวทั้งชุด (false-green ระดับ ship-breaking) ⇒ const ปลดระวางตัวเองด้วยเกณฑ์ที่วัดได้ · ที่มาของรายชื่อ: `git log --diff-filter=D -- src/.warnyin src/.claude` · **ยกเว้น C7 โดยเจตนา** — ประกาศเป็น known limit ใน §6 |
| **C15** | **รายงาน:** ลบสำเร็จ `  − <path>` (U+2212) · ข้าม `  ⚠ <path> [<reason>]` · reason เป็น **เซตปิด**: `path:backslash` · `path:dot-segment` · `path:absolute` · `path:control-char` · `scope:outside-root` · `scope:not-allowlisted` · `hash:missing` · `hash:mismatch` · `prune:too-large` · `prune:symlink` · `prune:not-contained` · `prune:io` · `prune:blast-cap` · **path ต้อง sanitize ก่อนพิมพ์** (strip control/ANSI, ตัดยาว) · พิมพ์ POSIX form · `--dry-run` ใช้หัวข้อ `จะลบ:` แล้วตามด้วยบรรทัด `  − <path>` รูปแบบเดียวกัน · **สรุปพิมพ์เสมอแม้ 0 ไฟล์:** `สรุป: สร้างใหม่ N · อัปเดต N · ข้าม (มีอยู่แล้ว) N · ลบ N` |

## 5. Flow
```
main() --update
  → copyTree(CORE, {overwrite, onFile})   ★ ย้าย read+normalize ขึ้นก่อน branch exists&&!overwrite
                                            แล้ว onFile(relPosix, sha256, wrote|byteEqual) → payloadNew
  → writeManifest(payloadNew ∪ manifestOld∩onDisk)      C13
  → {stale, rejected} = computeStale(...)               C2 C3 C4 C5 C6 C11 C14
  → prune: C9(ชั้น1) → C7 → C8 → C9(ชั้น2) → unlink → C15 → empty-dir C10
```
- **fail-toward-under-delete โดยเจตนา:** ทุกจุดที่ไม่แน่ใจ = ไม่ลบ · C13 ทำให้ข้อมูลไม่หายแม้ไม่ได้ prune รอบนั้น
- **residual risk ที่รับไว้:** TOCTOU `lstat`→`unlink` (Node ไม่มี `unlinkat`/`O_NOFOLLOW`) — defense หลักคือ C8 + C7 · flag typo (`--noprune`) ไม่ถูกจับ → พิมพ์ `⚠ ไม่รู้จัก flag` เมื่อขึ้นต้น `--` แต่ไม่รู้จัก

## 6. ผลกระทบต่อระบบเดิม
- **install สด / ไม่มี `--update`:** prune ไม่รัน · manifest ถูกเขียน
- **ผู้ใช้ที่แก้ไฟล์ payload เอง:** hash ไม่ตรง → ไม่ถูกลบ (เปลี่ยนจากเดิมที่ `--update` เขียนทับเงียบ)
- **known limit ที่ประกาศไว้:** (ก) `KNOWN_STALE` 2 path ยกเว้น hash ⇒ ผู้ใช้ที่เขียนไฟล์ชื่อนั้นเองบน install เก่าจะโดนลบ (ข) ไฟล์ที่เนื้อหาเดาได้ (0 byte) ในโฟลเดอร์ที่แชร์ ป้องกันด้วย C5 อย่างเดียว
- **`.codebuddy/plugins/warnyin/commands/warnyin/`** (`copyDirToTarget`) — installer เป็นเจ้าของ 100% และมีอาการตกค้างแบบเดียวกัน → **out of scope รอบนี้** เพราะเป็น mirror ที่ regenerate ได้ทุก install · เปิด backlog entry ตอน SHIP
- **`verify:pack`:** `.warnyin-manifest` เกิดที่ target เท่านั้น และ `DENY_PREFIX '.warnyin/'` ครอบ root dogfood อยู่แล้ว ⇒ **ไม่ต้องแก้ `verify-pack.mjs`** — เพิ่มเฉพาะ **unit เคสคู่ขนาน** ยืนยันว่า `checkFiles(['.warnyin/.warnyin-manifest'])` คืน error (slice 3)
- **wording ที่ต้องอัปเดตพร้อมกัน 4 จุด + 1 เทส** — ประโยคเดิม `` `--update` เขียนทับเฉพาะ CORE — ไฟล์ `docs/` ถูก seed จาก template ถ้ายังไม่มี ไม่ทับของเดิม `` ไม่ครบทันทีที่ prune ทำงาน → **canonical ใหม่:** `` `--update` เขียนทับเฉพาะ CORE และลบไฟล์ CORE ที่ตกรุ่น (ปิดด้วย `--no-prune`) — ไฟล์ `docs/` ถูก seed จาก template ถ้ายังไม่มี ไม่ทับของเดิม `` copy คำต่อคำลง `README.md:40` · `workflow/README.md:101` · `templates/CLAUDE.md:49` · `--help` (`cli.mjs:50`) และแก้ assert `installer.test.mjs:720` + negative-grep wording เก่า

## 7. Dependency
```
wave 1 (ขนาน):  prune  │  upgrade-path-test        wave 2:  release-hygiene
```
- **depth 2 · width 2** — ยุบ slice ตาม panel แล้วไม่มี slice ไหนแก้ไฟล์เดียวกัน
- slice 2 เขียนเทสจาก contract C1–C15 (ไม่อ่านโค้ด slice 1) ⇒ **แดงตลอด wave 1 เป็นเรื่องปกติ** · **เจ้าของการทำให้เขียว = full-gate ของ BUILD (`build.md §4 step 6`, main loop)** ไม่ใช่ `release-hygiene` (wave สุดท้ายแก้ได้เฉพาะจุดเชื่อม) · `task.md` ของ slice 2 ต้องประกาศ expected-red list ระบุชื่อเคส และ acceptance คือ "แดงด้วยเหตุผลที่ถูกต้อง"

## 8. Test strategy ระดับ design
- **unit (slice 1):** guard C4 ครบ 5 ข้อทีละข้อ · C5 allowlist สองขั้ว (`warnyin-old.md` ลบได้ / `other.md` reject) · C2 known-stale สองขั้ว (มี manifest → ไม่ทำงาน / ไม่มี → ทำงาน) · C3 fail-closed · C9 boundary (`50` ผ่าน / `51` ไม่ลบ) · C13 (`--no-prune` แล้วรอบหน้ายังเห็น stale) · C6 truth table รูป `/` และ `\`
- **fs (slice 1):** symlink **ancestor** และ leaf (สร้างจริงใน temp; Windows สร้างไม่ได้ → `console.error` + `return` ห้าม `t.skip` เพราะ pass-count gate) · hash mismatch · empty-dir ของผู้ใช้ต้องรอด · `--global` สองครึ่ง (dir แชร์รอด / `.warnyin/template` ถูกลบ)
- **black-box (slice 2):** fixture = **copy `src/` ทั้งก้อนเป็น pkg เก่า** แล้วเติม 2 ไฟล์ที่ถูกยุบกลับ → spawn ติดตั้ง → เพิ่มไฟล์ผู้ใช้ → `--update` ด้วย cli จริง · fixture A (ลบ manifest) และ B (คง manifest) · `--dry-run` ไม่แตะ manifest · idempotent · **T1 payloadNew semantics** (ติดตั้ง → `--update` ทันที → file set เท่าเดิม, `ลบ 0`) · **global test ต้อง override ทั้ง `HOME` และ `USERPROFILE`**
- **★ mutant harness (เคสถาวรใน suite):** copy `cli.mjs` ลง pkg ปลอมใน temp → apply mutation ด้วย string replace → **`assert.notEqual(mutated, original)` ก่อน (fail-loud ตาม KB #33)** → spawn → assert ว่าไฟล์ที่เคส negative บอกว่า "ยังอยู่" **หายไป** · ต้องมี **mutation matrix** ครบทุก guard (C4×5, C5, C7, C8 ancestor+leaf, C9, C10, C13)

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)

### ADDED

#### Requirement: Installer ลบไฟล์ payload ที่ตกรุ่นตอน --update โดยไม่แตะของผู้ใช้ (→ feature: installer-prune)

installer เก็บ manifest ที่ผูก hash ของไฟล์ที่ตัวเองวาง แล้วตอน `--update` ลบเฉพาะไฟล์ที่อยู่ใน manifest และเนื้อหายังตรง hash (หรืออยู่ใน known-stale list สำหรับ install ที่เก่ากว่า `0.30.1`) และไม่มีใน payload รุ่นใหม่ โดยต้องผ่าน guard ทั้งเชิง path, ขอบเขต, filesystem และเพดานจำนวน; ไฟล์ที่ผู้ใช้เพิ่มเองหรือแก้เองไม่ถูกแตะ · ปิดได้ด้วย `--no-prune` · `--dry-run` แสดงรายการโดยไม่ลบ · `--global` ไม่ prune ไดเรกทอรีที่แชร์กับผู้ใช้ · manifest คงข้อมูลของไฟล์ที่ยังอยู่บนดิสก์เสมอ

##### Scenario: ไฟล์ที่ถูกยุบออกจาก payload ถูกลบตอนอัปเดต
- GIVEN โปรเจกต์ที่ติดตั้งด้วย payload รุ่นเก่ากว่า `0.30.1` ซึ่งมี `.warnyin/template/stages/[topic]/test.md` และ `verify.md`
- WHEN รัน installer ด้วย `--update` จาก payload รุ่นที่ไม่มีสองไฟล์นั้น
- THEN ทั้งสองไฟล์หายไป · stdout มีบรรทัดขึ้นต้นด้วย `−` ระบุทั้งสอง path · และบรรทัดสรุปมีช่อง `ลบ 2`

##### Scenario: ไฟล์ของผู้ใช้ในไดเรกทอรีเดียวกันไม่ถูกแตะ
- GIVEN โปรเจกต์ที่มีไฟล์ผู้ใช้เองในไดเรกทอรีของ payload ทั้งฝั่ง agent และ skill และมีงานจริงใน `docs/`
- WHEN รัน installer ด้วย `--update`
- THEN ไฟล์ของผู้ใช้และ `docs/` ยังอยู่ครบทุกไฟล์ · และไฟล์ payload ที่ตกรุ่นในรันเดียวกันถูกลบสำเร็จ

##### Scenario: ไฟล์ payload ที่ผู้ใช้แก้เองไม่ถูกลบเงียบ
- GIVEN ไฟล์ที่อยู่ใน manifest แต่เนื้อหาบนดิสก์ถูกแก้จนไม่ตรง hash และไม่มีใน payload รุ่นใหม่
- WHEN รัน installer ด้วย `--update`
- THEN ไฟล์นั้นยังอยู่ และมีคำเตือนระบุเหตุผลว่า hash ไม่ตรง

##### Scenario: manifest ที่ถูกดัดแปลงลบไฟล์นอกขอบเขตไม่ได้
- GIVEN manifest ที่มี entry ชี้ออกนอกขอบเขต — path ที่มี `..`, path แบบ absolute, path ที่มี backslash, path ที่มี control character, หรือ path ใต้ไดเรกทอรีที่ชื่อขึ้นต้นคล้ายกันแต่คนละตัว
- WHEN รัน installer ด้วย `--update`
- THEN ไม่มีไฟล์นอกขอบเขตถูกลบ · installer จบด้วย exit code 0 · และทุก entry ที่ถูกปฏิเสธถูกรายงานพร้อมเหตุผลจากชุดเหตุผลที่กำหนดไว้

##### Scenario: symlink ไม่ถูกใช้เป็นทางออกนอกขอบเขต
- GIVEN ไดเรกทอรีใต้ขอบเขตเป็น symlink ที่ชี้ออกนอกโปรเจกต์ และ manifest มี entry ที่ชี้ผ่าน symlink นั้น
- WHEN รัน installer ด้วย `--update`
- THEN ไฟล์ปลายทางนอกโปรเจกต์ยังอยู่ · entry นั้นถูกข้ามพร้อมเหตุผล · และไฟล์ตกรุ่นปกติในรันเดียวกันยังถูกลบสำเร็จ

##### Scenario: --global ไม่แตะไดเรกทอรีที่แชร์กับผู้ใช้
- GIVEN การติดตั้งแบบ global ที่มีทั้งไฟล์ agent ส่วนตัวของผู้ใช้และไฟล์ payload ตกรุ่นใต้ `.warnyin/template`
- WHEN รัน installer ด้วย `--global --update`
- THEN ไฟล์ใต้ `.claude/agents/` และ `.claude/skills/` ไม่ถูกลบ · แต่ไฟล์ตกรุ่นใต้ `.warnyin/template` ถูกลบ

##### Scenario: จำนวนไฟล์ที่จะลบมากผิดปกติ → ไม่ลบเลย
- GIVEN สถานะที่มีไฟล์ตกรุ่นซึ่งผ่าน guard ทุกชั้นเกินเพดานที่กำหนด
- WHEN รัน installer ด้วย `--update`
- THEN ไม่มีไฟล์ใดถูกลบ · มีคำเตือนระบุจำนวนและวิธีตรวจ · exit code เป็น 0 · และเมื่อรันด้วย `--dry-run` ยังแสดงรายการได้ครบ

##### Scenario: ปิดการลบแล้วข้อมูลไม่สูญ
- GIVEN โปรเจกต์ที่มีไฟล์ payload ตกรุ่นค้างอยู่
- WHEN รัน installer ด้วย `--update --no-prune` แล้วรัน `--update` อีกครั้งตามปกติ
- THEN รอบแรกไม่มีไฟล์ใดถูกลบ · รอบที่สองไฟล์ตกรุ่นยังถูกตรวจพบและถูกลบได้ตามปกติ

##### Scenario: manifest เสียหายต้องไม่ทำให้ installer ล้ม
- GIVEN manifest ที่อ่านเป็นรายการไม่ได้ หรือมีขนาด/จำนวนบรรทัดเกินเพดาน
- WHEN รัน installer ด้วย `--update`
- THEN installer ทำงานจนจบด้วย exit code 0 · ไฟล์ payload ที่ยังใช้อยู่ครบ · มีคำเตือนระบุเหตุ · และ manifest ที่ถูกต้องถูกเขียนทับ

##### Scenario: install สดไม่ลบอะไรเลย
- GIVEN ไดเรกทอรีเปล่าที่ยังไม่เคยติดตั้ง
- WHEN รัน installer แบบติดตั้งใหม่
- THEN ไม่มีบรรทัด `−` · บรรทัดสรุปมีช่อง `ลบ 0` · และมี manifest ถูกสร้างพร้อมรายการไฟล์และ hash

## 10. Design review (panel 5 role — 40 blocker)

| role | blocker | การแก้ในฉบับนี้ |
|---|---|---|
| Security | symlink ancestor · manifest = untrusted/supply-chain · path guard มีรู · empty-dir ไต่ ancestor · contract ขัดกันเอง | C8 realpath containment · C7 hash + C5 allowlist + C11 global-scope + C9 cap (4 ชั้นตามที่ขอ ≥2) · C4 guard 5 ข้อ · C10 จำกัด candidate · C2 คืน `rejected` |
| Infra | POSIX/native แตก · hash pre-normalize · manifest เคลมไฟล์ที่ไม่ได้เขียน · verify-pack อ้างผิด · MIN_PASS · global env · size cap · runbook | C6 · §3 hash post-normalize · §3 เงื่อนไข entry · §6 (unit เคสคู่ขนาน) · slice 3 · §8 · C7 5 MB · slice 3 runbook |
| QA | C2↔C4 · ไม่มี `source` · cap กำกวม · reason ไม่มีเซตปิด · RED proof ทำไม่ได้ · empty-dir · payloadNew · fixture · pass-count gate | C2 เงื่อนไข · C2 `source` + C3 · C9 2 ชั้น + dry-run ยกเว้น · C15 เซตปิด · §8 mutant harness · C10 · §8 T1 · §8 fixture จาก `src/` · §7 เจ้าของ = full-gate |
| SA | manifest lifecycle กินตัวเอง · payloadNew/hash · cap ขัดกัน · ขอบเขต 2 เจ้าของ · C2↔C4 · contract ไม่ครบ · slice ไม่ vertical · `.codebuddy/` | **C13 union** · §5 flow + `onFile` · C9 · C11 `prunableRoots` เป็น input · C2 · C1/C13 · ยุบ slice · §6 out-of-scope + backlog |
| Tech Lead | tier · ยุบ slice · ownership เทส · file matrix · contract canonical · `--no-prune` 6 surface · KNOWN_STALE ปลดระวาง · MIN_PASS · docs/techstack ชน gate | คง `standard` · §2 · §7 · §2 ตาราง exclusive · C15/§6 wording · §6 4 จุด + เทส · C14 stamp-gated · slice 3 · §2 note รอ SHIP |

**ที่ไม่รับ:** แตกเป็น 2 release (S7) — user เลือกทำรอบเดียว · escalate เป็น `large` — Tech Lead ยืนยันว่าไม่คุ้ม (component เดียว, cap ยังไม่ชน, จะเสีย cap discipline)
