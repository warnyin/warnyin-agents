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

### Scenario: stamp ขาด + expected ≥ first-stamp-version (0.17.0) → ไม่ผ่าน (active)
- GIVEN root มี CORE markers แต่ไม่มีไฟล์ stamp · `expected` ≥ `0.17.0` (release ที่มี stamp writer)
- WHEN `verifyInstalled(root, '<expected≥0.17.0>')`
- THEN คืน **false** + warn ระบุ payload ไม่มี stamp ทั้งที่ควรมี (install ผิด/payload เก่า) → trigger fallback/exit ≠ 0

### Scenario: stamp ขาด + expected < first-stamp-version (0.17.0) → ผ่าน (transition คงไว้)
- GIVEN root มี CORE markers แต่ไม่มีไฟล์ stamp · `expected` < `0.17.0` (รุ่นก่อน stamp writer) หรือ expected ไม่ใช่ semver
- WHEN `verifyInstalled(root, '<expected<0.17.0>')`
- THEN คืน true + warn transition-safe (bootstrapping window สำหรับ pre-0.17.0 — degrade-safe ไม่ block)

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

## Requirement: setup:dogfood ดึง payload ใหม่ทน stale-cache + npx bin resolution

`setup:dogfood` ติดตั้ง release ลง root ด้วย 2 path — `installViaNpx` (ทางหลัก) → fallback `installViaPack` (npm pack → extract → cli.mjs `--update`) — ทั้งสอง path ต้องทน stale npm cache และ verify version identity ที่ source

### Scenario: npx path ใช้ explicit bin name (กัน scope-strip mismatch)
- GIVEN `installViaNpx` ติดตั้งผ่าน npx
- WHEN spawn npx
- THEN ใช้ `npx --yes -p <pkg>@<v> warnyin-agents --update` (ระบุ `-p` + bin `warnyin-agents` — เพราะ bin name ≠ scope-stripped `agents`)

### Scenario: fallback pack ดึง payload ใหม่ + verify version ที่ source
- GIVEN `installViaPack` ทำงาน
- WHEN `npm pack`
- THEN ตั้ง `npm_config_prefer_online` (symmetric กับ npx path) + เทียบ `package.json` version ของ tarball ที่ extract กับ expected แบบ exact-equality ก่อนรัน `--update`; ไม่ตรง → ไม่รายงานสำเร็จ (return false)

## Requirement: installer entrypoint resolve ถูกแม้ถูกเรียกผ่าน symlink

`cli.mjs` ตรวจว่าถูก execute ตรง (entrypoint) ด้วยการเทียบ `process.argv[1]` กับ path ของ module — ต้อง **realpath ทั้งสองฝั่ง** เพราะ ESM `import.meta.url` เป็น realpath เสมอ แต่ `argv[1]` เป็น path ตามที่ผู้เรียกระบุ (ไม่ resolve symlink)

### Scenario: cli ถูกเรียกผ่าน symlink path → main() ทำงาน (ติดตั้ง + เขียน stamp)
- GIVEN `cli.mjs` ถูก execute โดย `process.argv[1]` เป็น symlink path (npx รัน bin ผ่าน `node_modules/.bin/<name>` symlink; tarball extract ลง `os.tmpdir()` ที่เป็น symlink บน macOS) ซึ่ง realpath ชี้กลับมาที่ module เอง
- WHEN รัน `node <symlink-to-cli.mjs> --update`
- THEN main-guard เทียบด้วย realpath ทั้งสองฝั่ง → match → `main()` ถูกเรียก → ติดตั้ง CORE + เขียน `.warnyin/.warnyin-version` (ไม่เงียบ exit 0 ไม่ทำอะไร)

### Scenario: cli ถูก import (ไม่ใช่ execute) → main() ไม่ทำงาน
- GIVEN unit test `import { resolveMode, isEntrypoint } from cli.mjs` — `argv[1]` เป็น test runner ไม่ใช่ cli.mjs
- WHEN module ถูก import
- THEN `isEntrypoint` คืน false → ไม่ trigger `main()` (กัน side-effect ตอน import)
