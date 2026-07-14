# Business — Fastlane

> ความรู้ถาวรระดับ feature · promote จาก topic `fastlane` (achieved 2026-07-14)

## 1. Goal
ให้งานขนาด `fast` (bugfix/config/wording) จบได้ด้วย **คำสั่งเดียว** — ไม่ต้องพิมพ์ 4 command เรียงกัน

## 2. คุณค่า
- **ลด friction ของงานเล็ก** — fast tier มีกฎครบแล้ว (`triage.md` skip-list) แต่ยังต้องเดิน `design → build → verify → ship` ทีละคำสั่ง = ceremony ของ "การสั่งงาน" ที่ fast tier ตั้งใจตัดทิ้ง
- **คงคุณภาพ** — ไม่ใช่ "โหมดมั่ว": test เขียว + acceptance ผ่าน + hard-floor scan + archive ยังบังคับเหมือนเดิม
- **ทางเลือกที่ user ควบคุม** — user เป็นคนสั่ง fastlane เอง (บังคับ tier=fast) ไม่ใช่ระบบเดาให้

## 3. Persona
ผู้ใช้ workflow ที่ "รู้อยู่แล้วว่างานนี้เล็ก" และอยากให้ AI ลงมือแก้เลยจนจบ

## 4. ขอบเขตเชิงธุรกิจ / ข้อจำกัด
- **in scope:** `/warnyin:fastlane` (executor บังคับ fast, user-invoked) · pre-flight hard-floor gate + acceptance ก่อนแตะโค้ด · code-first loop (cap 3 รอบ) · ship-lite + archive · hard-floor explicit override (2 ชั้น + audit trail)
- **out of scope:** auto-invoke (stateful/irreversible → command-only) · แตะ git (branch/commit/worktree) · เปลี่ยน rubric/caps/skip-list 4 row ของ fast tier (แก้เฉพาะเงื่อนไข hard-floor override) · ทำให้ `/warnyin:triage` auto-execute
- **ข้อจำกัด:** payload `.md` + 1 command (adapter บางชี้ playbook) — zero-dep, tool-agnostic; executor ไม่ตั้งกฎใหม่ (reuse canonical skip-list); one-shot จบด้วย archive = irreversible → gate ต้องเขียวก่อนเท่านั้น

## 5. Success metric
- งาน fast จบด้วย 1 command (จาก 4) โดย artifact ที่ได้ = `receipt.md` ครบ §1-§5 + archive
- ไม่มี regression: `/warnyin:triage` ยัง read-only, flow เต็มของ standard/large ไม่เปลี่ยน, skip-list 4 row เดิมไม่พัง
