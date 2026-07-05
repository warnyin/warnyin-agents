# Standard — design-note

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน playbook markdown

## 1. Standard กลางที่ยึด (จาก docs/rule.md)
- **unify-in-place** — เสริม note ในที่เดิม (§3 item 3 / §4 step 7) ไม่สร้าง section ใหม่
- **canonical-copy** — copy C4 จาก `design.md §2.5` ตรงตัว
- **minimalism** — note สั้น เป็น "why" เสริม ไม่ใช่ mechanism/gate
- **tool-agnostic** — vocab generic

## 2. Pattern การเขียน
- callout `★` สอดรูปแบบ note เดิมของ design.md; ภาษาไทย
- วางกลมกลืน flow เดิม (ต่อจากข้อความ DAG-width/แตก task ที่มีอยู่)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- อ้างวินัยเดิม (vertical-slice §3 item 2, DAG-width §3 item 3) ด้วยถ้อยคำเชื่อม ไม่ทำสำเนา

## 4. เพิ่มเติมเฉพาะ task
- ยืนยัน section จริงก่อนวาง (investigate-before-edit) — §7 = tier ceremony ห้ามวางที่นั่น
