# Rule — add-defensive-rules

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack/project)
- [ ] **single source of truth** (CLAUDE.md) — wording canonical เดียว (design §2) ทุกจุด reference; ไม่ duplicate ความหมาย
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/.warnyin/workflow/` เท่านั้น; ห้ามแตะ root dogfood
- [ ] **กระทัดรัด** (`docs/rule.md` §1) — เพิ่มน้อยบรรทัด ไม่รื้อ §3
- [ ] **ห้ามแตะ docs/rule.md (central)** ตอน BUILD — global bullet note §2 รอ SHIP
- [ ] **ไม่ทำลายของเดิม** — `npm test` 18/18 เขียว

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP — promote เข้า `docs/rule.md` §1)
- [ ] rule ที่เสนอ: **ขยาย "ห้ามเดา" ด้วย 2 enforce rule** —
  - **investigate-before-edit:** ก่อนแก้ไฟล์ที่มีอยู่ ต้องเข้าใจ (ใครใช้/อ่าน, schema/contract, เจตนาเดิม) — แก้แบบไม่เข้าใจ = เดา
  - **config-protection:** ห้ามแก้ config (linter/formatter/test threshold) / disable rule "เพื่อให้ผ่าน" แทนแก้โค้ดจริง; config ผิดจริงแก้ได้ + เหตุผล + note
  - เหตุผล: เป็นรูปธรรมของปรัชญา "ห้ามเดา" (§1) ที่ดัก 2 failure mode บ่อยสุดตอน edit loop — ควรอยู่ระดับ global (ไม่ผูก component) คู่ "ห้ามเดา"
