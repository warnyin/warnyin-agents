# Standard — resolution-convention

> pattern payload `.md` — อิง `docs/techstack/installer/standard.md` + `docs/rule.md §1`

## เขียน root doc / template
- **tool-agnostic** (`docs/rule.md §1`) — wording generic ไม่ผูกชื่อรุ่น/ผลิตภัณฑ์; CLAUDE.md=Claude, AGENTS.md=Codex/Antigravity เนื้อ "ความหมาย" เดียวกัน
- **canonical-copy** — resolution/workspace-guard เนื้อเดียวกระจาย 3 ไฟล์ ต้องตรงกัน (ไม่แต่งใหม่ต่อไฟล์)
- **กระทัดรัด opinionated** — note สั้น ตรงประเด็น; `CLAUDE.global.md` = note-only (ไม่ลอก project template ทั้งก้อน)
- **mirror layout** — `CLAUDE.global.md` วางใต้ `installer/templates/` (ที่ cli อ่าน) ; payload ใต้ `src/.warnyin/` → ติด tarball ผ่าน allowlist เดิม (ไม่ต้องแก้ `package.json files`)
- **marker เป็น HTML comment** `<!-- warnyin:global-note -->` (ไม่ render, ไม่กระทบเนื้อ, grep ง่าย) — pattern เดียวกับ marker idempotent เดิม

## รูปแบบ section ที่เพิ่ม (แนวทาง)
```markdown
## การ resolve playbook (local-first → global)
- path `.warnyin/workflow/...` / `.warnyin/template/...`: หาในโปรเจกต์ `./.warnyin/` ก่อน ไม่มี → `~/.warnyin/` (global install)
- ถ้ายังไม่มี `docs/stages/` (global mode โปรเจกต์ใหม่) → รัน `/warnyin:init` ก่อน (สร้าง workspace)
```
