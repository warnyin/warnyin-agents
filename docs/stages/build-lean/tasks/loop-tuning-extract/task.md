# Task — loop-tuning-extract

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `loop-tuning-extract` |
| **Slice อ้างอิง** | `design.md` slice #4 |
| **Component** | `installer` (repo นี้เอง — แก้เฉพาะ `src/**`) |
| **Model tier** | `cheap` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)

สร้าง `src/.warnyin/workflow/loop-tuning.md` (**ไฟล์ใหม่ orchestrator-only**) — รวม ★ loop tuning theory ที่ตอนนี้ inline ซ้ำกัน 2 ที่ (`build.md §4 ข้อ 6` + `verify.md §4 ข้อ 5`) ให้เป็น canonical เดียว เพื่อให้ wave 2 (slice 2/3) แทน block เดิมด้วย pointer wording ตาม design `§4.5` ได้ (สอด MODIFIED learning-loop-tuning ใน design `§9`: why-guidance ย้ายมาไฟล์นี้, single-source ตาม `§4.6`)

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- ต้องทำหลัง: **ไม่มี** (wave 1)
- ปลดล็อกให้: wave 2 — `tasks/build-stage-lean`, `tasks/verify-ship-lean` (แทรก md pointer → `loop-tuning.md`; dead-link gate ต้องเห็นไฟล์จริงบน build branch ก่อน — design §7)
- ส่ง output ต่อ: ไฟล์ `src/.warnyin/workflow/loop-tuning.md` ที่ theory ครบ ให้ wave 2 ลบ block เดิมใน `build.md`/`verify.md` ได้โดยไม่มีสาระหาย
- **ขอบเขตเจ้าของไฟล์:** task นี้ **สร้างไฟล์ใหม่อย่างเดียว** — **ห้ามแตะ `build.md` / `verify.md` / `triage.md`** (การลบ ★ block เดิมเป็นงานของ `build-stage-lean`/`verify-ship-lean` ใน wave 2; repoint `triage.md §2C` เป็นงานของ `fast-track-receipt` ใน wave เดียวกัน)

## 3. Sub-tasks

- [ ] 1. **สร้าง `src/.warnyin/workflow/loop-tuning.md`** — _ผลลัพธ์: theory canonical เดียว_
  - **header** (H1 + blockquote callout แบบ `minimalism.md`): ระบุว่าเป็น **orchestrator-only guidance** — ผู้อ่าน = main loop ตอน fix loop มี finding >1 (BUILD full-gate `build.md §4 ข้อ 6` / VERIFY "แก้จนผ่าน" `verify.md §4 ข้อ 5`); **ไม่ใช่ playbook ที่ build/verify agent ต้องอ่านก่อนทำงาน**
  - **เนื้อ theory** — เอาจาก ★ block เดิมทั้งสอง (`src/.warnyin/workflow/stages/build.md` บรรทัด ~64-75 · `verify.md` บรรทัด ~58-69 — เนื้อเกือบเหมือนกัน) **รวมเป็นชุดเดียว, เอาเนื้อจากไฟล์จริง ไม่แต่งเพิ่ม:**
    - หลักแกน: จาก paper "iterative generative optimization" — loop tuning **ปรับแค่ "ลำดับ/การจัดกลุ่ม" ของการแก้ — ไม่ลด correctness/test-floor** (สอด config-protection: "แก้จนผ่าน" = แก้ root cause ไม่ใช่ลด bar)
    - **credit horizon** (feed feedback แค่ไหนต่อรอบ): สั้น = แก้ทีละ finding rerun ถี่ (เหมาะเมื่อ finding independent + สัญญาณเฉพาะหน้าสอดคล้องเป้า — เร็วกว่า) · ยาว = รวม failure ทั้งชุด วิเคราะห์ root cause ร่วม แก้เป็นชุด (เหมาะเมื่อ finding coupled) + ⚠ update ถี่เกินด้วย horizon สั้นเกิน → churn/ผลแย่ลง
    - **experience batching** (ตอน delegate fix): แบ่ง failure ตาม component/root-cause แล้ว delegate ทีละกลุ่ม + ⚠ batch ใหญ่ ≠ ดีกว่าเสมอ (task-dependent)
- [ ] 2. **ใส่ pointer ในไฟล์ใหม่** — _ขึ้นกับ 1:_
  - default-by-tier → md link ไป `triage.md` §2C (ในไฟล์จริงเขียนเป็น relative link รูปแบบ `[...](triage.md)` — sibling ในโฟลเดอร์ `workflow/` เดียวกัน) — **ห้ามมีตาราง default-by-tier ในไฟล์นี้** (canonical อยู่ `triage.md §2C` ที่เดียว — design §4.6 + spec learning-loop-tuning negative-grep)
  - report requirement (enum `per-finding | batched` + "เหตุผล 1 บรรทัด") → ชี้ `build.md`/`verify.md` ด้วย **markdown link เท่านั้น** (`stages/build.md` / `stages/verify.md` — inline code จะหลุด dead-link gate)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

- `src/.warnyin/workflow/loop-tuning.md` (**ใหม่ — ไฟล์เดียวเท่านั้น**)

**ห้ามแตะ:** `src/.warnyin/workflow/stages/build.md`, `stages/verify.md`, `triage.md` (task อื่นเป็นเจ้าของ), root dogfood (`.warnyin/`, `.claude/` — gitignored), `docs/**`, ไฟล์อื่นใดทั้งหมด

## 5. Acceptance criteria

- [ ] ไฟล์ใหม่มี theory **ครบ** — diff สาระเทียบ ★ block เดิมทั้งสอง (`build.md ~64-75` / `verify.md ~58-69`) ไม่มีสาระตกหล่น (หลัก "ปรับแค่ลำดับ/การจัดกลุ่ม" + credit horizon สั้น/ยาว + เงื่อนไข + ⚠ churn + experience batching + ⚠ batch ใหญ่ + paper ref)
- [ ] header ระบุ orchestrator-only + ผู้อ่าน = main loop (fix loop finding >1) ชัด
- [ ] **ไม่มีตาราง default-by-tier** ในไฟล์ใหม่ — มีแค่ md link ไป `triage.md`
- [ ] pointer report requirement ชี้ `stages/build.md` / `stages/verify.md` เป็น md link
- [ ] **ไม่แตะไฟล์อื่นใด** — `git status` เห็นเฉพาะไฟล์ใหม่ 1 ไฟล์
- [ ] md links ในไฟล์ใหม่ resolve ทั้งหมด (ยกเว้นข้อเท็จจริงที่ยอมรับ: `build.md`/`verify.md` **ยังมี ★ block เดิมอยู่** — ปกติ เพราะการลบเป็นงาน wave 2 ห้ามตีความเป็น failure ของ task นี้)
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
