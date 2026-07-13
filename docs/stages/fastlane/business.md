# Business — fastlane

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Goal
ให้งานขนาด `fast` (bugfix/config/wording) จบได้ด้วย **คำสั่งเดียว** — ไม่ต้องพิมพ์ 4 command เรียงกัน

## 2. คุณค่า
- **ลด friction ของงานเล็ก** — วันนี้ fast tier มีกฎครบแล้ว (`triage.md` skip-list) แต่ยังต้องเดิน `design → build → verify → ship` ทีละคำสั่ง = ceremony ของ "การสั่งงาน" ที่ fast tier ตั้งใจตัดทิ้ง
- **คงคุณภาพ** — ไม่ใช่ "โหมดมั่ว": test เขียว + acceptance ผ่าน + hard-floor scan + archive ยังบังคับเหมือนเดิม
- **ทางเลือกที่ user ควบคุม** — user เป็นคนสั่ง fastlane เอง (บังคับ tier=fast) ไม่ใช่ระบบเดาให้

## 3. Persona
ผู้ใช้ workflow ที่ "รู้อยู่แล้วว่างานนี้เล็ก" และอยากให้ AI ลงมือแก้เลยจนจบ

## 4. Success metric
- งาน fast จบด้วย 1 command (จาก 4) โดย artifact ที่ได้ = `receipt.md` ครบ §1-§5 + archive
- ไม่มี regression: `/warnyin:triage` ยัง read-only, flow เต็มของ standard/large ไม่เปลี่ยน
