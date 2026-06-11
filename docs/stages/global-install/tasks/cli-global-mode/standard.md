# Standard — cli-global-mode

> pattern โค้ด/shared component — อิง `docs/techstack/installer/standard.md` + `rule.md`

## โค้ด cli.mjs
- **helper เป็น function แยกหน้าที่** (เหมือน `copyTree`/`ensureScaffold`/`seedDocs`/`installRootDoc`) — เพิ่ม `installGlobalNote()` แนวเดียวกัน, เคารพ `DRY` flag + `stats.{created,updated,skipped}` + log (`+`/`↻`/`±` ภาษาไทย)
- **`resolveMode()` = pure function** (ไม่มี side-effect/ไม่อ่าน global state) → `export` ให้ unit test เรียก; main-guard pattern เดิม (`fileURLToPath(import.meta.url)` compare) ไม่ trigger ตอน import
- path ทุกที่ `path.join` (cross-platform); homedir = `os.homedir()` (ไม่ hardcode `~`/env)
- spawn/readline: `node:readline/promises` — `const rl = createInterface(...)`; `try { await rl.question(...) } finally { rl.close() }`
- async เฉพาะ TTY-path: ห่อ flow ที่เหลือใน `async function main()` แล้ว `main()` ท้ายไฟล์ (ESM top-level await ก็ได้) — non-TTY/flag ไม่เข้า await readline

## Test harness (`installer.test.mjs`) — ขยาย ไม่ทำลายของเดิม
```js
function runCli(cwd, args = [], env) {                    // เพิ่ม param env (เดิม 2 arg)
  const r = spawnSync(process.execPath, [cliPath, ...args],
    { cwd, encoding: 'utf8', ...(env ? { env } : {}) })   // ไม่ส่ง env → inherit เดิม (backward compat)
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, signal: r.signal }
}
// global case: runCli(cwd, ['--global'], { ...process.env, HOME: tmp, USERPROFILE: tmp })
// non-TTY hang-guard: spawnSync(..., { timeout: 10000, input: '' }) → assert signal !== 'SIGTERM'
```
- **black-box:** assert side-effect จริง — ห้าม import logic จาก main flow (ยกเว้น `resolveMode` pure-fn ที่ export ตั้งใจ)
- assert `code===0` ก่อน + surface stderr; เทียบไฟล์ byte-content; **side-effect ต้องอยู่ใน temp** (assert path ขึ้นต้นด้วย tmp — กัน leak เขียน homedir จริง)
- `makeTempProject(t)` เดิม + temp HOME แยก (อีก mkdtemp) สำหรับ `{HOME,USERPROFILE}` override; cleanup `t.after()`

## shared component (reuse — ห้ามเขียนซ้ำ)
- `copyTree`, `installRootDoc`, `ensureScaffold`, `seedDocs` เดิม — global reuse `copyTree` (target=homedir); **ไม่ reuse `installRootDoc` สำหรับ global note** (เขียนทั้งไฟล์ — ใช้ `installGlobalNote` แทน, §3E)
