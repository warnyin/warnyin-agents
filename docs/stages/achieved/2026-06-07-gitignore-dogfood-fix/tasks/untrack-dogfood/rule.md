# Rule — untrack-dogfood

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก project)
- [ ] **source/dogfood แยกชั้น + `.gitignore` root-anchored** (`docs/rule.md` §6) — แก่นของงานนี้: root dogfood gitignored (anchored `/`), `src/**` track ครบ; ห้ามให้ pattern match `src/`
- [ ] **investigate-before-edit** (`docs/rule.md` §1) — `git rm --dry-run` + grep `src/` ก่อน rm จริง
- [ ] **config-protection** (`docs/rule.md` §1) — แก้ root cause (git/config) ไม่เลี่ยงด้วยการ disable อะไร
- [ ] **ไม่ทำลายของเดิม** — `src/`, payload, `npm test`/`verify:pack`, npm `files` ไม่กระทบ; working tree dogfood คงอยู่
- [ ] **ไม่ rewrite history** (Q2) — `git rm --cached` ไปข้างหน้าพอ

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] (ไม่มี rule ใหม่) — งานนี้ทำให้ git state **compliant กับ rule §6 ที่มีอยู่แล้ว**; ไม่เกิดกฎใหม่
- [ ] **อาจเสนอ:** เพิ่ม guard/test กัน dogfood leak ซ้ำ (เช่น CI assert `git ls-files .warnyin/ .claude/` = 0) — พิจารณาตอน SHIP ว่าคุ้มทำหรือ note ใน troubleshooting พอ (emergent — รอ VERIFY ดูว่าจำเป็นไหม)
