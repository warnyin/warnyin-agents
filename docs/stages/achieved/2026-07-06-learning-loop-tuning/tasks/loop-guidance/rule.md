# Rule — loop-guidance

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก docs/rule.md)
- [ ] **unify-in-place ไม่สร้างกลไกขนาน** — ขยายในที่เดิม
- [ ] **canonical-copy convention** — canonical อยู่ `design.md §2.5`, copy ไม่แต่งใหม่, ข้ามไฟล์ = pointer
- [ ] **structural validator ✖ ไม่พึ่ง filled-detection** — C3 proxy = non-blocking report ไม่ใช่ gate ✖
- [ ] **payload-guidance ต้อง generic (tool-agnostic)** — ไม่ผูกชื่อรุ่น/tool แม้ในประโยคปฏิเสธ
- [ ] **แก้ src เท่านั้น** (src→root sync-gap) — ห้ามแตะ root `.warnyin/`
- [ ] **investigate-before-edit** — ตรวจ section จริงก่อนวาง (anchor ใน design §2.5 pin ไว้แล้ว แต่ยืนยันกับไฟล์)
- [ ] **change-sizing ⚠ ไม่ใช่ ✖** — guidance ไม่ทำให้ gate เดิม block เพิ่ม

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
- [ ] rule ที่เสนอ: **"loop-tuning convention"** — fix loop (BUILD full-gate / VERIFY) มี guidance ปรับ **ลำดับ/การจัดกลุ่มของการแก้** (credit-horizon + experience-batching) ที่ **ปรับแค่ sequencing ไม่ลด correctness/test-floor**; default ผูก tier (canonical ใน `triage.md §2C`), why อยู่จุดที่ loop รัน (build/verify), reference กันด้วย pointer — เหตุผล: generalize จาก topic นี้ เป็นคู่ของ config-protection (loop เดียวกัน); evidence: paper arXiv:2603.23994v2 + verify ของ topic นี้
- [ ] note (SA-S2): ตอน SHIP เพิ่ม pointer 1 บรรทัดใน `docs/features/change-sizing` ว่า loop-tuning default ถูก add ที่ triage §2C โดย topic `learning-loop-tuning`
