# Design (How) — แก้ setup:dogfood ดึง/รายงาน payload เก่า

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> vertical slice — fix 3 ชั้นใน 1 ไฟล์ dev-script (cohesive)

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` — `src/scripts/setup-dogfood.mjs` (dev-only, zero-dep/ESM, ไม่ publish)
- **แนวทาง:** fix ที่ root cause 3 ชั้น (trigger npx · cache-bust · false-success detection) — defense-in-depth; **implement LR2** (`docs/techstack/installer/rule.md` §dev tooling) ที่ note ไว้แต่ยังไม่ทำ (verifyInstalled active ตั้งแต่ release ที่ 2)
- **lens SA:** verifyInstalled เป็น **pure fn (export)** = contract ที่ unit ผูก; เปลี่ยน truth table ต้องคง backward-compat ของ scenario อื่น (drift/degrade/transition<0.17.0)

## 2. Vertical slices
| # | Slice | ตัดผ่าน layer | → task |
|---|---|---|---|
| 1 | **fix-dogfood-stale-detection** — setup:dogfood ดึง payload ใหม่จริง (cache-bust + npx bin) + รายงาน fail ถ้าได้ payload เก่า (verifyInstalled active) + unit | logic (verifyInstalled/semverGte) · install-path (npx/pack spawn) · test (unit + black-box) | `tasks/fix-dogfood-stale-detection/` |

> **1 task** — fix 3 ชั้นอยู่ใน `setup-dogfood.mjs` ไฟล์เดียว (cohesive); แตกหลาย task = worktree แก้ไฟล์เดียวชนกัน + fix เกี่ยวพัน (cache-bust ทำให้ detection มีของใหม่ให้ verify) → 1 slice end-to-end เหมาะกว่า

## 3. Data model / schema
- ไม่มี DB — constant + pure fn:
  - `STAMP_MIN_VERSION = '0.17.0'` (release แรกที่มี stamp writer)
  - `semverGte(a, b) → boolean` (pure, zero-dep — numeric tuple compare)

## 4. Interface / contract
- **`semverGte(a, b)`** (export ใหม่) — `'0.18.0' ≥ '0.17.0'` → true; split `.` → numeric compare ทีละ field (major→minor→patch); input ไม่ใช่ semver → จัดการ defensively (NaN→0)
- **`verifyInstalled(root, expected)`** (truth table ใหม่ — เฉพาะ branch stamp===null เปลี่ยน; **ลำดับ guard ตรงโครงโค้ดจริง L96/L99/L106/L113** — ห้าม flat if-chain):
  ```
  1. markers ไม่ครบ (L96)        → false                          (เดิม)
  2. !expected (L99)             → true  (degrade marker-only)    (เดิม — ★ ต้องอยู่ก่อน readStamp กัน offline false-fail)
  3. stamp = readStamp (L105)
     3a. stamp === null (L106)   → ★ branch ใหม่อยู่ "ภายใน" guard นี้ (mutually exclusive กับ drift):
          · semverGte(expected, '0.17.0') === true  → false (active — install ผิด/payload เก่า)   ★ เปลี่ยน
          · มิฉะนั้น (expected < '0.17.0' หรือ expected ไม่ใช่ semver) → true (transition/degrade-safe)  ★ B2
     3b. stamp !== null:
          · stamp.trim() == expected.trim() (L118) → true         (เดิม)
          · stamp.trim() != expected.trim() (L113) → false (drift) (เดิม — drift ไม่แตะ active เพราะอยู่คนละ guard 3a/3b)
  ```
  > **B1 (precedence):** active-branch แทรก**ภายใน** `if (stamp === null)` ที่ L106 — ไม่ใช่ flat table; drift (3b) กับ active (3a) แยกด้วย `stamp===null` guard อยู่แล้ว (ไม่บังกัน)
  > **B2 (non-semver expected):** `semverGte` คืน true เฉพาะ expected เป็น semver จริง ≥ 0.17.0; expected ที่ parse ไม่ออก (NaN→0 ทาง a) → **คืน false จาก semverGte → ตกเข้า transition (true)** = degrade-safe (ไม่ block) — กัน expected แปลก (`'latest'`) ทำ false-fail; expected ที่ไม่ใช่ semver จริง ๆ ถูกกรองที่ L99 อยู่แล้ว (parseNpmViewVersion คืน null→degrade)
- **`installViaNpx`** — `spawnSync('npx', ['--yes', '-p', spec, 'warnyin-agents', '--update'], ...)` (explicit `-p` + bin name แก้ scope-strip mismatch)
- **`installViaPack`** — 2 fix:
  1. npm pack เพิ่ม `env: {...process.env, npm_config_prefer_online: 'true'}` **ที่ spawnSync ตัว `npm pack` (L156 options)** — symmetric กับ npx (L133); เสริม pin-exact ที่มีอยู่ (L150) — **pin-exact = primary, prefer-online = เสริม** (LR1, Infra S2)
  2. **version-check ที่ source** (ชั้น A primary guard ของ pack) — แยก **pure fn `checkTarballVersion(extractDir, expected) → boolean`** (export, testable ด้วย temp dir + fake package.json — pattern เดียวกับ verifyInstalled รับ path param; QA B2): อ่าน `package.json` **ที่ parse อยู่แล้ว L190** (reuse ไม่อ่านซ้ำ — SA S3/TL S3) → เทียบ `pj.version` กับ expected แบบ **exact-equality (trim สองฝั่ง, ไม่ใช่ semverGte** — pin-exact → version ต้องเป๊ะ; Security S1) → ≠ → `return false` (ไม่รัน --update)
     - **expected falsy (npm view ล้มเหลว) → ข้าม version-check ที่ source** (คง degrade path เดิม — ไม่งั้น `'x' !== null` false-fail ทุกครั้งที่ offline; TL S4/QA S4)

## 5. Flow
```
main(): EXPECTED = npm view version (เช่น 0.18.0)
  │
  ▼
installViaNpx(EXPECTED): npx -p PKG@0.18.0 warnyin-agents --update   ← ชั้น 1 (explicit bin)
  │ fail (shim/verify) → fallback
  ▼
installViaPack(EXPECTED):
  npm pack PKG@0.18.0 (prefer-online)        ← ชั้น A (cache-bust)
  → extract → check package.json version == EXPECTED?  ← ชั้น A (verify source)
       │ ≠ → return false (payload เก่า — ไม่รัน --update)
  → node cli --update (cwd=repoRoot)
  → verifyInstalled(repoRoot, EXPECTED)       ← ชั้น B (stamp ขาด + ≥0.17.0 → false)
  │
  ▼
ok=false → exit 1 (loud, ไม่ false-success)
```

## 6. ผลกระทบต่อระบบเดิม
- **★ `cli.mjs` main-guard (เพิ่มใน VERIFY):** DESIGN เดิมสมมติ "cli.mjs ทำงานถูก / ห้ามแตะ" — **VERIFY พิสูจน์ว่าผิด** (main-guard พังกับ symlink → npx end-user + dogfood install เงียบ). แก้เป็น `isEntrypoint()` (realpath ทั้งสองฝั่ง + fallback) — backward-compat: `resolveMode` export เดิมยังใช้ได้, import-guard เดิม (ไม่ trigger main ตอน import) ยังคง; เคส install เดิมใน `installer.test.mjs` (spawn ผ่าน real repo path) ยังผ่าน (realpath ของ real path = ตัวเอง)
- `verifyInstalled` pure fn — **ยืนยันจาก test เดิม (panel SA S1/TL/QA S3): ไม่มี unit เดิมตัวใดต้อง flip** — เคส transition เดิม (`setup-dogfood.test.mjs` L87-96) ใช้ expected `'0.16.0'` (<0.17.0) → ยัง true; ไม่มีเคสเดิม expected≥0.17.0+stamp ขาด → การเปลี่ยนเป็น **ADD ล้วน** (เพิ่มเคส active ใหม่) ไม่ใช่ modify เคสเดิม
- **regression baseline:** spec `installer-version-stamp` scenario "stamp ขาด → transition" = MODIFIED (ดู §9); scenario drift/degrade/CRLF คงเดิม
- backward-compat: transition window (<0.17.0) ยังรองรับ — แต่ practically latest ≥0.18.0 เสมอ → active path ทำงาน

## 7. Dependency ระหว่าง slice/task
```
fix-dogfood-stale-detection (1 task — ไม่มี dependency)
```
- **critical-path depth:** 1 · **max wave width:** 1
- **เหตุผล 1 task (ไม่ใช่ chain เผลอ):** fix 3 ชั้น + test แตะ `setup-dogfood.mjs` + test ไฟล์เดียวกัน (cohesive); แตกย่อย = worktree conflict (ไฟล์เดียว) + 3 ชั้นเกี่ยวพัน (cache-bust สร้างของใหม่ให้ detection verify) → decouple ไม่คุ้ม/ไม่ได้ตามแกนไฟล์

## 8. Test strategy ระดับ design
- **unit (`verifyInstalled` pure — ADD เคสใหม่ครบ truth table):**
  - stamp ขาด + expected `'0.18.0'` (≥0.17.0) → **false** (active — เคสหลักของ bug)
  - **★ boundary (QA B1): stamp ขาด + expected `'0.17.0'` พอดี → false** (พิสูจน์ใช้ `>=` ไม่ใช่ `>`)
  - stamp ขาด + expected `'0.16.0'` (<0.17.0) → **true** (transition คงไว้ — LR2 bootstrapping; เคสเดิม L92 ยังผ่าน)
  - **★ B2: stamp ขาด + expected non-semver-but-truthy (`'latest'`) → true** (degrade-safe ไม่ block)
  - stamp ขาด + expected falsy → true (degrade คงไว้)
  - drift/equal/markers เดิม → คงผ่าน (regression)
- **unit `semverGte`:** `0.18.0≥0.17.0`→T · `0.17.0≥0.17.0`→T (boundary) · `0.16.9≥0.17.0`→F · `1.0.0≥0.17.0`→T · field-wise (`0.17.0` vs `0.9.0`→T) · **edge defensive (QA S2/TL S5):** `'0.17'`(field สั้น) · `'garbage'`(NaN→0→F) · `'0.17.0-rc.1'`(prerelease → parseInt ตัด suffix ไม่ throw)
- **★ unit `checkTarballVersion` (ชั้น A — executable, QA B2):** temp dir + เขียน fake `package.json` → `checkTarballVersion(dir, expected)`: version==expected→true · version≠expected→false (detect payload เก่า) · expected falsy→true (ข้าม/degrade) — **ไม่ใช่ source-grep** (รอบ 3 ต้อง executable เพราะ #21 พิสูจน์ false-success เกิดที่ behavior จริง)
- **wire-proof (structural — เสริม ไม่ใช่หลัก):** assert source `installViaNpx` args = `['--yes','-p',spec,'warnyin-agents','--update']` (regex แม่น กัน false-pass — TL S1), `installViaPack` npm pack spawn options มี `npm_config_prefer_online`
- **behavioral (เลื่อนไป VERIFY — Infra S3/QA B2):** npx explicit-bin resolve จริง + setup:dogfood end-to-end (ดึง payload ใหม่ลง sandbox) — structural ไม่พอ (root cause พลาด 2 รอบ)
- **full-gate:** `node --test | check-test-count` (pass เพิ่มจาก 85) + verify-pack + lint-md เขียว

## 9. Spec delta (เทียบ docs/features/installer-version-stamp/spec.md)
> feature ที่แตะ = `installer-version-stamp` (setup:dogfood requirement)

### MODIFIED
#### Requirement: setup:dogfood จับ version drift ด้วย version stamp (transition-safe) (→ feature: installer-version-stamp)
ปรับ scenario "stamp ขาด" ให้ **active เต็มตัวเมื่อ expected ≥ first-stamp-version (LR2)** — แทน blanket transition

- **Scenario: stamp ขาด + expected ≥ first-stamp-version (0.17.0) → ไม่ผ่าน (active)**
  GIVEN root มี CORE markers แต่ไม่มี stamp · `expected` ≥ `0.17.0` (release ที่มี stamp writer)
  WHEN `verifyInstalled(root, '<expected≥0.17.0>')`
  THEN คืน **false** + warn ระบุ payload ไม่มี stamp ทั้งที่ควรมี (install ผิด/payload เก่า) → trigger fallback/exit ≠ 0
  _(เดิม: คืน true + warn "ข้าม version check" — เปลี่ยนเพราะ latest ผ่าน 0.17.0 แล้ว stamp ขาด = drift ไม่ใช่ transition)_

- **Scenario: stamp ขาด + expected < first-stamp-version (0.17.0) → ผ่าน (transition คงไว้)**
  GIVEN root มี CORE markers แต่ไม่มี stamp · `expected` < `0.17.0` (รุ่นก่อน stamp writer)
  WHEN `verifyInstalled(root, '<expected<0.17.0>')`
  THEN คืน true + warn transition-safe (bootstrapping window สำหรับ pre-0.17.0)

### ADDED
#### Requirement: setup:dogfood ดึง payload ใหม่ทน stale-cache + npx bin resolution (→ feature: installer-version-stamp)

- **Scenario: npx path ใช้ explicit bin name (กัน scope-strip mismatch)**
  GIVEN `installViaNpx` ติดตั้งผ่าน npx
  WHEN spawn npx
  THEN ใช้ `npx --yes -p <pkg>@<v> warnyin-agents --update` (ระบุ `-p` + bin `warnyin-agents` — เพราะ bin name ≠ scope-stripped `agents`)

- **Scenario: fallback pack ดึง payload ใหม่ + verify version ที่ source**
  GIVEN `installViaPack` ทำงาน
  WHEN `npm pack`
  THEN ตั้ง `npm_config_prefer_online` (symmetric กับ npx path) + เทียบ `package.json` version ของ tarball ที่ extract กับ expected ก่อนรัน `--update`; ไม่ตรง → ไม่รายงานสำเร็จ

#### Requirement: installer entrypoint resolve ถูกแม้ถูกเรียกผ่าน symlink (→ feature: installer-version-stamp)
> ★ เพิ่มใน VERIFY (root cause ชั้น 0) — ก่อนแก้ installer เงียบ exit 0 ไม่ติดตั้งเมื่อรันผ่าน symlink

- **Scenario: cli ถูกเรียกผ่าน symlink path → main() ทำงาน (ติดตั้ง + เขียน stamp)**
  GIVEN `cli.mjs` ถูก execute โดยที่ `process.argv[1]` เป็น **symlink path** (npx รัน bin ผ่าน `node_modules/.bin/<name>` symlink; หรือ tarball extract ลง `os.tmpdir()` ที่เป็น symlink บน macOS) ซึ่ง realpath ชี้กลับมาที่ตัว module เอง
  WHEN รัน `node <symlink-to-cli.mjs> --update`
  THEN main-guard เทียบด้วย **realpath ทั้งสองฝั่ง** → match → `main()` ถูกเรียก → ติดตั้ง CORE + เขียน `.warnyin/.warnyin-version` (ไม่เงียบ exit 0 ไม่ทำอะไร)

- **Scenario: cli ถูก import (ไม่ใช่ execute) → main() ไม่ทำงาน (คงเดิม)**
  GIVEN unit test `import { resolveMode, isEntrypoint } from cli.mjs` — `argv[1]` เป็น test runner ไม่ใช่ cli.mjs
  WHEN module ถูก import
  THEN `isEntrypoint` คืน false → ไม่ trigger `main()` (กัน side-effect ตอน import — คง backward compat)

---

## 10. Design review (panel — 2026-06-13)
fan-out 5 reviewer ขนาน (read-only)

### ผ่าน
- **Infra** — ไม่มี blocker: LR1/LR2 implement ถูก (active ตั้งแต่ release 2 = expected≥0.17.0); zero-dep/cross-platform คง (semverGte เขียนเอง); ไม่กระทบ packaging (dev-only); ไม่มี `docs/infra.md` → promote ความรู้เข้า `techstack/installer/rule.md` ตอน SHIP
- **Security** — ไม่มี blocker: fix เป็น **security-positive** (fail-loud เมื่อ payload identity ไม่ตรง → contributor ไม่ execute payload เก่า); spawn array args injection-safe; prefer-online ไม่ defeat pin-exact

### Blocker (แก้ครบแล้ว)
| # | จาก | ปัญหา | แก้ |
|---|---|---|---|
| B1 | SA | truth table §4 ไม่ระบุ active-branch อยู่**ใต้ `stamp===null` guard** (อาจ implement flat if-chain → drift บัง active) | §4 remap ตรงโครงโค้ด L96/99/106/113 — active (3a) ใน `stamp===null`, drift (3b) คนละ guard |
| B2 | SA | non-semver-but-truthy expected (`'latest'`) → semverGte NaN→0 → false → active(block) = ขัด degrade-graceful | §4 + §8: non-semver → semverGte false → ตกเข้า **transition (true)** degrade-safe |
| B1(QA) | QA | boundary `expected=='0.17.0'` พอดี ไม่มี integration test (พิสูจน์ `>=` ไม่ใช่ `>`) | §8 เพิ่มเคส `verifyInstalled(root,'0.17.0')`+stamp ขาด→false |
| B2(QA) | QA | pack version-compare (ชั้น A — เคสหลัก bug) verify ด้วย source-grep เท่านั้น — #21 พิสูจน์ false-success เกิดที่ behavior จริง | §4/§8 แยก **pure fn `checkTarballVersion`** + executable test (temp dir + fake package.json) |

### Suggestion (รับเข้า design)
- Security S1 + Infra S2: version-check ที่ source = **exact-equality** (pin-exact → เป๊ะ) ไม่ใช่ semverGte; pin-exact primary, prefer-online เสริม → §4
- TL S3 + SA S3: `checkTarballVersion` reuse `package.json` parse เดิม (L190) ไม่อ่านซ้ำ → §4
- TL S4 + QA S4: version-check expected falsy → ข้าม (คง degrade offline) → §4
- TL S1: wire-proof regex แม่น (args array เป๊ะ) กัน false-pass → §8
- TL/QA: §6 wording — ADD ล้วน ไม่มี test เดิม flip → §6 แก้
- Infra S3 + QA B2: npx explicit-bin + e2e behavioral proof เลื่อนไป VERIFY (structural ไม่พอ) → §8
- **Model tier (TL):** `balanced` (Sonnet) พอ — logic ตื้น (semver tuple compare), bootstrap-sensitivity guard ด้วย unit + main-guard เดิม
