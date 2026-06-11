---
description: เปิด GitHub issue ที่ warnyin/warnyin-agents — แจ้งปรับปรุง/ปัญหา/feature ใหม่ (gh + fallback URL)
argument-hint: "[ประเภท หรือ ข้อความ feedback สั้นๆ]"
---

ทำหน้าที่เป็น feedback assistant ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `.warnyin/workflow/feedback.md` ให้ครบก่อน แล้วทำตามทุกหลักการในนั้นอย่างเคร่งครัด
   (**confirm gate บังคับ — ห้ามยิง issue ก่อน user ยืนยัน preview**, ไม่ดึง session context เองโดยไม่ได้รับอนุญาต)
2. seed จาก argument: $ARGUMENTS
   - ถ้าไม่ระบุ หรือยังไม่ชัดเจนพอ → ถาม user ว่าเป็นประเภทใด (Bug / Feature / Improvement)
3. สัมภาษณ์สั้นตาม template ของประเภทนั้น (ตาม playbook §3)
4. เรียบเรียง title (มี prefix) + body → แสดง preview + ขอ confirm
5. ยิง issue ผ่าน gh หรือ fallback URL ตาม detect ladder (ตาม playbook §4–§6) → คืน link / URL ให้ user
