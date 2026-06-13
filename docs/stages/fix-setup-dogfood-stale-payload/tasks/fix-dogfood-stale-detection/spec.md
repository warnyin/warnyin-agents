# Spec — fix-dogfood-stale-detection

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`logic` / `dev-tooling` — แก้ pure fn + spawn logic ใน dev script (ไม่มี runtime/API/UI)

## 4. Data-flow
`npm view` → EXPECTED → installViaNpx (npx -p bin) ‖ fallback installViaPack (pack prefer-online → checkTarballVersion → --update) → verifyInstalled(root, EXPECTED) → ok/exit

## 7. Test-flow
> unit ใน `src/tests/setup-dogfood.test.mjs` (pattern เดิม: import pure fn + temp dir; main-guard กัน import trigger) — **executable ไม่ใช่ source-grep** สำหรับ logic (panel QA B2: #21 พิสูจน์ false-success เกิดที่ behavior จริง)

### A. `verifyInstalled(root, expected)` — truth table (temp dir + fake markers/stamp)
- [ ] markers ครบ + stamp ขาด + expected `'0.18.0'` → **false** (active — เคสหลัก bug)
- [ ] markers ครบ + stamp ขาด + expected `'0.17.0'` (boundary) → **false** (พิสูจน์ `>=` ไม่ใช่ `>`)
- [ ] markers ครบ + stamp ขาด + expected `'0.16.0'` → **true** (transition <0.17.0 — เคสเดิม L92 ยังผ่าน)
- [ ] markers ครบ + stamp ขาด + expected `'latest'` (non-semver-but-truthy) → **true** (degrade-safe, ไม่ block)
- [ ] markers ครบ + expected falsy (`null`/`''`) → true (degrade — order: ตรวจ !expected ก่อน readStamp)
- [ ] regression เดิม: drift (stamp≠expected→false) · equal (→true) · markers ไม่ครบ (→false) · CRLF normalize → คงผ่าน

### B. `semverGte(a, b)` — pure
- [ ] `'0.18.0','0.17.0'`→T · `'0.17.0','0.17.0'`→T (boundary) · `'0.16.9','0.17.0'`→F · `'1.0.0','0.17.0'`→T · field-wise `'0.17.0','0.9.0'`→T
- [ ] edge defensive (ไม่ throw): `'0.17','0.17.0'` (field สั้น) · `'garbage','0.17.0'`→F (NaN→0) · `'0.17.0-rc.1','0.17.0'` (prerelease → parseInt ตัด suffix)

### C. `checkTarballVersion(extractDir, expected)` — pure (temp dir + fake package.json)
- [ ] เขียน `package.json {version:'0.18.0'}` + expected `'0.18.0'` → **true** (match exact)
- [ ] version `'0.16.0'` + expected `'0.18.0'` → **false** (detect payload เก่า — เคสหลักชั้น A)
- [ ] expected falsy → **true** (ข้าม version-check, degrade offline)
- [ ] version มี CRLF/whitespace → normalize trim สองฝั่ง → match

### D. wire-proof (structural — เสริม)
- [ ] source `installViaNpx` spawn args = `['--yes','-p',spec,'warnyin-agents','--update']` (regex แม่น array)
- [ ] source `installViaPack` npm pack spawnSync options มี `npm_config_prefer_online`

### E. full-gate
- [ ] `node --test | node src/scripts/check-test-count.mjs` → pass เพิ่มจาก 85 + verify-pack + lint-md เขียว
