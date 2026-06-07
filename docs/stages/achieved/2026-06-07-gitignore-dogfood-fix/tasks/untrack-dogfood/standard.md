# Standard — untrack-dogfood

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Standard กลางที่ยึด
- **2-layer / source-dogfood แยกชั้น** (`docs/rule.md` §6) — source = `src/**` (track/publish); root dogfood = gitignored; **`.gitignore` ต้อง root-anchored** (`/` นำหน้า) กัน match `src/`
- **investigate-before-edit** (`docs/rule.md` §1) — `git rm --dry-run` ก่อน rm จริง เพื่อยืนยันไม่โดน src
- **config-protection** (`docs/rule.md` §1) — ไม่แก้ test/payload "เพื่อให้ผ่าน"; งานนี้แก้ git/config root cause โดยตรง

## 2. Pattern การทำของ task นี้
- **untrack:** `git rm -r --cached <path>` (path เจาะจง root: `.warnyin` `.claude` `CLAUDE.md` `AGENTS.md` — **ไม่มี `src/` นำหน้า**); `--cached` = ลบจาก index เก็บ working tree
- **`.gitignore` anchored:** dogfood entry นำด้วย `/` (เช่น `/.warnyin/` ไม่ใช่ `.warnyin/`) — บทเรียน rule §6 ("ถ้าไม่ anchor จะ match `src/.warnyin/` → source หาย")
- **atomic commit:** untrack + gitignore ใน commit เดียว (ไม่ทิ้ง state ครึ่ง ๆ ที่ dogfood โผล่ untracked)
- **guard:** dry-run + grep `src/` ก่อน execute เสมอ

## 3. Shared component / utility
- `npm run setup:dogfood` (มีอยู่) — regen root dogfood หลัง untrack (ไม่เขียนใหม่)
- ไม่สร้าง script/test ใหม่ — VERIFY ใช้ `git ls-files`/`git check-ignore`/`git clone` + `npm test`/`verify:pack` เดิม

## 4. เพิ่มเติมเฉพาะ task
- **fresh-clone simulation** เป็นหลักฐานชี้ขาด "src ไม่หาย" — clone repo เข้า temp แล้ว assert (`git clone . <temp>` ใช้ local objects, เร็ว); **ห้ามรันใน working tree ปัจจุบันแบบทำลาย** — ใช้ temp เท่านั้น
- ถ้า `git rm --dry-run` แสดง `src/` ใด ๆ → **หยุดทันที** รายงาน (path ผิด)
