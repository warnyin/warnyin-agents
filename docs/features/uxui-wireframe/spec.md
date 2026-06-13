# Spec — UX/UI wireframe ใน DESIGN

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> feature ประเภท playbook (ไม่มี runtime) → THEN เป็น **observable artifact** (ไฟล์/section/key string มีจริง, ลิงก์ resolve)

## Requirement: UX wireframe ใน DESIGN
DESIGN stage มี capability วาด low-fidelity wireframe ให้ user เห็นภาพ + ยืนยันก่อนแตก task สำหรับ change ที่มี UI surface (conditional + backward-compatible)

### Scenario: change มี UI surface → เสนอทำ wireframe
- GIVEN change ที่ detect ว่าแตะ UI surface (techstack FE/web/mobile/desktop, มี page/route/screen/component, หรือ user flow ใหม่)
- WHEN จบ `proposal.md` ก่อนเขียน technical design
- THEN `design.md` §4 มี **step 4.5 "UX wireframe"** แทรกระหว่าง step 4 (proposal) กับ step 5 (design.md how) สั่งเสนอ user วาด wireframe (optional — ถาม user ก่อน)

### Scenario: ไม่มี UI surface → ข้าม + gate N/A
- GIVEN change ที่ไม่มี UI surface (backend/REST API/CLI/library/docs/tooling ล้วน)
- WHEN DESIGN รัน detect block
- THEN detect block ระบุ "ไม่ใช่ → ข้าม UX step ทั้งหมด" และ gate item §8 "UX wireframe (ถ้า change มี UI surface)" ระบุ "ไม่มี UI surface → N/A" (backward compatible)

### Scenario: สัญญาณ UI surface ก้ำกึ่ง → ถาม user
- GIVEN change ที่ detect ไม่ชัด (CLI ที่มี TUI, change แตะทั้ง API + component)
- WHEN DESIGN รัน detect แล้วสัญญาณคลุมเครือ
- THEN detect block ระบุ "ไม่แน่ใจจริง → ถาม user ทีละข้อ + เสนอคำตอบที่แนะนำ" (ห้ามเดา)

### Scenario: วาด wireframe แบบ read-only generator
- GIVEN user ตกลงทำ wireframe
- WHEN fan-out agent `warnyin-ux` (frontmatter `tools: Read, Grep, Glob` — ไม่มี Write/Edit) หรือ AI หลักสวม lens `roles/ux.md` (fallback)
- THEN agent คืน ASCII wireframe + user flow + screen states เป็น text; main loop เขียนลง `docs/stages/<slug>/wireframe.md` (single-writer) ที่มี 4 section: User flow · Wireframe ต่อ screen · Screen states · Design-honor note

### Scenario: approve gate ก่อนแตก task
- GIVEN `wireframe.md` ถูกเขียนแล้ว (status `draft`)
- WHEN ก่อนแตก task
- THEN step 4.5 สั่งให้ user ยืนยัน/ปรับ wireframe (status → `approved`) ก่อน; `design.md §5` (UI layer) อ้าง wireframe ที่ approve; gate item §8 require "user ยืนยันแล้ว"

### Scenario: fan-out ไม่ได้ → fallback เป็น lens
- GIVEN เครื่องที่ไม่มี Agent/sub-agent tool (fan-out ไม่ได้)
- WHEN ถึง step 4.5 และ user ตกลงทำ wireframe
- THEN step 4.5 ระบุ fallback "AI หลักสวม lens `roles/ux.md` วาด wireframe เองตามลำดับ" — ยังได้ wireframe ครบ + ผ่าน approve gate เดิม
