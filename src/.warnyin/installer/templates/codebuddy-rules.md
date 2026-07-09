---
description: Warnyin Standard Workflow — 5-stage ways of work (Discovery/DESIGN/BUILD/VERIFY/SHIP). Use when working on any project that has .warnyin/ directory, or when user mentions warnyin, /warnyin:, discovery, design, build, verify, ship stages.
alwaysApply: true
enabled: true
updatedAt: 2026-07-09T00:00:00.000Z
provider: 
---

<!-- warnyin:codebuddy -->
<system_reminder>
This project uses **Warnyin Standard Workflow** — มาตรฐานกลางของ ways of work เดินงานผ่าน 5 stage:
`Discovery (optional) ▶ DESIGN ▶ BUILD ▶ VERIFY ▶ SHIP`

## กฎหลัก
- แก่นของแต่ละ stage เป็น single source of truth ที่ `.warnyin/workflow/stages/` — **ทำตาม playbook นั้นเสมอ** ก่อนเริ่มงานใน stage
- อย่า duplicate logic ของ workflow ลงที่อื่น ถ้าต้องแก้พฤติกรรมให้แก้ที่ `.warnyin/workflow/stages/`
- output ของงานจริงเก็บใน `docs/stages/<slug>/` (copy จาก template `.warnyin/template/stages/[topic]/`)
- ความรู้ถาวรระดับโปรเจกต์อยู่ใน `docs/` — เริ่มอ่าน `docs/project.md` เสมอใน Discovery

## Slash commands (namespace `warnyin:`)
- `/warnyin:init` → วิเคราะห์โปรเจกต์ + เติม `docs/` ครั้งแรกหลังติดตั้ง (`.warnyin/workflow/init.md`)
- `/warnyin:install-skill [role]` → ติดตั้ง skill เสริมประจำ role
- `/warnyin:update-codemaps` → สแกนโครงสร้าง + สร้าง/อัปเดต codemap
- `/warnyin:explore [คำถาม]` → สำรวจ/ตอบคำถามแบบ read-only
- `/warnyin:next [slug]` → เช็คงานค้าง + แนะนำ command ถัดไป
- `/warnyin:triage [คำอธิบาย change]` → ประเมินขนาด + แนะนำ path
- `/warnyin:discovery [topic]` → Discovery stage
- `/warnyin:design [slug] [change]` → DESIGN stage
- `/warnyin:build [slug]` → BUILD stage
- `/warnyin:verify [slug]` → VERIFY stage
- `/warnyin:ship [slug]` → SHIP stage

ทุก command ชี้กลับมาที่ playbook กลางชุดเดียวกันใน `.warnyin/workflow/stages/` — ดูภาพรวมที่ `.warnyin/workflow/README.md`
</system_reminder>
