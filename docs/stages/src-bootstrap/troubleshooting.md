# Troubleshooting — src-bootstrap

> ปัญหายาก/เจอซ้ำที่แก้สำเร็จระหว่าง BUILD · SHIP จะยกขึ้น `docs/troubleshooting.md`

## #1 — `node src/bin/cli.mjs` รันโดย cwd=repo root → เขียน dogfood payload ลง root (untracked leak)
- **พบใน:** T1 move-source-to-src (verify fresh install)
- **อาการ:** หลัง `git mv` แล้วลองรัน installer เพื่อ verify โดยไม่ได้ `cd` ไป temp ก่อน → เกิด untracked `.claude/`, `.warnyin/`, `AGENTS.md` + seed `docs/project.md`, `docs/infra.md` ที่ root (`git status` เห็น `??` หลายรายการ)
- **Root cause:** `target = process.cwd()`; guard `pkgRoot===target` หลังย้ายเป็น **no-op โดยตั้งใจ** (pkgRoot=`src/` ไม่มีทาง === repo root) → installer install จริงลง cwd ปัจจุบันได้ทุกที่ที่ไม่ใช่ `src/` เอง
- **วิธีแก้:** ลบ stray ด้วย `git clean -fxd` แบบ scope เจาะจง (`.claude .warnyin docs/project.md docs/infra.md AGENTS.md`) — ตรวจ `git cat-file -e HEAD:<path>` ก่อน เพื่อแยก stray ออกจาก tracked doc จริง
- **ป้องกันซ้ำ:** ทดสอบ installer จาก `src/` ต้องรันใน subshell `( cd "$TMP" && node "$ROOT/src/bin/cli.mjs" )` เสมอ — อย่าปล่อย cwd เป็น repo root; ตรงกับเหตุผลที่ `setup-sandbox.mjs` (T4) ใช้ `mkdtempSync` + spawn cwd=sandbox

## #2 — worktree sub-agent อัปเดต topic docs (`docs/stages/<slug>/`) ไม่ได้
- **พบใน:** T1 (worktree isolation)
- **อาการ:** build sub-agent ใน worktree update `task.md` status / เขียน `troubleshooting.md` ไม่ได้ — worktree branch base = commit ก่อน DESIGN artifacts (`e0ef1ed`) → `docs/stages/src-bootstrap/` ไม่ถูก track ใน branch ของ worktree
- **Root cause:** Agent worktree isolation แตก branch จาก commit ก่อนหน้า ไม่ใช่ build branch HEAD ที่มี DESIGN artifacts
- **วิธีแก้:** main loop (มี topic context บน build branch) เป็นผู้อัปเดต `task.md` + เขียน topic `troubleshooting.md` หลัง merge — sub-agent รายงานผ่านฟิลด์ `notes`/`troubleshooting` แทน
- **ป้องกันซ้ำ:** สำหรับ topic นี้ wave 2-5 ใช้ **shared-tree** (sub-agent ทำงานใน main working dir ที่มี topic docs ครบ) → อัปเดต task.md เองได้

## #3 — `npx @warnyin/agents` resolve bin-shim ไม่ได้บน Windows
- **พบใน:** main loop (restore dogfood) + T4 (setup:dogfood)
- **อาการ:** `npx --yes @warnyin/agents@<ver>` บน Windows → `'warnyin-agents' is not recognized as an internal or external command` (ทั้ง Git Bash + PowerShell + `npx --package=... -- warnyin-agents`) แม้ cli.mjs มี shebang ครบ
- **Root cause:** บาง dev env (Windows) npx สร้าง/หา bin-shim (.cmd) ของ package ไม่เจอ → spawn ล้ม แม้ package ติดตั้งสำเร็จ
- **วิธีแก้:** `setup-dogfood.mjs` ทำ 2-tier — (1) ลอง `npx --yes` (shell:true เฉพาะ win32) ตรวจ shimMissing จาก `r.error.code==='ENOENT'` หรือ stderr match `/is not recognized/`/`/command not found/`; (2) fallback `npm pack` → `tar -xzf --strip-components 1` → `node <pkg>/bin/cli.mjs` (cwd=repoRoot). ถ้าทั้งคู่ล้ม `exit(1)` ชัดเจน ไม่ false-green
- **ป้องกันซ้ำ:** dev tooling ที่เรียก npx package ของตัวเอง ควรมี fallback npm pack→extract→node เสมอ (npx bin-resolution ไม่ portable ข้าม OS)

## #4 — fallback ของ setup:dogfood hardcode `src/bin/cli.mjs` แต่ baseline 0.6.0 = `bin/cli.mjs`
- **พบใน:** main loop review T4 (bug จริงใน fallback path)
- **อาการ:** fallback (Windows) extract tarball แล้วหา `<pkg>/src/bin/cli.mjs` — แต่ `@latest` ปัจจุบัน = 0.6.0 (layout เก่า ก่อน restructure) มี cli ที่ `bin/cli.mjs` → fallback หาไม่เจอ → setup:dogfood FAIL บน Windows+0.6.0 (npx path ไม่เจอเพราะ npx อ่าน bin จาก package.json เอง)
- **Root cause:** hardcode path เดียว สมมติว่า release มี layout เดียวกับ v-next — แต่ dogfood baseline เป็น **เวอร์ชันก่อน** restructure
- **วิธีแก้:** resolve cli จาก `package.json` `bin` ของ tarball (`pj.bin['warnyin-agents']`) + candidate `['src/bin/cli.mjs','bin/cli.mjs']` → ทนทั้ง 0.6.0 (bin/cli.mjs) และ 0.7.0+ (src/bin/cli.mjs) · พิสูจน์: pack 0.6.0 → resolve = `bin/cli.mjs` ✓
- **ป้องกันซ้ำ:** เครื่องมือที่ install release ของตัวเองในช่วง self-host transition ต้องไม่สมมติว่า release layout == working-tree layout (baseline เป็นเวอร์ชันก่อน) — resolve entry จาก metadata เสมอ

## #5 — live `setup:dogfood` ถูก sandbox classifier บล็อกใน build sub-agent
- **พบใน:** T4 (build context)
- **อาการ:** `npm run setup:dogfood` (npx @latest external exec + เขียน `.claude/agents`,`.claude/commands`,root `CLAUDE.md`) → Permission denied ใน build sub-agent
- **Root cause:** classifier ถือว่า download+execute external package + overwrite agent startup config = high-severity ที่ build context ไม่ได้รับอนุญาตเฉพาะ
- **วิธีแก้:** ไม่ work around — แยก acceptance ที่ deterministic (BL-3 collision via simulate seedDocs, idempotent pointer via lab marker, .gitignore via `git check-ignore`, sandbox flow) → verify ครบในแลบ; live setup:dogfood mark `[~]` deferred-to-VERIFY (มี user authorize + live env)
- **ป้องกันซ้ำ:** task ที่ต้องรัน external installer/agent-config writer → คาดว่า live e2e จะถูก gate; ออกแบบ acceptance ส่วนใหญ่ให้ deterministic/simulated เหลือ live e2e ไป VERIFY
