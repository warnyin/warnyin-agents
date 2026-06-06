# Standard — installer-test-suite

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด

## 1. Standard กลางที่ยึด
> repo ยังไม่มี `docs/techstack/` (เป็น tool เอง) — ยึดปรัชญาจาก `CLAUDE.md` + พฤติกรรมจริงของ `bin/cli.mjs`
- **zero-dependency** — `devDependencies` ต้องว่าง ใช้เฉพาะ built-in `node:*`
- **ESM** — repo `type: module`; ใช้ `import`/`export`, `import.meta.url` ไม่ใช่ `__dirname`
- ภาษาคอมเมนต์/ข้อความ: ไทย ตามสไตล์ `cli.mjs`

## 2. Pattern การเขียนโค้ดของ task นี้
- **โครง:** ไฟล์เดียว `tests/installer.test.mjs`; แต่ละเคส = 1 `test('...', (t) => {...})`; harness (`makeTempProject`/`runCli`) เป็น helper บนสุดของไฟล์
- **black-box:** assert จาก side-effect จริง (ไฟล์/exit code/stdout/stderr) — **ห้าม import logic จาก `cli.mjs`** (มันรัน side-effect ตอน import + เป็น target ที่ทดสอบ)
- **cross-platform:** `process.execPath` (ไม่ใช่ `'node'`), `path.join`, `os.tmpdir()`, `fileURLToPath` แปลง URL→path บน Windows
- **cleanup:** `t.after(() => rmSync(dir,{recursive:true,force:true}))` ลงทะเบียน **ก่อน** assert
- **security:** spawn แบบ array args เสมอ — **ห้าม `shell: true`**
- **assert stream ให้ถูก:** `console.log`→`stdout`, `console.warn` (legacy warning)→`stderr`

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `makeTempProject` + `runCli` — เขียนครั้งเดียว ใช้ทุกเคส
- pattern parse `npm pack --dry-run --json` → ดูตัวอย่างใน `design.md` §5 (จะใช้จริงใน task `ci-pipeline`)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- ใช้ `spawnSync` (sync) ได้ — เคสไม่เยอะ ทำให้ test อ่านง่ายกว่า async; ถ้าเคสไหนต้องช้ามาก/parallel ค่อยพิจารณา `spawn`
- pattern ใหม่ที่ควรเป็นมาตรฐานกลาง → note ใน `rule.md` (รอ SHIP)
