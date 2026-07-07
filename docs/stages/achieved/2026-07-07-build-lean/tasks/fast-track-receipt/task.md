# Task — fast-track-receipt

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `fast-track-receipt` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (repo นี้เอง — แก้เฉพาะ `src/**`) |
| **Model tier** | `balanced` |
| **สถานะ** | `ผ่าน BUILD` |

## 1. เป้าหมายของ task (vertical slice)

fast tier = **pre-flight receipt + code-first** — canonical ที่ `triage.md`: skip-list ใหม่ + caps §2D + repoint §2C, DESIGN playbook มี fast path (pre-flight สร้าง receipt ก่อนแตะโค้ด) + UX detect แก้ precedence, template `receipt.md` ใหม่พร้อม installer.test คุ้มครอง, command adapter ชี้ playbook

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- ต้องทำหลัง: **ไม่มี** (wave 1)
- ปลดล็อกให้: wave 2 (`tasks/build-stage-lean`, `tasks/verify-ship-lean` — hook ของ stage ชี้ skip-list/receipt lifecycle ที่ task นี้วาง)
- ส่ง output ต่อ: skip-list canonical + caps §2D ใน `triage.md`, template `receipt.md`, fast path ใน `stages/design.md`

## 3. Sub-tasks

- [x] 1. **`src/.warnyin/workflow/triage.md`** — _ผลลัพธ์: canonical skip-list + caps + repoint_
  - แทนตารางใน section **Fast-track skip-list** ด้วยตารางใหม่จาก design `§4.1` **คำต่อคำ** (canonical-copy — ห้ามแต่งใหม่)
  - `§2A` row fast: แก้ route เป็น "design fast-track (pre-flight สร้าง receipt) → code-first → verify-lite → ship-lite" (คง link `[skip-list](#fast-track-skip-list)`)
  - เพิ่ม section ใหม่ **`§2D` caps**: fast receipt ≤40 บรรทัด · standard proposal ≤60 / design ≤120 บรรทัด · large = judgment — **แยก anchor จาก skip-list** (ไม่ยัดใน section skip-list)
  - `§2C` บรรทัด why ใต้ตาราง (`triage.md:51`): repoint จาก "build.md §4 ข้อ 6 · verify.md §4 ข้อ 5" → ชี้ loop-tuning ด้วยรูปแบบ `[loop-tuning](loop-tuning.md)` (ใน `triage.md` ปลายทางเขียนเป็น md link จริง — ในเอกสาร task นี้ยกเป็น code กัน dead-link gate); pointer ใน triage.md ต้องเป็น **markdown link** เท่านั้น; ไฟล์ `loop-tuning.md` สร้างโดย task `loop-tuning-extract` ใน wave เดียวกัน — `lint:md` เป็น gate ระดับ **integration หลัง merge ทั้ง wave** ห้ามตีความ lint แดงจาก pointer นี้เป็น failure ของ task นี้
- [x] 2. **`src/.warnyin/workflow/stages/design.md`** — _ผลลัพธ์: fast path + UX detect fix; ขึ้นกับ 1 (ชี้ skip-list canonical)_
  - `§7` row fast ใหม่: pre-flight receipt — **ไม่สร้าง proposal/design/tasks** (ชี้ skip-list ใน triage.md เหมือนเดิม ไม่ inline rubric)
  - `§4` เพิ่มขั้น fast path: **pre-flight** — copy template `.warnyin/template/stages/receipt.md` → เติม meta (รวม hard-floor row) + §1 + §2 **ก่อนแตะโค้ด** (acceptance ประกาศก่อนแก้แบบมี artifact) — **ตำแหน่งแทรก: branch หลัง step 1.5** (จุดที่ tier ถูก established — dry-run แนะ, unify-in-place)
  - **UX detect** (section "UX wireframe — detect" + Gate `§8` ข้อ wireframe): ยก exclusion (docs-only / config-only / tooling ล้วน) ขึ้นเป็น **precedence เช็คก่อน signals** — ระบุชัด "เจอ exclusion → จบทันที ไม่ประเมิน signals"
  - **★ เก็บ stale fast-mentions ให้ตรงโมเดลใหม่ (dry-run พบ):** `stages/design.md:102` ("fast tier → 1 task เขียนเอง ไม่ fan-out") + `:115` footnote ("fast tier (1 task) เขียนเอง") — fast ไม่มี task folder แล้ว ต้อง reword ให้ชี้ fast path/pre-flight; และแก้ anchor เพี้ยน pre-existing ที่ `:157` — "(triage.md §3B)" ที่จริงคือ **§2B** (ถือโอกาสแก้เพราะอยู่โซน §7 ที่ task นี้เป็นเจ้าของ)
- [x] 3. **สร้าง `src/.warnyin/template/stages/receipt.md`** (**นอก `[topic]/` โดยเจตนา** — กัน whole-folder copy ติดไปทุก topic) — _ผลลัพธ์: template ตาม design §3_
  - **★ H1 ต้องเป็น `# Receipt — <ชื่อ change>` (มี `<...>` placeholder เป็นบรรทัดแรกที่ไม่ว่าง)** — contract กับ validator: `isFilled` จับ template ที่ยังไม่เติมจาก placeholder ใน H1 (dry-run ของ validator-receipt ระบุ — ห้ามให้ meta table ขึ้นก่อน H1)
  - meta table: slug · tier=fast · ประเภท · วันที่ · hard-floor row (ผ่าน / แตะหมวด X → upgrade)
  - §1 ทำอะไร+ทำไม ≤3 บรรทัด · §2 acceptance (1-3 ข้อ) · §3 ไฟล์ที่แตะ+สรุป diff · §4 ผล test (+ note ถ้าแตะ config/test-threshold พร้อมเหตุผล) · §5 learned rule / troubleshooting (ถ้ามี)
  - ทั้งไฟล์ **≤40 บรรทัด**
- [x] 4. **`src/tests/installer.test.mjs`** — _ขึ้นกับ 3:_ เพิ่ม assertion: หลัง install มีไฟล์ `.warnyin/template/stages/receipt.md` (target-side path, ตาม pattern `existsSync` ของเคส 1 เดิม — ไม่แก้ assertion เคสเดิม)
- [x] 5. **`src/.claude/commands/warnyin/design.md`** — _ขึ้นกับ 2:_ เพิ่ม fast-track path สั้นๆ ชี้ playbook (`stages/design.md` fast path + `triage.md` skip-list) — **adapter บาง logic อยู่ playbook** ห้าม duplicate; **เก็บ stale mention (dry-run พบ):** บรรทัด 21 "fast tier → 1 task เขียนเอง ไม่ fan-out" ต้อง reword ให้ตรงโมเดลใหม่ (fast ไม่มี task folder)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

- `src/.warnyin/workflow/triage.md`
- `src/.warnyin/workflow/stages/design.md`
- `src/.warnyin/template/stages/receipt.md` (ใหม่)
- `src/tests/installer.test.mjs`
- `src/.claude/commands/warnyin/design.md`

**ห้ามแตะ:** root dogfood (`.warnyin/`, `.claude/` — gitignored), `docs/**`, ไฟล์ของ slice อื่น (`build.md`, `verify.md`, `ship.md`, `loop-tuning.md`, `build-wave.mjs`, `validate-topic.mjs`)

## 5. Acceptance criteria

- [x] skip-list ใน `triage.md` ตรง design `§4.1` **คำต่อคำ**
- [x] caps อยู่ `§2D` แยก anchor จาก skip-list
- [x] route `§2A` row fast = เวอร์ชันใหม่ (pre-flight สร้าง receipt → code-first → verify-lite → ship-lite)
- [x] `§2C` บรรทัด why ชี้ `loop-tuning.md` (md link) — ตาราง default `§2C` **ไม่ถูกย้าย/copy** ไปไฟล์อื่น
- [x] `stages/design.md`: exclusion เช็คก่อน signals (เจอ → จบทันที) + §7 fast row + fast path pre-flight ใน §4
- [x] template `receipt.md` ≤40 บรรทัด อยู่ **นอก** `[topic]/`
- [x] `installer.test.mjs` เขียว (assertion ใหม่ + เคสเดิมทั้งหมด)
- [x] แก้เฉพาะ `src/**`
- [x] ผ่าน test ตาม `spec.md` (test-flow)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
