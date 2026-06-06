# Task — packaging-config

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่โยนให้ sub-agent ทำใน BUILD — self-contained เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `packaging-config` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (packaging/CI) |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
**publish config ถูกต้อง** หลังย้าย source → `src/` — `package.json files`/`verify:pack` + `src/scripts/verify-pack.mjs` ให้ tarball ผู้ใช้ติด payload ครบ (`src/.warnyin/workflow/`, `src/.claude/commands/warnyin/`, `src/AGENTS.md`) และ tooling/งานจริง/dogfood ไม่หลุด (R1+R2) + แก้ CI job pack-verify เรียกผ่าน npm script (BL-1) — verify ได้ในตัวด้วย `npm pack --dry-run --json` + verify-pack unit

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** `tasks/move-source-to-src` (T1) — ต้องมีโครง `src/` + `package.json bin`→`src/bin/cli.mjs` + `src/scripts/verify-pack.mjs` (git mv แล้ว) ก่อน
- **ปลดล็อกให้ / ต้องทำก่อน:** `tasks/dogfood-bootstrap` (T4) — T4 แก้ `package.json scripts.setup:*`
- **★ ห้าม parallel กับ T4** (Tech Lead S4 / design §7): T2↔T4 แชร์ `package.json` → ต้อง serialize (T2 ก่อน T4); ไม่ผูกกับ T3 เชิง functional (ขนานกับ T3 ได้)
- ส่ง output ต่อ: `package.json` ที่มี `files` granular + `scripts.verify:pack` พร้อม → T4 ต่อยอด `scripts.setup:*` ได้

## 3. Sub-tasks
- [ ] 1. แก้ `package.json files` → `["src/bin","src/.warnyin","src/.claude/commands","src/.claude/agents","src/AGENTS.md","README.md","CHANGELOG.md","LICENSE"]` (ตัด `src/tests`/`src/scripts`; ระบุ nested dotfolder ชัด) — _ผลลัพธ์: allowlist granular_
- [ ] 2. เพิ่ม `package.json scripts."verify:pack"` = `node src/scripts/verify-pack.mjs` (ไม่แตะ `bin` ที่ T1 ตั้งไว้, **ไม่แตะ `setup:*`**) — _ขึ้นกับ 1: ไฟล์เดียวกัน_
- [ ] 3. ปรับ `src/scripts/verify-pack.mjs` → `ALLOWED_PREFIX`/`ALLOWED_FILE`/`hasWarnyin`+`hasClaude`/denylist+tripwire ตาม spec §7 — _ขึ้นกับ src/ จาก T1_
- [ ] 4. **BL-4:** refactor verify-pack แยก pure function `checkFiles(files)→errors[]` ออกจาก `npm pack` + เพิ่ม unit ป้อน list ปลอม (`src/tests/`) assert จับได้ — _ขึ้นกับ 3_
- [ ] 5. **BL-1:** แก้ `.github/workflows/ci.yml` job pack-verify `node scripts/verify-pack.mjs` → `npm run verify:pack`; ตรวจ `npm test` step ยังถูก — _ขึ้นกับ 2 (npm script ต้องมีก่อน)_

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `package.json` — เฉพาะ `files` + `scripts.verify:pack` (คง `bin` จาก T1; **ห้าม** `scripts.setup:*` = T4)
- `src/scripts/verify-pack.mjs` — allowlist/denylist/assertion + refactor `checkFiles`
- `src/tests/` — เพิ่ม unit test ของ verify-pack `checkFiles` (BL-4)
- `.github/workflows/ci.yml` — job pack-verify step เดียว
- **ห้ามแตะ:** `src/bin/cli.mjs`, โค้ด/ไฟล์อื่นนอกรายการนี้

## 5. Acceptance criteria
- [ ] `npm pack --dry-run --json` → payload มี `src/.warnyin/workflow/`, `src/.claude/commands/warnyin/`, `src/AGENTS.md`, `src/bin/cli.mjs`
- [ ] payload **ไม่มี** `src/tests/`, `src/scripts/`, `docs/`, `.github/` หลุด
- [ ] `npm run verify:pack` ผ่าน (exit 0) — `hasWarnyin && hasClaude` ผ่าน, denylist/tripwire ไม่จับ
- [ ] verify-pack unit จับ leak ปลอม: ป้อน `files[]` ที่มี `src/tests/...` → `checkFiles` คืน error (BL-4)
- [ ] `.github/workflows/ci.yml` job pack-verify เรียก `npm run verify:pack`; `npm test` step ยังถูก (BL-1)
- [ ] CI security baseline ยัง compliant (`docs/rule.md` §3)
- [ ] ผ่าน test ตาม `spec.md` (test-flow §7)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Design ต้นทาง: `../design.md` §2 slice2 · §4.3 · §4.4 · §7 · §9 BL-1/BL-4
