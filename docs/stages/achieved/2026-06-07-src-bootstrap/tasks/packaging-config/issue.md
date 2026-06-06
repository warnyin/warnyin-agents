# Issue — packaging-config

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.9)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD — **สร้างเฉพาะเมื่อพบ issue**
> dry-run นี้ทดสอบ npm pack จริงใน 3 scratch package (temp dir, **ไม่แตะไฟล์ repo**) + simulate `checkFiles` logic เต็มทุกเคส test-flow §7

## 1. สรุป
- ผลสแกน: blocker **0** ข้อ · defer **2** ข้อ
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (เข้า BUILD ได้) — defer 2 ข้อเป็น implementation note + เรื่องที่ design/acceptance รับทราบอยู่แล้ว

## 2. รายการ issue
| # | ประเภท | จุดที่พบ (ไฟล์/spec/โค้ด) | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | `src/scripts/verify-pack.mjs` (BL-4 refactor) · standard §4 · design §4.4/§9 BL-4 | BL-4 ต้องให้ unit `import { checkFiles }` ได้โดย **ไม่ trigger `npm pack`** — โค้ดเดิมเรียก `execFileSync('npm', ...)` ที่ **module top-level** (line 3, รันตอน import). ถ้า refactor แล้วยังปล่อย `npm pack` ลอย top-level → import ใน test จะรัน npm pack → **ENOENT บน Windows dev** (เทียบ #2) → unit พังตอน import. ต้องครอบ `npm pack` ด้วย main-guard. **แต่ design/standard ไม่ระบุ idiom** และ `import.meta.main` เป็น `undefined` บน **node 20** (เพิ่งเสถียร node 22.x/24) → ถ้า BUILD เผลอใช้ `import.meta.main` block จะไม่รันบน node 20 เลย | ใช้ main-guard **แบบ portable**: `if (fileURLToPath(import.meta.url) === process.argv[1]) { ...npm pack + checkFiles... }` (ทดสอบแล้วผ่าน node 20/22/24) — **ห้ามใช้ `import.meta.main`**. export `checkFiles` ออกนอก guard. ไม่ต้องแก้ design (ตี logic ตรงแล้ว) — note ให้ BUILD agent ใช้ idiom นี้ | resolved (note) |
| 2 | defer | `package.json scripts.verify:pack` · acceptance §5 ข้อ "npm run verify:pack ผ่าน" + test-flow §7 บรรทัดสุดท้าย · troubleshooting #4 | dry-run ยืนยัน (PowerShell native win32): `execFileSync('npm', ['pack',...])` → **ENOENT** บน Windows (npm จริงคือ `npm.cmd`, execFile ไม่ทำ PATHEXT resolution); ผ่านเฉพาะ `shell:true` ซึ่ง rule/standard **ห้าม**. แปลว่า dev บน Windows (เครื่องนี้) **รัน `npm run verify:pack` ตรง ๆ ไม่ได้** | **defer ที่ design/acceptance รับทราบแล้ว** — gate จริงคือ CI ubuntu (BL-1). acceptance §5 ข้อ "verify-pack unit จับ leak" + spec test-flow ตรวจ logic ผ่าน unit (ไม่พึ่ง npm). dev Windows พิสูจน์ payload ด้วย `npm pack --dry-run --json` แล้ว apply allowlist เอง (troubleshooting #4 / test-suite-reloc spec §27). **ไม่ต้องเพิ่ม `shell:true`** (ผิด rule). ระหว่าง BUILD ถ้า build-agent รันบน Windows ต้องใช้วิธีนี้ verify | resolved (defer ตาม design) |

> - **blocker** — ทำให้ implement ตาม spec ไม่ได้ → ต้องแก้ DESIGN ก่อนเข้า BUILD
> - **defer** — ตัดสินใจ/ทำทีหลังได้ ไม่ block การเริ่ม BUILD แต่ต้องบันทึกและให้ user รับทราบ

## 3. ผลการแก้ไข
ไม่ต้องแก้ `design.md`/`task.md`/`spec.md` — dry-run ยืนยันว่า design ถูกต้องทั้ง logic และ contract

ผลทดสอบจริง (scratch package ใน temp, ไม่แตะ repo):
- **R1 nested dotfolder (check #1):** `npm pack --dry-run --json` กับ `files:["src/bin","src/.warnyin","src/.claude/commands","src/.claude/agents","src/AGENTS.md",...]` → payload **ติด** `src/.warnyin/workflow/`, `src/.claude/commands/warnyin/`, `src/.claude/agents/`, `src/.warnyin/installer/templates/CLAUDE.md` ครบ; `src/tests/`, `src/scripts/`, `docs/` **ไม่ติด** → บทเรียน 0.6.0 (ระบุ dotfolder ชัด) ครอบ nested ได้จริง → **ไม่ blocker**
- **path format (check #2):** `files[].path` = POSIX `src/.warnyin/workflow/...` (forward slash, **ไม่มี prefix package-name**) → allowlist string-prefix ใน design §4.4 match พอดี → **ไม่ blocker**
- **npm pack `--json` stdout สะอาด:** `npm warn` ไป **stderr** (ไม่ปน stdout) → `JSON.parse(stdout)` ปลอดภัย (schema `[{files:[{path}]}]`)
- **checkFiles logic (simulate เต็ม):** ป้อน payload จริง → `errors=[]`; ป้อน leak ปลอม (`src/tests/`, `src/scripts/`, `docs/`, root `.warnyin/`) → จับครบ (deny-prefix); ขาด `src/.warnyin/workflow/` → assertion จับ; tripwire `settings.local.json`/`.env`/`.tgz` → จับ; `src/.claude/skills/` → not-in-allowlist จับ (narrow prefix ทำงาน) → **ทุกเคส test-flow §7 ผ่านได้จริง**
- **BL-1 ci.yml (check #4):** job `pack-verify` มี `checkout`+`setup-node@v5 (node 22)` ครบแล้ว; แก้แค่บรรทัด `- run: node scripts/verify-pack.mjs` → `- run: npm run verify:pack` (1 step, ไม่พึ่ง path เก่าอื่น); `permissions: contents: read` / SHA-pin / ไม่มี secrets / ไม่มี npm ci → security baseline (rule §3) ยัง compliant; job `test` (`npm test`) แยกอิสระ ไม่กระทบ → **ไม่ blocker**
- **shared package.json กับ T4 (check #5):** acceptance task นี้ครบในตัว — แตะ `files`+`scripts.verify:pack` เท่านั้น, ไม่พึ่ง `setup:*` (ของ T4); verify ผ่าน `npm pack --dry-run` + unit ได้โดยไม่ต้องมี T4 → **ไม่ blocker** (serialize T2→T4 ตาม §7 ถูกต้อง)
- **dependency T1 (check #7):** ทดสอบเคส `src/` ยังไม่มี (T1 ยังไม่รัน — สถานะ repo ปัจจุบัน) → `npm pack` คืน payload เกือบว่าง (README+package.json, exit 0, **ไม่ error**) → `checkFiles` FAIL ที่ `hasWarnyin`/`hasClaude` assertion อย่างสะอาด (ไม่ crash) → ยืนยันว่าต้องรันหลัง T1 จริง (dependency ถูก, ระบุใน task §2 แล้ว) → **ไม่ blocker**
