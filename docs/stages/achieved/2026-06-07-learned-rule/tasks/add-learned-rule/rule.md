# Rule — add-learned-rule

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack/project)
- [ ] **single source of truth** (CLAUDE.md) — wording canonical เดียว (design §2) ทุกจุด reference; playbook นิยามเต็ม, command/template ชี้กลับ ไม่ duplicate
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/.warnyin/workflow/` + `src/.claude/commands/` + `src/.warnyin/template/` เท่านั้น; **ห้ามแตะ root dogfood** (`.warnyin/`, `.claude/` ที่ root)
- [ ] **กระทัดรัด** (`docs/rule.md` §1) — ต่อยอด §3/§4/§6 เดิม ไม่สร้างกลไกขนาน ไม่บวม
- [ ] **tool-agnostic** (`docs/rule.md` §1) — mechanism เป็น playbook แก่น; command = adapter
- [ ] **ห้ามแตะ docs/rule.md (central)** ตอน BUILD — global bullet note §2 รอ SHIP
- [ ] **investigate-before-edit** (`docs/rule.md` §1) — เข้าใจ §3/§4/§6 เดิม + จุดต่อที่ถูก (ไม่ทับ logic เดิม); **ยืนยันแก้ template ที่ `src/.warnyin/template/` ไม่ใช่ root** (design §9)
- [ ] **ไม่ทำลายของเดิม** — `npm test` 18/18 เขียว + `verify:pack` เขียว (template ติด tarball)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP — promote เข้า `docs/rule.md` §1)
- [ ] rule ที่เสนอ: **continuous-learning discipline** (คู่ "ห้ามเดา" ใน §1) —
  - ความรู้/บทเรียนที่ได้ตอนทำ (BUILD/VERIFY) ไม่ใช่แค่ตอนวางแผน → **จับเป็น learned-rule ที่ SHIP** ด้วย `rule + evidence(บังคับ) + scope` แล้ว **user ยืนยัน** ก่อน promote
  - learned-rule = กฎ **generalize** ไม่ใช่ incident (troubleshooting)
  - เหตุผล: ทำให้ workflow **สะสมความรู้จากการทำจริง** อย่างเป็นระบบ (ยืมแก่น instinct แบบ manual) — เป็นปรัชญาแก่นระดับ global คู่ "ห้ามเดา"; placement: ยืนยันตอน SHIP (`docs/rule.md` §1)
