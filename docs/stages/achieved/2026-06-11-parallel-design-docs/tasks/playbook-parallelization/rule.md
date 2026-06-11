# Rule — playbook-parallelization

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก docs/rule.md)
- [ ] **source/dogfood แยกชั้น** (§6) — แก้ `src/.warnyin/workflow/stages/design.md` เท่านั้น ห้าม commit/แก้ root `.warnyin/`
- [ ] **payload-guidance ต้อง generic** (§1) — ห้าม enumerate ชื่อรุ่น (แม้ในประโยคปฏิเสธ) — ใช้ generic vocab
- [ ] **unify-in-place ไม่สร้างกลไกขนาน** (§1) — ขยาย §3 ข้อ 2/7 ในที่เดิม ไม่เพิ่มกลไกขนาน
- [ ] **canonical-copy convention** (§1) — copy behavior จาก `design.md §3` ไม่แต่งใหม่
- [ ] **change-sizing / DAG-width** (§1) — guidance ใหม่ต้องไม่ขัดหลัก DAG-width + fast-track skip-list เดิม
- [ ] **CHANGELOG** (§2) — task นี้ **ไม่เขียน** CHANGELOG (อยู่ใน T2) แต่ต้องไม่ลืมว่า behavior change นี้ต้องมี entry (T2 รับผิดชอบ)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
- [ ] rule ที่เสนอ: **"DESIGN parallelization — gathering ขนานได้ / narrative+judgment เป็น single-writer"** — เหตุผล: เป็นหลักการแกนที่ generalize เกิน topic นี้ (ใช้กับทุก stage ที่ fan-out) — ถ้า SHIP เห็นว่าควรเป็น learned-rule กลาง ให้ promote เข้า `docs/rule.md` พร้อม evidence = topic นี้ (เลียน rule "DAG-width ก่อน serialize" ที่มาจาก `improve-performance`)
