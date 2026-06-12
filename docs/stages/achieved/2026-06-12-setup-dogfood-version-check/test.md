# Test plan — setup-dogfood-version-check

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md` · role: QA
> component `installer` (CLI/dev-tooling) — ไม่มี FE/UX, ไม่มี REST API/openapi → เน้น **functional + behavioral ผ่าน cli/setup จริง** (มากกว่า unit ที่ BUILD ครอบ)

## จุดประสงค์ที่ต้อง verify
ทำให้ `setup:dogfood` จับ version drift ได้ (false-green รอบ 2 / issue #3) ผ่าน (1) installer เขียน version stamp, (2) verifyInstalled เทียบ stamp กับ expected แบบ transition-safe

## Env
- zero-service (node ≥20 + npm); `setup:sandbox` = spawn `src/bin/cli.mjs` ลง temp (ทดสอบ cli ที่แก้แล้วโดยไม่แตะ root dogfood); global mode override **ทั้ง `HOME` + `USERPROFILE`** → temp (infra.md)

## Test cases

### A. Test case ใหม่ (Spec delta ADDED — `design.md §9`) — behavioral ผ่าน cli จริง
- [x] **T1 — stamp ลงจริง project mode:** `npm run setup:sandbox` (spawn cli.mjs จริง) → `<sandbox>/.warnyin/.warnyin-version` มี + = `package.json` version (`0.16.0`) + match semver
- [x] **T2 — stamp ลงจริง global mode:** spawn `cli.mjs --global` (HOME+USERPROFILE=temp) → `<home>/.warnyin/.warnyin-version` ตรงเวอร์ชัน
- [x] **T3 — `--dry-run` ไม่เขียน stamp:** spawn `cli.mjs --project --dry-run` ใน temp → ไม่มีไฟล์ stamp (log เท่านั้น)

### B. drift-guard behavioral (จุดประสงค์แก่นของ topic) — ผ่าน verifyInstalled จริง
- [x] **T4 — drift → false:** temp root + CORE markers + stamp `0.1.0` → `verifyInstalled(root,'9.9.9')` === false + เห็น warn `⚠ version drift` (ตัวจับ false-green รอบ 2)
- [x] **T5 — match → true:** stamp = expected → true (ไม่มี warn)
- [x] **T6 — transition (stamp ขาด) → true:** markers ครบ ไม่มี stamp → `verifyInstalled(root,'0.16.0')` === true + warn `⚠ ข้าม version check`
- [x] **T7 — degrade (expected falsy) → true:** `verifyInstalled(root,null)` / `(root,'')` === true (markers ครบ) — marker-only
- [x] **T8 — CRLF:** stamp `"0.16.0\r\n"` + expected `"0.16.0"` → true (Windows-safe)
- [x] **T9 — parse ทน noise:** `parseNpmViewVersion("npm warn x\n0.16.0\n")` → `0.16.0`; `""`/`"nope"` → null
- [x] **T10 — resolveExpectedVersion จริง:** query `npm view @warnyin/agents version` จริง (ถ้า network) → คืน semver; ถ้า offline → degrade (null) ไม่ crash

### C. Regression
- [x] **T11 — global-install baseline (6 scenario):** install mode เดิม (project/global/non-TTY/flag-conflict/idempotent/ไม่ทำลาย user file/homedir-guard) ยังผ่าน → `npm test` (installer.test ครอบ)
- [x] **T12 — full suite + lint:** `npm test` 85 pass/0 fail (pass===tests) + `lint:md` ผ่าน
- [x] **T13 — packaging:** `npm pack --dry-run --json` → stamp ไม่หลุด + payload ครบ + ไม่มี leak

### D. Defer (รอ stage/release ถัดไป — ไม่ใช่ gate ของ topic)
- [~] **T14 — integration end-to-end (`npm run setup:dogfood` จริง):** **DEFER** (รอ publish release ที่มี stamp — transition window `design.md §6`) → บันทึก snapshot รอบที่เริ่มจับ drift ได้จริง — ไม่ block VERIFY

## หมายเหตุ acceptance
ตาม `design.md §8`: acceptance ของ topic = { B (truth table+parse) + A (black-box stamp) + regression + packaging }; T14 (end-to-end) = manual proof รอ release
