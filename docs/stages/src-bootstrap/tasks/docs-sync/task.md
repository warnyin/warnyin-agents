# Task — docs-sync

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ — self-contained แต่ขึ้นกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `docs-sync` |
| **Slice อ้างอิง** | `design.md` slice #5 |
| **Component** | `installer` (docs) + `codemap` |
| **สถานะ** | `build เสร็จ ✅ (2026-06-07)` |

## 1. เป้าหมายของ task (vertical slice)
อัปเดต **เอกสารสะท้อนโค้ด (descriptive)** ให้ตรงโครงใหม่ 100% หลัง T1–T4 ลงจริง: `docs/techstack/installer/{structure,test,about}.md` + `docs/codemap/{index,architecture}.md` ให้สะท้อน 2-layer (source `src/` vs dogfood root gitignored) + setup scripts — และ **note rule/standard ที่ต้องแก้รอ SHIP** (ไม่แตะ `docs/rule.md` + ไม่แตะ component `rule.md`/`standard.md` ตอน BUILD)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง: `tasks/move-source-to-src` (T1), `tasks/packaging-config` (T2), `tasks/test-suite-relocation` (T3), `tasks/dogfood-bootstrap` (T4)** — task นี้ **ท้ายสุด** เพราะต้อง document โค้ดจริงที่ build เสร็จแล้ว (path/allowlist/scripts/test ทั้งหมดต้องนิ่งก่อน) ดู design §7: `T1→(T2,T3)→T4→T5`
- รับ input จาก: โครง `src/` จริง + `package.json` (bin/files/scripts) + `src/scripts/setup-*.mjs` + `.gitignore` + CI yml ที่ T1–T4 สร้าง; `docs/project.md`+`docs/infra.md` ที่ T4 สร้าง (เช็คความครบ)
- ปลดล็อกให้: SHIP (promote rule ใหม่จาก `./rule.md` §2 + กลั่น `docs/infra.md` เต็ม)

## 3. Sub-tasks
- [x] 1. อ่าน ground truth — `src/bin/cli.mjs`, `package.json`, `src/tests/`, `src/scripts/{verify-pack,setup-dogfood,setup-sandbox,check-test-count}.mjs`, `.github/workflows/ci.yml`, `.gitignore` — _ค่าจริงดึงครบ (พบเพิ่ม: `check-test-count.mjs` + `verify-pack.test.mjs` → suite รวม 18 เคส)_
- [x] 2. แก้ `docs/techstack/installer/structure.md` — โครง `src/`, flow `pkgRoot=src/`, helper + setup scripts ใหม่, ค่าคงที่, files allowlist granular ✅
- [x] 3. แก้ `docs/techstack/installer/test.md` — `src/tests/`, `node --test` bare recurse, matrix pass-count gate (9), verify-pack testable, Windows workaround ✅
- [x] 4. แก้ `docs/techstack/installer/about.md` — path ใหม่ (`src/bin/cli.mjs`, test/verify ชี้ `src/`) ✅ · **`standard.md` (component) ไม่แตะ → note §2 รอ SHIP**
- [x] 5. แก้ `docs/codemap/index.md` + `architecture.md` — 2-layer + setup scripts + freshness header 2026-06-07 + `.reports/codemap-diff.txt` ✅ (ทุกไฟล์ < 1000 tokens)
- [x] 6. เช็ค `docs/project.md`+`docs/infra.md` — ครบ/สอดคล้องโครงใหม่แล้ว (T4 สร้างไว้ถูก; ไม่แก้เนื้อหา) ✅
- [x] 7. note rule ใหม่ใน `./rule.md` §2 ครบ (ทำใน DESIGN; BUILD ไม่แตะ `docs/rule.md`/component rule/standard — diff สะอาด) ✅

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **แก้ได้ (descriptive docs):** `docs/techstack/installer/{structure,test,about}.md`, `docs/codemap/{index,architecture}.md`, (อ่าน-เขียน) `./spec.md` `./standard.md` `./rule.md` ในโฟลเดอร์ task, `.reports/codemap-diff.txt`
- **อ่านอย่างเดียว (ground truth):** `src/**`, `package.json`, `.github/workflows/ci.yml`, `.gitignore`, `docs/project.md`, `docs/infra.md`
- **⛔ ห้ามแตะตอน BUILD:** `docs/rule.md` (rule กลาง), **`docs/techstack/installer/rule.md` + `standard.md` (rule/standard component)** — แก้ที่ SHIP จาก note `./rule.md §2`; โค้ดใน `src/**`; `docs/infra.md`/`docs/project.md` (เนื้อหา)

## 5. Acceptance criteria
- [x] `structure.md` ทุก path/ค่าคงที่/helper/allowlist ตรงกับ `src/bin/cli.mjs` + `package.json` จริง (CORE/SCAFFOLD_FILES/TEMPLATE_DOCS/marker + files allowlist granular เทียบโค้ดแล้ว)
- [x] `test.md` สะท้อน `src/tests/` (18 เคส) + `node --test` bare + CI matrix pass-count gate (9) + verify-pack testable (`checkFiles`) + Windows workaround ตรงไฟล์จริง
- [x] `about.md` ไม่เหลือ path เก่า → ชี้ `src/bin/cli.mjs`/`src/tests/` (grep ยืนยันไม่มี stale path; `standard.md` component ไม่แก้ — รอ SHIP)
- [x] `codemap/{index,architecture}.md` แสดง 2-layer ชัด + path ใหม่ + freshness 2026-06-07 + ทุกไฟล์ < 1000 tokens; `index.md` ลิงก์ครบ (codemap มีแค่ architecture.md)
- [x] **`docs/rule.md` ไม่ถูกแก้** (git diff สะอาด — ยืนยันแล้ว) — rule ใหม่อยู่ `./rule.md` §2 ครบ
- [x] `docs/project.md`+`docs/infra.md` เช็คแล้วครบ/สอดคล้องโครงใหม่ (ไม่แก้เนื้อหา)
- [x] **docs ตรงโค้ดจริง 100%** — grep ยืนยันไม่มี path เก่า/ลิงก์เสียในไฟล์ที่แก้
- [x] ทำตาม `rule.md` และ `standard.md` (ห้ามแตะ rule/standard กลาง; เขียนจาก ground truth; ภาษาไทยกระชับ คงสไตล์เดิม)

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (วิธีเขียน codemap + โครง techstack docs): `./standard.md`
- Rule (ห้ามแก้ rule กลางตอน build + rule ใหม่รอ SHIP): `./rule.md`
