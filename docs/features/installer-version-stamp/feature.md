# Feature — Installer version stamp + drift-aware dogfood verify

> ความรู้ถาวรระดับ feature · promote จาก topic `setup-dogfood-version-check` (achieved 2026-06-12)
> payload มี version identity → `setup:dogfood` จับ version drift ได้ (ปิด false-green รอบ 2 / issue #3)

## คืออะไร
ให้ payload ที่ installer ติดตั้งมี **version identity** (`.warnyin/.warnyin-version`) แล้วใช้ identity นั้น verify ความสดของ dogfood env: `npm run setup:dogfood` เทียบ **ค่า version** ที่ติดตั้งจริงกับ latest บน registry — ไม่ใช่แค่เช็คว่า marker มีอยู่ (ซึ่งเวอร์ชันเก่าก็ผ่าน → false-green). แก้ root cause ที่ payload root ไม่เคยมี version identity เลย

## องค์ประกอบ
| # | กลไก | layer | ทำอะไร |
|---|---|---|---|
| 1 | **version stamp writer** | `cli.mjs` `writeVersionStamp()` | เขียน `.warnyin/.warnyin-version` (= `package.json` version) ลง target ทุก install/`--update` ทั้ง project + global; **unconditional `writeFileSync`** (ไม่ skip-if-equal — กัน stamp ค้างค่าเก่า); เคารพ `--dry-run` |
| 2 | **version-aware verify** | `setup-dogfood.mjs` `verifyInstalled(root, expected?)` | เทียบ stamp กับ expected ตาม truth table transition-safe (ดู spec); falsy expected → degrade marker-only; stamp ขาด → transition true; stamp ≠ expected → **false** (จับ drift) |
| 3 | **expected resolver** | `setup-dogfood.mjs` `resolveExpectedVersion()` + `parseNpmViewVersion()` (pure) | query `npm view @warnyin/agents version` (timeout 15s) → parse บรรทัด semver จริง (ทน notice/warning ปน stdout); fail → `null` (degrade + warn loud) |
| 4 | **stale-cache defeat** | `setup-dogfood.mjs` install path | **pin exact version** (`@<ver>` แทน `@latest` — เลี่ยง dist-tag cache mapping เก่า = ตัวหลัก) + env `npm_config_prefer_online` (เสริม) ทั้ง `installViaNpx` + `installViaPack` |

## ทำงานยังไง (flow)
```
setup:dogfood → resolveExpectedVersion() (npm view) → EXPECTED
  → npx --yes @warnyin/agents@EXPECTED --update (prefer-online)   [cli เขียน stamp]
  → verifyInstalled(root, EXPECTED):  markers + (stamp vs EXPECTED)
       stamp = EXPECTED → ok · stamp ≠ EXPECTED → false → fallback installViaPack → ยังไม่ตรง → exit 1
```
- **install (project/global):** หลัง copyTree CORE → `writeVersionStamp()` → payload มี identity
- **drift จับได้:** stamp present & ค่าเก่า ≠ latest → verify false → ไม่รายงาน "เสร็จ" ลวง

## ขอบเขต / ข้อจำกัด (การตัดสินใจเชิงสถาปัตยกรรม)
- **transition-safe (bootstrapping):** feature verify ด้วย artifact ที่ตัวเองสร้าง (stamp) → รุ่นเก่าที่ยังไม่มี stamp writer **ต้องไม่ false-fail** → stamp ขาด = degrade marker-only; drift-guard **active เต็มตัวตั้งแต่ release ที่ 2** ที่มี stamp (release แรกพึ่ง pin-exact + prefer-online กัน stale)
- **degrade ยอมรับ marker-only เมื่อ `npm view` fail** (offline = install เองก็ fail) — บังคับ **warn loud** เพื่อผู้ใช้ไม่ surprise
- **stamp = install-time artifact** — `cli.mjs` สร้างตอนรัน ไม่อยู่ใน `src/` → ไม่ขึ้น tarball (allowlist granular); repo เอง root gitignored (ไม่ track), end-user `.warnyin/` track ได้ (diff เห็น bump, ไม่มี 3-way conflict เพราะ single-line overwrite)
- **network:** `setup:dogfood` ต้องถึง npm registry (`npm view`) เพิ่มจาก `tar`; zero-dep คงเดิม (external process ไม่ใช่ dep)

## ไฟล์ที่เกี่ยวข้อง
- `src/bin/cli.mjs` (`readPkgVersion`, `writeVersionStamp`, wire 2 branch) · `src/tests/installer.test.mjs` (black-box stamp) · `src/tests/verify-pack.test.mjs` (stamp-deny gate)
- `src/scripts/setup-dogfood.mjs` (`resolveExpectedVersion`, `parseNpmViewVersion`, `readStamp`, `verifyInstalled(root,expected)`, wire npx+pack) · `src/tests/setup-dogfood.test.mjs` (truth table + parse + wire-proof)
- rule กลาง: `docs/techstack/installer/rule.md` (LR1 install-verification, LR2 bootstrapping transition-safe); env: `docs/infra.md` (`npm_config_prefer_online`, network-to-registry)
- คู่กับ feature/topic เดิม: topic `fix-setup-dogfood` (TS-1 — verify side-effect ไม่เชื่อ exit 0); feature `global-install` (install mode)
