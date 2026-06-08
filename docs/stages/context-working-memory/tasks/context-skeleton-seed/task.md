# Task — context-skeleton-seed

> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `context-skeleton-seed` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
ติดตั้ง/อัปเดต workflow แล้ว `docs/stages/context.md` มี **โครง working-notes** (canonical `design.md` §3) — แทนไฟล์เปล่าที่ scaffold ปัจจุบันสร้าง — โดย **ไม่ทับ** ถ้าผู้ใช้มี context.md อยู่แล้ว (end-to-end: template → installer → ผลใน 

target + test ยืนยัน)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: — (เริ่มได้เลย / wave 1)
- ปลดล็อกให้: `tasks/ship-maintenance-wiring` (มันอ้าง section ของ context.md ที่ task นี้สถาปนา)
- ส่ง output อะไรต่อ: ไฟล์ template `.warnyin/template/stages/context.md` (canonical skeleton) + พฤติกรรม seed

## 3. Sub-tasks
- [ ] 1. สร้าง template `src/.warnyin/template/stages/context.md` ตาม canonical `design.md` §3 — _ผลลัพธ์:_ ไฟล์ skeleton 4 section
- [ ] 2. แก้ `src/bin/cli.mjs` `ensureScaffold()` ให้ seed `docs/stages/context.md` จาก template (อ่านจาก `pkgRoot/.warnyin/template/stages/context.md`) เมื่อ **ไม่มีไฟล์**; มีแล้ว → skip — _ขึ้นกับ 1:_ ต้องมี template ก่อน; เคารพ `DRY` + `stats.{created,skipped}` + log `+`
- [ ] 3. เขียน test ใน `src/tests/` (black-box ตาม `installer.test.mjs` harness) ครอบ acceptance — _ขึ้นกับ 2_
- [ ] 4. เพิ่ม entry `CHANGELOG.md` (Added: context.md scaffold เป็น skeleton; note backward-compat ไฟล์ว่างเดิมจะไม่ถูกทับ)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **สร้าง:** `src/.warnyin/template/stages/context.md`
- **แก้:** `src/bin/cli.mjs` (`ensureScaffold` + อาจปรับ `SCAFFOLD_FILES` ให้รองรับ seed-from-template)
- **สร้าง/แก้ test:** `src/tests/installer.test.mjs` (หรือไฟล์ test ใหม่ใน `src/tests/`)
- **แก้:** `CHANGELOG.md`
- **ห้ามแตะ:** `validate-topic.mjs` (skip context.md อยู่แล้ว), `verify-pack.mjs` (template อยู่ใน ALLOWED_PREFIX แล้ว), `docs/` กลาง

## 5. Acceptance criteria
- [ ] install ใน temp project (ไม่มี context.md) → `docs/stages/context.md` มีอยู่ + **non-empty** + มี 4 header ตาม canonical (โฟกัส/ธีมปัจจุบัน, Decision ข้าม topic, Parking lot, เพิ่ง ship)
- [ ] มี `docs/stages/context.md` เนื้อหาเดิมอยู่ → install **และ** `--update` → ไฟล์ **byte-equal เดิม** (นับ `skipped`, ไม่ทับ)
- [ ] `--dry-run` → ไม่เขียนไฟล์จริง แต่ log + นับ stats
- [ ] seed อ่านจาก `.warnyin/template/` (ไม่ copy `docs/stages/` ของ repo ต้นทาง) — ไม่มี scaffold-leak
- [ ] ผ่าน test ตาม `spec.md` (test-flow); `node --test` เขียวทั้งหมด (รวม `check-test-count` MIN_PASS)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical schema: `../../design.md` §3
