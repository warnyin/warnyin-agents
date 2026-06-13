# Business — UX/UI designer agent + wireframe ใน DESIGN stage

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **optional** — เก็บไว้เพราะ feature มี persona/metric ชัด

## 1. เป้าหมายเชิงธุรกิจ (what & why)
- ทำเพื่อให้ DESIGN stage **ปิดช่องว่าง UX/UI** — งานที่มีหน้าจอได้ "เห็นภาพ + ตกลงร่วมกันก่อนแตก task" แทนการ assume layout/flow แล้วไปเจอตอน BUILD/VERIFY
- ผูกกับเป้าหมายโปรเจกต์ (`docs/project.md`): workflow ที่ "สร้างทีม ผลิตผลงานคุณภาพ และเร็ว" — wireframe-before-build = ลด rework = เร็วขึ้น + คุณภาพดีขึ้น

## 2. Persona / ใครได้ประโยชน์
- **ผู้ใช้ปลายทาง** (ทีมที่ติดตั้ง workflow ลงโปรเจกต์มี FE): เห็นภาพหน้าจอก่อนอนุมัติ → สื่อสารตรงกัน ลดงานแก้
- **AI agent** (DESIGN): มี lens/agent + artifact ที่ชัดสำหรับงาน UI — ไม่ต้องเดา layout

## 3. Success metric (วัดผลได้)
- change ที่มี UI surface ผ่าน DESIGN แล้วมี `wireframe.md` ที่ user approve ก่อนแตก task (qualitative — มี/ไม่มี)
- ลดรอบแก้ layout/flow ที่เกิด "หลัง build" (เลื่อนการค้นพบ UX issue มาที่ design)
- backward compatible 100% — change ที่ไม่มี UI ไม่ถูกบังคับ ceremony เพิ่ม (detect = ข้าม)

## 4. ขอบเขตเชิงธุรกิจ / ข้อจำกัด
- **in:** ASCII low-fidelity wireframe + user flow + screen states (tool-agnostic)
- **out:** hi-fi design, design system, Figma/HTML rendering จริง (เป็น optional skill เสริม)
- **ข้อจำกัด:** tool-agnostic (ทุก harness ทำได้) + token-lean + zero-dep — ห้ามผูก vendor tool เป็น hard dependency
