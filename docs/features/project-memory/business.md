# Business — Project memory

> ความรู้ถาวรระดับ feature · promote จาก topic `project-memory` (achieved 2026-07-27)

## 1. Goal

ทำให้ "ความจำของ agent" เป็น **สินทรัพย์ของโปรเจกต์** แทนที่จะเป็นของส่วนตัวในเครื่องใครเครื่องมัน — ลดต้นทุน 2 อย่าง:
1. เวลาที่เสียไปกับการ **เล่าบริบทซ้ำทุกครั้งที่เปิด session ใหม่**
2. ความรู้ที่ **หายเมื่อ topic ถูก archive หรือถูกทิ้งกลางทาง**

ปิดช่องที่ workflow สัญญาไว้กับตัวเอง: เดิม playbook อ้างถึง `docs/stages/context.md` **4 จุด** และ installer สร้างไฟล์ให้ แต่ **ไม่มี stage ไหนเขียนลงไปเลย** → ผู้ใช้ปลายทางได้ไฟล์เปล่าที่ไม่มีวันมีเนื้อหา

## 2. คุณค่า

- **ไม่ต้องเล่าซ้ำ** — เปิด session ใหม่แล้ว agent รู้ทันทีว่าค้างอะไร ตัดสินอะไรไปแล้ว
- **ความจำเดียวข้ามเครื่อง/ข้าม harness** — อยู่ในไฟล์กลางของ repo (commit) ทุก harness อ่านได้ ไม่ล็อกอยู่ใน memory store ของเจ้าใดเจ้าหนึ่ง; harness ที่มี store ของตัวเองถูกสั่ง (ผ่าน root doc) ให้เขียนลง 2 ไฟล์นี้แทน
- **บทเรียนไม่ตายไปกับ topic** — ของที่ยังพิสูจน์ไม่พอจะเป็น learned-rule มีที่พักที่อยู่**นอก** `docs/stages/` จึงไม่ถูก archive
- **review ได้จริง** — ความจำเป็นไฟล์ใน git → เห็นผ่าน `git diff` ต่างจาก store ที่มองไม่เห็น

## 3. Persona

| persona | คุณค่าที่ได้รับ |
|---|---|
| **ผู้ใช้ปลายทางที่ติดตั้ง warnyin** | ความต่อเนื่องข้าม session + ทีมเห็นตรงกันเพราะ commit |
| **ทีมที่ใช้ AI หลายเจ้า** | ความจำอยู่ที่เดียว ไม่แตกตาม harness |
| **contributor/maintainer** | บทเรียนระหว่างทางไหลเข้าเส้นทาง learned-rule ของ SHIP อย่างเป็นระบบ |

## 4. ขอบเขตเชิงธุรกิจ / ข้อจำกัด

- **in scope:** ความจำ 2 ชนิด — สถานะงานปัจจุบัน (working state) + บทเรียนสะสมระดับโปรเจกต์ที่ไม่ผูก topic; จุดเขียน/จุดอ่าน/ทางออก + command + script สุขภาพ
- **out of scope:** preference ของ user/ทีม (อยู่ `CLAUDE.md`/`AGENTS.md` แล้ว) · ข้อเท็จจริงของโค้ด (อยู่ `codemap/` + `techstack/`) · runtime observer/hook/SQLite (roadmap non-goal) · retrieval engine/embedding
- **ข้อจำกัด:** zero-dependency · tool-agnostic (แก่นเป็น `.md`) · unify-in-place (ไม่สร้างระบบขนานกับ `docs/` + SHIP promote) · กระทัดรัด opinionated (ไม่ไหลเป็น catalog)
- **★ ความเสี่ยงที่ผู้ใช้ตัดสินใจรับไว้แล้ว (Discovery D5b):** auto-write **ไม่มีรั้ว** — ไม่มี cap ขนาด ไม่มี scrub secret → ไฟล์ที่ commit อาจพาข้อมูลไม่พึงประสงค์ขึ้น repo และบวมตามเวลา; คุมด้วย **คำเตือนในไฟล์ + review git diff + สัญญาณจาก `memory-status`** (ไม่ใช่กลไกบังคับ)

## 5. Success metric

- **M1:** `docs/stages/context.md` มีจุดเขียนใน playbook ≥1 จุด (เดิม = 0) → **ผลจริง: 6 จุด** (5 stage + fastlane)
- **M2:** ติดตั้งใหม่แล้วได้ `context.md` + `docs/memory.md` ที่ **มีโครงตั้งต้น ไม่ใช่ไฟล์เปล่า** → **ผลจริง: 1399 B / 1136 B** (verify V5)
- **M3:** entry ใน `docs/memory.md` อยู่รอดหลัง topic ถูก archive (อยู่นอก `docs/stages/`)
- **M4 (regression):** gate ของ SHIP ไม่เปลี่ยน — learned-rule ยังต้องมี evidence + user ยืนยัน → **ผลจริง: gate 11 → 12 item โดยข้อเดิมไม่ถูกแก้**
- **M5 (tool-agnostic):** harness ที่ไม่มี memory tool ของตัวเองใช้กลไกนี้ได้ครบจาก playbook กลางอย่างเดียว
