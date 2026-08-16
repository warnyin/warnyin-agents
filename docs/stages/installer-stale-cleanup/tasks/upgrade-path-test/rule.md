# Rule — upgrade-path-test

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack + `docs/rule.md`)

### จาก `docs/rule.md §5 Testing rules`
- [ ] **test installer = black-box spawn** — spawn `src/bin/cli.mjs` จริงใน temp แล้ว assert side-effect; **ห้าม import logic จาก `cli.mjs`** และ **ห้าม refactor target เพื่อ testability**
- [ ] **harness กลาง** — ใช้รูป `makeTempProject(t)` / `runCli(cwd, args, env)` / `globalEnv(home)` / `listFiles(dir)` / `ok(r, msg)` ตาม `docs/techstack/installer/standard.md`
- [ ] assert `code===0` ก่อนเสมอ + surface `stderr` · assert stream ให้ตรง · spawn array args **ห้าม `shell:true`**
- [ ] **acceptance = pass count ไม่ใช่แค่ exit 0** — `check-test-count.mjs` fail เมื่อ `fail!==0` **หรือ** `pass<MIN_PASS` **หรือ** `pass!==tests` ⇒ **ห้าม `t.skip` เด็ดขาด** ใช้ `console.error(...) + return` แทน (`installer.test.mjs:596-607`)
- [ ] **ห้ามใส่ path/glob arg ให้ `node --test`** — ไฟล์ต้องถูก bare-discover เจอ (`src/tests/*.test.mjs`)
- [ ] **negative fixture ต้องเลี่ยง trigger phrase** — เนื้อ filler ในไฟล์เหยื่อ/ไฟล์ผู้ใช้ต้องไม่บังเอิญตรงกับสตริงที่เคสอื่น assert
- [ ] **structural/falsifiable check ต้องเป็นเคสใน `node --test`** ไม่ใช่ shell `grep -rl` (รัน Windows ไม่ได้ + ไม่อยู่ใน CI)
- [ ] **ทุกคำสั่ง/ตัวเลขที่เขียนลงเอกสารต้องรัน/วัดจริง** — ตัวเลขจำนวนเคสที่รายงานต้องมาจาก output ของ `node --test` จริง

### จาก `docs/techstack/installer/test.md`
- [ ] เคส `--global` ต้อง **override ทั้ง `HOME` และ `USERPROFILE`** และ **assert ว่า side-effect อยู่ใน temp** (path ขึ้นต้นด้วย temp HOME) — กัน false-pass เมื่อ override ไม่ติด · งานนี้เป็น **destructive เคสแรกของ global mode** จึงเข้มกว่าเดิม
- [ ] เคส global **ห้าม conditional-skip** — CI linux deterministic
- [ ] cleanup `t.after()` ลงทะเบียนก่อน assert · เคส `chmod` ต้อง restore permission ก่อน `rm`
- [ ] cross-platform: `process.execPath` · `path.join` · `fileURLToPath(new URL(...))` ห้าม `.pathname`

### จาก `docs/troubleshooting.md`
- [ ] **#32 (ยกระดับแล้ว):** **fixture ต้องเป็นของจริงอย่างน้อย 1 เคสหลัก** — pkg เก่า = **copy `src/` ทั้งก้อน**, payload ใหม่ = **cli จริงใน repo**; fixture ที่ผู้เขียนเทสแต่งขึ้นพิสูจน์ได้แค่ว่าโค้ดตรงกับจินตนาการของผู้เขียน ⇒ **ห้ามใช้ mini-payload เป็นเคสหลัก**
- [ ] **#33:** mutation ต้อง **พิสูจน์ว่าติดจริงก่อนตีความผล** — `assert.notEqual(mutated, original)` เป็นบรรทัดแรกหลัง replace; anchor ไม่ match = **`assert.fail` ทันที ห้ามเงียบ/ห้าม return**
- [ ] **#31 assertion กำพร้า:** เทสที่ไม่มี slice เดียวทำให้เขียวได้ ต้องประกาศ **expected-red + เจ้าของการทำให้เขียว** ในไฟล์ task (ทำแล้วใน `task.md §7`)
- [ ] **#3 false-green:** ทุกเคส negative ("ไม่มีอะไรถูกลบ") ต้องมีคู่ positive ในรันเดียวกันหรือมี mutant row พิสูจน์

### จาก `.warnyin/workflow/stages/build.md`
- [ ] **ห้ามแตะไฟล์นอกขอบเขต** — โดยเฉพาะ `src/bin/cli.mjs` (ถ้าเทสแดง **ห้ามแก้ cli.mjs เพื่อให้เขียว**) · `src/tests/installer-prune.test.mjs` · `src/tests/installer.test.mjs` · `src/scripts/**` · `docs/techstack/**` · `CHANGELOG.md` · `package.json`
- [ ] **ห้ามแก้ rule/standard กลาง** ระหว่าง BUILD — ข้อเสนอไปอยู่ §2 รอ SHIP

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` / `docs/techstack/installer/*` ตอนนี้ — note ไว้ก่อน

- [ ] **rule ที่เสนอ:** *ทุก change ที่แก้พฤติกรรมของ installer ต่อ **ปลายทางที่ติดตั้งไว้แล้ว** ต้องมีเทส upgrade path ที่ fixture คือ payload รุ่นก่อนของจริง* — **เหตุผล:** บั๊กนี้รอดมาได้เพราะ suite ครอบแค่ install สดลง temp เปล่า; `verify:pack` ตรวจ tarball ไม่ได้ตรวจปลายทาง
- [ ] **rule ที่เสนอ:** *feature ที่ assertion ส่วนใหญ่เป็น negative ("ต้องไม่เกิด X") ต้องมี **mutant harness เป็นเคสถาวรใน suite*** พร้อม **mutation matrix ครบทุก guard** — **เหตุผล:** negative assertion เขียวได้โดยไม่ทดสอบอะไรเลย และ RED-proof แบบ manual พิสูจน์ไม่ได้เมื่อโค้ดก่อนแก้ไม่มีพฤติกรรมนั้นอยู่เลย
- [ ] **rule ที่เสนอ:** *เทสที่พึ่ง string-replace บนโค้ดจริง ต้อง `assert.notEqual` ก่อนตีความผลเสมอ (fail-loud)* — **เหตุผล:** ยกระดับ KB #33 จาก "วิธีทำ manual proof" เป็น rule ของ suite
- [ ] **rule ที่เสนอ:** *เทส destructive operation ในโหมด `--global` ต้อง assert ว่า **ทุก path ที่แตะขึ้นต้นด้วย temp HOME*** ไม่ใช่แค่ override env — **เหตุผล:** ถ้า override ไม่ติด เทส destructive จะลบไฟล์ใน homedir จริงของ dev/CI
- [ ] **note (ไม่ใช่ rule):** `docs/techstack/installer/test.md` ต้องเพิ่ม section ของไฟล์เทสใหม่ + จำนวนเคส และ `node:crypto` ต้องเข้ารายการ built-in ที่อนุญาต — **เจ้าของ: SHIP** (`design.md §2` note)
