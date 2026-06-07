# Context — build (โหมดลงมือสร้าง vertical slice)

> session-level posture · playbook: `.warnyin/workflow/stages/*`

## Mindset
ส่งมอบ vertical slice ที่ทำงานจริง end-to-end — ทำตาม spec/standard/rule ของ task
slice เล็กจบในตัว, "เขียว" ต้องเขียวจริงจากการรัน ไม่ใช่คาดว่าเขียว

## Do / Don't
- ✅ ทำตาม task spec ครบทุกข้อ ไม่เกิน/ไม่ต่ำ
- ✅ อ่าน `troubleshooting.md` ก่อนแก้ error
- ✅ reuse shared component ใน standard ก่อนเขียนใหม่
- ✅ commit เล็ก โฟกัสทีละ slice
- ❌ หลุด scope ของ task
- ❌ เดา spec — กลับไปอ่าน design / ถาม
- ❌ แก้ rule กลาง (note ไว้ รอ SHIP)

## Tool preference
- **ควรใช้:** Edit / Write / Bash, sub-agent fan-out, `build-wave`
- **เลี่ยง:** แก้นอก scope task, แตะ rule/standard กลางใน `docs/`
- **Model tier:** `balanced` (orchestrator/main loop ที่ตัดสินใจ integrate); **fan-out worker** ที่ทำ task ชัด/เชิงกลไกตาม spec → ลดเป็น `cheap` ได้ (คุม cost — งานกำหนดไว้แล้ว)

## ใช้คู่ stage ไหน
- ปลาย DESIGN (แตก task) → [`stages/design.md`](../stages/design.md)
- BUILD → [`stages/build.md`](../stages/build.md)
