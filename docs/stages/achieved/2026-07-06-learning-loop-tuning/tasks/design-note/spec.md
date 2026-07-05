# Spec — design-note

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้

## 1. ชนิดของ task
`docs` (playbook markdown edit — THEN = observable artifact)

---

## 6. Persona
agent (ทุก harness) ตอนแตก task ใน DESIGN — อ่าน note เพื่อตระหนักผลของ decomposition ต่อ solution ที่เอื้อมถึง

## 7. Test-flow (assert observable artifact ใน `src/`)
- [ ] grep note "★ starting-artifact" เจอใน `src/.warnyin/workflow/stages/design.md`
- [ ] อยู่ใกล้ §3 item 3 (DAG-width) หรือ §4 step 7 (แตก tasks) — **ไม่ใช่ §7** (tier ceremony)
- [ ] เนื้อหา: decomposition (1 task vs หลาย slice) + starting spec กำหนด solution ที่ BUILD เอื้อมถึง + ระบุ "เสริมวินัยเดิม ไม่ใช่ knob ใหม่"
- [ ] ไม่เพิ่ม gate item ใน design §8 (diff gate checklist คงเดิม)
- [ ] กระชับ (≤ ~4 บรรทัด) สอด minimalism
