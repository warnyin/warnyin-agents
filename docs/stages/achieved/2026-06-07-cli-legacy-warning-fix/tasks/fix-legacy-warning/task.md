# Task — fix-legacy-warning

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `fix-legacy-warning` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
> cli legacy warning บอกคำสั่งที่ทำงานจริงถูก (ตรง Migration guide robust) + test ยืนยัน — ผู้ใช้รุ่นเก่าทำตาม warning แล้ว migrate สำเร็จไม่ซ้อน

## 2. Dependency
- ต้องทำหลัง: — (task เดียว)
- sub-task ภายใน: A (แก้ cli) → B (แก้ test assert) → C (re-verify migration proof)

## 3. Sub-tasks
- [x] **A. แก้ `src/bin/cli.mjs`** 2 block — `legacyV2`/`legacyV5` คำสั่ง robust (`mkdir -p docs/stages && git mv .../* docs/stages/` + `rm -rf` core เก่า); header codepoint เดิม + คอมเมนต์อัปเดต
- [x] **B. แก้ `src/tests/installer.test.mjs`** เคส 5 → `git mv warnyin/stages/* docs/stages/`; เคส 6 → `git mv warnyin-stages/* docs/stages/` (คอมเมนต์อ้าง topic roadmap-sync-p0)
- [x] **C. re-verify** — `npm test` 18/18 + executable migration proof ผ่าน 2 รุ่น (install-after, งานไม่หาย/ไม่ซ้อน/ไม่ warn ซ้ำ) + cli spawn ยืนยันคำสั่ง robust จริง

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/bin/cli.mjs` (legacy warning 2 block — string เท่านั้น)
- `src/tests/installer.test.mjs` (เคส 5/6 assert)

## 5. Acceptance criteria
- [x] cli warning 2 block = คำสั่ง Migration guide robust (`CHANGELOG.md`) เป๊ะ
- [x] codepoint header รุ่นคงเดิม (≤ U+2264, en-dash U+2013)
- [x] test เคส 5/6 assert string ใหม่ · `npm test` 18/18
- [x] executable migration proof ผ่านทั้ง 2 รุ่น (คำสั่งจาก warning จริง)
- [x] `git diff` แตะเฉพาะ `src/bin/cli.mjs` + `src/tests/installer.test.mjs`
- [x] ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
