# Standard — move-source-to-src

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern โค้ดที่ task นี้ยึด · **อิงจาก** `docs/techstack/installer/standard.md`

## 1. Standard กลางที่ยึด (จาก techstack)
> `docs/techstack/installer/standard.md` — ข้อที่เกี่ยวกับ task นี้
- **helper เป็น function แยกหน้าที่** (`copyTree`/`ensureScaffold`/`seedDocs`/`installRootDoc`) — task นี้ **ไม่แตะโครง helper** แค่ยืนยัน pkgRoot resolve ถูก
- **path ทุกที่ใช้ `path.join`** (cross-platform); หา root ด้วย `fileURLToPath(import.meta.url)` — คงไว้ (mirror layout ทำให้ relative path เดิมใช้ได้)
- **test harness กลาง** (`makeTempProject`/`runCli`/`ok`) — `cliPath = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))` relative กับที่อยู่ test → ย้าย test เข้า `src/tests/` แล้ว path ยังถูกเอง **ห้ามแก้ harness**
- **black-box:** assert จาก side-effect จริง — ห้าม import logic จาก `cli.mjs`; ข้อความ log `+`/`↻`/`±` ภาษาไทย คงเดิม

## 2. Pattern การเขียนโค้ดของ task นี้
- **git mv ไม่ใช่ copy+delete** — ใช้ `git mv` เพื่อรักษา history + ให้ git track การย้าย (design §3); ย้ายทั้งโฟลเดอร์ ไม่ rename ไฟล์
- **edit `src/bin/cli.mjs` ขั้นต่ำ:** แตะแค่ **comment** ของ guard `pkgRoot===target` ให้ตรงพฤติกรรมใหม่ (no-op โดยตั้งใจ) — โครง `pkgRoot = resolve(dirname, '..')` + CORE constant + copy logic **คงเดิมทุกบรรทัด** (relative กับ pkgRoot)
- **edit `package.json` ขั้นต่ำ:** เปลี่ยนแค่ `bin.warnyin-agents` → `src/bin/cli.mjs`; `scripts.test` คง `node --test` (bare); **ห้ามแตะ** `files`/`scripts` อื่น (กัน collision กับ T2/T4)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- helper เดิมใน `src/bin/cli.mjs` (copyTree/ensureScaffold/seedDocs/installRootDoc) — reuse ทั้งหมด ไม่เขียนใหม่
- test harness กลางใน `src/tests/installer.test.mjs` — reuse, ไม่แก้

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- **mirror layout = installer ไม่มี mapping table** — โครงใน `src/` = โครงตอน install เป๊ะ → copy `src/<rel> → target/<rel>` ตรงไปตรงมา (design §1). ถ้าควรเป็นมาตรฐานกลาง → note ใน `rule.md` (รอ SHIP)
