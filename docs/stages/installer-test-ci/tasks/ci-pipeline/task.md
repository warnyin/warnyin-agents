# Task — ci-pipeline

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `ci-pipeline` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | CI (`.github/workflows/`) + `CHANGELOG.md` |
| **สถานะ** | `build เสร็จ — รอ VERIFY (CI ยืนยันจริงบน PR)` |

## 1. เป้าหมายของ task (vertical slice)
เปิด PR แล้ว CI เขียวอัตโนมัติ — รัน test ข้าม node (20/22/24) + ยืนยัน package พร้อม publish (`.warnyin/` ติด, `tests`/`.github` ไม่ติด) + บันทึก CHANGELOG ขั้นต่ำของ topic นี้

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: `tasks/installer-test-suite` — เพราะ CI เรียก `npm test` (script ที่ task นั้นสร้าง) + ต้องมี `engines.node>=20` ตรงกับ matrix; ถ้าทำก่อน CI จะแดง
- ปลดล็อกให้: — (task สุดท้ายของ topic)
- รับ input จาก task ก่อน: `package.json scripts.test` + `tests/`

## 3. Sub-tasks
- [x] 1. `.github/workflows/ci.yml` — matrix `[20,22,24]`, รัน `npm test` (= bare `node --test`, ไม่ใส่ path; ไม่ `npm ci`/cache); `permissions: contents: read`; `on: { pull_request:, push: { branches: [main] } }` — _ผลลัพธ์: test job_
- [x] 2. pack-verify — node script `scripts/verify-pack.mjs` parse `npm pack --dry-run --json` (allowlist BK-1); job `pack-verify` `needs: test` — _ขึ้นกับ 1_
- [x] 3. `CHANGELOG.md` — Keep a Changelog format; entry `[Unreleased]` (Added test/CI/pack-verify, Changed engines >=20, Removed node 18)
- [x] 4. verify workflow syntax (actionlint ไม่มีในเครื่อง → อ่านทาน YAML + parse contract checks) — ไม่มี secret, ไม่ `pull_request_target`, SHA-pin ครบ

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `.github/workflows/ci.yml` (ใหม่)
- `scripts/verify-pack.mjs` (ใหม่ — หรือ inline ใน workflow ถ้าสั้นพอ)
- `CHANGELOG.md` (ใหม่)
- **ไม่แตะ** `package.json` (task ก่อนทำแล้ว), `bin/cli.mjs`

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [x] workflow valid + พร้อมรันบน PR (matrix node 20/22/24; YAML well-formed, contract checks ผ่าน) — _CI เขียวจริงบน PR ยืนยันตอน VERIFY_
- [x] pack-verify ผ่าน: `.warnyin/` อยู่ใน tarball (83 ไฟล์) **และ** `tests/`/`.github/` ไม่อยู่ — allowlist verdict PASS (ทดสอบ logic บน pack จริง; script รันตรงบน Windows ENOENT เป็น dev-only ตาม spec)
- [x] `permissions: contents: read`, `on: pull_request` (ไม่มี `pull_request_target`), ไม่มี `secrets.*`, action pin SHA (checkout/setup-node 40-hex)
- [x] `CHANGELOG.md` มี entry ตาม `spec.md` (Keep a Changelog header + `[Unreleased]` Added/Changed/Removed)
- [x] ผ่านตาม `spec.md` + ทำตาม `rule.md`/`standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard: `./standard.md`
- Rule: `./rule.md`
