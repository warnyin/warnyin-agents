# Spec — Learning Loop Tuning guidance

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior · **descriptive ไม่ใช่ imperative**
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, ลิงก์ resolve)
> merge จาก topic `learning-loop-tuning` (achieved 2026-07-06) Spec delta §9

## Requirement: fix-loop มี credit-horizon + batching guidance
fix loop ของ BUILD และ VERIFY มีบล็อก guidance ★ loop tuning (credit-horizon + experience-batching + guard ไม่ลด correctness) เป็น observable artifact ในไฟล์

### Scenario: guidance block ปรากฏใน build.md + verify.md
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/build.md` (§3 item 8 / §4 step 6) และ `verify.md` (§3 item 5 / §4 step 5)
- WHEN grep บล็อก "★ loop tuning"
- THEN เจอในทั้งสองไฟล์ (canonical-copy) โดยมี: credit-horizon สั้น/ยาว + ⚠ update ถี่เกิน + batching + ⚠ ใหญ่≠ดีกว่า + guard "ปรับแค่ลำดับ/การจัดกลุ่ม ไม่ลด correctness/test-floor" + pointer (markdown link) ไป triage สำหรับ default

### Scenario: C3 report note เป็น non-blocking (ไม่ทำ gate เดิมพัง)
- GIVEN build.md §7 gate + verify.md §6 gate (checklist `- [ ]`)
- WHEN เทียบ count + เนื้อหา item ก่อน/หลัง feature
- THEN gate checklist เดิมคงเดิมทุก item (ไม่มี `- [ ]` ใหม่ของ loop-tuning); C3 report note อยู่ท้าย fix loop (§4 step 6 / step 5) นอก checklist ระบุ enum `per-finding | batched` + "เหตุผล 1 บรรทัด"

## Requirement: default-by-tier ของ loop tuning อยู่ใน triage เดียว
triage มี default credit-horizon + batching ต่อ 3 tier (fast/standard/large) เป็น canonical เดียว starting-point ปรับได้ ไม่ lock

### Scenario: default table canonical-only (dedup 2 ทิศ)
- GIVEN ไฟล์ `src/.warnyin/workflow/triage.md`
- WHEN อ่าน sub-section §2C "Loop-tuning default per tier" (ต่อจาก §2B, ไม่ใช่ใต้ Fast-track skip-list)
- THEN มีตาราง default ต่อ 3 tier + pointer (markdown link) กลับ build.md §4 step6 · verify.md §4 step5 สำหรับ why; **ตาราง default ไม่ปรากฏใน build/verify** (negative-grep) และ **why-block ไม่ปรากฏใน triage**

## Requirement: starting-artifact note ใน design.md
design.md (playbook) มี note ว่า decomposition + starting spec กำหนด solution ที่ BUILD เอื้อมถึง (เสริม DAG-width เดิม)

### Scenario: note ปรากฏใกล้ DAG-width / แตก task
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/design.md`
- WHEN อ่าน §3 item 3 (DAG-width toolkit) หรือ §4 step 7 (แตก tasks)
- THEN มี note สั้น "★ starting-artifact" อ้าง paper ว่า decomposition กำหนด solution ที่เอื้อมถึง + ระบุ "ไม่ใช่ knob ใหม่"
