# Rule — add-utility-skills

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack/project)
- [ ] **tool-agnostic core** (`docs/rule.md` §1) — playbook กลางไม่แตะ; skill ชี้กลับ ไม่ duplicate
- [ ] **zero-dependency** (`docs/rule.md` §2) — `node:*` เท่านั้น; devDependencies ว่าง
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/**` เท่านั้น; ห้ามแตะ root dogfood
- [ ] **`package.json files` granular** + **pack-verify gate testable** (`docs/techstack/installer/rule.md`) — เพิ่ม allow ต้องคง guard + unit พิสูจน์ (case 9 ใหม่จับ leak อื่นได้)
- [ ] **test black-box spawn** + **acceptance = pass count** (`docs/techstack/installer/{test,rule}.md`) — `pass==tests` ≥ MIN_PASS(9); ห้าม refactor target เพื่อ testability
- [ ] **investigate-before-edit** (`docs/rule.md` §1) — เข้าใจ `verify-pack.mjs`/`cli.mjs`/test เดิมก่อนแก้ (โดยเฉพาะ case 9 ที่ assert ตรงข้าม + ALLOWED_PREFIX comment เจตนาเดิม)
- [ ] **config-protection** (`docs/rule.md` §1) — ห้ามลด MIN_PASS หรือ disable test "เพื่อให้ผ่าน"; แก้ root cause
- [ ] **ห้ามแตะ docs/rule.md central** ตอน BUILD — global note §2 รอ SHIP
- [ ] **ไม่ทำลายของเดิม** — command เดิมไม่เปลี่ยนพฤติกรรม; `AGENTS.md` ไม่แตะ; `npm test` + `verify:pack` เขียว

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP — promote เข้า `docs/rule.md`)
- [ ] rule ที่เสนอ: **skill-adapter convention** —
  - skill (`.claude/skills/`) = Claude adapter **บาง ชี้ playbook กลาง** ไม่ duplicate (เหมือน command); **เฉพาะ utility read-only safe** ทำเป็น skill auto-invocable (ไม่ใส่ `disable-model-invocation`)
  - **irreversible/stateful (build/ship/design ฯลฯ) คงเป็น command** (user-only โดยธรรมชาติ) — ไม่ทำ skill auto-invoke
  - **ไม่แปลง package เป็น plugin** เพื่อรักษา namespace `/warnyin:*` ของ command (non-breaking); skill ยอมรับ namespace `/<name>` (ไม่มี prefix)
  - เหตุผล: คุม blast radius ของ auto-invocation (เฉพาะ safe), คง tool-agnostic + non-breaking; placement: ยืนยันตอน SHIP (`docs/rule.md` §1 หรือ techstack/installer)
