# Business — Project memory

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. เป้าหมายเชิงธุรกิจ (what & why)

- **ทำ change นี้เพื่ออะไร:** ทำให้ "ความจำของ agent" กลายเป็น **สินทรัพย์ของโปรเจกต์** แทนที่จะเป็นของส่วนตัวในเครื่องใครเครื่องมัน — ลดต้นทุนที่จับต้องได้ 2 อย่าง: (1) เวลาที่เสียไปกับการ **เล่าบริบทซ้ำทุกครั้งที่เปิด session ใหม่** (2) ความรู้ที่ **หายเมื่อ topic ถูก archive หรือถูกทิ้งกลางทาง**
- **ผูกกับเป้าหมายโปรเจกต์:** `docs/project.md` ตั้งเป้าว่า "ติดตั้งลงโปรเจกต์ปลายทางแล้ว `/warnyin:*` ใช้ได้ครบ 5 stage **โดยไม่ต้องตั้งค่าเพิ่ม**" — วันนี้ workflow อ้างถึง `docs/stages/context.md` ถึง 4 จุดและ installer สร้างไฟล์ให้ แต่ไม่มี stage ไหนเขียนลงไป → ผู้ใช้ปลายทางได้ไฟล์เปล่าที่ไม่มีวันมีเนื้อหา งานนี้คือการปิดช่องนั้นให้ workflow ทำงานได้ครบตามที่ตัวมันเองสัญญาไว้

## 2. Persona / ใครได้ประโยชน์

| persona | คุณค่าที่ได้รับ |
|---|---|
| **ผู้ใช้ปลายทางที่ติดตั้ง warnyin** (ทีม/นักพัฒนา) | เปิด session ใหม่แล้ว agent รู้ทันทีว่าค้างอะไร ตัดสินอะไรไปแล้ว — ไม่ต้องเล่าซ้ำ; ความจำถูก commit จึงเห็นตรงกันทั้งทีมและข้ามเครื่อง |
| **ทีมที่ใช้ AI หลายเจ้า** (Claude Code / Codex / Antigravity / Cursor …) | ความจำอยู่ในไฟล์กลางของ repo ทุก harness อ่านได้ ไม่ใช่ล็อกอยู่ใน memory store ของเจ้าใดเจ้าหนึ่ง |
| **contributor / maintainer ของ repo นี้** | บทเรียนที่ยังพิสูจน์ไม่พอจะเป็น learned-rule มีที่พักที่ไม่หายไปกับ topic ที่ archive |

## 3. Success metric (วัดผลได้)

- **M1:** `docs/stages/context.md` มีจุดเขียนใน playbook **≥1 จุด** (วันนี้ = 0) — วัดด้วย grep บน `src/.warnyin/workflow/`
- **M2:** ติดตั้งใหม่ (`npx @warnyin/agents`) แล้วได้ `docs/stages/context.md` + `docs/memory.md` ที่ **มีโครงตั้งต้น ไม่ใช่ไฟล์เปล่า** (assert ใน `installer.test.mjs`)
- **M3:** บทเรียนที่บันทึกไว้ **อยู่รอดหลัง topic ถูก archive** — entry ใน `docs/memory.md` ไม่ถูกย้ายไป `docs/stages/achieved/`
- **M4 (regression):** gate ของ SHIP ไม่เปลี่ยน — learned-rule ยังต้องมี evidence + user ยืนยัน
- **M5 (tool-agnostic):** harness ที่ไม่มี memory tool ของตัวเองใช้กลไกนี้ได้ครบจาก playbook กลางอย่างเดียว

## 4. ขอบเขตเชิงธุรกิจ / ข้อจำกัด

- **in scope:** ความจำ 2 ชนิด — สถานะงานปัจจุบัน (working state) + บทเรียนสะสมระดับโปรเจกต์ที่ไม่ผูก topic
- **out of scope:** preference ของ user/ทีม (อยู่ `CLAUDE.md`/`AGENTS.md` แล้ว) · ข้อเท็จจริงของโค้ด (อยู่ `codemap/` + `techstack/` แล้ว) · runtime observer/hook/SQLite (roadmap non-goal) · retrieval engine
- **ข้อจำกัด:** zero-dependency · tool-agnostic (แก่นเป็น `.md`) · unify-in-place (ห้ามสร้างระบบขนานกับ `docs/` + SHIP promote) · กระทัดรัด opinionated (ห้ามไหลเป็น catalog)
- **ความเสี่ยงเชิงธุรกิจที่ผู้ใช้รับไว้แล้ว (Discovery D5b):** auto-write ไม่มีรั้ว (ไม่มี cap ขนาด / ไม่มี scrub secret) → ไฟล์ที่ commit อาจพาข้อมูลไม่พึงประสงค์ขึ้น repo และอาจบวมตามเวลา — คุมด้วยการ review git diff
