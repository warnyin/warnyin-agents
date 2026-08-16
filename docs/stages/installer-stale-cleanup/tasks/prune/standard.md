# Standard — prune

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ดที่ task นี้ต้องยึด · **อิงจาก** `docs/techstack/installer/standard.md` + `docs/techstack/installer/test.md`

## 1. Standard กลางที่ยึด (จาก techstack)

### 1.1 `src/bin/cli.mjs`
- **helper เป็น function แยกหน้าที่** — `copyTree(relDir,{overwrite})`, `ensureScaffold()`, `seedDocs(relDir)`, `installRootDoc(name,srcPath)`, `writeVersionStamp()` · ของใหม่ต้องเข้าพวก: `readManifest(target)` · `writeManifest(payloadNew)` · `prune(stale, ...)`
- **ทุก helper เคารพ flag `DRY`** — ไม่เขียนจริง แต่ **log + นับ `stats`** (pattern ต้นแบบ = `writeVersionStamp()` `:237-248`)
- **`stats` เป็น mutable counter ก้อนเดียวระดับ module** — `const stats = { created: 0, updated: 0, skipped: 0 }` → task นี้เพิ่มช่อง `pruned: 0` ในก้อนเดิม (ห้ามสร้าง counter ขนาน)
- **path ทุกที่ใช้ `path.join`** (cross-platform) · หา root ด้วย `fileURLToPath(import.meta.url)`
- **ข้อความ log:** `+` สร้างใหม่ · `↻` อัปเดต · `±` ต่อท้าย section · `·` ข้าม (adapter) — task นี้เพิ่ม `−` (U+2212) ลบ · `⚠` ข้าม/เตือน · **ภาษาไทย**
- **indent ของบรรทัดรายการไฟล์ = 2 space** (`  + ${rel}`) — บรรทัด `−` / `⚠` ใช้ indent เดียวกัน
- **ESM main-guard `isEntrypoint()`** — โค้ดใหม่ต้องอยู่ใต้ guard นี้ ห้ามรัน side-effect ตอน import (`docs/techstack/installer/rule.md`)

### 1.2 Test harness กลาง (`docs/techstack/installer/standard.md` §Test harness)
```js
const cliPath = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url)) // ห้าม .pathname (Windows คืน /D:/...)
function makeTempProject(t) {            // temp dir + cleanup แม้ fail
  const dir = mkdtempSync(path.join(os.tmpdir(), 'wy-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}
function runCli(cwd, args = [], env, opts = {}) {   // spawn จริง — array args ห้าม shell:true
  const r = spawnSync(process.execPath, [cliPath, ...args], { cwd, encoding: 'utf8',
    ...(env ? { env } : {}), ...opts })
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, signal: r.signal }
}
function makeTempHome(t) { /* mkdtemp แยกอีกใบ */ }
function globalEnv(home) { return { ...process.env, HOME: home, USERPROFILE: home } } // ต้องตั้งทั้งคู่
function ok(r, msg = '') { assert.equal(r.code, 0, `${msg} exit!=0\nSTDERR:\n${r.stderr}\nSTDOUT:\n${r.stdout}`) }
function listFiles(dir, base = dir, acc = []) { /* path ทุกไฟล์ใต้ dir แบบ relative */ }
```
- **copy harness เข้าไฟล์ใหม่ ห้าม import ข้ามไฟล์เทส** — `installer.test.mjs` ห้ามแตะ (จะกลายเป็น edit ไฟล์ของคนอื่น) และมันไม่ export อะไรอยู่แล้ว
- **black-box:** assert จาก side-effect จริง (ไฟล์/exit/stdout) · assert `code===0` ก่อนเสมอ + surface `stderr`
- **stream ให้ตรง** — `console.log` → stdout, `console.warn`/`console.error` → stderr; assert ให้ตรง stream ที่ใช้จริง
- **string ที่ assert ต้อง copy codepoint ตรง** — `−` U+2212, `↻` U+21BB, `⚠` U+26A0, `≤` U+2264 · ในเทสให้เขียนเป็น escape (`'\u2212'`) เพื่อกัน editor แปลงเงียบ
- **ห้าม `t.skip`** เมื่อ platform ไม่รองรับ (เช่น symlink บน Windows) → `console.error('  ⚠ ...')` + `return` เพราะ pass-count gate บังคับ `pass === tests` (`installer.test.mjs:596-607` เป็น pattern ต้นแบบ)
- **ห้ามใส่ path/glob arg ให้ `node --test`** — bare `node --test` auto-discover ไฟล์ใหม่เอง ไม่ต้อง register ที่ไหน

## 2. Pattern การเขียนโค้ดของ task นี้

### 2.1 pure fn + injectable IO (บังคับ)
โครงคงที่: **pure core + fs shell**
```js
/** ★ pure — parse ข้อความ manifest (ไม่แตะ fs, ไม่ throw) */
export function parseManifest(text, { maxEntries = 5000 } = {}) { ... }

/** ★ pure — คำนวณรายการที่ตกรุ่น (ไม่แตะ fs)
 *  @param {(rel:string)=>boolean} statOnDisk — injectable เพื่อ unit-test โดยไม่สร้างไฟล์จริง */
export function computeStale({ manifestOld, payloadNew, knownStale, prunableRoots, statOnDisk, sep = '/' }) { ... }

/** fs shell — อ่านไฟล์ + guard ขนาด แล้วส่งต่อให้ pure fn */
function readManifest(target) { ... return parseManifest(text) }
```
- **fn ที่ต้อง `export`** (unit-test import ตรง): `parseManifest` · `computeStale` · `mergeManifest` · `overCap` · `sanitizePath` · `toPosix` · `semverLt` — ข้อยกเว้นเดียวกับ `resolveMode`/`isEntrypoint` ที่มีอยู่แล้ว
- **fn ที่ต้อง *ไม่* export** (มี side-effect): `readManifest` · `writeManifest` · `prune` · `copyTree`
- **fn ทุกตัวมี JSDoc ภาษาไทย** อธิบาย **เหตุผล/falsifiable rationale** ไม่ใช่แค่ signature — เทียบ `normalizeEol` (`:112-122`) และ `isEntrypoint` (`:489-501`) ที่เขียนไว้ว่า "ถ้าไม่ทำแบบนี้จะพังยังไง"
- **ไม่ throw ข้ามชั้น** — ทุก fs op ที่แตะ untrusted path ห่อ `try/catch` แล้วแปลงเป็น `reason` ในเซตปิด (C12)

### 2.2 การเขียนบรรทัดรายงาน
```js
console.log(`  ${exists ? '↻' : '+'} ${rel}`)      // ของเดิม — อย่าเปลี่ยน
console.log(`  \u2212 ${sanitizePath(rel)}`)        // ลบสำเร็จ (C15)
console.warn(`  \u26a0 ${sanitizePath(rel)} [${reason}]`) // ข้าม (C15) → stderr
```
- **reason เป็น `const` เซตปิด** ประกาศเป็น object/array ตัวเดียว แล้วอ้างผ่านตัวแปร — ห้ามพิมพ์ literal กระจาย (ทำให้ U33 พิสูจน์ได้ + กันสะกดเพี้ยน)
- **sanitize ก่อนพิมพ์เสมอ** — ไม่มีทางเดียวที่ path ดิบจาก manifest หลุดขึ้น terminal

### 2.3 zero-dep / publish boundary
- import ได้เฉพาะ `node:*` — ตัวใหม่รอบนี้คือ **`node:crypto`** (`createHash`)
- **`cli.mjs` ห้าม import ข้ามไป `src/scripts/**`** — โฟลเดอร์นั้นไม่อยู่ใน `package.json files` ⇒ ไม่ถูก publish ⇒ ผู้ใช้ crash แต่เทสใน repo เขียว (false-green) · `semverLt` จึง **ลอกอัลกอริทึม** ของ `src/scripts/setup-dogfood.mjs:94-106` มาเขียนใน `cli.mjs` เอง (field-wise numeric, `parseInt(x,10) || 0`, ขาด field = 0)

### 2.4 error handling / degrade
- **fail-toward-under-delete** — ทุกจุดที่ไม่แน่ใจ = **ไม่ลบ** แล้วรายงาน reason
- **ไม่ล้มทั้ง run** — prune error ใด ๆ → `⚠` + ทำงานต่อ + exit 0 (C12)
- **ห้าม enumerate errno** (`EBUSY`/`EPERM` ต่างกันข้าม OS) — จับ `catch` รวมแล้วออก `prune:io`

### 2.5 ลำดับ I/O ที่ห้ามสลับ
1. `lstat(abs)` → เช็ค size (C7) + regular file (C8) **จาก stat ก้อนเดียวกัน**
2. `realpathSync` ทั้ง root และ `dirname(abs)` → containment (C8) — **`fs.realpathSync` ตัวเดียวกันทั้งสองฝั่ง ห้ามผสม `.native`**
3. `unlink(abs)` — **ติดกับ `lstat` ไม่แทรก I/O อื่น** (ลด TOCTOU window ที่ §5 ประกาศรับไว้)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
| มีอยู่แล้วใน `cli.mjs` | ใช้ทำอะไรใน task นี้ |
|---|---|
| `normalizeEol(data, filename)` `:123` | **บังคับ** — hash ต้องคิดหลังผ่านตัวนี้ทั้ง 2 ฝั่ง |
| `TEXT_EXT` `:110` | `normalizeEol` ใช้ภายใน — ไม่ต้องแตะ |
| `readPkgVersion()` `:230` | header ของ manifest (N3) |
| `stats` `:103` | เพิ่มช่อง `pruned` ในก้อนเดิม |
| `DRY` `:23` / `UPDATE` `:22` | เงื่อนไข C11/C13 |
| `target` `:106` | base ของทุก abs path |
| `CORE` `:87-93` | ต้นทางของ `CORE_POSIX` (derive ห้าม hardcode ซ้ำ) |
| `writeVersionStamp()` `:237` | **pattern ต้นแบบ** ของ `writeManifest` (DRY-aware + `+`/`↻` + `stats`) |
| `copyTree()` `:132` | จุดฉีด `onFile` — แก้ในที่เดิม ห้ามเขียน walker ตัวที่ 2 |

## 4. เพิ่มเติมเฉพาะ task (ถ้าควรเป็นมาตรฐานกลาง → note ใน `rule.md §2`)
- **`onFile` callback ใน tree-walker** — pattern "walker คืนสิ่งที่มันเขียน/รับรองว่าเป็นเจ้าของ" ให้ layer บนเอาไปทำ manifest แทนการ walk ซ้ำ (กัน 2 walker drift กัน)
- **closed-set reason constant + structural test** — ประกาศเซตปิดเป็น const แล้วมีเทสอ่าน source ยืนยันว่าเซตที่ใช้จริง = เซตที่ประกาศ (ต่อยอดจาก `installer/rule.md §2` error-prefix convention)
- **pure predicate สำหรับ threshold** (`overCap(n, {dry, force})`) เพื่อให้ boundary test (`= cap` ผ่าน / `cap+1` แดง) เขียนได้โดยไม่ต้อง spawn — ตรงกับ `docs/rule.md §1 declared-threshold`
- **injectable `statOnDisk`** — pure fn รับ predicate แทนการเรียก `fs` เอง (ต่อยอดจาก `isEntrypoint(argv1, metaUrl, realpath)` ที่ inject `realpathSync`)
