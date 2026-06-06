# Task — ci-pipeline

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `ci-pipeline` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | CI (`.github/workflows/`) + `CHANGELOG.md` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
เปิด PR แล้ว CI เขียวอัตโนมัติ — รัน test ข้าม node (20/22/24) + ยืนยัน package พร้อม publish (`.warnyin/` ติด, `tests`/`.github` ไม่ติด) + บันทึก CHANGELOG ขั้นต่ำของ topic นี้

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: `tasks/installer-test-suite` — เพราะ CI เรียก `npm test` (script ที่ task นั้นสร้าง) + ต้องมี `engines.node>=20` ตรงกับ matrix; ถ้าทำก่อน CI จะแดง
- ปลดล็อกให้: — (task สุดท้ายของ topic)
- รับ input จาก task ก่อน: `package.json scripts.test` + `tests/`

## 3. Sub-tasks
- [ ] 1. `.github/workflows/ci.yml` — matrix `[20,22,24]`, รัน `node --test tests/` (ไม่ `npm ci`/cache); `permissions: contents: read`; `on: { pull_request:, push: { branches: [main] } }` — _ผลลัพธ์: test job_
- [ ] 2. pack-verify — node script (`scripts/verify-pack.mjs` หรือ inline `node -e`) parse `npm pack --dry-run --json`; เพิ่มเป็น job/step — _ขึ้นกับ 1_
- [ ] 3. `CHANGELOG.md` — Keep a Changelog format; entry สำหรับเวอร์ชันถัดไป (engines >=20 / drop node 18, +test/CI)
- [ ] 4. verify workflow syntax (`actionlint` ถ้ามี / อ่านทาน YAML) — ไม่มี secret, ไม่ `pull_request_target`

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `.github/workflows/ci.yml` (ใหม่)
- `scripts/verify-pack.mjs` (ใหม่ — หรือ inline ใน workflow ถ้าสั้นพอ)
- `CHANGELOG.md` (ใหม่)
- **ไม่แตะ** `package.json` (task ก่อนทำแล้ว), `bin/cli.mjs`

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] workflow valid + รันบน PR ได้ (เขียวทุก node 20/22/24)
- [ ] pack-verify ผ่าน: `.warnyin/` อยู่ใน tarball **และ** `tests/`/`.github/` ไม่อยู่
- [ ] `permissions: contents: read`, `on: pull_request` (ไม่มี `pull_request_target`), ไม่มี `secrets.*`, action pin SHA
- [ ] `CHANGELOG.md` มี entry ตาม `spec.md`
- [ ] ผ่านตาม `spec.md` + ทำตาม `rule.md`/`standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard: `./standard.md`
- Rule: `./rule.md`
