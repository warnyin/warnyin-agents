# Build report — build-log-narrative

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`
> build branch: `build/build-log-narrative` · isolation: **shared-tree (`isolate:false`)** · 1 wave / 1 task

## 1. ผลต่อ task
| task | wave | status | test/lint |
|---|---|---|---|
| build-log-narrative | 1 | ✅ passed | npm test 58/58 · lint:md เขียว · schema 8/8 · template exact · trace 5/5 |

ครบ 4 sub-task (vertical slice end-to-end):
- **(a) schema** — เพิ่ม `events[]` ใน `RESULT_SCHEMA` (`build-wave.mjs`): optional, `maxItems:10`, `kind` enum `[start,decision,error,done]` + `note` required, **ไม่อยู่ root `required`** (backward-compat); prompt เติมข้อ **8.1** ชี้นิยาม §3.1 (ไม่ duplicate wording)
- **(b) compose wiring** — command `build.md` เพิ่มขั้นเขียน build-log.md (ดึง `result.results[].events` → append `## Wave N` + `## Full gate`, ไอคอน mapping inline, graceful จาก summary+status, ไม่จด status board); playbook `build.md` เพิ่ม principle #13 + Output row + Gate item
- **(c) template** — สร้าง `src/.warnyin/template/stages/[topic]/build-log.md` = canonical §3.2 **คำต่อคำ** (exact-match กับ design)
- **(d) test** — structural + executable trace **5/5 proxy** (ไม่เพิ่มไฟล์ `.test.mjs` — D1; ผล trace → เขียนลง `verify.md` ตอน VERIFY)

## 2. Full build & test gate (main loop รันซ้ำบน build branch)
- `npm test` → **tests 58 / pass 58 / fail 0 / skip 0** · `check-test-count.mjs` ผ่าน (pass==tests==58)
- `lint:md` → เขียว (81 ไฟล์ / 44 ลิงก์ resolve)
- **0 รอบแก้** (เขียวรอบแรก)
- ⚠️ `node --check build-wave.mjs` = **false-red** (pre-existing — Workflow script ไม่ใช่ ES module) → validate schema ด้วย object-literal parse แทน (ดู `troubleshooting.md`)

## 3. ไฟล์ที่แตะ (src/ — SOURCE layer; dogfood ที่ root regen ตอน release)
- `src/.warnyin/workflow/scripts/build-wave.mjs` (schema + prompt 8.1)
- `src/.claude/commands/warnyin/build.md` (ขั้น compose build-log.md)
- `src/.warnyin/workflow/stages/build.md` (principle #13 / Output / Gate)
- `src/.warnyin/template/stages/[topic]/build-log.md` (**ใหม่** — allowlist `src/.warnyin` ครอบ ไม่ต้องแก้ packaging)
- `docs/stages/build-log-narrative/tasks/build-log-narrative/task.md` (สถานะ + acceptance)

## 4. Integration notes
- **shared-tree** (เลือกเพราะ DESIGN artifacts ของ topic ยัง untracked → worktree clean checkout อ่านไม่เจอ + 1 task ไม่ต้อง parallel) → ไม่มี merge/conflict
- ไม่แตะ `parallel()`/worktree flow, `validate-topic.mjs` (build-log.md นอก `STAGE_FILES`), `docs/` กลาง — ยืนยันด้วย `git diff`
- **self-dogfood** (§8 C): live schema (root dogfood) ยังไม่มี `events` → main loop เขียน `build-log.md` ของ topic นี้เองตาม canonical = artifact จริง + พิสูจน์ format; auto active หลัง `--update`/release ถัดไป
- rule ใหม่ (BUILD ผลิต observability artifact `build-log.md`) note ใน `tasks/build-log-narrative/rule.md §2` — **รอ SHIP** สร้าง `docs/techstack/workflow-core/`

## 5. Gate → เข้า VERIFY
- [x] task implement + อยู่บน build branch
- [x] task passed (test/lint เขียว) — ไม่มี failed/skipped
- [x] ไม่มี merge conflict
- [x] full build เขียว (npm test 58/58, ไม่มี build error)
- [x] test suite ทั้งหมดเขียวบน build branch
- [x] `build.md` + `build-log.md` ครบ
- [x] ไม่แตะ rule/standard กลางใน `docs/` (rule ใหม่ note รอ SHIP)

→ พร้อม **VERIFY**: `/warnyin:verify build-log-narrative`
