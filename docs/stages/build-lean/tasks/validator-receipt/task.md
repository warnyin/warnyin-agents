# Task — validator-receipt

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `validator-receipt` |
| **Slice อ้างอิง** | `design.md` slice #5 |
| **Component** | `installer` (repo นี้เอง — แก้เฉพาะ `src/**`) |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)

validator + next.md **รู้จัก fast-track topic ผ่าน `receipt.md`** — topic ที่มี receipt filled อย่างเดียวไม่โดน false-✖ จากโครง full (C1-C4), mixed-state ได้ ⚠ ชัดเจน, topic โครงเดิมพฤติกรรมเดิม 100% (backward compatible ตาม design §4.2 + §9 ADDED topic-validator)

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- ต้องทำหลัง: **ไม่มี** (wave 1) — receipt contract อยู่ใน design `§3` (schema) + `§4.2` (validator contract) แบบ **contract-first**: ไม่ต้องรอ template `receipt.md` จริงจาก task `fast-track-receipt`; fixture ใน test สร้างเนื้อ receipt เองได้ (filled = H1 ไม่มี `<...>`)
- ปลดล็อกให้: `tasks/release-hygiene` (wave 3 — สรุป CHANGELOG จากทุก slice); ไม่มี task ไหนรอ output โดยตรง
- ส่ง output ต่อ: fast-mode detection ใน `validate-topic.mjs` + row fast-track ในตาราง stage-inference ของ `next.md`

## 3. Sub-tasks

- [ ] 1. **`src/.warnyin/workflow/scripts/validate-topic.mjs`** — เพิ่ม fast-mode detection — _ผลลัพธ์: 3 เส้นทางตาม contract §4.2_
   - เงื่อนไข **mode fast** (ทุกข้อต้องจริง — structural + filled-guard เท่านั้น):
     (ก) `receipt.md` มีอยู่ **และ filled** — ใช้ `isFilled` pattern เดิม (H1 ไม่ใช่ placeholder `<...>`) **reuse ห้ามเขียนใหม่**
     (ข) **ไม่มี** `proposal.md`/`design.md` ที่ filled (ไม่มีไฟล์ หรือยังเป็น template = ผ่านข้อนี้)
     (ค) **ไม่มี** task folder จริงใน `tasks/` (โฟลเดอร์ placeholder `[task-name]` ไม่นับ — logic skip เดียวกับ C2)
     → ข้าม C1-C4 ทั้งหมด (C5 feature spec เป็น cross-cutting ยังรันปกติ); ตาราง status + โหมด validate แสดง mode `fast-track`
   - **mixed-state:** receipt filled **ร่วมกับ** (proposal/design filled **หรือ** มี task folder จริง) → รัน full checks C1-C5 ปกติ + เพิ่ม issue ⚠ (code ใหม่ `C6`, level `warn`) ข้อความ "topic มีทั้งโครง full และ receipt — ระบุ mode ให้ชัด" — **ห้ามเป็น ✖** (filled-guard = heuristic ตาม `docs/rule.md` #21)
   - ไม่มี `receipt.md` / ยังเป็น template → **พฤติกรรมเดิม 100%** — ห้ามแก้ logic เดิม (STAGES map, isFilled, checkTasks C2, checkShipData C3, inferStageAndC1, checkSpecDelta C4, checkFeatureSpec C5, โหมด status/validate, exit codes 0/1/2)
   - detection ทำใน pure fn layer (`checkTopic(files)`) — main/fs walk ไม่เพิ่ม branch นอกเหนือ render
- [ ] 2. **`src/tests/validate-topic.test.mjs`** — เพิ่มเคสตาม design §9 scenario — _ขึ้นกับ 1:_
   - (ก) **fast topic:** receipt filled อย่างเดียว → unit: ไม่มี issue C1-C4 + mode/stage = fast-track; exe (spawn fixture): exit 0, ไม่มี `✖`, output มี `fast-track`
   - (ข) **mixed:** receipt filled + design filled (และ/หรือ tasks/ จริงที่ขาดไฟล์) → full checks ทำงาน (เช่น ✖ C2 ยังโผล่) + มี ⚠ mixed-state
   - (ค) **receipt เป็น template / ไม่มี receipt** → ผลเหมือนเดิมทุกประการ (เทียบกับพฤติกรรมที่เคสเดิม assert อยู่แล้ว)
   - **assertion เคสเดิมทั้งหมดห้ามแก้** — เพิ่มอย่างเดียว; reuse helper เดิม (`makeTempProject`/`writeTopic`/`runScript`/`byCode`)
- [ ] 3. **`src/.warnyin/workflow/next.md`** — ตาราง stage-inference (§2 ข้อ 3, บรรทัด ~24-31) — _ขึ้นกับ 1 (คำว่า `fast-track` ให้ตรงกับ output validator):_
   - เพิ่ม 1 row: topic มี `receipt.md` เติมแล้ว → stage ปัจจุบัน = `fast-track` · ขั้นถัดไป: receipt §3/§4 ยังไม่เติม → ทำต่อ (code-first + verify-lite) แล้วค่อย ship-lite; เติมครบทุก section → ship-lite / archive (`/warnyin:ship`)
   - วาง row ต่อจาก row DESIGN (`proposal.md` / `design.md` / `tasks/`) — แก้เฉพาะตารางนี้ ไม่แตะ section อื่น

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

- `src/.warnyin/workflow/scripts/validate-topic.mjs`
- `src/tests/validate-topic.test.mjs`
- `src/.warnyin/workflow/next.md`

**ห้ามแตะ:** root dogfood (`.warnyin/`, `.claude/` — gitignored), `docs/**`, ไฟล์ของ slice อื่น (`triage.md`, `stages/*.md`, `loop-tuning.md`, `build-wave.mjs`, template `receipt.md`, `installer.test.mjs`)

## 5. Acceptance criteria

- [ ] `npm test` เขียว — เคสใหม่ (fast/mixed/template) + เคสเดิมทั้งหมดผ่าน โดย**ไม่แก้ assertion เคสเดิม**
- [ ] pass รวม ≥ MIN_PASS 9 (`node src/scripts/check-test-count.mjs` / gate เดิม)
- [ ] exit codes เดิมคง: status = 0 เสมอ · validate มี ✖ = 1 · slug ผิด/arg เกิน = 2
- [ ] zero-dependency คง — import เฉพาะ `node:*` (ไม่มี child_process/network/write ใน script)
- [ ] fast detection **ไม่ทำ topic เดิมเปลี่ยนผล**: รัน status mode กับ repo จริง (`docs/stages/` + achieved) ก่อน/หลังแก้ → output ตารางเหมือนเดิม
- [ ] mixed-state เป็น ⚠ เท่านั้น (ไม่ใช่ ✖ — ไม่ทำ exit 1 ด้วยตัวเอง)
- [ ] `next.md` มี row fast-track ในตาราง stage-inference + ไฟล์ส่วนอื่นไม่เปลี่ยน
- [ ] แก้เฉพาะ `src/**` (3 ไฟล์ตาม §4)
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
