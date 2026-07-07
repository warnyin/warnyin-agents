# Task — build-stage-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `build-stage-lean` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (repo นี้เอง — แก้เฉพาะ `src/**`) |
| **Model tier** | `balanced` |
| **สถานะ** | `ผ่าน BUILD` |

## 1. เป้าหมายของ task (vertical slice)

BUILD stage จ่าย overhead **เฉพาะที่จำเป็น**: (1) tier fast ไม่ผ่าน build-wave — มี ★ fast-track hook ให้ main loop code-first, (2) worktree fork เฉพาะ wave ที่ขนานจริง (wave เดี่ยว → shared tree), (3) build agent อ่านเฉพาะที่จำเป็น (prompt lean) + มี test คุ้ม contract ของ prompt

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- ต้องทำหลัง: `tasks/loop-tuning-extract` — sub-task 3 แทรก markdown pointer `../loop-tuning.md` ลง `build.md §4 ข้อ 6`; **dead-link gate (`lint:md`) ต้องเห็นไฟล์จริงบน build branch** ก่อน (file-existence dependency — contract-first ใช้แทนไม่ได้กับ link resolution) → task นี้อยู่ **wave 2**
- ปลดล็อกให้: `tasks/release-hygiene` (wave 3 — สรุป CHANGELOG จากผลทุก slice)
- ส่ง output อะไรต่อให้ task ถัดไป: `build.md`/`build-wave.mjs`/adapter เวอร์ชัน lean + prompt tests ใหม่ (เข้ารายการ Changed ของ CHANGELOG)

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)

- [x] 1. **`src/.warnyin/workflow/stages/build.md` — เพิ่ม ★ fast-track hook** (pattern เดียวกับ `verify.md:14` — blockquote ใต้ §1): tier `fast` → **main loop แก้โค้ดเอง code-first ไม่ spawn sub-agent/ไม่ fork worktree** ตาม skip-list canonical (link เป็น md link: `[fast-track skip-list](../triage.md#fast-track-skip-list)`) — ระบุ **correctness floor ที่ยังบังคับกับ main loop**: full-gate test เขียว (blocking) + config-protection (§3 ข้อ 12) + investigate-before-edit (§3 ข้อ 11) + ห้ามแตะ rule/standard กลาง (§3 ข้อ 6); tier `standard`/`large` → flow เต็ม (hook N/A ไม่ลด bar) — _ผลลัพธ์:_ fast topic ไม่จ่าย fan-out overhead
- [x] 2. **`build.md §3 ข้อ 3` + `§4 ข้อ 5` — worktree policy ใหม่ (2 mode, เขียนครอบทั้งสองจุด):**
  - wave **≥2 task** → worktree ต่อ task + integrate แบบเดิม (`git checkout <branch> -- <files>`)
  - wave **เดี่ยว** → `isolate:false` shared tree บน working tree จริง: **orchestrator checkout build branch ก่อนรัน wave** (กัน commit ตกลง main), agent **ไม่ commit เอง** (guard เดิมใน build-wave step 9), main loop review แล้ว commit
  - เขียนแบบ **unify-in-place** — ขยายข้อ 3/ข้อ 5 เดิมให้ครอบ 2 mode ไม่เพิ่มข้อ/กลไกขนานใหม่; fallback non-git เดิมคงอยู่
- [x] 3. **`build.md §4 ข้อ 6` — แทน ★ loop tuning theory block ด้วย canonical wording block:** ลบ theory block เดิม (bullet credit horizon · / experience batching / ⚠ 2 จุด / paper ref / default-by-tier line) แล้ววาง block จาก `design.md §4.5` **คำต่อคำ** — pointer ไป `loop-tuning.md` เป็น markdown link ตามรูปแบบ; บรรทัด "Loop-tuning report" 4 บรรทัด **คงคำเดิมของไฟล์ปัจจุบันเป๊ะ**; gate checklist §7 ยังครบ 7 item
- [x] 4. **`src/.warnyin/workflow/scripts/build-wave.mjs` — `prompt()` lean:** ตัด path playbook จากบรรทัดแรก + ตัด `ภาพรวม: design.md, proposal.md` + เปลี่ยนเป็น `docs/techstack/<component>/rule.md` + เพิ่ม `อ่านเพิ่มเฉพาะไฟล์ที่`
- [x] 5. **`src/tests/build-wave.test.mjs` — เพิ่มเทส `prompt()`** (เคส F-K): เชิงลบ + เชิงบวก + conditional; เคส A-E ไม่แก้ assertion
- [x] 6. **`src/.claude/commands/warnyin/build.md` — adapter:** เพิ่ม fast hook + note isolate ต่อ wave
- [x] 7. **`src/.warnyin/installer/templates/CLAUDE.md` — registry:** ปรับบรรทัด `/warnyin:build` ครอบ fast tier

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

- `src/.warnyin/workflow/stages/build.md` (hook §1 + §3 ข้อ 3 + §4 ข้อ 5 + §4 ข้อ 6 — **§7 ห้ามเปลี่ยนจำนวน item**)
- `src/.warnyin/workflow/scripts/build-wave.mjs` (เฉพาะ `prompt()` บรรทัด ~87-133)
- `src/tests/build-wave.test.mjs` (เพิ่มเทสใหม่เท่านั้น)
- `src/.claude/commands/warnyin/build.md`
- `src/.warnyin/installer/templates/CLAUDE.md` (บรรทัด `/warnyin:build`)
- **ห้ามแตะ:** `triage.md` (slice 1 เจ้าของ) · `loop-tuning.md` (slice 4 เจ้าของ) · `verify.md`/`ship.md` (slice 3) · root dogfood (`.warnyin/`, `.claude/`, root `CLAUDE.md`)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)

- [x] fast-track hook ใน `build.md` มี correctness floor ครบ (full-gate เขียว + config-protection + investigate-before-edit + ห้ามแตะ rule กลาง — อ้างเลขข้อของ §3 ถูก) + link skip-list เป็น md link ไป `../triage.md#fast-track-skip-list`
- [x] worktree policy 2 mode ครอบ **ทั้ง §3 ข้อ 3 และ §4 ข้อ 5** (wave ≥2 → worktree+integrate เดิม; wave เดี่ยว → isolate:false + orchestrator checkout build branch ก่อน + agent ไม่ commit + main loop commit)
- [x] wording block ใน `build.md §4 ข้อ 6` ตรง `design.md §4.5` **คำต่อคำ** (diff เนื้อความ = ว่าง ยกเว้น indent) + theory เดิม (credit horizon ·/⚠/paper ref) ไม่เหลือใน build.md
- [x] gate checklist `build.md §7` จำนวน item เท่าเดิม (**7 item** — grep `^- \[ \]` = 7)
- [x] `npm test` เขียวทั้ง suite: prompt tests ใหม่ผ่าน + เคส A-E เดิมผ่าน**โดยไม่แก้ assertion** (`check-test-count`: pass=127 tests=127, ≥ MIN_PASS=9)
- [x] adapter + installer template CLAUDE.md ครอบ fast tier ตาม sub-task 6-7
- [x] ผ่าน test ตาม `spec.md` (test-flow)
- [x] ทำตาม `rule.md` และ `standard.md`

> **หมายเหตุ lint:md:** `npm run lint:md` อาจแดงจาก pointer `../loop-tuning.md` ถ้าไฟล์นั้นยังไม่ merge เข้า build branch — เป็น **integration gate หลัง merge ทั้ง wave** (design §6) ไม่ใช่ failure ของ task นี้; แต่ task นี้อยู่ wave 2 → บน build branch ที่ sync แล้ว ไฟล์ควรมีอยู่จริง (ถ้าไม่มี = wave 1 ยังไม่ integrate → รายงาน orchestrator ห้าม improvise)

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
