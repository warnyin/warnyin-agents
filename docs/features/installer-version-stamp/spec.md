# Spec — Installer version stamp + drift-aware dogfood verify

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior · feature ผสม CLI (runtime) + dev-tooling → THEN = side-effect ที่ assert ได้
> **descriptive ไม่ใช่ imperative** · ค่าใน scenario ใช้ placeholder

## Requirement: installer เขียน version stamp ตอน install/update

installer วาง version stamp ที่ `.warnyin/.warnyin-version` (= เวอร์ชันของ package ที่ติดตั้ง, plain text บรรทัดเดียว + trailing `\n`) เพื่อให้ payload มี version identity ตรวจสอบได้ — เขียนทับเสมอ (unconditional) ทุก install/`--update` ทั้ง project + global

### Scenario: install ลงโปรเจกต์ → มี stamp ตรงเวอร์ชัน
- GIVEN รัน `npx @warnyin/agents` (mode project) ในโปรเจกต์เปล่า
- WHEN ติดตั้งเสร็จ
- THEN มีไฟล์ `.warnyin/.warnyin-version` เนื้อหา = เวอร์ชันของ package ที่ติดตั้ง (match semver)

### Scenario: `--update` อัปเดต stamp เป็นเวอร์ชันปัจจุบัน
- GIVEN โปรเจกต์ที่เคยติดตั้งเวอร์ชันเก่าไว้ (stamp เก่า)
- WHEN รัน `npx @warnyin/agents --update` ด้วย package เวอร์ชันใหม่
- THEN `.warnyin/.warnyin-version` ถูกเขียนทับเป็นเวอร์ชันใหม่ (unconditional — ไม่ค้างค่าเก่า)

### Scenario: `--dry-run` ไม่เขียน stamp
- GIVEN โปรเจกต์เปล่า
- WHEN รัน `npx @warnyin/agents --dry-run`
- THEN ไม่มีไฟล์ `.warnyin/.warnyin-version` ถูกเขียนจริง (แค่ log)

### Scenario: install แบบ global → stamp ลง homedir
- GIVEN รัน `npx @warnyin/agents --global` (HOME+USERPROFILE ชี้ temp)
- WHEN ติดตั้งเสร็จ
- THEN มี `~/.warnyin/.warnyin-version` ตรงเวอร์ชันที่ติดตั้ง

### Scenario: stamp ไม่หลุดขึ้น tarball (install-time artifact)
- GIVEN stamp เป็นไฟล์ที่ `cli.mjs` สร้างตอน install (ไม่อยู่ใน `src/`)
- WHEN `npm pack --dry-run` / `checkFiles`
- THEN `.warnyin/.warnyin-version` ไม่อยู่ใน tarball file list (นอก allowlist granular + ตรง deny `.warnyin/` root)

## Requirement: setup:dogfood จับ version drift ด้วย version stamp (transition-safe)

`npm run setup:dogfood` query latest จาก registry → pin exact version + `--prefer-online` (กัน stale npx cache) → `verifyInstalled(root, expected)` เทียบ stamp กับ expected; ไม่รายงานสำเร็จถ้า payload เป็นเวอร์ชันเก่า

### Scenario: stamp ตรง expected → ผ่าน
- GIVEN root มี CORE markers ครบ + stamp = `<expected>`
- WHEN `verifyInstalled(root, '<expected>')`
- THEN คืน true (ไม่มี warn)

### Scenario: stamp ≠ expected → ไม่ผ่าน (จับ drift)
- GIVEN root มี CORE markers + stamp = `<old>` (เช่น `0.1.0`)
- WHEN `verifyInstalled(root, '<new>')` (เช่น `9.9.9`)
- THEN คืน false + warn ระบุ `version drift: ติดตั้ง <old> แต่คาด <new>` → trigger fallback/exit ≠ 0

### Scenario: stamp ขาด → transition (ไม่ false-fail)
- GIVEN root มี CORE markers แต่ไม่มีไฟล์ stamp (payload รุ่นก่อน stamp writer)
- WHEN `verifyInstalled(root, '<expected>')`
- THEN คืน true + warn `payload ไม่มี version stamp — ข้าม version check` (transition-safe)

### Scenario: query latest ล้มเหลว → degrade marker-only
- GIVEN `npm view` คืน fail/empty/timeout (expected falsy)
- WHEN `verifyInstalled(root, null)` / `verifyInstalled(root, '')` (markers ครบ)
- THEN คืน true (marker-only) + warn `ข้าม version check (npm view ไม่ได้ผล)` (degrade loud)

### Scenario: stamp มี CRLF / stdout มี noise → normalize ไม่ false-drift
- GIVEN stamp = `"<ver>\r\n"` (Windows) หรือ `npm view` stdout = `"npm warn ...\n<ver>\n"`
- WHEN `verifyInstalled(root, '<ver>')` / `parseNpmViewVersion(stdout)`
- THEN เทียบเท่ากันหลัง normalize trim สองฝั่ง → true / คืน `<ver>` (ดึงบรรทัด semver จริง); input ไม่ใช่ semver → `null`

### Scenario: verify ส่ง expected ทั้ง npx + pack path (wire-proof)
- GIVEN `installViaNpx` และ `installViaPack`
- WHEN เรียก `verifyInstalled`
- THEN ทั้งสอง path ส่ง `expected` เข้า `verifyInstalled(repoRoot, expected)` (drift-guard ไม่ตายเงียบบน pack-path/Windows)
