# Spec — docs-sync

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — เป็นงาน **เอกสาร** (documents) ไม่ใช่โค้ด

## 1. ชนิดของ task
`docs` — ปรับเอกสารสะท้อนโค้ดให้ตรงโครงใหม่หลัง T1–T4 ลงจริง (techstack/installer + codemap) + note rule ใหม่รอ SHIP

---

## 2. ขอบเขตเอกสารที่ต้องอัปเดต (สะท้อนโค้ดจริงหลัง T1–T4)
> ทุกข้อ "เขียนจากโค้ดจริง ณ วันสแกน" — ห้ามเดา/ห้ามเขียนจากความจำ (codemap §3)

### 2.1 `docs/techstack/installer/structure.md`
- **โครงไฟล์ใหม่:** `src/bin/cli.mjs`, `src/tests/installer.test.mjs`, `src/scripts/{verify-pack,setup-dogfood,setup-sandbox}.mjs`, `src/.warnyin/`, `src/.claude/{commands/warnyin,agents}`, `src/AGENTS.md`; root committed = `package.json README.md CHANGELOG.md LICENSE CONTRIBUTING.md docs/ .github/ .gitignore`
- **flow `src/bin/cli.mjs`:** `pkgRoot = resolve(dirname(cli), '..')` = `src/`; CORE/seedDocs/ensureScaffold/installRootDoc ตามจริง; comment guard ใหม่ (`pkgRoot===target` = defensive no-op หลังย้าย — design §4.1/§7)
- **helper signatures:** copyTree / ensureScaffold / seedDocs / installRootDoc (ตามที่ build ลงจริง) **+ setup-dogfood.mjs / setup-sandbox.mjs** (signature/หน้าที่ตามจริง — design §4.5)
- **ค่าคงที่:** `CORE`, `SCAFFOLD_FILES`, `TEMPLATE_DOCS`, marker — ตามค่าจริงใน `src/bin/cli.mjs`
- **files allowlist (granular):** ตามค่าจริงใน `package.json` (design §4.3) — `src/bin`, `src/.warnyin`, `src/.claude/commands`, `src/.claude/agents`, `src/AGENTS.md`, root meta; ไม่มี `src/tests`/`src/scripts`

### 2.2 `docs/techstack/installer/test.md`
- test อยู่ `src/tests/`; `npm test` = `node --test` **bare recurse** (ไม่มี path arg) → discover `src/tests/*.test.mjs`
- CI matrix node [20,22,24] — acceptance = เห็น **9 pass count** ไม่ใช่แค่ exit 0 (BL-2)
- `verify-pack` **testable** — logic ตรวจ (รับ `files[]`→error[]) แยกจาก `npm pack`; unit ป้อน list ปลอมที่มี `src/tests/` → assert จับได้ (BL-4)
- Windows dev workaround: `verify-pack.mjs` รันตรงอาจ ENOENT → apply allowlist logic บน `npm pack --json` เอง (troubleshooting #4)

### 2.3 `docs/techstack/installer/about.md` (เท่าที่ path เปลี่ยน)
- `about.md`: path `bin/cli.mjs` → `src/bin/cli.mjs`; ความสัมพันธ์ test/verify ชี้ `src/tests`/`src/scripts`
- ⛔ **`standard.md` (component standard) ไม่แก้ตอน BUILD** — harness path correction (`cliPath` relative `src/tests/`→`src/bin/cli.mjs`) + verify-pack allowlist ใหม่ (design §4.4) → note `./rule.md §2` รอ SHIP

### 2.4 `docs/codemap/index.md` + `architecture.md` (ตาม `.warnyin/workflow/codemap.md`)
- สะท้อน **2 layer:** SOURCE (`src/**` committed/publish) vs DOGFOOD (root `.warnyin/`/`.claude/`/`CLAUDE.md`/`AGENTS.md` — gitignored, install จาก release)
- component path → `src/bin/cli.mjs`, `src/.warnyin/`, `src/.claude/`, `src/AGENTS.md`
- entry point + setup scripts (`setup-dogfood`/`setup-sandbox`); installer flow `pkgRoot=src/`
- freshness header อัปเดต; ทุกไฟล์ token-lean (< 1000 tokens)

### 2.5 `docs/rule.md` — **ห้ามแตะรอบนี้**
- rule ใหม่ที่เกิดจาก topic นี้ → note ใน `./rule.md` §2 (รอ SHIP promote) เท่านั้น

### 2.6 เช็คความครบ (ไม่สร้างซ้ำ)
- `docs/project.md` + `docs/infra.md` ถูกสร้างใน T4 แล้ว → task นี้แค่ verify ว่าครบ/สอดคล้องโครงใหม่ (ถ้าขัดให้ note ไม่แก้เนื้อหา infra เพราะ infra เต็มรอ SHIP — design §9)

## 3. Data-flow
ไม่มี runtime data-flow — เป็น doc งานเดียว: อ่านโค้ดจริงหลัง T1–T4 → เขียนทับ doc ให้ตรง

## 4. Persona
contributor/AI ที่อ่าน `docs/` เพื่อทำงานบน repo — ต้องเห็นโครง 2-layer + path ใหม่ถูกต้อง 100%

## 7. Test-flow (เกณฑ์ยืนยันว่า doc ตรงโค้ดจริง)
- [ ] structure.md: ทุก path/ค่าคงที่/helper/allowlist ตรงกับ `src/bin/cli.mjs` + `package.json` จริง (grep/อ่านเทียบ)
- [ ] test.md: คำสั่ง `npm test`, CI matrix, gate 9 pass, verify-pack testable ตรง `package.json scripts` + `src/tests` + CI yml จริง
- [ ] about.md: ไม่มี path เก่า (`bin/cli.mjs`/`tests/`/`scripts/` ลอย) หลงเหลือ (standard.md component ไม่แตะ — รอ SHIP)
- [ ] codemap: ไม่มี path เก่า; 2-layer ชัด; freshness header วันที่ build; ทุกไฟล์ token-lean
- [ ] `docs/rule.md` ไม่ถูกแก้ (git diff สะอาด); rule ใหม่อยู่ใน `./rule.md` §2 ครบ
- [ ] ไม่มีลิงก์เสีย/path ที่ไม่มีอยู่จริงในเอกสารที่แก้
