# Standard — dogfood-bootstrap

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern โค้ดที่ setup scripts ต้องยึด — **อิง** `docs/techstack/installer/standard.md` (helper/harness pattern)

## 1. Standard กลางที่ยึด (จาก techstack installer)
- **path ทุกที่ใช้ `path.join`** (cross-platform) — ห้าม `/` literal; หา root ด้วย `fileURLToPath(import.meta.url)` (ESM, ห้าม `__dirname`)
- **spawn array args ห้าม `shell:true`** (ยกเว้น npx บน win32 — เหตุผล §2) — เทียบ test harness `runCli` ที่ spawn array args ไม่ shell
- **ข้อความ log ภาษาไทย** ตามสไตล์ `bin/cli.mjs` (`+` สร้าง · `↻` อัปเดต · `±` ต่อท้าย section)
- **zero-dependency** — ใช้เฉพาะ built-in `node:*` (`node:child_process`, `node:fs`, `node:path`, `node:os`, `node:url`)
- **idempotent** (installer rule) — รันซ้ำต้องไม่พัง/ไม่ append ซ้ำ; ใช้ marker check ก่อน append (เทียบ `installRootDoc` ที่เช็ค `warnyin/workflow/stages/`)

## 2. Pattern การเขียนโค้ดของ task นี้
- **โครงสร้าง:** `src/scripts/setup-dogfood.mjs`, `src/scripts/setup-sandbox.mjs` — node script ESM standalone (dev-only, ไม่อยู่ใน `files` allowlist → ไม่ publish)
- **repoRoot resolve:** `path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')` → จาก `src/scripts/` ขึ้น 2 ชั้น = repo root
- **`setup-dogfood.mjs`:**
  - `spawnSync('npx', ['--yes', '@warnyin/agents@latest'], { cwd: repoRoot, stdio: 'inherit', shell: process.platform === 'win32' })`
    > npx = `.cmd` บน Windows → execFile/spawn ENOENT ถ้าไม่ shell (เทียบ troubleshooting #4) — `shell:true` เฉพาะ win32 คือ "หนีไม่พ้น shell" สำหรับ npx เท่านั้น ไม่มี user input → ปลอดภัย (Security S1)
  - append pointer **idempotent**: อ่าน root `CLAUDE.md` → ถ้า `!content.includes('CONTRIBUTING.md')` ค่อย `appendFileSync` บรรทัด pointer (Tech Lead B2)
  - **comment policy review diff** (Security S1): คอมเมนต์เตือน dev ให้ review diff ของ root `.warnyin`/`.claude`/`CLAUDE.md` ก่อนเปิด session (payload ถูก agent execute ต่อ)
- **`setup-sandbox.mjs`:**
  - `const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wy-sandbox-'))` — สุ่ม+atomic, **ห้าม hardcode `/tmp`** (Security S3/Infra S2 — กัน Windows พัง + TOCTOU)
  - `spawnSync(process.execPath, [path.join(repoRoot, 'src', 'bin', 'cli.mjs')], { cwd: dir, stdio: 'inherit' })` — install v-next จาก src/ (array args, ไม่ shell)
  - print path sandbox ให้ dev เปิด session ลอง `/warnyin:*`
- **error handling:** เช็ค `r.status !== 0` แล้ว `process.exit(r.status ?? 1)` + surface stderr/ข้อความไทย

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **DRY กับ installer pattern:** ทั้งสอง script เลียน pattern `fileURLToPath(import.meta.url)` + `path.join` + spawn array args จาก `bin/cli.mjs`/`tests/installer.test.mjs` — ไม่คิด pattern path/spawn ใหม่
- **`os.tmpdir()` + `mkdtempSync`** = pattern เดียวกับ `makeTempProject` ใน test harness (`docs/techstack/installer/standard.md`)
- **ห้าม import logic จาก `cli.mjs`** (มันรัน side-effect ตอน import) — setup-sandbox เรียกผ่าน spawn เท่านั้น

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- **`.gitignore` root-anchored:** ทุก dogfood pattern นำหน้า `/` — ไม่ใช่ pattern ลอย ๆ (กัน match `src/`); จัดกลุ่มใต้คอมเมนต์ "dogfood installed จาก release (regen ด้วย npm run setup:dogfood)"
- **`docs/infra.md` seed เนื้อพอกัน collision** — runbook transition (ลำดับ git mv → bootstrap, design §5.3) + กฎ cross-platform npm scripts ที่ Infra แนะนำ; **เนื้อเต็ม promote ตอน SHIP** (note ใน rule.md §2)
- pattern ใหม่ที่เสนอเป็นมาตรฐานกลาง ("npm scripts ต้อง cross-platform") → note ใน `rule.md` §2 (รอ SHIP)
