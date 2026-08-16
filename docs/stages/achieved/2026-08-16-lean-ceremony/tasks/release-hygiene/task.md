# Task — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `release-hygiene` |
| **Slice อ้างอิง** | `design.md` slice #5 |
| **Component** | `installer` (release metadata) + `workflow core` (consistency check) |
| **Model tier** | `cheap` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
ปิด release ของ topic `lean-ceremony` ให้ผู้ใช้ปลายทางรับได้จริง: **CHANGELOG** ที่อธิบาย behavior change ครบ 6 ข้อ + **Migration** · **version bump** พร้อมเหตุผล · **runbook `✖ [C7]`** ใน `docs/infra.md` (กัน gate ใหม่เป็น orphan) · และเป็น **integration-level gate ของทั้ง topic** — รัน gate ข้าม slice จริงทุกตัว + cross-slice consistency check ที่ slice อื่นทำไม่ได้เพราะมองไม่เห็นกัน

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง (wave 2 เท่านั้น — ทั้ง 4 task ต้องเสร็จ + integrate เข้า branch หลักของ topic ก่อน):**
  - `tasks/design-stage-lean` (auto-route fast · gate trigger-by-signal · ตัด memory hook ของ DESIGN)
  - `tasks/build-verify-seam` (BUILD→VERIFY continue · ยุบ artifact 3→1 · ตัด block ซ้ำ)
  - `tasks/validator-cap-gate` (C7 cap + stage inference ใหม่ + unit test)
  - `tasks/memory-hook-lean` (memory hook 6→2 + `fastlane.md` รับ handoff)
  - **เหตุผลที่ห้ามเริ่มก่อน:** dead-link gate (`lint:md`) และ negative-grep จะ **false-negative** ถ้าไฟล์ของ slice อื่นยังไม่เข้ามา — pointer ที่พังหลังยุบ `test.md`/`verify.md` จะไม่ถูกจับ และ CHANGELOG จะถูกเขียนจากสิ่งที่ "ตั้งใจจะทำ" ไม่ใช่สิ่งที่ทำจริง (`docs/rule.md §1` release-hygiene เป็น wave สุดท้ายเสมอ)
- **ปลดล็อกให้:** ปิด BUILD ของ topic → VERIFY → SHIP
- **ส่ง output อะไรต่อให้ task ถัดไป:** `CHANGELOG.md` 0.30.0 finalized · `package.json` version · `MIN_PASS` ใหม่ + comment ที่มา · runbook C7 ใน `docs/infra.md` · รายงานผล gate ทุกตัว (คำสั่ง + exit code + ตัวเลขจริง) ให้ VERIFY ใช้เป็น evidence

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
> sub-task ต้องเชื่อมต่อกัน — ระบุลำดับ/สิ่งที่ส่งต่อกัน

- [ ] 1. **ยืนยัน precondition ของ wave 2** — เช็คว่าไฟล์ของทั้ง 4 slice เข้ามาแล้ว (`src/.warnyin/template/stages/[topic]/build.md` มี 4 section · ไม่มี `test.md`/`verify.md` · `validate-topic.mjs` มี C7 · `memory.md §5` เหลือ 3 แถว) — _ผลลัพธ์: ถ้ายังไม่ครบ **หยุดและรายงาน** ห้ามเดินต่อ_
- [ ] 2. **วัด baseline ก่อนแก้อะไร** — `grep -n MIN_PASS src/scripts/check-test-count.mjs` (ค่าเดิม = 200) + `set -o pipefail; npm test 2>&1 | node src/scripts/check-test-count.mjs` → จด `pass` = N — _ผลลัพธ์: N คือ evidence เดียวที่ใช้คำนวณ MIN_PASS (ขึ้นกับ 1)_
- [ ] 3. **ตัดสิน version bump + เขียนเหตุผล** — ประเมิน minor vs patch: payload เปลี่ยน **พฤติกรรมที่ผู้ใช้เห็น** (auto-route fast, BUILD→VERIFY continue, artifact 3→1, C7 block ได้) → **minor `0.29.1` → `0.30.0`**; ไม่ใช่ major เพราะ backward-compatible (topic เก่าไม่ error, archive ไม่ถูกสแกน) — bump ใน `package.json` เฉพาะบรรทัด `version` — _ผลลัพธ์: เหตุผลถูกบันทึกลง build report ไม่ใช่แค่แก้ตัวเลข_
- [ ] 4. **เขียน CHANGELOG `## [0.30.0]`** — entries ครอบ 6 behavior change: auto-route fast (confirm 1 ครั้ง) · C7 cap ที่ block ได้ · optional gate trigger-by-signal · memory hook 6→2 จุด · BUILD→VERIFY continue · artifact `build.md` ไฟล์เดียว 4 section (แทน `build/test/verify` 3 ไฟล์) — ถ้า slice อื่นสร้าง header ไว้แล้ว ให้ **เติมของที่ขาด ห้ามแก้ entry ของเขา** — _ขึ้นกับ 3: หมายเลข version ต้องตรง_
- [ ] 5. **เติมวันที่ + `### Migration`** (ownership ของ slice สุดท้าย) — Migration ต้องบอกอย่างน้อย 2 เคส: (ก) **topic ที่ค้างอยู่ยังใช้โครงเก่าได้** (`test.md`/`verify.md` ที่มีอยู่ไม่ทำให้ validate แดง — ไม่ต้องย้ายอะไร) (ข) **เอกสารเกิน cap จะถูก block** ด้วย `✖ [C7]` พร้อมชี้ runbook — _ขึ้นกับ 4_
- [ ] 6. **เขียน runbook `✖ [C7]` ใน `docs/infra.md`** — section ใหม่ต่อจาก runbook `verify:pack`: อาการ (error string จริง + exit 1) · สาเหตุ (cap ต่อ tier: `fast` receipt ≤40 · `standard` proposal ≤60 / design ≤120 · `large` ไม่มี cap; `design.md` นับเฉพาะบรรทัดก่อน `## 9. Spec delta`) · วิธีแก้ 3 ทาง (ย่อเอกสาร / ระบุ tier ในช่อง `ขนาด` ของ `proposal.md` / ประกาศ `large`) · เคส `⚠ [C7]` (อ่าน tier ไม่ได้ → ข้าม ไม่บังคับ) — **ห้ามเสนอวิธี "แก้ตัวเลข cap" หรือ "ปิด gate"** — _ขึ้นกับ 1: ต้องอ่าน error string จริงจาก validator ที่ integrate แล้ว_
- [ ] 7. **cross-slice consistency check** (ดูคำสั่ง + expected ใน `spec.md §7.6`) — (ก) negative-grep `อัปเดต project memory` scope `stages/` + `fastlane.md` (ยกเว้น `memory.md` = ผู้นิยาม) (ข) orphan pointer ของ template `[topic]/test.md`/`verify.md` ทั่ว `src/.warnyin/`, `src/.claude/`, `src/AGENTS.md`, `src/.warnyin/installer/templates/` (ค) C1 wording ตรงกัน 3 ที่ (template · playbook · test) (ง) `docs/example-walkthrough.md` + `src/.warnyin/workflow/README.md` สอดคล้องโครง artifact ใหม่ — _ผลลัพธ์: รายการ inconsistency + สิ่งที่แก้ (เฉพาะจุดเชื่อม)_
- [ ] 7b. **★ อัปเดต expected ของ `M2` ใน `src/tests/memory.test.mjs` (6 ไฟล์ → 3)** — const `M2_EXPECTED` เหลือ `stages/build.md` · `stages/ship.md` · `fastlane.md` ตาม contract C7; แก้คอมเมนต์หัวข้อ `M2. write hook ครบ 6 ไฟล์` ให้ตรงจำนวนใหม่ และตรวจว่า `M2b` (main-loop-only ของ BUILD) ยังผ่านโดยไม่แก้ — **นี่คือเคส exact-set ที่ wave 1 มองไม่เห็นกัน** (`docs/rule.md §2` compound-needle): slice 1/2/4 ลบ hook คนละไฟล์ เทสจึงแดงจนกว่าจะ integrate ครบ — _ขึ้นกับ 1 และ 7(ก): ต้องพิสูจน์ด้วย negative-grep ก่อนว่า hook หายจริงครบ 3 ไฟล์ แล้วจึงแก้ expected ให้ตรงความจริง **ห้ามแก้เพราะเทสแดง**_
- [ ] 8. **bump MIN_PASS** — `floor((N − 5) / 10) × 10` จาก N ในข้อ 2 + แก้ comment ให้ระบุที่มา (topic + slice ที่เพิ่มเคส + N + วันที่) — _ขึ้นกับ 2 และ 7 (ต้องแก้ไฟล์เสร็จก่อน ยอดถึงนิ่ง)_
- [ ] 9. **cross-cutting gate — รันจริงทุกตัว** — `set -o pipefail; npm test 2>&1 | node src/scripts/check-test-count.mjs` · `npm run lint:md` · `npm run verify:pack` · `node .warnyin/workflow/scripts/validate-topic.mjs lean-ceremony` (dogfood) · `node src/.warnyin/workflow/scripts/validate-topic.mjs lean-ceremony` (v-next, มี C7) — _ขึ้นกับ 3-8: ทุกอย่าง; ทุก gate ต้องรายงาน exit code + ตัวเลขจริง_
- [ ] 10. **RED proof** (`spec.md §7.8`) — พิสูจน์ว่า `lint:md`, pass-count gate และ C7 จับได้จริง แล้ว revert ให้เขียว — _ขึ้นกับ 9_

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `CHANGELOG.md` (root — **ไม่ใช่ dogfood**) — เพิ่ม section `## [0.30.0]` + วันที่ + Migration; ห้ามแตะ release เก่า
- `package.json` (root) — field `version` เท่านั้น
- `src/scripts/check-test-count.mjs` — const `MIN_PASS` + comment ที่มา
- `src/tests/memory.test.mjs` — **เฉพาะ const `M2_EXPECTED` + คอมเมนต์หัวข้อ M2** (exact-set 6→3 ตาม contract C7) ห้ามแตะเคสอื่นในไฟล์
- `docs/infra.md` (root docs — **ไม่ใช่ dogfood**) — เพิ่ม runbook section ท้ายไฟล์
- **แก้ได้เฉพาะจุดเชื่อม** เมื่อ consistency check เจอปัญหา: pointer / ชื่อไฟล์ / wording ที่ต้องตรง contract C1 ใน `src/.warnyin/`, `src/.claude/`, `src/AGENTS.md`, `docs/example-walkthrough.md`
- **ห้ามแตะ:** เนื้อกฎ/นโยบายของ slice อื่น (playbook logic, cap ใน `triage.md §2D`, logic ของ `validate-topic.mjs`, threshold/allowlist ของ gate) · root dogfood (`/.warnyin/`, `/.claude/`, root `CLAUDE.md`, root `AGENTS.md`) · `docs/stages/achieved/`

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] เริ่มงานหลัง 4 task ของ wave 1 integrate ครบแล้วเท่านั้น (มีหลักฐานใน sub-task 1)
- [ ] `package.json` `version` = `"0.30.0"` + เหตุผล minor ถูกบันทึกไว้ใน build report
- [ ] `CHANGELOG.md` มี `## [0.30.0] - <วันที่จริง>` + entries ครบ 6 behavior change + `### Migration` (2 เคส: topic ค้าง / cap เกิน) ที่ล่างสุดของ section
- [ ] ไม่มี entry ของ release เก่าหรือของ slice อื่นถูกย้าย/แก้/ลบ (`git diff CHANGELOG.md` ยืนยัน)
- [ ] `docs/infra.md` มี runbook section ของ `✖ [C7]` ครบ อาการ + สาเหตุ + วิธีแก้ 3 ทาง + เคส `⚠` และ **ไม่มี** ทางแก้ที่เป็นการลด bar
- [ ] `M2_EXPECTED` ใน `src/tests/memory.test.mjs` = 3 ไฟล์ (`stages/build.md`, `stages/ship.md`, `fastlane.md`) + คอมเมนต์หัวข้อตรงจำนวน — และแก้ **หลัง** negative-grep ยืนยันว่า hook หายจริง ไม่ใช่แก้เพราะเทสแดง
- [ ] `MIN_PASS` bump จาก pass count จริง + comment ระบุที่มา (อ่านค่าเดิมจากไฟล์ก่อน bump)
- [ ] cross-slice consistency ผ่านครบ 4 ข้อ (negative-grep · orphan pointer · C1 wording 3 ที่ · doc coherence) — inconsistency ที่แก้เป็น **จุดเชื่อมเท่านั้น** และมีรายการรายงาน
- [ ] gate ผ่านครบ: `npm test` + pass-count (exit 0, `pass === tests`, `pass ≥ MIN_PASS`) · `npm run lint:md` (exit 0) · `npm run verify:pack` (exit 0) · `validate-topic.mjs lean-ceremony` **ทั้ง dogfood และ v-next ไม่มี `✖`**
- [ ] RED proof ครบ 3 กรณี (dead link · pass-count · C7) แล้ว revert กลับเขียว
- [ ] ไม่มีการแก้ config/threshold เพื่อให้ gate ผ่าน (config-protection)
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
