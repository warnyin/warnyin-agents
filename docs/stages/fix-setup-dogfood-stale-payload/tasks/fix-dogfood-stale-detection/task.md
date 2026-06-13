# Task — fix-dogfood-stale-detection

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `fix-dogfood-stale-detection` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (`src/scripts/setup-dogfood.mjs` — dev-only) |
| **Model tier** | `balanced` _(logic ตื้น: semver tuple compare; bootstrap-sensitive guard ด้วย unit + main-guard เดิม — panel TL ยืนยัน Sonnet พอ)_ |
| **สถานะ** | `build เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
แก้ `setup:dogfood` ให้ **ดึง payload ใหม่จริง** (ทน stale-cache + npx bin) + **รายงาน fail ถ้าได้ payload เก่า** (ไม่ false-success) — fix 3 ชั้น end-to-end + unit ครบ. ตรง LR2 (`techstack/installer/rule.md`: active ตั้งแต่ release ที่ 2)

## 2. Dependency
- ต้องทำหลัง: — (task เดียว ไม่มี dependency)
- ปลดล็อก: — (node เดียว)
- output: setup-dogfood.mjs ที่ sync ถูก + unit ครบ → VERIFY (e2e behavioral)

## 3. Sub-tasks
> ทุกชั้นแตะ `src/scripts/setup-dogfood.mjs` ไฟล์เดียว — ทำตามลำดับ, ใช้ design.md §4 เป็น canonical

- [x] 1. **ชั้น B — `verifyInstalled` + `semverGte`** — เพิ่ม const `STAMP_MIN_VERSION = '0.17.0'` + export pure `semverGte(a,b)` (numeric tuple compare, NaN→0 defensive); แก้ branch `stamp===null` (L106-110) ตาม truth table design §4: `semverGte(expected,'0.17.0')===true → false (active)`; มิฉะนั้น → true (transition/degrade-safe). **คง guard order L96/99/106/113** (markers→!expected→stamp===null→drift)
- [x] 2. **ชั้น A — `installViaPack` cache-bust + version-check** — (ก) เพิ่ม `env: {...process.env, npm_config_prefer_online:'true'}` ใน spawnSync ของ `npm pack` (L156 options); (ข) export pure `checkTarballVersion(extractDir, expected) → boolean`: reuse `pj` ที่ parse อยู่แล้ว (L190) → เทียบ `pj.version` กับ expected แบบ **exact-equality (trim สองฝั่ง, ไม่ใช่ semverGte)**; expected falsy → return true (ข้าม/degrade); เรียก `checkTarballVersion` ก่อน `--update` (L204) → false → `return false` (ไม่รัน --update)
- [x] 3. **ชั้น 1 — `installViaNpx` explicit bin** — เปลี่ยน spawn args (L128) เป็น `['--yes','-p',spec,'warnyin-agents','--update']` (ระบุ `-p` + bin name แก้ scope-strip mismatch); คง `shell:isWin` + shim-detect เดิม
- [x] 4. **unit (`src/tests/setup-dogfood.test.mjs`)** — ADD เคสตาม design §8: verifyInstalled (active 0.18.0→F, boundary 0.17.0→F, transition 0.16.0→T, non-semver 'latest'→T); semverGte (5 well-formed + 3 edge); checkTarballVersion (temp dir + fake package.json: match→T, mismatch→F, falsy→T); wire-proof (npx args array, pack prefer-online)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/scripts/setup-dogfood.mjs` — verifyInstalled (L91-119), installViaNpx (L122-146), installViaPack (L149-213) + 2 export ใหม่ (semverGte, checkTarballVersion) + const STAMP_MIN_VERSION
- `src/tests/setup-dogfood.test.mjs` — ADD เคส (ไม่แก้เคสเดิม — panel ยืนยันไม่มี flip)
- **ห้ามแตะ:** `cli.mjs` (ทำงานถูก), packaging, ผู้ใช้ปลายทาง path

## 5. Acceptance criteria
- [x] `verifyInstalled`: stamp ขาด + expected≥0.17.0 → false; expected `'0.17.0'` พอดี → false (boundary `>=`); expected<0.17.0 → true; non-semver/falsy → true (degrade-safe); guard order คงเดิม (offline degrade ไม่ false-fail)
- [x] `semverGte` + `checkTarballVersion` export + pure (รับ param) + unit ครอบ (รวม edge defensive)
- [x] `installViaPack`: npm pack มี `prefer-online`; `checkTarballVersion` เรียกก่อน --update (mismatch → return false ไม่รัน)
- [x] `installViaNpx`: args = `['--yes','-p',spec,'warnyin-agents','--update']`
- [x] **regression:** เคสเดิมใน test ผ่านครบ (drift/degrade/CRLF/transition<0.17.0/wire-proof เดิม)
- [x] full-gate เขียว: `node --test | check-test-count` pass=103 (เพิ่มจาก 85) + verify-pack 86 ไฟล์ + lint-md 106 ไฟล์
- [x] ผ่าน `spec.md` test-flow + ทำตาม `rule.md`/`standard.md`

## 6. อ้างอิง
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical (truth table + interface): `../../design.md` §4/§5/§8 · Design review: §10
