# CLAUDE.md

repo มาตรฐานกลางของ **ways of work** สำหรับทุกโปรเจกต์ เดินงานผ่าน 5 stage:
`Discovery (optional) ▶ DESIGN ▶ BUILD ▶ VERIFY ▶ SHIP`

## กฎหลัก
- แก่นของแต่ละ stage เป็น single source of truth ที่ `workflow/stages/` — **ทำตาม playbook นั้นเสมอ** ก่อนเริ่มงานใน stage
- อย่า duplicate logic ของ workflow ลงที่อื่น ถ้าต้องแก้พฤติกรรมให้แก้ที่ `workflow/stages/`
- output ของงานจริงเก็บใน `warnyin-stages/<slug>/` (copy จาก template `warnyin-stages/[topic]/`)
- ความรู้ถาวรระดับโปรเจกต์อยู่ใน `docs/` — เริ่มอ่าน `docs/project.md` เสมอใน Discovery

## Slash commands (namespace `warnyin:`)
- `/warnyin:discovery [topic]` → Discovery stage (`.claude/commands/warnyin/discovery.md` → `workflow/stages/discovery.md`)
- `/warnyin:design [slug] [change]` → DESIGN stage (`.claude/commands/warnyin/design.md` → `workflow/stages/design.md`)
- `/warnyin:build [slug]` → BUILD stage — fan-out sub-agent ตาม dependency (`workflow/stages/build.md` + `workflow/scripts/build-wave.mjs`)
- `/warnyin:verify [slug]` → VERIFY stage — strategy tester เทส local env + UXUI แก้จนผ่าน (`workflow/stages/verify.md`)
- `/warnyin:ship` → จะเติมเมื่อ playbook พร้อม

## รองรับหลาย AI
repo นี้ tool-agnostic: Claude Code อ่าน `.claude/` + ไฟล์นี้, ส่วน Codex/Antigravity อ่าน `AGENTS.md`
ทุกเครื่องชี้กลับมาที่ playbook กลางชุดเดียวกันใน `workflow/stages/` — ดูภาพรวมที่ `workflow/README.md`

## สถานะการสร้าง workflow & งานที่เหลือ (resume — อัปเดต 2026-06-04)
สร้างแล้ว: Discovery ✅ · DESIGN ✅ · BUILD ✅ · VERIFY ✅ (playbook + command + template + build-wave.mjs ครบ)

**ค้าง: SHIP stage** — ยังไม่ได้สร้าง (ยังไม่มี `workflow/stages/ship.md`, `.claude/commands/warnyin/ship.md`)
SHIP มีหน้าที่ **promote ความรู้ระดับ topic ขึ้นไฟล์กลาง + archive** (ยืนยัน/ปรับรายละเอียดกับ user ก่อน):
- `warnyin-stages/<slug>/troubleshooting.md` → `docs/troubleshooting.md`
- `warnyin-stages/<slug>/test.md` → `docs/techstack/<component>/test.md`
- rule/standard ใหม่ที่ note ไว้ใน `tasks/*/rule.md`, `*/standard.md` → `docs/techstack/<component>/{rule,standard}.md`
- archive ทั้ง topic → `warnyin-stages/achieved/<YYYY-MM-DD>-<topic>/`

แพทเทิร์นการเติม stage (ทำให้ครบชุด): playbook `workflow/stages/<stage>.md` + command `.claude/commands/warnyin/<stage>.md` + อัปเดตตาราง stage ใน `AGENTS.md`/`CLAUDE.md`/`workflow/README.md` + output template ใน `warnyin-stages/[topic]/`
**สำคัญ: user อธิบายแต่ละ stage เองทีละอัน — รอ user อธิบาย SHIP ก่อนค่อยสร้าง อย่าเดาเอง**
