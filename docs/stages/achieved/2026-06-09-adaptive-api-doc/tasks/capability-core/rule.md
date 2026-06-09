# Rule — capability-core

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack/project)
- [x] **tool-agnostic** (`docs/rule.md` §1) — แก่นเป็น `.md` กลาง; ไม่ฝัง model-tier เป็น guidance (payload-guidance generic §1.9)
- [x] **skill-adapter / canonical-copy** (`docs/rule.md` §1) — logic อยู่ที่เดียว; ไฟล์อื่นชี้กลับ ไม่ duplicate
- [x] **reference ไม่ vendor** (`docs/rule.md` §3.2 supply-chain) — third-party skill = prompt-injection surface → อ้างอิง ไม่ก๊อปเข้า repo
- [x] **ห้ามเดา** (`docs/rule.md` §1) — detect คลุมเครือ / component กำกวม → ถาม user
- [x] **กระทัดรัด opinionated** (`docs/rule.md` §1) — capability เดียว ไม่เป็น catalog; gate ด้วย auto-detect
- [x] **secret hygiene** (`docs/rule.md` §3.2) — เอกสารแนะ scrub `openapi.yaml` ไม่ให้ค่าจริงหลุด
- [x] **ภาษาไทย** (`docs/rule.md` §2)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
- [ ] rule ที่เสนอ: **"stage-invoked capability convention"** — capability doc ที่ stage เรียกแบบ conditional (auto-detect) ต้อง (1) มี section detect ที่ระบุ "ไม่เข้าเงื่อนไข → ข้าม" ชัด, (2) ทุก gate item ที่เพิ่มต้อง conditional/N-A, (3) stage ชี้กลับด้วย pointer + เลข section ไม่ duplicate — เหตุผล: กัน adaptive capability ตัวถัดไป (ถ้ามี) ไหลเป็น catalog หรือ block topic ที่ไม่เกี่ยว · **evidence:** topic `adaptive-api-doc` (api-doc.md §2 + gate conditional 3 stage)
