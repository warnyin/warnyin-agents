# Spec — prune

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> slice 1 ของ `design.md §2` — **prune ทำงานจริงและปลอดภัย** (manifest I/O + pure fn + guard 6 ชั้น + flag + รายงาน + wiring)

## 1. ชนิดของ task
`logic` + `infra` — **destructive filesystem operation** บนเครื่องผู้ใช้ · input (manifest) เป็น **untrusted** · hard-floor `security-sensitive` (`docs/rule.md §1 change-sizing` + `proposal.md §5`)

---

## 2. ตารางจุดแก้ใน `src/bin/cli.mjs`

> พิกัดบรรทัดอ้างไฟล์ ณ `0.30.0` (HEAD ตอนเขียน spec) — ใช้เป็น **จุดอ้างอิงเชิงโครงสร้าง** ไม่ใช่ตัวเลขที่ต้องตรงเป๊ะหลังแก้

| # | พิกัดเดิม | สิ่งที่ต้องทำ | contract |
|---|---|---|---|
| M1 | `:13-17` import block | เพิ่ม `import { createHash } from 'node:crypto'` — **built-in ตัวที่ 4** (ดู `rule.md §2`) | §3 hash |
| M2 | `:21-23` flag parsing | `const NO_PRUNE = args.has('--no-prune') \|\| process.env.WARNYIN_NO_PRUNE === '1'` · `const PRUNE_FORCE = args.has('--prune-force')` · เพิ่ม unknown-flag warn (arg ขึ้นต้น `--` ที่ไม่รู้จัก → `⚠ ไม่รู้จัก flag …` ไป stderr, **ไม่ exit**) — **`KNOWN_FLAGS` enumerate ครบ 8 ค่าพอดี: `--update` · `--dry-run` · `--global` · `--project` · `--help` · `-h` · `--no-prune` · `--prune-force`** (ตกหล่นตัวใดตัวหนึ่ง = ผู้ใช้ที่ใช้ flag ที่รองรับจริงจะโดนเตือนว่าไม่รู้จัก) | C11 · C9 · §5 residual |
| M3 | `:41-53` `--help` | เพิ่มบรรทัด flag ปิด prune (**`--no-prune` เท่านั้น**) + แทน wording บรรทัด `:49` ด้วย **canonical §6 แบบ ★ตัด backtick ออกทุกตัว** (ดู §3 N1 + คำเตือน syntax ใต้ตาราง) · **ข้อความบรรทัด flag ใหม่ต้องไม่มีวลี `ลบไฟล์ CORE ที่ตกรุ่น`** (ไม่งั้น positive-grep ของ slice 3 จะนับเกิน) · **★ `--prune-force` ห้ามขึ้น `--help`** — เป็น escape hatch ของ C9 ที่บันทึกใน **runbook `docs/infra.md` อย่างเดียว** (เจ้าของ = `release-hygiene`) แต่ **ยังต้องอยู่ใน `KNOWN_FLAGS`** (M2) | §6 wording · C9 |
| M4 | `:87-93` `CORE` | เพิ่ม `toPosix(rel, sep = path.sep)` (helper **เดียว** ทั้งไฟล์) + `CORE_POSIX` ที่ **derive จาก `CORE`** (ห้ามพิมพ์รายการซ้ำ) + `GLOBAL_PRUNABLE_POSIX` (3 dir) + `AGENT_ALLOW_RE` / `SKILL_ALLOW` (C5) + `PRUNE_BLAST_CAP = 50` + `KNOWN_STALE` (C14) | C5 C6 C9 C11 C14 |
| M5 | `:132-161` `copyTree` | **★ ย้าย `readFileSync` + `normalizeEol` ขึ้นเหนือ branch `exists && !overwrite`** แล้วเพิ่ม param `onFile(relPosix, sha256, owned)` — ดู §7 กับดัก T1 · **★★ บรรทัด recursion `:138` (`copyTree(rel, { overwrite })`) ต้อง forward `onFile` ด้วย → `copyTree(rel, { overwrite, onFile })`** — ดู §7 กับดัก T10 | §3 entry-condition · §5 flow |
| M6 | หลัง `writeVersionStamp` (`:248`) | เพิ่ม `parseManifest` (pure, export) · `readManifest` (fs) · `computeStale` (pure, export) · `mergeManifest` (pure, export) · `overCap` (pure, export) · `sanitizePath` (pure, export) · `semverLt` (pure, export — **เขียนเอง ห้าม import**, ดู §7 T8) · `readStamp(target)` (fs — อ่าน `.warnyin/.warnyin-version`, ไม่มี/อ่านไม่ได้ → `null`, **ไม่ throw**) · `writeManifest` (fs) · `prune` (fs) | C1 C2 C3 C4 C5 C6 C7 C8 C9 C10 C12 C13 C14 C15 |
| M7 | `:398-487` `main()` | **★★ CRITICAL — ลำดับอ่าน stamp:** ในแต่ละสาขา ทันทีหลังตั้ง `target` (`:430` global / `:449` project) และ **ก่อน `for (const dir of CORE) copyTree(...)`** ต้อง `const stampBefore = readStamp(target)` เก็บลงตัวแปรที่ประกาศไว้ **เหนือ `if (mode === 'global')`** แล้วส่ง `useKnownStale = !stampBefore \|\| semverLt(stampBefore, '0.30.1')` เข้า `computeStale` (`knownStale = useKnownStale ? KNOWN_STALE : []`) · **เหตุผล:** `writeVersionStamp()` (`:435` / `:452`) เขียนทับ stamp ด้วย version ใหม่ ⇒ อ่านหลังจากนั้นจะได้ค่าใหม่เสมอ ⇒ หลัง ship `0.30.1` เงื่อนไขเป็นเท็จตลอดกาล ⇒ **known-stale ไม่ทำงานกับผู้ใช้คนใดเลย** (ดู §7 T11 · เคสที่ falsify = F18) · **wiring ที่เหลือแทรก "จุดเดียว" เป็น helper หลังปิด `if/else` ของ mode** (ก่อนบรรทัดสรุป `:469`) — `runPrunePhase({ mode, stampBefore, payloadNew })` ที่ทำ `writeManifest` → `computeStale` → `prune` · **ห้าม duplicate 2 สาขา** (สาขาซ้ำ = แก้ที่เดียวลืมอีกที่) · `payloadNew` เป็น `Map` ที่ประกาศก่อน `if/else` แล้ว `onFile` เติมจากทั้งสองสาขา · `prunableRoots` เลือกตาม `mode` ภายใน helper | C11 · C14 · §5 flow |
| M8 | `:469` บรรทัดสรุป | เปลี่ยนเป็นรูป canonical ที่มีช่อง `ลบ N` (needle N2) — **พิมพ์เสมอแม้ 0 ไฟล์** | C15 |

**ห้ามแตะบรรทัดอื่นของ `cli.mjs` ที่ไม่อยู่ในตารางนี้** โดยไม่มีเหตุผลผูกกับ contract

---

## 3. Contract ที่ต้อง copy คำต่อคำ (canonical = `design.md §4`)

> ยกมาทั้ง C1–C16 — **ทุกข้อเกี่ยวกับ task นี้** (slice 1 เป็นเจ้าของ contract ทั้งชุด)
> **ห้ามแต่งใหม่/ย่อ** — `docs/rule.md §2 contract-as-copy-source` + `canonical-copy convention`
> ลำดับแถวเรียงตาม `design.md §4` (C16 อยู่ระหว่าง C12 กับ C13) เพื่อให้ diff กับ canonical เทียบตรงบรรทัด

| # | contract |
|---|---|
| **C1** | `readManifest(target)` (fs, มี `statSync` guard `maxBytes = 1 MB` ก่อนอ่าน) → ส่งข้อความให้ `parseManifest(text, {maxEntries: 5000})` (pure) → `{ entries: {path,sha256}[], rejected: {line,reason}[], manifestUsable: boolean }` (`manifestUsable=false` เมื่อ **ไฟล์ไม่มี / อ่านไม่ได้ / เกิน cap จนทิ้งทั้งไฟล์** เท่านั้น — ดู C2) · ข้ามบรรทัดว่าง/`#` · trim `\r` · `sha256` ต้องเป็น hex 64 ไม่งั้น reject · **duplicate path → ทิ้งทั้งคู่** (fail-closed) · เกิน `maxEntries` → ถือว่าทั้งไฟล์ใช้ไม่ได้ + ⚠ · **ไม่ throw ทุกกรณี** |
| **C2** | `computeStale({manifestOld, payloadNew, knownStale, prunableRoots, statOnDisk})` → `{ stale: {path, sha256\|null, source}[], rejected: {path,reason}[] }` — pure · `source ∈ {'manifest','known-stale'}` · **`knownStale` ถูกรวมก็ต่อเมื่อ `manifestUsable === false`** — `manifestUsable` มาจาก C1: **`false` เมื่อไฟล์ไม่มี / อ่านไม่ได้ / เกิน cap จนทิ้งทั้งไฟล์** (= ยังไม่เคยมี manifest ที่ใช้ได้) · **`true` เมื่อไฟล์อ่านได้และ parse ผ่าน แม้ entry จะเหลือ 0 เพราะถูก reject รายบรรทัด** — ★ กรณีหลังคือ **สัญญาณ tamper** ⇒ ห้ามเปิด known-stale (ซึ่งยกเว้น hash gate ตาม C14) ไม่งั้นผู้โจมตีที่คุม manifest เขียนให้ทุกบรรทัดผิดรูป จะลบ 2 path ของ `KNOWN_STALE` ได้โดยข้าม hash · `stale = (ที่รวมแล้ว) − payloadNew` เฉพาะที่ `statOnDisk` = true · เรียง A→Z · unique · **คืน `rejected` เสมอ** |
| **C3** | **fail-closed:** `source==='manifest' && !sha256` → reject (`hash:missing`) ห้ามลบ · `source==='known-stale'` → `sha256 = null` โดยเจตนา (ยกเว้น C7) |
| **C4** | **path guard (pure, รันก่อน `statOnDisk`) — reject ถ้า:** (1) มี `\` (2) มี segment `..` หรือ `.` (3) ขึ้นต้น `/` หรือมี `:` ใน segment แรก (4) มี control char `\x00–\x1f\x7f` (5) **ไม่ขึ้นต้นด้วย entry ใน `prunableRoots` แบบ segment-wise** (`rel === root \|\| rel.startsWith(root + '/')`) · **rationale ห้ามยุบ:** (2) load-bearing เพราะ `.warnyin/workflow/../../x` ผ่าน (5) ได้ · เทียบเป็น POSIX เสมอ แปลง native ที่จุดลบเท่านั้น |
| **C5** | **scope allowlist ใน dir ที่แชร์:** ใต้ `.claude/agents/` เฉพาะ `warnyin-*.md` · ใต้ `.claude/skills/` เฉพาะ `explore/`, `next/`, `update-codemaps/` — **append-only** (ห้ามลบชื่อออกเมื่อเลิก ship skill นั้น ไม่งั้นลบของตกรุ่นไม่ได้) + มีเทส structural ว่า allowlist ⊇ skill dir ใน payload จริง |
| **C6** | **POSIX/native:** `toPosix(rel) = rel.split(sep).join('/')` เป็น helper เดียว · `CORE_POSIX` derive จาก `CORE` · **input ของ `computeStale` ทุกตัวเป็น POSIX** · `computeStale` รับ `sep` ได้เพื่อ unit-test รูป `\` บน Linux (CI ไม่มี Windows runner) |
| **C7** | **hash gate:** `source==='manifest'` ลบได้เมื่อ sha256 ของไฟล์บนดิสก์ (อ่านแล้ว `normalizeEol` ก่อน hash) **ตรง** — ไม่ตรง → ข้าม + `⚠ <path> [hash:mismatch]` (ใช้ตามเซตปิด C15 เสมอ) · `lstat().size > 5 MB` → ข้าม + `[prune:too-large]` (ใช้ `lstat` ตัวเดียวกับ C8) |
| **C8** | **fs containment:** `root = realpathSync(target/<prunableRoot>)` · `parent = realpathSync(dirname(abs))` → ต้อง `path.relative(root, parent)` ไม่ขึ้นต้น `..` และไม่ absolute · `realpath` throw → ข้าม · แล้ว `lstat(abs)` ต้องเป็น regular file · **ใช้ `fs.realpathSync` ตัวเดียวกันทั้งสองฝั่ง** (ห้ามผสม `.native`) · วาง `lstat` ติด `unlink` ไม่แทรก I/O |
| **C9** | **blast cap:** นับ **2 ชั้น** — ชั้นแรกบน `stale` ก่อนอ่านไฟล์ (กัน I/O จาก manifest ปลอม) ชั้นตัดสินบนรายการที่ผ่าน C7/C8 แล้ว · เกิน **`PRUNE_BLAST_CAP = 50`** (ตั้งเป็น const ที่มีชื่อ เพื่อให้เทส/mutation อ้าง anchor ได้ · ≈ ครึ่งของ payload 91 ไฟล์) → **ไม่ลบเลย** + `⚠ [prune:blast-cap] N ไฟล์ …` + exit 0 · **`--dry-run` ยกเว้น cap เสมอ** (ต้อง list ได้ ไม่งั้นคำแนะนำพาไปตัน) · escape = `--prune-force` (บันทึกใน runbook) |
| **C10** | **empty-dir:** candidate = **`dirname` ของไฟล์ที่ถูกลบใน run นี้เท่านั้น** ไต่ขึ้นได้จนถึงแต่ **ไม่รวม** `prunableRoot` · ต้องผ่าน C8 · เป็น dir จริงไม่ใช่ symlink · `readdir` ว่าง — **dir ว่างของผู้ใช้รอดโดยอัตโนมัติ** เพราะไม่เคยเป็น candidate (ไม่ใช่ dirname ของไฟล์ที่ถูกลบ) · **ไม่ต้องมี snapshot check** (dry-run พบว่าเป็นเงื่อนไข unreachable) · เทียบขอบบนด้วย **realpath ชุดเดียวกับ C8** |
| **C11** | **mode:** prune เฉพาะ `--update` และไม่มี `--no-prune`/`WARNYIN_NO_PRUNE=1` · `--global` → `prunableRoots` = 3 dir (`.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`) · project → 5 dir · **`prunableRoots` เป็น input ของ `computeStale`** (C11 จึง pure และเทสได้ที่ slice เดียว) |
| **C12** | **error ใดก็ตาม**ระหว่างลบ → `⚠ <path> [prune:io]` แล้วทำงานต่อ ไม่ล้มทั้ง run (ห้าม enumerate errno — Windows ให้ `EBUSY`/`EPERM`) |
| **C16** | **global manifest ไม่บันทึก dir ที่แชร์:** เมื่อ `--global` **ห้ามใส่ entry ใต้ `.claude/agents/` และ `.claude/skills/` ลง manifest** (สมมาตรกับ C11 ที่ไม่ prune 2 dir นั้น) — ไม่งั้นทุกรอบ `--global --update` จะพิมพ์ `⚠ scope:outside-root` ~9 บรรทัดและ entry ค้างถาวรผ่าน C13 |
| **C13** | **`writeManifest`:** `manifestNew = payloadNew ∪ (manifestOld ∩ statOnDisk)` — **★ `manifestOld` ที่นำมา merge ต้องผ่าน C4 path guard ชุดเดียวกันก่อนเรียก `statOnDisk`** (entry ที่ไม่ผ่าน = ทิ้งจาก manifest ใหม่) ไม่งั้น entry ปลอมอย่าง `.warnyin/workflow/../../../etc/passwd` จะถูก `statOnDisk` probe นอก target และถูก re-persist ทุกรอบ — **คง hash เดิมของ entry เก่าที่ยังอยู่** ⇒ `--no-prune` / ติดตั้งซ้ำแบบไม่มี `--update` / cap trip **ไม่ทำให้ข้อมูลหาย** (ปิดถาวรไม่ได้โดยอุบัติเหตุ) · เขียนหลัง copy ก่อน prune · `--dry-run` ไม่เขียน · นับ `stats` + พิมพ์ `+`/`↻` แบบ `writeVersionStamp` · header ใช้ `readPkgVersion()` |
| **C14** | **known-stale (transition):** `KNOWN_STALE = ['.warnyin/template/stages/[topic]/test.md', '.warnyin/template/stages/[topic]/verify.md']` — รายชื่อตายตัว ห้าม glob · **apply เฉพาะเมื่อ `.warnyin-version` หายหรือ `semverLt(stampBefore,'0.30.1')`** — **★★ `stampBefore` ต้องอ่าน _ก่อน_ `copyTree` loop และ _ก่อน_ `writeVersionStamp()` (ซึ่งเขียนทับ stamp ด้วย version ใหม่)**: ถ้าอ่านหลัง จะได้ version ใหม่เสมอ ⇒ หลัง ship `0.30.1` เงื่อนไขเป็นเท็จตลอดกาล ⇒ **known-stale ไม่ทำงานกับผู้ใช้คนใดเลย = เหตุผลตั้งต้นทั้งหมดของ topic ตายเงียบ** และไม่มีเคส unit/fs ไหนจับได้ (จับได้เฉพาะ black-box ที่ประกาศว่าแดงตลอด wave 1 ⇒ เสี่ยงถูกมองข้าม) · **ต้องมีเคส end-to-end ที่ตั้ง stamp เป็น `0.29.0` ด้วยมือ แล้วยืนยันว่า known-stale ยังทำงาน** · **★ implement `semverLt` ใน `cli.mjs` เอง ห้าม import จาก `src/scripts/setup-dogfood.mjs`**: path นั้นไม่อยู่ใน `package.json files` ⇒ ไม่ถูก publish (ยืนยันด้วย tarball จริง: 0 ไฟล์ใต้ `src/scripts/`) ⇒ import แล้วผู้ใช้ crash ขณะที่เทสในรีโปเขียวทั้งชุด (false-green ระดับ ship-breaking) ⇒ const ปลดระวางตัวเองด้วยเกณฑ์ที่วัดได้ · ที่มาของรายชื่อ: `git log --diff-filter=D -- src/.warnyin src/.claude` · **ยกเว้น C7 โดยเจตนา** — ประกาศเป็น known limit ใน §6 |
| **C15** | **รายงาน:** ลบสำเร็จ `  − <path>` (U+2212) · ข้าม (per-path) `  ⚠ <path> [<reason>]` · **ระดับ run (ไม่มี path) `⚠ [<reason>] <ข้อความ>`** เช่น blast-cap ของ C9 — สองรูปนี้ต่างกันโดยเจตนา · reason เป็น **เซตปิด**: `path:backslash` · `path:dot-segment` · `path:absolute` · `path:control-char` · `scope:outside-root` · `scope:not-allowlisted` · `hash:missing` · `hash:mismatch` · `prune:too-large` · `prune:symlink` · `prune:not-contained` · `prune:io` · `prune:blast-cap` · **path ต้อง sanitize ก่อนพิมพ์** (strip control/ANSI, ตัดยาว) · พิมพ์ POSIX form · **ทุกบรรทัดรายงานของ prune (`−` และ `⚠`) พิมพ์ที่ `stdout` ด้วย `console.log`** (อยู่ stream เดียวกับ `+`/`↻` เดิม — `console.warn` สงวนไว้สำหรับ warning ระดับ run) · `--dry-run` ใช้หัวข้อ `จะลบ:` แล้วตามด้วยบรรทัด `  − <path>` รูปแบบเดียวกัน · **★ `--dry-run` ห้ามเรียก `unlink`/`rmdir` ทุกกรณี** — พิมพ์อย่างเดียว แล้วนับ `stats` จากรายการที่ *จะ* ลบ · **สรุปพิมพ์เสมอแม้ 0 ไฟล์:** `สรุป: สร้างใหม่ N · อัปเดต N · ข้าม (มีอยู่แล้ว) N · ลบ N` |

### 3.1 Needle — string ที่ถูก assert คำต่อคำ (copy ตรง codepoint)

| id | string | ที่ใช้ |
|---|---|---|
| N1 | **★ ใน `--help` ให้ copy canonical โดย _ตัด backtick ออกทุกตัว_** — บล็อก `--help` คือ `console.log(\`…\`)` **template literal** ⇒ backtick ดิบทำให้ literal ปิดกลางประโยค = **SyntaxError ทั้งไฟล์ ทุกเทสแดง** · เนื้อความส่วนอื่นต้องตรงคำต่อคำกับ canonical `design.md §6` | `--help` (M3) — canonical `design.md §6` (อีก 3 ไฟล์เป็นของ `release-hygiene`) |
| N2 | `สรุป: สร้างใหม่ ${stats.created} · อัปเดต ${stats.updated} · ข้าม (มีอยู่แล้ว) ${stats.skipped} · ลบ ${stats.pruned}` | M8 |
| N3 | `# warnyin manifest v1 — เขียนโดย installer <version> · ห้ามแก้มือ` (`<version>` = `readPkgVersion()`) | header manifest (C13/§3) |
| N4 | บรรทัด manifest: `<sha256 hex64>` + **2 space** + `<path POSIX>` เรียง A→Z ปิดท้าย LF | §3 schema |
| N5 | `  − ` (2 space + **U+2212 MINUS SIGN**, ไม่ใช่ `-` U+002D / `–` U+2013) — **stdout** (`console.log`) | C15 |
| N6 | `  ⚠ <path> [<reason>]` — **stdout** (`console.log`) | C15 |
| N7 | `จะลบ:` | C15 dry-run |
| N8 | 13 reason literal ตาม C15 — **เซตปิด ห้ามเพิ่ม/สะกดต่าง** | C15 |
| N9 | `.warnyin/.warnyin-manifest` (path relative ต่อ target) | §3 |
| N10 | prefix `⚠ [prune:blast-cap] ` ตามด้วยจำนวนไฟล์ — **stdout** (`console.log`) | C9 |

### 3.2 การตีความที่ต้อง implement ให้เป็นข้อสรุปเดียว (เขียนคอมเมนต์กำกับ)

- `parseManifest().rejected[].reason` ต้อง **อยู่ในเซตปิด 13 ค่า** เช่นกัน — sha256 ไม่ใช่ hex64 / บรรทัดผิดรูป → `hash:missing`; duplicate → `hash:missing` ทั้งคู่
- **รูปแบบ output ของ per-line reject จาก `parseManifest`** — ใช้รูป N6 เดิม (`  ⚠ <path> [<reason>]` ที่ stdout) โดยช่อง `<path>` = **`.warnyin/.warnyin-manifest#L<n>`** (`n` = เลขบรรทัดจริงในไฟล์ นับจาก 1) · **ห้ามพิมพ์เนื้อบรรทัดดิบ** ไม่ว่ากรณีใด (`rule.md §1.4` ห้าม echo เนื้อไฟล์ — บรรทัดที่ผิดรูปคือจุดที่ payload ปลอมพยายามหลุดขึ้น terminal มากที่สุด) · `rejected[].line` เก็บ **เลขบรรทัด** ไม่ใช่ข้อความบรรทัด
- การปฏิเสธ **ทั้งไฟล์** (size > 1 MB, entries > 5000, อ่านไม่ได้) **ไม่ใช่ per-path reason** → เป็น **warning ระดับ run** ⇒ พิมพ์ด้วย `console.warn` (**stderr**) บรรทัดเดียวไม่มี path ไม่มี `[reason]` แล้วถือว่า `manifestOld` ว่าง (⇒ C14 known-stale มีสิทธิ์ทำงาน ตาม C2) — เส้นแบ่ง stream: **per-path/per-line ของ prune → stdout (C15) · ระดับ run → stderr**
- **`parseManifest` ต้องมี default ใน signature** — `export function parseManifest(text, { maxEntries = 5000 } = {})` ⇒ `readManifest` เรียก `parseManifest(text)` เฉย ๆ ได้ และ **ไม่มีที่ไหนพิมพ์เลข `5000` ซ้ำ** (U6 ส่ง `{maxEntries: 5000}` เข้ามาเองเพื่อ pin boundary)
- **truth table ของ reason ฝั่ง fs (C7/C8) — ห้ามตีความเอง:**

  | เงื่อนไขจาก `lstat(abs)` / `path.relative` | reason |
  |---|---|
  | `lstat(abs).isSymbolicLink() === true` | `prune:symlink` |
  | `!lstat(abs).isFile()` ด้วยเหตุอื่น (dir, fifo, socket, device) | `prune:symlink` |
  | `path.relative(root, parent)` ขึ้นต้น `..` (หรือเป็น absolute) | `prune:not-contained` |
  | `realpathSync` ฝั่งใดฝั่งหนึ่ง throw | `prune:not-contained` |
  | `lstat(abs).size > 5 MB` | `prune:too-large` |
  | sha256 บนดิสก์ ≠ sha256 ใน manifest | `hash:mismatch` |
  | `unlink`/`rmdir` throw | `prune:io` |

- **C10 ไต่ ancestor ต้องใช้ `realpath` ชุดเดียวกับ C8** — ทั้ง `root` และ dir ที่กำลังพิจารณา resolve ด้วย `fs.realpathSync` ตัวเดียวกัน (ห้ามผสม `.native`, ห้ามเทียบ path string ดิบ) ไม่งั้น symlinked ancestor ทำให้ `rmdir` หลุดออกนอก `prunableRoot`
- `stats.pruned` เป็นช่องใหม่ใน `stats` (init `0`) — นับเฉพาะ unlink สำเร็จจริง; `--dry-run` **นับด้วย** (เพื่อให้ `ลบ N` ตรงกับรายการที่พิมพ์) **แต่ห้ามเรียก `unlink` จริง** (C15)

---

## 4. Data-flow

```
[0] const stampBefore = readStamp(target)      ★★ ต้องเป็นขั้นแรกสุดหลังตั้ง target
                                                  (ก่อน copyTree loop และก่อน writeVersionStamp)
        │
        └──▶ useKnownStale = !stampBefore || semverLt(stampBefore, '0.30.1')
                                                            │
[1] pkgRoot payload ──copyTree──▶ target file               │
        │                        │                          │
        └── normalizeEol(buf) ───┴──▶ sha256(buf)  ──▶ payloadNew: Map<relPosix, sha256>
                                                            │
[2] writeVersionStamp()   ← เขียนทับ .warnyin-version ด้วย version ใหม่ (stamp เดิมหายจากดิสก์ที่จุดนี้)
                                                            │
[3] target/.warnyin/.warnyin-manifest ──readManifest──▶ parseManifest ──▶ manifestOld
                                                            │
[4] writeManifest(mergeManifest(payloadNew, manifestOld, statOnDisk))   ★ manifestOld ผ่าน C4 ก่อน statOnDisk
                                                            │
[5] computeStale({manifestOld, payloadNew, knownStale: useKnownStale ? KNOWN_STALE : [],
                  prunableRoots, statOnDisk, sep})
                                                            │
[6]                    {stale, rejected} ──▶ prune(): C9¹ → C7 → C8 → C9² → unlink → C15 → C10
```

**★★ ลำดับ [0] ก่อน [2] เป็นเงื่อนไขความถูกต้อง ไม่ใช่สไตล์** — `writeVersionStamp()` (`cli.mjs:237-248`) เขียน `.warnyin/.warnyin-version` แบบ **unconditional overwrite** ⇒ ถ้า `readStamp` ถูกเรียกหลังจากนั้น (หรือเรียกใน `computeStale` เอง) จะได้ **version ใหม่เสมอ** ⇒ `semverLt(stamp,'0.30.1')` เป็นเท็จตลอด ⇒ **`KNOWN_STALE` ไม่ถูก apply กับผู้ใช้คนใดเลยหลัง ship `0.30.1`** = เหตุผลตั้งต้นของ topic ตายเงียบ โดย gate เขียวหมด (C14) · เคสที่ falsify = **F18** (ตั้ง stamp `0.29.0` ด้วยมือ แล้วยืนยัน end-to-end ว่ายังลบได้)

**★ hash ต้องคิดจาก buffer หลัง `normalizeEol` ทั้ง 2 ฝั่ง** — ฝั่งเขียน manifest (payload จาก `pkgRoot`) และฝั่งอ่านไฟล์บนดิสก์มาเทียบ (C7). ถ้าฝั่งใดฝั่งหนึ่งใช้ buffer ดิบ → hash ไม่ตรงทุกไฟล์ ⇒ **prune กลายเป็น no-op เงียบทั้ง feature โดย gate เขียวหมด** (KB #30)

---

## 5. Test-flow

ไฟล์เดียว: `src/tests/installer-prune.test.mjs` (**ไฟล์ใหม่ — task นี้เป็นเจ้าของ**)
harness: copy `makeTempProject` / `runCli` / `makeTempHome` / `globalEnv` / `ok` / `listFiles` จาก `installer.test.mjs` (**copy ไม่ import** — `installer.test.mjs` ห้ามแตะ)
**รวม 53 เคสพอดี** — unit `U1–U34` (34) + fs/black-box `F1–F19` (19) · เป็น **floor ห้ามลด** (`task.md §3.1`)

### 5.1 Unit — import pure fn จาก `cli.mjs`
> ข้อยกเว้นเดียวกับ `resolveMode`/`isEntrypoint` (main-guard กัน side-effect ตอน import) — ดู `standard.md §3`

| id | input | expected |
|---|---|---|
| U1 | `parseManifest('<64hex>  a/b.md\n<64hex2>  a/c.md\n')` | `entries.length === 2`, `rejected.length === 0`, path ตรงตามลำดับที่ให้ |
| U2 | text มีบรรทัดว่าง + บรรทัดขึ้นต้น `#` ปน | บรรทัดเหล่านั้น**ไม่นับ**ทั้ง `entries` และ `rejected` |
| U3 | text เป็น CRLF (`\r\n`) ทุกบรรทัด | parse ได้เท่ากับ U1 (path ไม่มี `\r` ติดท้าย) |
| U4 | sha ยาว 63 · sha มี `g` · บรรทัดไม่มี separator | ทั้ง 3 → `rejected` reason `hash:missing`, `entries.length === 0` |
| U5 | 2 บรรทัด path เดียวกัน (sha ต่างกัน) | `entries.length === 0` (ทิ้งทั้งคู่) + `rejected.length === 2` |
| U6 | 5001 บรรทัด valid, `{maxEntries: 5000}` | `entries.length === 0` (ทั้งไฟล์ใช้ไม่ได้) · **ไม่ throw** |
| U7 | `parseManifest(null)` / `parseManifest(undefined)` / `parseManifest('')` | ไม่ throw · `entries` เป็น `[]` |
| U8 | `toPosix('.warnyin\\workflow\\x.md', '\\')` | `'.warnyin/workflow/x.md'` · และ `CORE_POSIX.every(r => !r.includes('\\'))` |
| U9 | `computeStale` entry `.warnyin\workflow\x.md` | `rejected` reason `path:backslash` · ไม่อยู่ใน `stale` |
| U10 | entry `.warnyin/workflow/../../etc/passwd` | reason `path:dot-segment` |
| U11 | entry `.warnyin/workflow/./x.md` | reason `path:dot-segment` (ข้อ (2) ครอบ `.` ด้วย) |
| U12 | entry `/etc/passwd` · entry `C:/Windows/x.md` | reason `path:absolute` ทั้งคู่ |
| U13 | entry `.warnyin/workflow/x\u0007.md` และ `...\u0000...` และ `...\u007f...` | reason `path:control-char` |
| U14 | entry `docs/project.md` (นอก `prunableRoots`) | reason `scope:outside-root` |
| U15 | entry `.warnyin/workflow-old/x.md` (prefix คล้าย root) | reason `scope:outside-root` — **พิสูจน์ segment-wise ไม่ใช่ `startsWith` ดิบ** |
| U16 | entry `.warnyin/workflow` (= root พอดี) | **ไม่** ถูก reject ด้วย (5) |
| U17 | entry `.claude/agents/warnyin-old.md` (project mode) | ผ่าน → อยู่ใน `stale` |
| U18 | entry `.claude/agents/my-agent.md` | reason `scope:not-allowlisted` |
| U19 | entry `.claude/skills/explore/SKILL.md` | ผ่าน → อยู่ใน `stale` |
| U20 | entry `.claude/skills/playwright-cli/SKILL.md` | reason `scope:not-allowlisted` |
| U21 | อ่าน `src/.claude/skills/` ด้วย `node:fs` แล้วเทียบกับ `SKILL_ALLOW` | `SKILL_ALLOW ⊇ ชื่อ dir จริง` (structural, C5 append-only) |
| U22 | `manifestOld` มี 1 entry + `knownStale` มี 2 | `stale` **ไม่มี** entry จาก `knownStale` เลย |
| U23 | `manifestOld = []` + `knownStale` 2 path + `statOnDisk` true | `stale` มีทั้ง 2, `source === 'known-stale'`, `sha256 === null` |
| U24 | path X อยู่ทั้งใน `manifestOld` และ `payloadNew` | X **ไม่อยู่ใน** `stale` |
| U25 | path Y อยู่ใน `manifestOld` แต่ `statOnDisk(Y) === false` | Y ไม่อยู่ใน `stale` |
| U26 | path Z อยู่ทั้ง `manifestOld` และ `knownStale` (manifestOld ว่าง เคสอื่น) + ใส่หลายรายการสลับลำดับ | `stale` unique + เรียง A→Z (`assert.deepEqual` กับ array ที่ sort เอง) |
| U27 | entry `source='manifest'` ที่ `sha256` เป็น `null`/`''` | reason `hash:missing` · ไม่อยู่ใน `stale` |
| U28 | `computeStale({..., sep: '\\'})` + `prunableRoots` เป็น POSIX | ผลลัพธ์เท่ากับเคส `sep: '/'` (truth table 2 แถว: รูป `/` และ `\` ได้ผลเดียวกัน) — พิสูจน์ C6 บน Linux |
| U29 | `overCap(50, {})` · `overCap(51, {})` · `overCap(51, {dry: true})` · `overCap(51, {force: true})` | `false` · `true` · `false` · `false` — **boundary ตาม `docs/rule.md §1 declared-threshold`** |
| U30 | `mergeManifest(payloadNew, manifestOld, statOnDisk)` โดย `manifestOld` มี path P (hash `h1`) ที่ไม่อยู่ใน `payloadNew` แต่ `statOnDisk(P) === true` | ผลลัพธ์มี P พร้อม hash **`h1` เดิม** (ไม่ใช่ recompute/null) — C13 |
| U31 | `mergeManifest` โดย P `statOnDisk === false` | P หายจากผลลัพธ์ |
| U32 | `sanitizePath('a\u001b[31mb/c.md')` · path ยาว 500 ตัว | ผลลัพธ์ไม่มี `\u001b` และไม่มี control char · ถูกตัดสั้น |
| U33 | structural (**2 ท่อนในเคสเดียว**) — อ่าน source `cli.mjs` ด้วย `node:fs` แล้ว: **(ก)** สกัดค่าจาก **declaration ของ const เซตปิด** (`PRUNE_REASON`) ด้วย regex ที่จับ **บล็อกประกาศ** แล้วดึงเฉพาะ string literal ในบล็อกนั้น — **ห้าม grep หา `[reason]` ทั้งไฟล์** เพราะ `standard.md §2.2` บังคับให้ reason เป็น const เซตปิดและ **ห้ามพิมพ์ literal กระจาย** ⇒ การ grep แบบเดิมจะได้ **0 ค่า** เมื่อ implement ถูกต้อง (เทสที่แดงตอนโค้ดถูก = เทสผิด) · **(ข)** negative: หา literal ที่ **hardcode** รูป `[xxx:yyy]` ในส่วนรายงานของ prune (บรรทัดที่มี `console.log`/`console.warn` และมี `[` ตามด้วย `path:`/`scope:`/`hash:`/`prune:` แบบตัวอักษรตรง ๆ ไม่ผ่านตัวแปร) | **(ก)** เซตที่สกัดได้ **= 13 ค่าพอดี** และ **ตรงตัวต่อตัว** กับรายการใน C15 (`assert.deepEqual` กับ array ที่ sort แล้ว — ไม่ขาดไม่เกิน ไม่สะกดเพี้ยน) · **(ข)** พบ **0 รายการ** (ทุกจุดรายงานอ้าง reason ผ่านตัวแปรจากเซตปิด) |
| U34 | `mergeManifest(payloadNew, manifestOld, statOnDisk)` โดย `manifestOld` มี entry `../x` (และ `.warnyin/workflow/../../../etc/passwd`) + `statOnDisk` เป็น **spy** ที่บันทึกทุก path ที่ถูกเรียก | entry ทั้งสอง **ไม่อยู่ในผลลัพธ์** · และ **`statOnDisk` ไม่เคยถูกเรียกด้วย path นั้น** (assert จาก spy — C13 บังคับให้ C4 รันก่อน `statOnDisk` ไม่ใช่กรองทีหลัง) |

### 5.2 fs / black-box — spawn `cli.mjs` จริง
> ทุกเคส `ok(r)` (exit 0) ก่อนเสมอ + surface `stderr` ใน message

| id | setup | action | expected |
|---|---|---|---|
| F1 | install → เพิ่มไฟล์ตกรุ่น `.warnyin/template/gone.md` + entry ใน manifest (hash ตรง) → สร้าง symlink `.warnyin/template/link` → dir นอก temp ที่มี `victim.md` + entry `.warnyin/template/link/victim.md` | `--update` | `victim.md` **ยังอยู่** · stdout มี `[prune:not-contained]` (หรือ `[prune:symlink]`) สำหรับ path นั้น · `gone.md` **ถูกลบ**ในรันเดียวกัน (พิสูจน์ไม่ใช่ false-green จาก prune ไม่ทำงาน) · **Windows สร้าง symlink ไม่ได้ → `console.error(...)` + `return` ห้าม `t.skip`** (pass-count gate) |
| F2 | entry ชี้ path ที่เป็น **symlink ไฟล์** ชี้ออกนอก temp | `--update` | ไฟล์ปลายทางยังอยู่ · reason `prune:symlink` |
| F3 | install → เขียนทับไฟล์ payload ตัวหนึ่งด้วยเนื้อใหม่ + ทำให้มันหายจาก payload (ใช้ pkg ปลอม) หรือใส่ entry manifest ที่ hash ไม่ตรง | `--update` | ไฟล์ยังอยู่ · reason `hash:mismatch` |
| F4 | install → `mkdir .warnyin/workflow/my-empty-dir` (ว่าง, ของผู้ใช้) → มีไฟล์ตกรุ่นในโฟลเดอร์อื่นที่จะถูกลบ | `--update` | `my-empty-dir` **ยังอยู่** — เพราะ **ไม่เคยเป็น candidate** (ไม่ใช่ `dirname` ของไฟล์ที่ถูกลบใน run นี้) ตาม C10 ฉบับล่าสุด · ไฟล์ตกรุ่นถูกลบ |
| F5 | ไฟล์ตกรุ่นเป็นสมาชิกเดียวของ `.warnyin/template/orphan-dir/` | `--update` | `orphan-dir` หายไปด้วย · `.warnyin/template` (prunableRoot) **ยังอยู่** |
| F6 | `--global` ลง temp HOME (override **ทั้ง `HOME` และ `USERPROFILE`**) → เพิ่ม `.claude/agents/warnyin-mine.md` + entry manifest (hash ตรง) และ `.warnyin/template/stale.md` + entry | `--global --update` | `warnyin-mine.md` **ยังอยู่** (global scope 3 dir) · `stale.md` **ถูกลบ** |
| F7 | manifest 51 entry ที่ไฟล์มีจริง + hash ตรง + อยู่ใต้ `.warnyin/template/` และไม่มีใน payload | `--update` | ลบ **0 ไฟล์** · stdout มี prefix `⚠ [prune:blast-cap] ` · exit 0 · แล้วรัน `--update --dry-run` → มี `จะลบ:` + นับบรรทัด `  − ` ได้ **51** |
| F8 | เหมือน F7 แต่ **50 entry** | `--update` | ลบครบ 50 · บรรทัดสรุปมี `ลบ 50` — **boundary คู่กับ F7** |
| F9 | มีไฟล์ตกรุ่น 1 ไฟล์ | รอบ 1 `--update --no-prune` · รอบ 2 `--update` env `WARNYIN_NO_PRUNE=1` · รอบ 3 `--update` | รอบ 1-2: `ลบ 0` + ไฟล์ยังอยู่ + manifest ยัง**คง entry** (C13) · รอบ 3: ถูกลบ |
| F10 | มีไฟล์ตกรุ่น + manifest เดิม | `--update --dry-run` | ไฟล์**ไม่ถูกลบ** · manifest **byte-equal** ก่อน/หลัง · **★ `listFiles(tmp)` ก่อน/หลัง เท่ากันทุก path** (`assert.deepEqual` บน array ที่ sort แล้ว) — byte-equal ของ manifest อย่างเดียว **ไม่พิสูจน์** ว่า `unlink`/`rmdir` ไม่ถูกเรียก (C15 ห้าม dry-run แตะ fs ทุกกรณี; ไฟล์ที่ถูกลบไปแล้วจะไม่ทำให้ manifest เปลี่ยน) · stdout มี `จะลบ:` |
| F11 | temp เปล่า | install สด (ไม่มี `--update`) | ไม่มีบรรทัดขึ้นต้น `  − ` · สรุปมี `ลบ 0` · มี `.warnyin/.warnyin-manifest` · บรรทัดแรกตรง N3 · ทุกบรรทัดที่เหลือ match `/^[0-9a-f]{64} {2}[^\\\r]+$/` · **จำนวน entry `=== 91`** (payload CORE ทั้งหมด — **negative-guard ของ recursion §7 T10**: ถ้าลืม forward `onFile` ในบรรทัด recursion `cli.mjs:138` จะได้เพียง **33** ไฟล์ top-level และเกณฑ์หลวมแบบ `> 50` จะ **ไม่จับ**) · **assert 2 ชั้น:** จำนวน entry `===` จำนวนไฟล์ที่นับจาก `src/` 5 dir ของ `CORE` ด้วย `node:fs` ตอนรันเทส **และ** `=== 91` (pin ปัจจุบัน — payload โตขึ้นเมื่อไรให้ **อัปเดตเลข ห้ามผ่อนเป็น `>`**) · path เรียง A→Z |
| F12 | เขียน manifest เป็นขยะ (binary/บรรทัดผิดรูปล้วน) · และเคสไฟล์ > 1 MB | `--update` | exit 0 · payload ครบ (`.warnyin/workflow/README.md` ยังอยู่) · **stderr มี `⚠`** (whole-file reject = warning ระดับ run ตาม §3.2) และ **stdout ไม่มีเนื้อบรรทัดดิบจาก manifest** · manifest ถูกเขียนทับเป็นรูปที่ถูกต้อง (บรรทัดแรกตรง N3) |
| F13 | **กับดัก T1** — temp เปล่า: สร้าง `.warnyin/workflow/README.md` ที่ **byte-equal กับ payload หลัง normalize** ไว้ก่อน แล้ว install (`overwrite:false` → skip) | install | path นั้น **ต้องอยู่ใน manifest** · และเคสคู่: สร้างไฟล์ชื่อชนที่เนื้อ**ต่าง** → path นั้น **ต้องไม่อยู่ใน manifest** |
| F14 | install สด | `--update` ทันที | `ลบ 0` · `listFiles(tmp)` เท่าเดิมทุก path (T1 payloadNew semantics) |
| F15 | entry ใน manifest ที่ path มี ANSI escape `\u001b[31m` + control char | `--update` | ไฟล์นอกขอบเขตไม่ถูกลบ · stdout **ไม่มี** `\u001b` · exit 0 |
| F16 | install → `--update` 2 ครั้งติด | — | รอบ 2 ไม่ crash · manifest byte-equal กับรอบ 1 (idempotent) |
| F17 | `--dry-run` บน temp เปล่า | `--dry-run` | `listFiles(tmp)` = `[]` — **manifest ต้องไม่ถูกเขียน** (regression ของ `installer.test.mjs` เคส 8 `:186-198`, assert `:196` ที่ห้ามแตะ) |
| **F18** | **★ known-stale end-to-end (เคสที่ falsify ลำดับอ่าน stamp — C14)** — install ปกติ → **เขียน `.warnyin/.warnyin-version` ทับด้วย `0.29.0` ด้วยมือ** → สร้าง 2 ไฟล์ `.warnyin/template/stages/[topic]/test.md` และ `verify.md` (ทั้งคู่ **ไม่มีใน payload** ปัจจุบัน) → **ลบไฟล์ manifest ทิ้ง** (บังคับให้ `manifestOld` ว่าง = เงื่อนไขเดียวที่ `knownStale` ถูกรวม ตาม C2) | `--update` | **ทั้ง 2 ไฟล์หายไป** · stdout มีบรรทัด `  − ` ระบุทั้งสอง path · สรุปมี `ลบ 2` · exit 0 · **เคสคู่ (negative):** ทำซ้ำทุกอย่างแต่ตั้ง stamp เป็น **`0.30.1`** → ทั้ง 2 ไฟล์ **ยังอยู่** และ `ลบ 0` — สองขั้วนี้คือสิ่งเดียวที่จับได้ว่า `stampBefore` ถูกอ่าน **ก่อน** `writeVersionStamp()` (ถ้าอ่านหลัง ขั้วแรกจะแดงทันที) |
| **F19** | **★ C16 — global manifest ไม่บันทึก dir ที่แชร์** — `--global` ลง temp HOME (override ทั้ง `HOME` และ `USERPROFILE`) ติดตั้งครั้งแรก แล้วรันรอบสอง | `--global --update` | **stdout ไม่มีสตริง `scope:outside-root` เลย** · และ **ไม่มีบรรทัดใดใน `.warnyin/.warnyin-manifest` ที่ path ขึ้นต้นด้วย `.claude/agents` หรือ `.claude/skills`** (เทียบหลัง split 2 space — เช็คทั้ง 2 prefix แยกกัน) · exit 0 · แต่ entry ใต้ `.warnyin/workflow` ยังมีครบ (พิสูจน์ว่าไม่ได้ว่างทั้งไฟล์) |

---

## 6. Acceptance (falsifiable)

> **baseline ที่วัดจริงก่อนเริ่ม task (`0.30.0`, HEAD):** `node --test` **ทั้ง repo ปัจจุบัน = 248 pass / 0 fail** · `node --test src/tests/installer.test.mjs` = **40 เคส** (40 pass / 0 fail) — ตัวเลขนี้คือ floor ที่ห้ามถอย

- [ ] A1 `node --test` เขียวทั้ง repo **ยกเว้น** `installer-upgrade.test.mjs` ของ slice 2 (ประกาศไว้ `task.md §7`) · `installer.test.mjs` **40 เคสเดิมต้องยังเขียวโดยไม่แก้ไฟล์นั้น** (ยืนยันด้วย `node --test src/tests/installer.test.mjs` → `pass 40` / `fail 0`)
- [ ] A2 U1–U34 + F1–F19 ผ่านครบ — `installer-prune.test.mjs` = **53 เคสพอดี** (= 50 เดิม + 3 เคสใหม่รอบนี้: **U34** path guard ใน merge · **F18** known-stale stamp order · **F19** C16 global manifest) · `pass === tests` ไม่มี skip
- [ ] A3 ลบบรรทัด `const content = normalizeEol(...)` ที่ย้ายขึ้นมาใน `copyTree` แล้วรัน → **F13 ต้องแดง** (กับดัก T1 มี test คุ้ม)
- [ ] A4 เปลี่ยน hash ฝั่งใดฝั่งหนึ่งให้ใช้ buffer ก่อน `normalizeEol` → **F3 หรือ F8 ต้องแดง** (กับดัก T2 มี test คุ้ม)
- [ ] A5 เปลี่ยน `PRUNE_BLAST_CAP` เป็น 51 → **F7 ต้องแดง**; เปลี่ยนเป็น 49 → **F8 ต้องแดง**
- [ ] A6 **3 คำสั่ง แยกบรรทัดละคำสั่ง** (ห้ามรวมด้วย `\|` — alternation แบบ BRE อ่านยากและทำให้ `-c` นับรวมกันจนตีความผลไม่ได้):
  - [ ] `grep -c "require(" src/bin/cli.mjs` → **0**
  - [ ] `grep -c "from 'node:crypto'" src/bin/cli.mjs` → **1**
  - [ ] `grep -c "\.\./scripts" src/bin/cli.mjs` → **0** (publish-boundary — `rule.md §1` + §7 T8)
- [ ] A7 `npm run verify:pack` เขียว (ไม่แตะ allowlist)
- [ ] A8 U33 พิสูจน์ reason set = 13 ค่าพอดี **โดยสกัดจาก declaration ของ const เซตปิด** (ท่อน ก) และ literal ที่ hardcode ในส่วนรายงาน = **0** (ท่อน ข)
- [ ] A9 ข้อความผู้ใช้ใหม่ทุกบรรทัดเป็น**ภาษาไทย** และ `  − ` ใช้ **U+2212** (assert ด้วย `\u2212` ในเทส ไม่ใช่ copy-paste ลอย)
- [ ] A12 **ย้าย `readStamp` ไปเรียกหลัง `writeVersionStamp()`** แล้วรัน → **F18 ต้องแดง** (กับดัก T11 มีเทสคุ้ม — ถ้ายังเขียว แปลว่า F18 ไม่ได้พิสูจน์อะไรเลย)
- [ ] A13 **ถอด `onFile` ออกจากบรรทัด recursion ของ `copyTree` (`:138`)** แล้วรัน → **F11 ต้องแดง** (manifest ได้ 33 แทน 91 — กับดัก T10)

---

## 7. กับดักที่ panel ชี้ว่าพลาดง่ายที่สุด (constraint บังคับ)

| id | กับดัก | ทำไมมันร้าย | ข้อบังคับ |
|---|---|---|---|
| **T1** | `copyTree` early-return ที่ `exists && !overwrite` (`:144-147`) อยู่ **ก่อน** `readFileSync`/`normalizeEol` (`:148`) | **"ทางที่ง่ายกว่าเป็นทางที่ผิด"** — ปล่อยไว้แล้วเรียก `onFile` เฉพาะตอนเขียนจริง จะทำให้ไฟล์ที่ skip **หายจาก manifest** = ของที่เราเป็นเจ้าของแต่บันทึกไม่ครบ ⇒ **ตกรุ่นแล้วลบไม่ได้ตลอดกาล** และไม่มี gate ไหนจับ | ต้อง **เลื่อน `readFileSync` + `normalizeEol` ขึ้นเหนือ branch** แล้วตัดสิน `owned` จาก `byteEqual` (ตาม `design.md §3` เงื่อนไข entry) — F13 เป็นเทสที่ falsify ข้อนี้ตรง ๆ |
| **T2** | hash คิดจาก buffer **ก่อน** `normalizeEol` ฝั่งใดฝั่งหนึ่ง | prune กลายเป็น **no-op เงียบทั้ง feature** โดย gate เขียวหมด (KB #30) | hash = `createHash('sha256').update(normalizeEol(buf, name)).digest('hex')` **ทั้งฝั่งเขียน manifest และฝั่งอ่านไฟล์บนดิสก์มาเทียบ (C7)** — ใช้ helper `hashOf(buf, name)` ตัวเดียว |
| **T3** | ผสม POSIX/native | `CORE` สร้างด้วย `path.join` (native) แต่ manifest/guard เป็น POSIX ⇒ บน Windows guard (5) reject ทุก entry เงียบ | `toPosix` **helper เดียว** + `CORE_POSIX` derive จาก `CORE` + `computeStale` รับ `sep` ได้ (U28) — CI ไม่มี Windows runner จึงต้องพิสูจน์ด้วย unit |
| **T4** | กรอง global scope ที่ layer อื่น (เช่นใน `prune()`) | C11 จะไม่ pure และเทสไม่ได้ที่ slice เดียว | **`prunableRoots` เป็น input ของ `computeStale`** — `main()` เลือกรายการตาม mode แล้วส่งเข้าไป |
| **T5** | เขียน cap ชั้นเดียว / ให้ `--dry-run` ติด cap | manifest ปลอมทำให้เกิด I/O มหาศาล · dry-run ที่ list ไม่ได้ทำให้คำแนะนำ "รัน dry-run ดูก่อน" พาไปตัน | 2 ชั้นตาม C9 + `--dry-run` ยกเว้นเสมอ + boundary test F7/F8 |
| **T6** | empty-dir candidate มาจากการ walk ทั้ง tree | ลบโฟลเดอร์ว่างของผู้ใช้ | candidate = `dirname` ของไฟล์ที่ **ลบใน run นี้** เท่านั้น ⇒ dir ว่างของผู้ใช้ **รอดโดยอัตโนมัติ** เพราะไม่เคยเป็น candidate · **ไม่ต้องมี snapshot check** (C10 ฉบับล่าสุด: เป็นเงื่อนไข unreachable) · ไต่ ancestor ด้วย **realpath ชุดเดียวกับ C8** (F4) |
| **T7** | พิมพ์ path จาก manifest ตรง ๆ | ANSI/control char จาก untrusted input ทำ terminal spoofing | `sanitizePath()` ก่อนพิมพ์ทุกจุด (U32, F15) |
| **T8** | `import { semverGte } from '../scripts/setup-dogfood.mjs'` | **`src/scripts/` ไม่อยู่ใน `package.json files` ⇒ ไม่ถูก publish** → `cli.mjs` ของผู้ใช้ crash ทันทีที่ import (เทสใน repo จะเขียวเพราะไฟล์อยู่ครบ = false-green ที่รุนแรงที่สุด) | **implement `semverLt` ในตัว `cli.mjs`** (ลอกอัลกอริทึม field-wise numeric ของ `semverGte` ที่ `src/scripts/setup-dogfood.mjs:94-106` มา ~6 บรรทัด: `String(v).split('.').map(x => parseInt(x,10) \|\| 0)`, ขาด field = 0) + คอมเมนต์ระบุเหตุผล · **C14 ฉบับล่าสุดสั่งชัดแล้วว่าห้าม import จาก `src/scripts/setup-dogfood.mjs`** — สิ่งที่ reuse คือ **อัลกอริทึม** ไม่ใช่ module |
| **T9** | ให้ `writeManifest` เขียนตอน `--dry-run` | ทำ `installer.test.mjs` เคส 8 (`:186-198`, assert `:196` `listFiles(tmp) === []`) แดง — และเราห้ามแตะไฟล์นั้น | `writeManifest` เคารพ `DRY` แบบเดียวกับ `writeVersionStamp` (log + นับ stats แต่ไม่เขียน) — F17 · **และ `prune()` ต้องไม่เรียก `unlink`/`rmdir` เลยตอน `DRY`** (C15) — F10 assert `listFiles` ก่อน/หลังเท่ากัน |
| **T10** | **แก้ `copyTree` ให้รับ `onFile` แต่ลืม forward ที่บรรทัด recursion** (`:138` `copyTree(rel, { overwrite })` — object literal ที่สร้างใหม่ ไม่ได้ spread ของเดิม) | `onFile` จะ `undefined` ในทุกชั้นที่ลึกกว่า top-level ⇒ manifest ได้เพียง **33 จาก 91 ไฟล์** ⇒ **ไฟล์ที่ลึกกว่าชั้นเดียวไม่เคยเข้า manifest = ตกรุ่นแล้วลบไม่ได้ตลอดกาล** · ร้ายเป็นพิเศษเพราะ "prune ทำงาน" ยังเห็นผลจริงบนไฟล์ top-level ⇒ ดูเหมือนเขียว และเกณฑ์หลวมแบบ `จำนวน entry > 50` **ก็ยังผ่าน** (33 < 50 จริง แต่ถ้า payload โตขึ้นก็จะผ่านได้) | `copyTree(rel, { overwrite, onFile })` · **negative-guard = F11 assert `จำนวน entry === 91` (ไม่ใช่ `> 50`)** + assert เทียบกับจำนวนไฟล์จริงที่นับจาก `src/` · falsify ด้วย A13 |
| **T11** | **★★ อ่าน stamp หลัง `writeVersionStamp()`** (หรือให้ `computeStale`/`prune` ไปอ่านเอง) | `writeVersionStamp()` เขียน `.warnyin-version` แบบ unconditional overwrite ⇒ ค่าที่อ่านได้คือ **version ใหม่เสมอ** ⇒ `semverLt(stamp,'0.30.1')` เท็จตลอด ⇒ **`KNOWN_STALE` ไม่ทำงานกับผู้ใช้คนใดเลยหลัง ship `0.30.1`** = เหตุผลตั้งต้นทั้งหมดของ topic ตายเงียบ โดยทุก gate เขียว (unit ไม่จับเพราะ `knownStale` เป็น input ที่เทสป้อนเอง; black-box ของ slice 2 ประกาศว่าแดงตลอด wave 1 ⇒ ถูกมองข้ามได้) | `const stampBefore = readStamp(target)` **ก่อน `copyTree` loop และก่อน `writeVersionStamp()` ทั้งสองสาขา** (M7) แล้วส่งค่าที่อ่านไว้ต่อเป็น input · **negative-guard = F18 สองขั้ว (`0.29.0` ลบได้ / `0.30.1` ไม่ลบ)** · falsify ด้วย A12 |
