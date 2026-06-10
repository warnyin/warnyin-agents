# Rule — dag-width-toolkit

## 1. Rule ที่ต้อง follow (จาก docs/rule.md)
- [ ] **unify-in-place** — ขยาย principle/gate เดิมในที่เดิม ไม่สร้างกลไกขนาน
- [ ] **canonical-copy** — wording copy จาก `design.md` §3 คำต่อคำ ห้ามแต่งใหม่ต่อไฟล์
- [ ] **กระทัดรัด opinionated** — toolkit 3 เทคนิคพอ ไม่ไหลเป็น catalog
- [ ] **ภาษาไทย** + สไตล์ playbook เดิม
- [ ] **ห้ามแตะไฟล์นอก scope §4 ของ task.md** (file-ownership disjoint — กัน conflict wave 1)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] เสนอ: "DESIGN ต้องวัด critical-path depth ของ DAG ก่อนแตก task" — เหตุผล: กัน chain เผลอ (root cause ของ topic นี้) — _ถ้า panel/VERIFY เห็นด้วย ยกขึ้น `docs/rule.md` ตอน SHIP_
