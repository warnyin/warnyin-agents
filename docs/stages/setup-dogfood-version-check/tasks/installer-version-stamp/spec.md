# Spec — installer-version-stamp

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`logic` + `infra` (installer helper) — ไม่ใช่ REST API → ข้าม API/UX spec

## 4. Data-flow
```
package.json (version) ──readPkgVersion()──▶ ver
ver ──writeVersionStamp()──▶ <target>/.warnyin/.warnyin-version  (ver + '\n', unconditional)
```
- `pkgRoot = resolve(dirname(cli.mjs), '..')` = `src/` → package.json = `path.join(pkgRoot, '..', 'package.json')` (ทั้ง dev layout + tarball layout)
- `target` = `cwd` (project) | `homedir` (global) — ตัวเดียวกับที่ `copyTree` ใช้ → stamp ลงที่เดียวกับ CORE

## 5. User-flow
- ผู้ใช้รัน `npx @warnyin/agents` / `--global` / `--update` / `--dry-run` → หลังติดตั้ง CORE เสร็จ เห็น log บรรทัด `+ .warnyin/.warnyin-version` (หรือ `↻` ถ้ามีอยู่แล้ว) ในสรุป stats

## 6. Persona
- **contributor/maintainer** (รัน `setup:dogfood` → ต้องการ verify version) + **end-user** (install/`--update` ทั่วไป — ได้ version identity ของ payload ที่ติดตั้งไว้ตรวจสอบเอง)

## 7. Test-flow (black-box, `src/tests/installer.test.mjs` — spawn จริง, reuse `runCli`/`makeTempProject`/`globalEnv`)
- [ ] **(a) project install → stamp ถูกต้อง:** `runCli(tmp, ['--project'])` → อ่าน `tmp/.warnyin/.warnyin-version`; assert (1) ไฟล์มี, (2) `.trim()` === version ที่อ่านสดจาก repo `package.json` (ไม่ hardcode), (3) match `/^\d+\.\d+\.\d+/` — ★ assert ข้อ 3 กัน false-green เคส version = `"undefined"` แล้วสองฝั่งบังเอิญเท่ากัน (panel QA-S3)
- [ ] **(b) `--dry-run` → ไม่เขียน stamp:** `runCli(tmp, ['--project','--dry-run'])` → assert ไฟล์ `tmp/.warnyin/.warnyin-version` **ไม่มี** (existsSync false)
- [ ] **(c) `--update` ซ้ำ → byte-equal:** รัน `['--project','--update']` 2 ครั้ง → อ่าน byte ทั้งสองรอบ → assert เท่ากัน (idempotent by overwrite). **ห้าม** assert stdout มีคำว่า "ข้าม" (stamp เขียน unconditional ไม่ผ่าน skip path → นับ updated เสมอ — panel QA-S4/TL-S4)
- [ ] **(d) global mode → stamp ลง home:** `runCli(cwd, ['--global'], globalEnv(home))` → assert `home/.warnyin/.warnyin-version` มี + ตรงเวอร์ชัน (panel TL-S4d — scenario `design.md §9` มี global)
- [ ] **regression:** `npm test` ทั้ง suite เขียว (pass-count ≥ 9) — เคสเดิม 9 ของ installer.test ไม่พัง

> **★ ไม่กระทบ verify-pack จากฝั่งนี้:** stamp เป็น install-time artifact ที่ target (cli สร้างตอนรัน) ไม่อยู่ใน `src/` → ไม่ขึ้น tarball; การพิสูจน์ gate (ป้อน `.warnyin/.warnyin-version` ลง `checkFiles`) อยู่ใน `tasks/setup-dogfood-verify` หรือทำที่ task นี้ก็ได้ (ดู `design.md §6/§8` — ตกลงให้ทำใน slice ใด slice หนึ่ง ไม่ซ้ำ; default: ใส่ใน task นี้เพราะเป็นเจ้าของ packaging-impact)
