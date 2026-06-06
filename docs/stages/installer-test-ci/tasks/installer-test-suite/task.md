# Task — installer-test-suite

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `installer-test-suite` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (`bin/cli.mjs`) + test harness |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
รัน `npm test` แล้วได้ความมั่นใจว่า installer (`bin/cli.mjs`) ถูกต้อง — black-box spawn CLI จริงในโฟลเดอร์ temp แล้ว assert จาก side-effect จริง ครอบพฤติกรรมหลักทั้ง 8 เคสใน `design.md` §4 · รันได้ทั้ง local (Windows) และ CI (Linux)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: — (ทำก่อน เป็น task แรก)
- ปลดล็อกให้: `tasks/ci-pipeline` (CI เรียก `npm test` ที่ task นี้สร้าง + ต้องมี `engines.node>=20` ตรง matrix)
- ส่ง output อะไรต่อให้ task ถัดไป: `package.json scripts.test` + `tests/installer.test.mjs`

## 3. Sub-tasks
- [ ] 1. สร้าง `tests/installer.test.mjs` + harness — `makeTempProject()` / `runCli(cwd,args)` / cleanup `t.after()` (contract `design.md` §3) — _ผลลัพธ์: harness ใช้ซ้ำได้ทุกเคส_
- [ ] 2. เขียน 8 เคสตาม `design.md` §4 (spec.md test-flow) — _ขึ้นกับ 1_
- [ ] 3. `package.json`: เพิ่ม `"scripts": { "test": "node --test tests/" }` + `engines.node` `>=18`→`>=20`
- [ ] 4. รัน `npm test` local ให้เขียวก่อน mark passed (ห้าม mark passed ถ้ายังแดง)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `tests/installer.test.mjs` (ใหม่)
- `package.json` (`scripts.test`, `engines.node`)
- **ห้ามแตะ** `bin/cli.mjs` (black-box — เป็น target ที่ทดสอบ)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] `npm test` เขียว local — ครอบครบ 8 เคส (`design.md` §4)
- [ ] zero-dependency (ใช้เฉพาะ `node:test`/`node:assert`/`node:child_process`/`node:fs`/`node:os`/`node:path`) — `devDependencies` ยังว่าง
- [ ] cross-platform: ใช้ `process.execPath` + `path.join` + `os.tmpdir()` ไม่ hardcode `node`/`/`
- [ ] cleanup temp dir ทุกเคสแม้ fail (`t.after()`)
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
