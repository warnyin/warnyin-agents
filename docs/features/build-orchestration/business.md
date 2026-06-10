# Business — Build orchestration

> ทำไม feature นี้มีอยู่ · promote จาก topic `improve-performance` (achieved 2026-06-10)

## ปัญหา (จาก user จริง)
BUILD stage **ช้ามาก** — "build-wave นึงใช้เวลา ~2 ชม" และสังเกตว่ามัน "ทำแค่ agent ตัวเดียว และ phase เดียว" ตอน build
→ ราก: DAG ที่ DESIGN สร้างเป็น **chain เส้นตรง** (เช่น scaffold-foundation: monorepo→api→web→ci, depth 4) → ทุก wave มี task เดียว → fan-out ไม่ได้ขนานจริง แม้ `build-wave.mjs` รองรับ parallel อยู่แล้ว

## คุณค่า
- **เร็วขึ้นจากความขนาน** — DAG กว้าง (≥1 wave หลาย task) ทำให้ sub-agent ทำงานพร้อมกัน (proof: scaffold redesign depth 4→3 wave width 2; งาน `improve-performance` เอง wave 1 ขนาน 3 task)
- **ถูกลง/เร็วขึ้นต่อ node** — model routing per task (งานเบา→รุ่นถูก) + lean self-verify (ไม่รัน integration ซ้ำต่อ agent) ลดเวลา/ค่าใช้จ่ายบน critical path
- **ไม่แลกด้วย correctness** — critical-path gate เป็น judgment ป้องกัน chain เผลอ; full-gate คง blocking ครอบ integration; vertical slice เดิมไม่เปลี่ยน

## ใครได้ประโยชน์
ทุก topic ที่เข้า BUILD — DESIGN ได้เครื่องมือคิด DAG ให้กว้าง, BUILD ได้กลไก route model + verify lean; ผู้ใช้รอ BUILD สั้นลงโดยผลยังเชื่อถือได้

## ตัดสินใจสำคัญ
- **คงนิยาม vertical slice เดิม** — toolkit เป็นเทคนิคเสริม optional ไม่บังคับ (กันความซับซ้อนเกิน)
- **payload generic, map ที่ adapter** — `build-wave.mjs` ไม่ผูกชื่อรุ่น (tool-agnostic) → harness อื่นใช้ได้
- **e2e proof ของ routing = defer** — รับ scope "ส่ง key model ถูก" ก่อน, พิสูจน์ harness route จริงที่ dogfood ถัดไป
