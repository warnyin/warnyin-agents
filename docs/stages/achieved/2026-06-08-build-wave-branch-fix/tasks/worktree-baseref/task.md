# Task — worktree-baseref

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `worktree-baseref` |
| **Slice อ้างอิง** | `design.md` slice #1 (worktree เห็น dependency ครบทุก wave) |
| **Component** | BUILD orchestration tooling — `build-wave.mjs` (payload script) + adapter `build.md` + playbook `stages/build.md` + CHANGELOG |
| **Wave** | 1 (task เดียวของ topic — ไม่มี dependency) |
| **สถานะ** | `build เสร็จ ✅ (test 53/53 + runtime proof 3 เคส + lint + pack เขียว)` |

## 1. เป้าหมายของ task (vertical slice)
ให้ build sub-agent ใน worktree **sync build branch เข้า worktree ก่อนทำงาน** — worktree harness fork จาก **main** (คุมไม่ได้) จึงให้ **agent merge build branch เอง** (prompt-driven) เพื่อเห็น `docs/stages/<slug>/` (topic docs) + output ของ wave ก่อนหน้าครบ แทนที่ agent จะ improvise (KB#14). แก้ **3 ไฟล์ payload + CHANGELOG** ตาม design §3 โดยทุกจุด **unify-in-place** (ขยาย arg/step/principle เดิม ไม่สร้างกลไกขนาน) + copy contract จาก **design §4 verbatim**:
- **(a) `build-wave.mjs`** — รับ `baseRef` arg (§4.1) + แทรก prompt **step 0** (git merge contract §4.2 verbatim — รวม abort-on-conflict + retry transient lock + **hard-stop task.md ไม่ปรากฏ → STOP failed** + บันทึก `notes`) **เฉพาะ `isolate && baseRef`** ก่อน step 1
- **(b) `build.md`** (command) — step 6 ส่ง `baseRef: "<build branch>"` (§4.3) + integrate note checkout scoped src files (§4.4)
- **(c) `stages/build.md`** (playbook) — §3 principle 3 ขยาย (worktree fork จาก main → agent sync build branch) + §4 step 5 ระบุ orchestrator ส่ง baseRef
- **(d) `CHANGELOG.md`** — entry `[Unreleased]`

**ไม่มี unit test ใหม่** — build-wave เป็น agent-driven workflow script (ไม่มี harness ทดสอบ `agent()` ตรง); พิสูจน์ด้วย static check + dogfood topic ถัดไป (design §8).

## 2. Dependency
- **ต้องทำหลัง:** — (task เดียวของ topic, ไม่มี dependency ภายใน — design §7)
- **ขนานกับ:** — (wave 1 มี task เดียว)
- **ส่ง output ต่อ:** กลไก sync ครบ → VERIFY ของ topic ใช้ static check (grep `baseRef` + ordering + guard) + รอ dogfood topic ถัดไปเป็น real proof

## 3. Sub-tasks (ระบุจุดต่อไฟล์ ตาม design §3 — copy contract จาก design §4 verbatim)
- [x] 1. `src/.warnyin/workflow/scripts/build-wave.mjs` — **(arg parse, บรรทัด ~18-20)** เพิ่ม `const baseRef = A.baseRef || null` (spec §2.1 / design §4.1) + อัปเดต comment block `args = {...}` (บรรทัด ~4-8) เพิ่ม `baseRef?` _(spec §3 / design §4.1)_
- [x] 2. `src/.warnyin/workflow/scripts/build-wave.mjs` — **(`prompt()`, บรรทัด ~61-93)** แทรก step `0.` git merge contract **verbatim** (spec §2.2 / design §4.2) **ก่อน** บรรทัด `1. อ่านให้ครบ...` **เฉพาะ `isolate && baseRef`**; `!baseRef` → ไม่แทรก (backward compat); **ไม่ renumber** step 1-9; ใช้ `${baseRef}`/`${slug}`/`${task}` แทน placeholder _(spec §2.2 / design §4.2)_
- [x] 3. `src/.claude/commands/warnyin/build.md` — **step 6** (บรรทัด ~15) args เพิ่ม `baseRef: "<build branch ที่สร้าง step 4>"` (spec §2.3 / design §4.3, ชื่อจริง ไม่ hardcode pattern) + **integrate note** (บรรทัด ~16) checkout เฉพาะ scoped src files + main loop อัปเดต `task.md` ตอน integrate (spec §2.4 / design §4.4) _(unify-in-place — ขยาย args + note เดิม)_
- [x] 4. `src/.warnyin/workflow/stages/build.md` — **§3 principle 3** (บรรทัด ~31) ขยาย: worktree fork จาก **main** → agent ต้อง **sync build branch ก่อน** (กลไกใน build-wave) + **§4 step 5** (บรรทัด ~54-57) ระบุ orchestrator ส่ง `baseRef` + integrate checkout scoped — **ขยายข้อเดิม ไม่เพิ่ม principle/step ใหม่** _(design §3)_
- [x] 5. `CHANGELOG.md` — entry `[Unreleased]` (payload reliability fix — worktree sync build branch, user-facing ตาม `docs/rule.md` §2)
- [x] 6. **static check** — grep `baseRef` พบใน build-wave.mjs (arg parse + prompt) + build.md (step 6) · `node --check src/.warnyin/workflow/scripts/build-wave.mjs` ผ่าน · **ordering:** step `0.` ก่อนบรรทัด `1. อ่านให้ครบ` · **guard ครบ:** `|| (git merge --abort` + hard-stop "task.md ... ไม่ปรากฏ → ... failed" + `isolate && baseRef` + retry transient lock + บันทึก `notes`
- [x] 7. `npm test` (53/53) + `npm run lint:md` + `npm run verify:pack` เขียว

## 4. ขอบเขตไฟล์ที่จะแตะ (แก้ 4)
- **แก้:** `src/.warnyin/workflow/scripts/build-wave.mjs` · `src/.claude/commands/warnyin/build.md` · `src/.warnyin/workflow/stages/build.md` · `CHANGELOG.md`
- **ห้ามแตะ:** `src/bin/cli.mjs` · `src/scripts/verify-pack.mjs` · `src/.warnyin/workflow/scripts/validate-topic.mjs` · `src/tests/**` · docs/ กลาง (`docs/rule.md`/`docs/techstack/`/`docs/features/`) · `src/.warnyin/workflow/stages/{verify,design,ship,discovery}.md` · root dogfood (`.warnyin/`, `.claude/` ที่ root)

## 5. Acceptance criteria
- [x] ทุกไฟล์แก้ตรงพิกัดตาม design §3 (แก้ 4 ไฟล์); **ไม่ renumber/ไม่สร้างกลไกขนาน** (unify-in-place) — step `0.` นำหน้า, §3 principle 3 / §4 step 5 ขยายข้อเดิม
- [x] **contract ตรง design §4 canonical คำต่อคำ** — args §4.1, git merge contract §4.2 ฝัง verbatim ใน prompt, orchestrator arg §4.3, integrate note §4.4 (copy ไม่แต่งใหม่)
- [x] **★ hard-stop (B2)** ใน prompt: merge สำเร็จแต่ `task.md` ไม่ปรากฏ → STOP failed ห้าม improvise — **ครบ ไม่ตัดทอน**
- [x] **abort-on-conflict** — merge มี `|| (git merge --abort; <failed>)` (กันค้าง MERGE state) + **retry transient lock 1 ครั้ง** + **บันทึกผล merge ใน `notes`**
- [x] **step 0 ก่อน step 1** (ordering) + **`isolate && baseRef` guard** (`!baseRef` → ไม่แทรก = backward compat; `baseRef` optional)
- [x] **KB#11** — integrate note checkout เฉพาะ scoped `src/` files (ไม่แตะ dogfood ที่ root)
- [x] `stages/build.md` §3 principle 3 ระบุ worktree fork จาก main → sync build branch · build.md step 6 ส่ง baseRef
- [x] **static check ผ่าน** — grep `baseRef` (build-wave + build.md) + `node --check` + ordering + guard ครบ
- [x] CHANGELOG `[Unreleased]` มี entry payload change
- [x] `npm test` 53/53 + `npm run lint:md` + `npm run verify:pack` เขียว (ไม่มี regression)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical source: `../../design.md` §3 (ตารางไฟล์แก้) + §3.1 (KB#11 note) + §4.1 (args) + §4.2 (prompt step sync — git merge contract เต็ม) + §4.3 (orchestrator) + §4.4 (integrate) + §8 (test) + Design review (B2 hard-stop)
- Precedent: `docs/stages/achieved/2026-06-08-validator-status/tasks/playbook-wiring/` (pattern แก้ script+command+playbook+CHANGELOG)
