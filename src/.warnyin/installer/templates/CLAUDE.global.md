<!-- warnyin:global-note -->

## การ resolve playbook (local-first → global)
- path `.warnyin/workflow/...` / `.warnyin/template/...`: หาในโปรเจกต์ `./.warnyin/` ก่อน ไม่มี → `~/.warnyin/` (global install)
- ถ้ายังไม่มี `docs/stages/` (global mode โปรเจกต์ใหม่) → รัน `/warnyin:init` ก่อน (สร้าง workspace)
