# Spec — establish-tier-step

> feature ประเภท playbook `.md` (ไม่มี runtime) → THEN = observable artifact (section/string มีจริง)

## persona
AI/contributor ที่รัน `/warnyin:design` — ก่อนเดินทำ artifact ต้อง establish tier ก่อน

## data-flow
request → DESIGN ประเมิน tier (signals+hard-floor, ชี้ triage.md) → มั่นใจ: บันทึก proposal | ไม่มั่นใจ: ถาม user → tier → drive ceremony §7

## test-flow (task-scope — structural)
1. **establish-tier step มีจริง:** `design.md §4` มี step (ก่อน business/proposal) ที่ระบุ "ประเมิน tier เบื้องต้น"
2. **มั่นใจ→กำหนด:** §4 step ระบุ "มั่นใจ → กำหนด tier + บันทึก proposal `ขนาด`"
3. **ไม่มั่นใจ→ถาม options:** §4 step ระบุถาม user (options: ประเมินด้วย `/warnyin:triage` / user กำหนด tier เอง)
4. **hard-floor บังคับ:** §4 step ระบุ hard-floor → ≥ standard เสมอ (แม้ user กำหนด fast)
5. **§7 tie:** `design.md §7` มีประโยคชี้ §4 step (tier established ที่ไหน) — ไม่ inline rubric (ชี้ `triage.md`)
6. **proposal vocab:** template `ขนาด` = `fast/standard/large`
7. **unify-in-place:** ไม่มี section/playbook ขนานใหม่ — แทรกในโครงเดิม
8. **lint:md own-file** ผ่าน

## observable
- design.md establish tier ก่อน (มั่นใจกำหนด/ไม่มั่นใจถาม options/hard-floor) + proposal ใช้ vocab tier
