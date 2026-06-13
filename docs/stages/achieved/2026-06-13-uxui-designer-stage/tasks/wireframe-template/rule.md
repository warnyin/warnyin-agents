# Rule — wireframe-template

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack / design)
> ดึงจาก `docs/rule.md` และ design.md — เฉพาะข้อที่เกี่ยวกับ task นี้
- [ ] **scaffold placeholder** — ไฟล์อยู่ใน `src/.warnyin/template/stages/[topic]/` = template ที่ user copy ไปกรอก (lint-md EXCLUDE `template/` ไม่ check link) — **แต่เขียน path/pointer ให้ถูกไว้** (`.warnyin/workflow/stages/design.md`, `roles/ux.md`)
- [ ] **ชื่อ 4 section ตายตัวตาม contract** (design.md §4 interface) — §1 User flow · §2 Wireframe ต่อ screen · §3 Screen states · §4 Design-honor note — T3 (`design-stage-integration`) pointer มาที่ชื่อนี้ **ห้ามเปลี่ยน/ลบ**
- [ ] **privacy guard** (design.md §10F) — wireframe ใช้ label/placeholder **generic**; ห้ามใส่ secret/token/credential/internal path/PII จริงในตัวอย่าง (artifact commit ลง repo) → ต้องมี comment เตือนในไฟล์
- [ ] **approve gate** (design.md §1 + flow §5) — metadata ต้องมี `status: draft|approved` เพื่อรองรับ gate ที่ user ยืนยันก่อนแตก task

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` ตอนนี้ — แค่ note ไว้ก่อน ถึง SHIP ค่อยพิจารณาย้ายขึ้นไป
- [ ] rule ที่เสนอ: template artifact ที่มี **repeatable sub-block** ต้องมี comment "ทำซ้ำ block ได้" + ตัวอย่างอย่างน้อย 2 block — เหตุผล: กัน user เข้าใจผิดว่ากรอกได้จอเดียว (เริ่มจาก §2 Wireframe ต่อ screen ของ task นี้)
