# Standard — build-log-narrative

> อิงจาก `docs/rule.md` (global) + `docs/techstack/installer/standard.md` (script pattern) — ยังไม่มี `docs/techstack/workflow-core/`

## 1. Standard กลางที่ยึด
- **zero-dependency + ESM** (`build-wave.mjs`) — built-in เท่านั้น; ไม่เพิ่ม dep
- **main loop เขียน topic file เอง** — pattern มีอยู่: command `build.md:18` ดึง `result...troubleshooting` → เขียน `troubleshooting.md` (กันไฟล์ชนใน worktree #14); build-log.md ใช้ pattern เดียวกัน (`result.results[].events`)
- **`RESULT_SCHEMA` pattern** — field เป็น JSON Schema; `additionalProperties:false` ที่ object; field ใหม่ต่อท้าย `properties`, optional ไม่อยู่ใน `required` (backward-compat)
- **tool-agnostic** — playbook `.md` กลางที่ทุก harness อ่านได้; build-log.md เป็น artifact ที่ harness สร้างเอง (ไม่ผูก Workflow tool)
- ภาษาไทย, เขียนแบบ playbook (สั้น ชี้กลับแก่น)

## 2. Pattern การเขียนของ task นี้
- **schema (a):** เพิ่ม `events` ต่อท้าย `properties` เดิมใน `RESULT_SCHEMA` (`build-wave.mjs:30-59`) — **ไม่แตะ** `parallel()`/worktree flow (`:95-109`); copy นิยาม (kind/maxItems) จาก `design.md §3.1` คำต่อคำ
- **prompt (a):** เติม 1 ข้อใน array `prompt()` (`:61-92`) กระชับ 1 บรรทัด (pattern เดียวกับข้อ 8 ที่อ้าง field troubleshooting) — ชี้ §3.1 ไม่ duplicate นิยามยาว
- **compose (b):** เป็น **instruction ใน playbook/command** (main loop เขียน) ไม่ใช่ code/compose function — กลั่น narrative ตาม `design.md §3.2`; canonical-copy (โครง build-log.md เต็มอยู่ design §3.2)
- **template (c):** copy โครง `design.md §3.2` คำต่อคำ — ห้ามแต่งใหม่ (canonical-copy convention)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `RESULT_SCHEMA` + `troubleshooting[]` field เป็นแม่แบบของ `events[]` (`build-wave.mjs:42-57`)
- main loop compose pattern จาก command `build.md:18` (ดึง field จาก results → เขียน topic file)
- canonical schema/โครง build-log.md เดียวใน `design.md §3` — ทุกไฟล์ (prompt/command/playbook/template) ชี้กลับ

## 4. เพิ่มเติมเฉพาะ task
- ถ้า build orchestration มี artifact/convention เพิ่มในอนาคต → พิจารณาสร้าง `docs/techstack/workflow-core/` (note รอ SHIP) — ตอนนี้ rule/standard อ้าง global + installer script pattern
