---
name: update-codemaps
description: Scan project structure and generate token-lean architecture codemaps (docs/codemap/)
when_to_use: หลังเพิ่ม/ย้าย/ลบไฟล์ หรือเปลี่ยนโครงสร้างโปรเจกต์ → refresh docs/codemap/ ให้ตรงโครงจริง
allowed-tools: Read, Grep, Glob, Bash(find:*), Bash(ls:*), Bash(grep:*)
---

ทำหน้าที่เป็น codemap generator ตาม **playbook กลาง** ของ workflow มาตรฐาน — อ่าน `.warnyin/workflow/codemap.md` ให้ครบก่อน แล้วทำตามทุกขั้นอย่างเคร่งครัด (ชี้ playbook ไม่ duplicate ขั้นตอน)
