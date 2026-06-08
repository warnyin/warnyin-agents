# Rule — workflow-core

> rule เฉพาะ component **workflow-core** (BUILD orchestration: `build-wave.mjs` + playbook/command `build.md`) · rule ระดับโปรเจกต์อยู่ `docs/rule.md`

## observability artifact ของ BUILD
- **BUILD ผลิต observability artifact แบบ narrative (`build-log.md`)** — เหตุการณ์สำคัญระหว่าง fan-out (start/decision/error/done) ถูก **sub-agent คืนผ่าน schema** (`build-wave.mjs` RESULT_SCHEMA field `events[]`) เพราะ agent ใน worktree **เขียน topic dir ไม่ได้** (`docs/troubleshooting.md` #14); **main loop กลั่นเขียนเอง** หลังแต่ละ wave (pattern เดียวกับเขียน `troubleshooting.md`). เล่า "ระหว่างทาง" **ไม่จด status board** (ชนิด/ผลต่อ task เต็มอยู่ `build.md` — ชี้ไปแทน, honors `unify-in-place`) — evidence: topic `build-log-narrative` (schema diff `events[]` + self-dogfood `achieved/2026-06-08-build-log-narrative/build-log.md` + executable trace 5/5 `…/verify.md` §2)
- **narrative = AI judgment ไม่ใช่ pure function** — การกลั่นเหตุการณ์เป็นเรื่องเล่าทำใน **instruction ของ playbook/command** (main loop เขียน) ไม่ทำเป็น `composeBuildLog()` deterministic (ไม่ over-engineer; honest "narrative ไม่ใช่ dump" วัดด้วย structural proxy แทน subjective)

## validate Workflow script
- **อย่า validate Workflow script ด้วย `node --check`** — script ที่รันใน Workflow runtime (`build-wave.mjs`) มี **top-level `return`/`await`** + global ที่ runtime inject (`parallel`/`agent`/`log`/`phase`/`args`) → ไม่ใช่ ES module ปกติ → `node --check` ขึ้น `Illegal return statement` (exit 1) **เสมอ (false-red) ไม่เกี่ยวกับการแก้**. validate ด้วยการ **parse object literal ที่ต้องการ** (brace-match → `new Function('return …')`) + พิสูจน์ pre-existing ด้วย `git stash` diff แทน — evidence: topic `build-log-narrative` (`docs/troubleshooting.md` #16 · `achieved/2026-06-08-build-log-narrative/verify.md` §4)
- ผล: **acceptance/spec ห้ามอ้าง `node --check <workflow-script>` เป็นเกณฑ์ผ่าน** (เป็นไปไม่ได้เชิงเทคนิค) — ใช้ "schema parse N/N check" + executable trace แทน

## BUILD integration / isolation
- **shared-tree เมื่อ task files ยัง untracked** — worktree isolation (`isolate:true`) สร้าง **clean checkout จาก commit** → ถ้า DESIGN artifacts ของ topic (`docs/stages/<slug>/tasks/*/*.md`) ยัง **untracked** (ยังไม่ commit) → agent ใน worktree **อ่าน task ไม่เจอ**. กรณีนี้ใช้ **shared-tree (`isolate:false`)** (และเมื่อ 1 task ก็ไม่เสีย parallelism) — หรือ commit artifacts ก่อนถ้าต้องการ worktree — evidence: topic `build-log-narrative` (`achieved/2026-06-08-build-log-narrative/build.md` §4 integration notes)

## ทั่วไป (สืบทอด global)
- **zero-dependency + ESM** — `build-wave.mjs`/`validate-topic.mjs` ใช้เฉพาะ built-in (`node:*`); ไม่เพิ่ม dependency
- **tool-agnostic** — playbook/command เป็น `.md` กลางที่ทุก harness อ่านได้; artifact (`build-log.md`) harness สร้างเองตาม playbook generic — ห้ามผูกชื่อ tool/model ใน wording (เช่นไม่อ้าง `/workflows` ของ Claude Code เป็นกลไกหลัก)
- **canonical-copy convention** (`docs/rule.md`) — wording ที่กระจายหลายไฟล์ (เช่น kind 4 ค่า + นิยาม + mapping ไอคอน + โครง artifact) ต้องมี **canonical เดียว** (design ของ topic / template) แล้วที่อื่น = pointer copy คำต่อคำ (กัน emit↔compose drift — สองฝั่งของ contract เดียว)
- **backward-compat ของ RESULT_SCHEMA** — เพิ่ม field ใหม่เป็น **optional** (ต่อท้าย `properties`, **ไม่อยู่ root `required`**) เพื่อไม่ทำลาย result/agent เดิม + ไม่แตะ flow `parallel()`/worktree
