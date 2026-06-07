# Standard — author-contexts

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน `.md` แก่นกลาง — อิงสไตล์ `roles/*.md` + `roles/README.md`

## 1. Standard กลางที่ยึด
- **tool-agnostic `.md`** (`docs/rule.md` §1) — เขียนกลางที่ทุก harness อ่านได้, ไม่ผูก tool เฉพาะ
- **กระทัดรัด opinionated** (`docs/rule.md` §1) — บาง ไม่ไหลเป็น catalog; 3 context พอ
- **single source of truth** (CLAUDE.md) — context **ไม่ duplicate** checklist ของ stage playbook/role card; ชี้กลับ playbook แทน
- **mirror layout** (`installer/rule.md`) — วางใต้ `src/.warnyin/workflow/contexts/` → installer copy `src/<rel>→target/<rel>` อัตโนมัติ ไม่ต้องแก้ mapping

## 2. Pattern การเขียนของ task นี้
- **โครง/naming:** ทุก card ขึ้นต้น `# Context — <name> (<one-liner>)` + blockquote ชี้ playbook (เลียนแบบ `roles/*.md` ที่ขึ้นต้น `# Role — ...`); ใช้ section heading 4 อันคงที่ตาม spec §3
- **ภาษา:** ไทย ตามสไตล์ repo (`docs/rule.md` §2)
- **โทน:** สั้น actionable — bullet ไม่เกิน ~6 ข้อต่อ section; ลิงก์เป็น relative path ภายใน `.warnyin/workflow/`
- **README:** เลียนโครง `roles/README.md` (มี "หลักการ" + ตาราง mapping + "โครงของ card ทุกใบ")

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- อ้าง `roles/README.md` เป็นต้นแบบโทน/โครงตาราง — **ไม่ copy เนื้อหา role** มา (คนละมิติ: role=task lens, context=session posture)
- ลิงก์ playbook ใช้ path จริง `.warnyin/workflow/stages/<stage>.md`

## 4. เพิ่มเติมเฉพาะ task
- ถ้าเห็นว่าโครง card ควรเป็นมาตรฐานกลาง (เทียบ "โครงของ role card ทุกใบ" ใน `roles/README.md`) → ใส่ section "โครงของ context card ทุกใบ" ใน `contexts/README.md` (ภายใน feature นี้ ไม่ต้อง note รอ SHIP — เป็นส่วนหนึ่งของ deliverable)
