# Context — working memory (ข้าม topic)

> ความจำใช้งานข้าม topic — เฉพาะสิ่งที่ derive จากโครง folder ไม่ได้
> สถานะ topic ว่าอยู่ stage ไหน → ใช้ /warnyin:next (derive จากไฟล์จริง) ไม่จดที่นี่

## โฟกัส/ธีมปัจจุบัน
> กำลังโฟกัสอะไรอยู่ตอนนี้ (1-3 บรรทัด) — DESIGN/DISCOVERY อัปเดตเมื่อโฟกัสขยับ
- ส่งมอบ **Gap A** (`context-working-memory`) + **Gap B** (`build-log-narrative`) ของ umbrella `memory-identity-observability` แล้ว
- เหลือ **Gap C** (role→identity สะสม lessons — **ดอง**, revisit เมื่อมี need ชัด); umbrella discovery ยัง active

## Decision ข้าม topic
> การตัดสินใจที่ไม่สังกัด topic เดียว (มีผลหลาย topic) — มีวันที่
| วันที่ | decision | เหตุผล/ที่มา |
|---|---|---|
| 2026-06-08 | ทำ memory/observability gap ตามลำดับ **A → B → (C ดอง)** | discovery umbrella `memory-identity-observability` — A คุ้ม value/effort สุด + in-constraint; C ทับซ้อน learned-rule |

## Parking lot
> ไอเดีย/สิ่งที่ค่อยกลับมาทำ (ยังไม่เป็น topic) — ใครก็ jot ได้
- **Gap C (ดอง)** — role → identity ที่สะสม lessons; ทับซ้อน learned-rule สูง → revisit เมื่อมี need ชัด

## เพิ่ง ship (ล่าสุด 5 รายการ)
> SHIP append ตอน archive — เก่าเกิน 5 ตัดออก (ราย topic เต็มอยู่ใน achieved/ แล้ว)
| วันที่ | slug | ไฮไลต์ (1 บรรทัด) |
|---|---|---|
| 2026-06-08 | context-working-memory | context.md เป็น working-memory ข้าม topic — installer seed skeleton (seed-if-absent) + SHIP เป็น producer |
| 2026-06-08 | build-log-narrative | `build-log.md` = narrative timeline ของ BUILD fan-out — agent คืน `events[]` ผ่าน schema, main loop กลั่นเขียนหลังแต่ละ wave (เล่า "ระหว่างทาง" ไม่จด status board) |
