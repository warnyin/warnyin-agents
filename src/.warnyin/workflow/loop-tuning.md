# Loop tuning — ปรับลำดับ/จัดกลุ่มการแก้ไฟล์ fix loop

> **Orchestrator-only guidance** — ผู้อ่าน = main loop ตอน fix loop มี finding >1 ใน BUILD full-gate (`stages/build.md` §4 ข้อ 6) / VERIFY แก้จนผ่าน (`stages/verify.md` §4 ข้อ 5)
> ไฟล์นี้**ไม่ใช่ playbook** ที่ build/verify sub-agent ต้องอ่านก่อนทำงาน — เป็น why-guidance สำหรับการตัดสินใจของ orchestrator ตอน fix loop ปรากฏ finding >1
> Surface อื่นๆ ชี้กลับที่นี่ด้วย pointer ไม่ copy hierarchy ซ้ำ

---

## Theory: ปรับแค่ลำดับ/การจัดกลุ่ม ไม่ลด correctness

จาก paper "iterative generative optimization": **loop tuning ปรับแค่ "ลำดับ/การจัดกลุ่ม" ของการแก้ — ไม่ลด correctness/test-floor** (สอด config-protection: "แก้จนผ่าน" = แก้ root cause ไม่ใช่ลด bar)

ก่อนแก้ตัดสิน 2 อย่าง แล้วระบุ choice + เหตุผล 1 บรรทัดในรายงาน:

### 1. Credit horizon (feed feedback แค่ไหนต่อรอบ)

- **สั้น** = แก้ทีละ finding rerun ถี่ — เหมาะเมื่อ finding independent + สัญญาณเฉพาะหน้าสอดคล้องเป้า (เร็วกว่า)
- **ยาว** = รวม failure ทั้งชุด วิเคราะห์ root cause ร่วม แล้วแก้เป็นชุด — เหมาะเมื่อ finding coupled (แก้จุดนึงเสี่ยงพังอีกจุด)
- ⚠ **update ถี่เกินด้วย horizon สั้นเกิน → churn/ผลแย่ลง** (อย่าแก้ทีละจุดถ้า failure โยงกัน)

### 2. Experience batching (ตอน delegate fix)

- แบ่ง failure ตาม component/root-cause แล้ว delegate ทีละกลุ่ม
- ⚠ **batch ใหญ่ ≠ ดีกว่าเสมอ (task-dependent)** — เลือกขนาดกลุ่มตามโครงเหตุ-ผล ไม่ใช่ "อัด context เยอะ = ดี"

### 3. Default per tier

ดู [triage.md loop-tuning default](triage.md) — default ปรับได้ ไม่ lock

---

## Loop-tuning report

ตอนรายงาน fix loop (มี finding >1 — non-blocking guidance):

- ระบุ **credit-horizon choice** (per-finding | batched) + เหตุผล 1 บรรทัด ในรายงาน ก่อนแก้
- ตอน delegate fix → failure ถูก group (รายงานเห็น ≥1 group boundary by component/root-cause) หรือ ระบุเหตุผลว่าทำไมกลุ่มเดียวพอ — ไม่ dump ก้อนเดียวเงียบๆ

สำหรับ wording requirement ของ report ฟิลด์ — **เจ้าของนิยาม** คือ [stages/build.md](stages/build.md) §4 ข้อ 6 · Loop-tuning report; VERIFY ใช้กฎเดียวกัน ([stages/verify.md](stages/verify.md) §4 ข้อ 5 เป็น pointer ชี้กลับมาที่นี่ ไม่ใช่ตัวนิยามซ้ำ)
