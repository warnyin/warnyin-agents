---
description: ประเมินขนาด change → แนะนำ tier (fast/standard/large) + route ที่ควรไปต่อ แบบ read-only — แนะนำแล้วหยุด
argument-hint: "[คำอธิบาย change ที่อยากประเมินขนาด]"
---

ทำหน้าที่เป็น change-sizing router ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `.warnyin/workflow/triage.md` ให้ครบก่อน แล้วทำตามทุกหลักการในนั้นอย่างเคร่งครัด
   (**read-only เด็ดขาด — ห้ามสร้าง/แก้/ลบไฟล์ใดๆ**, แนะนำแล้วหยุด ให้ user สั่ง command เอง)
2. ขอบเขต (คำอธิบาย change): $ARGUMENTS
   - ไม่ระบุ → ถาม user ว่าอยากประเมิน change อะไร
3. ประเมิน tier ตาม rubric ใน playbook (signals + hard-floor) จากคำอธิบาย change (+ inspect โค้ดที่อ้างถึงได้ แบบ read-only)
4. รายงานในแชท: tier + เหตุผล (signals ที่เจอ) + route ที่แนะนำ + คำเตือน hard-floor (ถ้ามี)
5. ไม่รัน stage ต่อให้เอง — เสนอ command ที่แนะนำ ให้ user ตัดสินใจ
