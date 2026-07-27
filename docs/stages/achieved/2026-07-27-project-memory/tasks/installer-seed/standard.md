# Standard — installer-seed

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> อิงจาก `docs/techstack/installer/standard.md` + `docs/techstack/installer/test.md`

## 1. Standard กลางที่ยึด (จาก techstack)

- **mirror layout `src/` = target paths** (`docs/techstack/installer/rule.md`) — `src/.warnyin/template/docs/<rel>` ถูก seed เป็น `<target>/docs/<rel>` ตรงตัว **ไม่มี mapping table** → วางไฟล์ให้ตรงโครงที่ต้องการเห็นใน target
- **`cli.mjs` helper แยกหน้าที่** — `copyTree` / `ensureScaffold` / `seedDocs` / `installRootDoc`; ทุกตัวเคารพ `DRY` (ไม่เขียนจริงแต่ log + นับ `stats`) → **แก้เฉพาะข้อมูล (`SCAFFOLD_FILES`) ไม่แก้โครง helper**
- **`path.join` ทุกที่** (cross-platform); หา root ด้วย `fileURLToPath(import.meta.url)`
- **ข้อความ log ภาษาไทย** — `+` สร้างใหม่ · `↻` อัปเดต · `±` ต่อท้าย section
- **zero-dependency + ESM** — built-in `node:*` เท่านั้น; ห้าม `__dirname`/`require`
- **Test harness กลาง** (`standard.md` §Test harness) — reuse `makeTempProject(t)` / `runCli(cwd,args,env,opts)` / `ok(r,msg)` / `listFiles` ที่มีอยู่แล้วใน `installer.test.mjs` — **ห้ามเขียน harness ใหม่ซ้ำ**
- **black-box** — assert side-effect จริง; **ห้าม import logic จาก `cli.mjs`** (ยกเว้น pure-fn `resolveMode`/`isEntrypoint` ที่ export ไว้แล้ว — task นี้ไม่ต้องใช้)
- **assertion เป็น target-side path** (`docs/stages/context.md`, `docs/memory.md`) **ไม่ใช่ `src/.warnyin/...`**
- **anti-false-green** (`test.md` §pass-count gate) — `pass === tests` → **ห้าม `t.skip()`/conditional-skip**
- **cleanup `t.after()` ลงทะเบียนก่อน assert** — `makeTempProject` ทำให้แล้ว
- **LF-only** สำหรับไฟล์ใต้ `src/` (บทเรียน CRLF — commit `0a2e7c4`; `src/tests/eol.test.mjs` บังคับ `.mjs`) — เขียน `.md` ใหม่ด้วย LF เช่นกัน

## 2. Pattern การเขียนโค้ดของ task นี้

### 2.1 template `.md` 2 ใบ (ไฟล์ใหม่)

- **โครงเดียวกับ template อื่นใน `template/docs/`** (`project.md`, `infra.md`, `rule.md`) — H1 + blockquote อธิบายสั้น + heading ของ section + placeholder ให้ผู้ใช้เติม; **ไม่มีข้อมูลจริงของ repo นี้**
- **คำเตือน C12 อยู่หัวไฟล์ คำต่อคำ** (copy จาก `spec.md` §3 — T6 assert string-equality; แต่งใหม่แม้คำเดียว = แดง)
- **path ทุกที่เป็น inline-code (backtick) — 0 markdown-link** ทั้งไฟล์ (สำเนาใน `docs/` ถูก `lint-md` สแกน)
- **แถวตัวอย่างของตารางเป็น HTML comment** (`<!-- | 1 | ... | -->`) — กัน `memory-status.mjs` (T5) นับเป็น entry จริง
- **สั้นเข้าไว้** — template คือโครง ไม่ใช่คู่มือ; กติกาเต็มชี้ไปที่ `.warnyin/workflow/memory.md` ด้วย pointer บรรทัดเดียว (inline-code)

### 2.2 `cli.mjs`

- **`SCAFFOLD_FILES` = data ล้วน** — แก้ด้วยการลบสมาชิก + คงสไตล์ inline comment ต่อบรรทัดของ array นี้; คอมเมนต์หัว array ต้อง **ตรงพฤติกรรมใหม่**: scaffold สร้างเฉพาะโฟลเดอร์ archive เปล่า ส่วน `context.md` มาจาก `seedDocs` (template) — คอมเมนต์ที่ขัดพฤติกรรมจริงถือเป็น defect (`docs/techstack/installer/rule.md`)
- **ห้ามเพิ่ม branch ใหม่** — ไม่มี logic ตรวจ "ไฟล์ว่าง → เขียนทับ" (ขัดกฎ "ไม่เขียนทับงานจริง"); เคสไฟล์ว่างเป็นหน้าที่ของ playbook C13

### 2.3 เทส

- **assert ตรง ๆ ไม่มี guard** — template อยู่ใน worktree เดียวกัน (ต่างจาก `hasGlobalTemplate` ที่ไฟล์เป็นของ task อื่น)
- **heading/legend ที่ assert = const array เดียวในไฟล์เทส** แล้ววน assert — กัน string เพี้ยนในตัวเทสเอง; assertion message ระบุ **ไฟล์ + สิ่งที่ขาด**
- **เคสใหม่วางใต้ section comment ใหม่** (คั่นด้วย `// ────` เหมือน block เดิม) ท้ายไฟล์ — **ไม่แทรกกลางเคส 1-9** (กัน diff ปนกับของเดิม)

### 2.4 `init.md` (payload `.md`)

- เขียนเป็น **step/bullet สั่งงาน agent** ไม่ใช่โค้ด; path เขียนเป็น inline-code ตามสไตล์เดิมของไฟล์
- ลำดับใน step 0 ต้องอ่านแล้วไม่กำกวม: **seed ก่อน → fallback ไฟล์เปล่าเฉพาะเมื่อ template ไม่มี** (ไม่ใช่ "สร้างเปล่าแล้วค่อย seed" ซึ่งทำให้ seed ของตัวเอง skip)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)

- `makeTempProject` · `runCli` · `ok` · `listFiles` · `globalEnv`/`makeTempHome` — มีอยู่แล้วใน `src/tests/installer.test.mjs`
- `seedDocs()` ใน `cli.mjs` — **recursive + ข้าม `[...]` + skip-if-exists อยู่แล้ว ไม่ต้องแก้**
- template ที่มีอยู่ใน `src/.warnyin/template/docs/` (`project.md`, `rule.md`, `infra.md`, `codemap/index.md`) — ใช้เป็น **แบบอ้างอิงโทน/โครง** ของไฟล์ใหม่ (ห้ามแก้ไฟล์เหล่านี้)
- `src/scripts/check-test-count.mjs` — gate สำเร็จรูป **ไม่ต้องแก้** (`MIN_PASS` เป็น floor)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)

- ถ้าพบว่าคำอธิบายอื่นใน `cli.mjs` (เช่นข้อความ `--help` / คอมเมนต์หัวไฟล์) ยัง**เคลมว่า `--update` ไม่แตะ `docs/`** ซึ่งไม่ตรงข้อเท็จจริง (`spec.md` §4.1 ข้อ 2) → **อย่าแก้ในรอบนี้** (นอก scope, blast radius) — note ไว้ที่ `rule.md` §2 ให้ SHIP/T6 พิจารณาพร้อม migration note ใน CHANGELOG
- template ใหม่ **ไม่ต้องแก้ `package.json files`** — อยู่ใต้ `src/.warnyin/` ซึ่งอยู่ใน allowlist + `ALLOWED_PREFIX` ของ `verify-pack` แล้ว (T6 เป็นคนเพิ่ม assert ว่าไฟล์ติด tarball จริง)
