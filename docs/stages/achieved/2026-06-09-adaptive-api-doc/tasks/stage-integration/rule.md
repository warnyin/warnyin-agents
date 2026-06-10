# Rule — stage-integration

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack/project)
- [x] **canonical-copy convention** (`docs/rule.md` §1) — wording ซ้ำหลายไฟล์คัดจาก `api-doc.md` ที่เดียว ห้ามแต่งใหม่
- [x] **unify-in-place ไม่สร้างกลไกขนาน** (`docs/rule.md` §1) — ขยายข้อ/gate เดิม ให้ของเก่าเป็น subset
- [x] **ทุก stage playbook ชี้ context/capability ที่เข้าคู่** (`docs/rule.md` §1) — hook เป็น pointer ไม่ duplicate
- [x] **CHANGELOG ทุก user-facing change** (`docs/rule.md` §2) — entry ใต้ `[Unreleased]`
- [x] **mirror layout `src/` = target** (`docs/techstack/installer/rule.md`) — แก้เฉพาะ `src/.warnyin/`, ห้ามแตะ root dogfood
- [x] **ห้ามแตะ `docs/` กลางตอน DESIGN/BUILD** — `docs/infra.md` note (Infra S1) = งาน SHIP
- [x] **backward compatible** — gate ใหม่ conditional, ไม่ block topic ที่ไม่ใช่ REST API

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
- [ ] (defer จาก Infra panel S1) — `docs/infra.md` ควรมี 1 บรรทัดว่า "เครื่องมือ API-doc (Spectral/Redocly/openapi-generator/FastAPI/tsoa) เป็น optional ของ **โปรเจกต์ปลายทาง** ไม่ใช่ dependency ของ repo นี้ (คง zero-dep)" — **เหตุผล:** กันเข้าใจผิดว่า repo ต้องลง tool · **evidence:** Infra review panel topic `adaptive-api-doc` · ดำเนินการตอน SHIP (DESIGN ห้ามแตะ docs/ กลาง)
