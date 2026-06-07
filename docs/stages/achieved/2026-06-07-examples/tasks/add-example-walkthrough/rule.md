# Rule — add-example-walkthrough

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack/project)
- [ ] **tool-agnostic / ไม่ duplicate** (`docs/rule.md` §1) — walkthrough ชี้ playbook/achieved ไม่ copy ขั้นตอน
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แตะแค่ `docs/` + `README.md`; ห้ามแตะ `src/`, playbook กลาง, payload; **ลิงก์ playbook ใช้ `src/.warnyin/...`** (root `.warnyin/` gitignored — ไม่ resolve บน GitHub)
- [ ] **`docs/` ไม่อยู่ใน npm `files`** (`docs/techstack/installer/rule.md` §4) — ไม่ ship walkthrough; ไม่เพิ่ม `docs/` เข้า allowlist
- [ ] **ไม่ทำลายของเดิม** — README section เพิ่มเท่านั้น (marker/structure เดิมไม่พัง); `npm test` + `verify:pack` เขียว
- [ ] **investigate-before-edit** (`docs/rule.md` §1) — อ่าน 13 ไฟล์ achieved จริงก่อนเขียน narrative (ไม่แต่ง decision เอง — กลั่นจาก discovery/design/build/verify/ship ที่บันทึกไว้)
- [ ] **ภาษาไทย** (`docs/rule.md` §2)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP — promote เข้า `docs/rule.md` หรือ techstack)
- [ ] rule ที่เสนอ: **worked-example convention** — เอกสารตัวอย่างต้อง (1) **surface achieved จริง ไม่ duplicate** (ชี้กลับ), (2) มี **disclaimer snapshot + pointer playbook source** กัน narrative drift, (3) **ไม่ ship npm** (อยู่ `docs/`), (4) ลิงก์ playbook ชี้ `src/.warnyin/` (committed) ไม่ใช่ root dogfood — เหตุผล: maintenance ต่ำ + กัน staleness (roadmap P2 #10 เตือน); placement: ยืนยันตอน SHIP (`docs/rule.md` §1 หรือ techstack ใหม่ `docs/`)
