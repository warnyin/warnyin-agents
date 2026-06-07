# Standard — add-defensive-rules

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การแก้ playbook/role card เดิม — อิงสไตล์ §3 operating principle + checklist ที่มีอยู่

## 1. Standard กลางที่ยึด
- **single source of truth** (CLAUDE.md) — เขียน wording canonical ที่ design §2 แล้ว reference; ไม่กระจายความหมายต่าง
- **กระทัดรัด opinionated** (`docs/rule.md` §1) — เพิ่มน้อยบรรทัด ไม่รื้อโครง §3
- **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/.warnyin/workflow/` เท่านั้น

## 2. Pattern การเขียนของ task นี้
- **operating principle (playbook §3):** ต่อท้ายรายการเลขที่มีอยู่ (build.md §3 = 10 ข้อ → เพิ่มเป็น 11-12; verify.md §3 = 9 → 10-11) ใช้รูปแบบ bold-label เดียวกับข้ออื่น เช่น "**investigate-before-edit** — ..."
- **role checklist:** ต่อในบล็อก "Checklist" เดิม รูปแบบ `- [ ] ...` เหมือนข้ออื่น (เวอร์ชันสั้น)
- **ภาษาไทย** ตามสไตล์ repo; โทนสั้น actionable
- **idempotent ทางความหมาย:** ถ้ามี principle/checklist นี้อยู่แล้ว ไม่เพิ่มซ้ำ

## 3. Shared component / utility (อย่าเขียนซ้ำ)
- wording มาจาก `design.md` §2 canonical — ห้ามคิด wording ใหม่ต่อไฟล์ (กัน drift)
- ผูกกับ "ห้ามเดา" (`docs/rule.md` §1 / build.md หลักการเดิม) — อ้างว่าเป็น enforce ของมัน

## 4. เพิ่มเติมเฉพาะ task
- R2 ใน verify.md ให้โยงกับ §3 ข้อ 5 เดิม ("ไม่ผ่าน → แก้จนผ่าน") — ระบุว่า "แก้จนผ่าน" ต้องเป็นการแก้ root cause ไม่ใช่ลด bar
