# Standard — dag-width-toolkit

## 1. Standard กลางที่ยึด
- `docs/rule.md` §1: **กระทัดรัด opinionated** (ห้ามไหลเป็น catalog), **unify-in-place** (ขยายหลักการ/gate เดิม), **canonical-copy** (wording นิยามที่ topic design.md → copy)
- สไตล์ playbook เดิม: callout `>` ใต้ title, หัวข้อ §-numbered, ภาษาไทย กระชับ

## 2. Pattern การเขียน
- ขยาย principle/checklist/gate-item **ในที่เดิม** — ให้ของเก่ากลายเป็น subset ของข้อที่ขยาย ไม่เพิ่มข้อใหม่ขนาน
- toolkit 3A = optional technique (ไม่ใช่ gate); critical-path 3B = judgment gate (ไม่ใช่ mechanical validate-topic)

## 3. Shared component / ที่มีอยู่แล้ว (reuse)
- tech-lead.md checklist เดิม "task ใน wave เดียวกัน parallel ได้จริง — ไม่ชนไฟล์" + "spec ครบในตัว" = จุดขยาย (อย่าเขียน checklist ใหม่)
- design.md §3 ข้อ 2 (vertical slice) + §3 ข้อ 3 (task self-contained) = จุดขยาย

## 4. เพิ่มเติมเฉพาะ task
- คงนิยาม vertical slice เดิม 100% — toolkit เสริม "เมื่อ slice ผูกกันด้วย runtime ไม่ใช่ contract"
