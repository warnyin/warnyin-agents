# Rule — docs-sync

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง follow + rule ใหม่ที่เสนอ (รอ SHIP)

## 1. Rule ที่ต้อง follow

### 1.1 ⛔ ห้ามแก้ rule/standard กลางตอน BUILD (กฎ build playbook — สำคัญที่สุดของ task นี้)
- task นี้แก้ได้เฉพาะ **เอกสารสะท้อนโค้ด (descriptive):** `docs/techstack/installer/{structure,test,about}.md` + `docs/codemap/{index,architecture}.md`
- **`docs/rule.md` ห้ามแตะเด็ดขาด** — แม้รู้ว่า §4/§5 อ้าง path เก่า (`bin/cli.mjs`, `tests/installer.test.mjs`) ที่ตอนนี้ผิดแล้ว ก็ห้ามแก้ → note ไว้ §2 รอ SHIP promote
- **`docs/techstack/installer/rule.md` + `standard.md` = rule/standard ระดับ component → ห้ามแก้ตอน BUILD เช่นกัน** (build playbook: "ห้ามแก้ rule/standard กลางใน docs/"; SHIP เป็นผู้ promote จาก note) — path/wording ที่ผิดหลังย้าย (รวม `installer/rule.md` บรรทัด guard "ต้อง error" ที่กลายเป็น no-op, harness path ใน `standard.md`) + กฎใหม่ → note §2 รอ SHIP
- `docs/infra.md` / `docs/project.md` — สร้างใน T4 แล้ว เนื้อหา infra เต็มรอ SHIP (design §9) → task นี้ **เช็คความครบ ไม่เพิ่มเนื้อหา infra/rule ใหม่**

### 1.2 codemap (จาก `.warnyin/workflow/codemap.md`)
- [ ] ทุกอย่างมาจากโค้ดจริง ณ วันสแกน — ห้ามเดา
- [ ] ทุกไฟล์ codemap < 1000 tokens + มี freshness header
- [ ] `index.md` ลิงก์ครบทุกไฟล์ codemap; diff > 30% ขออนุมัติ user ก่อน

### 1.3 docs ตรงโค้ดจริง (จาก `docs/rule.md` §2 — ภาษา/CHANGELOG; ที่ follow ไม่ใช่ที่แก้)
- [ ] doc เป็นภาษาไทย กระชับ ตามสไตล์ repo
- [ ] ไม่ทิ้ง path เก่าค้างใน doc ที่แก้

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อย promote เข้า `docs/rule.md` / techstack rule)
> ห้ามเขียนลง rule กลางตอนนี้ — ลิสต์ไว้ให้ SHIP พิจารณา promote

- [ ] **source/dogfood แยกชั้น (bootstrap):** source ของ warnyin อยู่ `src/**` (committed, publish) เท่านั้น; root `.warnyin/`/`.claude/`/`CLAUDE.md`/`AGENTS.md` เป็น dogfood ที่ install จาก release และ **gitignored** — ห้าม commit · เหตุผล: แยก source layer จาก dogfood layer (self-hosting) กันแก้ workflow แล้วพังกลางงาน
- [ ] **`.gitignore` dogfood ต้อง root-anchored:** ทุก pattern ของ dogfood ต้องขึ้นต้น `/` (เช่น `/​.claude/agents/` ไม่ใช่ `.claude/agents/`) · เหตุผล: ไม่ anchor จะ match `src/.claude/agents/` ด้วย → source หายจาก git (design §3 / SA S2 / Infra S4)
- [ ] **npm scripts ต้อง cross-platform:** dev tooling (`setup:dogfood`/`setup:sandbox`) เป็น **node script** ใน `src/scripts/` (zero-dep, ESM) ไม่ใช่ shell oneliner; ใช้ `os.tmpdir()`+`mkdtempSync` ห้าม hardcode `/tmp`; spawn array args ห้าม `shell:true` ยกเว้นเรียก npx บน win32 (design §4.5 / Infra S2 / Security S3)
- [ ] **files allowlist granular สำหรับ nested dotfolder ใน `src/`:** `src/.warnyin`, `src/.claude/commands`, `src/.claude/agents` ต้องระบุชัดใน `package.json files` (npm ไม่รวม nested dotfolder ให้อัตโนมัติ — ขยายผลบทเรียน 0.6.0) · pack-verify เป็นตัวพิสูจน์ (design §4.3/§4.4)
- [ ] **อัปเดต path/wording ใน rule/standard กลางที่ผิดหลังย้าย (SHIP เท่านั้น):**
  - `docs/rule.md` §4–5 อ้าง `bin/cli.mjs`/`tests/installer.test.mjs`/`scripts/verify-pack.mjs` → `src/` prefix
  - `docs/techstack/installer/rule.md` — path เก่า + บรรทัด "guard self-install **ต้อง error**" → แก้เป็น defensive no-op หลังย้าย (design §4.1; ไม่ใช่แค่ path — wording ผิดความจริง)
  - `docs/techstack/installer/standard.md` — harness `cliPath = new URL('../bin/cli.mjs', ...)` relative กับ `src/tests/` → `src/bin/cli.mjs`; verify-pack pattern (allowlist granular + testable `checkFiles`) ตาม design §4.4
  - เหตุผล: rule/standard กลางต้องตรงโครงจริง แต่แก้ที่ SHIP ตามกฎ build (ห้ามแตะตอน BUILD)
