# Standard — installer

> pattern โค้ด + shared component ของ component installer

## โค้ด installer (`bin/cli.mjs`)
- **helper เป็น function แยกหน้าที่:** `copyTree(relDir,{overwrite})`, `ensureScaffold()`, `seedDocs(relDir)`, `installRootDoc(name,srcPath)`
- ทุก helper เคารพ flag `DRY` (ไม่เขียนจริง แต่ log + นับ stats) และ `stats.{created,updated,skipped}`
- path ทุกที่ใช้ `path.join` (cross-platform); หา root ด้วย `fileURLToPath(import.meta.url)`
- ข้อความ log: `+` สร้างใหม่ · `↻` อัปเดต · `±` ต่อท้าย section · ภาษาไทย

## Test harness กลาง (`tests/installer.test.mjs`) — ใช้ซ้ำทุก test ของ CLI
```js
const cliPath = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url)) // ห้าม .pathname (Windows คืน /D:/...)
function makeTempProject(t) {            // temp dir + cleanup แม้ fail
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}
function runCli(cwd, args = []) {        // spawn จริง — array args ห้าม shell:true
  const r = spawnSync(process.execPath, [cliPath, ...args], { cwd, encoding: 'utf8' })
  return { code: r.status, stdout: r.stdout, stderr: r.stderr }
}
function ok(r, msg='') { assert.equal(r.code, 0, `${msg}\nSTDERR:\n${r.stderr}`) } // surface stderr
```
- **black-box:** assert จาก side-effect จริง — ห้าม import logic จาก `cli.mjs`
- assert `code===0` ก่อนเสมอ; assert stream ให้ตรง (`console.warn`→`stderr`); เทียบไฟล์ด้วย byte-content ไม่ใช่ mtime
- legacy string ที่ assert ต้อง copy codepoint ตรงจาก `cli.mjs` (en-dash U+2013 ใน `0.3–0.5.x`, `≤` U+2264)

## pack-verify (`scripts/verify-pack.mjs`)
- parse `npm pack --dry-run --json` (node script, cross-runner — ไม่ใช่ shell grep)
- assert: `.warnyin/workflow/` ติด · ไม่มี `docs/` หลุด · ไม่มีไฟล์นอก allowlist (`bin/`, `.warnyin/`, `.claude/` + always-include)

## CHANGELOG
- Keep a Changelog — กลุ่ม Added/Changed/Removed/Fixed + version + วันที่
