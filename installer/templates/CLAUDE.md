# CLAUDE.md

โปรเจกต์นี้ใช้ **Warnyin Standard Workflow** — มาตรฐานกลางของ ways of work เดินงานผ่าน 5 stage:
`Discovery (optional) ▶ DESIGN ▶ BUILD ▶ VERIFY ▶ SHIP`

## กฎหลัก
- แก่นของแต่ละ stage เป็น single source of truth ที่ `warnyin/workflow/stages/` — **ทำตาม playbook นั้นเสมอ** ก่อนเริ่มงานใน stage
- อย่า duplicate logic ของ workflow ลงที่อื่น ถ้าต้องแก้พฤติกรรมให้แก้ที่ `warnyin/workflow/stages/`
- output ของงานจริงเก็บใน `warnyin/stages/<slug>/` (copy จาก template `warnyin/template/stages/[topic]/`)
- ความรู้ถาวรระดับโปรเจกต์อยู่ใน `docs/` — เริ่มอ่าน `docs/project.md` เสมอใน Discovery

## Slash commands (namespace `warnyin:`)
- `/warnyin:init` → วิเคราะห์โปรเจกต์ + เติม `docs/` ครั้งแรกหลังติดตั้ง (`warnyin/workflow/init.md`)
- `/warnyin:install-skill [role]` → ติดตั้ง skill เสริมประจำ role (รายการ: `warnyin/workflow/roles/README.md`)
- `/warnyin:discovery [topic]` → Discovery stage (`warnyin/workflow/stages/discovery.md`)
- `/warnyin:design [slug] [change]` → DESIGN stage (`warnyin/workflow/stages/design.md`)
- `/warnyin:build [slug]` → BUILD stage — fan-out sub-agent ตาม dependency (`warnyin/workflow/stages/build.md` + `warnyin/workflow/scripts/build-wave.mjs`)
- `/warnyin:verify [slug]` → VERIFY stage — strategy tester เทส local env + UXUI แก้จนผ่าน (`warnyin/workflow/stages/verify.md`)
- `/warnyin:ship [slug]` → SHIP stage — ส่งมอบ: promote ความรู้ขึ้น `docs/` + archive topic (`warnyin/workflow/stages/ship.md`)

## รองรับหลาย AI
Claude Code อ่าน `.claude/` + ไฟล์นี้, ส่วน Codex/Antigravity อ่าน `AGENTS.md`
ทุกเครื่องชี้กลับมาที่ playbook กลางชุดเดียวกันใน `warnyin/workflow/stages/` — ดูภาพรวมที่ `warnyin/workflow/README.md`

## อัปเดต workflow
`npx @warnyin/agents --update` — เขียนทับเฉพาะ playbook กลาง (`warnyin/workflow/`, `.claude/commands/warnyin/`, template `warnyin/template/stages/[topic]/`) ไม่แตะ `docs/` และงานจริงใน `warnyin/stages/`
