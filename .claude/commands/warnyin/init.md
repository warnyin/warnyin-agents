---
description: รัน INIT — วิเคราะห์โปรเจกต์ที่มีอยู่ แล้วเติม docs/ (project, techstack, codemap, infra) ครั้งแรกหลังติดตั้ง
---

ทำหน้าที่เป็นผู้วิเคราะห์โปรเจกต์ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `warnyin/workflow/init.md` ให้ครบก่อน แล้วทำตามทุกหลักการอย่างเคร่งครัด
2. **สแกนภาพรวม repo:** โครงสร้าง, manifest, ภาษา/framework → ระบุว่าแบ่งเป็น component อะไรบ้าง
3. **วิเคราะห์ลึกต่อ component แบบขนาน:** fan-out sub-agent (Agent tool, read-only) หนึ่งตัวต่อหนึ่ง component — โครงสร้าง, pattern/convention ที่ใช้จริง, วิธี build/test; วิเคราะห์ infra จาก config จริง (docker/compose, env, scripts)
4. **ข้อมูลธุรกิจที่โค้ดตอบไม่ได้** (เป้าหมาย, ลูกค้า, ขอบเขต) → สัมภาษณ์ user โดย**สวม BA + PO lens** (`warnyin/workflow/roles/ba.md` + `po.md`) ใช้ checklist ของทั้งสองเป็นชุดคำถาม — **ถามทีละข้อ + เสนอคำตอบแนะนำทุกครั้ง** (ใช้ README/โค้ดเป็น recommended, ถามเฉพาะที่ยังขาดหาย); เป็น lens ของ AI หลัก **ห้าม fan-out sub-agent มาสัมภาษณ์**; กฎใน `rule.md` → ถาม user ห้ามเดา
5. **เสนอ summary** (สิ่งที่วิเคราะห์ได้ + รายการไฟล์ docs/ ที่จะเขียน) → ขอ user ยืนยัน**ครั้งเดียว** → เขียน/เติมไฟล์ตามตาราง Output ข้อ 4 ของ playbook — **ไฟล์ที่มีเนื้อหาอยู่แล้วให้เติม ไม่เขียนทับทิ้ง**
6. **รายงานปิดท้าย:** ส่วนที่ยังว่าง/ไม่แน่ใจ (ระบุ "ยังว่าง รอเติม" ในไฟล์ ห้ามแต่งขึ้นเอง) → เสนอเริ่มงานแรกด้วย `/warnyin:discovery` หรือ `/warnyin:design`
