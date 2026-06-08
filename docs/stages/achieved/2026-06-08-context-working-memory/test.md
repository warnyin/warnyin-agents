# Test — context-working-memory

> VERIFY stage · playbook: .warnyin/workflow/stages/verify.md
> guideline: docs/techstack/installer/test.md

## 1. จุดประสงค์ที่ต้อง verify
- context.md scaffold เป็น skeleton 4 section (ไม่ใช่ไฟล์ว่าง) ตอนติดตั้ง — seed-if-absent
- SHIP เป็น producer + readers ชี้ working-notes (ไม่ใช่ status board)
- ไม่มี regression: installer เดิม + payload cleanliness ยังเขียว

## 2. Baseline (regression)
- feature ใหม่ (ADDED) ไม่มี spec เดิม; regression = installer.test 9 เคสเดิม + verify-pack + lint-md

## 3. แผนเทส
A. Functional
- A1 npm test → pass>=9, pass==tests, fail 0

B. Executable install proof (temp dir, ห้ามรันที่ repo root)
- B1 install สด → docs/stages/context.md non-empty + 4 header
- B2 seed-if-absent: context.md user → install → byte-equal
- B3 --update → ไม่ทับ
- B4 no-leak: ไม่มี topic ต้นทางรั่ว

C. Package cleanliness
- C1 npm pack --dry-run --json → มี src/.warnyin/template/stages/context.md ไม่ leak

D. Payload consistency
- D1 lint-md เขียว
- D2 grep context.md: readers pointer ไม่จด status board
- D3 next.md read-only invariant คงเดิม
- D4 ship.md producer step + gate item
- D5 canonical เดียว

## 4. Local env
- ไม่มี service — temp dir + spawn src/bin/cli.mjs (ห้ามรันที่ repo root)
