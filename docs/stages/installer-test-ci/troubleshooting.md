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

## 3. `verify-pack.mjs` รันตรงบน Windows ล้ม ENOENT (จาก build agent wave 2)
- **อาการ:** `node scripts/verify-pack.mjs` บน Windows → `execFileSync ENOENT spawn npm`; บน CI ubuntu ปกติ
- **Root cause:** `execFileSync('npm', ...)` ไม่ผ่าน shell — บน Windows executable จริงคือ `npm.cmd` ไม่ใช่ `npm`; `execFile` ไม่ทำ PATHEXT resolution
- **วิธีแก้:** ยอมรับเป็น **dev-only** (CI รัน ubuntu ที่ `npm` อยู่ใน PATH ตรง ๆ) — ยืนยัน logic ด้วยการรัน `npm pack --dry-run --json` แล้ว apply allowlist เองบน Windows = PASS
- **ป้องกันซ้ำ:** ถ้าต้องรัน script นี้บน dev Windows จริง → `shell:true` หรือเลือก binary ตาม `process.platform` (`npm.cmd` vs `npm`); topic นี้ defer เพราะ CI เป็น runner หลัก
