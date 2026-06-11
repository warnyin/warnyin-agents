# Rule — discovery-command-adapter

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)
- [ ] **command = adapter บาง ชี้ playbook ไม่ duplicate** (`docs/features/utility-skills/feature.md` + `docs/rule.md §1` skill-adapter convention) — keyword map + pointer เท่านั้น
- [ ] **canonical single-source** (`docs/rule.md §1`): ไม่ inline taxonomy/behavior/auto-suggest/debate ใน command หรือ README
- [ ] **additive / idempotent / backward-compat** (`docs/techstack/installer/rule.md`): เรียก command แบบเดิม (ระบุแค่ slug) ต้องยังทำงาน
- [ ] **ไม่แตะ AGENTS.md** — Codex อ่าน playbook กลางตรง ได้ mode ฟรี (`docs/features/utility-skills/feature.md`)
- [ ] **ไม่ต้องแตะ `package.json files`/verify-pack** — แก้ไฟล์ payload เดิม (additive ไม่ใช่ path ใหม่) → allowlist/R1 เดิม pass (Infra ยืนยัน `design.md §10`)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
- [ ] rule ที่เสนอ: _(ไม่มี)_ — task นี้ตาม adapter-pattern เดิมล้วน (utility-skills/triage precedent) ไม่มี pattern ใหม่
