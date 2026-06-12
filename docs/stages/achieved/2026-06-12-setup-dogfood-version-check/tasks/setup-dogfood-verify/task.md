# Task — setup-dogfood-verify

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `setup-dogfood-verify` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (dev-tooling `src/scripts/setup-dogfood.mjs`) |
| **Model tier** | `balanced` |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
ทำให้ `setup:dogfood` **จับ version drift** ได้: query latest จาก registry → pin exact version + `--prefer-online` (กัน stale npx cache) → `verifyInstalled(root, expected)` เทียบ stamp กับ expected (transition-safe) ทั้ง npx + pack path. เป็น **consumer ของ Stamp contract `design.md §4A`**. End-to-end: logic (script) → unit test → CHANGELOG.

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: — (ไม่มี runtime dependency — **decouple ผ่าน Stamp contract §4A**)
- ปลดล็อกให้: —
- รับ input จาก: **Stamp contract** (`.warnyin/.warnyin-version`, plain text semver + `\n`) ที่ `tasks/installer-version-stamp` เป็น producer — task นี้ **อ่าน** ตาม contract; unit test สร้าง stamp ปลอมเองตาม contract (ไม่ต้องรอ runtime ของ task นั้น)
- **integration จริง (end-to-end `setup:dogfood`)** พิสูจน์เต็มได้หลัง publish release ที่มี stamp → **defer** (ไม่ใช่ gate ของ topic — `design.md §6/§8`)

## 3. Sub-tasks
- [x] 1. `resolveExpectedVersion() → string|null` — `spawnSync(npm,['view',PKG_NAME,'version'],{timeout:15000})` (`npm = isWin?'npm.cmd':'npm'`); parse บรรทัด semver จริง (`.trim().split(/\r?\n/).pop()?.trim()` + sanity `/^\d+\.\d+\.\d+/`); exit≠0/empty/timeout/ไม่ match → `null` _(ผลลัพธ์: expected version หรือ null=degrade)_
- [x] 2. แยก `PKG_NAME = '@warnyin/agents'` จาก tag (เดิม `PKG='@warnyin/agents@latest'`); spec = `expected ? PKG_NAME+'@'+expected : PKG_NAME+'@latest'` _(ขึ้นกับ 1)_
- [x] 3. `readStamp(root) → string|null` + ปรับ `verifyInstalled(root, expected?)` ตาม truth table `design.md §4B` (normalize trim สองฝั่ง; falsy expected = degrade; stamp ขาด = transition true; stamp≠expected = false) _(ขึ้นกับ contract §4A)_
- [x] 4. ปรับ `installViaNpx(expected)` + `installViaPack(expected)` — รับ expected, ใช้ spec ข้อ 2, set env `npm_config_prefer_online:'true'` (npx), **ส่ง `expected` เข้า `verifyInstalled` ทั้ง 2 call site** (เดิม npx L63 + pack L126) + warn loud ตาม §4B _(ขึ้นกับ 2,3)_
- [x] 5. `main()` — `EXPECTED = resolveExpectedVersion()` แล้วส่งเข้า `installViaNpx(EXPECTED) || installViaPack(EXPECTED)` _(ขึ้นกับ 4)_
- [x] 6. unit test ใน `src/tests/setup-dogfood.test.mjs` — ต่อยอด 3 เคสเดิม + เคสใหม่ตาม spec test-flow
- [x] 7. `CHANGELOG.md` — Fixed entry (false-green รอบ 2 / issue #3)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/scripts/setup-dogfood.mjs` — `resolveExpectedVersion`, `readStamp`, `verifyInstalled(root,expected)`, `installViaNpx/Pack(expected)`, `main()`, แยก `PKG_NAME` (ห้ามแตะ `appendContributingPointer` / fallback extract logic)
- `src/tests/setup-dogfood.test.mjs` — เพิ่มเคส (เคสเดิม 3 ต้องไม่พัง)
- `CHANGELOG.md` — Fixed
- **ไม่แตะ** `cli.mjs` (task 1) / `verify-pack` (task 1 ทำ)

## 5. Acceptance criteria
- [x] `verifyInstalled(tmp)` (ไม่มี expected) → marker-only เดิม (เคส 1-3 เดิมไม่พัง — backward compat)
- [x] `verifyInstalled(root,'9.9.9')` เมื่อ stamp=`0.1.0\n` → **false** (drift-guard — เคสแก่น)
- [x] stamp=expected → true · stamp ขาด+expected set → true (transition) · expected `null`/`''` → true (degrade)
- [x] CRLF: stamp `"0.16.0\r\n"` + expected `"0.16.0"` → true
- [x] `resolveExpectedVersion` parse `"npm warn ...\n0.16.0\n"` → `0.16.0`; empty/exit≠0 → `null`
- [x] wire-proof: `installViaNpx` **และ** `installViaPack` ส่ง `expected` เข้า `verifyInstalled` (structural assert)
- [x] `npm test` เขียวทั้ง suite (pass-count ≥ 9); `lint:md` ผ่าน (CHANGELOG)
- [x] ผ่าน test ตาม `spec.md` (test-flow) · ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
