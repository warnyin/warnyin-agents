# Standard — test-suite-relocation

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน test ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` (Test harness กลาง) + `docs/techstack/installer/test.md`

## 1. Standard กลางที่ยึด (จาก techstack)
> อ้างอิง `docs/techstack/installer/standard.md` §"Test harness กลาง" — ใช้ซ้ำทั้งหมด ห้ามเขียนใหม่
- **harness กลาง** = `makeTempProject(t)` + `runCli(cwd, args)` + `ok(r, msg)` — pattern กลางของ repo ใช้ซ้ำทุก test ของ CLI (อยู่ในไฟล์ test เดียวกัน `src/tests/installer.test.mjs`)
- **black-box:** assert จาก side-effect จริง — ห้าม import logic จาก `cli.mjs` (มันรัน side-effect ตอน import)
- **cliPath:** `fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))` — ห้าม `.pathname` (Windows คืน `/D:/...` → spawn MODULE_NOT_FOUND)
- assert `code===0` ก่อนเสมอ + surface `stderr` ใน assertion message; เทียบไฟล์ด้วย byte-content (`.equals()`) ไม่ใช่ mtime
- legacy string ที่ assert ต้อง copy codepoint ตรงจาก `cli.mjs` (en-dash U+2013, `≤` U+2264)

## 2. Pattern การเขียนโค้ดของ task นี้
- **โครงสร้าง/naming:** ไฟล์เดียวคงเดิม `src/tests/installer.test.mjs` (หลัง git mv); test ใช้ `node:test` + `node:assert/strict`; ตั้งชื่อเคสคงเดิม (1.–9.) — เพิ่มเคส regression (ถ้าทำ) ต่อท้ายเป็น 10.
- **discovery:** `scripts.test` = `node --test` (bare) — **ไม่มี path/glob arg** (ดู spec §4); ถ้า T1 ตั้งไว้แล้ว = แค่ยืนยันค่าตรง ห้ามเติม arg
- **state/data:** ทุกเคส install ลง temp dir แยก (`mkdtempSync` + `t.after` cleanup) — ห้ามแชร์ state ข้ามเคส; spawn array args **ห้าม `shell:true`**
- **path:** ใช้ `path.join` ทุกที่ (cross-platform); target-side path ใน assertion **ไม่มี prefix `src/`** (ดู spec §7.1)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `makeTempProject` / `runCli` / `ok` / `listFiles` — มีอยู่แล้วในไฟล์ test ใช้ซ้ำ ห้าม fork
- ไม่มี dependency ใหม่ — built-in `node:*` เท่านั้น (`node:test`, `node:assert/strict`, `node:child_process`, `node:fs`, `node:os`, `node:path`, `node:url`)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
> pattern ใหม่ที่ task นี้แนะนำ — ถ้าควรเป็นมาตรฐานกลาง note ใน `rule.md` (รอ SHIP)
- **pass-count gate ใน CI** (ถ้าทำ §7.2): parse summary line `ℹ pass N` / `# pass N` จาก `node --test` output ด้วย built-in เท่านั้น (zero-dep) — pattern ใหม่ระดับ CI ที่อาจ promote ขึ้น standard กลางตอน SHIP (note ใน rule.md §2)
