# Troubleshooting — Warnyin Standard Workflow (repo เอง)

> KB ปัญหา-วิธีแก้ถาวรของ repo นี้ · SHIP ของแต่ละ topic merge entry เข้ามาที่นี่
> รูปแบบ: อาการ → root cause → วิธีแก้ → ป้องกันซ้ำ

## installer / publishing

### 1. Scaffold leak — installer ลากงานจริงของ repo ต้นทางไป target
- **อาการ:** `npm pack` ติด `docs/stages/<topic>/**` ขึ้น package; ผู้ใช้ที่ `npx @warnyin/agents` ได้ topic งานจริงของ repo ต้นทางปนลงโปรเจกต์ตัวเอง
- **Root cause:** installer เคย `copyTree('docs/stages', {overwrite:false})` — copy ทั้ง tree จาก `pkgRoot`; เดิม `docs/stages` มีแค่ scaffold เปล่าจึงไม่เห็น พอมี topic จริงก็รั่วทันที + `package.json files` ใส่ `docs/stages` ทั้ง dir → leak ขึ้น published package
- **วิธีแก้:** installer **สร้าง scaffold เอง** — `ensureScaffold()` generate `docs/stages/context.md` + `docs/stages/achieved/.gitkeep` (เปล่า) ใน target ไม่อ่านจาก pkgRoot; ตัด `docs/stages` ออกจาก `package.json files`; `verify-pack.mjs` guard FAIL ถ้า `docs/` หลุดขึ้น package
- **ป้องกันซ้ำ:** scaffold/workspace ที่ผู้ใช้เป็นเจ้าของ → installer สร้างเอง **ห้าม copy จาก repo ต้นทาง**; pack allowlist ห้ามใส่ path ที่ปนงานจริง

### 2. dotfolder `.warnyin/` หลุดจาก `npm pack` (บทเรียน 0.6.0)
- **อาการ:** published package ไม่มี `.warnyin/workflow/` → ติดตั้งแล้วใช้ไม่ได้ (ไม่มี playbook)
- **Root cause:** npm รวม dotfolder ก็ต่อเมื่อระบุใน `files` ชัด — ใส่แค่ `.warnyin` ในรายการ `files`
- **วิธีแก้:** ระบุ `.warnyin` ใน `package.json files` ชัด ๆ + CI job `pack-verify` (`scripts/verify-pack.mjs`) assert `.warnyin/workflow/` อยู่ใน tarball ทุก PR
- **ป้องกันซ้ำ:** มี pack-verify เป็น gate ก่อน publish เสมอ — อย่าพึ่ง denylist อย่างเดียว

## CI

### 3. `node --test <dir>` ล้ม MODULE_NOT_FOUND บน node 24
- **อาการ:** `node --test tests/` → `Cannot find module '.../tests'`, tests=1 pass=0
- **Root cause:** node 24 ตีความ path argument เป็น **module** ไม่ใช่ directory-discovery; glob `tests/**/*.test.mjs` ก็ใช้ได้แค่ node 21+ (ไม่ portable ไป node 20 ใน matrix)
- **วิธีแก้:** ตั้ง `scripts.test = "node --test"` (bare, ไม่มี path) — auto-discover `*.test.*` ใน cwd ข้าม `node_modules` เหมือนกันทุก node 20/22/24
- **ป้องกันซ้ำ:** อย่าใส่ directory path ให้ `--test` ถ้าต้อง portable ข้าม node major; เลี่ยง glob `**` ถ้า matrix รวม node 20

## dev environment

### 4. `verify-pack.mjs` รันตรงบน Windows ล้ม ENOENT
- **อาการ:** `node scripts/verify-pack.mjs` บน Windows → `execFileSync ENOENT spawn npm` (บน CI ubuntu ปกติ)
- **Root cause:** `execFileSync('npm', ...)` ไม่ผ่าน shell — บน Windows executable จริงคือ `npm.cmd`; `execFile` ไม่ทำ PATHEXT resolution
- **วิธีแก้:** ยอมรับเป็น dev-only (CI หลักเป็น ubuntu); ถ้าต้องรันบน Windows dev → เลือก binary ตาม `process.platform` (`npm.cmd` vs `npm`) หรือ `shell:true`; ยืนยัน logic บน Windows ได้ด้วยรัน `npm pack --dry-run --json` แล้ว apply allowlist เอง
- **gate ของ logic ที่เชื่อถือได้ (ไม่พึ่ง npm process):** `verify-pack.test.mjs` (unit `checkFiles` ป้อน file list ปลอม — รวมเคส `.warnyin/.warnyin-version` stamp-deny) รันผ่าน `npm test` ปกติทุก platform; acceptance ที่ระบุ "verify:pack ผ่าน" บน Windows dev → ใช้ unit gate + `npm pack --dry-run` แทน (เจอซ้ำ topic `setup-dogfood-version-check` 2026-06-12)

## workflow tooling

### 5. Workflow `build-wave.mjs` รับ `args` เป็น string (core fix)
- **อาการ:** เรียก `Workflow({scriptPath, args:{slug,...}})` → script log "ไม่มี slug หรือ tasks", agent 0 ตัว
- **Root cause:** บาง harness pass `args` ของ Workflow tool เป็น **JSON string verbatim** ไม่ deserialize → `args.slug` บน string = undefined
- **วิธีแก้:** defensive parse — `const A = typeof args==='string' ? JSON.parse(args) : (args||{})`
- **ป้องกันซ้ำ:** ทุก workflow script ที่รับ `args` ควรเผื่อกรณี string (harness-dependent)

### 6. รัน `src/bin/cli.mjs` โดย cwd=repo root → เขียน dogfood payload ลง root (untracked leak)
- **อาการ:** ลองรัน installer เพื่อ verify โดยไม่ `cd` ไป temp ก่อน → เกิด untracked `.claude/`, `.warnyin/`, `AGENTS.md` + seed docs ที่ repo root (`git status` เห็น `??` เพียบ)
- **Root cause:** `target = process.cwd()`; guard `pkgRoot===target` เป็น no-op (pkgRoot=`src/` ไม่มีทาง===root) → installer install ลง cwd ปัจจุบันได้ทุกที่ที่ไม่ใช่ `src/`
- **วิธีแก้:** ทดสอบ installer ต้องรันใน subshell `( cd "$TMP" && node "$ROOT/src/bin/cli.mjs" )` เสมอ — อย่าปล่อย cwd เป็น repo root (ตรงกับที่ `setup-sandbox.mjs` ใช้ `mkdtempSync`+spawn cwd=sandbox)
- **ป้องกันซ้ำ:** verify install สด → ใน temp dir เท่านั้น; ลบ stray ด้วย `git clean` scope เจาะจง (ตรวจ `git cat-file -e HEAD:<path>` กันลบ tracked doc จริง)

## bootstrap / self-hosting (2-layer dogfood)

### 7. `npx @warnyin/agents` resolve bin-shim ไม่ได้บน Windows (manual) — แต่ผ่านเมื่อรันใน script
- **อาการ:** `npx --yes @warnyin/agents@<ver>` **manual** ใน Git Bash/PowerShell → `'warnyin-agents' is not recognized` แม้ cli.mjs มี shebang ครบ
- **Root cause:** บาง dev env (Windows) npx หา/สร้าง bin-shim (`.cmd`) ไม่เจอตอนเรียกตรง
- **วิธีแก้:** เรียกผ่าน `spawnSync('npx', ['--yes', PKG], {shell: win32})` ใน node script → resolve ได้ (verify จริง: `setup-dogfood.mjs` รัน npx primary สำเร็จ exit 0; เห็น DEP0190 = ผลของ `shell:true`); + มี **fallback** `npm pack`→`tar -xzf --strip-components 1`→`node <cli>` เป็น safety net ถ้า npx ยังล้ม → ทั้งคู่ล้ม `exit(1)` (ไม่ false-green)
- **ป้องกันซ้ำ:** dev tooling ที่เรียก npx package ตัวเอง — เรียกผ่าน script `shell:win32` + มี fallback pack→node เสมอ (npx bin-resolution ไม่ portable)

### 8. fallback ของ self-install hardcode path cli แต่ release baseline layout ต่างเวอร์ชัน
- **อาการ:** fallback extract tarball แล้วหา `<pkg>/src/bin/cli.mjs` — แต่ dogfood baseline (`@latest`=0.6.0 ก่อน restructure) มี cli ที่ `bin/cli.mjs` → หาไม่เจอ → setup FAIL
- **Root cause:** hardcode path เดียว สมมติ release layout == working-tree layout — แต่ baseline เป็น **เวอร์ชันก่อน** restructure (self-host transition)
- **วิธีแก้:** resolve cli จาก `package.json` `bin` ของ tarball + candidate `['src/bin/cli.mjs','bin/cli.mjs']` (ทนทั้ง layout เก่า/ใหม่) — verify จริง: pack 0.6.0 → resolve = `bin/cli.mjs` ✓
- **ป้องกันซ้ำ:** เครื่องมือที่ install release ของตัวเองช่วง transition ต้องไม่สมมติ release layout == working tree — resolve entry จาก metadata เสมอ

### 9. ทำ BUILD/VERIFY บน repo ที่ self-host (orchestration tooling ย้ายที่/ถูก gate)
- **อาการ:** (ก) BUILD ที่ย้าย `.warnyin/` (tooling ที่ orchestration ใช้) → worktree sub-agent ของ wave หลังอ่าน playbook/role ที่ root ไม่เจอ; (ข) live `setup:dogfood` (external exec + เขียน agent config) ถูก sandbox classifier บล็อกใน build context
- **Root cause:** repo เป็นทั้ง tool และผู้ใช้ tool — ย้าย/แก้ source กระทบ dogfood ที่ orchestration กำลังใช้; live e2e ของ external installer ถูก gate ใน build stage
- **วิธีแก้:** wave แรก (ย้าย source) ใช้ worktree → merge → **restore root dogfood จาก release** → wave หลัง **shared-tree** (อ่าน tooling จาก root dogfood, main loop commit ให้); acceptance ที่เป็น live external-exec → ออกแบบให้ deterministic/simulated ส่วนใหญ่ เหลือ live e2e ไป **VERIFY** (user authorize)
- **ป้องกันซ้ำ:** self-hosting topic — แยก phase ที่กระทบ tooling ตัวเอง + เลื่อน live external-exec ไป VERIFY ตั้งแต่ออกแบบ acceptance

### 13. ESM main-guard พังเมื่อรันผ่าน symlink (argv[1] ≠ realpath) — installer เงียบ exit 0
- **อาการ:** `npx @warnyin/agents@<v> --update` (sandbox สะอาด) → exit 0, **0 bytes output, ไม่สร้างไฟล์เลย**; `setup:dogfood` ทั้ง npx + pack path เงียบ → `verifyInstalled` (ชั้น detection) คืน false → fail-loud. "root ค้าง 0.17.0" จริง ๆ คือ setup:dogfood **ไม่เคยติดตั้งสำเร็จเลย** ไม่ใช่แค่ดึง payload เก่า
- **Root cause:** main-guard `if (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))` — `argv[1]` = path ตามผู้เรียก (symlink, ไม่ resolve), แต่ ESM `import.meta.url` = **realpath เสมอ** → เทียบไม่ตรง → `main()` ไม่ถูกเรียก. Trigger: npx รัน bin ผ่าน `node_modules/.bin/<name>` symlink; `setup:dogfood` extract tarball ลง `os.tmpdir()` ที่บน macOS เป็น symlink (`/var/folders/.../T` → `/private/var/...`). **black-box test เดิมไม่จับ** เพราะ spawn cli ผ่าน real repo path → match เสมอ (false-green)
- **วิธีแก้:** แยก `export function isEntrypoint(argv1, metaUrl, realpath = fs.realpathSync)` → `realpath(argv1) === fileURLToPath(metaUrl)` (realpath ทั้งสองฝั่ง) + try/catch fallback `path.resolve` เมื่อ realpath throw; main-guard เรียก `isEntrypoint(process.argv[1], import.meta.url)`. แยก pure-fn (inject realpath) → unit cross-platform + black-box spawn ผ่าน symlink (CI ubuntu) ครอบ end-to-end
- **ป้องกันซ้ำ:** **ESM main-guard ต้อง realpath `argv[1]`** ก่อนเทียบ `import.meta.url` (ไม่ใช่แค่ `path.resolve`) — npx/.bin รัน bin ผ่าน symlink เสมอ; **black-box test ต้องมีเคสรันผ่าน symlink** (spawn ผ่าน real path อย่างเดียว = false-green). ดู `docs/techstack/installer/{rule,test}.md`

## migration / upgrade (ผู้ใช้รุ่นเก่า)

### 10. เอกสาร migration `git mv warnyin/stages docs/stages` ทำงานจริงซ้อน `docs/stages/stages/`
- **อาการ:** ผู้ใช้รุ่นเก่าทำตาม migration guide เป๊ะ แต่งานจริงไปโผล่ที่ `docs/stages/stages/<topic>/` (ซ้อนชั้น) แทน `docs/stages/<topic>/`
- **Root cause:** flow จริงคือ ผู้ใช้รัน `npx @warnyin/agents` รอบแรก → เห็น legacy warning **แต่ installer ไม่ block** (warn-but-not-block) install ต่อจนสร้าง `docs/stages/{context.md,achieved}` เปล่า → ผู้ใช้ทำตามคำสั่ง `git mv warnyin/stages docs/stages` → เพราะ `docs/stages/` มีอยู่แล้ว `git mv <dir> <dir-ที่มีอยู่>` ย้าย source **เข้าไปข้างใน** = ซ้อน; คำสั่งเดิมยังไม่ลบ `warnyin/installer` ที่เหลือ → installer ยัง warn ซ้ำ
- **วิธีแก้:** เอกสาร migration ย้าย **เนื้อหา** ไม่ใช่ทั้งโฟลเดอร์ + ลบ core เก่าทั้ง tree (ทนทั้งกรณี `docs/stages/` มี/ไม่มี): `mkdir -p docs/stages && git mv <เก่า>/* docs/stages/` แล้ว `rm -rf <core เก่า>` — verify จริงด้วย git repo จำลองทั้งกรณี migrate-ก่อน/หลัง-install (ดู `docs/techstack/installer/test.md` §executable migration proof)
- **ป้องกันซ้ำ:** (1) เอกสาร migration ที่ย้ายของเข้าโฟลเดอร์ที่ installer อาจสร้าง → ใช้ `git mv <src>/* <dest>/` (ย้าย contents) เสมอ ไม่ใช่ `git mv <src> <dest>` (2) **เทส migration ด้วย executable proof** (จำลอง legacy → รันคำสั่งในเอกสารจริง → assert) — bug แบบนี้อ่านเอกสารเฉยๆ มองไม่เห็น (3) legacy warning ใน `src/bin/cli.mjs` ควรแก้ให้ตรง guide (roadmap P0 #3) — ตอนนี้เอกสาร robust กว่า cli

### 11. root dogfood ถูก commit (tracked) ทั้งที่ rule §6 ว่า gitignored — `.gitignore` ไม่มี dogfood entries
- **อาการ:** `git ls-files .warnyin/ .claude/{commands/warnyin,agents}` = 64 ไฟล์ (snapshot 0.7.0 เก่า **drift** จาก `src/` v-next) ทั้งที่ rule §6 + CONTRIBUTING บอก dogfood = gitignored ห้าม commit
- **Root cause:** runbook src-bootstrap (`docs/infra.md` §transition) step "เพิ่ม `.gitignore` dogfood layer" **ไม่เคยถูก apply จริง** — `.gitignore` ไม่มี dogfood entries เลย + ไม่เคย `git rm --cached` root dogfood เก่า → ค้างใน git ตั้งแต่ก่อนแยก `src/`
- **วิธีแก้:** `git rm -r --cached .warnyin .claude CLAUDE.md AGENTS.md` (path **root เจาะจง** ไม่ใช่ `src/` — guard ด้วย `--dry-run` + grep `src/` = 0 ก่อน) + `.gitignore` dogfood section **root-anchored** (`/.warnyin/`, `/.claude/`, `/CLAUDE.md`, `/AGENTS.md`); `--cached` เก็บ working tree → dev ใช้ต่อได้, fresh clone ใช้ `setup:dogfood`. verify จริง: **fresh-clone simulation** (clone → src ครบ + ไม่มี dogfood + build เขียว) + regen round-trip (setup:dogfood คืน dogfood เป็น latest)
- **บทเรียน gitignore anchoring (สำคัญ):** git ถือว่า pattern ที่มี separator **กลาง** (เช่น `.claude/skills/`) **anchored to repo root อยู่แล้ว** → ไม่ match `src/.claude/skills/`; ส่วน pattern **trailing-slash อย่างเดียว** (เช่น `.warnyin/`) match ที่ **ทุก depth** รวม `src/.warnyin/` → **ต้องนำด้วย `/`**. ดังนั้น dogfood entry ที่เป็นชื่อ dir เปล่า ๆ ต้อง anchor `/`; การ "anchor ทุกบรรทัด" ยังเป็น best practice (explicit) แม้บางเคส (mid-slash) git anchor ให้แล้ว
- **ป้องกันซ้ำ:** (1) หลัง **structural migration** (เช่นแยก source → `src/`) ต้อง **verify git state ตรง intent ด้วย `git ls-files`** ไม่ใช่แค่ทำตาม runbook (step อาจตกหล่น) (2) เพิ่ม dogfood path ใหม่ → `.gitignore` ต้อง root-anchored + `git check-ignore src/...` ยืนยัน source ไม่โดน
- **⚠️ ผลข้างเคียงตอน merge (gotcha — VERIFY fresh-clone sim ไม่จับ):** `git rm --cached` บน build branch **เก็บ** working tree (branch นั้น) — แต่พอ **merge เข้า branch ที่ยัง track dogfood อยู่** (เช่น main) git มองเป็น tracked-deletion → **ลบ working tree dogfood ออกจริง** → `/warnyin:*` (จาก `.claude/commands/warnyin/`) + playbook ที่ root **หายทันที**. **วิธีแก้ = `npm run setup:dogfood`** (regen จาก release — flow ที่ออกแบบไว้พอดี); slash command อาจต้อง **restart session** ให้ re-register. **บทเรียน VERIFY:** topic ที่ untrack ของที่ track อยู่ ต้องเทส **merge path** (ไม่ใช่แค่ fresh-clone) — หลัง merge บน branch จริง ต้อง `setup:dogfood` คืน dogfood เสมอ

## quality gate / dev tooling

### 12. strip-code 2-pass พังเมื่อ markdown มี triple-backtick ฝังใน inline-code (meta-doc อธิบาย regex)
- **อาการ:** `lint-md` (dead-link gate) จับ false-positive — flag `[](...)`/`[x](y)` ที่อยู่ใน code-span ของเอกสารที่ **อธิบาย markdown/regex syntax** (เช่น design/spec ของ topic `repo-lint` เองมี `` ``` `` ฝังใน inline-code)
- **Root cause:** strip code ทำเป็น **2 pass แยก** `.replace(fenced).replace(inline)` — เมื่อ inline-code มี `` ``` `` ฝัง (เช่น `` `content.replace(/```...```/g,'')` ``) fenced-pass แรกกินทะลุ inline span ทำลาย backtick ที่ป้องกัน `[](...)`; สลับ inline-first ก็พังอีกทาง (fenced block จริงโดน inline regex กินครึ่ง)
- **วิธีแก้:** **alternation regex pass เดียว** `/```[\s\S]*?```|`[^`\n]*`/g` — match code construct "อันที่เปิดก่อน" ตามลำดับเอกสาร (left-to-right) → ทั้ง fenced block + inline span ที่มี `` ``` `` ฝัง strip ถูกพร้อมกัน
- **ป้องกันซ้ำ:** strip หลาย code construct ที่ nest/overlap ได้ — **ห้าม sequential `.replace().replace()`** ใช้ **alternation เดียว** ให้ regex engine จัดลำดับ match ตาม position; เทสด้วย input ที่ delimiter ชนิดหนึ่งฝังในอีกชนิด (`` ``` `` ใน inline-code) เสมอ
- **★ facet เพิ่ม (double-backtick gap — topic `understand-anything-interop`, เจอซ้ำ 2 ครั้ง):** `CODE_RE` strip เฉพาะ **single-backtick** และ **triple-backtick** — **ไม่ strip double-backtick** (`` `` ``); markdown-link ตัวอย่างที่ครอบด้วย double-backtick (หรือ single-backtick ที่เนื้อหามี backtick ข้างในจน pairing พัง) จึงหลุดให้ `LINK_RE` จับ → false dead-link. **ป้องกัน:** เขียนตัวอย่าง markdown-link/regex ที่มี backtick ในเอกสารด้วย **fenced code block** (triple-backtick) ไม่ใช่ double-backtick; (root fix ที่เป็นไปได้แต่คนละ topic: เพิ่ม double-backtick ใน `CODE_RE`)

### 13. sub-agent BUILD self-verify เคลม "เขียว" ทั้งที่ gate แดง (exit code ถูกบัง)
- **อาการ:** sub-agent ของ wave รายงาน `passed` + self-verify เขียว แต่ main-loop full-gate รันเองแล้ว**แดง** (เกิดซ้ำ ≥2: topic `examples` dead-link, `repo-lint` lint:md) — มักเพราะเช็คผ่าน `cmd | tail` / `cmd | grep` ที่ exit code มาจาก pipe ตัวท้าย (`tail`/`grep` exit 0 เสมอ) บัง exit จริงของ gate
- **Root cause:** trust sub-agent report + เช็ค exit ผ่าน pipe ที่ swallow exit code ของคำสั่งจริง
- **วิธีแก้:** **main-loop full-gate ต้องรัน gate เองทุกครั้ง + ตรวจ exit จริง** — `cmd > /tmp/out 2>&1; E=$?` (เก็บ exit ก่อน pipe) ไม่ใช่ `cmd | tail` แล้วเชื่อ; ไม่ปิด BUILD จาก self-report ของ sub-agent
- **ป้องกันซ้ำ:** build.md §8 full-gate = แหล่งความจริงเดียว (sub-agent report เป็น hint); เช็ค exit code ต้องไม่อยู่หลัง `|` — แยก `$?` หรือ `set -o pipefail`

### 14. build agent ใน worktree แก้ไฟล์ topic working dir ไม่ได้ (Edit tool block + ไฟล์ไม่อยู่ใน worktree)
- **อาการ:** agent ใน git worktree เจอ `Edit tool: This agent is isolated in the worktree ... Edit the worktree copy instead` เมื่อพยายามอัปเดต `docs/stages/<slug>/tasks/<task>/task.md` — แต่ไฟล์นั้นไม่มีอยู่ใน worktree (เจอซ้ำ 2/2 task ใน wave เดียว — topic `feature-spec-delta`)
- **Root cause:** worktree เห็นเฉพาะไฟล์ที่ track ใน branch ที่ checkout — ถ้า topic docs ยังไม่ commit (หรืออยู่บน build branch ที่ worktree ไม่ได้ branch จาก) โฟลเดอร์ topic จะไม่ปรากฏใน worktree; Edit tool ของ harness block การแก้ path นอก worktree
- **วิธีแก้:** แยกหน้าที่ — ไฟล์ output จริง (git-tracked) แก้+commit ใน worktree ปกติ; สถานะ/บันทึกใน topic dir ให้ **main loop อัปเดตตอน integrate** (หรือ agent เขียนผ่าน node script ทาง Bash ที่ absolute path ของ main checkout)
- **ป้องกันซ้ำ:** orchestrator **commit topic docs ลง build branch ก่อน fan-out** + ให้ worktree **branch จาก build branch** (ไม่ใช่ main) — agent เห็น task ของตัวเองครบ; agent รายงานแก้ task.md ไม่ได้ ≠ task ล้ม (ดู `docs/rule.md` §1 build-orchestration). เจอซ้ำ topic `validator-status` wave 2 (agent merge build branch เข้า worktree เองเป็น workaround)

### 15. negative test fixture ของ keyword-heuristic บังเอิญ match keyword ที่ตัวเองทดสอบ
- **อาการ:** unit ของ validator (เคส "design ไม่มี Spec delta → ⚠") fail: actual=false — ไม่มี ⚠ ออกมาทั้งที่โค้ดถูก (topic `validator-status`)
- **Root cause:** validator ข้ามเช็คเมื่อ `/ไม่มี delta/.test(content)` (เคสผู้เขียนระบุ "ไม่มี delta" โดยตั้งใจ = ถูกต้อง); fixture filler text "เนื้อหา design ไม่มี delta section" มี substring `ไม่มี delta` บังเอิญ → validator ตีความว่า topic ระบุ "ไม่มี delta" → ข้ามเช็ค — **โค้ดถูก test data ผิด**
- **วิธีแก้:** แก้ fixture filler เป็นข้อความที่ **ไม่มี trigger keyword** (`ไม่มี delta`/`Spec delta`) — ใช้คำ orthogonal ชัดเจน
- **ป้องกันซ้ำ:** เขียน negative fixture ของ keyword-heuristic ต้องเลี่ยง trigger phrase ในข้อความ filler ทุกตัว; test แดงทั้งที่โค้ดดูถูก → สงสัย fixture ก่อนแก้โค้ด (ดู `docs/rule.md` §5)

### 16. `node --check` ใช้ไม่ได้กับ payload workflow script (harness wrap + top-level return/export)
- **อาการ:** `node --check src/.warnyin/workflow/scripts/build-wave.mjs` → `SyntaxError: Illegal return statement` (และ `Unexpected token export` ถ้า wrap ใน function) — ทั้งที่โค้ดถูกในบริบท harness (topic `build-wave-branch-fix`)
- **Root cause:** workflow script (`*.mjs` ใน `.warnyin/workflow/scripts/` มี `export const meta` + ใช้ globals `args`/`agent`/`parallel`/`log`/`phase` ที่ harness inject) — harness wrap body ในฟังก์ชันแล้ว inject globals จึงมี **top-level return** (early guard + tail) ที่ผิดกฎ standalone ES module แต่ valid ในบริบทนั้น; `export` ก็อยู่ top-level จึง wrap ใน function ไม่ได้
- **วิธีแก้:** (1) ยืนยัน pre-existing ด้วย `git show HEAD:<file> | node --check` (ก่อนแก้ก็ fail = ไม่ใช่ regression); (2) syntax สะอาด: module-parse หลัง `sed` neutralize top-level return เป็น `throw`/`void`; (3) behavior/ordering: `new Function(...)` inject globals แล้วรันฟังก์ชันที่แก้จริง (เช่น `prompt()`) — แข็งกว่า grep source line order เพราะ `splice`/`unshift` ทำให้ลำดับ runtime ต่างจาก source
- **ป้องกันซ้ำ:** payload workflow script — **อย่าใช้ `node --check` standalone เป็น gate**; ใช้ runtime proof + `npm test`/`verify:pack` ที่เป็น gate จริง (ดู `docs/techstack/installer/test.md`)
- **เสริม (topic `improve-performance`):** runtime-proof **ทั้ง body** ของ script ที่มี **top-level await** (เช่น `await parallel(...)`) → ต้องใช้ **`AsyncFunction`** ไม่ใช่ `new Function` (`new Function` สร้าง sync function → `SyntaxError: await is only valid in async functions`): `const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor; await new AsyncFunction('args','agent','parallel','log','phase', body)(...)` + neutralize `export` ก่อน wrap. สกัด **pure helper** (เช่น `normalizeTasks`/`buildOpts` ที่ไม่มี await) ใช้ `new Function` ปกติได้ (แต่ inject const ที่มันอ้าง เช่น `RESULT_SCHEMA` stub)
- **อัปเดต (topic `build-wave-export-fix` · 2026-06-11):** `normalizeTasks`/`buildOpts` **ไม่ `export` แล้ว** (ดู #20 FIXED) — แต่ข้อจำกัดแกนของ #16 ยังคงอยู่ (`node --check` standalone ใช้เป็น gate ไม่ได้เพราะ top-level return + harness globals) → ใช้ runtime-proof + `npm test` เป็น gate ต่อไป

### 17. BUILD worktree ว่าง — ไม่มี `.warnyin/` + topic docs (root build-wave.mjs stale)
- **อาการ:** sub-agent ใน worktree อ่าน `.warnyin/workflow/stages/build.md`, `roles/developer.md`, `docs/stages/<topic>/tasks/<task>/*.md` ไม่เจอ — `find docs/stages` เจอแค่ `achieved/` + `context.md` ว่าง; agent หยุดรายงาน `failed` ถูกต้อง (ไม่เดา spec) — topic `improve-performance` (ต่อยอด #14)
- **Root cause (ซ้อน 2 ชั้น):** (1) root `.warnyin/` **gitignore** (dogfood) → ไม่เคย commit → worktree fresh checkout ไม่มี playbook; (2) root `build-wave.mjs` **stale กว่า `src/`** (ขาด `baseRef` step-0 sync ที่ src มีแล้ว) → เรียก script จาก root path = logic เก่า ไม่ส่ง baseRef → worktree fork base คนละสาย ไม่มี DESIGN output
- **วิธีแก้:** task ที่ผ่านแต่ base ปนเปื้อน → `git cherry-pick <commit เดี่ยวของ agent>` (diff ไฟล์ที่ own เท่านั้น ไม่ merge ทั้ง branch); task ที่ fail + wave ถัดไป → re-run `isolate:false` (shared-tree) main loop commit ให้
- **ป้องกันซ้ำ:** worktree mode เรียก script ที่มี `baseRef` (จาก `src/`) + ส่ง `baseRef: "build/<slug>"`; repo ที่ root playbook gitignored → ใช้ shared-tree; **SHIP/release sync src→root** ปิด sync-gap ถาวร (`docs/rule.md` §1 build-orchestration + `techstack/installer/rule.md` §build orchestration)

### 18. root dogfood (`.warnyin/`, `.claude/`) gitignored → แก้ที่ root แล้ว git ไม่เห็น / Edit ไม่ match
- **อาการ:** แก้ไฟล์ root `.claude/commands/warnyin/` หรือ `.warnyin/workflow/` แล้ว `git status` ไม่ขึ้น modified; Edit `old_string` ที่ root ไม่ match ทั้งที่ copy จาก src (root stale — ขาด baseRef line) — topic `improve-performance` (theme เดียว #11 แต่คนละทิศ: #11 = ถูก commit ทั้งที่ควร ignore; #18 = ถูก ignore เลยมองไม่เห็น/stale)
- **Root cause:** tracked source = `src/` เท่านั้น; root = dogfood install ที่ release sync src→root regenerate
- **วิธีแก้/ป้องกันซ้ำ:** แก้ canonical ที่ `src/` ก่อน (จะ tracked) → ยืนยัน scope ด้วย `git check-ignore <path>`; ถ้าต้อง sync root เพื่อ runtime ให้ apply **เฉพาะ delta ของ task** (อย่า `cp` ทับทั้งไฟล์ — กัน revert ฟีเจอร์อื่นที่ root ยังเก่า); **อย่ารายงานไฟล์ root เป็น `filesChanged`** ที่ main loop ต้อง commit (ถูก ignore)

### 19. `lint:md` dead-link จาก illustrative markdown-link ใน task-brief
- **อาการ:** `npm run lint:md` ขึ้น dead-link ใน `docs/stages/<slug>/tasks/<task>/task.md` ชี้ `../triage.md#...` ทั้งที่ artifact จริงใน `src/.warnyin/workflow/stages/` resolve ถูกต้อง (lint ไม่ flag ไฟล์ artifact)
- **Root cause:** task-brief เขียน **ตัวอย่าง** markdown-link ที่ agent ต้องไปใส่ในไฟล์ stage แต่เขียนเป็น **live link** `[..](../path)` ในตัว brief เอง → `lint-md` resolve จาก location ของ brief (`tasks/<task>/`) ไม่ใช่จาก location ปลายทาง → path ไม่มีจริง = dead-link. บรรทัดที่ห่อ backtick (`` `[..](..)` ``) lint ข้าม (inline-code) แต่บรรทัดที่ไม่ห่อถูก resolve
- **วิธีแก้:** ห่อ illustrative link ในtask-brief ด้วย backtick (inline-code) ให้เป็น documentation ไม่ใช่ live link — `lint-md.mjs` strip code-span ก่อน match link จึงข้ามให้
- **ป้องกันซ้ำ:** เวลาเขียน brief/เอกสารที่ **ยกตัวอย่าง** markdown-link ของไฟล์ปลายทาง → ห่อ backtick เสมอ (illustrative ≠ live link); dead-link ของ **artifact จริง** ต่างหากที่เป็น integration-proof ที่ full-gate ต้องการ (topic `change-sizing-router` BUILD full-gate)

### 20. Workflow loader พัง `Unexpected keyword 'export'` เมื่อ workflow script มี top-level `export function`
- **อาการ:** เรียก `Workflow({ scriptPath: ".warnyin/workflow/scripts/build-wave.mjs", ... })` → `Workflow script has a syntax error and was not launched: SyntaxError: Unexpected keyword 'export'`
- **Root cause:** Workflow tool ของ harness wrap script แล้วยอมรับเฉพาะ `export const meta` (ตัวบังคับ); build-wave.mjs ตั้งแต่ 0.12.0 มี **top-level `export function normalizeTasks`/`export function buildOpts`** (export ออกให้ unit test import) → parse ล้ม (ธีมเดียวกับ #16 — payload workflow script valid เฉพาะตอน harness wrap แบบเฉพาะ; ก่อน 0.11.0 ไม่มี `export function` จึงไม่เคยเจอ)
- **วิธีแก้:** สร้าง temp copy ที่ตัด `export` ออกจาก function declaration (ฟังก์ชันใช้ภายในสคริปต์อยู่แล้ว ไม่ต้อง export ตอนรันจริง) — คง `export const meta`:
  ```bash
  sed 's/^export function /function /' .warnyin/workflow/scripts/build-wave.mjs \
    > .warnyin/workflow/scripts/build-wave-run.mjs   # root .warnyin gitignored
  # Workflow({ scriptPath: ".../build-wave-run.mjs", ... }) แล้วลบ temp หลังเสร็จ
  ```
- **ป้องกันซ้ำ:** fix ถาวร = `src/.warnyin/workflow/scripts/*.mjs` **อย่า `export function`** — pure-fn ให้ unit test สกัดด้วย `new Function`/module-parse (pattern #16) หรือย้ายไป helper แยก; กฎใน `docs/techstack/installer/rule.md` §build orchestration (topic `global-install` TS-1)
- **✅ FIXED (topic `build-wave-export-fix` · 2026-06-11):** ลบ `export` ออกจาก `function normalizeTasks`/`buildOpts` ใน `build-wave.mjs` (คง `export const meta`) + เพิ่ม inline comment guard กัน re-add — **Workflow launch ผ่านแล้ว** (executable proof: run `wf_4898135a-19c` คืน `{slug:"x",results:[],failed:[]}` early-return ไม่เจอ SyntaxError); unit test ไม่ต้องแก้ (extractFn ค้น `function ${name}` ตัด export อยู่แล้ว). **เจอซ้ำ 3 ครั้งก่อนแก้ถาวร** (#16/#20 + `parallel-design-docs` TS-1) → follow-up เสนอ lint-gate ตรวจ `^export function` อัตโนมัติ (`docs/roadmap.md` #12)

### 21. `setup:dogfood` false-green — npx exit 0 โดยไม่ install จริง / ข้าม CORE
- **อาการ:** `npm run setup:dogfood` หลัง publish release ใหม่ → รายงาน "เสร็จ" แต่ root CORE (`.warnyin/`, `.claude/commands/warnyin/`) ยังเป็น version เก่า (เช่น `discovery.md` ไม่มี mode ใหม่, `build-wave.mjs` ยัง stale)
- **Root cause:** 2 จุดใน `setup-dogfood.mjs` — (1) `installViaNpx` รัน `npx --yes @latest` **ไม่มี `--update`** → `cli.mjs` `copyTree({overwrite:false})` **ข้ามไฟล์ CORE ที่มีอยู่** (idempotent install); (2) success-detection เชื่อ `r.status===0` อย่างเดียว → npx exit 0 ได้โดยไม่ install จริง (bin resolution เพี้ยนบางเครื่อง) → `return true` → ไม่ fallback `installViaPack`
- **วิธีแก้:** (1) ส่ง `--update` ทั้ง npx (`['--yes', PKG, '--update']`) + node path (`[cli, '--update']`); (2) เพิ่ม `verifyInstalled(root)` เช็ค side-effect (root CORE markers `.warnyin/workflow/stages/discovery.md` + `.claude/commands/warnyin` exists) → `status===0 && !shimMissing && verifyInstalled(repoRoot)`; false → fallback/exit. workaround ชั่วคราว = mirror CORE จาก verified tarball → root (`cp -r package/src/.warnyin → .warnyin`)
- **ป้องกันซ้ำ:** dev-tooling ที่ spawn external install (npx/npm) **ต้อง verify side-effect ไม่เชื่อ exit 0** + ส่ง flag ตรงเจตนา (`--update`); unit test มีเคส partial→false พิสูจน์ guard — กฎใน `docs/techstack/installer/rule.md` §dev tooling
- **✅ FIXED (topic `fix-setup-dogfood` · 2026-06-11):** `setup-dogfood.mjs` ส่ง `--update` + `verifyInstalled` side-effect ทั้ง 2 paths + main-guard export + unit 3 เคส (verify V1-V6 ผ่าน, test 69/69)

### 22. registry แก้ root `CLAUDE.md`/`AGENTS.md` → ไม่ติด commit (gitignored dogfood — canonical = installer template)
- **อาการ:** registration task แก้ `CLAUDE.md` ที่ root (เพิ่ม slash-command list) → build-wave รายงาน `filesChanged` มี CLAUDE.md แต่ commit/branch ไม่ติด → publish ไม่มี change (ผู้ใช้ปลายทางไม่เห็น command ใน list)
- **Root cause:** `CLAUDE.md`/`AGENTS.md` ที่ root = dogfood install (gitignored, not tracked — specialization ของ #18); canonical ที่ ship จริง = `src/.warnyin/installer/templates/CLAUDE.md` (ใน `package.json files`, installer copy ไปปลายทาง) — design ระบุ target "CLAUDE.md (root)" คลาดเคลื่อน
- **วิธีแก้:** แก้ที่ `src/.warnyin/installer/templates/CLAUDE.md` (canonical) — ยืนยัน target ด้วย `git check-ignore CLAUDE.md` + `git ls-files --error-unmatch CLAUDE.md` ก่อนเลือก (investigate-before-edit ไม่เดา)
- **ป้องกันซ้ำ:** ก่อนแก้ registry/list file ที่ root → `git check-ignore <file>` ก่อนเสมอ; ignored = dogfood → หา canonical ใน `src/.warnyin/installer/templates/` — กฎใน `docs/techstack/installer/rule.md` §packaging
- **✅ FIXED (topic `feedback-issue-command` · 2026-06-12):** orchestrator แก้ template canonical ตอน BUILD integrate (verify T4 install proof ยืนยัน slash-command list ลง target sandbox ถูกต้อง)

### 23. negative grep-assert ของ field (description/text) ล้มเพราะ negation phrase
- **อาการ:** test-flow มี assert "บรรทัด `description:` ของ agent ต้องไม่มีคำว่า `reviewer`" แต่ผู้เขียนใส่ description ว่า agent "ไม่ใช่ reviewer" → grep เจอ `reviewer` เป็น substring → assert FAIL ทั้งที่ intent ถูก
- **Root cause:** negative grep-assert match **substring** ไม่เข้าใจ semantic — "ไม่ใช่ X" ยังมี `X` เป็น substring (specialization ของ rule §5 "negative fixture ต้องเลี่ยง trigger phrase" — ขยายจาก test fixture เป็น production artifact ที่ test grep)
- **วิธีแก้:** rephrase เป็น positive phrasing ที่สื่อ intent เดิมโดยไม่ใช้คำต้องห้าม — เช่น `"ผลิต artifact ไม่ใช่ให้ความเห็น"` (สื่อ generator≠reviewer โดยเลี่ยงคำ `reviewer`)
- **ป้องกันซ้ำ:** เขียน field ที่ต้องผ่าน negative grep-assert → เลี่ยงคำต้องห้ามแม้อยู่ใน negation context; ใช้ synonym/positive phrasing แทน
- **✅ FIXED (topic `uxui-designer-stage` · 2026-06-13):** BUILD T1 rephrase `warnyin-ux` description (verify T-FUNC-2 ผ่าน — description มี generator ไม่มี reviewer)

### 24. แทรก flat-numbered step (.5) ผิดตำแหน่งใน numbered list ที่ item มี sub-bullet
- **อาการ:** แทรก `step 4.5` ที่ควรอยู่ **ระหว่าง** step 4 (proposal) กับ step 5 (design.md) แต่ครั้งแรกตกไปอยู่ **หลัง step 5**
- **Root cause:** step 5 มี sub-bullet หลายบรรทัดคั่นกลาง → anchor ที่ใช้ Edit (ข้อความกลาง item) ตกอยู่ใต้ step 5 ไม่ใช่ก่อนหน้า
- **วิธีแก้:** Edit สองครั้ง — ลบ block จากตำแหน่งผิด แล้ว insert ด้วย **anchor คู่** = "บรรทัดสุดท้ายของ item ก่อนหน้า" + "บรรทัดแรกของ item ถัดไป" ที่ติดกันจริง; verify ด้วย `grep -n` เทียบ section boundaries
- **ป้องกันซ้ำ:** ก่อนแทรก inline-numbered step ใน numbered list ที่ item มี sub-bullet หลายบรรทัด → เลือก anchor เป็น **ขอบของ item** (บรรทัดสุดท้าย item ก่อน + บรรทัดแรก item ถัดไป) ไม่ใช่ข้อความกลาง item แล้ว verify ตำแหน่งด้วย grep line-number เทียบ section header
- **✅ FIXED (topic `uxui-designer-stage` · 2026-06-13):** BUILD T3 ย้าย step 4.5 ให้ถูก (verify T-FUNC-4 ผ่าน — step 4.5 อยู่ระหว่าง step 4–5)
