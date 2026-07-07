# Spec — Learning Loop Tuning guidance

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior · **descriptive ไม่ใช่ imperative**
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, ลิงก์ resolve)
> merge จาก topic `learning-loop-tuning` (achieved 2026-07-06) Spec delta §9

## Requirement: fix-loop มี credit-horizon + batching guidance
fix loop ของ BUILD และ VERIFY มี guidance ★ loop tuning โดย why-guidance (ตัวเลือก/เงื่อนไข/⚠ churn/paper ref) เป็น **single-source ที่ `src/.warnyin/workflow/loop-tuning.md`** (orchestrator-only); `build.md §4 ข้อ 6` / `verify.md §4 ข้อ 5` เหลือ canonical wording block: pointer (md link `../loop-tuning.md`) + report requirement นอก gate checklist (enum `per-finding | batched` + "เหตุผล 1 บรรทัด")

### Scenario: theory single-source
- GIVEN playbook หลัง change
- WHEN grep เนื้อ why-block (เช่น "credit horizon" พร้อมตัวเลือก ·/⚠)
- THEN เจอเต็มเฉพาะ `loop-tuning.md`; `build.md`/`verify.md` มีเฉพาะ wording block (pointer + report requirement — enum `per-finding | batched` + "เหตุผล 1 บรรทัด" คงคำเดิม); gate checklist `build.md §7`/`verify.md §6` จำนวน item เท่าเดิม

## Requirement: default-by-tier ของ loop tuning อยู่ใน triage เดียว
triage มี default credit-horizon + batching ต่อ 3 tier (fast/standard/large) เป็น canonical เดียว starting-point ปรับได้ ไม่ lock

### Scenario: §2C pointer ใหม่ + dedup คงเดิม
- GIVEN ไฟล์ `src/.warnyin/workflow/triage.md` sub-section §2C "Loop-tuning default per tier" (ต่อจาก §2B, ไม่ใช่ใต้ Fast-track skip-list)
- WHEN ตรวจ pointer + grep ตาราง default
- THEN มีตาราง default ต่อ 3 tier + บรรทัด why-pointer ใต้ตารางชี้ → `loop-tuning.md` (md link); **ตาราง default ไม่ปรากฏใน build.md/verify.md/loop-tuning.md** (negative-grep) และ **why-block ไม่ปรากฏใน triage**

## Requirement: starting-artifact note ใน design.md
design.md (playbook) มี note ว่า decomposition + starting spec กำหนด solution ที่ BUILD เอื้อมถึง (เสริม DAG-width เดิม)

### Scenario: note ปรากฏใกล้ DAG-width / แตก task
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/design.md`
- WHEN อ่าน §3 item 3 (DAG-width toolkit) หรือ §4 step 7 (แตก tasks)
- THEN มี note สั้น "★ starting-artifact" อ้าง paper ว่า decomposition กำหนด solution ที่เอื้อมถึง + ระบุ "ไม่ใช่ knob ใหม่"
