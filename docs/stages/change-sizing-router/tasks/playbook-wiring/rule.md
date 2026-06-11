# Rule — playbook-wiring

## 1. Rule ที่ต้อง follow
- **unify-in-place** (`docs/rule.md §1`) — ขยาย §7 เดิม + แทรก hook ในที่เดิมของ verify/ship ไม่สร้าง section/กลไกขนาน
- **canonical-copy / ไม่ duplicate** — pointer เท่านั้น ห้าม inline rubric (rubric อยู่ triage.md)
- **stage-invoked capability convention** (`docs/rule.md §1`) — capability ที่ stage แตะ: hook ต้อง conditional/N-A (tier ไม่ใช่ fast → ไม่กระทบ), logic อยู่ doc เดียว stage ชี้กลับด้วย pointer
- **markdown-link จริง** (design §4/SA-S3) — กัน dead-link, full-gate จับได้
- **กระทัดรัด opinionated** — hook สั้น ไม่บวม playbook

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] — (ไม่มี; ใช้ stage-invoked capability convention + unify-in-place เดิม)
