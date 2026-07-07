# Spec — loop-tuning-extract

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task

`docs` (workflow principle file — ไม่มี runtime code; API/UX-UI spec = N/A)

## 4. Data-flow

theory ไหลจาก 2 source → 1 canonical:

- **source A:** `src/.warnyin/workflow/stages/build.md` §4 ข้อ 6 — ★ loop tuning block (บรรทัด ~64-75)
- **source B:** `src/.warnyin/workflow/stages/verify.md` §4 ข้อ 5 — ★ block (บรรทัด ~58-69)
- → รวมเป็นชุดเดียวใน **`src/.warnyin/workflow/loop-tuning.md`** (ใหม่) — task นี้ **copy อย่างเดียว ไม่ลบ source** (การลบ = wave 2)
- pointer ขาออกจากไฟล์ใหม่: default-by-tier → `triage.md` §2C · report requirement → `stages/build.md` / `stages/verify.md`

## 6. Persona

- **ผู้อ่านไฟล์ใหม่:** orchestrator (main loop) ตอน fix loop มี finding >1 ใน BUILD full-gate / VERIFY แก้จนผ่าน — ไม่ใช่ build/verify sub-agent
- **ผู้ได้ประโยชน์ถัดไป:** task wave 2 (`build-stage-lean`/`verify-ship-lean`) ที่จะแทน block เดิมด้วย pointer wording (design §4.5)

## 7. Test-flow

> ยืนยันแบบ observable artifact (feature ประเภทเอกสาร — ตามแนว `docs/features/learning-loop-tuning/spec.md`)

- [ ] **T1 — diff สาระครบ (เทียบ block เดิม 2 ที่):** อ่าน `loop-tuning.md` เทียบ ★ block ใน `build.md` (~64-75) และ `verify.md` (~58-69) — สาระต้องครบทุกข้อ ไม่แต่งเพิ่ม:
  - หลัก "ปรับแค่ลำดับ/การจัดกลุ่ม — ไม่ลด correctness/test-floor" + โยง config-protection ("แก้จนผ่าน" = แก้ root cause ไม่ใช่ลด bar)
  - ที่มา paper "iterative generative optimization"
  - credit horizon: ตัวเลือก **สั้น** (แก้ทีละ finding rerun ถี่ — finding independent) / **ยาว** (รวมชุด วิเคราะห์ root cause ร่วม — finding coupled) + ⚠ update ถี่เกิน → churn/ผลแย่ลง
  - experience batching: แบ่งตาม component/root-cause delegate ทีละกลุ่ม + ⚠ "batch ใหญ่ ≠ ดีกว่าเสมอ" (task-dependent)
- [ ] **T2 — negative-grep ตาราง default:** grep ใน `loop-tuning.md` ต้อง**ไม่เจอ**ตาราง default-by-tier (เช่น row `| fast |` / `| standard |` / `| large |` ของตาราง §2C) — มีได้แค่ md link ไป `triage.md` (เคารพ negative-grep ของ `docs/features/learning-loop-tuning/spec.md`: ตาราง default อยู่ triage ที่เดียว)
- [ ] **T3 — header orchestrator-only:** ไฟล์ระบุผู้อ่าน = main loop (fix loop finding >1) + ระบุว่าไม่ใช่ playbook ที่ agent ต้องอ่าน
- [ ] **T4 — pointer เป็น md link:** pointer ไป `triage.md` + `stages/build.md` + `stages/verify.md` เป็น markdown link (ไม่ใช่ inline code เปล่า) และ resolve จริงจากตำแหน่ง `src/.warnyin/workflow/`
- [ ] **T5 — แตะไฟล์เดียว:** `git status` แสดงเฉพาะ `src/.warnyin/workflow/loop-tuning.md` (ไฟล์ใหม่) — ไม่มี modified ที่ `build.md`/`verify.md`/`triage.md` หรือไฟล์อื่น
- [ ] **edge ที่ยอมรับ (ไม่ใช่ failure):** `build.md`/`verify.md` ยังมี ★ block เดิม → theory ปรากฏ 3 ที่ชั่วคราวจนจบ wave 2 — ปกติตาม design §7 (single-source grep ตาม §4.6 เป็น gate ระดับ topic หลัง wave 2 ไม่ใช่ของ task นี้); `lint:md` แดงจาก pointer ข้าม slice = gate ระดับ integration ไม่ใช่ failure ของ task นี้
