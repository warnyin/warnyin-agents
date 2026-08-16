# Spec — mutant-harness

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> slice **2b** ของ `design.md §2` — **falsifiability ถูกพิสูจน์** · ไฟล์เดียว: `src/tests/installer-mutant.test.mjs`
> **wave 2** — ต้องทำ **หลัง** `tasks/prune/` integrate เข้า `src/bin/cli.mjs` แล้วเท่านั้น (เหตุผล §2)

## 1. ชนิดของ task
`test` (mutation testing / falsifiability harness) — **ไม่มี production code ในขอบเขต** · ไม่แก้ `cli.mjs` ไม่ว่ากรณีใด

---

## 2. ทำไม task นี้อยู่ wave 2 และ mutate ได้ไม่ทุก guard

**(ก) anchor ต้องเป็นสตริงจริงในโค้ด prune** — mutation คือ `String.replace(find, replace)` บนเนื้อ `cli.mjs` จริง ⇒ ถ้าเขียนพร้อม wave 1 `find` จะกลายเป็น **คำบรรยายที่ replace ไม่ติด** และเคสจะแดงด้วย `assert.notEqual` ตลอด wave (KB #33)

**(ข) guard 6 ชั้นเป็นอิสระต่อกัน** (`design.md §1`) — ปิดชั้นเดียวแล้วชั้นอื่นยังบล็อก ⇒ เหยื่อไม่หาย ⇒ **แถวนั้นแดงถาวรแม้ implement ถูก 100%** · dry-run ของ DESIGN พบว่า **6/12 แถวของ matrix เดิมเป็นแบบนี้** (ตัวอย่าง: เหยื่อ `.warnyin\workflow\bs.md` เป็น path **1 segment** ⇒ โดน `scope:outside-root` reject ก่อนถึง guard backslash)

**⇒ หลักการบังคับของ task นี้ (ละเมิดไม่ได้):**

> **แถวใน matrix ทำได้เฉพาะ guard ที่เป็น "ชั้นเดียวที่บล็อกเหยื่อนั้นจริง"** — เหยื่อต้องถูก **ออกแบบให้ผ่านทุกชั้นอื่น** (อยู่ใต้ `prunableRoots` ถูกต้อง · ไม่มีใน `payloadNew` · มี entry ใน manifest ที่ hash **ตรง** · `realpath` ของ parent อยู่ใน root · เป็น regular file · ไม่ชน cap)
> **single-guard falsification ที่ออกแบบเหยื่อแบบนั้นไม่ได้ → ไม่ใช่งานของ task นี้** แต่เป็น **unit test ของ `tasks/prune/`** (เรียก `computeStale` ตรง ไม่ผ่าน fs guard) — ดู §8

---

## 3. Contract ที่ต้อง copy คำต่อคำ (canonical = `design.md §4`)

> ยกมาเฉพาะข้อที่ matrix อ้าง — **ห้ามแต่งใหม่/ย่อ** (`docs/rule.md §2 contract-as-copy-source`) · contract เต็มชุด C1–C16 อยู่ที่ `design.md §4`

| # | contract |
|---|---|
| **C4** | **path guard (pure, รันก่อน `statOnDisk`) — reject ถ้า:** (1) มี `\` (2) มี segment `..` หรือ `.` (3) ขึ้นต้น `/` หรือมี `:` ใน segment แรก (4) มี control char `\x00–\x1f\x7f` (5) **ไม่ขึ้นต้นด้วย entry ใน `prunableRoots` แบบ segment-wise** (`rel === root \|\| rel.startsWith(root + '/')`) · **rationale ห้ามยุบ:** (2) load-bearing เพราะ `.warnyin/workflow/../../x` ผ่าน (5) ได้ · เทียบเป็น POSIX เสมอ แปลง native ที่จุดลบเท่านั้น |
| **C5** | **scope allowlist ใน dir ที่แชร์:** ใต้ `.claude/agents/` เฉพาะ `warnyin-*.md` · ใต้ `.claude/skills/` เฉพาะ `explore/`, `next/`, `update-codemaps/` — **append-only** (ห้ามลบชื่อออกเมื่อเลิก ship skill นั้น ไม่งั้นลบของตกรุ่นไม่ได้) + มีเทส structural ว่า allowlist ⊇ skill dir ใน payload จริง |
| **C7** | **hash gate:** `source==='manifest'` ลบได้เมื่อ sha256 ของไฟล์บนดิสก์ (อ่านแล้ว `normalizeEol` ก่อน hash) **ตรง** — ไม่ตรง → ข้าม + `⚠ <path> [hash:mismatch]` (ใช้ตามเซตปิด C15 เสมอ) · `lstat().size > 5 MB` → ข้าม + `[prune:too-large]` (ใช้ `lstat` ตัวเดียวกับ C8) |
| **C8** | **fs containment:** `root = realpathSync(target/<prunableRoot>)` · `parent = realpathSync(dirname(abs))` → ต้อง `path.relative(root, parent)` ไม่ขึ้นต้น `..` และไม่ absolute · `realpath` throw → ข้าม · แล้ว `lstat(abs)` ต้องเป็น regular file · **ใช้ `fs.realpathSync` ตัวเดียวกันทั้งสองฝั่ง** (ห้ามผสม `.native`) · วาง `lstat` ติด `unlink` ไม่แทรก I/O |
| **C9** | **blast cap:** นับ **2 ชั้น** — ชั้นแรกบน `stale` ก่อนอ่านไฟล์ (กัน I/O จาก manifest ปลอม) ชั้นตัดสินบนรายการที่ผ่าน C7/C8 แล้ว · เกิน **`PRUNE_BLAST_CAP = 50`** (ตั้งเป็น const ที่มีชื่อ เพื่อให้เทส/mutation อ้าง anchor ได้ · ≈ ครึ่งของ payload 91 ไฟล์) → **ไม่ลบเลย** + `⚠ [prune:blast-cap] N ไฟล์ …` + exit 0 · **`--dry-run` ยกเว้น cap เสมอ** (ต้อง list ได้ ไม่งั้นคำแนะนำพาไปตัน) · escape = `--prune-force` (บันทึกใน runbook) |
| **C10** | **empty-dir:** candidate = **`dirname` ของไฟล์ที่ถูกลบใน run นี้เท่านั้น** ไต่ขึ้นได้จนถึงแต่ **ไม่รวม** `prunableRoot` · ต้องผ่าน C8 · เป็น dir จริงไม่ใช่ symlink · `readdir` ว่าง — **dir ว่างของผู้ใช้รอดโดยอัตโนมัติ** เพราะไม่เคยเป็น candidate (ไม่ใช่ dirname ของไฟล์ที่ถูกลบ) · **ไม่ต้องมี snapshot check** (dry-run พบว่าเป็นเงื่อนไข unreachable) · เทียบขอบบนด้วย **realpath ชุดเดียวกับ C8** |
| **C11** | **mode:** prune เฉพาะ `--update` และไม่มี `--no-prune`/`WARNYIN_NO_PRUNE=1` · `--global` → `prunableRoots` = 3 dir (`.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`) · project → 5 dir · **`prunableRoots` เป็น input ของ `computeStale`** (C11 จึง pure และเทสได้ที่ slice เดียว) |
| **C13** | **`writeManifest`:** `manifestNew = payloadNew ∪ (manifestOld ∩ statOnDisk)` — **★ `manifestOld` ที่นำมา merge ต้องผ่าน C4 path guard ชุดเดียวกันก่อนเรียก `statOnDisk`** (entry ที่ไม่ผ่าน = ทิ้งจาก manifest ใหม่) ไม่งั้น entry ปลอมอย่าง `.warnyin/workflow/../../../etc/passwd` จะถูก `statOnDisk` probe นอก target และถูก re-persist ทุกรอบ — **คง hash เดิมของ entry เก่าที่ยังอยู่** ⇒ `--no-prune` / ติดตั้งซ้ำแบบไม่มี `--update` / cap trip **ไม่ทำให้ข้อมูลหาย** (ปิดถาวรไม่ได้โดยอุบัติเหตุ) · เขียนหลัง copy ก่อน prune · `--dry-run` ไม่เขียน · นับ `stats` + พิมพ์ `+`/`↻` แบบ `writeVersionStamp` · header ใช้ `readPkgVersion()` |
| **C15** | **รายงาน:** ลบสำเร็จ `  − <path>` (U+2212) · ข้าม (per-path) `  ⚠ <path> [<reason>]` · **ระดับ run (ไม่มี path) `⚠ [<reason>] <ข้อความ>`** เช่น blast-cap ของ C9 — สองรูปนี้ต่างกันโดยเจตนา · reason เป็น **เซตปิด**: `path:backslash` · `path:dot-segment` · `path:absolute` · `path:control-char` · `scope:outside-root` · `scope:not-allowlisted` · `hash:missing` · `hash:mismatch` · `prune:too-large` · `prune:symlink` · `prune:not-contained` · `prune:io` · `prune:blast-cap` · **path ต้อง sanitize ก่อนพิมพ์** (strip control/ANSI, ตัดยาว) · พิมพ์ POSIX form · **ทุกบรรทัดรายงานของ prune (`−` และ `⚠`) พิมพ์ที่ `stdout` ด้วย `console.log`** (อยู่ stream เดียวกับ `+`/`↻` เดิม — `console.warn` สงวนไว้สำหรับ warning ระดับ run) · `--dry-run` ใช้หัวข้อ `จะลบ:` แล้วตามด้วยบรรทัด `  − <path>` รูปแบบเดียวกัน · **★ `--dry-run` ห้ามเรียก `unlink`/`rmdir` ทุกกรณี** — พิมพ์อย่างเดียว แล้วนับ `stats` จากรายการที่ *จะ* ลบ · **สรุปพิมพ์เสมอแม้ 0 ไฟล์:** `สรุป: สร้างใหม่ N · อัปเดต N · ข้าม (มีอยู่แล้ว) N · ลบ N` |

---

## 4. Data-flow (fixture pipeline ต่อ 1 แถว)

```
repo/src/ ──copyDir──▶ <pkg>/src            + <pkg>/package.json {version: <ของ repo>}
                                            (payload = ของจริง 100% — KB #32)
original = readFileSync(cliPath,'utf8')
mutated  = original.replace(find, replace)
assert.notEqual(mutated, original)          ★ fail-loud ก่อนเสมอ (KB #33)
writeFileSync(<pkg>/src/bin/cli.mjs, mutated)

<target> ──install baseline ด้วย <pkg>/src/bin/cli.mjs ที่ยัง "ไม่ mutate"──▶ payload + manifest ของจริง
        ──prepare(): วางเหยื่อ + canary + เขียน entry ลง manifest (hash คำนวณจริง)──▶
        ──spawn <pkg>/src/bin/cli.mjs (mutant) ['--update']──▶
        ──assert: เหยื่อหาย + canary หาย + exit 0 + stdout──▶  t.after(rm)
```

- **baseline install ต้องใช้ cli ที่ยังไม่ mutate** (เขียน mutated ทับ *หลัง* install หรือใช้สำเนาที่ 2) — ไม่งั้น mutation ไปเพี้ยนตอนวาง payload แทนที่จะทดสอบ prune
- **hash ของเหยื่อ:** เขียนไฟล์ด้วย **LF ล้วน** แล้ว `createHash('sha256')` บน buffer นั้น ⇒ เท่ากับ hash หลัง `normalizeEol` ที่ C7 คำนวณ (ถ้าเขียน CRLF จะไม่ตรง = แถวแดงด้วยเหตุผลผิด)
- **manifest:** อ่านของจริงที่ installer เขียนไว้ แล้ว **append บรรทัด entry ของเหยื่อ/canary** (header เดิม, LF, ห้าม duplicate path — C1 ทิ้งทั้งคู่)
- **★ fail-loud ก่อนวางเหยื่อ:** หลัง baseline install ต้อง assert ว่า `.warnyin/.warnyin-manifest` **มีจริงและมี entry > 0** — ถ้าไม่มี ให้แดงพร้อมข้อความ `baseline install ไม่ได้เขียน manifest — prune ยัง integrate ไม่ครบ` ไม่ใช่เดินต่อแล้วแดงที่ primary assertion (แดงด้วยเหตุผลผิด)

---

## 5. Mutation matrix

**เหยื่อทุกตัวถูกออกแบบให้ guard แถวนั้นเป็น "ชั้นเดียวที่บล็อก"** (คอลัมน์ *ทำไมชั้นเดียว*)
`find` ในตารางคือ **นิพจน์ที่คาดว่าอยู่ในโค้ดจริง** — ผู้ทำต้อง **อ่าน `cli.mjs` ที่ integrate แล้ว** และใช้สตริงจริง; ถ้าไม่พบตามคาด → **รายงาน ห้ามประดิษฐ์ anchor ใหม่เอง** (`task.md §7`)
คอลัมน์ *locator* = สตริงคงที่ที่ใช้ **หาจุด** (reason ของเซตปิด C15 / ชื่อ const / ชื่อ helper) — **ห้ามใช้คำบรรยายภาษาไทยเป็น anchor**

### 5.0 ★ M0 — structural self-check (บังคับ · เคสแรกของไฟล์)

```js
assert.equal(MUTATIONS.length, 12, 'matrix ถูกถอดแถวออกเพื่อให้เขียว?')
for (const m of MUTATIONS) {
  assert.equal(original.split(m.find).length - 1, 1,
    `${m.id}: anchor ต้องพบ "พอดี 1 ครั้ง" ใน cli.mjs — 0 = anchor หาย (sync กับโค้ดจริง), >1 = anchor กำกวม (mutate ผิดจุด)`)
}
```

- จับ **3 อาการพร้อมกัน:** anchor หาย · anchor กำกวม · **การถอดแถวออกเพื่อให้ suite เขียว** (นับจำนวนแถว)
- **กับดักที่พบบ่อย:** `find` ที่เป็นชื่อฟังก์ชันพร้อมอาร์กิวเมนต์ (เช่น `mergeManifest(payloadNew, manifestOld, statOnDisk)`) จะ **พบ 2 ครั้ง** (บรรทัดนิยาม + จุดเรียก) ⇒ ต้องขยาย `find` ให้ unique (เช่นใส่ `= ` นำหน้า)

### 5.1 แถว M1–M12

| # | guard | เหยื่อ (ออกแบบให้ guard นี้เป็นชั้นเดียว) | ทำไมชั้นเดียว | locator (สตริงจริง) | `find` → `replace` (คาดหมาย) | เคสที่ต้องพลิกเป็นแดง |
|---|---|---|---|---|---|---|
| **M1** | C4 (1) backslash | ไฟล์จริง `.warnyin/workflow/a\b.md` (ชื่อไฟล์มี `\` 1 ตัว — POSIX สร้างได้) · entry hash ตรง | rel ขึ้นต้น `.warnyin/workflow/` ⇒ ผ่าน (5) · ไม่มี `..`/`.`/absolute/control char · parent = root ⇒ C8 ผ่าน · regular file | `'path:backslash'` | เงื่อนไขที่ตรวจ `\` ในบรรทัดเดียวกับ locator (คาด `rel.includes('\\')`) → `false` | assertion ของ upgrade `U5` ที่ว่า "เหยื่อ backslash ยังอยู่" |
| **M2** | C4 (2) dot-segment | entry `.warnyin/workflow/../workflow/inner.md` ชี้ไฟล์จริง `.warnyin/workflow/inner.md` · entry hash ตรง | resolve แล้ว **ยังอยู่ใน root** ⇒ C8 ผ่าน (ต่างจากเหยื่อ `../../outside` เดิมที่ C8 ก็บล็อก) · ผ่าน (5) เพราะขึ้นต้น `.warnyin/workflow/` | `'path:dot-segment'` | เงื่อนไขที่ตรวจ segment `..`/`.` (คาด `segs.some(...)`) → `false` | "ไฟล์ที่ถูกอ้างด้วย dot-segment ยังอยู่" |
| **M3** | C4 (4) control-char | ไฟล์จริง `.warnyin/workflow/vic\u0007tim.md` · entry hash ตรง | อยู่ใต้ root ถูกต้อง · hash ตรง · C8 ผ่าน ⇒ control char เป็นชั้นเดียวที่ reject | `'path:control-char'` | **regex literal** ของ control char (คาด `/[\x00-\x1f\x7f]/`) → `/(?!)/` (ไม่ match อะไรเลย, syntax ปลอดภัยทั้ง `.test()`/`.match()`) | `U5` ครึ่ง control-char + `U15` (stdout ไม่มี ANSI) |
| **M4** | C5 allowlist — agents | ไฟล์ผู้ใช้ `.claude/agents/my-agent.md` · entry hash ตรง | project mode มี `.claude/agents` ใน `prunableRoots` ⇒ (5) ผ่าน · parent = root ⇒ C8 ผ่าน · ไม่มีใน `payloadNew` | `AGENT_ALLOW_RE` | **statement นิยาม** `const AGENT_ALLOW_RE = <regex>` → `const AGENT_ALLOW_RE = /(?:)/` (match ทุกสตริง) | "agent ส่วนตัวของผู้ใช้ยังอยู่" (`U3`) |
| **M5** | C5 allowlist — skills | ไฟล์ผู้ใช้ `.claude/skills/playwright-cli/SKILL.md` · entry hash ตรง | parent `.claude/skills/playwright-cli` อยู่ใน root `.claude/skills` ⇒ C8 ผ่าน · guard อื่นผ่านหมด | `SKILL_ALLOW` | **statement นิยาม** `const SKILL_ALLOW = <array\|Set>` → `const SKILL_ALLOW = { has: () => true, includes: () => true }` | "skill ที่ผู้ใช้ติดตั้งเองยังอยู่" (`U3`) |
| **M6** | C7 hash gate | `.warnyin/template/edited-note.md` (ไฟล์จริง) + entry ที่ **สะกด hash ผิดโดยเจตนา** (hex64 ที่ไม่ตรงเนื้อ) | path/scope/C8/cap ผ่านหมด · `sha256` มีค่า (ไม่เข้า C3) ⇒ เหลือแค่การ **เทียบ** hash | `'hash:mismatch'` | นิพจน์เทียบ hash บนบรรทัดเดียวกับ locator (คาด `diskHash !== …sha256`) → `false` | "ไฟล์ที่ผู้ใช้แก้เองยังอยู่" (`U4`) |
| **M7** | C7 size cap | `.warnyin/template/big-blob.md` ขนาด **5 MB + 1 byte** · entry hash ตรง (คำนวณจาก buffer จริง) | guard อื่นผ่านหมด ⇒ `lstat().size > 5 MB` เป็นชั้นเดียว | `'prune:too-large'` | ค่าคงที่ขนาด (คาด `5 * 1024 * 1024`) → `Number.MAX_SAFE_INTEGER` | "ไฟล์ใหญ่ผิดปกติไม่ถูกแตะ" |
| **M8** | C8 ancestor containment | `<outsideDir>/victim.md` เข้าถึงผ่าน symlink dir `.warnyin/template/linked` → `<outsideDir>` · entry `.warnyin/template/linked/victim.md` hash ตรง (อ่านทะลุ symlink) | rel เป็น POSIX สะอาด อยู่ใต้ root ⇒ C4 ผ่านทุกข้อ · hash ตรง ⇒ C7 ผ่าน · **ปลายทางเป็น regular file** ⇒ leaf check ผ่าน ⇒ เหลือ realpath containment | `'prune:not-contained'` | `path.relative(root, parent)` → `''` (สตริงว่างไม่ขึ้นต้น `..` และไม่ absolute ⇒ ผ่านเสมอ) | "ไฟล์นอกโปรเจกต์ยังอยู่" (`U6`) |
| **M9** | C8 leaf (regular file) | symlink ไฟล์ `.warnyin/template/leaf-link.md` → `<outsideDir>/leaf-victim.md` · entry hash = hash ของ **เนื้อปลายทาง** (readFileSync ทะลุ symlink) | parent = root ⇒ ancestor ผ่าน · hash ตรง · `lstat().size` ของ symlink เล็ก ⇒ ไม่ชน C7 size ⇒ เหลือ `isFile()` | `'prune:symlink'` | นิพจน์เช็คชนิดไฟล์ก่อน `unlink` (คาด `st.isFile()`) → `true` | "symlink และปลายทางยังอยู่" (`U7`) |
| **M10** | C9 blast cap | ไฟล์ตกรุ่นที่ผ่าน guard ครบ **51 ตัว** ใต้ `.warnyin/workflow/legacy-*/` · entry hash ตรงทุกตัว | ทุกตัวผ่าน C4/C5/C7/C8 ⇒ สิ่งเดียวที่กันคือ cap | `PRUNE_BLAST_CAP` | `const PRUNE_BLAST_CAP = 50` → `const PRUNE_BLAST_CAP = 100000` | "ไม่มีไฟล์ใดหายเลยตอนชน cap" (`U11`) |
| **M11** | C13 manifest union — **★ inverse polarity** | 2 รอบ: `--update --no-prune` → `--update` · เหยื่อ = ไฟล์ตกรุ่น `.warnyin/template/carried.md` ที่ต้องถูกลบใน **รอบ 2** | รอบ 1 ไม่มีการลบเลย ⇒ ทุก guard ไม่ทำงาน · สิ่งเดียวที่พาข้อมูลข้ามรอบคือ union ของ C13 | `mergeManifest` | `= mergeManifest(payloadNew, manifestOld, statOnDisk)` (ใส่ `= ` นำหน้าให้ unique) → `= payloadNew` | **ขั้วกลับ:** เหยื่อ **ยังอยู่** หลังรอบ 2 ⇒ พิสูจน์ว่า assertion "รอบแรกไม่มีอะไรหาย" ของ `U13` ไม่กำพร้า |
| **M12** | C15 `--dry-run` ห้ามเรียก `unlink`/`rmdir` | ไฟล์ตกรุ่นปกติ `.warnyin/template/dry-victim.md` · entry hash ตรง · รันด้วย `['--update','--dry-run']` | ไฟล์ผ่าน guard ครบทุกชั้น (ถ้าเป็น `--update` ธรรมดาจะถูกลบ) ⇒ **สิ่งเดียวที่กันคือเงื่อนไข dry** | `จะลบ:` (หัวข้อ dry-run ตาม C15) | เงื่อนไข dry ที่ครอบ `unlinkSync` ใน `prune()` (คาด `if (DRY)`) → `if (false)` · **`DRY` ปรากฏหลายครั้งในไฟล์** ⇒ ต้องขยาย `find` ให้ unique (รวมบรรทัดที่มี `unlinkSync`/`stats.pruned` เข้าไป) ไม่งั้น M0 แดงที่ "anchor กำกวม" | "`--dry-run` ไม่ลบอะไรเลย + manifest byte-equal" (`U12`/`U14`) |

### 5.2 การ reuse state จาก `upgrade-path-test` (และข้อยกเว้นที่บังคับ)

`tasks/upgrade-path-test/standard.md §2.4` กำหนดให้ mutant harness **reuse state ของเคส negative ที่คู่กัน ห้ามแต่ง state ใหม่** — ยึดตามนั้นเป็นค่าตั้งต้น:

| แถว | state ที่ reuse | หมายเหตุ |
|---|---|---|
| M4 · M5 | state ของ `U3` (ไฟล์ผู้ใช้ใน dir ที่แชร์) | เพิ่มเฉพาะ **entry ใน manifest ที่ hash ตรง** ของไฟล์ผู้ใช้ (U3 ไม่ต้องมี) |
| M6 | state ของ `U4` (ไฟล์ที่เนื้อถูกแก้จน hash ไม่ตรง) | — |
| M8 | state ของ `U6` (symlink ancestor) | — |
| M9 | state ของ `U7` (symlink leaf) | — |
| M10 | state ของ `U11` (51 ไฟล์) | — |
| M11 | state ของ `U13` (`--no-prune` → `--update`) | — |
| M12 | state ของ `U12`/`U14` (`--update --dry-run`) | ใช้ stale ธรรมดา 1 ตัว ไม่ต้องมี 51 ตัวแบบ `U12` |
| **M1 · M2 · M3 · M7** | **สร้างเหยื่อเฉพาะกิจ** | **ข้อยกเว้นที่บังคับ:** เหยื่อของ `U5` ถูก guard **หลายชั้นพร้อมกัน** (เช่น `.warnyin\workflow\bs.md` เป็น path 1 segment ⇒ `scope:outside-root` reject ก่อน) ⇒ reuse ตรง ๆ แล้วแถวจะแดงถาวรแม้ implement ถูก · เหยื่อใหม่ต้องประกอบด้วย **helper ตัวเดิม** (`addStaleEntry` / `sha256OfFile` / `manifestPath`) และคอมเมนต์กำกับว่าทำไมของ `U5` ใช้ไม่ได้ |

> **guard ที่ไม่มีแถว — โดยเจตนา:** C4 (3) absolute/drive · C4 (5) segment-wise root · C3 `hash:missing` · C10 empty-dir · C12 `prune:io` — เหตุผลรายข้อที่ §8

---

## 6. Test-flow

ไฟล์เดียว: **`src/tests/installer-mutant.test.mjs`** (ไฟล์ใหม่ — task นี้เป็นเจ้าของแต่ผู้เดียว)
**1 แถว = 1 `test()`** ⇒ M0 + M1–M12 = **13 เคส**

### 6.1 ลำดับบังคับต่อแถว (ห้ามสลับ)

1. `pkg = makeTempProject(t)` · `copyDir(repoSrc, <pkg>/src)` · เขียน `<pkg>/package.json` version = version ของ repo
2. `target = makeTempProject(t)` · install baseline ด้วย `<pkg>/src/bin/cli.mjs` (**ยังไม่ mutate**) → payload + manifest ของจริง
3. `const original = readFileSync(cliPath, 'utf8')` · `const mutated = original.replace(find, replace)`
4. **`assert.notEqual(mutated, original, '<id>: mutation ไม่ติด — anchor เปลี่ยนไปแล้ว ให้ sync find/replace กับ cli.mjs ปัจจุบัน (KB #33)')` — บรรทัดแรกหลัง replace เสมอ · ห้าม `if (…) return` ห้ามเงียบ**
5. เขียน `mutated` ทับ `<pkg>/src/bin/cli.mjs`
6. `prepare(target)` — วาง **เหยื่อ** + **canary** + append entry ลง manifest (hash คำนวณจริง)
7. spawn `<pkg>/src/bin/cli.mjs` ด้วย `['--update']` (M11 = 2 รอบ)
8. assert ตาม §6.2 → `t.after` ลบ temp (ลงทะเบียนไว้แล้วตั้งแต่ 1–2)

### 6.2 Assertion ขั้นต่ำต่อแถว — **ห้ามอ่อน**

> เคสที่ assert แค่ `existsSync === true` **เป็นจริงทุกครั้งที่อะไรก็ตามพัง** (spawn ล้ม / args ผิด / fixture เพี้ยน) ⇒ ทุกแถวต้องมี co-assertion

| ชั้น | assertion |
|---|---|
| primary | **เหยื่อหายไปจริง** — `existsSync(victim) === false` พร้อมข้อความบอกว่า "assertion ของเคส `<U…>` กำพร้าถ้ายังอยู่" (M11 = ขั้วกลับ: ยังอยู่) |
| co-1 | `exit code === 0` (`ok(r, …)` surface stderr/stdout) |
| co-2 | **canary stale ในรันเดียวกันถูกลบสำเร็จ** — `.warnyin/template/canary-stale.md` (entry hash ตรง, ไม่มีใน payload) ต้อง `existsSync === false` **และ** stdout มีบรรทัด `  − .warnyin/template/canary-stale.md` ⇒ พิสูจน์ว่า prune **รันจริง** ไม่ใช่ไม่รันเลย |
| co-3 | บรรทัดสรุปมีช่อง `ลบ N` โดย `N ≥ 2` (เหยื่อ + canary) |
| co-4 | `.warnyin/workflow/README.md` (payload ที่ยังใช้อยู่) **ยังอยู่** — mutation ต้องไม่พาลลบทั้ง tree |

**ข้อยกเว้นที่ประกาศไว้ 3 แถว:**
- **M10** — canary ทำหน้าที่ไม่ได้ (52 > cap ⇒ ก่อน mutate ไม่มีอะไรถูกลบเลย) ⇒ co-assertion = **ไฟล์ทั้ง 51 หายครบ** (นับจริง) + stdout **ไม่มี** `[prune:blast-cap]` + สรุป `ลบ 52`
- **M12** — canary "ถูกลบสำเร็จ" เป็นไปไม่ได้ (รันเป็น `--dry-run` ⇒ ก่อน mutate ไม่มีอะไรถูกลบเลย) ⇒ co-assertion = exit 0 + stdout มีหัวข้อ `จะลบ:` และบรรทัด `  − ` ของเหยื่อ (พิสูจน์ว่าเส้น dry ทำงาน) + **`.warnyin/.warnyin-manifest` byte-equal ก่อน/หลัง** (C13 `--dry-run` ไม่เขียน) + `.warnyin/workflow/README.md` ยังอยู่
- **M11** — canary คือ **ไฟล์ตกรุ่นตัวที่ 2 ที่เทส append entry ลง manifest เองหลังรอบ 1** ⇒ รอบ 2 canary **ถูกลบ** (prune ทำงาน) แต่เหยื่อ `carried.md` **ยังอยู่** (union ตายแล้ว) · เสริม: manifest หลังรอบ 1 **ไม่มีบรรทัดของ `carried.md`** (หลักฐานตรงว่า mutation มีผลจริง) และยังมี entry ของ payload > 50 บรรทัด (writeManifest ยังทำงาน)

### 6.3 กติกา platform / gate

- **ห้าม `t.skip` ทุกกรณี** — `check-test-count.mjs` fail เมื่อ `pass !== tests` ⇒ ใช้ pattern เดิมของ repo (`installer.test.mjs:596-607`):
  ```js
  try { symlinkSync(outsideDir, link, 'dir') } catch (e) {
    console.error(`  ⚠ ข้ามสร้าง symlink (${e.code || e.message}) — platform ไม่รองรับ; CI ubuntu ครอบ`)
    return
  }
  ```
- ใช้ pattern เดียวกันกับ **M1** (ชื่อไฟล์มี `\`) และ **M3** (ชื่อไฟล์มี control char) — Windows สร้างไม่ได้ → `console.error(...) + return`
- **mutation เกิดใน temp เท่านั้น** — ห้ามเขียนทับ `src/bin/cli.mjs` ของ repo แม้ชั่วคราว (`docs/rule.md §1 config-protection`); `cliPath` ใช้เป็น **source อ่านอย่างเดียว**
- `cliPath = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))` — **ห้าม `.pathname`**
- spawn ด้วย array args **ห้าม `shell:true`** · path ประกอบด้วย `path.join` · assert stdout เป็น **POSIX form** ตาม C15

---

## 7. Acceptance (falsifiable)

- [ ] **A1** ไฟล์ `src/tests/installer-mutant.test.mjs` ถูก bare-discover โดย `node --test` และรันจบ **13 เคส** (M0 + M1–M12) — ไม่มี `t.skip` แม้แต่ตัวเดียว
- [ ] **A2** ทุกแถวเขียว **หลัง** `prune` integrate — แถวที่แดงต้องแดงด้วยข้อความ `assert.notEqual` (anchor drift) หรือ primary assertion เท่านั้น ไม่ใช่ `TypeError`/`ENOENT`/spawn ล้ม
- [ ] **A3** ถอด 1 แถวออกจาก `MUTATIONS` แล้วรัน → **M0 แดง** (`MUTATIONS.length`)
- [ ] **A4** เปลี่ยน `find` ของแถวใดแถวหนึ่งเป็นสตริงที่ไม่มีในโค้ด → **M0 แดง** ที่ข้อความ "anchor ต้องพบพอดี 1 ครั้ง" (ไม่ใช่แดงตอน spawn)
- [ ] **A5** เปลี่ยน `find` ของแถวใดแถวหนึ่งเป็นสตริงที่พบ **2 ครั้ง** (เช่นชื่อฟังก์ชันเปล่า) → **M0 แดง** ด้วยเหตุผล "anchor กำกวม"
- [ ] **A6** ลบ `replace` ให้เท่ากับ `find` (mutation ไม่เปลี่ยนอะไร) → แถวนั้นแดงที่ `assert.notEqual` **ก่อน** spawn
- [ ] **A7** ตัด co-assertion canary ออกจากแถวใดแถวหนึ่งแล้วทำให้ `args` ผิด (เช่น `['--updatex']`) → แถวนั้น **ยังเขียว** ⇒ พิสูจน์ว่า co-assertion จำเป็น (ทดลองแล้ว **คืนค่าเดิม** ห้าม commit สภาพนี้)
- [ ] **A8** `grep -c "t.skip" src/tests/installer-mutant.test.mjs` = 0 · `npm test 2>&1 | node src/scripts/check-test-count.mjs` เขียว (`pass === tests`)
- [ ] **A9** หลังรัน suite: `git status --porcelain src/bin/cli.mjs` **ว่าง** (mutation ไม่รั่วออกจาก temp)
- [ ] **A10** ทุกแถวมีคอมเมนต์ระบุ **หมายเลข contract (C…)** ที่บังคับ + **ชื่อเคสของ `upgrade-path-test` ที่แถวนั้นคุ้ม** (assertion กำพร้าตัวไหน)

---

## 8. สิ่งที่ **ไม่ใช่** งานของ task นี้ (ยกให้ unit ของ `prune`)

> เหตุผลร่วม: หา **เหยื่อที่ guard นั้นเป็นชั้นเดียว** ไม่ได้ ⇒ mutation แถวนั้นจะแดงถาวรแม้ implement ถูก 100%

| guard | ทำไม mutate ไม่ได้ที่ระดับ fs | ไปอยู่ที่ไหน |
|---|---|---|
| C4 (3) absolute / drive-letter | เหยื่อ `/etc/passwd` · `C:/Windows/x.md` **ไม่ขึ้นต้นด้วย `prunableRoots` ใด ๆ** ⇒ guard (5) reject ก่อนเสมอ | `tasks/prune/spec.md` **U12** (`computeStale` ตรง) |
| C4 (5) segment-wise root | เหยื่อ `.warnyin/workflow-evil/x.md` — ถ้าปิด (5) แล้ว C8 ยังบล็อก (`path.relative(.warnyin/workflow, .warnyin/workflow-evil)` = `../workflow-evil`) | `tasks/prune/spec.md` **U15** |
| C3 `hash:missing` | entry ที่ `sha256` ว่าง **ผ่าน `parseManifest` ไม่ได้เลย** (C1 reject ก่อน) ⇒ ประกอบ state ผ่าน manifest จริงไม่ได้ | `tasks/prune/spec.md` **U27** |
| C10 empty-dir | design ฉบับล่าสุด **ตัด snapshot check ออก** (unreachable) ⇒ การป้องกันเป็น **โครงสร้าง** (candidate = `dirname` ของไฟล์ที่ลบใน run นี้) ไม่ใช่ guard ที่ปิดได้ด้วยการ replace จุดเดียว | `tasks/prune/spec.md` **F4/F5** (fs) |
| C12 `prune:io` | ต้องทำให้ `unlink` ล้มจริง (chmod) — เป็นเคส fs ปกติ ไม่ใช่ mutation | `tasks/upgrade-path-test/spec.md` **U19** |
| C6 `sep` / C11 `prunableRoots` / C1 parse | pure ทั้งหมด — พิสูจน์ด้วย unit ตรงกว่าและถูกกว่า | `tasks/prune/spec.md` **U8/U28 · U14–U20 · U1–U7** |
