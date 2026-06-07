# Test — installer

> วิธีเทส component installer · guideline สำหรับ VERIFY ของ topic ที่แตะ installer
> test อยู่ `src/tests/` (SOURCE layer, dev-only — ไม่ publish)

## รันเทส
- **local:** `npm test` (= `node --test` **bare**, ไม่มี path arg) → recurse discover `src/tests/*.test.mjs` ทุก node 20/22/24
- **CI:** `.github/workflows/ci.yml` matrix node [20,22,24] รัน `npm test 2>&1 | node src/scripts/check-test-count.mjs` (pass-count gate) ทุก PR/push(main) + job `pack-verify` (`npm run verify:pack`) ที่ `needs: test`

## pass-count gate (anti-false-green — troubleshooting #3)
- CI ไม่เชื่อแค่ exit 0 — `check-test-count.mjs` parse summary ของ `node --test` แล้ว **fail ถ้า:** `fail!=0` หรือ `pass<MIN_PASS (9)` หรือ `pass!=tests` (มีเคส skip/cancel)
- กัน false-green แบบ #3 (เช่น `node --test <dir>` เปล่า exit 0 แต่ไม่มีเคสรัน) — acceptance = เห็น **pass count ≥ 9** ไม่ใช่แค่ exit 0 (BL-2)
- step CI ใช้ `set -o pipefail` (`shell: bash`) ให้ pipe ยัง fail ตาม node --test

## เคสที่ test suite ครอบ (18 เคส รวม — bare discovery เจอครบ)

### `src/tests/installer.test.mjs` — 9 เคส (black-box, spawn `src/bin/cli.mjs`)
1. ติดตั้งสด — โครงครบ (`.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`, `docs/stages`, `docs/project.md`, `CLAUDE.md`, `AGENTS.md`)
2. idempotent — รัน 2 ครั้ง byte-equal + ไม่ append ซ้ำ (`stdout` มี "ข้าม")
3. `--update` ไม่ทับงานจริง — `docs/project.md`/`docs/stages/demo/` คงเดิม
4. `installRootDoc` append section + ไม่ append ซ้ำ (marker)
5. legacy 0.3–0.5.x → warn ที่ `stderr` (string ตรงจาก `cli.mjs`)
6. legacy ≤0.2.x → warn ที่ `stderr` (คนละ string จากเคส 5)
7. `seedDocs` ข้าม `[...]` (negative — ไม่มี path ใต้ `docs/` ขึ้นต้น `[`)
8. `--dry-run` ไม่เขียนไฟล์ (temp ยังว่าง)
9. **scaffold สร้างเปล่า ไม่ leak `docs/stages/<topic>`** — มี `context.md`+`achieved/.gitkeep` แต่ไม่มี topic ของ repo ต้นทาง

### `src/tests/verify-pack.test.mjs` — 9 เคส (unit, import `checkFiles` ตรง — BL-4 testable denylist)
1. payload ถูกต้อง → ไม่มี error
2. R2 denylist: `src/tests/` หลุด → จับได้ (กัน gate ลวง)
3. R2 denylist: `src/scripts/` หลุด → จับได้
4. R2 denylist: `docs/` + `.github/` หลุด → จับได้
5. denylist root dogfood: `.warnyin/`, `.claude/`, root `CLAUDE.md`/`AGENTS.md` → จับได้
6. tripwire: `settings.local.json` / `*.tgz` / `.env` → จับได้
7. R1 assertion: ขาด `src/.warnyin/workflow/` → คืน error
8. R1 assertion: ขาด `src/.claude/commands/warnyin/` → คืน error
9. allowlist: ไฟล์นอก allow (เช่น `src/.claude/skills/`) → จับได้

## verify-pack testable (BL-4)
- `checkFiles(files[]) → error[]` = pure function ใน `src/scripts/verify-pack.mjs`, `export` ออกมา → unit ป้อน file list ปลอม (มี `src/tests/` ฯลฯ) แล้ว assert จับได้ — พิสูจน์ว่า denylist **ทำงานจริง** ไม่ใช่เขียวเพราะ allowlist ปิดอยู่
- main-guard ใช้ `fileURLToPath(import.meta.url) === process.argv[1]` (ไม่ใช่ `import.meta.main` ที่ undefined บน node 20) → import จาก unit test ไม่ trigger `npm pack`

## หลักการเทส
- **black-box spawn จริง** (installer.test) — ห้าม import logic จาก `cli.mjs`; assert side-effect จริง
- assert `code===0` ก่อน + surface `stderr`; assert stream ให้ตรง; เทียบ byte ไม่ใช่ mtime
- cross-platform: `process.execPath`, `path.join`, `fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))` (ห้าม `.pathname` — Windows คืน `/D:/...` → MODULE_NOT_FOUND)
- cleanup `t.after()` ลงทะเบียนก่อน assert (ลบ temp แม้ fail)

## verify ระดับ topic (VERIFY stage)
- functional: `npm test` เขียวทั้ง suite (เห็น pass count ≥ 9)
- package cleanliness: `npm run verify:pack` (หรือ `npm pack --dry-run --json` → `checkFiles`) → `src/.warnyin/`/`src/.claude/` ติด + ไม่มี `src/tests`/`src/scripts`/`docs/`/`.github`/root dogfood รั่ว
- installer behavior: ติดตั้งจริงใน temp → ตรวจ target ได้เฉพาะ scaffold เปล่า (ไม่มี topic leak)
- CI เขียวจริงบน PR = ยืนยันบน Linux/node อื่น (ทำตอนเปิด PR/merge — outward)
- **dev Windows:** `verify-pack.mjs` รันตรงอาจ ENOENT (`troubleshooting.md` #4) → apply allowlist logic เองบน `npm pack --json` (ป้อนเข้า `checkFiles`)

## executable migration proof (เทสเอกสาร migration / CHANGELOG)
> เอกสาร migration (CHANGELOG "Migration guide") เป็น **คำสั่งที่ผู้ใช้รันจริง** — ต้องเทสแบบ executable ไม่ใช่อ่านเฉยๆ (บทเรียน `troubleshooting.md` #10)
- **วิธี:** ใน git repo จำลอง (temp) → สร้าง legacy layout (เช่น `warnyin/{workflow,template,installer,stages/<topic>}`) → **รันคำสั่งในเอกสารตามตัวอักษร** → assert: งานจริงอยู่ที่ `docs/stages/<topic>/` (ไม่หาย/ไม่ซ้อน `docs/stages/stages/`), ได้ `.warnyin/workflow`, รัน installer ซ้ำแล้ว **ไม่ warn legacy อีก**
- **ต้องเทส 2 ลำดับ:** (1) **migrate-ก่อน-install** (ลำดับแนะนำ) (2) **install-ก่อน-migrate** (สถานการณ์จริง — ผู้ใช้เห็น warning หลังรัน installer แล้ว `docs/stages/` ถูกสร้างไปก่อน) — คำสั่งต้องผ่านทั้งคู่
- **ต้องเทสทุกรุ่น legacy** ที่ `cli.mjs` ตรวจจับ (≤0.2.x, 0.3–0.5.x)
- **cross-platform / leak guard:** รันใน temp (`mktemp -d`) เท่านั้น — **ห้ามรัน `cli.mjs` ที่ cwd=repo root** (`troubleshooting.md` #6 dogfood leak); ใช้ `git mv <src>/* <dest>/` (ย้าย contents) — ไม่ใช่ `git mv <src> <dest>` (ซ้อน)
