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
- **Model tier:** `balanced` (orchestrator/main loop ที่ตัดสินใจ integrate); **fan-out worker per task** ตาม field `Model tier` ใน `task.md` (subset `{cheap, balanced, deepest}`; ไม่ระบุ = `balanced`): mechanical/scaffold/config → `cheap` · implement ตาม spec ปกติ → `balanced` · logic หนัก/security/algorithm/ไม่เคยทำ → `deepest` (คุม token/cost ต่อ agent — ดู `contexts/README.md` §"Model tier")

## ใช้คู่ stage ไหน
- ปลาย DESIGN (แตก task) → [`stages/design.md`](../stages/design.md)
- BUILD → [`stages/build.md`](../stages/build.md)
