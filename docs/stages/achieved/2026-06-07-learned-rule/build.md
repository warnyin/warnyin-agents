# Build — learned-rule

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`

## 1. Execution plan ที่เดิน
- **DAG:** 1 wave / 1 task (`add-learned-rule` — ไม่มี dependency)
- **Isolation:** shared-tree (`isolate:false`) — main loop commit ให้
- **Build branch:** `build/learned-rule` (จาก main)

## 2. ผลต่อ task
| Task | สถานะ | test | ไฟล์ที่แก้ |
|---|---|---|---|
| `add-learned-rule` | ✅ passed | npm test 18/18, verify:pack 72 ไฟล์ | `stages/ship.md`, `commands/warnyin/ship.md`, `template/stages/[topic]/ship.md` |

**สิ่งที่ทำ (canonical wording จาก design §2, 3 surface):**
- `stages/ship.md` §3 principle 7 — **ขยายในที่เดิม** ("เก็บ รอ SHIP" → planned+emergent + evidence(บังคับ)+scope+user-confirm; learned-rule = กฎ generalize ≠ incident)
- `stages/ship.md` §4 — step 1 collect candidate (planned `tasks` + emergent build/verify/troubleshooting), step 3 fold ตารางเข้า approval (ยืนยัน per-rule), step 5 promote-by-scope
- `stages/ship.md` §6 gate — item learned-rules พิจารณาครบ (evidence+ยืนยัน+ตัดมีเหตุผล) **แก้ในที่เดิม**
- `commands/warnyin/ship.md` — mirror step 3 (collect) + step 5 (fold approval) + step 7 (promote-by-scope)
- `template/stages/[topic]/ship.md` §3 — แทน "note รอ SHIP ตัดทิ้ง" → section "Learned rules" (4 คอลัมน์: rule | evidence | scope | promote?)
- global continuous-learning bullet → `tasks/add-learned-rule/rule.md` §2 (รอ SHIP → `docs/rule.md` §1)

## 3. Full build & test gate (หลัง integrate)
- ✅ `npm test` = **18/18 pass** (fail 0) — ไม่กระทบ test เดิม (installer test = black-box, ไม่ assert เนื้อหา `.md` ตาม design §6)
- ✅ `npm run verify:pack` = **ผ่าน 72 ไฟล์**; `npm pack --dry-run` ยืนยัน template `[topic]/ship.md` ติด tarball (allowlist `src/.warnyin` ครอบ)
- ✅ structural grep: emergent/evidence (§3), learned (§6 gate), command mirror, template section ครบ

## 4. Integration notes
- shared-tree, แตะเฉพาะ `src/` (3 ไฟล์) — ไม่แตะ `docs/rule.md` central, ไม่แตะ root dogfood (ยืนยัน `git diff --name-only` ไม่มี `.warnyin/`/`.claude/` ที่ root)
- **unify สำเร็จ:** principle 7 + gate item ขยาย**ในที่เดิม** ไม่สร้างกลไกขนาน — note "รอ SHIP" กลายเป็น subset (planned) ของ learned-rule (ตาม standard §2)
- template แก้ที่ `src/.warnyin/template/` (source, git-tracked) — ไม่ใช่ root (ยืนยันตาม design §9)
- ไม่มี conflict · 0 รอบแก้ (gate เขียวรอบแรก)
- commit: `8e004b6` บน `build/learned-rule`

## 5. Gate → VERIFY
- [x] ทุก task implement + merge เข้า build branch
- [x] ทุก task `passed` — ไม่มี failed ค้าง
- [x] ไม่มี merge conflict
- [x] full build ผ่าน (doc-only — verify:pack = packaging gate)
- [x] test suite เขียวทั้งหมด (18/18)
- [x] `build.md` สรุปครบ
- [x] ไม่แตะ rule/standard กลางใน `docs/` (global bullet note รอ SHIP)

→ พร้อมเข้า VERIFY ด้วย `/warnyin:verify learned-rule`
