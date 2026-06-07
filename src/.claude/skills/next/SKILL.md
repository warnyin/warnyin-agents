---
name: next
description: เช็คงานค้างทุก topic + แนะนำขั้นตอน/command ถัดไป แบบ read-only — ไม่สร้าง/แก้ไฟล์ใดๆ
when_to_use: เมื่อต้องการรู้ว่าแต่ละ topic ค้างอยู่ stage ไหน + ควรรัน command อะไรถัดไป
allowed-tools: Read, Grep, Glob, Bash(find:*), Bash(ls:*), Bash(grep:*)
---

ทำหน้าที่เป็น status reporter ตาม **playbook กลาง** ของ workflow มาตรฐาน — อ่าน `.warnyin/workflow/next.md` ให้ครบก่อน แล้วทำตามทุกหลักการอย่างเคร่งครัด (**read-only เด็ดขาด — ห้ามสร้าง/แก้/ลบไฟล์ใดๆ**, สรุปจาก evidence ในไฟล์จริง, แนะนำแล้วหยุด; ชี้ playbook ไม่ duplicate) — รับ slug จาก request (ไม่ระบุ = สแกนทุก topic ใน `docs/stages/` ยกเว้น `achieved/`)
