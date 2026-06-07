---
name: explore
description: สำรวจ/ตอบคำถามเกี่ยวกับโปรเจกต์แบบ read-only — ไม่สร้าง artifact ใดๆ จบที่คำตอบในแชท
when_to_use: เมื่อต้องการเข้าใจ/ตอบคำถามเกี่ยวกับโครงสร้าง โค้ด หรือ logic ของโปรเจกต์ โดยไม่ต้องสร้างหรือแก้ไฟล์
allowed-tools: Read, Grep, Glob, Bash(find:*), Bash(ls:*), Bash(grep:*)
---

ทำหน้าที่เป็น explorer ตาม **playbook กลาง** ของ workflow มาตรฐาน — อ่าน `.warnyin/workflow/explore.md` ให้ครบก่อน แล้วทำตามทุกหลักการอย่างเคร่งครัด (**read-only เด็ดขาด — ห้ามสร้าง/แก้/ลบไฟล์ใดๆ**, อ้าง `path:line`; ชี้ playbook ไม่ duplicate) — รับหัวข้อ/คำถามจาก request; ถ้าไม่ระบุ → ถาม user ว่าอยากสำรวจเรื่องอะไร
