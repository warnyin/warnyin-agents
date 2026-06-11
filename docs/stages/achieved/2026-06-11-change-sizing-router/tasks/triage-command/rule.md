# Rule — triage-command

## 1. Rule ที่ต้อง follow
- **skill-adapter convention** (`docs/rule.md §1`) — adapter บางชี้ playbook ไม่ duplicate; **irreversible/stateful คงเป็น command** (triage เป็น utility read-only user-invoked)
- **canonical-copy / ไม่ duplicate** — ห้าม inline rubric ลง command
- **pointer = backtick target-root runtime-ref** (design §4 + dry-run T2) — adapter ชี้ path ที่ target install root `` `.warnyin/workflow/triage.md` `` เหมือน next.md; **ห้าม markdown-link** (จะ path ผิด + ขัด convention)
- **src→root sync-gap** (`docs/rule.md §1`) — แก้ที่ `src/` เท่านั้น (root gitignored); ห้ามรายงาน root เป็น filesChanged
- **mirror layout** (`installer/rule.md`) — `src/.claude/commands/warnyin/triage.md` → target `.claude/commands/warnyin/triage.md`

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] — (ไม่มี; ใช้ skill-adapter convention เดิม)
