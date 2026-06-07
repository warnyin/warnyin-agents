# Standard — validator-script

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern โค้ด + harness ที่ task นี้ต้องยึด — **precedent = `lint-md.mjs` (script) + `lint-md.test.mjs` + `installer.test.mjs` (spawn harness)**

## 1. Standard กลางที่ยึด
- **zero-dep lint-gate convention (`docs/rule.md` §2)** — งาน lint/quality-gate ของ repo ทำเป็น `node:*` script เขียนเอง (pure fn + main-guard + CI job) **ไม่เพิ่ม devDeps**; gate ต้อง **testable** (pure fn รับ input + injectable IO → unit feed ปลอม) + **executable verify** (รันจริงจับ positive/negative ไม่ใช่แค่ unit)
- **ESM (`docs/rule.md` §2)** — repo `type: module`; `import`/`export`, `import.meta.url` ไม่ใช่ `__dirname`/`require`
- **ภาษา (`docs/rule.md` §2)** — คอมเมนต์/ข้อความผู้ใช้เป็นภาษาไทย ตามสไตล์ `cli.mjs`/`lint-md.mjs`
- **canonical contract = design §4 (`docs/rule.md` §1 canonical-copy)** — CLI contract + เช็ค C1–C5 + stage→artifact + security invariant copy จาก design ห้ามแต่งใหม่

## 2. Pattern โค้ดของ task นี้ (mirror `src/scripts/lint-md.mjs`)
- **pure function เป็น export หลัก** — `checkTopic(files)` รับ `Map<relPath,content>` (ไม่ใช่ fs handle) คืน `{issues:[{code,level,msg}], stage}`; `checkFeatureSpec(name, content)` คืน `issues[]` — เหมือน `checkLinks(docs, exists)` ที่ inject IO เข้ามา → unit ป้อน Map ปลอมได้โดยไม่แตะ fs
- **error object มี `code` field (SA-S1)** — `{code:'C2', level:'error'|'warn', msg:'...'}` — test assert structured (`issue.code === 'C2'`, `issue.level === 'error'`) ไม่ใช่ regex บน string output; level → render: `error`→`✖`, `warn`→`⚠`
- **`main()` แยกจาก pure fn** — `main()` ทำ walk fs (`readdirSync`/`readFileSync` ใต้ `node:fs`) สร้าง `Map` แล้วเรียก pure fn → print/exit; pure fn ไม่รู้จัก fs เลย
- **walk pattern (mirror `walkMd`)** — เดิน `docs/stages/` เก็บไฟล์ต่อ topic เป็น `Map`; **ข้าม `achieved/` + `context.md`**; เดิน `docs/features/*/spec.md` แยกสำหรับ C5
- **main-guard (`docs/rule.md` §2 / lint-md.mjs:99)** — `if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()` — **ห้าม** `import.meta.main` (undefined บน node 20); import จาก unit ต้องไม่ trigger walk/exit
- **filled heuristic เป็น helper เดียว** — `isFilled(content)` = H1 บรรทัดแรกไม่ match `/<[^>]+>/`; ใช้ซ้ำทุกที่ที่ต้องเดา "เริ่มเติม" (C1/C3-trigger/C4/stage inference) — **ไม่มี const list ของ marker** (B1)
- **slug whitelist (B7)** — โหมด validate: `readdirSync('docs/stages/')` filter เป็น dir (ข้าม `achieved`) → set ของ slug ที่ valid; arg ไม่อยู่ในเซต → exit 2; **ไม่เอา arg ไปต่อ `join('docs/stages', arg)` ก่อน validate** (กัน `../`)

## 3. Test harness ที่ต้องใช้ซ้ำ (อย่าเขียนใหม่)
- **unit (mirror `src/tests/lint-md.test.mjs`)** — `import { test } from 'node:test'` + `assert from 'node:assert/strict'`; `import { checkTopic, checkFeatureSpec } from '../.warnyin/workflow/scripts/validate-topic.mjs'` (relative จาก `src/tests/`); ป้อน `Map`/string ปลอม → assert `issues`/`stage` structured
- **executable (mirror `src/tests/installer.test.mjs`)** — copy harness กลาง `makeTempProject(t)` (`mkdtempSync(os.tmpdir(),'wy-...')` + `t.after(rmSync)`) + `runCli`-style spawn ของ **script** ด้วย `spawnSync(process.execPath, [scriptPath, ...args], {cwd, encoding:'utf8'})` (**array args ห้าม `shell:true`** — `docs/rule.md` §2/§5); scriptPath = `fileURLToPath(new URL('../.warnyin/workflow/scripts/validate-topic.mjs', import.meta.url))` (**ห้าม `.pathname`** — Windows คืน `/D:/...`)
- **assert `code` ก่อน + surface stderr** (`docs/rule.md` §5) — เคส exit 0 ต้อง surface stderr ใน message กัน false-positive; assert stream ให้ตรง
- **black-box สำหรับ executable** — สร้าง fixture topic ใน temp `docs/stages/<x>/` แล้ว spawn จริง assert side-effect (exit/stdout); **ห้ามรันที่ cwd=repo root** (dogfood leak — `docs/rule.md` §5/troubleshooting #6) — fixture อยู่ใน temp เท่านั้น

## 4. เพิ่มเติมเฉพาะ task
- **ไฟล์เดียว 2 โหมด** — แยก mode ที่ `main()` ด้วย argv.length (ไม่มี arg = status, 1 arg = validate, >1 = exit 2) — logic walk/pure fn ใช้ร่วมกัน (ไม่ duplicate ตาม proposal ทางเลือก B ที่ถูกปฏิเสธ)
- **acceptance = pass count (`docs/rule.md` §5)** — `npm test` ผ่านนับ pass count ที่โตขึ้นจริง (CI `check-test-count.mjs` เช็ค `pass==tests`) ไม่ใช่แค่ exit 0
- **C5 GIVEN/WHEN/THEN case-insensitive ไม่ enforce order (SA-S2/QA)** — match keyword แบบ case-insensitive, แค่ต้องครบทั้งสาม ไม่บังคับลำดับ
- ถ้าเจอ pattern ที่ควรเป็นมาตรฐานกลาง (เช่น nuance ของ structural-validator) → note ใน `rule.md` §2 (รอ SHIP) ไม่แก้ standard กลางตอนนี้
