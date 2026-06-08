# Business — Context working memory

> what & why เชิงคุณค่า · promote จาก topic `context-working-memory`

## คุณค่า (why)
`docs/stages/context.md` ถูก **อ่าน** 3 ที่ (`discovery.md`, `explore.md`, `next.md`) แต่ **ไม่มี stage ไหนเขียน** — installer ก็ scaffold เป็นไฟล์เปล่า จึงเป็น "input ที่ไม่มี producer" และว่างเปล่ามาตลอด. feature นี้ทำให้มันใช้งานได้จริงด้วย 2 ส่วน: (1) มี skeleton ตอนติดตั้ง, (2) SHIP เป็น producer ที่ maintain ให้

ผลคือ **ความจำระยะสั้นข้าม topic** (โฟกัส/ธีม/decision ข้าม topic/ไฮไลต์ที่เพิ่ง ship) ไม่หายทุก session — session/agent ถัดไป orient ได้เร็วโดยไม่ต้องรื้อ folder ดิบ

## persona
- **AI หลัก (+ sub-agent)** ที่กลับมาทำงานข้าม session/topic — ได้บริบทล่าสุดทันทีจาก context.md + status (derived) จาก `/warnyin:next`
- **user** ที่อยาก jot parking-lot / decision ข้าม topic โดยไม่ต้องเปิด topic ใหม่

## ทำไมคุ้ม
- อุดรอยรั่วของ success metric **"งานถัดไปเริ่มจากความรู้ล่าสุดทุกครั้ง"** (README) — gap ที่ playbook คาดหวังว่ามีอยู่แล้วแต่ตายอยู่
- **value/effort ดีสุด** ใน 3 gap ของ discovery umbrella (Gap A) — markdown ล้วน, in-constraint (zero-dep, tool-agnostic)
- **เลือกแนวทาง working-notes (ไม่ derive)** แทน generated board → ไม่ซ้ำ `next.md` (honors `unify-in-place`), staleness ต่ำ

## success metric (ที่ verify แล้ว)
- install สด → context.md มี skeleton 4 section (non-empty); มี context.md เดิม → install/`--update` byte-equal (ไม่ทับ) — B1/B2/B3
- no scaffold-leak (seed จาก template ไม่ใช่ repo ต้นทาง) — B4
- payload สะอาด (template ติด tarball, ไม่มี docs/tests/scripts รั่ว) — C1
- readers + ship.md consistent: working-notes ไม่ใช่ status board, canonical เดียว, next.md read-only — D2–D5

## ที่มา
discovery umbrella `memory-identity-observability` — wedge "Memory/Identity" ของ product thesis ปรับใช้กับ @warnyin/agents: เติม **ปลาย short-term** ของ memory loop `stage artifact → SHIP → docs/` ที่มีอยู่แล้ว
