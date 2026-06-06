# Task — dogfood-bootstrap

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `dogfood-bootstrap` |
| **Slice อ้างอิง** | `design.md` slice #4 |
| **Component** | `installer` (dev tooling + gitignore/scaffold) |
| **สถานะ** | `✅ verify เสร็จ` (2026-06-07 · live `setup:dogfood` e2e ผ่านจริง — npx primary path + docs/ สะอาด BL-3 + idempotent) |

## 1. เป้าหมายของ task (vertical slice)
> ส่งมอบ **กลไก dogfood/bootstrap** ครบ end-to-end (design slice #4, คุม R3): หลัง `npm run setup:dogfood` repo คืน dogfood env ที่ root (gitignored) ด้วย release เสถียร + ชี้อ่าน `CONTRIBUTING.md`; `npm run setup:sandbox` ติดตั้ง v-next ลง temp เพื่อ test version skew — โดย `git status` สะอาด (ไม่มี dogfood/docs collision หลุดขึ้น git)

## ⚠️ Prerequisite (นอก workflow — ทำก่อน verify acceptance ข้อ 1/2)
> **publish 0.6.0 (main ปัจจุบัน, `.warnyin/` layout) ขึ้น npm ก่อน** — เป็น dogfood baseline (user decision, ดู `./issue.md` BK-1 resolved) · `setup:dogfood` `npx @latest` ต้องได้ ≥0.6.0 (.warnyin layout) ไม่งั้น acceptance ข้อ 1 (root มี `.warnyin/`) + ข้อ 2 (git สะอาด) FAIL กับ 0.5.2 (layout เก่า) · publish 0.6.0 อิสระจาก restructure (installer วาง `.warnyin/` ลง target เหมือนเดิม) · topic นี้ → bump **0.7.0**

## ⚠️ BUILD finding (main loop พบจริงตอน restore dogfood — ต้องจัดการใน task นี้)
> **`npx @warnyin/agents@<ver>` รันบนเครื่อง Windows นี้ล้มเหลว:** `'warnyin-agents' is not recognized as an internal or external command` (ทั้ง Git Bash + PowerShell + `npx --package=... -- warnyin-agents`) — bin-shim ของ npx ไม่ถูก resolve. cli.mjs มี shebang `#!/usr/bin/env node` ครบ. workaround ที่พิสูจน์แล้วว่าได้: `npm pack @warnyin/agents@<ver>` → extract → `node <pkg>/bin/cli.mjs` (cwd=repoRoot).
> **สิ่งที่ T4 ต้องทำ:** (1) ทำ `setup-dogfood.mjs` ให้ robust — ถ้า npx ล้ม ให้ตรวจจับ exit code/stderr แล้ว **fallback** (เช่น pack+extract+node) หรืออย่างน้อย exit ด้วย error message ชัดเจน **อย่ารายงานเขียวทั้งที่ dogfood ไม่ถูกติดตั้ง** · (2) ถ้าบน Windows ยังติด → verify acceptance #2/#3 (e2e install) ด้วย fallback path + **document ข้อจำกัด npx-Windows** เป็น dev-env limitation (คล้าย verify-pack ENOENT, troubleshooting #4) + บันทึก troubleshooting entry · (3) คง array-args `shell:win32-only` ตาม rule §5 (ห้าม `shell:true` ข้าม platform กับ user input — แต่ pack+node ไม่ผ่าน user input) — เลือก approach ที่ปลอดภัย+ทำงานจริงข้าม platform

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** `tasks/move-source-to-src` (T1 — ต้องมี `src/bin/cli.mjs` ใช้ได้ + `package.json bin`/`scripts.test` ขั้นต่ำ)
- **ต้องทำหลัง:** `tasks/packaging-config` (T2 — **ห้าม parallel กับ T2**: ทั้งคู่แก้ `package.json` (T2 = `files`/`bin`, task นี้ = `scripts`) → shared file ห้ามชนกัน · Tech Lead S4) · ไม่ผูกกับ T3 เชิง functional
- **ปลดล็อกให้:** `tasks/docs-sync` (T5 — documents final state รวม CONTRIBUTING/setup scripts/gitignore)
- **ส่ง output ต่อ:** โครง root หลัง transition (gitignored dogfood + CONTRIBUTING.md + docs project/infra) ให้ T5 อ้างใน techstack/codemap
- **ประสาน `git mv CLAUDE.md CONTRIBUTING.md`:** design §3/§5.3 ระบุ mv เป็นขั้นตอน transition — ถ้า T1 ทำ mv แล้ว task นี้แค่ rewrite เนื้อ; ถ้า T1 ยังไม่ทำ task นี้รัน `git mv CLAUDE.md CONTRIBUTING.md` เอง (ตรวจสถานะไฟล์ก่อนใน BUILD) — **อย่า mv ซ้ำ**

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)

- [x] 1. **`.gitignore`** — เพิ่มกลุ่ม dogfood patterns **root-anchored ทุกบรรทัด** (`/​.warnyin/`, `/​.claude/commands/warnyin/`, `/​.claude/agents/`, `/CLAUDE.md`, `/AGENTS.md`) ใต้คอมเมนต์อธิบาย regen ด้วย `npm run setup:dogfood` — ✅ verified: `git check-ignore` จับ root dogfood ครบ, `src/` ไม่ถูก ignore (source ปลอดภัย)
- [x] 2. **`CONTRIBUTING.md`** — `git mv CLAUDE.md CONTRIBUTING.md` (T1 ไม่ได้ mv → task นี้ทำ) แล้ว rewrite โฟกัส contributor (2-layer bootstrap, zero-dep/ESM/cross-platform, dev v-next ใน `src/`, test ผ่าน `setup:sandbox`, workflow 5 stage) ✅
- [x] 3. **`src/scripts/setup-dogfood.mjs`** — npx (shell:win32) + **fallback npm pack→extract(tar)→node cli.mjs** (BUILD finding: npx-Windows ENOENT) + append pointer idempotent (marker `CONTRIBUTING.md`) + comment policy review diff ✅ (idempotency พิสูจน์ในแลบ: 3 run → 1 pointer; live npx run รอ VERIFY)
- [x] 4. **`src/scripts/setup-sandbox.mjs`** — `mkdtempSync(os.tmpdir(),'wy-sandbox-')` → spawn `process.execPath [cli.mjs]` array args ไม่ shell → print path ✅ **รันจริงบน Windows ผ่าน** (sandbox 71 ไฟล์, payload ครบ)
- [x] 5. **`package.json scripts`** — เพิ่ม `setup:dogfood`/`setup:sandbox` (ไม่แตะ `files`/`bin`/`verify:pack` ที่ T2 คุม) ✅
- [x] 6. **กัน docs collision (BL-3)** — `docs/project.md` + `docs/infra.md` เขียนเป็น repo doc จริง (`docs/stages/achieved/.gitkeep` + `context.md` มีอยู่แล้ว) ✅ พิสูจน์ deterministic: simulate seedDocs/ensureScaffold ของ payload 0.6.0 → CREATE NONE ใน `docs/`

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `.gitignore` (เพิ่มกลุ่ม dogfood)
- `CLAUDE.md` (root) → `CONTRIBUTING.md` (git mv + rewrite)
- `src/scripts/setup-dogfood.mjs` (สร้างใหม่)
- `src/scripts/setup-sandbox.mjs` (สร้างใหม่)
- `package.json` (เพิ่มเฉพาะ `scripts.setup:dogfood`/`setup:sandbox` — **ห้ามแตะ `files`/`bin`**)
- `docs/project.md`, `docs/infra.md`, `docs/stages/achieved/.gitkeep` (สร้างใหม่ กัน collision)
> **ห้ามแตะ:** `src/bin/cli.mjs` (T1), `package.json files`/`bin` + `src/scripts/verify-pack.mjs` (T2), `src/tests/` (T3)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [x] (prerequisite) 0.6.0 publish บน npm แล้ว → `npm view @warnyin/agents version` = **0.6.0** (latest, .warnyin layout) ✅
- [x] `npm run setup:dogfood` จาก repo root → root มี `.warnyin/`, `.claude/commands/warnyin/`, `.claude/agents/`, `CLAUDE.md`, `AGENTS.md` (ติด `.gitignore`) + `/warnyin:*` ใช้ได้ — ✅ **VERIFY ผ่าน live** (TC-4): npx primary path (`shell:true` win32) สำเร็จ exit 0, restore root `CLAUDE.md` ที่หายไปจริง (สร้างใหม่ 1 · ข้าม 70), `/warnyin:*` 10 commands ใช้ได้, dogfood ทั้งหมดติด `.gitignore` (git status ไม่โชว์) — fallback (npm pack→extract→node) ไม่ถูกเรียกรอบนี้แต่ verify แยกแล้วว่าทำงาน (resolve cli=`bin/cli.mjs` + install exit 0 กับ tarball 0.6.0 จริง)
- [x] `git status --porcelain docs/` **ว่าง** หลัง setup:dogfood (BL-3 ปิด) — ✅ พิสูจน์ deterministic (simulate seedDocs/ensureScaffold payload 0.6.0 → CREATE NONE)
- [x] รัน `setup:dogfood` ซ้ำ → pointer ใน root CLAUDE.md **ไม่ append ซ้อน** (idempotent) — ✅ พิสูจน์ในแลบ (3 run → 1 occurrence)
- [x] `npm run setup:sandbox` → temp dir (`os.tmpdir()`) มี v-next ครบ + print path; รันบน Windows ได้ — ✅ **รันจริง** (`C:\...\Temp\wy-sandbox-*`, 71 ไฟล์, .warnyin/workflow/stages + .claude/commands/warnyin ครบ)
- [x] `CONTRIBUTING.md` มีจริงที่ root (committed) เนื้อ dev-instructions โฟกัส contributor ✅
- [x] `.gitignore` dogfood patterns root-anchored ทุกบรรทัด (`/` นำหน้า) ✅
- [x] ผ่าน test ตาม `spec.md` (test-flow) — ✅ `npm test` 18/18 เขียว; test-flow รายข้อ verify (ดู build.md)
- [x] ทำตาม `rule.md` และ `standard.md` (zero-dep/ESM/idempotent/cross-platform; spawn array args ไม่ shell ยกเว้น npx win32) ✅

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Design (how) ของ topic: `../../design.md` (§3, §4.2, §4.5, §5.1-5.3, §7, §9 BL-3)
