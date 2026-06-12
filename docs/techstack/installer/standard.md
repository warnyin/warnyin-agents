# Standard — installer

> pattern โค้ด + shared component ของ component installer

## โค้ด installer (`src/bin/cli.mjs`)
- **helper เป็น function แยกหน้าที่:** `copyTree(relDir,{overwrite})`, `ensureScaffold()`, `seedDocs(relDir)`, `installRootDoc(name,srcPath)`
- ทุก helper เคารพ flag `DRY` (ไม่เขียนจริง แต่ log + นับ stats) และ `stats.{created,updated,skipped}`
- path ทุกที่ใช้ `path.join` (cross-platform); หา root ด้วย `fileURLToPath(import.meta.url)` → `pkgRoot = resolve(dirname, '..')` = `src/`
- ข้อความ log: `+` สร้างใหม่ · `↻` อัปเดต · `±` ต่อท้าย section · ภาษาไทย

## Test harness กลาง (`src/tests/installer.test.mjs`) — ใช้ซ้ำทุก test ของ CLI
```js
// cliPath relative '../bin/cli.mjs' จาก src/tests/ → src/bin/cli.mjs (mirror layout รักษา relative path เดิม)
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
- **assertion เคส install เป็น target-side path** (`.warnyin/workflow`, `.claude/commands/warnyin`, `CLAUDE.md` ...) ไม่ใช่ `src/.warnyin` — installer วางที่ target ไม่มี prefix `src/`

## pack-verify (`src/scripts/verify-pack.mjs`) — testable (BL-4)
```js
export function checkFiles(files) { ... return errors }   // pure: รับ POSIX path[] จาก npm pack --json คืน error[]
// main-guard: argv[1] comparison (ไม่ใช่ import.meta.main ที่ undefined บน node 20) → import จาก unit ไม่ trigger npm pack
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()
```
- `ALLOWED_PREFIX` narrow (`src/bin/`, `src/.warnyin/`, `src/.claude/commands/`, `src/.claude/agents/`) + `ALLOWED_FILE` (package.json/README/CHANGELOG/LICENSE/`src/AGENTS.md`)
- assert R1: `hasWarnyin` (`src/.warnyin/workflow/`) **และ** `hasClaude` (`src/.claude/commands/warnyin/`) ติดทั้งคู่
- denylist: `src/tests/`,`src/scripts/`,`docs/`,`.github/` + root dogfood (`.warnyin/`,`.claude/`,root `CLAUDE.md`/`AGENTS.md`) + tripwire (`settings.local.json`,`*.tgz`,`.env*`)
- unit (`src/tests/verify-pack.test.mjs`) import `checkFiles` ตรง ป้อน list ปลอม assert จับได้

## dev tooling (`src/scripts/` — ไม่ publish, cross-platform)
- **`setup-dogfood.mjs`** — `installViaNpx()` (spawn npx, `shell:true` เฉพาะ win32) `||` `installViaPack()` (fallback: npm pack→`tar -xzf --strip-components 1`→`node <cli>`); resolve cli จาก tarball `package.json bin` + candidate `['src/bin/cli.mjs','bin/cli.mjs']` (ทน version skew baseline); `appendContributingPointer()` idempotent (marker `CONTRIBUTING.md`); ทั้งคู่ล้ม → `exit(1)`
- **`setup-sandbox.mjs`** — `mkdtempSync(os.tmpdir(),'wy-sandbox-')` → `spawnSync(process.execPath, [src/bin/cli.mjs], {cwd:sandbox})` (array args ไม่ shell) → print path
- **`check-test-count.mjs`** — อ่าน summary `node --test` จาก stdin → fail ถ้า `fail!=0` / `pass<MIN_PASS(9)` / `pass!=tests` (anti-false-green)

## command namespace (`.claude/commands/warnyin/`)
- **nested namespace = subfolder** — `/warnyin:<group>:<action>` map กับไฟล์ `.claude/commands/warnyin/<group>/<action>.md` (เช่น `/warnyin:feedback:issue` ← `feedback/issue.md`); `cli.mjs copyTree` **recursive** อยู่แล้ว (`readdirSync withFileTypes` + เรียกตัวเอง + `mkdirSync recursive`) → copy nested folder อัตโนมัติ **ไม่ต้องแก้ packaging**; `verify-pack` เช็ค prefix `src/.claude/commands/warnyin/` → ครอบ nested เอง; **mkdir directory ก่อน Write** ไฟล์ใน nested path ใหม่ (โฟลเดอร์ยังไม่มี → Write fail) — evidence: topic `feedback-issue-command` (nested namespace แรก, verify-pack 83 ไฟล์ + sandbox install proof)

## CHANGELOG
- Keep a Changelog — กลุ่ม Added/Changed/Removed/Fixed + version + วันที่
