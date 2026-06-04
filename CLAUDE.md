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
- `/warnyin:ship [slug]` → SHIP stage — ส่งมอบ: promote ความรู้ขึ้น `docs/` + archive topic (`workflow/stages/ship.md`)

## รองรับหลาย AI
repo นี้ tool-agnostic: Claude Code อ่าน `.claude/` + ไฟล์นี้, ส่วน Codex/Antigravity อ่าน `AGENTS.md`
ทุกเครื่องชี้กลับมาที่ playbook กลางชุดเดียวกันใน `workflow/stages/` — ดูภาพรวมที่ `workflow/README.md`

## สถานะการสร้าง workflow (อัปเดต 2026-06-04)
ครบทั้ง 5 stage: Discovery ✅ · DESIGN ✅ · BUILD ✅ · VERIFY ✅ · SHIP ✅
(playbook + command + template + build-wave.mjs ครบทุก stage)

แพทเทิร์นการเติม/แก้ stage: playbook `workflow/stages/<stage>.md` + command `.claude/commands/warnyin/<stage>.md` + อัปเดตตาราง stage ใน `AGENTS.md`/`CLAUDE.md`/`workflow/README.md` + output template ใน `warnyin-stages/[topic]/`
**สำคัญ: การเปลี่ยนพฤติกรรม stage ใดๆ ให้ user เป็นคนอธิบาย/ยืนยันก่อน อย่าเดาเอง**
