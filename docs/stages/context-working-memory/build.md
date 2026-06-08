# Build — context-working-memory

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`

| | |
|---|---|
| **Slug** | `context-working-memory` |
| **Build branch** | `build/context-working-memory` |
| **Isolation** | shared-tree sequential (แต่ละ wave 1 task — ไม่มี parallelism) |
| **สถานะ** | `BUILD ผ่าน — full gate เขียว` |

## 1. ผลต่อ task (ตาม wave / dependency)

### Wave 1 — `context-skeleton-seed` → ✅ passed
- สร้าง template `src/.warnyin/template/stages/context.md` (4 section working-notes ตาม canonical design.md §3)
- แก้ `src/bin/cli.mjs`: `ensureScaffold()` seed context.md จาก template (seed-if-absent); `SCAFFOLD_FILES` เปลี่ยนเป็น object form `{dest, tplRel}` (tplRel=null = ไฟล์ว่าง)
- test เคส 10-14 (seed-fresh / no-overwrite install / no-overwrite --update / dry-run / legacy-empty)
- CHANGELOG entry (Added)
- commit: `40be608`

### Wave 2 — `ship-maintenance-wiring` → ✅ passed
- `ship.md` §4 ข้อ 4: SHIP เป็น producer — append "เพิ่ง ship" + prune N=5 + อัปเดตโฟกัส; gate §6 เพิ่ม item; ระบุชัด "ไม่จด status board" (unify-in-place)
- readers `next.md`/`discovery.md`/`explore.md`: wording ชัดว่า context.md = working-notes ชี้ canonical เดียว; `next.md` read-only invariant คงเดิม
- commit: `5980279`

## 2. Full build & test gate (บน build branch หลัง integrate)
- `npm test` (node --test): **tests 58 / pass 58 / fail 0** (ขึ้นจาก 53) — ผ่าน `check-test-count` (pass==tests ≥ MIN_PASS 9)
- `node --check src/bin/cli.mjs`: OK
- `node validate-topic.mjs context-working-memory`: ✓ โครงครบ (structural)
- `lint-md`: ✓ 81 ไฟล์ 44 ลิงก์
- → **เขียวทั้งหมด 0 รอบแก้**

## 3. Integration notes
- shared-tree: main loop commit ให้ทั้ง 2 wave (agent ไม่ commit เอง)
- `package-lock.json` (untracked) **ไม่ commit** — repo zero-dep ไม่มี lockfile โดยตั้งใจ (ไฟล์หลงจาก npm install)
- root dogfood `.warnyin/workflow/` **ไม่ถูกแก้** (task แตะเฉพาะ `src/`) — จะ sync ตอน release/`--update`; ดังนั้นพฤติกรรมใหม่จะเห็นผลใน repo นี้เองหลัง `--update` (ไม่กระทบ gate)

## 4. Troubleshooting (ยกขึ้น KB ตอน SHIP)
| title | root cause | solution | prevention |
|---|---|---|---|
| `verify-pack.mjs` fail บน Windows local: `spawnSync npm ENOENT` | Windows npm = `npm.cmd`; `spawnSync('npm',…)` ไม่มี shell หา exe ตรงไม่เจอ — เป็น env quirk ของ local ไม่เกิดบน CI (Linux) | cross-check payload ด้วย `npm pack --dry-run --json` ตรงจาก shell (PowerShell resolve `.cmd`) | แยก env error (spawnSync npm) ออกจาก assertion error (ไฟล์ leak/ขาด) — อย่าตีความเป็น regression ของ change |

## 5. learned-rule candidate (รอ SHIP — มี evidence)
- *(installer)* scaffold file ที่เป็น user working-doc (เช่น context.md) ต้อง seed จาก template + seed-if-absent — ห้ามอยู่ใน CORE/overwrite · evidence: `cli.mjs` diff + test 11/12/14 · note ใน `tasks/context-skeleton-seed/rule.md` §2
- *(project)* working-memory (context.md) เก็บเฉพาะสิ่งที่ derive ไม่ได้ — status/stage ให้ NEXT derive ไม่จดซ้ำ · evidence: grep `context.md` ทั่ว `src/.warnyin/workflow/` + ship.md §4.4 + next.md:18/46 · note ใน `tasks/ship-maintenance-wiring/rule.md` §2

## 6. Gate → VERIFY
- [x] ทุก task implement + integrate เข้า build branch
- [x] ทุก task `passed` — ไม่มี `failed`
- [x] ไม่มี merge conflict (shared-tree sequential)
- [x] Full build ผ่าน — ไม่มี error
- [x] test suite เขียวทั้งหมด (58/58)
- [x] ไม่แตะ rule/standard กลางใน `docs/` (learned-rule note รอ SHIP)
