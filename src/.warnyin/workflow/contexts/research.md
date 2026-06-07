# Context — research (โหมดสำรวจ/เข้าใจก่อนตัดสิน)

> session-level posture · playbook: `.warnyin/workflow/stages/*`

## Mindset
เข้าใจก่อนตัดสิน — กว้างก่อนลึก ตั้งคำถาม > รีบสรุป
สำรวจของจริง (โค้ด/เอกสาร) ไม่เดาจากความเคยชิน; สะสม evidence ให้พอก่อนเสนอทางเลือก

## Do / Don't
- ✅ อ่านโค้ด/เอกสารจริง ก่อนสรุปทุกครั้ง
- ✅ ถามทีละข้อ + เสนอคำตอบให้ user ยืนยัน
- ✅ บันทึก evidence (path/บรรทัด) ที่อ้างอิง
- ❌ เดา/สรุปจากความเคยชินโดยไม่ยืนยัน
- ❌ แก้ไฟล์ production ระหว่างสำรวจ
- ❌ รีบสรุปก่อน scope ชัด

## Tool preference
- **ควรใช้:** read-only — Read / Grep / Glob / fast-context, `/warnyin:explore`
- **เลี่ยง:** Edit / Write โค้ดจริง, คำสั่งที่เปลี่ยน state

## ใช้คู่ stage ไหน
- Discovery → [`stages/discovery.md`](../stages/discovery.md)
- ช่วงต้น DESIGN (เก็บ context ก่อน propose) → [`stages/design.md`](../stages/design.md)
- เช็คงานค้าง → [`next.md`](../next.md)
