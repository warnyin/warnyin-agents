# Task — wireframe-template

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `wireframe-template` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (payload markdown — template ใน `src/`) |
| **Model tier** | `cheap` _(mechanical scaffold — เขียนไฟล์ template placeholder ไม่ต้องตัดสินใจซับซ้อน)_ |
| **สถานะ** | `เสร็จแล้ว` |

## 1. เป้าหมายของ task (vertical slice)
> task นี้ส่งมอบคุณค่า end-to-end อะไร

สร้าง **template artifact `wireframe.md`** ที่ user/agent กรอกได้จริงในขั้น DESIGN — โครง low-fidelity wireframe (user flow → ASCII screen → states → design-honor note) พร้อมตัวอย่าง ASCII box ที่ render ได้ + placeholder + comment สอนวิธีกรอก. ไฟล์ตัวอย่างในตัวมันเอง = self-test ว่าโครงกรอกได้จริง.

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: _(ไม่มี — wave 1, ขนานกับ `tasks/ux-role-and-agent`)_
- ปลดล็อกให้: `tasks/design-stage-integration` (T3 — playbook step 4.5 เขียน wireframe ลงไฟล์โครงนี้ + pointer มาที่ชื่อ section)
- ส่ง output อะไรต่อให้ task ถัดไป: ไฟล์ `wireframe.md` + **ชื่อ 4 section ตายตัวตาม contract** (§1 User flow · §2 Wireframe ต่อ screen · §3 Screen states · §4 Design-honor note) ที่ T3 pointer มาอ้าง

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
> sub-task ต้องเชื่อมต่อกัน — ระบุลำดับ/สิ่งที่ส่งต่อกัน

- [x] 1. เขียน metadata header + pointer ("> Output ของ DESIGN stage · playbook: ...") แบบ template อื่น — _ผลลัพธ์:_ header + ตาราง slug/วันที่/**status: draft|approved**
- [x] 2. เขียน §1 User flow + §2 Wireframe ต่อ screen — _ขึ้นกับ 1:_ มี ASCII arrow flow ตัวอย่าง + ASCII box ที่ render ได้ + รองรับหลาย screen block (ทำซ้ำได้)
- [x] 3. เขียน §3 Screen states + §4 Design-honor note + comment สอนกรอก — ปิดท้ายด้วยข้อผูกมัดที่ design.md/task ต้องทำตาม

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- ไฟล์/โมดูล: `src/.warnyin/template/stages/[topic]/wireframe.md` (สร้างใหม่ไฟล์เดียว — scaffold placeholder, lint-md EXCLUDE `template/`)
- **ห้ามแตะ:** playbook (`design.md`), role/agent (เป็นของ T1/T3), `docs/`

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [x] `wireframe.md` มี **4 section ชื่อตายตัวตาม contract** (§1 User flow · §2 Wireframe ต่อ screen · §3 Screen states · §4 Design-honor note) — ห้ามเปลี่ยนชื่อ (T3 pointer มาที่ชื่อนี้)
- [x] §2 มี **ตัวอย่าง ASCII box จริงที่ render ใน markdown code-block ได้** + **รองรับหลาย screen block** (ทำซ้ำ block ได้)
- [x] มี metadata header (slug/วันที่/**status: draft|approved**) + pointer header แบบ template อื่น
- [x] ASCII low-fidelity + มี placeholder ให้แทนที่ + comment สอนวิธีกรอก + privacy note (generic label, ไม่ใส่ secret/PII จริง)
- [x] ผ่าน test ตาม `spec.md` (test-flow)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
