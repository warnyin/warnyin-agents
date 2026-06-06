# Task — docs-sync

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ — self-contained แต่ขึ้นกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `docs-sync` |
| **Slice อ้างอิง** | `design.md` slice #5 |
| **Component** | `installer` (docs) + `codemap` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
อัปเดต **เอกสารสะท้อนโค้ด (descriptive)** ให้ตรงโครงใหม่ 100% หลัง T1–T4 ลงจริง: `docs/techstack/installer/{structure,test,about}.md` + `docs/codemap/{index,architecture}.md` ให้สะท้อน 2-layer (source `src/` vs dogfood root gitignored) + setup scripts — และ **note rule/standard ที่ต้องแก้รอ SHIP** (ไม่แตะ `docs/rule.md` + ไม่แตะ component `rule.md`/`standard.md` ตอน BUILD)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง: `tasks/move-source-to-src` (T1), `tasks/packaging-config` (T2), `tasks/test-suite-relocation` (T3), `tasks/dogfood-bootstrap` (T4)** — task นี้ **ท้ายสุด** เพราะต้อง document โค้ดจริงที่ build เสร็จแล้ว (path/allowlist/scripts/test ทั้งหมดต้องนิ่งก่อน) ดู design §7: `T1→(T2,T3)→T4→T5`
- รับ input จาก: โครง `src/` จริง + `package.json` (bin/files/scripts) + `src/scripts/setup-*.mjs` + `.gitignore` + CI yml ที่ T1–T4 สร้าง; `docs/project.md`+`docs/infra.md` ที่ T4 สร้าง (เช็คความครบ)
- ปลดล็อกให้: SHIP (promote rule ใหม่จาก `./rule.md` §2 + กลั่น `docs/infra.md` เต็ม)

## 3. Sub-tasks
- [ ] 1. อ่าน ground truth — `src/bin/cli.mjs`, `package.json`, `src/tests/`, `src/scripts/{verify-pack,setup-dogfood,setup-sandbox}.mjs`, `.github/workflows/ci.yml`, `.gitignore` — _ผลลัพธ์: ค่าจริงของ path/CORE/allowlist/scripts/helper_
- [ ] 2. แก้ `docs/techstack/installer/structure.md` — โครง `src/`, flow `pkgRoot=src/`, helper + setup scripts ใหม่, ค่าคงที่, files allowlist granular — _ขึ้นกับ 1_
- [ ] 3. แก้ `docs/techstack/installer/test.md` — `src/tests/`, `node --test` bare recurse, matrix 9-pass gate, verify-pack testable, Windows workaround — _ขึ้นกับ 1_
- [ ] 4. แก้ `docs/techstack/installer/about.md` — path ใหม่ (`src/bin/cli.mjs`, test/verify ชี้ `src/`) เท่าที่เปลี่ยน — _ขึ้นกับ 1_ · **`standard.md` (component) ไม่แตะ → harness path correction note §2 รอ SHIP**
- [ ] 5. แก้ `docs/codemap/index.md` + `architecture.md` ตาม `.warnyin/workflow/codemap.md` — 2-layer (src source vs root dogfood gitignored) + setup scripts + freshness header + (.reports/codemap-diff.txt ถ้าทำ diff) — _ขึ้นกับ 1_
- [ ] 6. เช็ค `docs/project.md`+`docs/infra.md` ครบ/สอดคล้องโครงใหม่ (ไม่สร้างซ้ำ ไม่เติมเนื้อหา infra) — _ขึ้นกับ 1_
- [ ] 7. note rule ใหม่ใน `./rule.md` §2 ให้ครบ (รอ SHIP) — **ห้ามแตะ `docs/rule.md`**

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **แก้ได้ (descriptive docs):** `docs/techstack/installer/{structure,test,about}.md`, `docs/codemap/{index,architecture}.md`, (อ่าน-เขียน) `./spec.md` `./standard.md` `./rule.md` ในโฟลเดอร์ task, `.reports/codemap-diff.txt`
- **อ่านอย่างเดียว (ground truth):** `src/**`, `package.json`, `.github/workflows/ci.yml`, `.gitignore`, `docs/project.md`, `docs/infra.md`
- **⛔ ห้ามแตะตอน BUILD:** `docs/rule.md` (rule กลาง), **`docs/techstack/installer/rule.md` + `standard.md` (rule/standard component)** — แก้ที่ SHIP จาก note `./rule.md §2`; โค้ดใน `src/**`; `docs/infra.md`/`docs/project.md` (เนื้อหา)

## 5. Acceptance criteria
- [ ] `structure.md` ทุก path/ค่าคงที่/helper/allowlist ตรงกับ `src/bin/cli.mjs` + `package.json` จริง (เทียบโค้ดได้ 100%)
- [ ] `test.md` สะท้อน `src/tests/` + `node --test` bare + CI matrix 9-pass gate + verify-pack testable + Windows workaround ตรงไฟล์จริง
- [ ] `about.md` ไม่เหลือ path เก่า (`bin/cli.mjs`/`tests/`/`scripts/` ลอย) → ชี้ `src/` ถูก (`standard.md` component ไม่แก้รอบนี้ — รอ SHIP)
- [ ] `codemap/{index,architecture}.md` แสดง 2-layer ชัด + path ใหม่ + freshness header วันที่ build + ทุกไฟล์ < 1000 tokens; `index.md` ลิงก์ครบ
- [ ] **`docs/rule.md` ไม่ถูกแก้** (git diff สะอาด) — rule ใหม่อยู่ใน `./rule.md` §2 ครบทุกข้อ
- [ ] `docs/project.md`+`docs/infra.md` เช็คแล้วครบ/สอดคล้อง (หรือ note สิ่งที่รอ SHIP — ไม่แก้เนื้อหา)
- [ ] **docs ตรงโค้ดจริง 100%** — ไม่มี path/ค่า/ลิงก์ที่ไม่มีอยู่จริง
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (วิธีเขียน codemap + โครง techstack docs): `./standard.md`
- Rule (ห้ามแก้ rule กลางตอน build + rule ใหม่รอ SHIP): `./rule.md`
