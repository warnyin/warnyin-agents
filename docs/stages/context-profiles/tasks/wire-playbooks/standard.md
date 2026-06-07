# Standard — wire-playbooks

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การแก้ playbook เดิม — แตะน้อยที่สุด ไม่กระทบ logic

## 1. Standard กลางที่ยึด
- **single source of truth** (CLAUDE.md) — callout **ชี้ไป** context ไม่ copy เนื้อหา context มาใน playbook
- **กระทัดรัด** (`docs/rule.md` §1) — เพิ่ม **1 บรรทัด** (design.md เพิ่มได้ 1 บรรทัดที่กล่าว 2 context) ต่อ playbook; ไม่รื้อโครงเดิม
- **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ใน `src/.warnyin/workflow/` เท่านั้น

## 2. Pattern การเขียนของ task นี้
- **ตำแหน่งแทรก:** ใต้ blockquote title (บรรทัด `> ...` ชุดหัวไฟล์) ก่อน `---` หรือ section แรก — สม่ำเสมอทุกไฟล์
- **รูปแบบ callout:** `> **Context profile:** ...` (blockquote bold label) — เลียน pattern callout ที่ playbook ใช้อยู่
- **ลิงก์:** relative `.warnyin/workflow/contexts/<name>.md` (ตรงกับที่ author-contexts สร้าง)
- **idempotent ทางความหมาย:** ถ้า playbook มี callout อยู่แล้ว (เช่นรันซ้ำ) → ไม่เพิ่มซ้ำ

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- ชื่อ context + mapping มาจาก `tasks/author-contexts` (design.md §4) — อย่าตั้งชื่อใหม่
- README tree: แก้เฉพาะบรรทัดที่เพิ่ม `contexts/` — ไม่แตะบรรทัดอื่น

## 4. เพิ่มเติมเฉพาะ task
- ถ้าพบว่า callout ควรมี wording กลางมาตรฐาน → wording ใน design.md §4 เป็น canonical, ใช้ตรงนั้น (ไม่คิดใหม่ต่อไฟล์)
