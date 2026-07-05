# Business — Learning Loop Tuning guidance

> คุณค่าเชิงธุรกิจของ feature · promote จาก topic `learning-loop-tuning` (achieved 2026-07-06)

## Goal
ลดความ "เดา" ในการเดิน fix loop ของ AI agent (BUILD/VERIFY) — ให้ตัดสิน credit-horizon + experience-batching ตามโครงเหตุ-ผลของงาน แทนพฤติกรรม default ที่ฝังไว้ โดยไม่เพิ่ม config และไม่เพิ่ม dependency

## คุณค่า
- **ลด fix churn** — กันพฤติกรรม "แก้จุดหนึ่งพังอีกจุด" (credit-horizon สั้นเกิน update ถี่เกิน) และ "อัด failure ทั้งหมดเป็นก้อนเดียว" (batch ใหญ่ ≠ ดีกว่า) ที่ paper ชี้ว่าทำให้ generative optimization เปราะ
- **ปิดช่องว่างของ warnyin เอง** — warnyin codify "โครงสร้าง 5 stage" ดีแล้ว แต่ "ปุ่มปรับ loop" ยังฝัง/เดาเอง; feature นี้ทำให้ปุ่มนั้น explicit ผูก tier
- **ของฟรีทุก install** — ship ใน playbook กลาง สอดเป้าหมาย "ติดตั้งแล้ว ways of work ใช้ได้ครบ ไม่ตั้งค่าเพิ่ม"

## Persona
- **build sub-agent / BUILD orchestrator** — เดิน full-gate fix loop → ได้ guidance เลือก horizon+batching
- **VERIFY session** — เดิน "แก้จนผ่าน" loop → ได้ guidance เดียวกัน + guard ไม่ลด correctness
- **DESIGN architect** — ได้ starting-artifact note ตอนหั่น task
- **ทุกทีม/โปรเจกต์ที่ `npx @warnyin/agents`**

## Success metric
- guidance (C1–C4) เป็น observable artifact ถูกตำแหน่ง + observable proxy (`per-finding | batched`) assert ได้ deterministic
- **non-blocking** — gate checklist เดิมไม่เพิ่ม item (build §7 7→7, verify §6 7→7, design §8 11→11)
- backward-compatible 100% (guidance ไม่ใช่ hard gate) + regression minimalism/change-sizing ผ่าน
