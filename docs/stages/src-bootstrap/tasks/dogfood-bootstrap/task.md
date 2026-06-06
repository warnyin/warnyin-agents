# Task — dogfood-bootstrap

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `dogfood-bootstrap` |
| **Slice อ้างอิง** | `design.md` slice #4 |
| **Component** | `installer` (dev tooling + gitignore/scaffold) |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
> ส่งมอบ **กลไก dogfood/bootstrap** ครบ end-to-end (design slice #4, คุม R3): หลัง `npm run setup:dogfood` repo คืน dogfood env ที่ root (gitignored) ด้วย release เสถียร + ชี้อ่าน `CONTRIBUTING.md`; `npm run setup:sandbox` ติดตั้ง v-next ลง temp เพื่อ test version skew — โดย `git status` สะอาด (ไม่มี dogfood/docs collision หลุดขึ้น git)

## ⚠️ Prerequisite (นอก workflow — ทำก่อน verify acceptance ข้อ 1/2)
> **publish 0.6.0 (main ปัจจุบัน, `.warnyin/` layout) ขึ้น npm ก่อน** — เป็น dogfood baseline (user decision, ดู `./issue.md` BK-1 resolved) · `setup:dogfood` `npx @latest` ต้องได้ ≥0.6.0 (.warnyin layout) ไม่งั้น acceptance ข้อ 1 (root มี `.warnyin/`) + ข้อ 2 (git สะอาด) FAIL กับ 0.5.2 (layout เก่า) · publish 0.6.0 อิสระจาก restructure (installer วาง `.warnyin/` ลง target เหมือนเดิม) · topic นี้ → bump **0.7.0**

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** `tasks/move-source-to-src` (T1 — ต้องมี `src/bin/cli.mjs` ใช้ได้ + `package.json bin`/`scripts.test` ขั้นต่ำ)
- **ต้องทำหลัง:** `tasks/packaging-config` (T2 — **ห้าม parallel กับ T2**: ทั้งคู่แก้ `package.json` (T2 = `files`/`bin`, task นี้ = `scripts`) → shared file ห้ามชนกัน · Tech Lead S4) · ไม่ผูกกับ T3 เชิง functional
- **ปลดล็อกให้:** `tasks/docs-sync` (T5 — documents final state รวม CONTRIBUTING/setup scripts/gitignore)
- **ส่ง output ต่อ:** โครง root หลัง transition (gitignored dogfood + CONTRIBUTING.md + docs project/infra) ให้ T5 อ้างใน techstack/codemap
- **ประสาน `git mv CLAUDE.md CONTRIBUTING.md`:** design §3/§5.3 ระบุ mv เป็นขั้นตอน transition — ถ้า T1 ทำ mv แล้ว task นี้แค่ rewrite เนื้อ; ถ้า T1 ยังไม่ทำ task นี้รัน `git mv CLAUDE.md CONTRIBUTING.md` เอง (ตรวจสถานะไฟล์ก่อนใน BUILD) — **อย่า mv ซ้ำ**

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)

- [ ] 1. **`.gitignore`** — เพิ่มกลุ่ม dogfood patterns **root-anchored ทุกบรรทัด** (`/​.warnyin/`, `/​.claude/commands/warnyin/`, `/​.claude/agents/`, `/CLAUDE.md`, `/AGENTS.md`) ใต้คอมเมนต์อธิบาย regen ด้วย `npm run setup:dogfood` — _ผลลัพธ์:_ dogfood layer ไม่ติด git, source ใน `src/` ปลอดภัย
- [ ] 2. **`CONTRIBUTING.md`** — ยืนยัน/รัน `git mv CLAUDE.md CONTRIBUTING.md` (ดู §2 ประสาน T1) แล้ว **rewrite โฟกัส contributor**: zero-dep/ESM, พัฒนา v-next ใน `src/`, วิธี test ผ่าน `setup:sandbox`, สถานะ workflow 5 stage — _ขึ้นกับ:_ root CLAUDE.md เดิม (dev-instructions) เป็นฐาน
- [ ] 3. **`src/scripts/setup-dogfood.mjs`** — (1) `spawnSync('npx', ['--yes','@warnyin/agents@latest'], {cwd:repoRoot, stdio:'inherit', shell:process.platform==='win32'})` (2) append pointer "ดู CONTRIBUTING.md" ต่อท้าย root CLAUDE.md **idempotent** (marker check) (3) comment policy review diff payload — _ขึ้นกับ 2:_ pointer ชี้ CONTRIBUTING.md ที่มีแล้ว
- [ ] 4. **`src/scripts/setup-sandbox.mjs`** — `mkdtempSync(path.join(os.tmpdir(),'wy-sandbox-'))` → `spawnSync(process.execPath,[path.join(repoRoot,'src','bin','cli.mjs')],{cwd:dir,stdio:'inherit'})` → print path — _ผลลัพธ์:_ v-next ติดตั้งใน temp
- [ ] 5. **`package.json scripts`** — เพิ่ม `"setup:dogfood":"node src/scripts/setup-dogfood.mjs"`, `"setup:sandbox":"node src/scripts/setup-sandbox.mjs"` (อย่าแตะ `files`/`bin` ที่ T2 คุม) — _ขึ้นกับ 3,4_
- [ ] 6. **กัน docs collision (BL-3)** — สร้าง `docs/project.md` + `docs/infra.md` + `docs/stages/achieved/.gitkeep` เป็น repo doc จริง (infra.md เขียนพอกัน seed: runbook transition design §5.3 + กฎ cross-platform npm scripts; เนื้อเต็ม promote ตอน SHIP) — _ผลลัพธ์:_ seedDocs/ensureScaffold ของ release skip หมด → `git status --porcelain docs/` ว่าง

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `.gitignore` (เพิ่มกลุ่ม dogfood)
- `CLAUDE.md` (root) → `CONTRIBUTING.md` (git mv + rewrite)
- `src/scripts/setup-dogfood.mjs` (สร้างใหม่)
- `src/scripts/setup-sandbox.mjs` (สร้างใหม่)
- `package.json` (เพิ่มเฉพาะ `scripts.setup:dogfood`/`setup:sandbox` — **ห้ามแตะ `files`/`bin`**)
- `docs/project.md`, `docs/infra.md`, `docs/stages/achieved/.gitkeep` (สร้างใหม่ กัน collision)
> **ห้ามแตะ:** `src/bin/cli.mjs` (T1), `package.json files`/`bin` + `src/scripts/verify-pack.mjs` (T2), `src/tests/` (T3)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] (prerequisite) 0.6.0 publish บน npm แล้ว → `npm view @warnyin/agents version` ≥ 0.6.0 (.warnyin layout)
- [ ] `npm run setup:dogfood` จาก repo root → root มี `.warnyin/`, `.claude/commands/warnyin/`, `.claude/agents/`, `CLAUDE.md`, `AGENTS.md` (ติด `.gitignore`) + `/warnyin:*` ใช้ได้
- [ ] `git status --porcelain docs/` **ว่าง** หลัง setup:dogfood (BL-3 ปิด)
- [ ] รัน `setup:dogfood` ซ้ำ → pointer ใน root CLAUDE.md **ไม่ append ซ้อน** (idempotent)
- [ ] `npm run setup:sandbox` → temp dir (`os.tmpdir()`) มี v-next ครบ + print path; รันบน Windows ได้
- [ ] `CONTRIBUTING.md` มีจริงที่ root (committed) เนื้อ dev-instructions โฟกัส contributor
- [ ] `.gitignore` dogfood patterns root-anchored ทุกบรรทัด (`/` นำหน้า)
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md` (zero-dep/ESM/idempotent/cross-platform; spawn array args ไม่ shell ยกเว้น npx win32)

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Design (how) ของ topic: `../../design.md` (§3, §4.2, §4.5, §5.1-5.3, §7, §9 BL-3)
