# Business — UX/UI wireframe ใน DESIGN

> what & why เชิงธุรกิจของ feature — SHIP ยกมาจาก `business.md`/`proposal.md` ของ topic `uxui-designer-stage`

## Goal
ปิดช่องว่าง UX/UI ของ DESIGN stage — งานที่มีหน้าจอได้ **เห็นภาพ + ตกลงร่วมกันก่อนแตก task** แทนการ assume layout/flow แล้วไปเจอตอน BUILD/VERIFY (ค้นพบ UX issue ช้า = แก้แพง)

## Persona / ใครได้ประโยชน์
- **ผู้ใช้ปลายทาง** (ทีมที่ติดตั้ง workflow ลงโปรเจกต์มี FE): เห็นภาพหน้าจอก่อนอนุมัติ → สื่อสารตรงกัน ลดงานแก้
- **AI agent (DESIGN):** มี lens/agent + artifact ที่ชัดสำหรับงาน UI — ไม่เดา layout

## คุณค่า / success metric
- change ที่มี UI surface ผ่าน DESIGN แล้วมี `wireframe.md` ที่ user approve ก่อนแตก task
- เลื่อนการค้นพบ UX issue (layout/flow) มาที่ design แทนหลัง build → ลด rework
- **backward compatible 100%** — change ที่ไม่มี UI ไม่ถูกบังคับ ceremony เพิ่ม (detect = ข้าม, gate = N/A)

## Scope ที่จงใจไม่ทำ
- hi-fi design / design system / component library
- Figma/HTML rendering จริง (เป็น optional skill เสริม — reference ไม่ vendor)
- ผูก vendor tool เป็น hard dependency (ขัด tool-agnostic + zero-dep)
