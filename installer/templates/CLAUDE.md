# CLAUDE.md

โปรเจกต์นี้ใช้ **Warnyin Standard Workflow** — มาตรฐานกลางของ ways of work เดินงานผ่าน 5 stage:
`Discovery (optional) ▶ DESIGN ▶ BUILD ▶ VERIFY ▶ SHIP`

## กฎหลัก
- แก่นของแต่ละ stage เป็น single source of truth ที่ `workflow/stages/` — **ทำตาม playbook นั้นเสมอ** ก่อนเริ่มงานใน stage
- อย่า duplicate logic ของ workflow ลงที่อื่น ถ้าต้องแก้พฤติกรรมให้แก้ที่ `workflow/stages/`
- output ของงานจริงเก็บใน `warnyin-stages/<slug>/` (copy จาก template `warnyin-stages/[topic]/`)
- ความรู้ถาวรระดับโปรเจกต์อยู่ใน `docs/` — เริ่มอ่าน `docs/project.md` เสมอใน Discovery

## Slash commands (namespace `warnyin:`)
- `/warnyin:init` → วิเคราะห์โปรเจกต์ + เติม `docs/` ครั้งแรกหลังติดตั้ง (`workflow/init.md`)
- `/warnyin:install-skill [role]` → ติดตั้ง skill เสริมประจำ role (รายการ: `workflow/roles/README.md`)
- `/warnyin:discovery [topic]` → Discovery stage (`workflow/stages/discovery.md`)
- `/warnyin:design [slug] [change]` → DESIGN stage (`workflow/stages/design.md`)
- `/warnyin:build [slug]` → BUILD stage — fan-out sub-agent ตาม dependency (`workflow/stages/build.md` + `workflow/scripts/build-wave.mjs`)
- `/warnyin:verify [slug]` → VERIFY stage — strategy tester เทส local env + UXUI แก้จนผ่าน (`workflow/stages/verify.md`)
- `/warnyin:ship [slug]` → SHIP stage — ส่งมอบ: promote ความรู้ขึ้น `docs/` + archive topic (`workflow/stages/ship.md`)

## รองรับหลาย AI
Claude Code อ่าน `.claude/` + ไฟล์นี้, ส่วน Codex/Antigravity อ่าน `AGENTS.md`
ทุกเครื่องชี้กลับมาที่ playbook กลางชุดเดียวกันใน `workflow/stages/` — ดูภาพรวมที่ `workflow/README.md`

## อัปเดต workflow
`npx @warnyin/agents --update` — เขียนทับเฉพาะ playbook กลาง (`workflow/`, `.claude/commands/warnyin/`, template `warnyin-stages/[topic]/`) ไม่แตะ `docs/` และงานจริงใน `warnyin-stages/`
