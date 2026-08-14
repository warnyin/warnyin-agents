# Rule — cli-help-wording

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)
> ดึงจาก `docs/techstack/installer/rule.md` และ `docs/rule.md` — เฉพาะข้อที่เกี่ยวกับ task นี้
- [x] **canonical-copy convention** (`rule.md §1`) — substring ที่ปรากฏหลายไฟล์ต้อง copy คำต่อคำ (ไม่ paraphrase) — สำหรับ substring ใหม่ "เขียนทับเฉพาะ CORE — ..." ที่ใช้ 5 ไฟล์
- [x] **★ string ที่ถูก assert คำต่อคำชนะ pattern ประจำไฟล์เสมอ** (`rule.md §1`) — substring ใหม่ใน `--help` ต้องตรงใน test assertion (ไม่ปรับตาม style ไฟล์)
- [x] **★ ห้ามเดา / investigate-before-edit** (`rule.md §1`) — grep `--help` ใน `src/tests/installer.test.mjs` ก่อนแก้ยืนยันไม่มี assertion เก่า pin wording (ป้องกัน false assumption)
- [x] **CHANGELOG ทุก user-facing change** (`rule.md §2`) — `--help` text = user-facing → entry `### Fixed` ใน `0.29.1`
- [x] **Keep a Changelog format** (`docs/techstack/installer/standard.md`) — `## [version]` + กลุ่ม Added/Changed/Removed/Fixed
- [x] **mirror layout `src/`** = target paths (`docs/techstack/installer/rule.md`) — template `src/.warnyin/installer/templates/CLAUDE.md` = payload ติดตั้ง → ต้อง consistent กับ source `src/bin/cli.mjs`
- [x] **★ registry-target ของ root dogfood = installer template** (`docs/techstack/installer/rule.md` §packaging) — ก่อนแก้ไฟล์ root เช็ค `git check-ignore` (ignored = dogfood → แก้ที่ template); CHANGELOG.md ที่ root = committed ไม่ใช่ dogfood
- [x] **★ agent เขียน path เป็น inline-code** (`rule.md §4`) — ไฟล์ที่ agent commit ห้ามใช้ markdown-link ชี้ path; CHANGELOG entry ใช้ inline-code backtick
- [x] **★ wording fix ขยาย scope ตามจริง** (จาก design §Impact — SA blocker #5) — ไม่ใช่แค่ `cli.mjs:50` แต่ 5 จุด (ดู task.md §4)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/techstack/.../rule.md` ตอนนี้ — แค่ note ไว้ก่อน ถึง SHIP ค่อยพิจารณาย้ายขึ้นไป
- [ ] **canonical-copy discipline สำหรับ user-facing wording** — substring ที่ปรากฏหลายไฟล์ต้องข้อความเดียวกันเป๊ะ (canonical-copy rule §1) — task นี้ใช้ substring เดียวกัน 5 ไฟล์ — ควร enforce ผ่าน negative-grep test (substring เก่าต้องหายจากทุกไฟล์)
- [ ] **negative grep regression pattern** — เมื่อ wording fix, test ต้อง assert substring เก่า `NOT includes` (ไม่ใช่แค่ substring ใหม่ `includes`) — pattern ใช้ซ้ำกับ wording fix อื่น
- [ ] **CHANGELOG header ownership ระหว่าง multi-slice** — slice แรก (หลาย slice) สร้าง `## [version]` header (ว่างไม่มีวันที่) + entries ตัวเอง; slice สุดท้าย (release-hygiene) เติมวันที่ + Migration — ลด risk "version header ไม่มีใคร create" หรือ "B รอ C สร้าง header"
- [ ] **spawn test pattern สำหรับ CLI text** — เมื่อ fix `--help` / `--version` text ให้เพิ่มเคส spawn + `stdout.includes()` regression guard (ไม่พึ่ง assertion ผ่าน source grep) — pattern ทั่วไปของ CLI test