# Task — update-verify-pack

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `update-verify-pack` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (verify-pack) |
| **Model tier** | `cheap` |
| **สถานะ** | `เสร็จ (built 2026-07-09)` |

## 1. เป้าหมายของ task (vertical slice)

อัปเดต `verify-pack.mjs` ให้ gate รู้จัก path template ใหม่ที่ T1 เพิ่ม + อัปเดต unit test + อัปเดต `MIN_PASS` ใน `check-test-count.mjs` ถ้าจำเป็น

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- ต้องทำหลัง: `tasks/add-ide-adapters/` (ต้องรู้ path template จริงก่อน)
- ปลดล็อกให้: `tasks/release-hygiene/`
- ส่ง output: verify-pack gate pass สำหรับ package ที่มี adapter ใหม่

## 3. Sub-tasks

- [x] 1. อ่าน `src/scripts/verify-pack.mjs` ให้ครบ — เข้าใจ `ALLOWED_PREFIX` + `ALLOWED_FILE` + `checkFiles()` — _ผลลัพธ์: เข้าใจ contract_
- [x] 2. `src/.warnyin/` prefix ครอบ `installer/templates/` อยู่แล้ว → เพิ่ม note ยืนยัน (ไม่ต้องเพิ่ม prefix ใหม่) — _ขึ้นกับ 1_
- [x] 3. อัปเดต unit test `src/tests/verify-pack.test.mjs` — เพิ่ม T2-adapter-templates + T2-negative — pass 13/13 — _ขึ้นกับ 2_
- [x] 4. bump `MIN_PASS` จาก 9 → 45 (installer 32 + verify-pack 13) — _ขึ้นกับ 3_

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

- `src/scripts/verify-pack.mjs` — แก้ `ALLOWED_PREFIX`/`ALLOWED_FILE`
- `src/tests/verify-pack.test.mjs` — เพิ่ม test case
- `src/scripts/check-test-count.mjs` — อัปเดต `MIN_PASS` ถ้า hardcode

## 5. Acceptance criteria

- [x] รัน `node src/scripts/verify-pack.mjs` → ✓ pack-verify ผ่าน 98 ไฟล์
- [x] unit test `checkFiles()` ด้วย path ใหม่ → ไม่มี error (T2-adapter-templates)
- [x] unit test `checkFiles()` ด้วย path ต้องห้าม (docs/) → ยังจับได้ (T2-negative)
- [x] `node --test src/tests/verify-pack.test.mjs` exit 0 — pass 13/13
- [x] ผ่าน test ตาม `spec.md`
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
