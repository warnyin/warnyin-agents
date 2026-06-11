# Standard — setup-dogfood-reliable

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Standard กลางที่ยึด (จาก techstack)
- `docs/techstack/installer/standard.md` §"dev tooling" — `setup-dogfood.mjs` โครงเดิม (`installViaNpx || installViaPack`, `shell:true` เฉพาะ win32, resolve cli จาก tarball bin); zero-dep/ESM/cross-platform
- §"pack-verify testable (BL-4)" — **pattern export + main-guard:** `export function verifyInstalled(...)` + `if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()` (ไม่ใช่ `import.meta.main` — undefined บน node 20)
- §"Test harness กลาง" — `makeTempProject` (mkdtempSync + `t.after` cleanup), import helper ตรง (unit), `path.join` cross-platform

## 2. Pattern การเขียนโค้ดของ task นี้
- **verifyInstalled:** ใช้ `fs.existsSync(path.join(repoRoot, '.warnyin/workflow/stages/discovery.md'))` **&&** `fs.existsSync(path.join(repoRoot, '.claude/commands/warnyin'))` — `path.join` cross-platform; เลือก marker ที่อยู่ใน CORE list (install สำเร็จต้องมี)
- **success-detection:** เดิม `r.status === 0 && !shimMissing` → เพิ่ม `&& verifyInstalled(repoRoot)`; คง log/warn เดิม (`⚠ npx ... fallback`)
- **main-guard:** ย้าย top-level install flow (`const ok = ...; if(!ok)...; appendContributingPointer()`) เข้า `function main()`
- error handling: คง exit(1) เมื่อทั้งคู่ fail; verify false = ถือว่า install fail (เข้า fallback/exit)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- pattern testable: `src/scripts/verify-pack.mjs` (`export checkFiles` + main-guard) · `src/scripts/lint-md.mjs` (`export checkLinks`) — เลียนโครงเดียวกัน
- test harness: `src/tests/installer.test.mjs` (`makeTempProject`, spawn pattern) — unit ใหม่ import `verifyInstalled` ตรง (ไม่ spawn)
- `check-test-count.mjs` gate: เพิ่มเคสใหม่ → `pass===tests` ยังจริง, `MIN_PASS(9)` floor ไม่ต้อง bump

## 4. เพิ่มเติมเฉพาะ task
- unit test setup-dogfood = **ไฟล์ใหม่** `src/tests/setup-dogfood.test.mjs` (bare `node --test` discover อัตโนมัติ — ไม่ต้อง register)
