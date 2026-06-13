# Standard — wireframe-template

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** template artifact อื่นใน `src/.warnyin/template/stages/[topic]/` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก template ที่มีอยู่)
> task นี้สร้าง template artifact → ยึดสไตล์ template พี่น้องในโฟลเดอร์เดียวกัน
- `src/.warnyin/template/stages/[topic]/proposal.md` — รูปแบบ **metadata table** (`| | |` + แถว field) + pointer header
- `src/.warnyin/template/stages/[topic]/design.md` — สไตล์ **section + `>` blockquote hint + placeholder `<...>` + ตัวอย่างใน code-block** (เช่น DAG); `wireframe.md` ต้องสไตล์เดียวกัน

## 2. Pattern การเขียนโค้ดของ task นี้
- **โครงสร้าง/naming:** หัวข้อ section เป็น `## <n>. <ชื่อ>` ชื่อตายตัวตาม contract (§1-§4); ขึ้นไฟล์ด้วย `# Wireframe — <...>` + 2 บรรทัด pointer `>` แบบ template อื่น
- **placeholder pattern:** ของที่ user แทนที่ใช้ `<...>` (prose) หรือ `[LABEL]` (ใน ASCII box); ของที่สอนวิธีกรอกใช้ HTML comment `<!-- ... -->`
- **ASCII box:** ใช้ box-drawing (`┌ ─ ┐ │ └ ┘ ├ ┤`) ใน fenced code-block (` ``` `); low-fidelity — กล่อง/label generic, จัด column ให้กล่องไม่เพี้ยน
- **error handling:** ไม่มี (เอกสาร static) — แต่ comment ต้องสอนชัดว่า "ลบ comment คำสั่งกรอกออกหลังกรอกเสร็จ"

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- pointer header + metadata-table จาก `proposal.md` (copy รูปแบบ ไม่คิดใหม่)
- ตัวอย่าง code-block-in-template จาก `design.md` (DAG block) เป็น reference ว่า template ใส่ตัวอย่าง render-able ได้

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
> pattern ใหม่ที่ task นี้แนะนำ — ถ้าควรเป็นมาตรฐานกลาง ให้ note ใน `rule.md` (รอ SHIP อัปเดต standard กลาง)
- **repeatable block pattern** — §2 ใช้ `### Screen: <...>` เป็น block ที่ทำซ้ำได้ + comment "ทำซ้ำ block นี้ต่อหนึ่งหน้าจอ" (template artifact ตัวแรกในชุดที่มี repeatable sub-block — อาจเป็น pattern กลางถ้ามี template อื่นต้องการ list-of-blocks)
