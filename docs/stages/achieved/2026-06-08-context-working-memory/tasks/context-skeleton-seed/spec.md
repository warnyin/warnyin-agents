# Spec — context-skeleton-seed

> spec เฉพาะของ task นี้ — ใส่เฉพาะหัวข้อที่เกี่ยวข้อง

## 1. ชนิดของ task
`infra/tooling` (installer) + `data` (รูปแบบไฟล์ context.md)

## 4. Data-flow
- `src/.warnyin/template/stages/context.md` (template ที่ ship มากับ package)
  → CORE `copyTree` วางไปที่ `target/.warnyin/template/stages/context.md` (ปกติของ template tree)
  → `ensureScaffold()` อ่าน template จาก `pkgRoot` แล้วเขียน `target/docs/stages/context.md` **เฉพาะเมื่อยังไม่มี**
- ถ้ามี `target/docs/stages/context.md` อยู่แล้ว → ข้าม (`stats.skipped++`) ทั้ง install และ `--update`

## 7. Test-flow (black-box ตาม `src/tests/installer.test.mjs` harness)
- [ ] **seed-fresh:** temp project ว่าง → `runCli(dir)` → อ่าน `docs/stages/context.md` → assert non-empty + มีสตริง header ทั้ง 4 (เช่น `## โฟกัส/ธีมปัจจุบัน`, `## Decision ข้าม topic`, `## Parking lot`, `## เพิ่ง ship`)
- [ ] **no-overwrite (install):** เขียน `docs/stages/context.md` = `"งานของฉัน"` ก่อน → `runCli(dir)` → ไฟล์ยัง byte-equal `"งานของฉัน"`
- [ ] **no-overwrite (--update):** เช่นเดียวกัน → `runCli(dir, ['--update'])` → byte-equal เดิม
- [ ] **dry-run:** temp ว่าง → `runCli(dir, ['--dry-run'])` → `docs/stages/context.md` **ไม่ถูกสร้าง** (หรือยังว่างตามเดิม) แต่ exit 0
- [ ] assert `code===0` ก่อนทุกเคส (helper `ok`); เทียบ byte-content ไม่ใช่ mtime
- [ ] edge: legacy target ที่มี context.md ว่าง (`''`) อยู่แล้ว → install → คง `''` (skip, ไม่ทับด้วย skeleton) — พฤติกรรมถูกต้องตาม "seed-if-absent"
