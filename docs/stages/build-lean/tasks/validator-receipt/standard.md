# Standard — validator-receipt

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด

## 1. Standard กลางที่ยึด (จาก techstack / rule กลาง)

- **zero-dependency:** import เฉพาะ `node:*` (`node:fs`, `node:path`, `node:url`, test ใช้ `node:test`/`node:assert/strict`/`node:child_process`/`node:os` ตามไฟล์เดิม) — ห้ามเพิ่ม dependency
- **ESM** (`.mjs`) + main-guard แบบเดิม (`fileURLToPath(import.meta.url) === process.argv[1]` — ไม่ใช้ `import.meta.main`)
- **cross-platform:** สร้าง path ด้วย `path.join`; key ใน `files` Map เป็น POSIX (`tasks/<name>/<file>`) ตาม walker เดิม — logic ใหม่เทียบ key ตาม convention นี้
- **security ตาม header ของ script เดิม:** ไม่มี child_process/network/write ใน validator · report structural เท่านั้น (ชื่อไฟล์/section/code — ไม่ echo เนื้อ receipt) · error message ไม่พ่น absolute path

## 2. Pattern การเขียนโค้ดของ task นี้

- **pure fn + injectable IO:** fast/mixed detection อยู่ในชั้น pure fn (`checkTopic(files)` หรือ helper ใหม่ที่ `checkTopic` เรียก เช่น `detectMode(files)`) — รับ `Map` คืนค่า ไม่แตะ fs; main ทำแค่ render ผล
- **return shape ของ `checkTopic` ต้อง backward compatible:** เคสเดิม assert `{issues, stage}` — แนวทางแนะนำ: mode fast → คืน `stage: 'fast-track'` (reuse คอลัมน์ stage เดิม ไม่ต้องแก้ render/ตาราง); ถ้าเพิ่ม field ใหม่ (เช่น `mode`) ให้เป็น additive เท่านั้น
- **issue object เดิม:** mixed-state = `{ code: 'C6', level: 'warn', msg: 'topic มีทั้งโครง full และ receipt — ระบุ mode ให้ชัด' }` — โครง `code/level/msg` ตรงเคส structured-error เดิม (ห้าม format ใหม่)
- **naming/คอมเมนต์ภาษาไทย** style เดียวกับไฟล์เดิม (คอมเมนต์หัว section `// ── ... ──`, อ้าง design § ที่มา)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)

- **`isFilled(content)`** — filled-guard เดิม (H1 ไม่มี placeholder `<...>`) ใช้ตัวนี้ตัดสิน receipt/proposal/design filled — **ห้ามเขียน heuristic ใหม่/regex ใหม่**
- **`topLevel(files, name)`** — อ่านไฟล์ระดับ topic จาก Map
- **logic skip `[task-name]`** — เกณฑ์ "task folder จริง" ใช้เงื่อนไขเดียวกับ `checkTasks` (key ขึ้นต้น `tasks/`, ชื่อไม่ขึ้นต้น `[`) — ถ้าต้องใช้สองที่ ให้ extract helper เดียวแล้วให้ C2 ใช้ด้วย ไม่ copy เงื่อนไข
- **test harness เดิม:** `makeTempProject` / `writeTopic` / `runScript` / `byCode` / `hasError` / `hasWarn` / ค่าคงที่ `FILLED_H1`/`TEMPLATE_H1` — เคสใหม่ประกอบจาก helper เหล่านี้ (spawn ด้วย array args, ห้าม `shell:true`)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)

- fixture receipt ไม่ต้องเหมือน template จริงทุกบรรทัด — contract-first: ใช้แค่ H1 filled/template (`# Receipt — งานจริง` vs `# Receipt — <ชื่อ change>`) เพราะ validator ตัดสินจาก `isFilled` เท่านั้น (ไม่ parse section ภายใน receipt)
- ลำดับ precedence ใน `checkTopic`: ตัดสิน mode ก่อน แล้วค่อยเลือก run checks — เขียนเป็น early-branch ชัดเจน อย่าฝัง flag เข้าไปใน check แต่ละตัว (คง check functions เดิม untouched)
