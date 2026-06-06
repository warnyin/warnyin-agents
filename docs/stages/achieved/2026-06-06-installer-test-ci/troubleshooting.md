# Troubleshooting — installer-test-ci

> ปัญหายาก/เจอซ้ำที่แก้สำเร็จระหว่าง BUILD · SHIP จะยกขึ้น `docs/troubleshooting.md`

## 1. `node --test <dir>` ล้ม MODULE_NOT_FOUND บน node 24 (จาก build agent wave 1)
- **อาการ:** `node --test tests/` → `Error: Cannot find module '.../tests'` (MODULE_NOT_FOUND), tests=1 pass=0
- **Root cause:** node 24 ไม่ทำ directory auto-discovery จาก path argument — ตีความ argument เป็น **module path**; directory-discovery ทำเฉพาะตอน **ไม่ใส่ path** (bare `node --test`) ส่วน glob `tests/**/*.test.mjs` ใช้ได้แต่ glob support เพิ่งมาใน node 21 → ไม่ portable ไป node 20 ใน CI matrix
- **วิธีแก้:** ตั้ง `scripts.test = "node --test"` (bare, ไม่มี path) — auto-discover `*.test.*` ใน cwd, ข้าม `node_modules`, ทำงานเหมือนกันทุก node 20/22/24
- **ป้องกันซ้ำ:** อย่าใส่ directory path ให้ `--test` ถ้าต้อง portable ข้าม node major; ใช้ bare `node --test` หรือระบุไฟล์เต็ม; เลี่ยง glob `**` ถ้า matrix รวม node 20 · **ผลต่อ design:** §4/§5 ที่เขียน `node --test tests/` ถูก override → ci-pipeline เรียก `npm test` (อย่า hardcode path ซ้ำ)

## 2. Workflow `build-wave.mjs` รับ args เป็น string (core fix — main loop)
- **อาการ:** เรียก `Workflow({scriptPath, args:{slug,...}})` → script log "ไม่มี slug หรือ tasks", agent 0, 10ms
- **Root cause:** harness นี้ pass `args` ของ Workflow tool เป็น **JSON string verbatim** ไม่ deserialize → `args.slug` บน string = undefined
- **วิธีแก้:** `build-wave.mjs` defensive parse — `const A = typeof args==='string' ? JSON.parse(args) : (args||{})` (commit บน main เป็น core bugfix)
- **ป้องกันซ้ำ:** ทุก workflow script ที่รับ args ควรเผื่อกรณี string (harness-dependent) · **เป็น dogfood finding — กระทบทุก BUILD** → ควรเข้า roadmap

## 4. ★ Scaffold leak — installer ลากงานจริงของ repo ต้นทางไป target (เจอตอน VERIFY)
- **อาการ:** `npm pack` ติด `docs/stages/installer-test-ci/**` (16 ไฟล์ dogfood) ขึ้น package; `node bin/cli.mjs` ใน temp ใหม่ → ลง `docs/stages/installer-test-ci/**` ในโปรเจกต์ผู้ใช้ปลายทาง
- **Root cause:** `SCAFFOLD=[docs/stages]` + `copyTree('docs/stages',{overwrite:false})` **copy ทั้ง tree จาก `pkgRoot`** — เดิม `docs/stages` มีแค่ scaffold เปล่า (`context.md`/`achieved/.gitkeep`) จึงไม่เห็นปัญหา พอมีงานจริง (topic) อยู่ใน `docs/stages` ก็รั่วทันที; `package.json files` ก็ใส่ `docs/stages` ทั้ง dir → leak ขึ้น published package ด้วย
- **ทำไม pack-verify เดิมจับไม่ได้:** allowlist อนุญาต `docs/stages/` ทั้ง prefix (ถือว่า scaffold = ตั้งใจ ship) → topic หลุดผ่านได้เงียบ
- **วิธีแก้ (user decision: "สร้างไฟล์แทน ไม่ต้อง copy"):**
  1. `bin/cli.mjs` — เลิก `copyTree(docs/stages)`; เพิ่ม `ensureScaffold()` ที่ **generate** `docs/stages/context.md` + `docs/stages/achieved/.gitkeep` (เปล่า) เองใน target (ไม่อ่านจาก pkgRoot → ไม่มีทาง leak)
  2. `package.json` — ตัด `docs/stages` ออกจาก `files` (ไม่ ship docs/stages ขึ้น package เลย)
  3. `scripts/verify-pack.mjs` — ตัด `docs/stages/` ออกจาก allowlist + เพิ่ม guard FAIL ถ้ามี path ขึ้นต้น `docs/` หลุดขึ้น package
  4. `tests/installer.test.mjs` — เพิ่มเคส 9: ติดตั้งแล้วต้องมี scaffold เปล่า **และไม่มี topic ใด ๆ** ใต้ `docs/stages`
- **ป้องกันซ้ำ:** scaffold/workspace ที่ผู้ใช้เป็นเจ้าของ → installer **สร้างเอง** อย่า copy จาก repo ต้นทาง (ของต้นทางจะรั่วทุกครั้งที่มีงานจริง); pack allowlist อย่าใส่ path ที่ปนงานจริง · **เป็น core bug ของ installer — กระทบทุกการ publish หลังเริ่มมี topic จริง** (ก่อนหน้านี้ไม่เห็นเพราะ repo ยังไม่มี topic)

## 3. `verify-pack.mjs` รันตรงบน Windows ล้ม ENOENT (จาก build agent wave 2)
- **อาการ:** `node scripts/verify-pack.mjs` บน Windows → `execFileSync ENOENT spawn npm`; บน CI ubuntu ปกติ
- **Root cause:** `execFileSync('npm', ...)` ไม่ผ่าน shell — บน Windows executable จริงคือ `npm.cmd` ไม่ใช่ `npm`; `execFile` ไม่ทำ PATHEXT resolution
- **วิธีแก้:** ยอมรับเป็น **dev-only** (CI รัน ubuntu ที่ `npm` อยู่ใน PATH ตรง ๆ) — ยืนยัน logic ด้วยการรัน `npm pack --dry-run --json` แล้ว apply allowlist เองบน Windows = PASS
- **ป้องกันซ้ำ:** ถ้าต้องรัน script นี้บน dev Windows จริง → `shell:true` หรือเลือก binary ตาม `process.platform` (`npm.cmd` vs `npm`); topic นี้ defer เพราะ CI เป็น runner หลัก
