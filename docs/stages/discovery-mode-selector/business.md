# Business — discovery-mode-selector

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. เป้าหมายเชิงธุรกิจ (what & why)
- **เพื่ออะไร:** ให้ผู้ใช้ควบคุม "ความเข้มของ Discovery" ได้เอง — งานเล็ก/ชัดเดินเร็ว, งานเสี่ยง/กำกวมขุดลึกหรือ challenge ด้วย multi-agent ก่อนเข้า DESIGN เพื่อลดความเสี่ยงออกแบบผิด
- **ผูกกับเป้าหมายโปรเจกต์:** ต่อยอด philosophy "sizing-aware ceremony" (`change-sizing`) — workflow ปรับ ceremony ตามงานจริง = ลด overhead งานเล็ก / เพิ่มความมั่นใจงานใหญ่; คง zero-config (ใช้ได้ทันทีหลังติดตั้ง)

## 2. Persona / ใครได้ประโยชน์
- **ผู้ใช้ปลายทาง** (ทีมที่ติดตั้ง workflow): เลือกความลึก Discovery ตามงาน — ไม่ต้องทน interview ยาวกับงานชัด, ได้ deep-challenge กับงานเสี่ยง
- **maintainer** (พัฒนา v-next): mode = dial เดียวคุมพฤติกรรม Discovery ไม่ต้อง fork playbook

## 3. Success metric (วัดผลได้)
- เรียก `/warnyin:discovery` แล้วได้พฤติกรรมต่างกันจริงครบ 4 mode (observable)
- ไม่ระบุ mode → ได้ mode ที่ระบบแนะนำ + เหตุผล + override ได้
- backward-compatible: flow เดิม + "ซักถามฉันหน่อย" ยังทำงาน
- โต้วาที spawn agent จริง + สังเคราะห์เป็นข้อสรุปเดียว + มี fallback

## 4. ขอบเขตเชิงธุรกิจ / ข้อจำกัด
- **in:** mode 4 ค่าใน Discovery (playbook + command adapter), auto-suggest, debate orchestration
- **out:** ไม่ทำ mode ให้ stage อื่น, ไม่แตะ tier/context-profile, ไม่ auto-execute ข้ามการยืนยัน
- **ข้อจำกัด:** zero-dep, cross-platform, no-duplicate (canonical ที่ playbook เดียว), debate ผ่าน Agent tool (ไม่ใช่ Workflow script — เลี่ยง top-level export constraint)
