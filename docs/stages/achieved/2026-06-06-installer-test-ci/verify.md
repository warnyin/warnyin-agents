# Verify report — installer-test-ci

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> strategy tester (role QA) · วันที่: 2026-06-06 · branch: `build/installer-test-ci`

## สรุปผล
ผ่านเชิงพฤติกรรม/จุดประสงค์ของ topic ใน 4/5 ข้อ — เหลือ **V4 (CI เขียวจริงบน PR)** ที่เป็น outward-facing รอ user
**VERIFY จับ bug จริง 1 จุด (scaffold leak) ที่ build/design panel/dry-run มองไม่เห็น — แก้สำเร็จในรอบเดียว**

| # | สิ่งที่ verify | ผล | หลักฐาน |
|---|---|---|---|
| V1 | test harness ทำงานจริง (slice 1) | ✅ | `npm test` 9/9 เขียว (node v24.14.0 local) |
| V2 | package พร้อม publish (slice 2) | ✅ | pack 68 ไฟล์, `.warnyin/workflow/` ติด, `docs/` ไม่หลุด, ไม่มีไฟล์นอก allowlist |
| V3 | CI security contract (slice 2) | ✅ | `ci.yml`: `permissions: contents:read` · ไม่มี `pull_request_target`/`secrets.*` · SHA-pin · matrix [20,22,24] · ไม่มี `npm ci`/cache |
| V4 | CI เขียวจริงบน PR | ⏸ รอ user | ต้อง push + เปิด PR (outward-facing — ขออนุมัติ) |
| V5 | เจตนา "package/installer สะอาด" | ✅ (หลังแก้) | ติดตั้งจริงใน temp → scaffold เปล่าเท่านั้น, topic leak = 0 |

## Finding ที่เจอ + แก้ (จำนวนรอบแก้ = 1)
**Scaffold leak (V5)** — installer `copyTree(docs/stages)` ลากงานจริงของ repo ต้นทาง (`docs/stages/installer-test-ci/**`) ไปลง project ผู้ใช้ + ติด published package; pack-verify เดิมจับไม่ได้เพราะ allowlist อนุญาต `docs/stages/` ทั้ง prefix
- **user decision:** "ตอน install ให้สร้างไฟล์แทน ไม่ต้อง copy"
- **แก้ 4 ไฟล์:**
  1. `bin/cli.mjs` — `ensureScaffold()` **generate** `context.md` + `achieved/.gitkeep` เปล่าเอง (เลิก `copyTree(docs/stages)`)
  2. `package.json` — ตัด `docs/stages` ออกจาก `files`
  3. `scripts/verify-pack.mjs` — ตัด `docs/stages/` ออก allowlist + guard FAIL ถ้า `docs/` หลุดขึ้น package
  4. `tests/installer.test.mjs` — +เคส 9 (scaffold เปล่า + ไม่มี topic leak)
- รายละเอียด root cause/ป้องกันซ้ำ: `troubleshooting.md` #4

## Deviation จาก DESIGN scope
- DESIGN §1 ระบุ `bin/cli.mjs` เป็น "target ที่ทดสอบ — **ไม่แตะ**" (black-box) แต่ VERIFY พบ core bug จริง → **แตะ `cli.mjs` ตาม user decision** (เปลี่ยน scaffold จาก copy → generate) นอกเหนือ scope เดิม — บันทึกไว้เพื่อความโปร่งใส
- การแก้นี้เปลี่ยน "deliverable ของ ci-pipeline" (pack-verify allowlist + package.json files) ด้วย

## ค้างไป SHIP / roadmap
- **V4:** ยืนยัน CI เขียวจริงบน PR ต้อง push + เปิด PR (outward) — ทำตอนตัดสินใจ merge/SHIP
- **build-wave args=string** (BUILD finding #2) + **scaffold leak เป็น core installer bug** → ทั้งคู่ควรขึ้น `docs/roadmap.md` ตอน SHIP

## Gate → SHIP
- [x] เทสตามจุดประสงค์ topic ครบ (functional: test harness + package cleanliness + CI contract)
- [x] ไม่ใช่ FE — ไม่มี UX/UI verify
- [x] ทุกข้อที่ไม่ผ่าน (V5) แก้จนผ่าน
- [x] `test.md` + `verify.md` เขียนครบ (+ จำนวนรอบแก้ = 1)
- [x] ปัญหายาก/ซ้ำบันทึก `troubleshooting.md` #4
- [ ] **V4** (CI เขียวจริงบน PR) — outward-facing, รอ user ตัดสินใจ push/PR
