---
description: ติดตั้ง skill เสริมประจำ role (SA/PO/Developer/QA ฯลฯ) ตามตารางใน .warnyin/workflow/roles/README.md
argument-hint: "[ชื่อ role เช่น sa, qa — เว้นว่าง = ทั้งหมด]"
---

ทำหน้าที่ติดตั้ง skill เสริมประจำ role ของ Warnyin Standard Workflow

1. อ่านตาราง **"Skill เสริมต่อ role"** ใน `.warnyin/workflow/roles/README.md` — นั่นคือ single source of truth ของรายการ skill (**ห้าม hardcode รายการในไฟล์นี้** — แก้รายการให้แก้ที่ตารางนั้น)
2. **เช็คสถานะก่อน:** ตัวไหนติดตั้งแล้วบ้าง — ดูจาก `npx skills ls -g` (ถ้าไม่มีคำสั่งนี้ให้ดูโฟลเดอร์ `~/.agents/skills/` และ `~/.claude/skills/`) — สรุปเป็นตาราง ติดตั้งแล้ว ✅ / ยังไม่ติดตั้ง ⬜
3. ขอบเขต: $ARGUMENTS ระบุ role → เฉพาะ skill ของ role นั้น; เว้นว่าง → ทุกตัวที่ยังไม่ติดตั้ง
4. **ให้ user เลือกก่อนติดตั้ง:** ใช้ AskUserQuestion (multiSelect) แสดงแต่ละตัวพร้อม ที่มา (อ่านจากคอลัมน์ "ที่มา" ของตาราง) + คำเตือนว่าเป็น third-party (ไม่ใช่ official) — **third-party skill/plugin = instruction + script ที่ AI execute ต่อ (prompt-injection surface) ตรวจเนื้อหา (`SKILL.md`/`scripts`) ก่อนติดตั้ง + pin version/commit**
5. **ติดตั้งทีละตัว — install method อ่านจากคอลัมน์ "ที่มา" ของ row นั้น** (ตารางมีหลาย mechanism — อย่า assume แบบเดียว):
   - `owner/repo@skill` (skills.sh) → `npx skills add <owner/repo@skill> -g -y` (global)
   - **Claude plugin** (ที่มาเขียน `/plugin marketplace add ...`) → รัน `/plugin marketplace add <repo>` แล้ว `/plugin install <plugin@marketplace>` ตามที่ระบุ (หรือ CLI สำรองถ้ามี เช่น `uipro-cli`)
   - **repo path / template library** (เช่น `wshobson/agents → plugins/.../`) → ติดตั้ง/clone ตาม path ที่ระบุ (manual; pin commit/tag)
   - **npm CLI tool** (ที่มาเขียน `npm i -g <pkg>` เช่น `@playwright/cli`) → รัน `npm i -g <pkg>@latest` แล้ว **รัน post-install command ที่ระบุต่อ** (เช่น `playwright-cli install --skills` ลง skills ให้ Claude Code); ถ้าติด global ไม่ได้ → fallback `npx <pkg>`
   - ทุกแบบ = **global / reference ไม่ vendor เข้า repo** → รายงานผลรวม สำเร็จ/ล้มเหลว พร้อมวิธีแก้ถ้าล้ม
6. รายการที่เป็น **Claude Code built-in** (`/code-review`, `/security-review`) ไม่ต้องติดตั้ง — แจ้งว่าพร้อมใช้อยู่แล้ว
7. ปิดท้าย: แนะนำว่า role ไหนใน workflow จะหยิบ skill เหล่านี้ใช้ตอนไหน (ตาม section "Skill เสริม" ใน role card)
