# Standard — discovery-command-adapter

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน command adapter ที่ task นี้ต้องยึด

## 1. Standard กลางที่ยึด (จาก techstack)
- **command = adapter บาง ชี้ playbook กลาง** (`docs/features/utility-skills/feature.md` + precedent `triage.md`/`next.md`): body ภาษาไทย "ทำหน้าที่เป็น ... อ่าน playbook `.warnyin/workflow/...` แล้วทำตาม" — **ไม่ duplicate logic**
- **canonical single-source** (`docs/rule.md §1`): taxonomy/behavior อยู่ playbook เดียว — command ชี้ section anchor ด้วย backtick runtime-ref
- **idempotent / additive** (`docs/techstack/installer/rule.md`): แก้ command เดิมแบบ additive ไม่ทำลาย flow เดิม

## 2. Pattern การเขียนโค้ดของ task นี้
- frontmatter เดิมของ command (`description`, `argument-hint`) — อัปเดต `argument-hint` ให้ครอบ mode keyword; ไม่รื้อ
- keyword map: ระบุเป็น **pointer ไป §4.1 ของ design / section anchor playbook** ไม่ inline ตาราง behavior
- ไม่ระบุ mode → สั่งให้ agent ชี้ playbook auto-suggest (ไม่ตัดสิน mode ใน command เอง)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **precedent command adapter:** `src/.claude/commands/warnyin/triage.md` (read-only router ชี้ playbook) + `discovery.md` เดิม (โครง command ที่จะ extend)
- **section anchor จาก Task A:** "Discovery modes (ความเข้มของ Discovery)" — ชี้ด้วยชื่อนี้ (contract `design.md §4.2`)
- **capability tree:** `src/.warnyin/workflow/README.md` (โครงเดิม — เพิ่ม mode แบบ additive)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- ต้องไม่ inline behavior/auto-suggest/debate ใน command (no-duplicate test จะจับ) — มีได้แค่ keyword-alias map + pointer
