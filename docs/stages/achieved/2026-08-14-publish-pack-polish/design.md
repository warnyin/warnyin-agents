# Design — publish-pack-polish

> how (vertical slice + interface + flow + impact) + Spec delta
> single-writer narrative (main loop — ห้ามแตกให้หลาย agent เขียนคนละ section)
> DESIGN review (panel) บันทึกท้ายไฟล์ · gate ก่อน BUILD

## Vertical slice decomposition
3 slice ใน 2 wave — file-ownership disjoint (slice A vs B) → ขนานได้จริง; slice C = release-hygiene ต้องรอ integrate (rule §1 "release-hygiene task เป็น wave สุดท้าย")

### Slice A: `verify-pack-hardening` (wave 1)
- **layer:** `src/scripts/verify-pack.mjs` (runtime) + `src/tests/verify-pack.test.mjs` (unit) + อ่าน `src/bin/cli.mjs` (import `TEXT_EXT` shared)
- **ไฟล์ที่แก้:** `src/scripts/verify-pack.mjs`, `src/tests/verify-pack.test.mjs`
- **สิ่งที่ส่งมอบ:**
  - `getNpmCmd(platform = process.platform)` export pure fn — Windows/mac/linux selection (ไม่ใช้ `.cmd` — แก้ CVE-2024-27980)
  - `checkEol(entries /* {path, buf} */)` export pure fn — ตรวจ CR ใน text extension
  - `readTextEntries(files, opts = {})` pure fn — I/O อยู่ที่ขอบ, รับ injectable `readFile` + `root` (pattern `isEntrypoint`)
  - `main()` refactor ใช้ helper ทั้ง 3 ตัว
  - unit test 4 เคสใหม่ (LF pass / CR fail / binary skip / path traversal reject)

### Slice B: `cli-help-wording` (wave 1)
- **layer:** text only (cli.mjs + template CLAUDE.md + workflow README + README.md + installer.test)
- **ไฟล์ที่แก้:** `src/bin/cli.mjs`, `src/.warnyin/installer/templates/CLAUDE.md`, `src/.warnyin/workflow/README.md`, `README.md`, `src/tests/installer.test.mjs`, `CHANGELOG.md` (สร้าง `[0.29.1]` header ว่าง + entry)
- **สิ่งที่ส่งมอบ:**
  - แก้ wording "ไม่แตะ docs/" → "เขียนทับเฉพาะ CORE — `docs/` ถูก seed จาก template ถ้ายังไม่มี (ไม่ทับของเดิม)" ใน **5 จุด** (ดู §Impact)
  - 1 เคส test ใหม่: spawn `cli.mjs --help` → assert substring ใหม่ปรากฏ + substring เก่าหายไป (regression guard)
- **★ why ไม่ fold เข้า Slice C** (TL suggestion #1): wording fix ผูก runtime ของ cli.mjs (slice A ผูก verify-pack.mjs) — file-ownership disjoint, ขนานได้จริง; fold เข้า C = wave 1 width=1 → ผิด "DAG-width ก่อน serialize"

### Slice C: `release-hygiene` (wave 2 — หลัง integrate A+B)
- **layer:** repo-level gate + version metadata
- **ไฟล์ที่แก้:** `package.json`, `CHANGELOG.md`, `docs/infra.md` (runbook section ใหม่)
- **สิ่งที่ส่งมอบ:**
  - bump `package.json` version: `0.29.0 → 0.29.1`
  - bump `MIN_PASS` ใน `src/scripts/check-test-count.mjs`: วัด N ใหม่หลัง integrate A+B (เคสใหม่ 5 = +4 verify-pack + +1 installer) → `MIN_PASS = floor((N − 5) / 10) × 10` (สูตรเดิม — `src/scripts/check-test-count.mjs:8`)
  - เติมวันที่หลัง `[0.29.1]` header ที่ Slice B สร้างไว้ — **Slice C ไม่สร้าง/ย้าย entry** (TL blocker #2)
  - เขียน **Migration section** ตาม text ที่ lock ใน §Impact ด้านล่าง (Infra blocker #1)
  - full-gate: `npm test` + `npm run lint:md` + `npm run verify:pack` (release-hygiene gate — rule §1)
  - update `docs/infra.md` เพิ่ม "Runbook — `verify:pack` gate failure" (Infra suggestion #3)

### Critical-path rationale
- wave 1 width=2 (A‖B) — file-ownership disjoint (verify-pack.mjs + verify-pack.test.mjs vs cli.mjs + installer.test + template files) ไม่มี runtime dependency
- wave 2 ต้องรอ integrate wave 1 — full-gate เห็นผลรวมข้าม slice
- ไม่ใช่ chain — fan-out 2 ของ wave 1 + sequential wave 2 = **DAG width 2 / depth 2** legitimate

## Data model

### A. `checkFiles(files)` — signature คงเดิม (pure — ไม่เพิ่ม opts)
```js
export function checkFiles(files) { ... }   // ไม่เปลี่ยน — purity contract เดิม
```
**ตัด `opts.platform`** — YAGNI (TL blocker #1, SA blocker #2); platform logic อยู่ที่ `main()` ไม่ใช่ `checkFiles` ดังนั้น opts ใน checkFiles ไม่ถูกใช้

### B. `getNpmCmd(platform = process.platform) → 'npm'|'npm_cmd'|'npm.cmd'` — pure fn ใหม่ (export + main-guard)
```js
export function getNpmCmd(platform = process.platform) {
  if (platform === 'win32') {
    // ★ ไม่ใช้ 'npm.cmd' (CVE-2024-27980 — Node ≥20.12.2 reject `.cmd`/`.bat` ด้วย shell:false)
    // ใช้ process.execPath + npm_execpath แทน — `npm run verify:pack` ตั้งให้เสมอ
    // (fallback รันตรง: error ชัดเจน, false-green guard)
    const npmExecPath = process.env.npm_execpath
    return npmExecPath ? { bin: process.execPath, prefix: [npmExecPath] } : null
  }
  return { bin: 'npm', prefix: [] }
}
```
- Security approach (ปิดทั้ง CVE + PATH/CWD hijack ในที่เดียว — ดีกว่า `.cmd`)
- รับ platform เพื่อ **inject ใน unit test** (truth table 3 เคส) — ไม่ต้อง mock global
- คืน `{bin, prefix}` เพื่อ `main()` ส่ง `execFileSync(bin, [...prefix, 'pack', '--dry-run', '--json'], ...)` ตรง ๆ
- ถ้า Windows + ไม่มี `npm_execpath` → return `null` → `main()` exit 1 + error "ต้องรันผ่าน `npm run verify:pack`"

### C. `checkEol(entries) → errors[]` — pure fn ใหม่ (export + main-guard)
```js
// entries = [{ path: string, buf: Buffer | null, ext: string }, ...]
//   - path: POSIX path จาก files[]
//   - buf: เนื้อไฟล์ (null = I/O ล้มเหลว → log warning, skip; ไม่ throw เพื่อให้ gate robust)
//   - ext: นามสกุล lowercase (main() pre-compute)
export function checkEol(entries) {
  const errors = []
  for (const { path, buf, ext } of entries) {
    if (!TEXT_EXT.has(ext)) continue   // conservative skip (binary/unknown)
    if (buf === null) continue         // I/O ล้ม → skip + warn
    if (buf.includes(0x0D)) {
      // Buffer-level check ไม่ต้อง decode UTF-8 (ประหยัด + กัน false-positive จาก multi-byte)
      const count = countOccurrences(buf, 0x0D)
      errors.push(`eol: ไฟล์ text มี CR ${count} ครั้ง (${sanitize(path)})`)
    }
  }
  return errors
}
```
- **pure** — ไม่ I/O ในตัวเอง; main() เตรียม buf + ext
- error string: prefix `eol:` + count + sanitized path (sanitize แทน control char/ANSI escape ด้วย `?` — Security suggestion #3)
- `TEXT_EXT` import จาก `src/bin/cli.mjs` (DRY — Infra suggestion #2, SA suggestion #2); `normalizeEol` ใช้ set เดียวกัน — single source

### D. `readTextEntries(files, opts = {}) → entries[]` — I/O อยู่ที่ขอบ (export + injectable)
```js
export function readTextEntries(files, opts = {}) {
  const { readFile = nodeFs.readFileSync, root = process.cwd(), maxBytes = 5 * 1024 * 1024 } = opts
  const entries = []
  for (const p of files) {
    // path guard (Security blocker #3)
    if (path.isAbsolute(p)) { errors.push(`path: absolute path (${p})`); continue }
    if (p.split('/').includes('..')) { errors.push(`path: มี segment .. (${p})`); continue }
    // symlink guard: lstatSync เช็คก่อน open
    const abs = path.resolve(root, p)
    let st; try { st = fs.lstatSync(abs) } catch (e) { entries.push({path:p, buf:null, ext:extname(p).toLowerCase()}); continue }
    if (st.isSymbolicLink()) { errors.push(`path: symlink (${p})`); continue }
    if (st.size > maxBytes) { entries.push({path:p, buf:null, ext:extname(p).toLowerCase()}); console.warn(`⚠ ข้าม EOL check (size ${st.size}): ${p}`); continue }
    try { entries.push({path:p, buf:readFile(abs), ext:extname(p).toLowerCase()}) }
    catch (e) { entries.push({path:p, buf:null, ext:extname(p).toLowerCase()}) }
  }
  return entries
}
```
- injectable `readFile`/`root`/`maxBytes` — pattern เดียวกับ `isEntrypoint(argv1, metaUrl, realpath = fs.realpathSync)` (`cli.mjs`)
- path guards ก่อน open file (3 ชั้น: absolute/../ /symlink)
- size cap 5 MB + warn (ป้องกัน DoS + false-positive ในไฟล์ที่มี CR legitimately จาก embedded binary)

### E. TEXT_EXT single source — `src/bin/cli.mjs`
```js
// BEFORE (cli.mjs:110)
const TEXT_EXT = new Set(['.md', '.mjs', '.js', '.json', '.txt', '.yml', '.yaml'])

// AFTER: เพิ่ม `.css`/`.html`/`.cjs` (ที่ design §A เดิมคาดไว้ — ตอนนี้ apply ครบ)
export const TEXT_EXT = new Set(['.md', '.mjs', '.js', '.cjs', '.json', '.txt', '.yml', '.yaml', '.css', '.html'])
```
- export → import ที่ `verify-pack.mjs`: `import { TEXT_EXT } from '../bin/cli.mjs'`
- DRY ระหว่าง verify-pack ↔ installer (normalizeEol ใช้ set เดียวกัน)

### F. `main()` — refactor รวม helper
```js
function main() {
  const platform = process.platform
  const cmd = getNpmCmd(platform)
  if (!cmd) { console.error('✖ verify:pack: รันผ่าน `npm run verify:pack` เท่านั้น'); process.exit(1) }
  const args = [...cmd.prefix, 'pack', '--dry-run', '--json', '--ignore-scripts']   // ★ --ignore-scripts กัน prepack lifecycle (Security #4)
  const out = execFileSync(cmd.bin, args, { encoding: 'utf8' })
  const files = JSON.parse(out)[0].files.map((f) => f.path)

  // EOL check: เฉพาะ allowlist-passed set (Security blocker #3)
  const allowed = files.filter((p) =>
    ALLOWED_PREFIX.some((x) => p.startsWith(x)) || ALLOWED_FILE.includes(p)
  )
  const existingErrors = checkFiles(files)   // เดิม
  const eolEntries = readTextEntries(allowed) // I/O เฉพาะ allowlist + size-cap
  const eolErrors = checkEol(eolEntries)      // pure
  const allErrors = [...existingErrors, ...eolErrors]
  if (allErrors.length) { ... exit 1 ... }
}
```

## Interface / contract
| caller | before | after |
|---|---|---|
| `main()` (verify-pack) | inline `execFileSync('npm', ...)` | `getNpmCmd()` + `readTextEntries()` + `checkEol()` |
| `src/tests/verify-pack.test.mjs` | `checkFiles(GOOD)` | `checkFiles(GOOD)` (signature คงเดิม) + เคสใหม่ `getNpmCmd('win32')`/`('darwin')`/`('linux')` + `checkEol([{path,buf,ext}])` + `readTextEntries(files, {readFile: fake, root: tmpdir})` |
| `src/bin/cli.mjs` (normalizeEol) | `TEXT_EXT` (local Set) | `TEXT_EXT` **export** + เพิ่ม `.css`/`.html`/`.cjs` |

Backward compat: `checkFiles` signature ไม่เปลี่ยน — เทสเดิม 13 เคสผ่าน

## Flow (slice A)
```
npm run verify:pack
  └─ node src/scripts/verify-pack.mjs
       ├─ main(): cmd = getNpmCmd(process.platform)
       │     ├─ win32 → { bin: process.execPath, prefix: [npm_execpath] }
       │     │         (npm_execpath ตั้งโดย npm เสมอ — ไม่มี → exit 1 + error ชัด)
       │     └─ darwin/linux → { bin: 'npm', prefix: [] }
       │     execFileSync(cmd.bin, [...cmd.prefix, 'pack', '--dry-run', '--json', '--ignore-scripts'])
       │     → JSON.parse → files[]  (POSIX path)
       │
       ├─ checkFiles(files): R1/denylist/allowlist/tripwire/stamp (เดิม)
       │     → existingErrors[]
       │
       ├─ filter allowed = files ที่ผ่าน allowlist
       │
       ├─ readTextEntries(allowed, opts): inject readFile/root
       │     ├─ path guard: reject absolute / มี .. / symlink → error
       │     ├─ size cap 5MB → skip + warn
       │     └─ readFile() → entries[]
       │
       ├─ checkEol(entries): pure
       │     ├─ buf.includes(0x0D) → error prefix `eol:`
       │     └─ TEXT_EXT match → check, ไม่ match → skip
       │
       └─ exit 1 ถ้า [...existingErrors, ...eolErrors].length > 0
```

## Flow (slice B)
```
npx @warnyin/agents --help
  └─ node src/bin/cli.mjs --help
       └─ console.log(<help string>)  (5 จุดที่ wording เปลี่ยน — ดู §Impact)
```
+ spawn `cli.mjs --help` ใน installer.test.mjs → assert substring ใหม่ปรากฏ + substring เก่าหาย (regression guard)

## Impact on existing system
- **`checkFiles`**: signature คงเดิม — purity contract ไม่แตะ (SA blocker #1)
- **`getNpmCmd` (ใหม่)** + **`main()` refactor**: Windows dev ที่ `verify:pack` พังอยู่ (ENOENT) → รันได้ โดยใช้ `process.execPath + npm_execpath` ไม่ใช่ `.cmd` (ปิดทั้ง CVE-2024-27980 + PATH/CWD hijack)
- **`checkEol` + `readTextEntries` (ใหม่)**: EOL check บน allowlist-passed set เท่านั้น + path guards + size cap — false-positive guard 3 ชั้น
- **`cli.mjs` --help**: เปลี่ยน multi-line string ไม่กระทบ runtime — ผู้ใช้ pin version เก่ายังเห็น wording เดิม
- **wording scope ขยาย 5 จุด** (SA blocker #5):
  1. `src/bin/cli.mjs` บรรทัด 50 (--help body)
  2. `src/.warnyin/installer/templates/CLAUDE.md` บรรทัด 49 (**payload** ที่ผู้ใช้อ่าน — ต้องแก้)
  3. `src/.warnyin/workflow/README.md` บรรทัด 101
  4. `README.md` บรรทัด 40
  5. (verify ระหว่าง BUILD) `src/.warnyin/installer/templates/CLAUDE.global.md` / copilot / clinerules / GEMINI.md — ถ้ามีข้อความเดียวกัน → แก้ด้วย
- **`src/tests/eol.test.mjs`**: ไม่แตะ — unit gate ที่ `src/` ยังครอบเดิม (rule §4)
- **`src/tests/verify-pack.test.mjs`**: +4 เคส (LF pass / CR fail / binary skip / path traversal reject)
- **`src/tests/installer.test.mjs`**: +1 เคส (--help substring assert)
- **`src/scripts/check-test-count.mjs`** (Slice C): bump `MIN_PASS` ตามจำนวนเคสใหม่ — หลัง integrate A+B = +5 เคส → N = 197 → `MIN_PASS = floor((197-5)/10)*10 = 190` (สูตรเดิมจาก `check-test-count.mjs:8`); **อ่าน MIN_PASS ปัจจุบันจากไฟล์ก่อน bump** (config-protection rule §1)
- **`package.json files`**: ไม่แตะ
- **`docs/features/installer-version-stamp/spec.md`**: ADDED Requirement + 5 Scenario (Spec delta §ด้านล่าง)
- **`CHANGELOG.md`**:
  - Slice B สร้าง `## [0.29.1]` header (ว่าง ไม่มีวันที่) + entries ที่ตัวเองรับผิดชอบ (Fixed: --help wording)
  - Slice C เติมวันที่หลัง header + version bump + Migration section (text ที่ lock ด้านล่าง)
- **`docs/infra.md`**: เพิ่ม section "## Runbook — `verify:pack` gate failure" (Infra suggestion #3) — ระบุ error categories ทั้งหมด (denylist/allowlist/eol/path) + วิธีแก้แต่ละแบบ

### CHANGELOG Migration section — text ที่ lock ไว้ใน design (Slice C ต้อง commit text นี้ตรงตัว)

> **⚠️ commit/stash งานที่ยังไม่ได้ commit ก่อน** — `git reset --hard` ลบงานค้างถาวร
>
> ผู้ใช้ที่ clone repo ก่อน 2026-07-14 (release 0.27.1 — ก่อนเพิ่ม `.gitattributes`) และยังไม่ได้ renormalize:
> ```bash
> git rm --cached -r .
> git reset --hard
> ```
> แล้ว `npm run verify:pack` จะผ่าน (payload กลับเป็น LF ทั้งหมด)
>
> dev ที่ clone หลัง 2026-07-14: ไม่ต้องทำอะไร (working tree = LF อยู่แล้ว)

## Spec delta — เพิ่มใน `docs/features/installer-version-stamp/spec.md`

### ADDED — Requirement: verify:pack ตรวจ EOL + เลือก npm binary แบบ cross-platform
`npm run verify:pack` ตรวจ payload text files ไม่มี CR (เพื่อให้ payload ที่ติดตั้งขึ้นเครื่องผู้ใช้เป็น LF เสมอ — ป้องกัน `/warnyin:build` พังจาก `script contains control characters`) และเลือก npm binary ตาม platform โดยไม่ใช้ `.cmd`/`.bat` (CVE-2024-27980)

#### Scenario: payload text file = LF → ไม่มี eol-error
- GIVEN `readTextEntries(allowed)` คืน entries[{path, buf}] โดย buf เป็น LF
- WHEN `checkEol(entries)`
- THEN errors[] ไม่มี prefix `eol:`

#### Scenario: payload text file มี CR → error (ระบุจำนวน)
- GIVEN buf มี `\r\n` 3 ครั้ง
- WHEN `checkEol(entries)`
- THEN errors[] มี `"eol: ไฟล์ text มี CR 3 ครั้ง (${path})"`

#### Scenario: binary file (extension ไม่อยู่ใน TEXT_EXT) → skip
- GIVEN ext = `.png` (ไม่อยู่ใน `TEXT_EXT`)
- WHEN `checkEol(entries)`
- THEN errors[] ไม่มี eol-error (extension skip)

#### Scenario: path เป็น absolute → error หมวด path (ไม่ใช่ eol)
- GIVEN files[] มี `/etc/passwd`
- WHEN `readTextEntries(files)`
- THEN errors[] มี `"path: absolute path (/etc/passwd)"` (ไม่ read ไฟล์)

#### Scenario: path มี `..` segment → error หมวด path
- GIVEN files[] มี `../../../etc/passwd`
- WHEN `readTextEntries(files)`
- THEN errors[] มี `"path: มี segment .. (../../../etc/passwd)"`

#### Scenario: file เป็น symlink → error หมวด path
- GIVEN `path.resolve(root, p)` ชี้ไป symlink
- WHEN `readTextEntries(files)`
- THEN errors[] มี `"path: symlink (${p})"`

#### Scenario: Windows dev → ใช้ `process.execPath + npm_execpath` (ไม่ใช่ `.cmd`)
- GIVEN `getNpmCmd('win32')` + `process.env.npm_execpath = '/usr/local/lib/node_modules/npm/bin/npm-cli.js'`
- THEN return `{ bin: '/path/to/node', prefix: ['/usr/local/lib/.../npm-cli.js'] }` — main() execFileSync ใช้ `node` รัน `npm-cli.js` ตรง ไม่ผ่าน shell
- GIVEN `getNpmCmd('win32')` + ไม่มี `npm_execpath`
- THEN return `null` — main() exit 1 + error "ต้องรันผ่าน `npm run verify:pack`"

#### Scenario: mac/linux → ใช้ npm ตรง
- GIVEN `getNpmCmd('darwin')` หรือ `getNpmCmd('linux')`
- THEN return `{ bin: 'npm', prefix: [] }`

#### Scenario: file ว่าง → pass EOL
- GIVEN buf.length === 0
- WHEN `checkEol(entries)`
- THEN errors[] ไม่มี eol-error (empty = no CR)

#### Scenario: lone CR (Mac classic) → error (EOL check จับทุก `\r` ไม่ใช่เฉพาะ `\r\n`)
- GIVEN buf มี `\r` อย่างเดียว (ไม่ตามด้วย `\n`)
- WHEN `checkEol(entries)`
- THEN errors[] มี eol-error (Buffer check จับ 0x0D ทุกตัว)

#### Scenario: file ขนาดเกิน 5 MB → skip + warn (ไม่ false-positive)
- GIVEN `statSync().size > 5 MB`
- WHEN `readTextEntries(files)`
- THEN entries[].buf === null + `console.warn('⚠ ข้าม EOL check (size > 5MB): ...')` + ไม่มี eol-error

## DAG + critical-path
```
WAVE 1 (parallel · file-ownership disjoint)
  ├─ Slice A: verify-pack-hardening  (verify-pack.mjs + verify-pack.test.mjs + import TEXT_EXT from cli.mjs)
  └─ Slice B: cli-help-wording       (cli.mjs + templates/CLAUDE.md + workflow/README.md + README.md + installer.test.mjs + CHANGELOG header)

WAVE 2 (sequential after wave 1)
  └─ Slice C: release-hygiene        (package.json version + check-test-count bump + CHANGELOG date + Migration text + docs/infra.md runbook + full-gate)
```
- Critical-path depth: 2 · Max wave width: 2 · fan-out 2 ของ wave 1 = legitimate (file-ownership disjoint + ไม่มี runtime dependency)

## Note สำหรับ agent ที่ถูก fan-out
- **Slice A** ต้องอ่าน rule.md §2 (zero-dep) + §3 (cross-platform) + rule.md §4 (EOL/packaging + KB #30) + standard.md (`checkFiles` pure fn pattern) + test.md (BL-4 testable) + **`cli.mjs:110-130` (`TEXT_EXT` + `normalizeEol`)** เพื่อให้ import ตรง
- **Slice B** ต้องอ่าน rule.md §6 (CHANGELOG — Keep a Changelog format) + cli.mjs comment convention (en-dash U+2013, codepoint preservation) + **ก่อนเขียน** grep `--update` ใน `src/tests/installer.test.mjs` ยืนยันไม่มี assertion เก่าที่ pin wording เก่า (ป้องกัน false assumption per TL suggestion #4)
- **Slice C** ต้องอ่าน rule.md §1 "release-hygiene task เป็น wave สุดท้าย" + `src/scripts/check-test-count.mjs` (สูตร MIN_PASS) + `CHANGELOG.md` format + Migration section text ที่ lock ใน design §Impact (Infra blocker #1)

## Failure mode / rollback
- **ถ้า EOL assertion false-positive ขึ้นมา**: ทั้ง `npm publish` และ CI `pack-verify` job จะแดง — revert ได้โดย revert เฉพาะบล็อก EOL check (logic แยกก้อน = isolated rollback)
- **ถ้า `npm_execpath` ไม่มีบน Windows dev ที่รัน script ตรง**: main() exit 1 + error ชัดเจน — ผู้ใช้ต้องรัน `npm run verify:pack` (false-green guard)
- **ไม่มี env bypass** โดยตั้งใจ — ไม่มี flag `SKIP_EOL_CHECK` (SA suggestion #4)

---

## Design review (panel — §4 step 6)
> 5 reviewer ขนาน (read-only) · single-writer main loop รวมความเห็น + แก้ blocker ที่นี่

### Reviewer summary
| Role | Blocker | Suggestion | integrate |
|---|---|---|---|
| SA | 6 | 5 | ทั้งหมด integrate (ดู §ด้านล่าง) |
| Tech Lead | 4 | 5 | ทั้งหมด integrate |
| QA | 3 | 8 | ทั้งหมด integrate |
| Security | 3 | 6 | ทั้งหมด integrate |
| Infra | 2 | 6 | ทั้งหมด integrate |

### Consolidated blocker → resolution

| # | Source | Blocker | Resolution ใน design นี้ |
|---|---|---|---|
| 1 | SA#1, Security#1, Infra#1 | EOL check ทำลาย purity ของ `checkFiles` + เทสเดิม 13 เคสพัง | แยก `checkEol(entries)` pure fn ใหม่ (Data model §C) + I/O อยู่ที่ `readTextEntries` (Data model §D); `checkFiles` signature คงเดิม (Data model §A) |
| 2 | TL#1, QA#2, SA#2 | `opts.platform` บน `checkFiles` = YAGNI/dead code | ตัด opts.platform ออก — Data model §A; ใช้ `getNpmCmd()` แยก (Data model §B) |
| 3 | Security#1, Infra#2, SA#2, TL#4, QA#2 | Windows npmCmd testability + CVE-2024-27980 + PATH hijack | `getNpmCmd()` ใช้ `process.execPath + npm_execpath` (Security approach — ดีกว่า `.cmd` helper เพราะปิดทั้ง CVE + hijack); ไม่มี `.cmd` ในทุก path |
| 4 | SA#3, QA#1 | Spec Scenario untestable + fixture ไม่มีจริง | ระบุ scenarios ทั้งหมดผูกกับ pure fn export + synthetic `{path, buf, ext}` (ไม่ใช้ fixture ไฟล์จริง); ไม่อ้าง `icon.png` ที่ไม่มี |
| 5 | TL#3, SA#4, QA#1 | MIN_PASS ตัวเลขผิด (46→50 vs จริง 180) | §Impact ระบุ `MIN_PASS = floor((N-5)/10)*10` = 190 (N=197) + step "อ่าน MIN_PASS ปัจจุบันจากไฟล์ก่อน bump" |
| 6 | SA#5 | Wording fix scope แคบ — มี 5 จุดไม่ใช่ 1 | §Impact ขยาย scope 5 จุด (cli.mjs:50 + templates/CLAUDE.md:49 + workflow/README.md:101 + README.md:40 + grep verify ระหว่าง BUILD) |
| 7 | SA#6, QA#3 | Slice B ไม่มี test layer (--help regression guard) | Flow §B + §Impact เพิ่ม 1 เคส spawn `--help` + assert substring ใหม่ปรากฏ/เก่าหาย |
| 8 | Security#3 | EOL check untrusted path input (traversal/symlink/secret read) | Data model §D path guards 3 ชั้น (absolute/../ /symlink) + EOL check เฉพาะ allowlist-passed set |
| 9 | TL#2, Infra#1 | CHANGELOG [0.29.1] header ownership unclear + Migration text ไม่ lock | §Slice B สร้าง header ว่าง + entries; §Slice C เติมวันที่ + Migration text ที่ lock ใน §Impact (commit/stash warning + threshold 2026-07-14) |
| 10 | Infra#2, SA#2 (suggestion) | TEXT_EXTS drift ระหว่าง verify-pack ↔ installer | Data model §E export `TEXT_EXT` จาก `cli.mjs` + import ใน `verify-pack.mjs` — DRY + single source |

### Consolidated suggestion → integrated ใน design แล้ว
- Security#2 (Buffer-level `buf.includes(0x0D)` + size cap) → §C + §D
- Security#3 (sanitize path ใน error string) → §C
- Security#4 (`--ignore-scripts` กัน prepack lifecycle) → §F
- Security#5 (CHANGELOG warning "commit/stash ก่อน") → §Impact (Migration section)
- Infra#5 (error message บอกจำนวน CR) → §C
- Infra#3 (docs/infra.md runbook) → §Impact
- Infra#4 (Windows manual verify step) → Slice C acceptance
- QA#1 (EOL edge cases: empty/lone CR/multi-byte/case sensitivity/multiple errors) → Spec delta เพิ่ม 4 Scenario (empty/lone CR/size cap/multiple errors) + Buffer-level check กัน multi-byte false-positive (0x0D ใน UTF-8 multi-byte codepoint) โดย `Buffer.includes(0x0D)` ตรง ๆ ไม่ decode
- QA#2 (RED proof / falsifiability) → Slice A ต้องมี "revert logic แล้ว assert แดง" ใน acceptance
- QA#3 (Migration executable proof) → Slice C acceptance: sandbox + intentional CRLF + renormalize + verify:pack ผ่าน
- QA#5 (binary fixture ต้องสร้าง 1×1 PNG ปลอม) → ตัด scenarios ที่ต้อง binary fixture (ใช้ synthetic buf ที่มี 0x0D แทน)
- QA#6 (Scenario "linux → npm" = CI baseline tautology) → เก็บไว้แต่ mark เป็น "smoke baseline" (unit pass = unit ทำงาน; full integration = local/CI release)
- SA#3 (error contract แค่ prefix+path ไม่ใชบทั้งประโยค) → §C ใช้ prefix `eol:` + sanitized path (count เพิ่มเข้ามาเป็น informational)
- SA#4 (failure mode/rollback) → §Failure mode
- TL#2 (Slice A self-check GOOD fixture is LF) → Slice A task file acceptance
- TL#1 (why-not-fold-B-into-C) → §Slice B เขียน rationale explicit
- TL#5 (CHANGELOG ordering B entries ก่อน C Migration) → §Slice B/C ระบุชัด

### Conflicting recommendations → resolution
- **Infra#2 vs Security#1 vs SA#2** เรื่อง npm binary selection: ทั้ง 3 แนะนำ extract helper — **Security approach (`process.execPath + npm_execpath`) ชนะ** เพราะปิดทั้ง CVE-2024-27980 (Node ≥20.12.2 reject `.cmd` ด้วย shell:false) + PATH/CWD hijack (unqualified binary name) ในที่เดียว — ไม่ต้องไปต่อสู้กับ Node patches ในอนาคต