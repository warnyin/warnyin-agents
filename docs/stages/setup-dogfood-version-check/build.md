# Build report — setup-dogfood-version-check

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`
> build branch: `build/setup-dogfood-version-check` (จาก `main`)

## 1. สรุป
- **DAG:** 1 wave · 2 task ขนาน (width 2, decouple ผ่าน Stamp contract §4A) · worktree isolation
- **ผลรวม:** ✅ ทั้ง 2 task `passed` · full build/test gate ผ่าน · **ไม่มี failed/skipped**
- Model tier: ทั้งคู่ `balanced` (→ sonnet)

## 2. ผลต่อ task

| Task | สถานะ | ไฟล์ source ที่แก้ | test |
|---|---|---|---|
| `installer-version-stamp` | ✅ passed | `src/bin/cli.mjs`, `src/tests/installer.test.mjs`, `src/tests/verify-pack.test.mjs` | +5 เคส (a–d black-box + stamp-deny gate) |
| `setup-dogfood-verify` | ✅ passed | `src/scripts/setup-dogfood.mjs`, `src/tests/setup-dogfood.test.mjs` | +11 เคส (truth table 5 แถว + CRLF + wire-proof + readStamp + parseNpmViewVersion×3) |

ร่วม: `CHANGELOG.md` (Added=stamp, Fixed=drift-guard) — **merge ด้วยมือตอน integrate** (2 worktree แตะทับ); `tasks/*/task.md` (checklist + status `เสร็จ`)

### installer-version-stamp
- `readPkgVersion()` (อ่าน `pkgRoot/../package.json`) + `writeVersionStamp()` (unconditional `writeFileSync`, เคารพ DRY, stats/log) wire หลัง `copyTree` CORE ทั้ง branch project + global
- verify-pack testable: เคส `checkFiles(['.warnyin/.warnyin-version'])` → คืน error (gate จับ stamp ที่หลุด)

### setup-dogfood-verify
- `parseNpmViewVersion(stdout)` (pure, ทน noise) + `resolveExpectedVersion()` (npm view, timeout 15s) + `readStamp(root)` + `verifyInstalled(root, expected?)` ตาม truth table §4B (transition-safe, normalize CRLF สองฝั่ง)
- pin exact version + env `npm_config_prefer_online` + ส่ง `expected` เข้า `verifyInstalled` ทั้ง `installViaNpx` + `installViaPack` (wire-proof)
- `export { readStamp, parseNpmViewVersion }` เพิ่ม (unit import ตรง)

## 3. Integration notes
- **scoped checkout** เฉพาะ source 5 ไฟล์จาก worktree branch (เลี่ยง topic-docs copy / KB#11); `task.md` checkout จาก worktree (build branch ของ topic นี้เอง — checklist ติ๊กแล้ว) แล้ว normalize status
- **CHANGELOG conflict** (2 task แตะ `## [Unreleased]`) → main loop merge ด้วยมือ (Added + Fixed อยู่ร่วมกัน) — ไม่ใช่ structural conflict
- ไม่มี merge conflict อื่น

## 4. Full build & test gate (blocking — ผ่าน)
- **`npm test`:** ✅ **85 pass / 0 fail** (69 เดิม + 16 ใหม่; pass===tests, anti-false-green ผ่าน)
- **`lint:md`:** ✅ ผ่าน (104 ไฟล์, 48 ลิงก์)
- **packaging (executable):** ✅ `npm pack --dry-run --json` → stamp **ไม่หลุด** ขึ้น tarball + payload ครบ (83 files, ไม่มี leak tests/docs/root-dogfood)
- **`npm run verify:pack`:** ⚠ ENOENT บน Windows dev (pre-existing TS#4 — ไม่ใช่ regression); logic ครอบด้วย unit gate `checkFiles()` + executable `npm pack` proof ข้างบน · CI ubuntu รันได้ปกติ

## 5. Defer / รอ stage ถัดไป
- **integration end-to-end** (`npm run setup:dogfood` จริง) = manual proof **รอ publish release ที่มี stamp** (transition window §6) — VERIFY บันทึก snapshot รอบที่เริ่มจับ drift ได้จริง (ห้ามเคลมจับได้ทันที release นี้)
- **`docs/infra.md`** (env `npm_config_prefer_online` + network-to-registry requirement + stamp artifact note) → SHIP
- **learned-rule** (version identity + verify เทียบค่า / external-version query parse-tolerant + degrade) → SHIP (`tasks/*/rule.md §2`)

## 6. Troubleshooting
ดู `./troubleshooting.md` — TS-1 (verify:pack ENOENT Windows = KB#4 ซ้ำ), TS-2 (degrade warn = expected behavior)

---
**Gate BUILD ผ่านครบ** → เสนอเข้า VERIFY ด้วย `/warnyin:verify setup-dogfood-version-check`
