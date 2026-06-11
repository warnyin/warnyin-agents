# Spec — init-workspace

> feature ประเภท playbook `.md` (ไม่มี runtime) → THEN = observable artifact (section/step มีจริง)

## persona
agent ที่รัน `/warnyin:init` ในโปรเจกต์ใหม่ (global mode ไม่มี `./.warnyin/` local + ไม่มี workspace)

## data-flow
init อ่าน template (`.warnyin/template/docs/`, local→global) → สร้าง scaffold + seed `docs/` ถ้าไม่มี → วิเคราะห์โปรเจกต์ (ขั้นเดิม)

## test-flow (task-scope — structural)
1. **step bootstrap มีจริง:** `init.md` มี step สร้าง `docs/stages/context.md` + `docs/stages/achieved/.gitkeep` + seed `docs/` ก่อนขั้นวิเคราะห์
2. **local-first → global:** ระบุอ่าน template `./.warnyin/template/` ก่อน fallback `~/.warnyin/template/` (§3C)
3. **idempotent:** ระบุ "ไม่ทับไฟล์ที่มีอยู่" + ข้าม `[...]` (seedDocs invariant)
4. **unify-in-place:** ไม่มี section/playbook ขนานใหม่ — แทรกในโครงเดิม
5. **lint:md own-file** ผ่าน

## observable
- init.md มี workspace-bootstrap step (scaffold+seed, local→global, idempotent) — global mode โปรเจกต์ใหม่ได้ workspace หลังรัน init
