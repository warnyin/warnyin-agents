# Rule — embed-minimalism-principle

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก `docs/rule.md`)
- [ ] **unify-in-place ไม่สร้างกลไกขนาน** — รวม seed minimalism ที่กระจัดกระจาย (build/developer/review) ให้มีบ้านเดียว; ของเดิมเติม pointer ให้เป็น subset ไม่เพิ่มกลไกขนาน
- [ ] **single source of truth / canonical-copy** — hierarchy เต็มที่ `minimalism.md` ที่เดียว; ที่อื่น pointer ห้าม duplicate
- [ ] **context (session) ⊥ role (task) — 3 context พอ** — ห้ามเพิ่ม context ตัวที่ 4; minimalism เป็น principle
- [ ] **กระทัดรัด opinionated ห้ามไหลเป็น catalog** — 1 ไฟล์ top-level, token-lean, ไม่เพิ่ม folder/layer
- [ ] **payload-guidance ต้อง generic (tool-agnostic)** — ไม่อ้างชื่อรุ่น/tool/ผลิตภัณฑ์ แม้ในประโยคปฏิเสธ
- [ ] **zero-dependency** — เอกสารล้วน ไม่เพิ่ม dep/devDep
- [ ] **investigate-before-edit** — เข้าใจโครงไฟล์ก่อนเติม pointer ไม่ทับ logic เดิม
- [ ] **CHANGELOG ทุก user-facing change** — payload เปลี่ยน → เพิ่ม entry ใน `CHANGELOG.md`
- [ ] **src→root sync-gap** — แก้ที่ `src/` เท่านั้น (canonical tracked); root dogfood ได้จาก `setup:dogfood` — อย่าแก้ root ตรงๆ
- [ ] **structural validator ✖ ไม่พึ่ง heuristic** — ไม่เพิ่ม gate เชิง heuristic ที่ block (สอดคล้องการเลือก "ไม่เพิ่ม hard gate ใน verify §6")

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` / `docs/features/` ตอนนี้ — note ไว้ก่อน
- [ ] **minimalism-principle convention** (เสนอเพิ่มใน `docs/rule.md` §1) — "เขียนโค้ดน้อยที่สุด: decision hierarchy (YAGNI→stdlib→native→dep→one-liner→ขั้นต่ำ) + guardrail lazy-not-negligent เป็น principle กลางที่ surface ฝั่งผลิต/ฝั่งตรวจ pointer มา (single source `minimalism.md`); always-on zero-config" — **เหตุผล:** เป็น principle ระดับ payload ที่ควร promote เป็น rule ถาวร + ผูก feature `minimalism` · **evidence:** topic นี้ (ponytail-minimalism)
- [ ] **สร้าง feature ใหม่ `docs/features/minimalism/spec.md`** ตาม Spec delta (ADDED 5 scenario ใน `design.md §9`) — SHIP เป็นคนสร้าง
