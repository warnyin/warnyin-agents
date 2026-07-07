# Stage: BUILD

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: ลงมือทำ task ที่ DESIGN เตรียมไว้ โดย **fan-out sub-agent อัตโนมัติต่อ task ตาม dependency**
> **Context profile:** สวมโหมด `build` (`.warnyin/workflow/contexts/build.md`) — session-level posture ของ stage นี้

---

## 1. BUILD คืออะไร / ใช้เมื่อไหร่

ใช้เมื่อ DESIGN ผ่าน Gate แล้ว มี `tasks/<task>/` ครบ (task.md + spec.md + standard.md + rule.md)
BUILD จะ **orchestrate การ implement** โดยกระจายงานเป็น sub-agent หนึ่งตัวต่อหนึ่ง task/slice และเดินตาม dependency graph

> **★ fast-track hook:** ถ้า topic เป็น tier `fast` (จาก `/warnyin:triage`) → **code-first** ตาม [fast-track skip-list](../triage.md#fast-track-skip-list) — main loop แก้โค้ดเอง ไม่เรียก build-wave/ไม่ fork worktree; **correctness floor คงไว้:** full-gate เขียว (blocking, §3 ข้อ 8) · config-protection (§3 ข้อ 12) · investigate-before-edit (§3 ข้อ 11) · ห้ามแตะ rule/standard กลาง (§3 ข้อ 6). tier `standard`/`large` → flow เต็มด้านล่าง (hook นี้ N/A ไม่ลด bar)

---

## 2. Input ที่ต้องอ่านก่อนเริ่ม

1. `docs/stages/<slug>/design.md` — dependency graph ระหว่าง task/slice (section 7)
2. `docs/stages/<slug>/proposal.md` — scope ของ change
3. `docs/stages/<slug>/tasks/<task>/task.md` ทุกใบ — dependency ของแต่ละ task + sub-tasks
4. `docs/techstack/<component>/rule.md` + `standard.md` — กฎ/มาตรฐานที่ต้อง follow

---

## 3. หลักการทำงาน (operating principles)

1. **ถาม user ยืนยัน "ครั้งเดียวก่อนเริ่ม"** — แสดง execution plan (DAG + wave ไหนรัน parallel + isolation) ให้ user อนุมัติ แล้วจึง fan-out อัตโนมัติ ไม่ถามซ้ำระหว่างทาง
2. **Fan-out ตาม dependency (wave-based)** — จัด task เป็น "wave" ตาม topological order ของ dependency:
   - task ใน wave เดียวกัน = independent → รัน **parallel**
   - ข้าม wave = มี dependency → wave ถัดไปเริ่มหลัง wave ก่อนหน้ารวมผลเสร็จ
3. **Worktree isolation ต่อ task** — 2 mode ตามขนาด wave:
   - wave **≥2 task** → worktree ต่อ task: แต่ละ parallel task ทำใน git worktree ของตัวเอง ไม่แก้ไฟล์ชนกัน; **★ worktree fork จาก main (คุมไม่ได้) → agent ต้อง sync build branch ก่อน** — harness fork worktree จาก main จึงยังไม่เห็น `docs/stages/<slug>/` (topic docs) + output ของ wave ก่อนหน้า; build-wave สั่ง agent `git merge <baseRef>` (= build branch) เป็น step แรกก่อนอ่าน task เพื่อให้เห็น dependency ครบ (กลไกอยู่ใน `build-wave.mjs` — orchestrator ส่ง `baseRef` เข้ามา)
   - wave **เดี่ยว** → `isolate:false` shared tree บน working tree จริง: **orchestrator checkout build branch ก่อนรัน wave** (กัน commit ตกลง main), agent **ไม่ commit เอง** (guard เดิมใน build-wave), main loop review แล้ว commit
   - ถ้า target ไม่ใช่ git repo → fallback เป็น **sequential shared-tree** (ทีละ task ตาม dependency)
4. **แต่ละ build agent ต้อง self-verify (scope = component ตัวเองเท่านั้น)** — implement → รัน test-flow ใน `spec.md` + build/lint **ของ component ที่ task นั้นแตะ (unit + lint ของ component นั้น) ไม่ใช่ทั้ง repo** → **ต้องผ่านก่อนถึง mark passed**; ถ้าแก้ไม่ได้ให้รายงาน `failed` พร้อมเหตุผล **ห้ามรายงานผ่านทั้งที่ยังแดง** — **cross-component / integration / e2e ไม่ต้องรันต่อ task** (เลื่อนไป full-gate ข้อ 8 / §4 ข้อ 6) กันรันซ้ำเสียเวลา
5. **เคารพ standard/rule ของ task** — ทำตาม `standard.md` (pattern โค้ด, reuse shared component) และ `rule.md` (กฎ) อย่างเคร่งครัด; เขียนน้อยที่สุดตาม decision hierarchy (YAGNI→stdlib→native→dep→one-liner→ขั้นต่ำ) — ดู [`minimalism`](../minimalism.md)
6. **ห้ามแตะ rule/standard กลางใน `docs/`** — rule ใหม่ที่เสนอถูก note ไว้ใน `tasks/<task>/rule.md` แล้ว รอ SHIP ค่อยอัปเดตไฟล์กลาง
7. **fail = หยุดที่ wave นั้น** — ถ้า task ใน wave ล้ม ให้รายงาน user ก่อนไป wave ถัดไป (เพราะ wave ถัดไปอาจ depend อยู่)
8. **★ ปิดท้ายด้วย full build + full test เสมอ (blocking gate — ห้ามลด bar)** — หลัง merge ทุก wave แล้ว ต้องรัน build ทั้งหมด + test suite ทั้งหมด (รวม unit test) + cross-component/integration บน build branch ที่ integrate; **แก้วนจนเขียวหมด** ก่อนปิด BUILD (กันกรณี task รายเดี่ยวเขียวแต่พอรวมกันแล้วพัง) — **gate นี้คงเป็น blocking เสมอ** การที่ข้อ 4 ลด self-verify ของ agent เหลือ scope component เดียว **ไม่ได้ลดความเข้มของ full-gate** (integration coverage ย้ายมารวมที่นี่ ไม่ใช่ตัดทิ้ง); ห้ามแปลง gate นี้เป็น optional/informational เพื่อให้ "ดูเร็วขึ้น"; fix loop มี finding >1 → ดู ★ loop tuning ข้อ 6 ด้านล่าง
9. **ทุก build agent สวม role Developer** — ทำตาม role card `.warnyin/workflow/roles/developer.md` (lens + checklist ก่อนส่งงาน) — build-wave.mjs ใส่ให้ใน prompt แล้ว
10. **★ ใช้ Troubleshooting KB** — เจอปัญหา/error ระหว่าง build ให้ **อ่าน `docs/troubleshooting.md` ก่อนเสมอ** เผื่อเคยแก้แล้ว; เมื่อแก้ปัญหาที่ **ยาก/เจอซ้ำ** สำเร็จ ให้บันทึก entry ลง `docs/stages/<slug>/troubleshooting.md` (ปัญหา/อาการ/root cause/วิธีแก้/ป้องกันซ้ำ) — ตอน SHIP จะยกขึ้น KB กลาง
11. **★ investigate-before-edit** (enforce ของ "ห้ามเดา") — ก่อนแก้ไฟล์ที่มีอยู่ ต้องเข้าใจก่อน — **ใครใช้/อ่านไฟล์นี้, schema/contract/สัญญาของมัน, เจตนาเดิม**; แก้โดยไม่เข้าใจ = เดา (กรณีไม่ชัด → ถาม user / อ่านโค้ดที่อ้างถึง ก่อนแก้)
12. **★ config-protection** (enforce ของ "ห้ามเดา") — ห้ามแก้ config (linter/formatter/test threshold) หรือ disable rule **"เพื่อให้ build/test ผ่าน"** แทนการแก้โค้ดจริง — ถ้า config ผิดจริง แก้ได้แต่ต้องมี **เหตุผลชัด + note** (ไม่ใช่เพื่อเลี่ยง finding)

---

## 4. ลำดับขั้นการทำงาน (orchestration)

> ผู้ orchestrate คือ AI ตัวหลัก (main loop) — sub-agent คือคนลงมือ implement

0. **★ เช็ค context window ก่อนเริ่ม:** ประเมินว่า context ของ session ปัจจุบันถูกใช้ไปมากน้อยแค่ไหน — ถ้าใช้ไปเยอะหรือ **เกินครึ่ง** → **เสนอ user ให้ `/compact` หรือ `/clear` ก่อนเสมอ** แล้วค่อยเริ่ม BUILD ใน context ที่โล่ง (สถานะงานอยู่ในไฟล์ `docs/stages/<slug>/` ครบ ไม่หายไปกับ context) — BUILD เป็นงานยาว ต้องมี context เหลือมากพอ; เครื่องอื่นที่ไม่มีคำสั่งนี้ → แนะนำเริ่ม session ใหม่
1. **อ่าน task ทั้งหมด** → ดึง dependency ของแต่ละ task จาก `task.md` (section 2) + `design.md` (section 7)
2. **สร้าง DAG + จัด wave** (topological sort): wave 1 = task ที่ไม่มี dependency, wave 2 = task ที่ depend เฉพาะ wave 1, ...
3. **Pre-check:** target เป็น git repo ไหม (สำหรับ worktree) — ถ้าไม่ใช่ → fallback sequential shared-tree และแจ้ง user
4. **เสนอ execution plan + ขออนุมัติ (ครั้งเดียว):** แสดง wave / task ในแต่ละ wave / อันไหน parallel / isolation mode → ถาม user go/no-go
5. **เดินทีละ wave:**
   - fan-out sub-agent ของ task ใน wave นั้น ผ่าน **Workflow** (`.warnyin/workflow/scripts/build-wave.mjs`) — orchestrator ส่ง `{slug, tasks, isolate, baseRef}` ตาม mode: wave ≥2 task → `isolate:true` + `baseRef`; wave เดี่ยว → `isolate:false` + **checkout build branch ก่อนรัน wave** (กัน commit ตกลง main)
   - แต่ละ agent: sync build branch (`git merge <baseRef>`, เฉพาะ worktree mode) → implement → test/lint → รายงานผลแบบ structured (status, files, branch, test result)
   - **integrate ตาม mode:** worktree → main loop checkout **เฉพาะไฟล์ source ที่ scoped** จาก worktree branch (`git checkout <branch> -- <files>` — เลี่ยง topic-docs copy ที่ agent merge เข้า worktree + ปลอด KB#11); shared-tree → agent ไม่ commit เอง, main loop review + commit; ถ้า conflict → แก้/รายงาน
   - ถ้ามี task `failed` → หยุด รายงาน user
6. **★ Full build & test gate (หลังทุก wave merge เสร็จ — blocking, ห้ามลด bar):** บน build branch ที่ integrate แล้ว รัน **build ทั้งหมด + test suite ทั้งหมด (รวม unit test) + cross-component/integration** ของทุก component ที่กระทบ — นี่คือจุดที่ครอบ integration ที่ self-verify ต่อ task (§3 ข้อ 4) ไม่ได้รัน จึง **ต้องคงเป็น blocking gate เต็มเสมอ**
   - มี error / test แดง → **แก้จนเขียวหมด (loop)** อาจ delegate fix ให้ sub-agent ทีละจุด แล้ว rerun ใหม่
   - **ห้ามปิด BUILD ถ้ายังมี build error หรือ test ตัวใดแดง**
   - ถ้าวนแก้หลายรอบยังไม่ผ่าน → หยุด รายงาน user พร้อม log error
   - **★ loop tuning (fix loop มี finding >1)** — วิธีตัดสิน credit horizon / experience batching + ⚠ ดู [`loop-tuning`](../loop-tuning.md); default-by-tier: ดู [triage.md loop-tuning default](../triage.md)
   - Loop-tuning report (fix loop มี finding >1 — non-blocking guidance):
     - ระบุ credit-horizon choice (per-finding | batched) + เหตุผล 1 บรรทัด ในรายงาน ก่อนแก้
     - ตอน delegate fix → failure ถูก group (รายงานเห็น ≥1 group boundary by component/root-cause)
       หรือ ระบุเหตุผลว่าทำไมกลุ่มเดียวพอ — ไม่ dump ก้อนเดียวเงียบๆ
7. **ปิดงาน:** อัปเดต `build.md` (รายงานผลต่อ task + ผล full build/test) + สถานะใน `task.md` แต่ละใบ → เสนอเข้า VERIFY ด้วย `/warnyin:verify`

---

## 5. Output

| ไฟล์ | เนื้อหา |
|---|---|
| โค้ดจริงใน target repo | การ implement ของแต่ละ task (merge เข้า build branch) |
| `docs/stages/<slug>/build.md` | รายงานผล build: สถานะ/ผล test/ไฟล์ที่แก้ ต่อ task + integration notes |
| `docs/stages/<slug>/troubleshooting.md` | ปัญหายาก/ซ้ำที่แก้สำเร็จ (SHIP ยกขึ้น `docs/troubleshooting.md`) |
| `tasks/<task>/task.md` (อัปเดต) | สถานะ task → เสร็จ + acceptance ที่ผ่าน |

---

## 6. Workflow script (Claude Code)

ใช้ `.warnyin/workflow/scripts/build-wave.mjs` — fan-out หนึ่ง agent ต่อหนึ่ง task ใน **หนึ่ง wave** (parallel, worktree isolation), คืนผลแบบ structured
main loop เรียก script นี้ **ทีละ wave** แล้ว integrate ระหว่าง wave (ดูรายละเอียดใน `.claude/commands/warnyin/build.md`)

> เครื่องอื่น (Codex/Antigravity) ที่ไม่มี Workflow tool: ทำตามหลักการข้อ 3-4 โดย implement task ตามลำดับ wave เอง (parallel เท่าที่เครื่องรองรับ)

---

## 7. Gate → เข้า VERIFY ได้เมื่อ

- [ ] ทุก task ใน DAG ถูก implement และ merge เข้า build branch แล้ว
- [ ] ทุก task รายงาน `passed` (test-flow + build/lint เขียว) — ไม่มี `failed` ค้าง
- [ ] ไม่มี merge conflict ค้าง
- [ ] **★ Full build ของทุก component ผ่าน — ไม่มี build error**
- [ ] **★ test suite ทั้งหมด (รวม unit test) เขียวทั้งหมดบน build branch**
- [ ] `build.md` สรุปผลครบทุก task + ผล full build/test
- [ ] ไม่มีการแตะ rule/standard กลางใน `docs/` (rule ใหม่ยัง note รอ SHIP)

ยังไม่ครบ → อยู่ BUILD ต่อ ห้ามข้ามไป VERIFY
