# Task — build-stage-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `build-stage-lean` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (repo นี้เอง — แก้เฉพาะ `src/**`) |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)

BUILD stage จ่าย overhead **เฉพาะที่จำเป็น**: (1) tier fast ไม่ผ่าน build-wave — มี ★ fast-track hook ให้ main loop code-first, (2) worktree fork เฉพาะ wave ที่ขนานจริง (wave เดี่ยว → shared tree), (3) build agent อ่านเฉพาะที่จำเป็น (prompt lean) + มี test คุ้ม contract ของ prompt

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- ต้องทำหลัง: `tasks/loop-tuning-extract` — sub-task 3 แทรก markdown pointer `../loop-tuning.md` ลง `build.md §4 ข้อ 6`; **dead-link gate (`lint:md`) ต้องเห็นไฟล์จริงบน build branch** ก่อน (file-existence dependency — contract-first ใช้แทนไม่ได้กับ link resolution) → task นี้อยู่ **wave 2**
- ปลดล็อกให้: `tasks/release-hygiene` (wave 3 — สรุป CHANGELOG จากผลทุก slice)
- ส่ง output อะไรต่อให้ task ถัดไป: `build.md`/`build-wave.mjs`/adapter เวอร์ชัน lean + prompt tests ใหม่ (เข้ารายการ Changed ของ CHANGELOG)

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)

- [ ] 1. **`src/.warnyin/workflow/stages/build.md` — เพิ่ม ★ fast-track hook** (pattern เดียวกับ `verify.md:14` — blockquote ใต้ §1): tier `fast` → **main loop แก้โค้ดเอง code-first ไม่ spawn sub-agent/ไม่ fork worktree** ตาม skip-list canonical (link เป็น md link: `[fast-track skip-list](../triage.md#fast-track-skip-list)`) — ระบุ **correctness floor ที่ยังบังคับกับ main loop**: full-gate test เขียว (blocking) + config-protection (§3 ข้อ 12) + investigate-before-edit (§3 ข้อ 11) + ห้ามแตะ rule/standard กลาง (§3 ข้อ 6); tier `standard`/`large` → flow เต็ม (hook N/A ไม่ลด bar) — _ผลลัพธ์:_ fast topic ไม่จ่าย fan-out overhead
- [ ] 2. **`build.md §3 ข้อ 3` + `§4 ข้อ 5` — worktree policy ใหม่ (2 mode, เขียนครอบทั้งสองจุด):**
  - wave **≥2 task** → worktree ต่อ task + integrate แบบเดิม (`git checkout <branch> -- <files>`)
  - wave **เดี่ยว** → `isolate:false` shared tree บน working tree จริง: **orchestrator checkout build branch ก่อนรัน wave** (กัน commit ตกลง main), agent **ไม่ commit เอง** (guard เดิมใน build-wave step 9), main loop review แล้ว commit
  - เขียนแบบ **unify-in-place** — ขยายข้อ 3/ข้อ 5 เดิมให้ครอบ 2 mode ไม่เพิ่มข้อ/กลไกขนานใหม่; fallback non-git เดิมคงอยู่ — _ขึ้นกับ 1 (แก้ไฟล์เดียวกัน — ทำต่อเนื่อง):_
- [ ] 3. **`build.md §4 ข้อ 6` — แทน ★ loop tuning theory block ด้วย canonical wording block:** ลบ theory block เดิม (bullet credit horizon · / experience batching / ⚠ 2 จุด / paper ref / default-by-tier line) แล้ววาง block จาก `design.md §4.5` **คำต่อคำ** (ดู block เต็มใน `./spec.md §7`) — pointer ไป `loop-tuning.md` ต้องเป็น **markdown link ตามรูปแบบใน block นั้นเป๊ะ** (ห้ามลดรูปเป็น inline code ล้วน — จะหลุด dead-link gate); บรรทัด "Loop-tuning report" 4 บรรทัด **คงคำเดิมของไฟล์ปัจจุบันเป๊ะ** (spec learning-loop-tuning grep enum `per-finding | batched` + "เหตุผล 1 บรรทัด"); ปรับได้เฉพาะ indent ให้เข้า list level ของ §4 ข้อ 6; **ห้ามแตะ gate checklist §7 — จำนวน item ต้องเท่าเดิม (7 item)**
- [ ] 4. **`src/.warnyin/workflow/scripts/build-wave.mjs` — `prompt()` lean:**
  - บรรทัดแรก: ตัดส่วน path playbook (`ทำตาม playbook .warnyin/workflow/stages/build.md`) → เหลือแค่บทบาท (`คุณคือ build sub-agent ของ task "..." (vertical slice)`)
  - ตัด bullet `ภาพรวม: docs/stages/<slug>/design.md, proposal.md`
  - เปลี่ยน bullet techstack (`rule/standard กลางที่อ้างถึงใน docs/techstack/<component>/`) → `docs/techstack/<component>/rule.md ของ component ที่ task นี้แตะ` + เพิ่มบรรทัด `อ่านเพิ่มเฉพาะไฟล์ที่ task.md/standard.md/rule.md อ้างถึง`
  - **ห้ามแตะ** `normalizeTasks` / `buildOpts` / `RESULT_SCHEMA` / step 0 sync logic (`isolate && baseRef` splice) / step 9 commit guard — _ขึ้นกับ 3 (contract wording นิ่งก่อนเขียน test):_
- [ ] 5. **`src/tests/build-wave.test.mjs` — เพิ่มเทส `prompt()`** (extractFn เดิม + `new Function` — ดู `./standard.md §2`; ⚠ prompt เป็น template literal อ้างตัวแปร module-level `slug`/`isolate`/`baseRef` → ต้อง inject เป็น parameter ของ factory):
  - **เชิงลบ:** ข้อความ prompt (ทั้ง isolate และ shared-tree) **ไม่มี** `stages/build.md` / `design.md` / `proposal.md`
  - **เชิงบวก:** มี role card `developer.md` + `task.md`/`spec.md`/`standard.md`/`rule.md` + techstack `rule.md`; step 0 sync ปรากฏ **เฉพาะเมื่อ** `isolate && baseRef` (คู่ negative: `!isolate` หรือ `!baseRef` → ไม่มี step 0)
  - **เคส A-E เดิมห้ามแก้ assertion** (เพิ่มเคสใหม่เท่านั้น) — _ขึ้นกับ 4:_
- [ ] 6. **`src/.claude/commands/warnyin/build.md` — adapter:** เพิ่ม fast hook สั้น (tier fast → ไม่ fan-out, main loop code-first ตาม playbook hook — pointer บาง ไม่ duplicate skip-list) + note isolate ต่อ wave (wave เดี่ยว → `isolate:false` + orchestrator checkout build branch ก่อน)
- [ ] 7. **`src/.warnyin/installer/templates/CLAUDE.md` — registry:** ปรับบรรทัด `/warnyin:build` ให้ครอบ fast (เช่น "fan-out ตาม dependency; fast tier → main loop code-first") — แก้ที่ template นี้ (canonical) **ไม่ใช่ root `CLAUDE.md`** (dogfood gitignored — KB#22)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

- `src/.warnyin/workflow/stages/build.md` (hook §1 + §3 ข้อ 3 + §4 ข้อ 5 + §4 ข้อ 6 — **§7 ห้ามเปลี่ยนจำนวน item**)
- `src/.warnyin/workflow/scripts/build-wave.mjs` (เฉพาะ `prompt()` บรรทัด ~87-133)
- `src/tests/build-wave.test.mjs` (เพิ่มเทสใหม่เท่านั้น)
- `src/.claude/commands/warnyin/build.md`
- `src/.warnyin/installer/templates/CLAUDE.md` (บรรทัด `/warnyin:build`)
- **ห้ามแตะ:** `triage.md` (slice 1 เจ้าของ) · `loop-tuning.md` (slice 4 เจ้าของ) · `verify.md`/`ship.md` (slice 3) · root dogfood (`.warnyin/`, `.claude/`, root `CLAUDE.md`)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)

- [ ] fast-track hook ใน `build.md` มี correctness floor ครบ (full-gate เขียว + config-protection + investigate-before-edit + ห้ามแตะ rule กลาง — อ้างเลขข้อของ §3 ถูก) + link skip-list เป็น md link ไป `../triage.md#fast-track-skip-list`
- [ ] worktree policy 2 mode ครอบ **ทั้ง §3 ข้อ 3 และ §4 ข้อ 5** (wave ≥2 → worktree+integrate เดิม; wave เดี่ยว → isolate:false + orchestrator checkout build branch ก่อน + agent ไม่ commit + main loop commit)
- [ ] wording block ใน `build.md §4 ข้อ 6` ตรง `design.md §4.5` **คำต่อคำ** (diff เนื้อความ = ว่าง ยกเว้น indent) + theory เดิม (credit horizon ·/⚠/paper ref) ไม่เหลือใน build.md
- [ ] gate checklist `build.md §7` จำนวน item เท่าเดิม (**7 item** — grep `^- \[ \]` = 7)
- [ ] `npm test` เขียวทั้ง suite: prompt tests ใหม่ผ่าน + เคส A-E เดิมผ่าน**โดยไม่แก้ assertion** (`check-test-count`: `pass===tests`, ≥ MIN_PASS)
- [ ] adapter + installer template CLAUDE.md ครอบ fast tier ตาม sub-task 6-7
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

> **หมายเหตุ lint:md:** `npm run lint:md` อาจแดงจาก pointer `../loop-tuning.md` ถ้าไฟล์นั้นยังไม่ merge เข้า build branch — เป็น **integration gate หลัง merge ทั้ง wave** (design §6) ไม่ใช่ failure ของ task นี้; แต่ task นี้อยู่ wave 2 → บน build branch ที่ sync แล้ว ไฟล์ควรมีอยู่จริง (ถ้าไม่มี = wave 1 ยังไม่ integrate → รายงาน orchestrator ห้าม improvise)

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
