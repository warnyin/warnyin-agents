# Standard — add-ide-adapters

> อิงจาก `docs/techstack/installer/standard.md`

## 1. Standard กลางที่ยึด (จาก techstack)

- `copyTree(relDir, {overwrite})` — copy recursive, เคารพ DRY + stats
- `installRootDoc(name, srcPath)` — สร้างใหม่ถ้าไม่มี, append section ถ้ามีแต่ยังไม่มี marker
- ทุก helper เคารพ `DRY` flag + `stats.{created,updated,skipped}`
- log format: `+` สร้างใหม่ · `↻` อัปเดต · `±` ต่อท้าย section
- path ทุกที่ใช้ `path.join` (cross-platform)
- ภาษาไทยในข้อความ log

## 2. Pattern การเขียนโค้ดของ task นี้

### `installAdapterDoc(destRel, srcFilename, marker)`

pattern เดียวกับ `installRootDoc` แต่:
- src อ่านจาก `path.join(pkgRoot, '.warnyin', 'installer', 'templates', srcFilename)`
- ใช้ marker parameter แทน hardcode `'warnyin/workflow/stages/'`

```js
function installAdapterDoc(destRel, srcFilename, marker) {
  const src = path.join(pkgRoot, '.warnyin', 'installer', 'templates', srcFilename)
  const dest = path.join(target, destRel)
  if (!fs.existsSync(src)) {
    console.log(`  · ข้าม ${destRel} (ยังไม่มี template ${srcFilename})`)
    return
  }
  const content = fs.readFileSync(src, 'utf8')
  if (!fs.existsSync(dest)) {
    if (!DRY) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, content)
    }
    stats.created++
    console.log(`  + ${destRel}`)
    return
  }
  const existing = fs.readFileSync(dest, 'utf8')
  if (existing.includes(marker)) {
    stats.skipped++
    return
  }
  const section = (existing.endsWith('\n') ? '\n' : '\n\n') + content
  if (!DRY) fs.appendFileSync(dest, section)
  stats.updated++
  console.log(`  ± ${destRel} (ต่อท้าย warnyin section)`)
}
```

### Cursor `.mdc` template (frontmatter)

```
---
alwaysApply: true
---
# Warnyin Standard Workflow
...
```

### CORE array pattern (Cursor/Windsurf)

```js
const CORE = [
  ...CORE_เดิม,
  path.join('.cursor', 'rules'),   // → copy cursor-rules.mdc → .cursor/rules/warnyin.mdc
  path.join('.windsurf', 'rules'), // → copy windsurf-rules.md → .windsurf/rules/warnyin.md
]
```

**ข้อสำคัญ:** `copyTree` วนไฟล์ใน src directory แล้ว copy ไปยัง dest path เดิม — ชื่อไฟล์ template ต้องเป็นชื่อที่ต้องการใน target เลย (เช่น `warnyin.mdc`, `warnyin.md`)

## 3. Shared component / utility ที่ต้องใช้

- `copyTree(relDir, {overwrite})` — มีอยู่แล้วใน cli.mjs
- `installRootDoc` — ดู pattern แล้ว extract เป็น `installAdapterDoc` (refactor เล็กน้อย)
- test harness: `makeTempProject(t)` + `runCli(cwd, args)` — มีอยู่แล้วใน installer.test.mjs

## 4. เพิ่มเติมเฉพาะ task

- Template content ทุก adapter ต้องมี **marker comment** เพื่อให้ `installAdapterDoc` detect ว่า append แล้วหรือยัง (idempotent)
- `.clinerules` ไม่มี extension → `fs.writeFileSync` ใช้ได้ปกติ (node ไม่ขึ้นกับ extension)
- Cursor `warnyin.mdc` ชื่อไฟล์ destination ต้องเป็น `warnyin.mdc` ไม่ใช่ `cursor-rules.mdc` (template src ชื่อต่างจาก dest) → ต้องใช้ `installAdapterDoc` ที่ map src→dest แทน `copyTree` สำหรับ Cursor ด้วย **หรือ** ตั้งชื่อ template ใน src เป็น `warnyin.mdc` แล้ว copy เข้า CORE directory ปกติ
  - แนะนำ: ตั้งชื่อ template ว่า `warnyin.mdc` และ `warnyin.md` เก็บใน `src/.cursor/rules/` + `src/.windsurf/rules/` ตามลำดับ แล้ว copy ผ่าน `CORE` แทนการเก็บใน `installer/templates/`
  - หรือ: เก็บทั้งหมดใน `installer/templates/` แต่ใช้ `installAdapterDoc` ที่รับ destRel ชัดเจน
  - **ให้ BUILD agent ตัดสินใจ** วิธีที่เหมาะกว่า โดยอิง pattern เดิมของ cli.mjs
