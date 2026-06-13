# Project — @warnyin/agents (Warnyin Standard Workflow)

> ★ จุดเริ่มของ Discovery — AI อ่านไฟล์นี้ก่อนเสมอ

## โปรเจกต์นี้คืออะไร
`@warnyin/agents` = **installer + repo มาตรฐานกลางของ "ways of work"** — Warnyin Standard Workflow ที่เดินงานผ่าน 5 stage (`Discovery (optional) ▶ DESIGN ▶ BUILD ▶ VERIFY ▶ SHIP`) สำหรับนำไปติดตั้งในทุกโปรเจกต์ด้วย `npx @warnyin/agents`
repo นี้ใช้สถาปัตยกรรม **bootstrap / self-hosting**: source ของ workflow v-next อยู่ใน `src/` (publish) ส่วน root ติดตั้ง release เสถียรไว้ dogfood (gitignored)

## เป้าหมาย / success metric
- ติดตั้งลงโปรเจกต์ปลายทางแล้ว `/warnyin:*` ใช้ได้ครบ 5 stage โดยไม่ต้องตั้งค่าเพิ่ม
- zero-dependency + cross-platform (node ≥20, Windows/mac/linux)
- publish แล้ว payload (`.warnyin/`, `.claude/`) ติดครบ + tooling/docs ไม่หลุด (verify-pack เป็น gate)

## ลูกค้า / ผู้ใช้หลัก (persona)
- **ผู้ใช้ปลายทาง:** ทีม/นักพัฒนาที่ติดตั้ง workflow ลงโปรเจกต์ตัวเอง (`npx @warnyin/agents`)
- **contributor / maintainer:** ผู้พัฒนา v-next ของ workflow เองใน `src/` (ดู `CONTRIBUTING.md`)

## ขอบเขต
- **in:** installer (`src/bin/cli.mjs`), playbook 5 stage (`src/.warnyin/workflow/`), template, slash command + utility skill (auto-invocable) + reviewer agent + generator agent (UX wireframe), dev tooling (test/verify-pack/setup scripts)
- **out (จงใจไม่ทำ):** runtime ของ workflow เอง (เป็นเอกสาร/playbook ที่ AI agent อ่าน ไม่ใช่โปรแกรมที่รัน), dependency ภายนอก (zero-dep)

## ข้อจำกัด / บริบทสำคัญ
- **zero-dependency** — ใช้เฉพาะ built-in `node:*`
- **cross-platform** — รองรับ Windows/mac/linux (path.join, os.tmpdir, ระวัง npx/.cmd shim บน Windows)
- **2-layer bootstrap** — `src/` (source, committed) ↔ root (dogfood, gitignored) แยกขาดกัน
- รายละเอียด rule/standard: `docs/rule.md`, `docs/techstack/installer/`
