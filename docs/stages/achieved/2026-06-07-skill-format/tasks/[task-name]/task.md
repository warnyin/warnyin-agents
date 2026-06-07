# Task — <ชื่อ task>

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `<kebab-case>` |
| **Slice อ้างอิง** | `design.md` slice #__ |
| **Component** | `admin-console` / `api-service` / ... |
| **สถานะ** | `รอ build` / `กำลังทำ` / `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
> task นี้ส่งมอบคุณค่า end-to-end อะไร

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: `tasks/<...>` (เพราะ ...)
- ปลดล็อกให้: `tasks/<...>`
- ส่ง output อะไรต่อให้ task ถัดไป:

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
> sub-task ต้องเชื่อมต่อกัน — ระบุลำดับ/สิ่งที่ส่งต่อกัน

- [ ] 1. <sub-task> — _ผลลัพธ์:_
- [ ] 2. <sub-task> — _ขึ้นกับ 1:_
- [ ] 3. <sub-task>

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- ไฟล์/โมดูล:

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ]
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
