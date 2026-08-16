# Rule — mutant-harness

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack + `docs/rule.md`)

### จาก `docs/rule.md §5 Testing rules`
- [ ] **test installer = black-box spawn** — spawn cli จริงใน temp แล้ว assert side-effect · **ห้าม import logic จาก `cli.mjs`** · **ห้าม refactor target เพื่อ testability** (ถ้า anchor หายากเพราะโค้ดเขียนแบบหนึ่ง → **รายงาน ไม่ใช่ไปแก้ `cli.mjs` ให้ mutate ง่าย**)
- [ ] **harness กลาง** — ใช้รูป `makeTempProject(t)` / `runCli(cwd, args, env)` / `listFiles(dir)` / `ok(r, msg)` ตาม `docs/techstack/installer/standard.md` (**copy รูป ไม่ import**)
- [ ] assert `code===0` ก่อนเสมอ + surface `stderr` · assert stream ให้ตรง (prune พิมพ์ที่ **stdout** ตาม C15) · spawn array args **ห้าม `shell:true`**
- [ ] **acceptance = pass count ไม่ใช่แค่ exit 0** — `check-test-count.mjs` fail เมื่อ `fail!==0` **หรือ** `pass<MIN_PASS` **หรือ** `pass!==tests` ⇒ **ห้าม `t.skip` เด็ดขาด** ใช้ `console.error(...) + return` แทน (`installer.test.mjs:596-607`)
- [ ] **acceptance gate ต้องรัน bare `npm test`** — ไฟล์ต้อง bare-discover เจอ · การรัน `node --test <file>` ทำได้เฉพาะตอน debug/นับเคส ห้ามใช้เป็นหลักฐานปิด gate
- [ ] **structural/falsifiable check ต้องเป็นเคสใน `node --test`** ไม่ใช่ shell `grep -rl`/`rg` — **M0 คือรูปแบบที่ rule นี้บังคับ** (อ่าน source ด้วย `node:fs` แล้ว assert เอง)
- [ ] **ทุกคำสั่ง/ตัวเลขที่เขียนลงเอกสารต้องรัน/วัดจริง** — จำนวนเคสที่รายงานต้องมาจาก output จริงของ `node --test`
- [ ] **negative fixture ต้องเลี่ยง trigger phrase** — เนื้อของไฟล์เหยื่อ/canary ต้องไม่บังเอิญมีสตริงที่เคสอื่น assert (เช่น `จะลบ:` · `[prune:` · `สรุป:`)

### จาก `docs/rule.md §1`
- [ ] **config-protection** — ห้ามแก้ config/threshold (`MIN_PASS`, lint config) หรือ **แก้ `cli.mjs`** "เพื่อให้เทสผ่าน" · ห้ามลด assertion ลงเพื่อให้เขียว · **mutation ห้ามแตะไฟล์จริงในรีโปแม้ชั่วคราว** — `cliPath` เป็น source อ่านอย่างเดียว, การเขียนเกิดเฉพาะใน `os.tmpdir()`
- [ ] **ห้ามเดา** — anchor ต้องมาจาก **การอ่าน `cli.mjs` ที่ integrate แล้วจริง** ไม่ใช่จากสมมติฐานของ `spec.md §5` (คอลัมน์ `find` ในตารางเป็น **ค่าคาดหมาย** ไม่ใช่คำสั่ง)

### จาก `docs/techstack/installer/test.md`
- [ ] cleanup `t.after()` ลงทะเบียนก่อน assert (ลบ temp แม้ fail) — ครอบ `<pkg>` · `<target>` · `<outsideDir>`
- [ ] cross-platform: `process.execPath` · `path.join` · `fileURLToPath(new URL(...))` **ห้าม `.pathname`**
- [ ] เคสที่ platform ทำไม่ได้ (symlink · ชื่อไฟล์มี `\` · ชื่อไฟล์มี control char) → `console.error(...) + return` **ห้าม conditional-skip ด้วย `t.skip`**

### จาก `docs/troubleshooting.md`
- [ ] **#33 (แกนของ task นี้):** mutation ต้อง **พิสูจน์ว่าติดจริงก่อนตีความผล** — `assert.notEqual(mutated, original, …)` เป็นบรรทัดแรกหลัง `replace`; anchor ไม่ match = **แดงทันทีพร้อมข้อความสั่งให้ sync** ห้ามเงียบ/ห้าม `return`/ห้าม `try-catch` · เพิ่มชั้น **M0** ที่จับ anchor กำกวม (พบ >1 ครั้ง) ซึ่ง `assert.notEqual` เพียงอย่างเดียวจับไม่ได้ (mutate ผิดจุดแต่เนื้อไฟล์ต่างจริง)
- [ ] **#32 (ยกระดับแล้ว):** payload ของทุกแถวต้องเป็น **copy `src/` ทั้งก้อน** — mini-payload 6 ไฟล์ของเคส `EOLI.` ยืมได้แค่ **layout ของ pkg ปลอม** (`standard.md §2.2`)
- [ ] **#31 assertion กำพร้า:** เหตุผลที่ task นี้มีอยู่ — ทุกแถวต้องระบุใน comment ว่า **คุ้ม assertion ตัวไหนของ `upgrade-path-test`**
- [ ] **#3 false-green:** ทุกแถวต้องมี **co-assertion** (`spec.md §6.2`) — `existsSync === true/false` เดี่ยว ๆ เป็นหลักฐานไม่ได้

### จาก `.warnyin/workflow/stages/build.md`
- [ ] **ห้ามแตะไฟล์นอกขอบเขต** — `src/bin/cli.mjs` (**ห้ามแก้ไม่ว่ากรณีใด**) · `src/tests/installer.test.mjs` · `src/tests/installer-prune.test.mjs` (เจ้าของ: `tasks/prune/`) · `src/tests/installer-upgrade.test.mjs` (เจ้าของ: `tasks/upgrade-path-test/`) · `src/scripts/**` (รวม `check-test-count.mjs` / `MIN_PASS`) · `docs/techstack/**` · `docs/rule.md` · `CHANGELOG.md` · `package.json` · `README.md`
- [ ] **ห้ามแก้ rule/standard กลาง** ระหว่าง BUILD — ข้อเสนอไปอยู่ §2 รอ SHIP
- [ ] **ห้าม commit** — ปิด task ด้วยการรายงาน ไม่ใช่ git operation

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` / `docs/techstack/installer/*` ตอนนี้ — note ไว้ก่อน

- [ ] **rule ที่เสนอ:** *mutation testing ต้องมี **structural self-check (M0)** — `assert(MUTATIONS.length === n)` + ทุกแถว `original.split(find).length - 1 === 1`* — **เหตุผล:** `assert.notEqual` จับได้แค่ "mutation ไม่ติด" แต่ไม่จับ **anchor กำกวม** (mutate ผิดจุดแล้วผลเปลี่ยนจริงแต่คนละ guard) และไม่จับ **การถอดแถวออกเพื่อให้ suite เขียว** ซึ่งเป็นทางลัดที่มองไม่เห็นในรายงาน
- [ ] **rule ที่เสนอ:** *mutation ระดับ fs ทำได้เฉพาะ guard ที่เป็น **ชั้นเดียวที่บล็อกเหยื่อ** — guard ที่ซ้อนกันหลายชั้นต้องพิสูจน์ที่ **unit ของ pure fn*** — **เหตุผล:** feature ที่ออกแบบแบบ defense-in-depth (guard อิสระ ≥2 ชั้น) จะมี matrix ที่ "แดงถาวรแม้ implement ถูก 100%" ถ้าไม่แยกสองระดับนี้ (dry-run ของ topic นี้พบ 6/12 แถว)
- [ ] **rule ที่เสนอ:** *ทุกแถวของ mutant harness ต้องมี **canary ในรันเดียวกันที่ถูกลบสำเร็จ*** — **เหตุผล:** ถ้าไม่มี canary แถวที่ assert `existsSync === false` จะเขียวได้จาก mutation ที่ทำให้ prune ลบมั่ว และแถวที่ assert `existsSync === true` (ขั้วกลับ) จะเขียวได้จาก spawn ที่ล้มทั้งรัน
- [ ] **rule ที่เสนอ:** *เทสที่ mutate โค้ดจริงต้องประกาศว่า **`cliPath` ปรากฏได้เฉพาะใน `readFileSync`*** และ acceptance ต้องมี `git status --porcelain src/bin/cli.mjs` ว่าง — **เหตุผล:** mutation ที่รั่วออกจาก temp = แก้ไฟล์ production ระหว่างเทส (คู่กับ config-protection)
- [ ] **note (ไม่ใช่ rule):** `docs/techstack/installer/test.md` ต้องเพิ่ม section ของ `installer-mutant.test.mjs` + จำนวนเคส และ `node:crypto` ต้องเข้ารายการ built-in ที่อนุญาต — **เจ้าของ: SHIP** (`design.md §2` note)
