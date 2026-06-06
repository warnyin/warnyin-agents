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
