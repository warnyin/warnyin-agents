# Task — remove-export

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `remove-export` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (`build-wave.mjs`) |
| **Model tier** | `cheap` _(ลบ keyword 2 จุด + CHANGELOG — mechanical, exact change ระบุใน design §3)_ |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
build-wave.mjs launch ผ่าน Workflow tool ได้ (ไม่เจอ `SyntaxError: Unexpected keyword 'export'`) โดย unit test ยังเขียว — end-to-end: ลบ export → Workflow parse ได้ → fan-out ทำงาน

## 2. Dependency
- ไม่มี (task เดียว)

## 3. Sub-tasks
- [ ] 1. `src/.warnyin/workflow/scripts/build-wave.mjs` — ลบ `export ` หน้า `function normalizeTasks` (บรรทัด ~28) และ `function buildOpts` (บรรทัด ~35); **คง** `export const meta` _ผลลัพธ์:_ เหลือ export เดียว
- [ ] 2. `npm test` — ยืนยัน `build-wave.test.mjs` เขียว (extractFn ยังหา function เจอ) _ขึ้นกับ 1_
- [ ] 3. `CHANGELOG.md` — เพิ่ม entry `### Fixed` ใต้ [Unreleased]: build-wave.mjs launch ผ่าน Workflow tool ได้ (ลบ top-level `export function` ที่ทำให้ Workflow loader พัง) — backward-compatible behavior identical

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- แก้: `src/.warnyin/workflow/scripts/build-wave.mjs`, `CHANGELOG.md`
- ไม่แตะ: `build-wave.test.mjs` (extraction-based — ผ่านอยู่แล้ว), script อื่น, root dogfood

## 5. Acceptance criteria
- [ ] `src/...build-wave.mjs` ไม่มี `^export function` (เหลือเฉพาะ `export const meta`) — `grep -nE "^export " ...` คืน 1 บรรทัด
- [ ] `npm test` เขียวครบ (ไม่มี fail) — โดยเฉพาะ 6 เคส build-wave (A/B/C/D/E + isolate)
- [ ] behavior ของ `normalizeTasks`/`buildOpts` ไม่เปลี่ยน (test เดิมยืนยัน)
- [ ] CHANGELOG entry ครบ (ภาษาไทย, Keep a Changelog)
- [ ] ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิง
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
