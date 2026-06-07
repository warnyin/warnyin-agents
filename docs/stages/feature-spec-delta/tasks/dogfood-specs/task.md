# Task — dogfood-specs

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `dogfood-specs` |
| **Slice อ้างอิง** | `design.md` slice #3 (ตัวอย่างจริงพิสูจน์ format) |
| **Component** | `docs` (dogfood ของ repo เอง) |
| **สถานะ** | `build เสร็จ ✅ (เขียวจริง)` |

## 1. เป้าหมายของ task (vertical slice)
backfill **living behavior spec จริง 2 ไฟล์** เป็นตัวอย่างจริงพิสูจน์ว่า canonical format §4.1 ใช้ได้จริง:
- `docs/features/context-profiles/spec.md`
- `docs/features/utility-skills/spec.md`

สกัด requirement/scenario จาก **พฤติกรรมจริงในไฟล์ source** (ไม่เดา ไม่เขียนจากความจำ) — ทุก scenario ชี้ observable artifact ที่ตรวจได้ในไฟล์จริง

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** `tasks/spec-template` (ใช้ format/header guidance block เดียวกับ template ที่ task นั้นสร้าง — `src/.warnyin/template/docs/features/[feature-name]/spec.md`)
- **ขนานกับ:** `tasks/stage-wiring` ได้ — ไม่ชนไฟล์ (task นี้แตะเฉพาะ `docs/features/*/spec.md`, stage-wiring แตะ `src/.warnyin/workflow/` + command)
- **ส่ง output ต่อ:** spec 2 ตัวเป็น regression baseline จริงให้ VERIFY ของ topic นี้ใช้ทำ merge-trace + ให้ topic ถัดไปใช้เป็น baseline

## 3. Sub-tasks
> sub-task เชื่อมต่อกัน — อ่าน source ก่อนเขียนทุกครั้ง (ห้ามเดา)

- [x] 1. เขียน `docs/features/context-profiles/spec.md` — _สกัดจาก source ใน `spec.md` §3 (context cards 3 ใบ + README mapping + 5 callout ใน stages); ผลลัพธ์: 5 requirement, THEN = observable artifact_
- [x] 2. เขียน `docs/features/utility-skills/spec.md` — _ขึ้นกับ 1 (ใช้ format เดียวกัน); สกัดจาก 3 SKILL.md + `docs/rule.md` §1; ผลลัพธ์: 5 requirement, THEN = observable artifact_
- [x] 3. self-check accuracy — _เทียบทุก scenario กับ source pointer (spec.md §3) ว่าตรง (grep ยืนยันทุก claim); รัน `npm run lint:md` (63 ไฟล์ 44 ลิงก์ ผ่าน) + `npm run verify:pack` (75 ไฟล์ ผ่าน) + `npm test` (26/26)_

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **สร้างใหม่ (2 ไฟล์เท่านั้น):** `docs/features/context-profiles/spec.md` · `docs/features/utility-skills/spec.md`
- **ห้ามแตะ:** `src/` ใดๆ · `feature.md`/`business.md` เดิมของทั้งสอง feature · docs กลางอื่น (`docs/rule.md`, feature อื่น)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [x] 2 ไฟล์มีจริง + ตรง format §4.1 (header guidance block 6 บรรทัด + `## Requirement:`/`### Scenario:` + GIVEN/WHEN/THEN)
- [x] แต่ละไฟล์มี 5 requirement · requirement ละ 1-2 scenario · context-profiles 68 บรรทัด · utility-skills 58 บรรทัด (≤100)
- [x] ทุก scenario เทียบ source แล้วตรง (accuracy — `docs/rule.md` §5 — grep ยืนยันทุก claim); ทุก THEN = observable artifact; descriptive ไม่ใช่ imperative; placeholder เท่านั้น
- [x] `npm run lint:md` ผ่าน (path `src/...` เป็น backtick inline-code ตาม issue #2 → lint strip ไม่เช็ค dead-link)
- [x] `npm run verify:pack` ผ่าน — 2 ไฟล์ไม่หลุดขึ้น tarball (`docs/` ใน denylist — ยืนยันด้วย `npm pack --dry-run`)
- [x] ผ่าน test ตาม `spec.md` (test-flow ครบทุกข้อ) + `npm test` 26/26
- [x] ทำตาม `rule.md` และ `standard.md` (format copy จาก §4.1 + template spec-template ไม่แต่งใหม่)

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern เขียน spec): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
