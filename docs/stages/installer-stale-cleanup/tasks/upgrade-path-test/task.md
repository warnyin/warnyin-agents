# Task — upgrade-path-test

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `upgrade-path-test` |
| **Slice อ้างอิง** | `design.md` slice #2 — "upgrade path ถูกพิสูจน์" |
| **Component** | `installer` |
| **Model tier** | `balanced` |
| **สถานะ** | `build เสร็จ (wave 1)` |

## 1. เป้าหมายของ task (vertical slice)
พิสูจน์ **upgrade path** ของ installer แบบ end-to-end: ผู้ใช้ที่ติดตั้งจากรุ่นก่อน `0.30.1` แล้วรัน `--update` ต้องได้ **payload สะอาด** (ไฟล์ตกรุ่นหาย) โดย **งานผู้ใช้ไม่หายแม้แต่ไฟล์เดียว** — ขอบเขตคือ **black-box U1–U20** เท่านั้น

**★ ขอบเขตที่ _ไม่ใช่_ ของ task นี้ — falsifiability ของ guard:** mutant harness + mutation matrix ถูกแยกออกเป็น slice 2b `tasks/mutant-harness/` (**wave 2**) ตาม `design.md §2`/`§7` เพราะ mutation ต้อง replace **สตริงจริงในโค้ด prune** ซึ่ง wave 1 ยังไม่มี · ส่วน **single-guard falsification** (ปิด guard ทีละชั้นแล้วเหยื่อต้องหาย) เป็นความรับผิดชอบของ **unit ใน `tasks/prune/`** ที่เรียก `computeStale` ตรงโดยไม่ผ่าน C8 (`design.md §7`) ⇒ **task นี้ไม่ต้องพิสูจน์ว่า assertion negative ของตัวเองไม่กำพร้า** แต่ต้องเขียน assertion ให้ mutant-harness หยิบ state ไปใช้ต่อได้ (helper ตั้งชื่อชัด, state ประกอบซ้ำได้)

**ทำไมต้องมี:** บั๊กนี้รอดมาได้เพราะ **ไม่เคยมีเทส upgrade path เลย** (suite เดิมครอบแค่ install สดลง temp เปล่า) และ `verify:pack` ตรวจ tarball ไม่ได้ตรวจ **ปลายทางหลังติดตั้ง**

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** _ไม่มี_ — **wave 1 ขนานกับ `tasks/prune/`**
- **แหล่งความจริงเดียวที่อ่าน:** `design.md §4` contract **C1–C16** (+ §5 flow, §7, §8, §9) — **ห้ามอ่าน/รอโค้ดของ slice `prune`**
- **ปลดล็อกให้:**
  - `tasks/mutant-harness/` (**wave 2**) — ใช้ helper/fixture ของไฟล์นี้เป็นต้นแบบของ state ที่ mutation จะ replay (ห้ามแต่ง state ใหม่)
  - `tasks/release-hygiene/` (**wave 3**) — ส่งต่อ **จำนวนเคสจริง** เพื่อ bump `MIN_PASS` ใน `check-test-count.mjs` (task นี้ **ห้ามแก้ไฟล์นั้นเอง**)
- **ส่ง output ต่อ:** ไฟล์เทส + รายงาน "เคสไหนแดงด้วยเหตุผลอะไร" ให้ full-gate ของ BUILD ใช้ปิดงาน

## 3. Sub-tasks

- [x] 1. **harness ในไฟล์** — `makeTempProject` / `runCli` / `globalEnv` / `listFiles` / `ok` / `copyDir` / `sha256OfFile` / `manifestPath` / `writeManifest` / `writeSyntheticManifest` / `addStaleEntry` / `rmKnownStale` / `realHomeSnapshot` — _ผลลัพธ์:_ ไฟล์รันผ่าน `node --test` ได้โดยไม่ crash ระดับ module
- [x] 2. **fixture pipeline** (`makeOldPkg` → `installOld` → `fixtureA` / `fixtureB`) ตาม `spec.md §4` — _ขึ้นกับ 1:_ ใช้ `copyDir` · **pkg เก่า = copy `src/` ทั้งก้อน + เติม 2 ไฟล์ที่ถูกยุบกลับ + `version: '0.29.9'`** · **★ fixture B ต้องเรียก `writeSyntheticManifest(target)` เขียน manifest เองด้วย sha256 จากไฟล์จริง** ไม่งั้น fixture B degenerate ไปเส้น known-stale เหมือน fixture A (pkgOld ยังไม่มีโค้ดเขียน manifest)
- [x] 3. **เคสเส้นหลัก** U1–U4 (known-stale · hash · ของผู้ใช้รอดครบ · hash mismatch) — _ขึ้นกับ 2_
- [x] 4. **เคส guard/adversarial** U5–U7 (manifest ปลอม 7 รูปตาม `spec.md §7.2.1` — **แถว control char ต้องมี byte `\x01` จริงใน entry** · symlink ancestor · **symlink leaf ที่ hash ตรงกับ _ปลายทาง_ symlink**) พร้อม `REASONS` เซตปิดจาก C15
- [x] 5. **เคส mode/boundary** U8–U14 (`--global` สองครึ่ง + `realHomeSnapshot` + C16 · **cap 50/51 ที่ `rmKnownStale` ก่อนเสมอ** · `--dry-run` ยกเว้น cap · `--no-prune` + C13 · `--dry-run` ไม่แตะ manifest)
- [x] 6. **เคส semantics/robustness** U15–U20 (T1 payloadNew · idempotent · manifest เสีย+duplicate ของ path ที่เป็น stale จริง · manifest เกินเพดาน **ที่ known-stale เปิดแล้วลบ 2 ไฟล์จริง** · EACCES ที่มี stale ตัวที่ 3 คนละ dir · install สด)
- [x] 7. **ตรวจ self-consistency** — รัน `node --test` แล้วบันทึก **ชื่อเคส + เหตุผลที่แดง** เทียบกับ expected-red list ใน §7; ไม่มีเคสไหนแดงด้วย `TypeError`/`ENOENT` ของ harness เอง; ไม่มี `t.skip` ในไฟล์; **นับจำนวนเคสจริงจาก output**

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

**เป็นเจ้าของแต่ผู้เดียว (สร้างใหม่):**
- `src/tests/installer-upgrade.test.mjs`

**ห้ามแตะเด็ดขาด:**
- `src/bin/cli.mjs` — **ห้ามแก้เพื่อให้เทสเขียว** ไม่ว่ากรณีใด
- `src/tests/installer-prune.test.mjs` (เจ้าของ: `tasks/prune/`) · `src/tests/installer-mutant.test.mjs` (เจ้าของ: `tasks/mutant-harness/`) · `src/tests/installer.test.mjs` (เจ้าของ: `tasks/release-hygiene/`)
- `src/scripts/**` (รวม `check-test-count.mjs` / `MIN_PASS`) · `docs/techstack/**` · `docs/rule.md` · `CHANGELOG.md` · `package.json` · `README.md`
- ไฟล์ใด ๆ ใน repo ระหว่างรันเทส — ทุก side-effect เกิดใน `os.tmpdir()` เท่านั้น

## 5. Acceptance criteria

- [x] ไฟล์ `src/tests/installer-upgrade.test.mjs` ถูก bare-discover โดย `node --test` และ **รันจบทุกเคส** (ไม่มี crash ระดับ module / ไม่มีเคสค้าง)
- [x] มีครบ **U1–U20 = 20 เคส** ตาม `spec.md §7.2` — ไม่มี `t.skip` แม้แต่ตัวเดียว (platform ที่ทำไม่ได้ใช้ `console.error(...) + return`)
- [x] **ไม่มีเคส `M*` / mutation / string-replace บน `cli.mjs` ในไฟล์นี้** — ย้ายไป `tasks/mutant-harness/` (wave 2) แล้ว
- [x] **fixture เป็นของจริง:** pkg เก่า = copy `src/` ทั้งก้อน + 2 ไฟล์ที่ถูกยุบกลับ · payload ใหม่ = `cliPath` ของ repo · **ไม่มีเคสไหนใช้ mini-payload ที่แต่งเอง**
- [x] **fixture B ไม่ degenerate:** ทุกเคสที่อ้างว่าเดินเส้น hash (C7) ต้อง assert ก่อนว่า `manifestPath(target)` มีอยู่จริงและไม่ว่าง — ถ้าไม่มี ต้องแดงพร้อมข้อความ `fixture B ไม่มี manifest` ไม่ใช่ผ่านเงียบผ่านเส้น known-stale
- [x] **cap boundary วัดถูกที่:** เคส 50/51 ต้อง `rmKnownStale(target)` ก่อนวางไฟล์ legacy เสมอ — stale set ที่วิ่งเข้า C9 ต้องเป็น **50 และ 51 พอดี** ไม่ใช่ 52/53 จาก stale พื้นฐาน 2 ตัว
- [x] เคส `--global` override **ทั้ง `HOME` และ `USERPROFILE`** และมี assertion **ต่างชั้น** อย่างน้อย 1 ตัว (`realHomeSnapshot()` ก่อน/หลังเท่ากันแบบ set) + assert C16 ว่า manifest global ไม่มี entry ใต้ `.claude/{agents,skills}`
- [x] assertion ทุกตัวอ้าง **contract C1–C16 ใน `design.md`** (คอมเมนต์ระบุหมายเลข C ที่เคสนั้นบังคับ) — ไม่ได้อ้างโค้ดของ slice `prune`
- [x] **★ acceptance ของ task นี้คือ "แดงด้วยเหตุผลที่ถูกต้อง" ไม่ใช่ "เขียว"** — ทุกเคสที่แดงต้องแดงตรงกับ expected-red list §7 (assert message ของ contract) ไม่ใช่แดงเพราะ harness/fixture ของตัวเองพัง
- [x] **★ output contract ตอนปิด task (บังคับตาม `design.md §7`):** รายงาน **`passed` พร้อม `expectedRed: [ชื่อเคส…]` + `redCount`** — **ห้ามรายงาน `failed`** สำหรับเคสที่แดงตามที่ประกาศไว้ · `failed` สงวนไว้ให้เคสที่แดงด้วย `TypeError` / `ENOENT` / spawn ล้มเท่านั้น
  **เหตุผล:** ถ้ารายงาน `failed` ตรง ๆ main loop จะเข้า fix loop แล้วมีโอกาสสูงที่จะไปแก้เทสหรือแก้ `cli.mjs` ให้เขียว ซึ่ง rule ห้ามไว้ (`design.md §7`)
- [x] รายงานปิด task ระบุ **จำนวนเคสจริง (N=20)** ที่วัดจาก output ของ `node --test` เพื่อส่งต่อให้ `tasks/release-hygiene/` bump `MIN_PASS`
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Contract canonical: `../../design.md §4 (C1–C16)` · flow `§5` · dependency/output contract `§7` · test strategy `§8` · Spec delta `§9`

## 7. ★ Expected-red (พฤติกรรมที่ต้องการ — RED ก่อน GREEN)

**ทำไมแดง:** `src/bin/cli.mjs` ณ wave 1 **ยังไม่มี prune และไม่มี manifest เลย** ⇒ เทสชุดนี้จะแดงตลอด wave 1 **โดยเจตนา**
**เจ้าของการทำให้เขียว = full-gate ของ BUILD (main loop, `build.md §4 step 6`)** — **ไม่ใช่** task นี้ และ **ไม่ใช่** `release-hygiene`
**ห้ามแก้ `cli.mjs` เพื่อให้เทสเขียว · ห้ามลด assertion ลงเพื่อให้เทสผ่าน**

| เคส | เหตุผลที่ต้องแดงใน wave 1 (ถ้าแดงด้วยเหตุอื่น = ผิด) |
|---|---|
| U1 | ไฟล์ known-stale ยังอยู่ · ไม่มีบรรทัด `−` · ไม่มี `ลบ 2` |
| U2 | `writeSyntheticManifest` เขียน manifest ได้ (ผ่าน) แต่ **ไฟล์ไม่ถูกลบ** · ไม่มี `ลบ 2` |
| U3 | ไฟล์ผู้ใช้รอด (ผ่าน) แต่ **stale ไม่ถูกลบ** ⇒ diff `listFiles` ไม่ตรง |
| U4 | ไม่มี `⚠ … [hash:mismatch]` · `verify.md` ไม่ถูกลบ · ไม่มี `ลบ 1` |
| U5 | ไฟล์เหยื่อรอดครบ (ผ่าน) แต่ **ไม่มี reason ใดถูกพิมพ์** ⇒ assert reason ขั้นต่ำแดง |
| U6, U7 | เหยื่อรอด (ผ่าน) แต่ **stale ปกติในรันเดียวกันไม่ถูกลบ** + ไม่มี reason `prune:not-contained` / `prune:symlink` |
| U8 | ไฟล์ผู้ใช้รอด + `realHomeSnapshot` ไม่เปลี่ยน (ผ่าน) แต่ **บรรทัดสรุป `ลบ N` และ manifest global ยังไม่มีในรุ่นปัจจุบัน** ⇒ assert C16 แดงเพราะ "ไม่มี manifest" |
| U9 | stale ใต้ `~/.warnyin/template` ไม่ถูกลบ |
| U10 | ไม่มีการลบ 50 ไฟล์ |
| U11 | ไม่มีไฟล์หาย (ผ่าน) แต่ **ไม่มี `[prune:blast-cap]`** |
| U12 | ไม่มีหัวข้อ `จะลบ:` และไม่มีบรรทัด `−` 51 บรรทัด |
| U13 | ไม่มี manifest ที่ **cli รุ่นปัจจุบันเขียน** ให้ตรวจ entry หลังรอบแรก (synthetic manifest ของ fixture ไม่ถูกอัปเดตตาม C13) · รอบสองไม่ลบ |
| U14 | manifest byte-equal (ผ่าน เพราะไม่มีใครเขียนทับ) แต่ต้องคู่กับ assert ว่ารุ่นที่ implement แล้ว **มีการเขียน manifest จริงในเคสอื่น** (U2/U13) — เคสนี้จึงแดงที่ assert `listFiles` เท่าเดิม **ก็ต่อเมื่อ** dry-run ลบผิด; ใน wave 1 คาดว่า **ผ่าน** |
| U15 | ไฟล์เท่าเดิม (ผ่าน) แต่ **ไม่มี `ลบ 0` ในบรรทัดสรุป** |
| U16 | ไม่มี manifest ให้เทียบ byte + ไม่มี `ลบ 0` |
| U17 | exit 0 + `verify.md` ยังอยู่ (ผ่าน) แต่ **manifest ไม่ถูกเขียนทับเป็นรูปแบบถูกต้อง** และไม่มี `⚠` |
| U18 | exit 0 (ผ่าน) แต่ **known-stale 2 ไฟล์ไม่ถูกลบ** (ไม่มี `ลบ 2`) · manifest ไม่ถูกเขียนทับ · ไม่มี `⚠` |
| U19 | ไม่มี `⚠ … [prune:io]` · stale ตัวที่ 3 ใน dir ปกติไม่ถูกลบ · ไม่มี `ลบ 1` |
| U20 | ไม่มี `.warnyin/.warnyin-manifest` ถูกสร้าง · ไม่มี `ลบ 0` |

**เกณฑ์ตัดสินว่า "แดงถูกเหตุผล":**
1. ข้อความ assert ที่แดงเป็นข้อความที่เขียนไว้เอง (อ้าง contract C ที่บังคับ) — **ไม่ใช่** `TypeError`, `ENOENT` ดิบ, หรือ `spawn` ล้ม
2. `exit code` ของ installer ในทุกเคสยังเป็น `0` (prune ไม่มีอยู่จริง จึงไม่มีทางล้ม) — ถ้าเจอ exit ≠ 0 แปลว่า fixture ของเราพัง ต้องแก้ที่ task นี้
3. เคสที่ **ผ่าน** ใน wave 1 เป็นเฉพาะครึ่ง negative ("ของผู้ใช้/เหยื่อยังอยู่") — **การพิสูจน์ว่า assertion เหล่านั้นไม่กำพร้าเป็นงานของ `tasks/mutant-harness/` (wave 2) + unit ของ `tasks/prune/`** ไม่ใช่ของ task นี้ (`design.md §7`)
