# Task — spec-template

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `spec-template` |
| **Slice อ้างอิง** | `design.md` slice #1 (canonical format) |
| **Component** | installer payload (`src/.warnyin/template/docs/features/`) |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
สร้าง template canonical ของ living behavior spec — ไฟล์ `src/.warnyin/template/docs/features/[feature-name]/spec.md` ที่มีโครง/header/guidance ตรง design §4.1 เป๊ะ — ส่งมอบ end-to-end: ติด npm payload อัตโนมัติ (`CORE` ครอบ `src/.warnyin/template`) → ทุกโปรเจกต์ที่ติดตั้ง/`--update` ได้ format เดียวกันใช้เขียน feature spec ได้จริง

## 2. Dependency
- ต้องทำหลัง: — (wave 1 — ไม่มี dependency)
- ปลดล็อกให้: `tasks/stage-wiring` (อ้าง path + format ของ template นี้), `tasks/dogfood-specs` (ใช้ format เดียวกัน)
- ส่ง output ต่อ: path canonical + โครง header/section ของ `spec.md` ที่ task ทั้งสองต้องอ้างให้ตรง

## 3. Sub-tasks
- [ ] 1. อ่าน design §4.1 + `feature.md`/`business.md` ในโฟลเดอร์ `[feature-name]/` เดิม — _ผลลัพธ์:_ ยืนยันโครง + สไตล์ header
- [ ] 2. เขียน `src/.warnyin/template/docs/features/[feature-name]/spec.md` copy โครง/header/guidance จาก §4.1 เป๊ะ — _ขึ้นกับ 1_
- [ ] 3. รัน `npm run lint:md` + `npm run verify:pack` + `npm test` ให้เขียว — _ขึ้นกับ 2_

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **สร้างใหม่ 1 ไฟล์เท่านั้น:** `src/.warnyin/template/docs/features/[feature-name]/spec.md`
- **ห้ามแตะไฟล์อื่น** — รวมถึง `feature.md`/`business.md` เดิม, playbook, command, `cli.mjs`, root dogfood (`.warnyin/` ที่ root)

## 5. Acceptance criteria
- [ ] ไฟล์มีจริงตาม path `src/.warnyin/template/docs/features/[feature-name]/spec.md`
- [ ] โครง section + header blockquote ตรง design §4.1 ทุกบรรทัด (living doc · observable behavior · descriptive ไม่ใช่ imperative · placeholder ห้าม secret/PII · ~≤100 บรรทัด/1-3 scenario · THEN = observable artifact · `Requirement:`/`Scenario:`/`GIVEN`/`WHEN`/`THEN`)
- [ ] อยู่ใต้ `[feature-name]/` (ไม่ใช่ชื่อ concrete) — กัน seed leak (`cli.mjs:133-134`)
- [ ] สไตล์ header/comment แบบเดียวกับ `feature.md`/`business.md`
- [ ] ไม่แตะไฟล์อื่น
- [ ] `npm run lint:md` ผ่าน · `npm run verify:pack` ผ่าน (template ติด tarball) · `npm test` ผ่าน (ไม่กระทบ)
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
