# Standard — context-skeleton-seed

> อิงจาก `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task

## 1. Standard กลางที่ยึด (จาก techstack installer)
- helper เป็น function แยกหน้าที่ (`ensureScaffold`, `copyTree`, `seedDocs`) — task นี้ขยาย `ensureScaffold`
- ทุก helper เคารพ flag `DRY` (ไม่เขียนจริง แต่ log + นับ stats) และ `stats.{created,updated,skipped}`
- path ใช้ `path.join` (cross-platform); root จาก `fileURLToPath(import.meta.url)` → `pkgRoot`
- log: `+` สร้างใหม่ · `↻` อัปเดต · ภาษาไทย
- **test harness กลาง** `src/tests/installer.test.mjs`: `makeTempProject(t)` (temp+cleanup), `runCli(cwd,args)` (spawn จริง, array args **ห้าม `shell:true`**), `ok(r)` (assert `code===0` + surface stderr); **black-box** — assert จาก side-effect จริง ห้าม import logic จาก `cli.mjs`; เทียบไฟล์ด้วย byte-content
- `cliPath = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))` — ห้าม `.pathname` (Windows คืน `/D:/...`)

## 2. Pattern การเขียนโค้ดของ task นี้
- **seed-from-template:** ใน `ensureScaffold` แยกเคส context.md ออกจาก `.gitkeep`: context.md อ่านเนื้อหาจาก `path.join(pkgRoot, '.warnyin','template','stages','context.md')` แล้ว `writeFileSync(dest, tpl)`; `.gitkeep` คงเป็น `''` — รักษา logic skip-if-exists เดิม (มีไฟล์ = `stats.skipped++`)
- โครงที่แนะนำ: เปลี่ยน `SCAFFOLD_FILES` เป็น entry ที่บอก source (เช่น `{ dest, tplRel }` โดย `tplRel=null` = เขียน `''`) เพื่อไม่ hardcode เงื่อนไขชื่อไฟล์ — หรือคง array เดิม + map ชื่อ→template ใน `ensureScaffold` (เลือกแบบที่ diff เล็กสุด ตาม investigate-before-edit)
- error handling: ถ้า template หาย (`!existsSync`) → behavior ปลอดภัย (เขียน `''` หรือ skip + ไม่ throw) — แต่ template ต้องมีจริง (sub-task 1)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- ใช้ `pkgRoot`, `target`, `DRY`, `stats` ที่มีอยู่แล้วใน `cli.mjs`
- ใช้ test harness ใน `installer.test.mjs` (อย่าสร้าง runner ใหม่)

## 4. เพิ่มเติมเฉพาะ task
- ถ้าปรับโครง `SCAFFOLD_FILES` เป็น object form → เป็น pattern ที่อาจ reuse กับ scaffold file อื่นในอนาคต — note ใน `rule.md` เผื่อ SHIP ยกเป็น standard
