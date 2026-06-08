# Rule — ship-maintenance-wiring

> rule ที่ task นี้ต้อง focus/follow + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก docs/rule.md §1)
- [ ] **tool-agnostic** — ไม่ผูกชื่อ tool/model ใน wording ที่เพิ่ม
- [ ] **unify-in-place ไม่สร้างกลไกขนาน** — ขยายขั้น archive ของ `ship.md` ในที่เดิม; **ห้าม**จด status board (topic อยู่ stage ไหน) ลง context.md (ซ้ำ next.md)
- [ ] **canonical-copy convention** — กติกา context.md เต็มอยู่ `design.md` §3/§4 เดียว; ไฟล์อื่นเป็น pointer บาง ห้ามแต่งใหม่
- [ ] **context ⊥ role** — ไม่สับสน `docs/stages/context.md` (working-memory) กับ `contexts/` (session posture)
- [ ] **next.md read-only invariant** — คงหลักการ "ห้ามสร้าง/แก้/ลบไฟล์ รวมถึง context.md" ของ next.md (§4.1)
- [ ] **continuous-learning discipline** — ถ้าจะเพิ่ม global rule เรื่อง context.md maintenance → note รอ SHIP + ต้องมี evidence

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] rule ที่เสนอ: *"working-memory (context.md) เก็บเฉพาะสิ่งที่ derive จาก folder ไม่ได้ — status/stage ของ topic ให้ NEXT derive ไม่จดซ้ำ"* — เหตุผล: enforce ของ `unify-in-place` เฉพาะกรณี context.md vs next.md; scope `project` (`docs/rule.md`) — **evidence รอจาก build/verify** (เช่น grep ยืนยันไม่มี status board ใน context.md)
