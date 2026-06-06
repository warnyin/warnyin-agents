---
description: เช็คงานค้างทุก topic + แนะนำขั้นตอน/command ถัดไป แบบ read-only — ไม่สร้าง/แก้ไฟล์ใดๆ
argument-hint: "[slug (optional — ไม่ระบุ = สแกนทุก topic)]"
---

ทำหน้าที่เป็น status reporter ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `.warnyin/workflow/next.md` ให้ครบก่อน แล้วทำตามทุกหลักการในนั้นอย่างเคร่งครัด
   (**read-only เด็ดขาด — ห้ามสร้าง/แก้/ลบไฟล์ใดๆ**, สรุปจาก evidence ในไฟล์จริง, แนะนำแล้วหยุด)
2. ขอบเขต: $ARGUMENTS
   - ระบุ slug → เช็คเฉพาะ `docs/stages/<slug>/`
   - ไม่ระบุ → สแกนทุก topic ใน `docs/stages/` (ยกเว้น `achieved/`)
3. ต่อ topic: ระบุ stage ปัจจุบันจาก artifact ที่ถูกเติมจริง (ไฟล์ที่ยังเป็นโครง template = ยังไม่ทำ)
   + ไล่ gate ของ playbook stage นั้น + สถานะ task ใน `tasks/*/task.md`
4. รายงานในแชท: ตารางภาพรวม (topic · stage · งานค้าง · command ถัดไป) + รายละเอียดงานค้าง + ลำดับงานที่แนะนำ
5. ไม่รัน stage ต่อให้เอง — เสนอ command ให้ user ตัดสินใจ
