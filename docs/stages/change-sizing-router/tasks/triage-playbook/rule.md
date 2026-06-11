# Rule — triage-playbook

> rule ที่ task นี้ต้อง follow (จาก `docs/rule.md` + `docs/techstack/installer/`)

## 1. Rule ที่ต้อง follow
- **canonical-copy** (`docs/rule.md §1`) — rubric copy จาก `design.md §3` คำต่อคำ ห้ามแต่งใหม่
- **payload-guidance generic / tool-agnostic** (`docs/rule.md §1`) — ไม่ผูกชื่อรุ่น/ผลิตภัณฑ์; แม้ประโยคปฏิเสธก็เลี่ยง enumerate ชื่อรุ่น
- **กระทัดรัด opinionated** (`docs/rule.md §1`) — 3 tier พอ ไม่บานเป็น catalog
- **unify-in-place** — triage = utility router ใหม่ตาม pattern next/explore (ไม่สร้างกลไกขนานซ้ำ next)
- **mirror layout `src/` = target** (`installer/rule.md`) — วาง `src/.warnyin/workflow/triage.md` ให้ install → `.warnyin/workflow/triage.md`
- **structural validator ✖ ไม่พึ่ง filled-detection** (`docs/rule.md §1`) — rubric เป็น judgment heuristic (⚠) ไม่ใช่ hard gate; ไม่ทำให้ triage เป็น mechanical ✖

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] เสนอ: **"change-sizing เป็น judgment router (⚠) — แนะนำแล้วหยุด + hard-floor บังคับ + escalate ได้ symmetric"** — เหตุผล: pattern ใหม่ของ sizing-aware workflow ที่ควร generalize — _ถ้า VERIFY ยืนยัน ยกขึ้น `docs/rule.md §1` ตอน SHIP_
