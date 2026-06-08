# Standard — worktree-baseref

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน payload (script `.mjs` + playbook/command `.md`) ที่ task นี้ต้องยึด
> **อิงจาก** `docs/rule.md` §1 (unify-in-place / canonical-copy / tool-agnostic) §2 (zero-dep / ESM / ภาษาไทย / CHANGELOG) + precedent topic `validator-status` task `playbook-wiring`

## 1. Standard กลางที่ยึด (จาก docs/rule.md)
- **canonical-copy convention** (`docs/rule.md` §1) — contract (args + prompt step + integrate note) นิยามครั้งเดียวที่ **design §4** ของ topic นี้; ทุกไฟล์ที่แก้ **copy จาก §4 เท่านั้น ห้ามแต่งใหม่ต่อไฟล์** (กัน wording เพี้ยน) — โดยเฉพาะ git merge contract §4.2 ฝัง verbatim ใน prompt
- **unify-in-place ไม่สร้างกลไกขนาน** (`docs/rule.md` §1) — ทุกจุดเป็นการ **ขยาย arg/step/principle เดิม**: build-wave เพิ่ม 1 const + แทรก step `0.` (ไม่ renumber 1-9) · build.md ขยาย step 6 args + integrate note เดิม · stages/build.md ขยาย §3 principle 3 + §4 step 5 เดิม — **ห้ามเพิ่ม principle/step/section ใหม่**
- **tool-agnostic + payload-guidance generic** (`docs/rule.md` §1) — prompt/playbook ใช้ vocab generic (git/node เป็น runtime กลางของ payload ไม่ใช่ harness-specific — อ้างได้); **ห้ามผูกชื่อรุ่น model**; กลไก worktree เป็น Claude-harness feature → playbook ระบุเป็น guidance (เครื่องอื่นทำตามหลักการ §3-§4 เอง)
- **zero-dependency + ESM** (`docs/rule.md` §2) — `build-wave.mjs` ใช้ built-in เท่านั้น (ไม่เพิ่ม import/dep); คง `import`/`export` + `args`/`agent`/`parallel` ที่ harness inject เดิม — **ไม่เพิ่ม `require`/`node:*` import ใหม่** (การแก้เป็น string + arg parse ล้วน)
- **CHANGELOG ทุก user-facing change** (`docs/rule.md` §2) — payload เปลี่ยน (reliability fix) → entry `[Unreleased]` ใน `CHANGELOG.md` (Keep a Changelog)
- **source/dogfood แยกชั้น** (`docs/rule.md` §6 / CLAUDE.md "พัฒนา repo นี้") — แก้เฉพาะ `src/.warnyin/`, `src/.claude/`, `CHANGELOG.md`; **ห้ามแตะ root dogfood** (`.warnyin/`, `.claude/` ที่ root) + docs/ กลาง

## 2. Pattern การเขียนของ task นี้
- **build-wave.mjs (arg parse):** เพิ่ม `const baseRef = A.baseRef || null` ในกลุ่ม parse เดิม (`const slug = A.slug` / `tasks` / `isolate`, บรรทัด ~18-20); อัปเดต comment `args = {...}` (บรรทัด ~4-8) ให้มี `baseRef?` — คงสไตล์ comment ไทยเดิม
- **build-wave.mjs (prompt):** `prompt(task)` สร้าง `lines[]` แล้ว `.join('\n')`; แทรก step `0.` **ก่อน** element `1. อ่านให้ครบ...` **เฉพาะ `isolate && baseRef`** — เช่น `if (isolate && baseRef) lines.unshift(...step0lines)` หรือประกอบ array ตามเงื่อนไข; ใช้ template literal แทน `<baseRef>`→`${baseRef}`, `<slug>`/`<task>`→`${slug}`/`${task}` ในข้อความ; **ห้าม renumber** step 1-9 เดิม (คงเลขเดิม — step `0.` นำหน้า)
  - git merge contract §4.2 ฝัง **verbatim** (รวม abort `|| (git merge --abort; ...)` + retry transient lock + hard-stop `task.md` ไม่ปรากฏ + บันทึก `notes`)
- **build.md (command):** step 6 args เพิ่ม `baseRef: "<build branch>"` (= ชื่อจริงที่ orchestrator สร้าง step 4 — ไม่ hardcode `build/<slug>`); integrate note ขยายให้ระบุ checkout scoped src files + main loop อัปเดต `task.md` ตอน integrate
- **stages/build.md (playbook):** §3 principle 3 ขยายในที่เดิม (worktree fork จาก main → sync) + §4 step 5 ระบุ orchestrator ส่ง baseRef — **ต่อความในข้อเดิม ไม่เพิ่มข้อ**
- **investigate-before-edit** (`docs/rule.md` §1) — ก่อนแก้แต่ละไฟล์ อ่านบริเวณเดิม (build-wave §arg/§prompt · build.md step 6 · build.md §3/§4) ให้เห็นถ้อยคำ/schema/จุดต่อที่ถูก แล้วขยายตรงที่ design §3 ระบุ; ยืนยันแก้ที่ `src/` ไม่ใช่ root
- **ภาษา:** ไทยตามสไตล์ `cli.mjs`/playbook เดิม; canonical key (`baseRef`, `git merge`, `git merge --abort`, `task.md ... ไม่ปรากฏ`, `notes`, `isolate && baseRef`) เขียนตรงตัวให้ grep จับได้

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **canonical source:** `docs/stages/build-wave-branch-fix/design.md` §3 (ตารางไฟล์แก้) + §4.1 (args) + §4.2 (prompt step sync — git merge contract เต็ม) + §4.3 (orchestrator ส่ง baseRef) + §4.4 (integrate note) + §8 (test) + Design review (B2 hard-stop) — **copy จากที่นี่ (อย่าเรียบเรียงใหม่)**
- **ของเดิมที่ reuse (ไม่เขียนใหม่):** `RESULT_SCHEMA.notes` field (มีอยู่แล้ว — ใช้บันทึกผล merge ไม่เพิ่ม field ใหม่) · prompt `lines[]`/`isolate` block เดิม (แทรกในโครงเดิม)
- **precedent:** topic `validator-status` task `playbook-wiring` (`docs/stages/achieved/2026-06-08-validator-status/tasks/playbook-wiring/`) — pattern เดียวกัน: แก้ **script + command + playbook + CHANGELOG**, canonical-copy จาก design, sub-task ระบุ § ต่อไฟล์, consistency/static check ปิดงาน, unify-in-place (ขยายของเดิม ไม่เพิ่มกลไกขนาน)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- **KB#11 (tracked-deletion):** main loop integrate ด้วย `git checkout <branch> -- <scoped src files>` — scope เป็น `src/` ล้วน จึงไม่แตะ dogfood path ที่ root → ปลอดภัยจาก KB#11 (lesson: untrack ของที่ track อยู่ → merge เข้า branch ที่ track ต่างจาก main = ลบ working tree dogfood); ระบุใน integrate note (design §3.1)
- **static check ปิดงาน:** ใช้ grep/`node --check` (ไม่มี unit harness สำหรับ `agent()`) — **ordering check** (step 0 ก่อน step 1) บังคับ ไม่ใช่แค่ existence; dogfood topic ถัดไป = real proof (KB#13: self-report เขียวปลอมได้ → dogfood แข็งกว่า)
- **backward compat:** `baseRef` optional — assert ว่า `!baseRef` → ไม่แทรก step 0 (พฤติกรรมเดิม) ใน static review
