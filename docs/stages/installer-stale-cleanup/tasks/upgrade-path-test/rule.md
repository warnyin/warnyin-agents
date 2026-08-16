# Rule — upgrade-path-test

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack + `docs/rule.md`)

### จาก `docs/rule.md §5 Testing rules`
- [ ] **test installer = black-box spawn** — spawn `src/bin/cli.mjs` จริงใน temp แล้ว assert side-effect; **ห้าม import logic จาก `cli.mjs`** และ **ห้าม refactor target เพื่อ testability**
- [ ] **harness กลาง** — ใช้รูป `makeTempProject(t)` / `runCli(cwd, args, env)` / `globalEnv(home)` / `listFiles(dir)` / `ok(r, msg)` ตาม `docs/techstack/installer/standard.md`
- [ ] assert `code===0` ก่อนเสมอ + surface `stderr` · assert stream ให้ตรง · spawn array args **ห้าม `shell:true`**
- [ ] **acceptance = pass count ไม่ใช่แค่ exit 0** — `check-test-count.mjs` fail เมื่อ `fail!==0` **หรือ** `pass<MIN_PASS` **หรือ** `pass!==tests` ⇒ **ห้าม `t.skip` เด็ดขาด** ใช้ `console.error(...) + return` แทน (`installer.test.mjs:596-607`)
- [ ] **acceptance gate ต้องรัน bare `npm test`** — ไฟล์ต้องถูก bare-discover เจอ (`src/tests/*.test.mjs`) และตัวเลขที่รายงานต้องมาจากรัน bare · _การรัน `node --test <file>` เพื่อ **debug/นับเคสระหว่างพัฒนา** ทำได้_ แต่ห้ามใช้ผลจากรันแบบระบุ path เป็นหลักฐานปิด gate (จะไม่เห็น regression ของไฟล์อื่นและได้ pass-count ไม่ตรงกับ `check-test-count.mjs`)
- [ ] **negative fixture ต้องเลี่ยง trigger phrase** — เนื้อ filler ในไฟล์เหยื่อ/ไฟล์ผู้ใช้ต้องไม่บังเอิญตรงกับสตริงที่เคสอื่น assert
- [ ] **structural/falsifiable check ต้องเป็นเคสใน `node --test`** ไม่ใช่ shell `grep -rl` (รัน Windows ไม่ได้ + ไม่อยู่ใน CI)
- [ ] **ทุกคำสั่ง/ตัวเลขที่เขียนลงเอกสารต้องรัน/วัดจริง** — ตัวเลขจำนวนเคสที่รายงานต้องมาจาก output ของ `node --test` จริง

### จาก `docs/techstack/installer/test.md`
- [ ] เคส `--global` ต้อง **override ทั้ง `HOME` และ `USERPROFILE`** และ **assert ว่า side-effect อยู่ใน temp** — กัน false-pass เมื่อ override ไม่ติด · งานนี้เป็น **destructive เคสแรกของ global mode** จึงเข้มกว่าเดิม
- [ ] **★ `assert(p.startsWith(home))` ไม่นับเป็นหลักฐาน** — `p` มาจาก `path.join(home, …)` ของเราเอง จึงเป็น tautology · ต้องมี assertion **ต่างชั้น** อย่างน้อย 1 ตัว: snapshot `.warnyin/` + `.claude/` ใต้ `os.homedir()` **จริง** ก่อน/หลังแล้วเทียบเป็น **set** (ถ้า dev มี global install อยู่แล้ว set จะไม่ว่างแต่ต้องไม่เปลี่ยน; ถ้าไม่มีต้องเป็น `null` ทั้งก่อนและหลัง) — **ห้ามใช้ `existsSync` เดี่ยว ๆ ตัดสิน**
- [ ] เคส global **ห้าม conditional-skip** — CI linux deterministic
- [ ] cleanup `t.after()` ลงทะเบียนก่อน assert · เคส `chmod` ต้อง restore permission ก่อน `rm`
- [ ] cross-platform: `process.execPath` · `path.join` · `fileURLToPath(new URL(...))` ห้าม `.pathname`

### จาก `docs/troubleshooting.md`
- [ ] **#32 (ยกระดับแล้ว):** **fixture ต้องเป็นของจริงอย่างน้อย 1 เคสหลัก** — pkg เก่า = **copy `src/` ทั้งก้อน**, payload ใหม่ = **cli จริงใน repo**; fixture ที่ผู้เขียนเทสแต่งขึ้นพิสูจน์ได้แค่ว่าโค้ดตรงกับจินตนาการของผู้เขียน ⇒ **ห้ามใช้ mini-payload เป็นเคสหลัก** (mini-payload 6 ไฟล์ของเคส `EOLI.` ยืมได้แค่ **layout ของ pkg ปลอม** — ดู `standard.md §2.2`)
- [ ] **#33 (อยู่นอกขอบเขต task นี้):** กฎ "mutation ต้อง `assert.notEqual` ก่อนตีความผล" ใช้กับ `tasks/mutant-harness/` (wave 2) — **ไฟล์เทสของ task นี้ต้องไม่มี mutation เลย**
- [ ] **#31 assertion กำพร้า:** เทสที่ไม่มี slice เดียวทำให้เขียวได้ ต้องประกาศ **expected-red + เจ้าของการทำให้เขียว** ในไฟล์ task (ทำแล้วใน `task.md §7`)
- [ ] **#3 false-green:** ทุกเคส negative ("ไม่มีอะไรถูกลบ") ต้องมีคู่ positive ในรันเดียวกัน **เท่าที่ทำได้ในไฟล์นี้** (เช่น U4/U6/U19 ที่ลบตัวอื่นสำเร็จในรันเดียวกัน) · ส่วนที่ทำคู่ positive ในรันเดียวกันไม่ได้ (U3/U5/U7/U8/U11) **ผลักไปให้ `tasks/mutant-harness/` + unit ของ `tasks/prune/` เป็นผู้พิสูจน์** ตาม `design.md §7` — ไม่ใช่หน้าที่ของ task นี้

### จาก `.warnyin/workflow/stages/build.md`
- [ ] **ห้ามแตะไฟล์นอกขอบเขต** — โดยเฉพาะ `src/bin/cli.mjs` (ถ้าเทสแดง **ห้ามแก้ cli.mjs เพื่อให้เขียว**) · `src/tests/installer-prune.test.mjs` · `src/tests/installer-mutant.test.mjs` · `src/tests/installer.test.mjs` · `src/scripts/**` · `docs/techstack/**` · `CHANGELOG.md` · `package.json`
- [ ] **ห้ามแก้ rule/standard กลาง** ระหว่าง BUILD — ข้อเสนอไปอยู่ §2 รอ SHIP
- [ ] **★ output contract ตอนปิด task (`design.md §7`):** รายงาน **`passed` พร้อม `expectedRed: [ชื่อเคส…]` + `redCount`** · **ห้ามรายงาน `failed`** สำหรับเคสที่แดงตาม expected-red — `failed` สงวนไว้ให้แดงด้วย `TypeError`/`ENOENT`/spawn ล้มเท่านั้น (ถ้ารายงาน `failed` main loop จะเข้า fix loop แล้วเสี่ยงไปแก้เทส/แก้ `cli.mjs`)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` / `docs/techstack/installer/*` ตอนนี้ — note ไว้ก่อน

- [ ] **rule ที่เสนอ:** *ทุก change ที่แก้พฤติกรรมของ installer ต่อ **ปลายทางที่ติดตั้งไว้แล้ว** ต้องมีเทส upgrade path ที่ fixture คือ payload รุ่นก่อนของจริง* — **เหตุผล:** บั๊กนี้รอดมาได้เพราะ suite ครอบแค่ install สดลง temp เปล่า; `verify:pack` ตรวจ tarball ไม่ได้ตรวจปลายทาง
- [ ] **rule ที่เสนอ (เจ้าของ: `tasks/mutant-harness/`):** *feature ที่ assertion ส่วนใหญ่เป็น negative ("ต้องไม่เกิด X") ต้องมี **mutant harness เป็นเคสถาวรใน suite*** พร้อม **mutation matrix ครบทุก guard** — **เหตุผล:** negative assertion เขียวได้โดยไม่ทดสอบอะไรเลย และ RED-proof แบบ manual พิสูจน์ไม่ได้เมื่อโค้ดก่อนแก้ไม่มีพฤติกรรมนั้นอยู่เลย _(note ไว้ที่นี่เพื่อความต่อเนื่อง — task นี้ไม่ได้ implement)_
- [ ] **rule ที่เสนอ:** *เทส destructive operation ในโหมด `--global` ต้องมี **assertion ต่างชั้น** — snapshot ของ `os.homedir()` จริงก่อน/หลังแล้วเทียบเป็น set* ไม่ใช่แค่ override env และไม่ใช่ `assert(p.startsWith(home))` บน path ที่เรา `path.join` เอง (tautology) — **เหตุผล:** ถ้า override ไม่ติด เทส destructive จะลบไฟล์ใน homedir จริงของ dev/CI และ assertion แบบ startsWith จะยังเขียว
- [ ] **rule ที่เสนอ:** *fixture ที่ต้องมี artifact ซึ่งรุ่นเก่ายังไม่มีโค้ดผลิต (เช่น manifest) ต้อง **สังเคราะห์ artifact นั้นเองจากไฟล์จริง*** ไม่ใช่พึ่งให้ pkg เก่าเขียนให้ — **เหตุผล:** fixture จะ degenerate ไปเส้นทางอื่นเงียบ ๆ แล้วเคสที่ตั้งใจพิสูจน์เส้น A จะพิสูจน์เส้น B แทน (เจอจริงกับ fixture B ของ topic นี้)
- [ ] **note (ไม่ใช่ rule):** `docs/techstack/installer/test.md` ต้องเพิ่ม section ของไฟล์เทสใหม่ + จำนวนเคส และ `node:crypto` ต้องเข้ารายการ built-in ที่อนุญาต — **เจ้าของ: SHIP** (`design.md §2` note)
