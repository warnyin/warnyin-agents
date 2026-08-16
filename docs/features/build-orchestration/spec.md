# Spec — Build orchestration

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior · **descriptive ไม่ใช่ imperative**
> feature ประเภท playbook + workflow script → THEN เป็น **observable artifact** (section/key string มีจริง, พฤติกรรม script เทสได้ผ่าน extractFn)
> สร้างจาก Spec delta (ADDED) ของ topic `build-lean` (achieved 2026-07-07) — พฤติกรรมส่วนที่มาก่อนหน้าดู `feature.md`

## Requirement: Worktree เฉพาะ wave ที่ขนานจริง
BUILD ใช้ worktree isolation เฉพาะ wave ที่มี ≥2 task (parallel จริง); wave เดี่ยวทำ shared tree บน build branch — ตัด fork/merge-dance ที่ไม่จำเป็น

### Scenario: wave เดี่ยวไม่ fork worktree
- GIVEN wave มี task เดียว
- WHEN BUILD ตาม playbook
- THEN `build.md §3 ข้อ 3` ระบุ wave เดี่ยว → `isolate:false` (shared tree บน working tree จริง, orchestrator checkout build branch ก่อนรัน wave, agent ไม่ commit เอง, main loop review แล้ว commit) และ `§4 ข้อ 5` ครอบ integrate ทั้งสอง mode

## Requirement: Build-agent prompt อ่านเฉพาะที่จำเป็น
prompt ที่ `build-wave.mjs` ส่งให้ sub-agent สั่งอ่านเฉพาะ role card developer + 4 ไฟล์ task + `docs/techstack/<component>/rule.md` ของ component ที่ task แตะ + "อ่านเพิ่มเฉพาะไฟล์ที่ task.md/standard.md/rule.md อ้างถึง" — ไม่สั่งอ่าน playbook/design/proposal/techstack แบบเหมา

### Scenario: prompt ไม่สั่งอ่านเอกสารเหมา
- GIVEN `prompt()` ใน build-wave.mjs
- WHEN สกัดข้อความ prompt (extractFn)
- THEN ไม่มี path `stages/build.md` / `design.md` / `proposal.md` และยังมี role card + 4 ไฟล์ task + techstack rule.md ของ component ที่แตะ (test ใน `build-wave.test.mjs` เคส F-K; step 0 sync ปรากฏเฉพาะ `isolate && baseRef`)

## Requirement: Fast tier ไม่ผ่าน build-wave
tier `fast` ไม่ fan-out — main loop แก้โค้ดเอง code-first ตาม ★ fast-track hook ใน `build.md §1` โดยคง correctness floor ครบ

### Scenario: fast hook ใน BUILD playbook
- GIVEN tier fast
- WHEN อ่าน `build.md` fast-track hook (§1)
- THEN ระบุ main loop แก้โค้ดเอง code-first ไม่ spawn sub-agent/worktree + correctness floor ครบตาม skip-list row BUILD (canonical `triage.md` — full-gate blocking · config-protection · investigate-before-edit · ห้ามแตะ rule กลาง)

## Requirement: BUILD ต่อ VERIFY ในเซสชันเดียว + artifact เดียว
หลัง full-gate เขียว BUILD เสนอเดิน VERIFY ต่อในเซสชันเดียวโดยยืนยันหนึ่งครั้ง (ปฏิเสธ → หยุด ให้ user สั่ง `/warnyin:verify` เอง); ผลของทั้งสอง stage เขียนลง `build.md` ไฟล์เดียว 4 section (`## 1. ผล build ต่อ task` · `## 2. Full build & test gate` · `## 3. แผนเทส (VERIFY)` · `## 4. ผล verify + การแก้`) แทน 3 ไฟล์เดิม; verify phase ยังบังคับใช้ agent อิสระจากผู้เขียน และ gate ของ VERIFY ไม่เปลี่ยน

### Scenario: continue หนึ่งครั้งหลัง full-gate
- GIVEN BUILD ผ่าน full build + test gate
- WHEN จบ §4 ปิดงาน
- THEN `build.md` playbook ระบุให้ถามยืนยันหนึ่งครั้งเพื่อเดิน VERIFY ต่อ และระบุทางเลือกหยุดให้ user สั่ง command เอง

### Scenario: artifact เดียวสี่ section
- GIVEN template `src/.warnyin/template/stages/[topic]/`
- WHEN อ่านรายชื่อไฟล์
- THEN มี `build.md` ที่มีครบสี่ section ตามชื่อข้างต้น และไม่มี `test.md`/`verify.md` แยก

### Scenario: ผู้ตรวจอิสระจากผู้เขียน
- GIVEN `src/.warnyin/workflow/stages/verify.md`
- WHEN อ่านหลักการของ verify phase
- THEN ระบุว่าการ verify ต้องทำโดย agent/บทบาทที่อิสระจากผู้เขียนโค้ด (self-check ของ build agent ไม่นับ)
