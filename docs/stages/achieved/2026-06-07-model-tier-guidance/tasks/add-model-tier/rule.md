# Rule — add-model-tier

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow
- [ ] **tool-agnostic** (`docs/rule.md` §1) — generic tier ห้ามผูกชื่อรุ่น (Opus/Sonnet/Haiku/claude-)
- [ ] **unify-in-place / context ไม่ duplicate** (`docs/rule.md` §1) — เสริมใน Tool preference, ชี้กลับ posture ไม่ copy checklist; โครง card ยัง 4-section
- [ ] **opinionated** (`docs/rule.md` §1) — 3 tier + worker note บรรทัดเดียว ไม่ไหลเป็น catalog
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/.warnyin/workflow/contexts/` เท่านั้น
- [ ] **ไม่ทำลายของเดิม** — ไม่แตะ 5 stage/installer/test; `npm test`+`verify:pack`+`lint:md` เขียว
- [ ] **ภาษาไทย** (`docs/rule.md` §2)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] rule ที่เสนอ: **model-tier / payload-guidance ต้อง generic (tool-agnostic)** — guidance ใด ๆ ใน payload ที่อ้าง model/tooling ของ harness ต้องใช้ **vocab generic** (deepest/balanced/cheap) ไม่ผูกชื่อรุ่น/ผลิตภัณฑ์ — harness map เอง; เหตุผล: คง tool-agnostic core; placement: ยืนยันตอน SHIP (`docs/rule.md` §1)
