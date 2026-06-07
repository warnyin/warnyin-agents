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

## migration / upgrade (ผู้ใช้รุ่นเก่า)

### 10. เอกสาร migration `git mv warnyin/stages docs/stages` ทำงานจริงซ้อน `docs/stages/stages/`
- **อาการ:** ผู้ใช้รุ่นเก่าทำตาม migration guide เป๊ะ แต่งานจริงไปโผล่ที่ `docs/stages/stages/<topic>/` (ซ้อนชั้น) แทน `docs/stages/<topic>/`
- **Root cause:** flow จริงคือ ผู้ใช้รัน `npx @warnyin/agents` รอบแรก → เห็น legacy warning **แต่ installer ไม่ block** (warn-but-not-block) install ต่อจนสร้าง `docs/stages/{context.md,achieved}` เปล่า → ผู้ใช้ทำตามคำสั่ง `git mv warnyin/stages docs/stages` → เพราะ `docs/stages/` มีอยู่แล้ว `git mv <dir> <dir-ที่มีอยู่>` ย้าย source **เข้าไปข้างใน** = ซ้อน; คำสั่งเดิมยังไม่ลบ `warnyin/installer` ที่เหลือ → installer ยัง warn ซ้ำ
- **วิธีแก้:** เอกสาร migration ย้าย **เนื้อหา** ไม่ใช่ทั้งโฟลเดอร์ + ลบ core เก่าทั้ง tree (ทนทั้งกรณี `docs/stages/` มี/ไม่มี): `mkdir -p docs/stages && git mv <เก่า>/* docs/stages/` แล้ว `rm -rf <core เก่า>` — verify จริงด้วย git repo จำลองทั้งกรณี migrate-ก่อน/หลัง-install (ดู `docs/techstack/installer/test.md` §executable migration proof)
- **ป้องกันซ้ำ:** (1) เอกสาร migration ที่ย้ายของเข้าโฟลเดอร์ที่ installer อาจสร้าง → ใช้ `git mv <src>/* <dest>/` (ย้าย contents) เสมอ ไม่ใช่ `git mv <src> <dest>` (2) **เทส migration ด้วย executable proof** (จำลอง legacy → รันคำสั่งในเอกสารจริง → assert) — bug แบบนี้อ่านเอกสารเฉยๆ มองไม่เห็น (3) legacy warning ใน `src/bin/cli.mjs` ควรแก้ให้ตรง guide (roadmap P0 #3) — ตอนนี้เอกสาร robust กว่า cli
