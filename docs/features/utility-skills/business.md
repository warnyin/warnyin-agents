# Business — Utility skills

> ความรู้ถาวรระดับ feature · promote จาก topic `skill-format` (achieved 2026-06-07)

## 1. เป้าหมายเชิงธุรกิจ (what & why)
- utility read-only ที่ปลอดภัย (codemap/explore/next) เดิมเรียกมือล้วนผ่าน command — ทำเป็น skill ให้ model **auto-invoke เมื่อ task ตรง** ลดแรงเสียดทานผู้ใช้ Claude Code
- ผูกกับเป้าหมายโปรเจกต์ (`docs/project.md`): เป็น **adapter Claude-specific บาง** ที่ชี้ playbook กลาง — คง tool-agnostic core; ปิด roadmap P1 #9 (ข้อสุดท้าย)

## 2. Persona / ใครได้ประโยชน์
- **ผู้ใช้ Claude Code ปลายทาง** — ได้ utility ที่ทำงานเองเมื่อเหมาะ (เช่น โครงเปลี่ยน → เสนอ refresh codemap) โดยไม่ต้องจำ command
- **ความปลอดภัย:** auto-invoke จำกัดเฉพาะ read-only; งาน irreversible (build/ship) ยัง user-only — ผู้ใช้คุมจังหวะงานที่กระทบไฟล์/branch

## 3. Success metric (วัดผลได้)
- 3 skill ship ครบสาย: ติดตั้ง → ติด tarball → sandbox มี `.claude/skills/*` ครบ; `npm test` + `verify:pack` เขียว (วัดผ่าน VERIFY: 11/11 เคสผ่าน)
- non-breaking: command `/warnyin:*` เดิมทำงานเหมือนเดิม (ไม่ regression)

## 4. ขอบเขตเชิงธุรกิจ / ข้อจำกัด
- **in scope:** 3 utility skill (read-only) + plumbing installer/packaging/test
- **out of scope:** plugin conversion (`/warnyin-agents:*` — breaking), แปลง stage command เป็น skill, event/file-watch auto-trigger (Claude ไม่รองรับ), Codex adapter
- **ข้อจำกัด:** namespace ผสม (skill ไม่มี `warnyin:` prefix) — ยอมรับเพื่อ non-breaking; auto-invoke เฉพาะ read-only safe (คุม blast radius)
