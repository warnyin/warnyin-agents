# Rule — model-routing-docs

## 1. Rule ที่ต้อง follow
- [ ] **tool-agnostic / payload-guidance generic** — payload (`contexts/`, `template/`, `build-wave.mjs`) **ไม่ผูกชื่อรุ่น**; ชื่อรุ่นจริงอยู่เฉพาะ `.claude/commands/` (adapter)
- [ ] **canonical-copy** — wording จาก `design.md` §3C คำต่อคำ
- [ ] **unify-in-place** — ขยาย model-tier เดิม ไม่สร้างตาราง/section ขนาน
- [ ] **skill-adapter convention** — command ชี้ playbook ไม่ duplicate logic
- [ ] **ไม่ regression** context-profiles Scenario เดิม (รวม `balanced+`)
- [ ] **ภาษาไทย** + ห้ามแตะไฟล์นอก scope §4

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] เสนอ: "tier→model mapping อยู่ที่ adapter (`.claude/`) เท่านั้น — payload คง generic" — เหตุผล: เป็น pattern ใหม่ของ model routing ที่ควร generalize — _ถ้า VERIFY ยืนยัน ยกขึ้น `docs/rule.md` §1 (ใต้ payload-guidance) ตอน SHIP_
