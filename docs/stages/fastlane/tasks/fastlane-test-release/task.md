# Task — fastlane-test-release

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `fastlane-test-release` |
| **Slice อ้างอิง** | `design.md` slice #3 |
| **Component** | `installer` |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
พิสูจน์ได้ว่า `/warnyin:fastlane` **ติดตั้งลงเครื่อง user จริง** + กฎ fast tier **ไม่ drift 2 ที่** (canonical เดียวที่ `triage.md`) + ปล่อยรุ่นได้ (CHANGELOG + version) — ทุกอย่างเป็นเคสใน `npm test` ที่ CI รันทุก PR ไม่ใช่การอ่านเอกสารด้วยตา

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** `tasks/fastlane-playbook` **และ** `tasks/fastlane-wiring` — **wave 2 (task สุดท้าย)**
  - เหตุผล 1: เคสส่วนใหญ่ **assert ไฟล์จริง** ที่ 2 task นั้นสร้าง/แก้ (`fastlane.md`, adapter, stage 4 ไฟล์, registry 3 ไฟล์) — รันก่อนไฟล์มี = แดงเปล่า
  - เหตุผล 2: **release-hygiene (CHANGELOG/bump/`lint:md`) ต้องเป็น wave สุดท้ายเสมอ** — gate ที่ต้องเห็น pointer ครบข้าม slice ต้องรันหลัง integrate (`docs/rule.md:23`)
- **ปลดล็อกให้:** VERIFY/SHIP ของ topic (ไม่มี task ต่อ)
- **ส่งต่อ:** suite เขียว + `pass===tests` → เป็นหลักฐาน gate ของ VERIFY

## 3. Sub-tasks
- [ ] 1. **ยืนยัน precondition** — ไฟล์ของ task 1+2 มีจริง (`src/.warnyin/workflow/fastlane.md`, `src/.claude/commands/warnyin/fastlane.md`, registry 3 ไฟล์, stage 4 ไฟล์แก้แล้ว) — ไม่ครบ → **หยุด รายงาน** ห้ามเขียน test ไล่ตามไฟล์ที่ยังไม่มี
- [ ] 2. **install proof (A1–A2)** ใน `src/tests/installer.test.mjs` — reuse `makeTempProject`/`runCli`/`ok` — _ผลลัพธ์:_ 1–2 เคสใหม่
- [ ] 3. **canonical + anchor + consistency + ordering + regression (B–F)** — node ล้วน (`readdirSync`/`readFileSync`); อยู่ใน `installer.test.mjs` หรือแยก `src/tests/fastlane.test.mjs` (bare discovery เจอเอง) — _ขึ้นกับ 1:_ ต้องมี string C4 จริงจาก adapter
- [ ] 4. **falsifiability check** — แทรก string ต้องห้ามชั่วคราวใน `fastlane.md` (เช่นลอกคำ `config-protection`+`investigate-before-edit`) → เคส B3 ต้อง **แดง** → ลบออก → เขียว (พิสูจน์ว่า test จับ drift จริง ไม่ใช่ผ่านเงียบ)
- [ ] 5. **CHANGELOG.md** — เพิ่ม entry `## [0.27.0] - <วันที่>` : **Added** `/warnyin:fastlane` (executor fast tier: pre-flight receipt → code-first → gate → receipt → ship-lite + archive; playbook `.warnyin/workflow/fastlane.md`) · **Changed** hard-floor 5 หมวด รับ **explicit user override** (เตือน → ถาม → ยืนยัน → บันทึก `override โดย user` ใน receipt meta; ship-lite ยอม ship เฉพาะ receipt ที่มี override) — `/warnyin:triage` ยัง read-only + ยังห้ามแนะนำ fast เหมือนเดิม
- [ ] 6. **package.json** — bump `0.26.0` → **`0.27.0`** (minor — feature ใหม่ backward-compatible)
- [ ] 7. **รัน gate ครบ** (ดู §5)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/tests/installer.test.mjs` (เพิ่มเคส — ห้ามแก้/ลบ assertion เดิม)
- `src/tests/fastlane.test.mjs` (optional — เคส structural/canonical ถ้าแยก)
- `CHANGELOG.md` · `package.json` (version เท่านั้น)
- **ไม่แตะ:** `src/scripts/check-test-count.mjs` (MIN_PASS=46 เป็น **floor** ไม่ใช่ยอดจริง — suite จริง ~135 เคส; gate ที่ทำงานจริงคือ `pass === tests` ซึ่งครอบเคสใหม่อัตโนมัติ) · `src/scripts/verify-pack.mjs` · `cli.mjs` (copyTree recursive ครอบไฟล์ใหม่แล้ว) · **root `.warnyin/`, `.claude/`, root `CLAUDE.md`** (dogfood gitignored)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] เคสใน `spec.md` §7 A–F ครบและเขียว (install proof · canonical negative-grep · anchor · consistency C4 คำต่อคำ · ordering · regression)
- [ ] เคส B3 พิสูจน์แล้วว่า **แดงได้จริง** (sub-task 4) — ไม่ใช่ assertion ที่ผ่านเสมอ
- [ ] `npm test` เขียว — **bare `node --test` ห้ามใส่ path arg** — และ summary `pass === tests`, `fail === 0` (0 skip)
- [ ] `npm run lint:md` เขียว (CHANGELOG + ไฟล์ใหม่ไม่มี dead link)
- [ ] `npm run verify:pack` เขียว (payload `.md` ใหม่ติด tarball ผ่าน allowlist เดิม; Windows ENOENT → KB#4 ใช้ `npm pack --json` + `checkFiles`)
- [ ] `CHANGELOG.md` มี Added + Changed ตาม §3 ข้อ 5 · `package.json` = `0.27.0`
- [ ] `git status` ไม่มีไฟล์ root `.warnyin/`/`.claude/` ถูกแตะ
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
