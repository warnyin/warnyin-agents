# Test plan — fix setup:dogfood stale-payload (+ root cause ชั้น 0: symlink main-guard)

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> component: `installer` · guideline: `docs/techstack/installer/test.md`
> regression baseline: `docs/features/installer-version-stamp/spec.md`

## 1. จุดประสงค์ที่ต้อง verify
1. **fix เดิม 3 ชั้น** (B detection / A cache-bust+version-check / 1 npx bin) ทำงานถูก + ไม่ false-success
2. **★ root cause ชั้น 0 (พบใน VERIFY): `cli.mjs` main-guard symlink** — installer ต้องทำงานเมื่อรันผ่าน symlink (npx end-user + dogfood)
3. regression: behavior เดิมของ `installer-version-stamp` + install path เดิม ไม่พัง

## 2. วิธีเทส (executable — ไม่ source-grep สำหรับ logic; #21/ชั้น0 พิสูจน์ false-success/false-green เกิดที่ behavior จริง)

### A. unit — pure fn (`node --test`, import ตรง, main-guard กัน side-effect)
- `verifyInstalled` truth table (active 0.18.0→F, boundary 0.17.0→F, transition 0.16.0→T, non-semver→T, drift/degrade/CRLF เดิม)
- `semverGte` (5 well-formed + 3 edge), `checkTarballVersion` (match/mismatch/falsy/CRLF)
- **★ `isEntrypoint(argv1, metaUrl, realpath)` truth table (cross-platform — inject realpath):**
  - argv1 = realpath ตรง module → **true** (direct run)
  - argv1 = symlink path แต่ realpath→module → **true** (เคสหลัก bug — npx `.bin`/symlinked tmpdir)
  - argv1 = คนละไฟล์ (import) → **false**
  - argv1 undefined → **false**
  - realpath throw → fallback `path.resolve` (เท่ากัน→T, ต่าง→F)

### B. black-box (`spawnSync` cli.mjs จริง — assert side-effect)
- **★ รัน cli.mjs ผ่าน symlink** (`symlinkSync(cliPath, link)` → `node <link> --project --update`) → exit 0 + เขียน `.warnyin/.warnyin-version` ตรง version (จับ root cause ชั้น 0; Windows ไม่มีสิทธิ์ symlink → log + ไม่ skip, CI ubuntu ครอบ)
- install เดิม 18-21 (version stamp) + 1-17 (install/global/dry-run) — regression

### C. end-to-end behavioral (manual proof — real env)
- **fix proof (local payload):** `npm pack` (local, มี fix) → extract ลง `os.tmpdir()` (symlink macOS) → รัน cli ผ่าน path symlink → ติดตั้งสำเร็จ 89 ไฟล์ + stamp เขียน → `verifyInstalled(target, version)` = true
- **fail-loud proof (registry):** `npm run setup:dogfood` ผ่าน registry 0.18.0 (cli.mjs เก่า ยังไม่ publish fix) → fail-loud exit 1 (ไม่ false-success) — **ถูกต้องจนกว่า publish รุ่นถัดไป (self-referential — ดู §4)**

### D. full-gate
- `node --test | check-test-count` (pass=tests, ≥9) + `verify:pack` + `lint:md` เขียว

## 3. guideline ใหม่ (เสนอ merge เข้า `docs/techstack/installer/test.md` ตอน SHIP)

### verify ESM entrypoint / main-guard (รันผ่าน symlink)
> bug critical: ESM `import.meta.url` = realpath เสมอ แต่ `process.argv[1]` = path ตามผู้เรียก (symlink ไม่ resolve) → main-guard ที่เทียบด้วย `path.resolve(argv[1])` พังเงียบเมื่อรันผ่าน symlink (npx `.bin`, setup:dogfood extract ลง symlinked `os.tmpdir`)
- **pure-fn `isEntrypoint(argv1, metaUrl, realpath)` (export + injectable realpath):** unit cross-platform โดยไม่พึ่ง symlink จริง — truth table: realpath ตรง→T, symlink-resolve→module→T (เคสหลัก), คนละไฟล์→F, undefined→F, realpath-throw→fallback `path.resolve`
- **black-box ต้องมีเคส spawn cli ผ่าน symlink** — spawn ผ่าน real repo path อย่างเดียว = false-green (จับ bug นี้ไม่ได้ เพราะ real path realpath=ตัวเอง match เสมอ); `symlinkSync(cliPath, link)` → `node <link>` → assert install สำเร็จ + เขียน stamp
- **RED ก่อน fix:** revert main-guard เป็น `path.resolve` → black-box + symlink-unit ต้อง FAIL (ยืนยัน test จับ regression จริง ไม่ false-green)

### self-referential e2e (setup:dogfood ดึง release ที่ fix ยังไม่ publish)
> fix ที่อยู่ใน `cli.mjs`/installer แต่ setup:dogfood ดึง release จาก registry → e2e ผ่าน registry จะ **สมบูรณ์เมื่อ publish รุ่นถัดไป** (เหมือน transition snapshot ของ stamp drift)
- VERIFY พิสูจน์ **logic ถูก** ด้วย **local payload (fixed)** ที่ pack เอง (ไม่รอ publish) + black-box symlink
- บันทึก snapshot ปัจจุบัน: registry `@latest` = 0.18.0 (cli.mjs เก่า ยังไม่มี fix) → setup:dogfood = fail-loud (ถูกต้อง) — **ห้ามเคลม setup:dogfood ผ่าน registry สำเร็จก่อน publish รุ่นที่มี fix**

## 4. หมายเหตุ publish
fix ชั้น 0 (`cli.mjs`) จะมีผลกับ npx end-user + setup:dogfood **หลัง publish รุ่นถัดไป** (เช่น v0.18.1). ก่อน publish: ผู้ใช้ปลายทาง npx ยังกระทบ bug นี้ (release ปัจจุบันบน registry ยังเก่า) — SHIP ควร bump + publish เพื่อปิด critical
