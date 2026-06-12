# Standard — installer-version-stamp

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md`

## 1. Standard กลางที่ยึด (จาก techstack)
- **helper เป็น function แยกหน้าที่** (เหมือน `copyTree`/`ensureScaffold`/`seedDocs`/`installRootDoc`) — `readPkgVersion()`, `writeVersionStamp()`
- **ทุก helper เคารพ `DRY`** (ไม่เขียนจริง แต่ log + นับ `stats.{created,updated,skipped}`)
- **path ใช้ `path.join`** (cross-platform); หา pkgRoot ด้วย `fileURLToPath(import.meta.url)` → `resolve(dirname,'..')` = `src/`
- **ข้อความ log:** `+` สร้างใหม่ · `↻` อัปเดต · ภาษาไทย
- **black-box test:** spawn `cli.mjs` จริง — **ห้าม import logic จาก `cli.mjs`** (มันรัน side-effect ตอน import); assert `code===0` ก่อน + surface `stderr`; เทียบไฟล์ด้วย byte-content ไม่ใช่ mtime; cleanup `t.after()` ก่อน assert
- **assertion เป็น target-side path** (`.warnyin/.warnyin-version`) ไม่ใช่ `src/.warnyin`

## 2. Pattern การเขียนโค้ดของ task นี้
- **`readPkgVersion()`:**
  ```js
  function readPkgVersion() {
    return JSON.parse(fs.readFileSync(path.join(pkgRoot, '..', 'package.json'), 'utf8')).version
  }
  ```
- **`writeVersionStamp()`** (mirror โครง `ensureScaffold`/`installRootDoc` — log + stats + DRY):
  ```js
  function writeVersionStamp() {
    const ver = readPkgVersion()
    const rel = path.join('.warnyin', '.warnyin-version')
    const dest = path.join(target, rel)
    const exists = fs.existsSync(dest)
    if (!DRY) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, ver + '\n')          // ★ unconditional — ไม่ byte-equal skip แบบ copyTree
    }
    stats[exists ? 'updated' : 'created']++
    console.log(`  ${exists ? '↻' : '+'} ${rel}`)
  }
  ```
- **wire ใน `main()`:** เรียก `writeVersionStamp()` **หลัง** `for (const dir of CORE) copyTree(...)` ทั้ง 2 branch (global ~L274, project ~L280) — ก่อน `installGlobalNote()` / `ensureScaffold()`
- **error handling:** `readPkgVersion` ไม่ try/catch (package.json ต้องมีเสมอใน install context — ถ้าพังคือ environment เสีย ควรโผล่ error ดิบ); ไม่กลืน error เงียบ

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `pkgRoot`, `target`, `DRY`, `stats` — module-level ที่มีอยู่แล้วใน `cli.mjs`
- test harness: `makeTempProject(t)`, `runCli(cwd,args[,env])`, `globalEnv(home)`, `ok(r)` — มีครบใน `installer.test.mjs` (เคส global 11-14 เป็น pattern อ้างอิง)
- verify-pack: `checkFiles(files[])` (export แล้ว) — import ตรงใน `verify-pack.test.mjs` ป้อน list ปลอม (ห้าม trigger `npm pack` จริง — main-guard กันอยู่)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- ไม่มี pattern ใหม่ที่ควรเป็นมาตรฐานกลาง (reuse helper-pattern + DRY/stats เดิมทั้งหมด) — learned-rule generalize (version identity) เสนอใน `rule.md §2` (รอ SHIP)
