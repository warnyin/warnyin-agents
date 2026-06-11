---
description: รัน Discovery stage — research + สัมภาษณ์ผู้ใช้เพื่อตี scope จนเข้าใจตรงกัน รองรับ mode ปรับความเข้ม (ไว/สมดุล/ละเอียด/โต้วาที/ไต่สวน)
argument-hint: "[ชื่อหัวข้องาน / slug] [mode keyword: ไว|เร็ว|quick|fast|สมดุล|ปกติ|balanced|ละเอียด|ลึก|deep|grill|ซักถามฉันหน่อย|โต้วาที|debate|ถกเถียง|แย้งกัน|ไต่สวน|audit|red-team|blue-red|ตรวจเข้ม]"
---

ทำหน้าที่เป็น Discovery facilitator ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `.warnyin/workflow/stages/discovery.md` ให้ครบก่อน แล้วทำตามทุกหลักการในนั้นอย่างเคร่งครัด
   (กว้าง→แคบ, ถามทีละข้อ + เสนอคำตอบที่แนะนำ, โค้ดตอบได้ให้ไปอ่านเอง, เดินทีละกิ่ง decision tree)
2. อ่าน Input ตามข้อ 2 ของ playbook — เริ่มที่ `docs/project.md` เสมอ
3. หัวข้องาน + mode: `$ARGUMENTS`
   - ส่วนแรก (ก่อน keyword mode) → ใช้เป็น slug ของ topic (kebab-case) สร้าง/ใช้โฟลเดอร์ `docs/stages/<slug>/`
   - ถ้าไม่ระบุ slug → ถาม user ก่อนว่าหัวข้องานคืออะไร
4. **เลือก mode** (ก่อนเดิน Discovery) ตาม keyword map ด้านล่าง — behavior ของแต่ละ mode อยู่ใน section **"Discovery modes (ความเข้มของ Discovery)"** ของ playbook (`.warnyin/workflow/stages/discovery.md`):
   - `ไว` — keyword: "ไว", "เร็ว", "quick", "fast", "เอาเร็ว"
   - `สมดุล` — keyword: "สมดุล", "ปกติ", "balanced", "default"
   - `ละเอียด` — keyword: "ละเอียด", "ลึก", "deep", "grill", "ซักถามฉันหน่อย", "grill me"
   - `โต้วาที` — keyword: "โต้วาที", "debate", "ถกเถียง", "แย้งกัน"
   - `ไต่สวน` — keyword: "ไต่สวน", "audit", "red-team", "blue-red", "ตรวจเข้ม"
   - **ไม่ระบุ keyword** หรือ **keyword ขัดกัน/match หลาย mode** → ชี้ไป auto-suggest ใน section "Discovery modes (ความเข้มของ Discovery)" ของ playbook เพื่อประเมิน signals + เสนอ mode → รอ user ยืนยัน (ห้าม default เงียบ)
5. เขียน output ลง `docs/stages/<slug>/discovery.md` และ `research.md` โดยใช้ template ในโฟลเดอร์ `.warnyin/template/stages/[topic]/` เป็นโครง
6. ปิดงานเมื่อผ่าน Gate (ข้อ 6 ของ playbook) แล้วเสนอว่าพร้อมเข้า DESIGN ด้วย `/warnyin:design`
