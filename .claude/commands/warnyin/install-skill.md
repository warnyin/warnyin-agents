---
description: ติดตั้ง skill เสริมประจำ role (SA/PO/Developer/QA ฯลฯ) ตามตารางใน .warnyin/workflow/roles/README.md
argument-hint: "[ชื่อ role เช่น sa, qa — เว้นว่าง = ทั้งหมด]"
---

ทำหน้าที่ติดตั้ง skill เสริมประจำ role ของ Warnyin Standard Workflow

1. อ่านตาราง **"Skill เสริมต่อ role"** ใน `.warnyin/workflow/roles/README.md` — นั่นคือ single source of truth ของรายการ skill (**ห้าม hardcode รายการในไฟล์นี้** — แก้รายการให้แก้ที่ตารางนั้น)
2. **เช็คสถานะก่อน:** ตัวไหนติดตั้งแล้วบ้าง — ดูจาก `npx skills ls -g` (ถ้าไม่มีคำสั่งนี้ให้ดูโฟลเดอร์ `~/.agents/skills/` และ `~/.claude/skills/`) — สรุปเป็นตาราง ติดตั้งแล้ว ✅ / ยังไม่ติดตั้ง ⬜
3. ขอบเขต: $ARGUMENTS ระบุ role → เฉพาะ skill ของ role นั้น; เว้นว่าง → ทุกตัวที่ยังไม่ติดตั้ง
4. **ให้ user เลือกก่อนติดตั้ง:** ใช้ AskUserQuestion (multiSelect) แสดงแต่ละตัวพร้อม ที่มา (`owner/repo@skill`) + คำเตือนว่าเป็น third-party (ไม่ใช่ official, ตรวจเนื้อหาได้ที่ skills.sh)
5. **ติดตั้งทีละตัว:** `npx skills add <owner/repo@skill> -g -y` (global — reference ไม่ vendor เข้า repo) → รายงานผลรวม สำเร็จ/ล้มเหลว พร้อมวิธีแก้ถ้าล้ม
6. รายการที่เป็น **Claude Code built-in** (`/code-review`, `/security-review`) ไม่ต้องติดตั้ง — แจ้งว่าพร้อมใช้อยู่แล้ว
7. ปิดท้าย: แนะนำว่า role ไหนใน workflow จะหยิบ skill เหล่านี้ใช้ตอนไหน (ตาม section "Skill เสริม" ใน role card)
