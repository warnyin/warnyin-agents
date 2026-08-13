# Standard — verify-pack-hardening

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack)
> อ้างอิง `docs/techstack/installer/standard.md` — ข้อไหนเกี่ยวกับ task นี้
- **pack-verify (`src/scripts/verify-pack.mjs`)**: pure fn `checkFiles(files)→errors[]` + main-guard (`argv[1] === fileURLToPath(...)`) → import จาก unit ไม่ trigger npm pack — signature ต้องคงเดิม (purity contract)
- **dev tooling (`src/scripts/`)**: zero-dep/ESM; `os.tmpdir()`/`path.join`; spawn array args ห้าม `shell:true` ยกเว้น npx win32 (.cmd) — **rule นี้ apply เหมือนกัน: `execFileSync(process.execPath, [...])` ไม่ shell:true แม้แต่ Windows**

## 2. Pattern การเขียนโค้ดของ task นี้
- **โครงสร้าง/naming:**
  - `getNpmCmd(platform = process.platform)` export — camelCase, default arg สำหรับ runtime + inject ใน test
  - `checkEol(entries)` export — pure fn รับ entries[] (ไม่ I/O)
  - `readTextEntries(files, opts = {})` export — I/O อยู่ที่ขอบ, injectable `readFile`/`root`/`maxBytes` (pattern เดียวกับ `isEntrypoint(argv1, metaUrl, realpath = fs.realpathSync)` ใน `cli.mjs:502`)
  - `main()` = thin wrapper เรียก helper ทั้ง 3 ตัว
- **error handling:**
  - error prefix ตาม category: `eol:` (ใหม่), `path:` (ใหม่), denylist/allowlist/R1/R2 (เดิม)
  - **error string ห้าม echo absolute path ของเครื่อง** — ใช้ POSIX path จาก `npm pack --json` (repo-relative) เท่านั้น
  - **sanitize path** ก่อนใส่ error string: `JSON.stringify(p)` หรือ replace `[\x00-\x1f\x7f]` เป็น `?` (กัน terminal escape injection)
  - I/O ล้ม (ENOENT/EACCES) → entries.buf=null + ไม่ throw (gate robust; dev ไม่ติด false-green)
- **การจัดการ state/data:**
  - pure fn คงสภาพ input ไม่ mutate
  - main-guard: `if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()` (pattern เดิม)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **TEXT_EXT single source** (ใหม่): import จาก `src/bin/cli.mjs` — `export const TEXT_EXT = new Set([...])` (`.md`/`.mjs`/`.js`/`.cjs`/`.json`/`.txt`/`.yml`/`.yaml`/`.css`/`.html`); `normalizeEol` ใช้ set เดียวกัน — DRY
- **`isEntrypoint` pattern**: injectable dependency ผ่าน default param + override ใน test (pure-fn testable)
- **`node:fs` lstatSync**: `isSymbolicLink()` check — ห้าม `statSync` (จะ follow symlink)
- **path guards**: `path.isAbsolute()`, `path.split('/').includes('..')`, `path.resolve()` — ใช้ built-in เท่านั้น (zero-dep)
- **Buffer-level check**: `buf.includes(0x0D)` แทน `text.includes('\r')` — ไม่ decode UTF-8 + กัน multi-byte false-positive + เร็วกว่า
- **`--ignore-scripts`**: append ต่อ array args ของ `execFileSync` (กัน `npm pack` รัน `prepack`/`prepare` lifecycle แม้ `--dry-run`)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
> pattern ใหม่ที่ task นี้แนะนำ — ถ้าควรเป็นมาตรฐานกลาง ให้ note ใน `rule.md` (รอ SHIP อัปเดต standard กลาง)
- **error category prefix convention** — error string ทุก category มี prefix (`eol:`, `path:`, `denylist:` ...) → assertion test grep prefix ได้ + ผู้ใช้อ่านง่าย (note ใน rule.md เพื่อ promote ใน release ถัดไป)
- **Buffer-level EOL check** — ไม่ decode UTF-8 ก่อนเช็ค (เร็วกว่า + กัน multi-byte) — note ใน rule.md
- **size cap pattern** (5 MB + warn) — เปิดทางให้ future extension ปรับได้ผ่าน `opts.maxBytes` — note ใน rule.md
- **importable TEXT_EXT** — single source of truth ระหว่าง dev-tooling ↔ installer — note ใน rule.md