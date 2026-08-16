# Task — upgrade-path-test

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `upgrade-path-test` |
| **Slice อ้างอิง** | `design.md` slice #2 — "upgrade path ถูกพิสูจน์" |
| **Component** | `installer` |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
พิสูจน์ **upgrade path** ของ installer แบบ end-to-end: ผู้ใช้ที่ติดตั้งจากรุ่นก่อน `0.30.1` แล้วรัน `--update` ต้องได้ **payload สะอาด** (ไฟล์ตกรุ่นหาย) โดย **งานผู้ใช้ไม่หายแม้แต่ไฟล์เดียว** และ **guard ทุกชั้นตัดสิน "ไม่ลบ" ได้จริง** — พิสูจน์ชั้นสุดท้ายด้วย **mutant harness** ที่ปิด guard ทีละตัวแล้วยืนยันว่าเคส negative พลิกเป็นแดง (ไม่ใช่ assertion กำพร้า)

**ทำไมต้องมี:** บั๊กนี้รอดมาได้เพราะ **ไม่เคยมีเทส upgrade path เลย** (suite เดิมครอบแค่ install สดลง temp เปล่า) และ `verify:pack` ตรวจ tarball ไม่ได้ตรวจ **ปลายทางหลังติดตั้ง**

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** _ไม่มี_ — **wave 1 ขนานกับ `tasks/prune/`**
- **แหล่งความจริงเดียวที่อ่าน:** `design.md §4` contract **C1–C15** (+ §5 flow, §8, §9) — **ห้ามอ่าน/รอโค้ดของ slice `prune`**
- **ปลดล็อกให้:** `tasks/release-hygiene/` (wave 2) — ส่งต่อ **จำนวนเคสจริง** เพื่อ bump `MIN_PASS` ใน `check-test-count.mjs` (task นี้ **ห้ามแก้ไฟล์นั้นเอง**)
- **ส่ง output ต่อ:** ไฟล์เทส + รายงาน "เคสไหนแดงด้วยเหตุผลอะไร" ให้ full-gate ของ BUILD ใช้ปิดงาน

## 3. Sub-tasks

- [ ] 1. **harness ในไฟล์** — `makeTempProject` / `runCli` / `globalEnv` / `listFiles` / `ok` / `copyDir` / `sha256OfFile` / `manifestPath` / `writeManifestLines` — _ผลลัพธ์:_ ไฟล์รันผ่าน `node --test` ได้โดยไม่ crash ระดับ module
- [ ] 2. **fixture pipeline** (`makeOldPkg` → `installOldInto` → `fixtureA` / `fixtureB`) ตาม `spec.md §4` — _ขึ้นกับ 1:_ ใช้ `copyDir` · **pkg เก่า = copy `src/` ทั้งก้อน + เติม 2 ไฟล์ที่ถูกยุบกลับ + `version: '0.29.9'`**
- [ ] 3. **เคสเส้นหลัก** U1–U4 (known-stale · hash · ของผู้ใช้รอดครบ · hash mismatch) — _ขึ้นกับ 2_
- [ ] 4. **เคส guard/adversarial** U5–U7 (manifest ปลอม 7 รูป · symlink ancestor · symlink leaf) พร้อม `REASONS` เซตปิดจาก C15
- [ ] 5. **เคส mode/boundary** U8–U14 (`--global` สองครึ่ง · cap 50/51 · `--dry-run` ยกเว้น cap · `--no-prune` + C13 · `--dry-run` ไม่แตะ manifest)
- [ ] 6. **เคส semantics/robustness** U15–U20 (T1 payloadNew · idempotent · manifest เสีย · manifest เกินเพดาน · EACCES · install สด)
- [ ] 7. **mutant harness** `mutantRun()` + **mutation matrix M1–M12** ครบทุก guard (C4×5 · C5 · C7 · C8 ancestor+leaf · C9 · C10 · C13) — _ขึ้นกับ 3-6:_ reuse state helper ของเคส negative ที่คู่กัน · **`assert.notEqual(mutated, original)` ก่อนเสมอ**
- [ ] 8. **ตรวจ self-consistency** — รัน `node --test` แล้วบันทึก **ชื่อเคส + เหตุผลที่แดง** เทียบกับ expected-red list ใน §7; ไม่มีเคสไหนแดงด้วย `TypeError`/`ENOENT` ของ harness เอง; ไม่มี `t.skip` ในไฟล์

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

**เป็นเจ้าของแต่ผู้เดียว (สร้างใหม่):**
- `src/tests/installer-upgrade.test.mjs`

**ห้ามแตะเด็ดขาด:**
- `src/bin/cli.mjs` — **ห้ามแก้เพื่อให้เทสเขียว** ไม่ว่ากรณีใด
- `src/tests/installer-prune.test.mjs` (เจ้าของ: `tasks/prune/`) · `src/tests/installer.test.mjs` (เจ้าของ: `tasks/release-hygiene/`)
- `src/scripts/**` (รวม `check-test-count.mjs` / `MIN_PASS`) · `docs/techstack/**` · `docs/rule.md` · `CHANGELOG.md` · `package.json` · `README.md`
- ไฟล์ใด ๆ ใน repo ระหว่างรัน mutant — mutation เกิดใน **temp เท่านั้น**

## 5. Acceptance criteria

- [ ] ไฟล์ `src/tests/installer-upgrade.test.mjs` ถูก bare-discover โดย `node --test` และ **รันจบทุกเคส** (ไม่มี crash ระดับ module / ไม่มีเคสค้าง)
- [ ] มีครบ **U1–U20 + M1–M12 = 32 เคส** ตาม `spec.md §7` — ไม่มี `t.skip` แม้แต่ตัวเดียว (platform ที่ทำไม่ได้ใช้ `console.error(...) + return`)
- [ ] **fixture เป็นของจริง:** pkg เก่า = copy `src/` ทั้งก้อน + 2 ไฟล์ที่ถูกยุบกลับ · payload ใหม่ = `cliPath` ของ repo · **ไม่มีเคสหลักไหนใช้ mini-payload ที่แต่งเอง**
- [ ] **mutation matrix ครบทุก guard** (C4×5 · C5 · C7 · C8×2 · C9 · C10 · C13) และทุกแถวมี `assert.notEqual(mutated, original, …)` เป็นด่านแรก (fail-loud KB #33)
- [ ] เคส `--global` override **ทั้ง `HOME` และ `USERPROFILE`** และ assert ว่า path ที่ตรวจทุกตัวขึ้นต้นด้วย temp HOME
- [ ] assertion ทุกตัวอ้าง **contract C1–C15 ใน `design.md`** (คอมเมนต์ระบุหมายเลข C ที่เคสนั้นบังคับ) — ไม่ได้อ้างโค้ดของ slice `prune`
- [ ] **★ acceptance ของ task นี้คือ "แดงด้วยเหตุผลที่ถูกต้อง" ไม่ใช่ "เขียว"** — ทุกเคสที่แดงต้องแดงตรงกับ expected-red list §7 (assert message ของ contract) ไม่ใช่แดงเพราะ harness/fixture ของตัวเองพัง
- [ ] รายงานปิด task ระบุ **จำนวนเคสจริง (N)** ที่วัดจาก output ของ `node --test` เพื่อส่งต่อให้ `tasks/release-hygiene/` bump `MIN_PASS`
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Contract canonical: `../../design.md §4 (C1–C15)` · flow `§5` · test strategy `§8` · Spec delta `§9`

## 7. ★ Expected-red (พฤติกรรมที่ต้องการ — RED ก่อน GREEN)

**ทำไมแดง:** `src/bin/cli.mjs` ณ wave 1 **ยังไม่มี prune และไม่มี manifest เลย** ⇒ เทสชุดนี้จะแดงตลอด wave 1 **โดยเจตนา**
**เจ้าของการทำให้เขียว = full-gate ของ BUILD (main loop, `build.md §4 step 6`)** — **ไม่ใช่** task นี้ และ **ไม่ใช่** `release-hygiene`
**ห้ามแก้ `cli.mjs` เพื่อให้เทสเขียว · ห้ามลด assertion ลงเพื่อให้เทสผ่าน**

| เคส | เหตุผลที่ต้องแดงใน wave 1 (ถ้าแดงด้วยเหตุอื่น = ผิด) |
|---|---|
| U1, U2 | ไฟล์ known-stale/hash ยังอยู่ · ไม่มีบรรทัด `−` · ไม่มี `ลบ 2` |
| U3 | ไฟล์ผู้ใช้รอด (ผ่าน) แต่ **stale ไม่ถูกลบ** ⇒ diff `listFiles` ไม่ตรง |
| U4 | ไม่มี `⚠ … [hash:mismatch]` · `verify.md` ไม่ถูกลบ · ไม่มี `ลบ 1` |
| U5 | ไฟล์เหยื่อรอดครบ (ผ่าน) แต่ **ไม่มี reason ใดถูกพิมพ์** ⇒ assert reason ขั้นต่ำแดง |
| U6, U7 | เหยื่อรอด (ผ่าน) แต่ **stale ปกติในรันเดียวกันไม่ถูกลบ** + ไม่มี reason `prune:not-contained` / `prune:symlink` |
| U8 | ไฟล์ผู้ใช้รอด (ผ่าน) แต่ **บรรทัดสรุป `ลบ N` ยังไม่มีในรุ่นปัจจุบัน** |
| U9 | stale ใต้ `~/.warnyin/template` ไม่ถูกลบ |
| U10 | ไม่มีการลบ 50 ไฟล์ |
| U11 | ไม่มีไฟล์หาย (ผ่าน) แต่ **ไม่มี `[prune:blast-cap]`** |
| U12 | ไม่มีหัวข้อ `จะลบ:` และไม่มีบรรทัด `−` 51 บรรทัด |
| U13 | ไม่มี manifest ให้ตรวจ entry หลังรอบแรก · รอบสองไม่ลบ |
| U14 | `.warnyin/.warnyin-manifest` ไม่มีอยู่ ⇒ อ่านเทียบ byte ไม่ได้ (ต้องเขียน assert ให้ข้อความชี้ว่า "ยังไม่มี manifest" ไม่ใช่ปล่อย `ENOENT` ดิบ) |
| U15 | ไฟล์เท่าเดิม (ผ่าน) แต่ **ไม่มี `ลบ 0` ในบรรทัดสรุป** |
| U16 | ไม่มี manifest ให้เทียบ byte + ไม่มี `ลบ 0` |
| U17, U18 | exit 0 (ผ่าน) แต่ **manifest ไม่ถูกเขียนทับเป็นรูปแบบถูกต้อง** และไม่มี `⚠` |
| U19 | ไม่มี `⚠ … [prune:io]` · ไฟล์ dir ปกติไม่ถูกลบ |
| U20 | ไม่มี `.warnyin/.warnyin-manifest` ถูกสร้าง · ไม่มี `ลบ 0` |
| **M1–M12** | **`assert.notEqual(mutated, original)` แดงทันที** เพราะ anchor ของ guard ยังไม่มีใน `cli.mjs` — นี่คือ **fail-loud ที่ถูกต้องตาม KB #33** (ไม่ใช่ข้อบกพร่องของเทส) · เมื่อ slice `prune` merge แล้ว ผู้ปิด full-gate ต้อง **sync `find`/`replace` ให้ตรงโค้ดจริง** แล้วเคสเหล่านี้ต้องเขียว |

**เกณฑ์ตัดสินว่า "แดงถูกเหตุผล":**
1. ข้อความ assert ที่แดงเป็นข้อความที่เขียนไว้เอง (อ้าง contract C ที่บังคับ) — **ไม่ใช่** `TypeError`, `ENOENT` ดิบ, หรือ `spawn` ล้ม
2. `exit code` ของ installer ในทุกเคยังเป็น `0` (prune ไม่มีอยู่จริง จึงไม่มีทางล้ม) — ถ้าเจอ exit ≠ 0 แปลว่า fixture ของเราพัง ต้องแก้ที่ task นี้
3. เคสที่ **ผ่าน** ใน wave 1 ต้องเป็นเฉพาะครึ่ง negative ("ของผู้ใช้/เหยื่อยังอยู่") เท่านั้น และต้องมี M-row คู่กันที่พิสูจน์ว่ามันจะพลิกเป็นแดงเมื่อ guard ตาย
