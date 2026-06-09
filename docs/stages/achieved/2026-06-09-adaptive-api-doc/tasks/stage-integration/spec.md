# Spec — stage-integration

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> task ประเภท **docs/playbook** (hook + adapter) — ไม่มี runtime layer

## 1. ชนิดของ task
`docs/playbook` (stage hook + adapter)

## 4. Data-flow
- hook = pointer บางจาก stage playbook → `api-doc.md` (เลข section); logic ไหลจาก capability เข้า stage ไม่ย้อนกลับ

## 6. Persona
- AI ที่เดิน DESIGN/VERIFY/SHIP — เจอ hook แล้วรู้ว่าต้องเปิด `api-doc.md` ทำตาม
- ผู้ใช้ปลายทางที่ได้ payload ผ่าน `--update`

## 7. Test-flow (observable artifact — VERIFY เทสตามนี้)
- [ ] **pointer 3 stage** — `src/.warnyin/workflow/stages/{design,verify,ship}.md` แต่ละไฟล์มีสตริง `.warnyin/workflow/api-doc.md` ≥1 ครั้ง **ในจุดที่เรียกใช้** (design §6/gate, verify §4/gate, ship process/gate) ไม่ใช่ comment ลอย
- [ ] **gate conditional** — gate ของ 3 stage มีข้อ API contract ที่ระบุ "ถ้าแตะ REST API" หรือ "N/A" / "ถ้ามี openapi.yaml"
- [ ] **unify-in-place** — `design.md` §6 ข้อ "API task" มีถ้อยคำให้ spec.md "ชี้มาที่ openapi.yaml" ไม่เขียน schema ซ้ำ
- [ ] **section-pointer integrity** — เลข section ที่ hook อ้าง (`api-doc.md §2`, `§4`) มีอยู่จริงใน `api-doc.md`
- [ ] **adapter** — `roles/README.md` §"Skill เสริม" มีแถว `openapi-spec-generation` (+ เตือน third-party); `workflow/README.md` รายการไฟล์มี `api-doc.md`
- [ ] **CHANGELOG** — `CHANGELOG.md` ใต้ `[Unreleased]` มี entry adaptive API documentation
- [ ] **regression** — `npm test` เขียว 53 (ไม่แตะ installer/test logic)
- [ ] **edge: topic ไม่ใช่ REST API** — gate item อ่านแล้วตีความได้ว่า N/A (ไม่ block) — ตรวจถ้อยคำ conditional
