# Rule — add-md-lint

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack/project)
- [ ] **zero-dependency** (`docs/rule.md` §2) — node:* ล้วน; devDeps ต้องว่างเสมอ (acceptance)
- [ ] **ESM + import.meta.url** (`docs/rule.md` §2)
- [ ] **gate testable: pure fn + main-guard** (`docs/techstack/installer/rule.md`) — `checkLinks` pure (inject `exists`) + guard กัน import trigger main
- [ ] **acceptance = pass count** (`docs/rule.md` §5) — `pass==tests` ≥ MIN_PASS(9); เพิ่มเคส count ขึ้น ไม่ลด/ไม่ disable
- [ ] **npm scripts cross-platform** (`docs/rule.md` §2) — `path` API, ไม่ hardcode separator
- [ ] **CI security baseline** (`docs/rule.md` §3.1) — job ใหม่: `permissions: contents:read` (top-level มีแล้ว), pin action SHA, ไม่ใส่ `npm ci`/`secrets` (คง zero-dep, ไม่มี lockfile)
- [ ] **investigate-before-edit** (`docs/rule.md` §1) — อ่าน `verify-pack.mjs` + `ci.yml` ก่อน mirror (main-guard เป๊ะ, SHA เดิม)
- [ ] **ไม่ทำลายของเดิม** — ไม่แตะ payload/src behavior; `npm test`+`verify:pack` เขียว

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP — promote เข้า `docs/rule.md` / techstack)
- [ ] rule ที่เสนอ: **zero-dep lint gate convention** — งาน lint/format ของ repo ทำเป็น **node:* script เอง (pure fn + main-guard + CI job)** ไม่เพิ่ม devDeps (markdownlint/prettier) — เหตุผล: รักษา zero-dep (จุดขาย); pattern เดียวกับ verify-pack/check-test-count; placement: ยืนยันตอน SHIP (`docs/rule.md` §2 หรือ techstack/installer)
- [ ] อาจเสนอ: **strip-code-before-link-match** เป็น standard ของ md-tooling (กัน false-positive) — พิจารณา SHIP
