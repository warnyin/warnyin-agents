# Design (How) — setup-dogfood-version-check

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end
> **tier:** `standard` · lens: `.warnyin/workflow/roles/sa.md`

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` — `src/bin/cli.mjs` (installer สาธารณะ) + `src/scripts/setup-dogfood.mjs` (dev-tooling, ไม่ publish) — zero-dep, ESM, cross-platform
- **แนวทางหลัก:** ให้ payload มี **version identity** แล้ว verify เทียบ version จริง (ไม่ใช่แค่ marker มีอยู่)
  1. **install-side (cli.mjs)** — เขียน stamp `.warnyin/.warnyin-version` (= `package.json` version) ตอน install/`--update` ทั้ง mode project + global → payload ตรวจ drift ได้
  2. **verify-side (setup-dogfood.mjs)** — query latest จาก registry (`npm view`) → **pin exact version + `--prefer-online`** (กัน stale npx cache) → `verifyInstalled(root, expected)` เทียบ stamp กับ expected
  3. **transition-safe** — stamp *ขาด* (payload ก่อน feature นี้) → degrade marker-only; stamp *มีแต่ค่าไม่ตรง* → fail (drift จริง) — กัน dogfood พังช่วง release แรกที่ registry ยังไม่มี stamp

## 2. Vertical slices
> หนึ่ง slice = หนึ่งหน่วยคุณค่า end-to-end → จะกลายเป็น 1 task · **decouple ด้วย contract** (§4) → ขนานได้

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | Model tier | → task |
|---|---|---|---|---|
| 1 | **installer version stamp** — cli.mjs เขียน `.warnyin/.warnyin-version` ตอน install/`--update` (project+global, เคารพ DRY, idempotent) + black-box test + CHANGELOG(Added) | logic (cli helper) · test (installer.test black-box) · doc (CHANGELOG) | `balanced` | `tasks/installer-version-stamp/` |
| 2 | **setup-dogfood version-aware verify** — query latest + pin exact + `--prefer-online` + `verifyInstalled(root,expected)` เทียบ stamp (transition-safe) + unit test + CHANGELOG(Fixed) | logic (script fix) · test (unit `verifyInstalled`) · doc (CHANGELOG) | `balanced` | `tasks/setup-dogfood-verify/` |

## 3. Data model / schema
- **N/A entity** — ไม่มี state/DB. **Artifact ใหม่:** version stamp file (ดู contract §4)

## 4. Interface / contract

### 4A. ★ Stamp contract (จุด decouple ของ slice 1 ↔ slice 2)
- **path:** `<root>/.warnyin/.warnyin-version` (relative `path.join('.warnyin', '.warnyin-version')` — อยู่ใน `.warnyin/` root, นอก `workflow/`/`template/` เพราะไม่ใช่ playbook content)
- **format:** plain text บรรทัดเดียว = exact semver string + trailing `\n` (เช่น `0.16.0\n`) — zero-dep
- **producer:** slice 1 (`cli.mjs writeVersionStamp`) เขียนตอน install/`--update`
  - **★ unconditional overwrite (panel SA-B1/B2):** เขียนทับด้วย version ปัจจุบัน**เสมอ** (`writeFileSync` ตรง — ไม่ skip-if-equal/skip-if-exists แบบ `copyTree`) — กัน stamp **ค้างค่าเก่า** จากครั้งก่อน (ถ้า cli ตัวที่ spawn เป็นเวอร์ชันเก่าที่ไม่มี writer มันจะไม่เขียน → stamp เก่าค้าง → verify อ่านค่าผิด). "idempotent" = output byte-equal เมื่อ version เท่าเดิม **ไม่ใช่** skip write
- **consumer:** slice 2 (`setup-dogfood.mjs` → `verifyInstalled` → `readStamp`) อ่านเทียบ expected
  - **★ normalize สองฝั่ง (panel QA-B2):** `readStamp(root) → string|null` = `readFileSync(...).trim()`; คืน `null` เมื่อไฟล์ไม่มี/อ่านไม่ได้/**trim แล้วเป็น empty** (ไฟล์มีแต่ whitespace). การเทียบใน §4B เป็น exact-equality หลัง trim ทั้งสองฝั่ง → กัน CRLF (Windows `\r\n`) / trailing-space false-drift
- **decouple:** slice 2 ทดสอบได้โดยสร้าง stamp ปลอมเองตาม contract นี้ (ไม่รอ slice 1 runtime); integration จริงพิสูจน์ที่ full-gate/VERIFY

### 4B. `verifyInstalled(root, expected?) → boolean` (truth table — transition-safe)
> เทียบเป็น exact-equality หลัง `.trim()` ทั้งสองฝั่ง (§4A normalize) · `expected` **falsy** (`undefined`/`null`/`''`) = degrade ทุกตัว

| เงื่อนไข | คืน | warn ที่ผู้ใช้เห็น |
|---|---|---|
| CORE markers ไม่ครบ | `false` | (caller log "install ไม่สำเร็จ → fallback") — เดิม |
| markers ครบ · `expected` **falsy** (degrade) | `true` | `⚠ ข้าม version check (npm view ไม่ได้ผล) — verify แบบ marker-only` |
| markers ครบ · `expected` set · **stamp ขาด** | `true` | `⚠ payload ไม่มี version stamp (เวอร์ชันก่อน feature) — ข้าม version check` |
| markers ครบ · `expected` set · stamp = expected | `true` | — (ผ่านปกติ) |
| markers ครบ · `expected` set · **stamp ≠ expected** | `false` | `⚠ version drift: ติดตั้ง <stamp> แต่คาด <expected> (stale cache?) → fallback` |

- **★ รับ param `root`** คงเดิม (unit ส่ง temp dir ได้); เพิ่ม `expected` เป็น **optional** (เดิม `verifyInstalled(repoRoot)` ยังเรียกได้ → marker-only — unit เดิม 3 เคสไม่พัง)
- helper `readStamp(root) → string|null` แยกออกมา (testable; ดู §4A normalize) — `null` ตกแถว "stamp ขาด" (true/transition) ไม่ใช่ "stamp ≠ expected"
- **★ degrade ยอมรับ false-green ได้ by design (panel SA-B1):** เมื่อ `npm view` fail (network) → marker-only — known limitation ที่ยอมรับเพราะ offline = install เองก็ fail (proposal §5); **บังคับ warn loud** เพื่อให้ผู้ใช้รู้ว่า version ไม่ถูกตรวจรอบนั้น (ไม่เงียบ)
- warn อยู่ที่ **caller** (`installViaNpx`/`installViaPack`) หลังเห็นผล + เหตุผล; `verifyInstalled` คืน bool บริสุทธิ์ (testable) แต่คืนผ่าน helper ที่ caller log message ตามเคสได้ (เช่น คืน `{ok, reason}` ภายใน หรือ caller เรียก `readStamp` ซ้ำเพื่อ log — impl เลือกได้ตราบที่ message §4B ครบ)

### 4C. install args (setup-dogfood)
- `resolveExpectedVersion() → string|null` — `spawnSync(npm, ['view', PKG_NAME, 'version'], { timeout: 15000, ... })` (`npm = isWin ? 'npm.cmd' : 'npm'`)
  - **★ parse semver จริง ไม่ใช่ `.trim()` ทื่อ (panel QA-B2):** `npm view` บาง config อาจ print notice/warning ปนใน stdout → ดึง **บรรทัดสุดท้ายที่เป็น version** : `stdout.trim().split(/\r?\n/).pop()?.trim()` แล้ว sanity-check ว่า match `/^\d+\.\d+\.\d+/` (semver); ไม่ผ่าน/empty/exit≠0/timeout → `null` (degrade)
  - **★ timeout 15s** กัน registry ค้าง hang (panel TL-S3)
- npx spec: `expected ? '@warnyin/agents@'+expected : '@warnyin/agents@latest'` — **pin exact = ตัวหลักที่ defeat cache** (ขอ version ตรง เลี่ยง dist-tag `latest`→version mapping เก่าใน npx cache); **`npm_config_prefer_online: 'true'` = เสริม** revalidate metadata (panel TL-S2 — wording comment ห้าม misleading ว่า prefer-online เป็นตัวหลัก)
- pack spec เดียวกัน; cli args เดิม `['--update']`
- **★ ส่ง `expected` เข้า `verifyInstalled` ทั้ง 2 call site (panel Infra-S3/QA-B1):** ทั้ง `installViaNpx` (เดิม L63) **และ** `installViaPack` (เดิม L126 ที่ตอนนี้ยัง marker-only) — Windows trigger pack-fallback บ่อยสุด = path ที่ต้อง version-check มากสุด ห้ามลืม

## 5. Flow
```
main():
  EXPECTED = resolveExpectedVersion()                 ← npm view; null = degrade
  ok = installViaNpx(EXPECTED) || installViaPack(EXPECTED)
  if (!ok) exit(1)
  appendContributingPointer()

installViaNpx(expected):
  spec = expected ? `${PKG_NAME}@${expected}` : `${PKG_NAME}@latest`
  spawn npx --yes <spec> --update   (env: npm_config_prefer_online=true, shell:isWin)
  if (status===0 && !shimMissing && verifyInstalled(repoRoot, expected)) return true
  return false                                         ← drift/false-green/shim → fallback

installViaPack(expected):
  spec เดียวกัน → npm pack → extract → node <cli> --update
  return run.status===0 && verifyInstalled(repoRoot, expected)
```
```
cli.mjs main() (ทั้ง project + global, หลัง copyTree CORE — insertion: หลัง for-CORE บรรทัด ~274 global / ~280 project):
  writeVersionStamp():
    ver = readPkgVersion()                             ← JSON.parse(pkgRoot/../package.json).version
    dest = path.join(target, '.warnyin', '.warnyin-version')
    if (!DRY) mkdirSync(dirname,{recursive}) ; writeFileSync(dest, ver+'\n')   ← unconditional (ไม่ byte-equal skip แบบ copyTree)
    stats[exists?'updated':'created']++ ; log '+/↻ .warnyin/.warnyin-version'  (exists = log icon เท่านั้น ไม่ใช่ skip)
```
- **data-flow:** registry latest → (pin) cli `--update` → `copyTree` + `writeVersionStamp` → root CORE+stamp; `verifyInstalled` อ่าน root stamp เทียบ expected

## 6. ผลกระทบต่อระบบเดิม
- **`cli.mjs` (installer สาธารณะ):** เพิ่ม 1 ไฟล์ stamp ทุก install/`--update` ทั้ง 2 mode — **user-facing → ต้อง CHANGELOG (Added)**; backward-compatible (ไม่แตะ copyTree/seedDocs/scaffold/install mode)
- **`verifyInstalled` signature:** เพิ่ม optional `expected` — เดิมเรียก `(repoRoot)` ยังได้ (marker-only) → unit test เดิม 3 เคสไม่พัง
- **`verify-pack`:** stamp เป็น **install-time artifact ที่ target** (runtime) — `cli.mjs` สร้างตอนรัน ไม่ได้อยู่ใน `src/` → **ไม่ขึ้น tarball** (`files` allowlist เป็น **granular** — `src/bin`, `src/.warnyin`, `src/.claude/{commands,agents,skills}`, `src/AGENTS.md`, README/CHANGELOG/LICENSE — **ไม่ใช่ `src/**` ทั้งก้อน**; ไฟล์ที่ generate ตอน install จึงไม่อยู่ใน allowlist) → **ไม่ต้องแก้ `checkFiles`**
  - **★ "ยืนยัน" = testable assert ไม่ใช่ false-green ซ้อน (panel Infra-S1/QA):** stamp ไม่เคยอยู่ใน `src/` → รัน `npm pack --dry-run` ปกติจะไม่มี stamp อยู่แล้ว → "ผ่าน" โดยไม่ได้พิสูจน์ gate. การยืนยันที่ถูก = `verify-pack.test.mjs` ป้อน `'.warnyin/.warnyin-version'` (root-level) ลง file list ปลอม → assert `checkFiles` คืน error (นอก allowlist + ตรง deny `.warnyin/` root) — พิสูจน์ว่า gate **จะจับ** ถ้าวันใด stamp หลุด (ไม่ต้องแก้ `checkFiles` โค้ดจริง)
- **`.gitignore`:** ที่ repo เอง root `/.warnyin/` gitignored → stamp ไม่ track (ดี — dogfood); ที่ end-user repo `.warnyin/` ไม่ ignore → stamp track ได้ (ดี — diff เห็น bump). **ไม่มี merge-conflict risk เชิงโครงสร้าง** (stamp = single-line เขียนทับเสมอ ไม่ append/3-way) — มีแค่ text-conflict 1 บรรทัดถ้า user 2 คน bump คนละเวอร์ชัน (แก้ง่าย) → ไม่ต้องแก้ gitignore; CHANGELOG (Added) ต้องระบุ path ชัดให้ผู้ใช้ npm ไม่ surprise
- **★ Transition/bootstrapping — known limitation (panel TL-S1/QA-B1, ยอมรับ):** release ที่ publish ตอนนี้ (registry `@latest` ≤0.16.0) **ยังไม่มี stamp writer**:
  1. **release แรกที่มี stamp** — ถ้า npx cache ยัง resolve tarball เก่า (ไม่มี writer) → stamp ขาด → `verifyInstalled` คืน `true (transition)` → **ยังจับ drift รอบนี้ไม่ได้**; ตัวลด root cause ของ window นี้คือ **pin-exact + prefer-online** (defeat stale cache) ไม่ใช่ตัว verify
  2. **release ที่ 2 เป็นต้นไป** — registry latest มี stamp แล้ว → drift = "stamp present & ค่าเก่า ≠ latest" → `false` ✓ จับได้
  - **→ VERIFY/SHIP ต้องบันทึก snapshot ตามจริง** ว่ารอบไหนเริ่มจับ drift ได้ (ห้ามเคลม "จับ false-green ได้ทันที release นี้")

## 7. Dependency ระหว่าง slice/task
```
task-1 (installer-version-stamp) ─┐
                                  ├─ (decouple ผ่าน Stamp contract §4A) → integration ที่ full-gate
task-2 (setup-dogfood-verify) ────┘
```
- **critical-path depth (longest chain):** 1
- **max wave width:** 2 (ขนานได้)
- **เหตุผล:** 2 task แตะ **คนละไฟล์ source** (`cli.mjs` vs `setup-dogfood.mjs`) + คนละ test file → independent; coupling เดียวคือ runtime (slice2 อ่าน stamp ที่ slice1 เขียน) → ใช้ **contract-first decouple** (DAG-width toolkit §3.2): ทั้งคู่พึ่ง Stamp contract §4A (path+format) ไม่ใช่ runtime ของกัน → slice 2 ทดสอบด้วย stamp ปลอมตาม contract; integration จริง (end-to-end `setup:dogfood`) พิสูจน์ที่ full-gate/VERIFY (จริงๆ ต้องรอ publish — manual/defer ตาม topic เดิม §8)

## 8. Test strategy ระดับ design
- **slice 1 (black-box, `installer.test.mjs` — reuse harness `runCli`/`globalEnv`):**
  - (a) project install → `.warnyin/.warnyin-version` มี + เนื้อหา = repo `package.json` version จริง (อ่านสด ไม่ hardcode) **และ** match `/^\d+\.\d+\.\d+/` (กัน false-green เคส version = `"undefined"` แล้วสองฝั่งเท่ากัน — panel QA-S3)
  - (b) `--dry-run` → ไม่มีไฟล์ stamp เขียนจริง
  - (c) `--update` ซ้ำ → **byte-equal ของไฟล์** (ไม่ assert stdout marker "ข้าม" — stamp ไม่ผ่าน skip path, นับ updated เสมอ — panel QA-S4/TL-S4)
  - (d) **global mode** (`globalEnv(home)`) → `home/.warnyin/.warnyin-version` ตรงเวอร์ชัน (panel TL-S4d — scenario §9 มี global)
- **slice 2 (unit, `setup-dogfood.test.mjs`):** ต่อยอด 3 เคสเดิม (marker-only ยังผ่าน — backward compat) + เคสใหม่ตาม truth table §4B:
  - stamp = expected → true · **stamp ≠ expected → false** (เคสแก่น: `verifyInstalled(tempRoot,'9.9.9')` เมื่อ stamp ไฟล์ = `0.1.0\n` → false — mirror เคส partial→false เดิม, พิสูจน์ drift-guard ทำงาน) · stamp ขาด + expected set → true (transition) · expected `null`/`''` → true (degrade — panel SA-S2/QA-S1)
  - **★ CRLF normalize:** stamp `"0.16.0\r\n"` + expected `"0.16.0"` → true (กัน Windows false-drift — panel QA-B2)
  - **★ wire-proof (structural, panel QA-B1/Infra-S3):** grep/assert ว่า `installViaNpx` **และ** `installViaPack` ส่ง `expected` เข้า `verifyInstalled` ทั้ง 2 call site (กัน regression ที่ pack-path เผลอ marker-only → drift-guard ตายเงียบบน Windows)
  - **★ resolveExpectedVersion parse:** stdout `"npm warn ...\n0.16.0\n"` → คืน `0.16.0` (ดึงบรรทัด semver จริง — panel QA-B2); stdout empty/exit≠0 → `null`
- **regression:** `npm test` ทั้ง suite เขียว (pass-count ≥ 9, ไม่มี assertion เดิมพัง) · `lint:md` (CHANGELOG link)
- **package cleanliness:** `verify-pack.test.mjs` ป้อน `.warnyin/.warnyin-version` (root) → assert `checkFiles` คืน error (gate จับได้ ถ้าหลุด — panel Infra-S1); `npm run verify:pack` ผ่าน (stamp ไม่อยู่ใน tarball file list)
- **★ Acceptance ของ topic ตอน VERIFY (panel QA-B1/S2 — falsifiable):** = { unit truth table ครบ 5 แถว + CRLF + wire-proof 2-path + slice-1 black-box (a–d) + verify-pack testable + `lint:md` + `npm test` pass-count ≥ 9 }; **executable end-to-end (`npm run setup:dogfood` จริง) = manual proof รอ release ที่มี stamp — ไม่ใช่ gate ของ topic** (defer ตาม precedent topic เดิม §8 / `installer/test.md`). VERIFY บันทึก snapshot ตามจริง (ดู §6 transition)

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> version stamp เป็น **observable install behavior ใหม่** (user-facing) → มี delta; setup-dogfood เป็น dev-tooling (ไม่มี feature spec ครอบ — ไม่มี delta ฝั่งนั้น)

### ADDED
#### Requirement: installer เขียน version stamp ตอน install/update (→ feature: `global-install`)
> หมายเหตุ SHIP: `global-install` เป็น feature ที่ครอบ install behavior ใกล้สุด (project+global mode); ถ้า SHIP เห็นว่าควรแยกเป็น feature `installer-core` ให้ย้าย Requirement นี้ — canonical decision รอ SHIP

installer วาง version stamp ที่ `.warnyin/.warnyin-version` (= เวอร์ชันของ package ที่ติดตั้ง) เพื่อให้ payload มี version identity ตรวจสอบได้

##### Scenario: install ลงโปรเจกต์ → มี stamp ตรงเวอร์ชัน
- **GIVEN** รัน `npx @warnyin/agents` (mode project) ในโปรเจกต์เปล่า
- **WHEN** ติดตั้งเสร็จ
- **THEN** มีไฟล์ `.warnyin/.warnyin-version` เนื้อหา = เวอร์ชันของ package ที่ติดตั้ง

##### Scenario: `--update` อัปเดต stamp เป็นเวอร์ชันปัจจุบัน
- **GIVEN** โปรเจกต์ที่เคยติดตั้งเวอร์ชันเก่าไว้ (stamp เก่า)
- **WHEN** รัน `npx @warnyin/agents --update` ด้วย package เวอร์ชันใหม่
- **THEN** `.warnyin/.warnyin-version` ถูกเขียนเป็นเวอร์ชันใหม่

##### Scenario: `--dry-run` ไม่เขียน stamp
- **GIVEN** โปรเจกต์เปล่า
- **WHEN** รัน `npx @warnyin/agents --dry-run`
- **THEN** ไม่มีไฟล์ `.warnyin/.warnyin-version` ถูกเขียนจริง (แค่ log)

##### Scenario: install แบบ global → stamp ลง homedir
- **GIVEN** รัน `npx @warnyin/agents --global`
- **WHEN** ติดตั้งเสร็จ
- **THEN** มี `~/.warnyin/.warnyin-version` ตรงเวอร์ชันที่ติดตั้ง

### MODIFIED
- ไม่มี

### REMOVED
- ไม่มี

## 10. Design review
> Panel: SA / Tech Lead / Infra / QA (read-only, ขนาน) — 2026-06-12 · ข้าม Security (ไม่แตะ auth/secret/input handling)

### ผล panel
| Role | สถานะ | blocker |
|---|---|---|
| SA | 2 blocker | B1 stamp writer ต้องเขียนทับเสมอ + degrade เปิดช่อง false-green · B2 contract เขียนทับเสมอ vs conditional กำกวม |
| Tech Lead | ไม่มี blocker | 6 suggestion (false-green window, pin-exact=ตัวหลัก, npm view timeout, idempotent byte-equal, global test, CHANGELOG path) |
| Infra | ไม่มี blocker | 4 suggestion (verify-pack false-green ซ้อน, wording allowlist granular, observability warn, infra.md note) |
| QA | 2 blocker | B1 acceptance drift-branch ต้อง wire-proof (unit + structural 2-path) · B2 normalize comparison + parse semver จริง |

### Blocker — แก้ครบใน design (ไม่ต้อง redesign architecture)
1. **(SA-B1/B2) stamp writer = unconditional overwrite เสมอ** → §4A "★ unconditional overwrite", §5 flow note. กัน stamp ค้างค่าเก่าจากครั้งก่อน
2. **(SA-B1 + SA-S2/QA-S1) degrade ยอมรับ false-green by design + warn loud + empty→degrade** → §4B (falsy expected = degrade, warn loud), §4C (resolveExpectedVersion คืน null เมื่อ empty)
3. **(QA-B2) normalize สองฝั่ง + parse semver จริง** → §4A (readStamp trim, empty→null), §4B (exact-equality หลัง trim), §4C (parse semver `.split(/\r?\n/).pop()` + sanity match), §8 (เคส CRLF + parse warning)
4. **(QA-B1/Infra-S3) acceptance drift-branch wire-proof** → §4C (ส่ง expected ทั้ง 2 call site), §8 (unit `verifyInstalled(root,'9.9.9')`→false + structural 2-path + acceptance falsifiable)

### Suggestion ที่รับเข้า design
- (TL-S1/QA) transition window release แรกยังจับ drift ไม่ได้ → §6 known-limitation ชัด + VERIFY snapshot
- (TL-S2) pin-exact=ตัวหลัก/prefer-online=เสริม (wording ไม่ misleading) → §4C
- (TL-S3) npm view timeout 15s + warn degrade → §4C
- (Infra-S1) verify-pack "ยืนยัน" = testable assert ไม่ใช่ false-green ซ้อน → §6, §8
- (Infra-S1) wording "allowlist granular ไม่ใช่ src/**" → §6
- (Infra-S2/S4) observability warn message ระบุ expected vs actual + infra.md note (SHIP) → §4B, ยกไป SHIP
- (Infra/TL) CHANGELOG ระบุ path `.warnyin/.warnyin-version` ชัด → proposal §4 (มีแล้ว) + task

### Defer ไป SHIP (ไม่ block DESIGN)
- `docs/infra.md`: เพิ่ม env `npm_config_prefer_online`, network-to-registry requirement ของ `setup:dogfood`, stamp artifact note (Infra)
- learned-rule candidate: "marker-existence ไม่จับ version drift — payload ที่ต้อง verify ความสดต้องมี version identity (stamp) + verify เทียบค่า ไม่ใช่แค่ existence" (follow-up ของ TS-1)
