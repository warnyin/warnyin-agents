# Design (How) — แยก source ไป `src/` + dogfood ด้วย release (bootstrap)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ทำงาน end-to-end + verify ได้ในตัว

## 1. ภาพรวมสถาปัตยกรรม
- **component ที่เกี่ยวข้อง:** `installer` (`docs/techstack/installer/`) เป็น component เดียวที่กระทบโดยตรง — แต่กระทบ **ทุกไฟล์โครงสร้าง** (path เปลี่ยนหมด)
- **แนวคิดหลัก — 2 layer แยกขาด:**
  - **SOURCE layer** (`src/`, committed, publish) = warnyin v-next ที่กำลังพัฒนา
  - **DOGFOOD layer** (root `.warnyin/`/`.claude/`/`CLAUDE.md`/`AGENTS.md`, gitignored, installed จาก release) = ตัว workflow ที่ "ใช้ทำงาน" พัฒนา `src/`
- **กุญแจที่ทำให้ง่าย:** ย้าย cli ไป `src/bin/cli.mjs` → `pkgRoot = resolve(dirname(cli), '..')` = `src/` พอดี → payload (`src/.warnyin`, `src/.claude`, `src/AGENTS.md`) เป็น sibling ของ `bin/` → **CORE constant + copy logic เดิมใช้ได้แทบทั้งหมด** เพราะ path ใน CORE เป็น relative กับ pkgRoot อยู่แล้ว
- **mirror layout:** โครงใน `src/` = โครงตอน install เป๊ะ → installer = "copy `src/<path>` → `target/<path>`" ตรงไปตรงมา ไม่ต้องมี mapping table

## 2. Vertical slices
> หนึ่ง slice = หนึ่งหน่วยที่ทิ้งไว้แล้ว repo ยัง verify ได้ → จะกลายเป็น 1 task
> ลำดับ T1 → (T2, T3 ขนาน) → T4 → T5 (ดู §7)

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **ย้าย source → `src/` + installer ยัง install ถูก** — git mv ทุกอย่างเข้า `src/`, ปรับ `src/bin/cli.mjs` (pkgRoot/guard) ให้ copy `src/* → target/*` ถูก **+ แก้ `package.json` ขั้นต่ำ (`bin`→src/bin/cli.mjs) ให้ `npm test` รันได้** (SA S3 — slice ต้อง verify ได้ end-to-end ในตัว) | source-move · installer · package.json(min) · test | `tasks/move-source-to-src/` |
| 2 | **publish config ถูกต้อง** — `package.json` bin/files allowlist + `src/scripts/verify-pack.mjs` ให้ payload ติดครบ, tooling/docs ไม่หลุด (คุม R1+R2) **+ แก้ `.github/workflows/ci.yml` pack-verify step → `npm run verify:pack`** (ไม่ hardcode path · BL ci.yml) | packaging · verify-pack · CI | `tasks/packaging-config/` |
| 3 | **test suite เขียวหลังย้าย** — ย้าย test ไป `src/tests/`, แก้ `scripts.test` ให้ discover ข้าม node 20/22/24, 9 เคสผ่าน (คุม R4) · acceptance = CI matrix เห็น **9 pass count** ไม่ใช่แค่ exit 0 | test · CI matrix | `tasks/test-suite-relocation/` |
| 4 | **กลไก dogfood/bootstrap** — `.gitignore` + `npm run setup:dogfood` (install release + ชี้ CONTRIBUTING.md) + `npm run setup:sandbox` (install src→temp) + แยก `CONTRIBUTING.md` จาก root CLAUDE.md (คุม R3) | gitignore · npm scripts · dev-docs | `tasks/dogfood-bootstrap/` |
| 5 | **docs ตรงโครงใหม่** — `docs/techstack/installer/{structure,test,about,standard,rule}.md` + `docs/codemap/*` + note `docs/rule.md` (รอ SHIP) | docs | `tasks/docs-sync/` |

## 3. Data model / โครงไฟล์ (state ก่อน → หลัง)
> ไม่มี DB — "data model" ของ topic นี้คือ **โครงไฟล์**

### git mv mapping (T1)
```
bin/                                  → src/bin/
tests/                                → src/tests/
scripts/                              → src/scripts/
.warnyin/                             → src/.warnyin/        (รวม installer/templates/CLAUDE.md)
.claude/commands/warnyin/            → src/.claude/commands/warnyin/
.claude/agents/                       → src/.claude/agents/
AGENTS.md                             → src/AGENTS.md
CLAUDE.md (root, dev-instructions)   → CONTRIBUTING.md       (rewrite โฟกัส dev — T4)
```

### root หลัง transition
```
committed:  src/**  package.json  README.md  CHANGELOG.md  LICENSE
            CONTRIBUTING.md  docs/**  .github/**  .gitignore
gitignored (installed dogfood จาก release — anchored ด้วย / นำหน้าทุกบรรทัด):
            /.warnyin/
            /.claude/commands/warnyin/
            /.claude/agents/
            /CLAUDE.md
            /AGENTS.md
```
> **★ anchor บังคับ** (SA S2 / Infra S4): ทุก pattern ต้องขึ้นต้น `/` (root-anchored) — ถ้าเขียน `.claude/agents/` ลอย ๆ (ไม่ anchor) จะไป match `src/.claude/agents/` ด้วย → **source หายจาก git**
> `.claude/` ที่ root: ignore **เฉพาะ subdir ที่ installer วาง** (`commands/warnyin`, `agents`) — ไม่ ignore ทั้ง `.claude/`; `.gitignore` เดิมมี `.claude/settings.local.json`, `.claude/skills/` อยู่แล้ว
> **docs collision (Security S2 / Infra S5 — พิสูจน์แล้ว):** release installer รัน `seedDocs()` + `ensureScaffold()` ลง root ด้วย — แต่ seedDocs skip ทุก `[...]` (features/techstack template) + ไฟล์ที่มีอยู่ (rule/troubleshooting/codemap). เปื้อนจริงแค่ `docs/infra.md`, `docs/project.md` (ยังไม่มี) + `docs/stages/achieved/.gitkeep` → **แก้โดยสร้างไฟล์เหล่านี้เป็น repo doc จริงใน T4** (repo จำเป็นต้องมี `project.md` ตาม playbook §2 อยู่แล้ว) → seed/scaffold skip หมด → `git status` สะอาดหลัง setup:dogfood

## 4. Interface / contract
### 4.1 `src/bin/cli.mjs` (สัญญาเดิมคงไว้ — เปลี่ยนแค่ที่อยู่/guard)
- `pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')` → `src/` (ทั้งตอน npx release และตอนรันจาก repo)
- `CORE` (relative กับ pkgRoot) คงเดิม: `.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`, `.claude/agents`
- `installRootDoc('CLAUDE.md', pkgRoot/.warnyin/installer/templates/CLAUDE.md)`, `installRootDoc('AGENTS.md', pkgRoot/AGENTS.md)` → path ยังถูก (pkgRoot=src/)
- **guard ที่ต้องคิดใหม่:** เดิม `pkgRoot===target` กัน "รันใน repo ตัวเอง" — ตอนนี้ pkgRoot=`src/` ไม่มีทาง === target (repo root หรือ /tmp) → guard เดิมจะ **ไม่ trigger** ในเคส sandbox (ดี — `setup:sandbox` ต้อง install จาก src ลง /tmp ได้) แต่ก็แปลว่า guard เดิมหมดความหมาย → **ตัดสินใจ:** เก็บ guard ไว้ (กันเคส edge `target===src/`) แต่ปรับ comment ให้ตรงพฤติกรรมใหม่
- **CONTRIBUTING note:** release installer (0.6.0) ยังไม่รู้จัก CONTRIBUTING.md → การชี้ "อ่าน CONTRIBUTING.md" ทำใน **`setup:dogfood` script** (append หลัง npx) ไม่ใช่ในตัว cli (อย่าแก้พฤติกรรม installer payload เพื่อ repo เอง)

### 4.2 npm scripts (`package.json`)
```jsonc
"bin": { "warnyin-agents": "src/bin/cli.mjs" },
"scripts": {
  "test": "node --test",                 // bare → recurse discover src/tests/*.test.mjs (พิสูจน์แล้ว node 24; gate CI matrix 20/22/24 ใน T3)
  "verify:pack": "node src/scripts/verify-pack.mjs",
  "setup:dogfood": "node src/scripts/setup-dogfood.mjs",   // ดู §4.5 (cross-platform, idempotent)
  "setup:sandbox": "node src/scripts/setup-sandbox.mjs"    // ดู §4.5
},
"files": [ /* granular — ดู 4.3 */ ]
```

### 4.3 `files` allowlist (granular — คุม R2)
```
"files": [
  "src/bin",
  "src/.warnyin",
  "src/.claude/commands",
  "src/.claude/agents",
  "src/AGENTS.md",
  "README.md", "CHANGELOG.md", "LICENSE"
]
```
- **ตัด** `src/tests`, `src/scripts` (dev-only) — ไม่ใส่ใน list
- **dotfolder nested** (`src/.warnyin`, `src/.claude/*`) ต้องระบุชัด (บทเรียน 0.6.0 ขยายผล: ไม่ใช่แค่ top-level dotfolder — npm ก็ไม่รวม nested dotfolder ถ้าไม่ระบุ) → `verify-pack` เป็นตัวพิสูจน์ (R1)
- root `CLAUDE.md`/`AGENTS.md` **ไม่อยู่ใน list แล้ว** (เป็น dogfood gitignored ที่ root; payload AGENTS.md อยู่ `src/AGENTS.md`)

### 4.4 `verify-pack.mjs` allowlist ใหม่ (ปรับตาม panel — narrow + tripwire)
- `ALLOWED_PREFIX = ['src/bin/', 'src/.warnyin/', 'src/.claude/commands/', 'src/.claude/agents/']`
  (narrow `src/.claude/` → 2 subdir ตรงกับ `files` §4.3 — กัน `src/.claude/skills`/`settings.local.json` หลุดอนาคต · Security S4)
- `ALLOWED_FILE = ['package.json', 'README.md', 'CHANGELOG.md', 'LICENSE', 'src/AGENTS.md']`
- `hasWarnyin` = `files.some(p => p.startsWith('src/.warnyin/workflow/'))` **และ** `hasClaude` = `files.some(p => p.startsWith('src/.claude/commands/warnyin/'))` (R1 — nested dotfolder 2 ก้อนต้องติดทั้งคู่ · QA S2)
- denylist FAIL ถ้าเจอ: `src/tests/`, `src/scripts/`, `docs/`, `.github/` (R2) **+ root dogfood** `^.warnyin/`, `^.claude/`, root `CLAUDE.md`/`AGENTS.md` (กัน installed payload หลุด — topic นี้สร้างความเสี่ยงเอง · SA B1) **+ tripwire** `settings.local.json`, `*.tgz`, `.env*` (Security S4)
- **ทำให้ denylist testable (QA B1):** แยก logic ตรวจ (รับ `files[]` → คืน error[]) ออกจากการเรียก `npm pack` → เพิ่ม unit ป้อน file list ปลอมที่มี `src/tests/` แล้ว assert จับได้ (กัน "gate ลวง" ที่เขียวเพราะ allowlist ปิดอยู่แล้ว ไม่ใช่เพราะ denylist ทำงาน)

### 4.5 setup scripts (node, cross-platform — ไม่ใช่ shell oneliner · Infra S2)
> เป็น dev tooling ใน `src/scripts/` (ไม่ publish); zero-dep, ESM, spawn array args ห้าม `shell:true` (rule §5)

**`setup-dogfood.mjs`** (คืน dogfood env ที่ root):
1. `spawnSync('npx', ['--yes', '@warnyin/agents@latest'], {cwd: repoRoot, shell: process.platform==='win32'})` — npx ต้อง `shell:true` เฉพาะ Windows (npx = .cmd; เทียบ troubleshooting #4 ที่ execFile ENOENT) — นี่คือ "หนีไม่พ้น shell" เฉพาะการเรียก npx ไม่ใช่ผ่าน user input → ปลอดภัย
2. **append pointer แบบ idempotent** (Tech Lead B2): อ่าน root `CLAUDE.md` → ถ้ายังไม่มี marker `CONTRIBUTING.md` ค่อย append บรรทัด "เอกสารพัฒนา repo นี้: ดู `CONTRIBUTING.md`" (เช็คก่อน append กันซ้อนเมื่อรันหลายรอบ)
3. **policy supply-chain** (Security S1): `@latest` เป็น release ของ package ตัวเอง (low risk) แต่ comment เตือน dev ให้ review diff ของ root `.warnyin`/`.claude`/`CLAUDE.md` ก่อนเปิด session (payload ถูก agent execute ต่อ)
4. **clean `git status`** (Security S2 / Infra S5): หลัง install ต้องไม่เหลือ untracked ใน committed `docs/` → ทำได้เพราะ (ก) seedDocs skip ทุก `[...]` + ไฟล์ที่มีอยู่ (ข) repo มี `docs/project.md` + `docs/infra.md` + `docs/stages/achieved/.gitkeep` แล้ว (สร้างใน T4 — ดู §3) → seed/scaffold skip หมด · acceptance: รัน setup:dogfood แล้ว `git status --porcelain docs/` ว่าง

**`setup-sandbox.mjs`** (test v-next):
1. `dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wy-sandbox-'))` — สุ่ม+atomic (Security S3; **ห้าม hardcode `/tmp/...`** กัน Windows พัง + TOCTOU)
2. `spawnSync(process.execPath, [path.join(repoRoot,'src','bin','cli.mjs')], {cwd: dir})` — install v-next จาก src/ ลง sandbox
3. print path sandbox ให้ dev เปิด Claude Code ลอง `/warnyin:*` (dogfood ที่ root ไม่โดนแตะ)

## 5. Flow
### 5.1 dogfood (นักพัฒนา clone repo)
```
git clone → npm run setup:dogfood
  → npx @warnyin/agents@latest (ลง root: .warnyin .claude CLAUDE.md AGENTS.md — gitignored)
  → append "อ่าน CONTRIBUTING.md" ต่อท้าย root CLAUDE.md
→ เปิด Claude Code ที่ repo root → /warnyin:* ทำงานด้วย workflow release เสถียร
→ พัฒนา v-next ใน src/
```
### 5.2 test การแก้ workflow ของ v-next (version skew)
```
แก้ src/.warnyin/workflow/... → npm run setup:sandbox
  → node src/bin/cli.mjs install → /tmp/wy-sandbox-*
→ เปิด session ที่ sandbox ลอง /warnyin:* ด้วย v-next (dogfood ที่ root ไม่โดนแตะ)
automated: npm test → src/tests/ spawn src/bin/cli.mjs ลง temp (มีอยู่แล้ว 9 เคส)
```
### 5.3 transition (ครั้งเดียว — คุม R3)
```
0. ★ publish 0.6.0 (main ปัจจุบัน, .warnyin layout) → npm  ← dogfood baseline (user decision; แก้ chicken-egg BK-1)
1. git mv ตาม §3 (source → src/)            ← dogfood ที่ root หายชั่วคราว
2. git mv CLAUDE.md CONTRIBUTING.md + rewrite (dev focus)
3. แก้ package.json (bin/files/scripts) + src/scripts/verify-pack.mjs
4. เพิ่ม .gitignore (installed dogfood ที่ root)
5. npm test (จาก src/tests) → เขียว
6. npm run verify:pack → payload ครบ, ไม่ leak
7. npm run setup:dogfood → คืน dogfood env ที่ root (gitignored, จาก 0.6.0)   ← ปิด gap R3
8. bump version → 0.7.0 + CHANGELOG (rule §2)
```

## 6. ผลกระทบต่อระบบเดิม
- **breaking สำหรับ contributor:** clone แล้วต้อง `npm run setup:dogfood` ก่อน (เดิมใช้ได้ทันที) → document ใน CONTRIBUTING.md + README
- **ผู้ใช้ปลายทาง (npx) ไม่กระทบ:** ได้ payload เหมือนเดิม (bin ยัง resolve payload ถูก) — แต่ **ต้อง verify-pack ก่อน publish** ว่าโครง src/ ไม่ทำ tarball เพี้ยน
- **`--update` flow:** ผู้ใช้เดิมที่มี root `.warnyin/` (0.6.0) รัน `npx @warnyin/agents@next --update` → installer (จาก src/) ยังเขียนทับ CORE ที่ target root ถูก (logic เดิม)
- **CHANGELOG:** เปลี่ยน bin path = user-facing (ถ้ามีใครเรียก `warnyin-agents` ตรง path) + เปลี่ยนพฤติกรรม dev → ต้องมี entry (rule §2)
- **version bump:** restructure ใหญ่ → **0.7.0** (0.6.0 ถูก publish เป็น dogfood baseline ก่อน — ดู §5.3 ขั้น 0 / §9 dry-run)

## 7. Dependency ระหว่าง task
```
T1 move-source-to-src ──┬──▶ T2 packaging-config ──┐
                        ├──▶ T3 test-suite-reloc ──┼──▶ T4 dogfood-bootstrap ──▶ T5 docs-sync
                        └──────────────────────────┘
```
- **T1** = รากฐาน (ทุกอย่างขึ้นกับ path ใหม่ + แก้ `package.json bin`/`scripts.test` ขั้นต่ำให้ test รันได้) — ต้องเสร็จก่อน
- **T2, T3** ขนานได้หลัง T1 (packaging แตะ `package.json files`+verify-pack+ci.yml · test แตะ `src/tests`+CI matrix — คนละไฟล์)
- **T4** ต้องการ src/bin ใช้ได้ (T1) — **ต้องหลัง T2** เพราะ T4 แก้ `package.json scripts` (setup:*) ส่วน T2 แก้ `package.json files`/`bin` → **shared `package.json` ห้าม parallel** (Tech Lead S4); ไม่ผูกกับ T3 เชิง functional
- **T4** สร้าง `docs/project.md`/`docs/infra.md`/`docs/stages/achieved/.gitkeep` ด้วย (กัน docs collision §3 — ต้องมีก่อน verify `setup:dogfood` ว่า git สะอาด)
- **T5** documents final state (techstack/installer + codemap + note rule รอ SHIP) → ท้ายสุด

> **หมายเหตุ guard** (§4.1 · SA S1 / QA S5 / Tech Lead S5): `pkgRoot===target` กลายเป็น no-op โดยตั้งใจหลังย้าย (pkgRoot=`src/` ไม่มีทาง===target) — เก็บไว้เป็น defensive zero-cost + แก้ comment ให้ตรง; ไม่ลงทุน guard ใหม่ในรอบนี้

## 8. Test strategy ระดับ design
- **black-box เดิม (9 เคส) ต้องเขียวบนโครงใหม่** — cliPath ใน test = `../bin/cli.mjs` relative กับ `src/tests/` → `src/bin/cli.mjs` (mirror รักษา relative path เดิม → แก้น้อย)
- **R1 (dotfolder pack):** เพิ่ม assertion ใน verify-pack + เคส test ว่า `src/.warnyin/workflow/` ติด `npm pack --dry-run`
- **R2 (tooling leak):** verify-pack FAIL ถ้า `src/tests/`/`src/scripts/` หลุด → ยืนยันด้วย `npm pack --dry-run --json`
- **R4 (node --test discovery):** ต้องลองจริงว่า bare `node --test` จาก root เจอ `src/tests/*.test.mjs` ครบทั้ง node 20/22/24 (CI matrix)
- **bootstrap (T4):** sim fresh clone (lab: clone ลง temp, รัน setup:dogfood) → root dogfood env ครบ + ติด .gitignore; `setup:sandbox` → temp มี v-next

## 9. Design review
> Panel 5 role (read-only, ขนาน) รีวิว proposal+design · 2026-06-06 · ทุก blocker resolve แล้ว

### Blocker (resolve ครบ)
| # | role | blocker | วิธีปิด |
|---|---|---|---|
| BL-1 | Tech Lead / Infra / Security | `.github/workflows/ci.yml:35` รัน `node scripts/verify-pack.mjs` (hardcoded path เก่า) — ไม่มี task ครอบ → CI แดงทุก PR หลังย้าย | เพิ่มแก้ ci.yml เข้า scope **T2**: เปลี่ยนเป็น `npm run verify:pack` (เรียกผ่าน npm script กัน drift) — §2 slice T2 + §4.2 |
| BL-2 | SA / QA / Infra | `node --test` bare จะ recurse เข้า `src/tests/` บน node 20 ไหม = unknown ที่ค้ำ T3 | **พิสูจน์แล้ว:** bare recurse ได้ (node 24 ทดสอบจริง + troubleshooting #3 ยืนยัน bare ข้าม 20/22/24 + recursion เป็น default เดียวกัน) → ลดเป็น **acceptance gate**: T3 ต้องเห็น **9 pass count** บน CI matrix (ไม่ใช่แค่ exit 0) กัน false-green แบบ #3 |
| BL-3 | Security / Infra | `setup:dogfood` (release installer) รัน seedDocs+ensureScaffold ลง root → เปื้อน committed `docs/` | **พิสูจน์ scope จริง:** seedDocs skip `[...]`+ไฟล์ที่มี → เปื้อนแค่ `docs/infra.md`,`docs/project.md`,`achieved/.gitkeep` → **T4 สร้างไฟล์เหล่านี้เป็น repo doc จริง** (project.md จำเป็นตาม playbook อยู่แล้ว) → seed skip หมด → git สะอาด · §3 + §4.5 |
| BL-4 | QA | denylist verify-pack เป็น "gate ลวง" (เขียวเพราะ allowlist ปิด ไม่ใช่ denylist จับ) | §4.4: แยก logic ตรวจ (รับ `files[]`→error[]) ออกจาก `npm pack` + unit ป้อน list ปลอมที่มี `src/tests/` assert จับได้ |

### Suggestion ที่รับมาแก้ใน design/spec
- **Security S4 / QA S2:** narrow `ALLOWED_PREFIX` `src/.claude/` → `commands/`+`agents/` + `hasClaude` assertion + tripwire `settings.local.json`/`*.tgz`/`.env*` (§4.4)
- **SA S2 / Infra S4:** `.gitignore` ทุก dogfood pattern ต้อง root-anchored (`/` นำหน้า) กัน match `src/.claude/...` → source หาย (§3)
- **Infra S2 / Security S3:** setup scripts เป็น **node script** (`src/scripts/setup-*.mjs`) ไม่ใช่ shell oneliner — `os.tmpdir()`+`mkdtempSync` (ห้าม `/tmp` hardcode), npx ใช้ `shell` เฉพาะ win32 (§4.5)
- **Tech Lead B2:** `setup:dogfood` append pointer แบบ idempotent (เช็ค marker ก่อน) (§4.5)
- **Security S1:** `@latest` = release ของ package ตัวเอง (low risk) + comment เตือน review diff payload ก่อนเปิด session (§4.5)
- **SA S3:** T1 รวมแก้ `package.json bin`/`scripts.test` ขั้นต่ำ ให้ slice verify ได้ในตัว (§2/§7)
- **Tech Lead S4:** T2↔T4 แชร์ `package.json` → ห้าม parallel, T4 ต้องหลัง T2 (§7)

### Suggestion ที่รับทราบแต่ไม่ทำรอบนี้ (พร้อมเหตุผล)
- **guard `pkgRoot===target` no-op** (SA S1/QA S5/Tech Lead S5): เก็บไว้ defensive zero-cost + แก้ comment เท่านั้น ไม่ลงทุน marker-guard ใหม่ — ไม่อยู่ใน scope topic (§7 หมายเหตุ)
- **`docs/infra.md` เป็นไฟล์กลาง:** สร้างใน T4 เพื่อกัน collision แต่เนื้อหา infra (runbook transition, กฎ cross-platform npm scripts ที่ Infra แนะนำ) = **ความรู้ระดับ repo → promote เต็มตอน SHIP** (BUILD เขียนพอกัน seed; SHIP กลั่นเข้า `docs/infra.md` จริง)

### ผ่านมุม panel (ไม่มีประเด็น)
- CI security baseline (rule §3) ยัง compliant หลังย้าย (permissions/no pull_request_target/no secrets/SHA-pin/no npm ci) · zero-dep ไม่มี dep ใหม่ · mirror layout ทำให้ cli/test แก้น้อยจริง (`cliPath '../bin/cli.mjs'` relative คงเดิม) · dependency graph T1→(T2,T3)→T4→T5 ถูกต้อง

---

## 10. Dry-run review
> fan-out 5 agent (1/task, read-only) trace implement ในหัว · 2026-06-06 · 0 blocker ค้าง

| task | blocker | defer | สถานะ |
|---|---|---|---|
| move-source-to-src | 0 | 2 | ✅ (พิสูจน์ใน temp: `node --test` 9/9, fresh install payload จาก src ครบ) |
| packaging-config | 0 | 2 | ✅ (พิสูจน์ npm pack จริง: nested dotfolder ติดครบ, checkFiles จับ leak) |
| test-suite-relocation | 0 | 0 | ✅ (พิสูจน์ false-green: `node --test` dir เปล่า exit 0 → ต้อง gate pass-count) |
| dogfood-bootstrap | 1 → ✅ | 4 | ✅ RESOLVED (BK-1 publish 0.6.0 baseline — user decision) |
| docs-sync | 1 → ✅ | 2 | ✅ RESOLVED (BUILD แก้ descriptive docs เท่านั้น; component rule/standard → SHIP) |

### Blocker ปิดแล้ว
- **BK-1 (dogfood):** `npm latest=0.5.2` (layout เก่า) ไม่มี `.warnyin/` release → chicken-egg · **resolve:** publish 0.6.0 (main, .warnyin layout) เป็น baseline ก่อน → topic = 0.7.0 (§5.3 ขั้น 0; `tasks/dogfood-bootstrap/issue.md` BK-1)
- **docs-sync ambiguity:** task files ขัดกันว่าแก้ component `rule.md`/`standard.md` ตอน BUILD ได้ไหม · **resolve:** build playbook ห้ามแก้ rule/standard กลาง → BUILD แก้เฉพาะ descriptive (structure/test/about/codemap); component rule.md+standard.md (path/guard-wording/harness) → note รอ SHIP (แก้ task files 4 ใบให้สอดคล้องแล้ว)

### Defer ที่ต้อง track เข้า BUILD (ไม่ block)
- **packaging:** `checkFiles` main-guard ต้องใช้ `fileURLToPath(import.meta.url)===process.argv[1]` (**ไม่ใช่** `import.meta.main` ที่ undefined บน node 20) — กัน import trigger npm pack
- **packaging/test:** `verify-pack` รันตรงบน Windows ENOENT → dev verify ด้วย `npm pack --dry-run --json` + apply allowlist เอง (troubleshooting #4; ห้ามเติม `shell:true`)
- **move-source:** ห้ามใช้ `npm pack`/`verify:pack` เป็น gate ของ T1 (files ยังเก่า) — gate T1 = `node --test` + fresh install เท่านั้น
- **dogfood:** CHANGELOG + bump 0.7.0 (DF-1, ทำ T-ท้าย/SHIP) · build-wave ต้องไม่ schedule T2/T4 wave เดียวกัน (DF-4 shared package.json)
- **docs-sync:** T5 ห้ามรันก่อน T1–T4 integrate จริง (document ground truth)
