# Task — build-log-narrative

> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ — self-contained (1 task ของ topic, ครบ slice end-to-end)

| | |
|---|---|
| **Task** | `build-log-narrative` |
| **Slice อ้างอิง** | `design.md` slice #1 (รวม emit+compose ตาม panel Tech Lead) |
| **Component** | `workflow-core` (build orchestration) |
| **สถานะ** | `build เสร็จ — full gate เขียว 58/58` |

## 1. เป้าหมายของ task (vertical slice)
`docs/stages/<slug>/build-log.md` = **narrative timeline เกิดจริงตอน BUILD fan-out** — sub-agent คืน `events[]` (จุดเปลี่ยนสำคัญ) ผ่าน RESULT_SCHEMA, main loop กลั่นเขียนเป็นเรื่องเล่าหลังแต่ละ wave (end-to-end: schema → orchestration → playbook → template → test)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: — (1 task ของ topic — เริ่มได้เลย)
- ปลดล็อกให้: — (task เดียว)
- sub-task เรียงในตัว: (a) schema → (b) compose wiring → (c) template → (d) test (schema freeze ใน `design.md §3` = canonical ที่ b/c copy ตาม)

## 3. Sub-tasks
- [x] a. `src/.warnyin/workflow/scripts/build-wave.mjs` — เพิ่ม `events[]` ใน `RESULT_SCHEMA` (canonical `design.md §3.1`: `maxItems:10`, items `kind` enum 4 ค่า + `note` required, **`events` ไม่อยู่ใน root `required`**) + เติม **1 ข้อกระชับใน `prompt()`** ให้ agent บันทึกจุดเปลี่ยน (start/decision/error/done) — ชี้นิยาม §3.1 ไม่แต่ง wording ใหม่ — _ผลลัพธ์:_ agent คืน events ผ่าน schema · **DONE** (schema 8-check ผ่าน, prompt ข้อ 8.1 เติมแล้ว ชี้ §3.1)
- [x] b. `src/.claude/commands/warnyin/build.md` — เพิ่มขั้น "เขียน build-log.md": หลัง workflow คืนผล wave → ดึง `result.results[].events` (เหมือน `:18` ดึง troubleshooting) → append `## Wave N` ลง `docs/stages/<slug>/build-log.md` (narrative ตาม §3.2); หลัง full gate → `## Full gate`. **+ `src/.warnyin/workflow/stages/build.md`**: principle (observability artifact) + Output entry + Gate item — _ขึ้นกับ a:_ ใช้ field events · **DONE** (command ข้อ 6 + ข้อ 7 + note ท้าย; playbook principle #13 + Output row + Gate item)
- [x] c. `src/.warnyin/template/stages/[topic]/build-log.md` — สร้าง template (copy โครง `design.md §3.2` **คำต่อคำ** — canonical-copy) ให้ consistent กับ build.md/troubleshooting.md template เดิม · **DONE** (template body == §3.2 EXACT MATCH ยืนยันด้วย script เทียบคำต่อคำ)
- [x] d. test — structural (schema/playbook/template) + executable trace (feed synthetic results → 5 proxy). **★ executable trace = manual proof เขียนผลใน `verify.md` ตอน VERIFY** (เหมือน dogfood-sim ของ context-working-memory) — **ห้ามเพิ่มไฟล์ `.test.mjs` ใหม่** (build-wave.mjs import ไม่ได้ + จะทำ test count เกิน 58 ที่ acceptance ตรึงไว้) — _dry-run D1_ · **DONE** (structural ✓ schema/playbook/template; executable trace 5/5 proxy ผ่าน — proof script รันแล้ว ไม่เพิ่มไฟล์ test; regression 58/58 + lint-md เขียว)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **แก้:** `src/.warnyin/workflow/scripts/build-wave.mjs` (RESULT_SCHEMA + prompt), `src/.claude/commands/warnyin/build.md` (ขั้น compose), `src/.warnyin/workflow/stages/build.md` (principle/Output/Gate)
- **สร้าง:** `src/.warnyin/template/stages/[topic]/build-log.md`
- **ห้ามแตะ:** `validate-topic.mjs` (build-log.md นอก `STAGE_FILES` อยู่แล้ว — ไม่ต้องแก้), flow `parallel()`/worktree ใน build-wave.mjs, `docs/` กลาง (rule ใหม่ note รอ SHIP)

## 5. Acceptance criteria
- [x] **schema:** `RESULT_SCHEMA.events` = array (`maxItems:10`), items `kind` enum `[start,decision,error,done]` + `note` required, `events` **ไม่อยู่ใน** root `required`; schema เดิมครบ; `node --check src/.warnyin/workflow/scripts/build-wave.mjs` ผ่าน — _structural_ · **PASS** (parse RESULT_SCHEMA → 8/8 check; `node --check` ขึ้น `Illegal return statement` = **pre-existing** บน HEAD เพราะ script body มี top-level `return`/`await` ของ Workflow runtime ไม่ใช่ ES module — ยืนยันด้วย `git stash` diff ว่า error เดียวกันก่อนแก้; schema validation จึงทำด้วยการ parse object literal แทน — ดู troubleshooting)
- [x] **compose wiring:** command `build.md` มีขั้นเขียน build-log.md (ดึง `result.results[].events`, append `## Wave N`); playbook `build.md` มี principle + Output entry + Gate item — _structural_ · **PASS**
- [x] **template:** `[topic]/build-log.md` โครงตรง canonical `design.md §3.2` คำต่อคำ (header + 4 kind + ไอคอน + คำเตือน "ไม่ใช่ status board") — _structural_ · **PASS** (EXACT MATCH ยืนยันด้วย script)
- [x] **executable trace:** feed synthetic `results[]` (≥2 task, 1 มี events ครบ 4 kind, 1 ไม่มี events) → เดินกติกา compose ด้วยมือ → build-log.md ผ่าน **5 proxy**: (1) `## Wave N` ครบ (2) bullet kind ∈ 4 ค่า + ไอคอนตรง (3) task ไม่มี events → graceful จาก summary+status (4) ไม่มี markdown table สถานะ (ชี้ build.md แทน) (5) events/task ≤ 10 — _design §8 B_ · **PASS 5/5** (proof script รันแล้ว — ผลเขียนลง verify.md ตอน VERIFY ตาม D1, ไม่เพิ่มไฟล์ test)
- [x] **regression:** `npm test` → **pass == tests == 58** (ไม่มี skip, ผ่าน check-test-count) — **ไม่เพิ่มไฟล์ test ใหม่ (count คง 58; executable trace เป็น manual proof ใน verify.md — D1)**; `lint-md` เขียว; `node --check` build-wave.mjs ผ่าน — _design §8 D_ · **PASS** (`npm test` 58/58 0 fail 0 skip; pass-count gate OK pass==tests==58; `lint:md` exit 0 81 ไฟล์/44 ลิงก์)
- [x] ทำตาม `rule.md` + `standard.md` (tool-agnostic, canonical-copy, backward-compat optional, zero-dep, unify-in-place) · **PASS** (events optional ไม่อยู่ root required = backward-compat; template/prompt/command = pointer copy §3 คำต่อคำ; ไม่เพิ่ม dep; build-log เล่า "ระหว่างทาง" ไม่จด status board)

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical schema + โครง build-log.md: `../../design.md` §3 · contract: §4 · test: §8
