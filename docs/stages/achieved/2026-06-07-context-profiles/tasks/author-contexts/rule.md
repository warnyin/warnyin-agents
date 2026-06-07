# Rule — author-contexts

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง follow + rule ที่เสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack/project)
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — สร้างใน `src/.warnyin/workflow/contexts/` (committed/publish) **เท่านั้น**; ห้ามแก้ root `.warnyin/` (dogfood gitignored — copy ทันทีเป็น manual optional หลัง BUILD)
- [ ] **mirror layout = target paths** (`installer/rule.md`) — path ใต้ `src/.warnyin/workflow/` สะท้อนตอน install เป๊ะ; contexts/ ติด CORE copyTree อัตโนมัติ
- [ ] **กระทัดรัด opinionated + tool-agnostic `.md`** (`docs/rule.md` §1) — บาง ไม่ catalog; ไม่ผูก tool
- [ ] **single source of truth** (CLAUDE.md) — ไม่ duplicate logic ของ stage playbook/role card ลง context
- [ ] **ภาษาไทย** (`docs/rule.md` §2)
- [ ] **pack-verify เป็น gate** (`docs/rule.md` §4) — ยืนยัน `contexts/*.md` ติด tarball ด้วย `verify:pack` (ไม่ต้องแก้ allowlist เพราะ `src/.warnyin` ครอบอยู่แล้ว)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] rule ที่เสนอ: **"contexts/ = session-level posture layer, คู่ขนาน roles/ (task-level lens) — ห้าม duplicate, ชี้กลับ playbook"** — เหตุผล: กันอนาคต context บวม/ทับ role; ควรอยู่ใน `docs/techstack/installer/` หรือ `docs/rule.md` (ตัดสินตอน SHIP)
