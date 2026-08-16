# Standard — upgrade-path-test

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนเทสที่ task นี้ต้องยึด · **อิงจาก** `docs/techstack/installer/test.md` + `docs/techstack/installer/standard.md`

## 1. Standard กลางที่ยึด (จาก techstack)
- **black-box spawn จริง** — spawn `src/bin/cli.mjs` ใน temp dir แล้ว assert side-effect (ไฟล์/exit code/stdout/stderr); **ห้าม import logic จาก `cli.mjs`** (รัน side-effect ตอน import) · ห้าม refactor target เพื่อ testability
- **assert `code===0` ก่อนเสมอ + surface `stderr`** ใน assertion message (`ok(r, msg)`) · assert stream ให้ตรง (`console.warn` → stderr) · เทียบไฟล์ด้วย **byte** ไม่ใช่ mtime
- **cross-platform:** `process.execPath` · `path.join` · `fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))` (**ห้าม `.pathname`** — Windows คืน `/D:/…` → MODULE_NOT_FOUND) · spawn ด้วย array args **ห้าม `shell:true`**
- **cleanup `t.after()` ลงทะเบียนก่อน assert** (ลบ temp แม้ fail) — เคส `chmod` ต้อง **restore permission ใน `t.after` ก่อน `rm`** ไม่งั้น cleanup ล้ม
- **zero-dependency** — ใช้เฉพาะ built-in `node:*` (`node:test`, `node:assert/strict`, `node:child_process`, `node:fs`, `node:path`, `node:os`, `node:url`, `node:crypto`)
- **bare `node --test`** — ไฟล์ต้องชื่อ `*.test.mjs` ใต้ `src/tests/` เพื่อให้ auto-discover เจอ (ห้ามพึ่ง path arg)
- **acceptance = pass count ไม่ใช่แค่ exit 0** (`check-test-count.mjs`)

## 2. Pattern การเขียนโค้ดของ task นี้

### 2.1 Harness — copy pattern ไม่ import
`installer.test.mjs` **ไม่ export** อะไร ⇒ ประกาศ helper ของตัวเองในไฟล์ใหม่ โดย **copy รูปแบบเดิมคำต่อคำ** (`makeTempProject` `:25-29` · `runCli` `:31-39` · `globalEnv` `:49-51` · `listFiles` `:59-66` · `ok` `:54-56`) — รูปเดียวกันทั้ง repo กัน drift

### 2.2 ประกอบ package ปลอมใน temp (pattern จาก `installer.test.mjs:676-709` เคส `EOLI.`)
```js
// layout ต้องเหมือนของจริง: pkgRoot = <pkg>/src, version อ่านจาก <pkg>/package.json
const write = (rel, text) => { const abs = path.join(pkg, rel); mkdirSync(path.dirname(abs), {recursive:true}); writeFileSync(abs, text) }
write('package.json', JSON.stringify({ version: '0.29.9' }))   // < 0.30.1 → เข้าเงื่อนไข C14
copyDir(repoSrc, path.join(pkg, 'src'))                        // ★ payload = ของจริงทั้งก้อน ห้าม mini-payload
write('src/.warnyin/template/stages/[topic]/test.md',  '…')    // 2 ไฟล์ที่ถูกยุบกลับ
write('src/.warnyin/template/stages/[topic]/verify.md', '…')
spawnSync(process.execPath, [path.join(pkg,'src','bin','cli.mjs'), '--project'], { cwd: target, encoding: 'utf8' })
```
- `copyDir` เขียนเอง zero-dep (`readdirSync withFileTypes` recursive; ข้าม symlink ถ้ามี) — **ห้าม `fs.cpSync` ที่ไม่มีใน node 20 บาง minor**; ถ้าจะใช้ต้องยืนยัน node 20/22/24 ครบก่อน
- **pkg เก่า = copy ของ `src/` ปัจจุบัน** โดยเจตนา: payload ใหม่ ≠ payload เก่า **เฉพาะ 2 ไฟล์ที่เติมเข้าไป** ⇒ stale set ที่คาดหวังชัดเจนและไม่ขึ้นกับ payload drift ในอนาคต

### 2.3 Fixture A/B
```js
function fixtureA(t) { const {target,pkgOld} = installOldInto(t); rmSync(manifestPath(target), {force:true}); return {target,pkgOld} } // known-stale (C14)
function fixtureB(t) { return installOldInto(t) }                                                                                    // hash (C7)
```
- ห้ามแตะ `.warnyin/.warnyin-version` (stamp `0.29.9` คือสิ่งที่เปิด C14)
- ไฟล์ที่ใช้ทำ stale เพิ่ม (เคส cap) ต้องมี **manifest entry ที่ hash ตรงจริง** — คำนวณด้วย `createHash('sha256')` บนเนื้อไฟล์ที่เขียนลงดิสก์ (LF) ไม่ใช่ hardcode

### 2.4 Mutant harness
- ลำดับบังคับตาม `spec.md §7.3` — **`assert.notEqual(mutated, original, …)` เป็นบรรทัดแรกหลัง replace เสมอ** (fail-loud, KB #33)
- mutation ทำบน **สำเนาใน temp เท่านั้น** — ห้ามเขียนทับ `src/bin/cli.mjs` ของ repo ไม่ว่าชั่วคราวแค่ไหน
- state ของเคส mutant ต้อง **reuse helper เดียวกับเคส negative ที่คู่กัน** (ห้ามแต่ง state ใหม่ ไม่งั้นพิสูจน์คนละเรื่อง)
- ข้อความ assert ต้องบอก "เคสไหนกำพร้า" เช่น `` `M6: ปิด C5 แล้ว .claude/agents/my-agent.md ต้องหาย — ถ้ายังอยู่ แปลว่า assertion ของ U3 ไม่ได้พิสูจน์อะไร` ``

### 2.5 การ assert stdout
- ข้อความที่ assert ต้อง **copy codepoint ตรงจาก `design.md §4 C15`** — `−` = **U+2212** (ไม่ใช่ hyphen/en-dash), `⚠` = U+26A0, `↻`, `·`
- reason ที่พิมพ์ต้องตรวจกับ **เซตปิด** ที่ประกาศเป็น `const REASONS = new Set([...])` ในไฟล์เทส (copy จาก C15) — assert ว่า reason ทุกตัวที่พบ ∈ เซต (จับ reason ที่ถูกแต่งใหม่นอก contract)
- assert บรรทัดสรุปด้วย substring `ลบ N` (รูปเต็ม: `สรุป: สร้างใหม่ N · อัปเดต N · ข้าม (มีอยู่แล้ว) N · ลบ N`)
- negative assert (`!stdout.includes('−')`) ต้องคู่กับ positive assert ในเคสอื่นเสมอ กัน over-fit

### 2.6 กติกา skip / platform
```js
try { symlinkSync(dirOutside, link, 'dir') } catch (e) {
  console.error(`  ⚠ ข้ามสร้าง symlink (${e.code || e.message}) — platform ไม่รองรับ; CI ubuntu ครอบ`)
  return   // ★ ห้าม t.skip — pass-count gate fail ถ้า pass !== tests
}
```
- ใช้ pattern เดียวกันกับเคส `chmod` (`process.platform === 'win32' || process.getuid?.() === 0`)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `makeTempProject` / `runCli` / `globalEnv` / `listFiles` / `ok` — **รูปแบบ** จาก `src/tests/installer.test.mjs` (copy เข้าไฟล์ใหม่ ไม่ import)
- `node:crypto createHash('sha256')` — ห้ามเขียน hash เอง
- ห้ามสร้าง fixture directory ถาวรใน repo — ทุกอย่างอยู่ใน `os.tmpdir()` และถูกลบด้วย `t.after`

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- **pattern ใหม่ที่เสนอให้เป็นมาตรฐานกลาง (note ใน `rule.md §2` รอ SHIP):**
  - **upgrade-path fixture = copy payload จริงของรุ่นก่อน** แล้วเติมสิ่งที่ถูกลบกลับ (ไม่ใช่แต่ง mini-payload)
  - **mutant harness เป็นเคสถาวรใน suite** สำหรับ feature ที่ assertion ส่วนใหญ่เป็น negative ("ต้องไม่เกิดอะไร")
