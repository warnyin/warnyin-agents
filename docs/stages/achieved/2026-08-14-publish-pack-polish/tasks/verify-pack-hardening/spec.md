# Spec — verify-pack-hardening

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`data` (verify-pack EOL gate) + `infra` (cross-platform npm binary) — ไม่ใช่ API/UX

---

## 2. API SPEC
N/A — dev-tooling script (`src/scripts/verify-pack.mjs` + `src/tests/verify-pack.test.mjs`), ไม่ใช่ REST API

## 3. UX/UI SPEC
N/A — ไม่มี UI surface

## 4. Data-flow
```
npm run verify:pack (CLI)
  └─ node src/scripts/verify-pack.mjs
       ├─ main() → getNpmCmd(process.platform)
       │     ├─ win32 + npm_execpath → { bin: process.execPath, prefix: [npm_execpath] }
       │     ├─ win32 + no npm_execpath → null (exit 1 + error)
       │     └─ darwin/linux → { bin: 'npm', prefix: [] }
       │
       ├─ execFileSync(bin, [...prefix, 'pack', '--dry-run', '--json', '--ignore-scripts'])
       │     → JSON.parse → files[] (POSIX path)
       │
       ├─ checkFiles(files) → existingErrors[]    (signature เดิม — purity contract คง)
       │
       ├─ filter allowed = files ผ่าน allowlist
       ├─ readTextEntries(allowed, opts)
       │     ├─ path.isAbsolute(p) → error หมวด `path:`
       │     ├─ p.split('/').includes('..') → error หมวด `path:`
       │     ├─ fs.lstatSync(abs).isSymbolicLink() → error หมวด `path:`
       │     ├─ stat.size > 5 MB → buf=null + console.warn
       │     └─ readFile(abs) → entries[{path, buf, ext}]
       │
       ├─ checkEol(entries) → eolErrors[]
       │     ├─ ext ∉ TEXT_EXT → skip
       │     ├─ buf.includes(0x0D) → error prefix `eol: ${count} ครั้ง (${sanitize(path)})`
       │     └─ empty buf → no error
       │
       └─ exit 1 ถ้า [...existingErrors, ...pathErrors, ...eolErrors].length > 0
```

## 5. User-flow
- **dev (mac/linux/CI ubuntu)**: `npm run verify:pack` → exit 0 (pass) หรือ exit 1 (fail)
- **dev Windows (≥Node 20.12.2)**: `npm run verify:pack` → spawn `node npm-cli.js pack ...` (ไม่ผ่าน `.cmd`) — exit 0/1 เหมือน mac/linux
- **dev รัน `node src/scripts/verify-pack.mjs` ตรง (Windows)**: exit 1 + error "ต้องรันผ่าน `npm run verify:pack`" (npm_execpath ไม่ตั้ง)
- **maintainer**: gate fail → ดู error category (`path:` / `eol:` / `denylist` / `allowlist`) → รู้วิธีแก้จาก error string

## 6. Persona
- **dev/contributor** — รัน `verify:pack` ก่อน publish / commit
- **CI** — `pack-verify` job (`.github/workflows/ci.yml:29-38`, node 22 ubuntu)
- **maintainer** — debug gate fail ครั้งแรกที่เจอ EOL/path error category ใหม่

## 7. Test-flow
> ทดสอบ/ยืนยันความถูกต้องยังไง (เคสที่ต้องผ่าน, edge case)

### `getNpmCmd` (pure fn, 4 เคส)
- [ ] `getNpmCmd('darwin')` → `{ bin: 'npm', prefix: [] }`
- [ ] `getNpmCmd('linux')` → `{ bin: 'npm', prefix: [] }`
- [ ] `getNpmCmd('win32')` + `npm_execpath='/abs/npm-cli.js'` → `{ bin: process.execPath, prefix: ['/abs/npm-cli.js'] }`
- [ ] `getNpmCmd('win32')` + no `npm_execpath` → `null`

### `checkEol` (pure fn, 4 เคส)
- [ ] entries = `[{path:'src/a.md', buf: Buffer.from('LF only'), ext:'.md'}]` → errors=[]
- [ ] entries = `[{path:'src/a.md', buf: Buffer.from('a\r\nb\r\nc\r\nd'), ext:'.md'}]` → errors=['eol: ไฟล์ text มี CR 3 ครั้ง (src/a.md)']
- [ ] entries = `[{path:'icon.png', buf: Buffer.from([0xFF, 0x0D, 0xD8]), ext:'.png'}]` → errors=[] (ext skip)
- [ ] entries = `[{path:'empty.md', buf: Buffer.alloc(0), ext:'.md'}]` → errors=[] (empty = no CR)

### `readTextEntries` (I/O + guards, 5 เคส)
- [ ] files=['src/a.md'] + readFile=fake + root=tmp → 1 entry (buf populated) — happy path
- [ ] files=['/etc/passwd'] → errors มี `path: absolute path (/etc/passwd)` (ไม่ read)
- [ ] files=['../../../etc/passwd'] → errors มี `path: มี segment .. (../../../etc/passwd)` (ไม่ read)
- [ ] files=['symlink.md'] + lstat = symlink → errors มี `path: symlink (symlink.md)` (ไม่ read)
- [ ] files=['huge.md'] + stat.size > 5 MB → entries.buf=null + console.warn ไม่ error

### Integration: existing 13 เคส checkFiles + 4 new เคส = 17+ เคส ผ่าน (regression guard)
- [ ] existing payload GOOD (LF) → checkFiles(GOOD) === [] (signature เดิมผ่าน)

### RED proof (falsifiability — rule §5)
- [ ] revert EOL check → เคสใหม่ 4 ตัว `checkEol` fail (revert แล้ว assert แดง)
- [ ] revert `getNpmCmd` → เคส `getNpmCmd('win32')` fail
- [ ] restore → เขียวกลับ