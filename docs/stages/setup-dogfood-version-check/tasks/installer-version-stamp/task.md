# Task — installer-version-stamp

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `installer-version-stamp` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (`src/bin/cli.mjs`) |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
ให้ `cli.mjs` เขียน **version stamp** `.warnyin/.warnyin-version` (= `package.json` version) ลง target ทุกครั้งที่ install/`--update` ทั้ง mode `project` + `global` → payload มี **version identity** ตรวจ drift ได้ (เป็น producer ของ Stamp contract `design.md §4A`). End-to-end: logic (helper ใน cli) → black-box test → CHANGELOG.

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: — (ไม่มี — independent)
- ปลดล็อกให้: `tasks/setup-dogfood-verify` (consumer ของ stamp) — **decouple ผ่าน Stamp contract §4A** (path+format); task นี้ไม่ต้องรอ task นั้น และ task นั้นไม่ต้องรอ runtime ของ task นี้ (มันสร้าง stamp ปลอมตาม contract ทดสอบเอง)
- ส่ง output ต่อ: **Stamp contract** — ไฟล์ `.warnyin/.warnyin-version`, plain text บรรทัดเดียว = exact semver + trailing `\n`

## 3. Sub-tasks
- [ ] 1. เพิ่ม helper `readPkgVersion()` — อ่าน `JSON.parse(readFileSync(path.join(pkgRoot,'..','package.json'),'utf8')).version` _(ผลลัพธ์: version string ของ package ที่กำลังติดตั้ง)_
- [ ] 2. เพิ่ม helper `writeVersionStamp()` — เขียน `path.join(target,'.warnyin','.warnyin-version')` = `ver+'\n'` แบบ **unconditional** (`writeFileSync` ตรง ไม่ skip-if-equal); เคารพ `DRY` (ไม่เขียนจริงตอน dry-run แต่ log + นับ `stats`); ใช้ `stats[exists?'updated':'created']` + log `+`/`↻` (exists = log icon เท่านั้น) _(ขึ้นกับ 1)_
- [ ] 3. wire `writeVersionStamp()` ใน `main()` **หลัง `for (const dir of CORE) copyTree(...)` ทั้ง 2 branch** — global (~บรรทัด 274) + project (~บรรทัด 280) _(ขึ้นกับ 2)_
- [ ] 4. black-box test ใน `src/tests/installer.test.mjs` (reuse `runCli`/`globalEnv`) — 4 เคส (a–d) ตาม spec test-flow
- [ ] 5. **verify-pack testable assert** — เพิ่มเคสใน `src/tests/verify-pack.test.mjs`: ป้อน `'.warnyin/.warnyin-version'` (root-level) ลง file list ปลอม → assert `checkFiles` คืน error (gate จับได้ถ้า stamp หลุดขึ้น tarball) — **ไม่แก้ `checkFiles` โค้ดจริง** (deny `.warnyin/` + นอก allowlist granular ครอบอยู่แล้ว — panel Infra-S1)
- [ ] 6. `CHANGELOG.md` — Added entry ระบุ path `.warnyin/.warnyin-version` ชัด

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/bin/cli.mjs` — เพิ่ม 2 helper + wire ใน main() 2 branch (ห้ามแตะ `copyTree`/`seedDocs`/`ensureScaffold`/install-mode resolution)
- `src/tests/installer.test.mjs` — เพิ่มเคส test (ไม่แก้ harness เดิม)
- `src/tests/verify-pack.test.mjs` — เพิ่ม 1 เคส (deny stamp ที่ root) — ไม่แก้ `verify-pack.mjs`
- `CHANGELOG.md` — Added

## 5. Acceptance criteria
- [ ] install (project) → `.warnyin/.warnyin-version` มี + เนื้อหา = repo `package.json` version จริง + match `/^\d+\.\d+\.\d+/`
- [ ] install `--global` → `home/.warnyin/.warnyin-version` ตรงเวอร์ชัน
- [ ] `--dry-run` → ไม่มีไฟล์ stamp เขียนจริง (แค่ log)
- [ ] `--update` ซ้ำด้วย version เดิม → ไฟล์ byte-equal (idempotent by overwrite — ไม่ assert stdout marker "ข้าม")
- [ ] `verify-pack.test.mjs` เคสใหม่: `checkFiles(['.warnyin/.warnyin-version'])` คืน error (gate จับ stamp ที่หลุด); `npm run verify:pack` ผ่าน
- [ ] `npm test` เขียวทั้ง suite (pass-count ≥ 9, ไม่มี assertion เดิมพัง); `lint:md` ผ่าน (CHANGELOG)
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
