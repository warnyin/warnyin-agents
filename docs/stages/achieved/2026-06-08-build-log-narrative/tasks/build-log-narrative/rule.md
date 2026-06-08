# Rule — build-log-narrative

> rule ที่ task นี้ต้อง focus/follow + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก docs/rule.md §1/§2)
- [ ] **tool-agnostic** — playbook/command เป็น `.md` กลาง; build-log.md เป็น artifact ที่ harness สร้างเอง — ห้ามผูกชื่อ tool/model ใน wording (เช่นไม่อ้าง `/workflows` ของ Claude Code เป็นกลไกหลัก)
- [ ] **unify-in-place ไม่สร้างกลไกขนาน** — build-log.md เล่า "ระหว่างทาง" **ไม่จด status board** (ชนิด/ผลต่อ task เต็มอยู่ `build.md` — ชี้ไปแทน); ขยายขั้น compose ในที่เดิมของ command (ข้อ 6 คู่ troubleshooting) ไม่สร้าง section กลไกใหม่
- [ ] **canonical-copy convention** — kind 4 ค่า + นิยาม + โครง build-log.md เต็มอยู่ `design.md §3` เดียว; prompt/command/playbook/template = pointer copy คำต่อคำ ห้ามแต่งใหม่ (กัน emit↔compose drift)
- [ ] **zero-dependency + ESM** — `build-wave.mjs` built-in เท่านั้น
- [ ] **backward-compat (schema)** — `events` optional, **ไม่อยู่ใน root `required`**; result เดิมที่ไม่คืน events ต้องยัง valid + flow `parallel()` ไม่พัง
- [ ] **investigate-before-edit** — ก่อนแก้ `RESULT_SCHEMA`/`prompt()` เข้าใจ schema contract + parallel return (`:95-109`) + วิธี main loop บริโภค (command `:18`) ก่อน
- [ ] **acceptance = observable** — verify ด้วย structural proxy (Wave/kind/graceful/ไม่มี table/maxItems) ไม่พึ่ง "narrative ดีไหม" subjective; pass-count gate (pass==tests) ไม่ใช่แค่ exit 0

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] rule ที่เสนอ: *"BUILD ผลิต observability artifact (`build-log.md`) แบบ narrative — sub-agent คืนเหตุการณ์สำคัญผ่าน schema (worktree เขียน topic dir ไม่ได้ #14), main loop กลั่นเขียนเอง; เล่า 'ระหว่างทาง' ไม่จด status board (unify-in-place กับ build.md)"* — scope `component:workflow-core` (สร้าง `docs/techstack/workflow-core/` ตอน SHIP) — **evidence รอจาก build/verify** (schema diff + executable trace + build-log.md จริงของ topic นี้)
