# Rule — spec-template

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack/project)
- [ ] **tool-agnostic** (`docs/rule.md` §1) — template เป็น `.md` ล้วน ทุก harness อ่านได้; ไม่ผูก tool/runtime/ชื่อรุ่น
- [ ] **single source of truth** (CLAUDE.md) — copy โครง/header จาก design §4.1 เป๊ะ ห้ามแต่งใหม่
- [ ] **template ระดับ feature ต้องอยู่ใต้ `[...]` เท่านั้น** — `seedDocs` ข้ามโฟลเดอร์ขึ้นต้น `[` (`src/bin/cli.mjs:133-134`); วางชื่อ concrete = seed leak ลง target
- [ ] **mirror layout `src/` = target paths** (`docs/techstack/installer/rule.md`) — `src/.warnyin/template/docs/features/[feature-name]/spec.md` install ไป `docs/features/<name>/spec.md` ตรง path
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ที่ `src/.warnyin/template/` เท่านั้น; **ห้ามแตะ root dogfood** (`.warnyin/` ที่ root = gitignored)
- [ ] **lint-md dead-link** (`docs/rule.md` §2) — ลิงก์ใดๆ ในไฟล์ (ถ้ามี) ต้อง resolve; `npm run lint:md` ผ่าน
- [ ] **investigate-before-edit** (`docs/rule.md` §1) — อ่าน `feature.md`/`business.md` ในโฟลเดอร์เดิมก่อน ให้สไตล์ header/comment ตรงกัน
- [ ] **ไม่ทำลายของเดิม** — `npm test` เขียว + `npm run verify:pack` เขียว (template ติด tarball)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP — promote เข้า `docs/techstack/installer/rule.md`)
- [ ] rule ที่เสนอ: **template ระดับ feature ต้องอยู่ใต้โฟลเดอร์ `[...]` เสมอ (seedDocs skip invariant)** —
  - template ที่เป็นแม่แบบ per-feature (ผู้ใช้ copy เป็นชื่อจริงเอง) ต้องวางใต้โฟลเดอร์ขึ้นต้น `[` เท่านั้น; วางชื่อ concrete ใน `template/docs/` = `seedDocs` จะ seed ลง target จริงเป็น scaffold leak
  - **evidence:** design review Infra-S1 (design.md §4.1, §8 sandbox assert) + `src/bin/cli.mjs:133-134` (`if (entry.name.startsWith('[')) continue`)
  - **scope:** `component:installer` → `docs/techstack/installer/rule.md`
  - เหตุผล: invariant ของ installer payload — กัน seed leak ที่ตรวจยากตอน review; เหมาะอยู่กับ rule ของ component installer มากกว่า `docs/rule.md` (panel ปฏิเสธ note ใน `docs/infra.md`)
