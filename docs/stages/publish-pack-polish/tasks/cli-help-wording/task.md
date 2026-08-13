# Task — cli-help-wording

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `cli-help-wording` |
| **Slice อ้างอิง** | `design.md` slice B |
| **Component** | `installer` |
| **Model tier** | `cheap` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
แก้ wording `--update` ใน `--help` text ให้ตรงข้อเท็จจริง (5 จุด) — `seedDocs()` รันจริงแต่ไม่ทับของเดิม — + regression test spawn `--help` กัน wording เด้งกลับ

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: `tasks/[topic]/design.md` (มีอยู่แล้ว)
- ปลดล็อกให้: `tasks/release-hygiene` (ต้องการ test count +1 จาก installer.test; ต้องการ CHANGELOG header `[0.29.1]` ที่ Slice B สร้าง)
- ส่ง output อะไรต่อให้ task ถัดไป:
  - 5 ไฟล์ที่ wording ตรงกัน (canonical single source)
  - 1 เคส test ใหม่ใน `installer.test.mjs`
  - `CHANGELOG.md` header `## [0.29.1]` (ว่าง) + `### Fixed` entry ของ slice B

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
> sub-task ต้องเชื่อมต่อกัน — ระบุลำดับ/สิ่งที่ส่งต่อกัน

- [ ] 1. **grep pre-check** — `grep -F 'ไม่แตะ docs/' src/bin/cli.mjs src/.warnyin/installer/templates/CLAUDE.md src/.warnyin/workflow/README.md README.md` ก่อนแก้ — ผลลัพธ์: รายการไฟล์ที่ต้องแก้ (verify 5 จุด + อาจเจอจุดอื่น)
- [ ] 2. **แก้ wording ใน `src/bin/cli.mjs:50`** — เปลี่ยน `ไม่แตะ docs/ และงานจริง` → `เขียนทับเฉพาะ CORE — ไฟล์ docs/ ถูก seed จาก template ถ้ายังไม่มี ไม่ทับของเดิม`
- [ ] 3. **แก้ wording ใน `src/.warnyin/installer/templates/CLAUDE.md:49`** — substring เดียวกัน — _ผลลัพธ์: payload ที่ติดตั้งลง user repo ตรงกับ source_
- [ ] 4. **แก้ wording ใน `src/.warnyin/workflow/README.md:101`** — substring เดียวกัน — _ผลลัพธ์: workflow README (ติดตั้งใต้ `.warnyin/`) ตรงกัน_
- [ ] 5. **แก้ wording ใน `README.md:40`** — substring เดียวกัน — _ผลลัพธ์: README บน npm/GitHub ตรงกัน_
- [ ] 6. **(optional) grep template อื่น** — `src/.warnyin/installer/templates/CLAUDE.global.md` + `copilot-instructions.md` + `clinerules` + `GEMINI.md` ถ้าเจอ substring เก่า → แก้ด้วย (single canonical)
- [ ] 7. **เพิ่มเคส spawn test ใน `src/tests/installer.test.mjs`** — `runCli(cwd, ['--help'])` → assert `stdout.includes('เขียนทับเฉพาะ CORE')` + `!stdout.includes('ไม่แตะ docs/')` + `code === 0`
- [ ] 8. **สร้าง CHANGELOG `## [0.29.1]` header (ว่าง) + entry** — `### Fixed` + bullet "cli --help wording: 'ไม่แตะ docs/' → 'docs/ ถูก seed จาก template ไม่ทับของเดิม'" — _ผลลัพธ์: Slice C เติมวันที่ + Migration ภายหลัง_
- [ ] 9. **post-check grep** — `grep -F 'ไม่แตะ docs/'` ใน 5 ไฟล์ = empty + `grep -F 'เขียนทับเฉพาะ CORE'` = 5 matches

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- ไฟล์/โมดูล:
  - `src/bin/cli.mjs` บรรทัด 50 (--help body)
  - `src/.warnyin/installer/templates/CLAUDE.md` บรรทัด 49 (payload)
  - `src/.warnyin/workflow/README.md` บรรทัด 101 (workflow README)
  - `README.md` บรรทัด 40 (npm README)
  - `src/tests/installer.test.mjs` (1 เคสใหม่)
  - `CHANGELOG.md` (header + entry — ไม่เติมวันที่)
  - (optional) template อื่น ๆ ที่ grep เจอ

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] substring เก่า `ไม่แตะ docs/` หายจาก 5 ไฟล์ที่แก้ (grep -F = empty)
- [ ] substring ใหม่ `เขียนทับเฉพาะ CORE` ปรากฏใน 5 ไฟล์ (grep -F = 5 matches)
- [ ] spawn test ผ่าน: `stdout.includes('เขียนทับเฉพาะ CORE')` + `!stdout.includes('ไม่แตะ docs/')` + `code === 0`
- [ ] เคสเดิมทั้งหมดใน `installer.test.mjs` ยังผ่าน (regression guard)
- [ ] `CHANGELOG.md` มี `## [0.29.1]` header (ว่างไม่มีวันที่) + `### Fixed` + bullet ของตัวเอง
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`
- [ ] **RED proof**: revert substring fix → spawn test fail; restore → เขียว

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`