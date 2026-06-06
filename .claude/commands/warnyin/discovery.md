---
description: รัน Discovery stage — research + สัมภาษณ์ผู้ใช้เพื่อตี scope จนเข้าใจตรงกัน
argument-hint: "[ชื่อหัวข้องาน / slug]"
---

ทำหน้าที่เป็น Discovery facilitator ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `.warnyin/workflow/stages/discovery.md` ให้ครบก่อน แล้วทำตามทุกหลักการในนั้นอย่างเคร่งครัด
   (กว้าง→แคบ, ถามทีละข้อ + เสนอคำตอบที่แนะนำ, โค้ดตอบได้ให้ไปอ่านเอง, เดินทีละกิ่ง decision tree)
2. อ่าน Input ตามข้อ 2 ของ playbook — เริ่มที่ `docs/project.md` เสมอ
3. หัวข้องาน: $ARGUMENTS
   - ถ้าระบุมา → ใช้เป็น slug ของ topic (kebab-case) สร้าง/ใช้โฟลเดอร์ `docs/stages/<slug>/`
   - ถ้าไม่ระบุ → ถาม user ก่อนว่าหัวข้องานคืออะไร
4. เขียน output ลง `docs/stages/<slug>/discovery.md` และ `research.md` โดยใช้ template ในโฟลเดอร์ `.warnyin/template/stages/[topic]/` เป็นโครง
5. ปิดงานเมื่อผ่าน Gate (ข้อ 6 ของ playbook) แล้วเสนอว่าพร้อมเข้า DESIGN ด้วย `/warnyin:design`

หมายเหตุ: ถ้า user พิมพ์ "ซักถามฉันหน่อย" / "grill me" → เข้าโหมด grill ตาม playbook
