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
