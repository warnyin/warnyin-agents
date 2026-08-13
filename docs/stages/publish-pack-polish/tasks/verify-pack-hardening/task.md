# Task — verify-pack-hardening

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `verify-pack-hardening` |
| **Slice อ้างอิง** | `design.md` slice A |
| **Component** | `installer` |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
เพิ่ม EOL gate ใน `verify:pack` (text files ใน payload ต้องเป็น LF — ไม่มี CR) + แก้ Windows dev ให้รันได้ (`process.execPath + npm_execpath` ไม่ใช่ `.cmd`) — script → unit → behavior end-to-end

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: `tasks/[topic]/proposal.md` + `tasks/[topic]/design.md` (มีอยู่แล้ว)
- ปลดล็อกให้: `tasks/release-hygiene` (ต้องการ test count ใหม่เพื่อ bump MIN_PASS)
- ส่ง output อะไรต่อให้ task ถัดไป: จำนวนเคส test ใหม่ (+4 verify-pack + 0 installer) ให้ release-hygiene คำนวณ N

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
> sub-task ต้องเชื่อมต่อกัน — ระบุลำดับ/สิ่งที่ส่งต่อกัน

- [ ] 1. **export TEXT_EXT ใน `cli.mjs`** — เปลี่ยน `const TEXT_EXT = new Set([...])` เป็น `export const TEXT_EXT = new Set([...])` + เพิ่ม `.css`/`.html`/`.cjs` ในเซ็ต — _ผลลัพธ์: cli.mjs export สำเร็จ, `normalizeEol` ยังใช้งานได้_
- [ ] 2. **เพิ่ม `getNpmCmd(platform)` ใน `verify-pack.mjs`** — pure fn export + main-guard — _ขึ้นกับ 1: ไม่, independent_
- [ ] 3. **เพิ่ม `checkEol(entries)` ใน `verify-pack.mjs`** — pure fn export + Buffer-level check + TEXT_EXT import — _ขึ้นกับ 1: ใช่ (TEXT_EXT import)_
- [ ] 4. **เพิ่ม `readTextEntries(files, opts)` ใน `verify-pack.mjs`** — I/O + path guards + size cap + injectable readFile/root — _ขึ้นกับ 1: ใช่ (TEXT_EXT import ใน checkEol)_
- [ ] 5. **refactor `main()` ใน `verify-pack.mjs`** — เรียก helper ทั้ง 3 ตัว + `--ignore-scripts` arg + ไม่ใช้ `npm.cmd` — _ขึ้นกับ 2,3,4: ทั้งหมด_
- [ ] 6. **เพิ่ม unit test 4 เคสใน `verify-pack.test.mjs`** — `getNpmCmd` × 4 + `checkEol` × 4 + `readTextEntries` × 5 — _ขึ้นกับ 2,3,4: ทดสอบ pure fn ที่ export_
- [ ] 7. **self-check GOOD fixture is LF** — ก่อน build รัน `git ls-files --eol | grep -v 'w/lf'` ใน working tree → ถ้ามี non-LF → renormalize ก่อน — _ขึ้นกับ 5: ต้องมี main() ใหม่ก่อน_

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- ไฟล์/โมดูล:
  - `src/bin/cli.mjs` (line 110): export `TEXT_EXT` + เพิ่ม `.css`/`.html`/`.cjs`
  - `src/scripts/verify-pack.mjs` (line 1-74): เพิ่ม `getNpmCmd` / `checkEol` / `readTextEntries` + refactor `main()`
  - `src/tests/verify-pack.test.mjs`: เพิ่ม 13 เคส (4 + 4 + 5) — แต่ละเคสตาม spec.md §7

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] `node src/scripts/verify-pack.mjs` บน mac/linux: exit 0 (existing payload ผ่าน EOL check)
- [ ] `node src/tests/verify-pack.test.mjs`: เคสใหม่ 13 เคส + เคสเดิม 13 เคส = 26 เคส ผ่าน (regression guard)
- [ ] `getNpmCmd('win32')` + npm_execpath ปลอม: คืน `{ bin: process.execPath, prefix: [path] }`
- [ ] `getNpmCmd('win32')` + no npm_execpath: คืน `null`
- [ ] `checkEol([{path, buf:CRLF, ext:.md}])`: มี error prefix `eol:` + sanitized path
- [ ] `readTextEntries(['/etc/passwd'])`: มี error prefix `path: absolute path` (ไม่ read)
- [ ] ผ่าน test ตาม `spec.md` (test-flow) — เคสครบทุก scenario
- [ ] ทำตาม `rule.md` และ `standard.md`
- [ ] **RED proof** (rule §5 falsifiability): revert EOL check logic + assert test แดง, restore → เขียว (พิสูจน์ test จับ regression จริง)
- [ ] `git ls-files --eol | grep -v 'w/lf'` = empty (working tree = LF ทั้งหมด — self-check GOOD fixture)

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`