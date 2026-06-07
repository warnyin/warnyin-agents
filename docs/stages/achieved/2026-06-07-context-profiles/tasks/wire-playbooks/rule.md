# Rule — wire-playbooks

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง follow + rule ที่เสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack/project)
- [ ] **single source of truth** (CLAUDE.md) — callout ชี้ไป context, ห้าม duplicate เนื้อหา context ลง playbook
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/.warnyin/workflow/stages/*` + `README.md` เท่านั้น; ห้ามแตะ root dogfood
- [ ] **กระทัดรัด** (`docs/rule.md` §1) — เพิ่มน้อยที่สุด (1 บรรทัด/playbook); ไม่รื้อ logic เดิม
- [ ] **ไม่ทำลายของเดิม** — `npm test` 18 เคสต้องเขียว (playbook content ไม่มี test assert ตรงๆ แต่ยืนยันกันพลาด)
- [ ] **ไม่มีลิงก์ตาย** — callout ต้องชี้ไฟล์ `contexts/<name>.md` ที่ author-contexts สร้างจริง (dependency)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] rule ที่เสนอ: **"ทุก stage playbook ชี้ context ที่เข้าคู่ (callout ใต้ title) — เพิ่ม stage ใหม่ต้องระบุ context"** — เหตุผล: รักษา invariant ว่า posture layer ครอบทุก stage; คู่กับ rule ที่ author-contexts เสนอ (ตัดสินรวมตอน SHIP)
