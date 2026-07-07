# Spec — validator-receipt

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — ใส่เฉพาะหัวข้อที่เกี่ยวข้อง

## 1. ชนิดของ task

`code` (logic ใน validator script) + `test` (เคสใหม่ใน validate-topic.test) + แถวตารางใน playbook `next.md`

## 2. Data-flow

- design `§4.2` (validator contract) + `§3` (receipt schema — ใช้แค่ "H1 filled" ไม่ parse section ข้างใน) → detection ใน `checkTopic(files)` (pure fn รับ `Map<relPath,content>`)
- detection input = key/content ใน Map เดิม: `receipt.md`, `proposal.md`, `design.md`, `tasks/<name>/...` — **ไม่เพิ่มการอ่าน fs ใหม่** (fs walk เดิมครอบ receipt.md อยู่แล้วเพราะเก็บ `.md` ทุกไฟล์)
- ผล mode → render: ตาราง status (คอลัมน์ stage แสดง `fast-track`) + โหมด validate (`stage (ประมาณการ): fast-track`) → `next.md` step 0 pre-scan เห็นค่าตรงกับ row ใหม่ในตาราง stage-inference

## 3. Test-flow

รันจาก repo root:

- [ ] **suite เขียว:** `npm test` (= bare `node --test` auto-discover ตาม `docs/rule.md` — ห้ามใส่ path arg ใน gate; ระหว่าง dev จะรันเจาะไฟล์ `node --test src/tests/validate-topic.test.mjs` ได้ แต่ผลตัดสินใช้ bare) → เคสเดิม + เคสใหม่ผ่านหมด, pass ≥ MIN_PASS 9
- [ ] **fixture (ก) fast topic:** temp topic มีแค่ `receipt.md` เนื้อ filled (H1 ไม่มี `<...>` เช่น `# Receipt — งานจริง`) → spawn validate `<slug>`: exit 0 · ไม่มีบรรทัด `✖` · output มี `fast-track`; spawn status: ตารางแสดง `fast-track` ที่ row นั้น
- [ ] **fixture (ข) mixed:** receipt filled + `design.md` filled (หรือ + `tasks/foo/` ที่ขาดไฟล์) → full checks ทำงาน (✖ C2 ต้องยังโผล่เมื่อ task ขาดไฟล์) + มีบรรทัด ⚠ mixed-state ("โครง full และ receipt") · exit ตามผล full checks (มี ✖ → 1)
- [ ] **fixture (ค) receipt template / ไม่มี receipt:** topic ใส่ `receipt.md` H1 แบบ `# Receipt — <ชื่อ change>` (template) และ topic ไม่มี receipt เลย → issues/stage/exit เหมือน validator เดิม (ไม่มี fast-track, ไม่มี ⚠ mixed ใน output)
- [ ] **regression status mode กับ repo จริง:** `node src/.warnyin/workflow/scripts/validate-topic.mjs` (cwd = repo root, รันเวอร์ชัน `src/` ตรง — root dogfood เป็นเวอร์ชันเก่า) **ก่อนแก้** เก็บ output ไว้ → รันซ้ำ**หลังแก้** → ตาราง topic/stage/✖⚠ เหมือนเดิมทุกบรรทัด (topic ใน `docs/stages/` + achieved ถูก skip เหมือนเดิม)
- [ ] **exit codes:** เคสเดิม exe (slug ผิด → 2, arg เกิน → 2, ✖ → 1, สะอาด/status → 0) ยังผ่านโดยไม่แก้ assertion
- [ ] **next.md:** grep `fast-track` ใน `src/.warnyin/workflow/next.md` → เจอในตาราง stage-inference (§2 ข้อ 3) พร้อม route "ship-lite"; ส่วนอื่นของไฟล์ diff = เฉพาะ row ใหม่

## 4. Edge case

- `tasks/[task-name]/` (placeholder) อย่างเดียว **ไม่นับ**เป็น task folder จริง → topic receipt filled + placeholder = ยังเข้า mode fast
- proposal/design **มีไฟล์แต่ยังเป็น template** = ถือว่า "ไม่ filled" → ยังเข้า mode fast (เคสจริง: fast topic ที่เผลอ copy โครง full มาแต่ไม่เติม)
- fast mode ข้ามเฉพาะ C1-C4 — **C5 (feature spec) ยังรัน**: fixture fast + `docs/features/*/spec.md` ผิดโครง → ✖ C5 ยังโผล่ + exit 1
- mixed-state ⚠ อย่างเดียว (ไม่มี ✖ อื่น) → exit 0 (⚠ ไม่ block ตามสัญญา exit เดิม)
- `receipt.md` ว่างเปล่า/whitespace ล้วน → `isFilled` คืน false → ไม่เข้า fast (พฤติกรรมเดิม)

## 5. Requirement เดิมที่ต้องไม่พัง (จาก `docs/features/topic-validator/spec.md`)

- status mode: ตารางทุก active topic + exit 0 · validate: ✖ structural → exit 1 · slug ผิด/traversal → exit 2
- C1/C4 ยังเป็น ⚠ (ไม่ใช่ ✖) ใน topic โครงเดิม · C2/C3/C5 ยังเป็น ✖ existence/structure
- wiring 3 จุด (`next.md` + `stages/design.md` + `stages/ship.md` grep เจอ `validate-topic.mjs`) — task นี้แก้ next.md เฉพาะตาราง ห้ามลบบรรทัด pre-scan step 0
