# Standard — adapter-changelog-sync

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern ที่ task นี้ต้องยึด

## 1. Standard กลางที่ยึด (จาก rule.md)
- **skill-adapter convention** (§1) — adapter (`.claude/commands/`) = **ชี้ playbook กลาง ไม่ duplicate** logic; ปรับแค่พอสะท้อนพฤติกรรม รายละเอียดอยู่ playbook
- **canonical edit = `src/`** (§6) — แก้ `src/.claude/commands/warnyin/design.md` ไม่ใช่ root
- **CHANGELOG = Keep a Changelog** (§2) — ทุก user-facing change มี entry ให้ผู้ใช้ npm migrate เองได้
- **payload-guidance / wording generic** (§1) — ไม่ผูกชื่อรุ่น

## 2. Pattern การเขียนของ task นี้
- **adapter:** แก้น้อยที่สุด — ปรับประโยคเดิม (ข้อ 5 ของ adapter) ให้สะท้อน default; **ไม่เพิ่มย่อหน้ารายละเอียด** (คงความเป็น adapter บาง); อ้าง playbook ระดับ "§4" / ชื่อขั้น ไม่ผูกเลข step
- **CHANGELOG:** entry ใต้หัวข้อ Unreleased (หรือเวอร์ชันถัดไปตามที่ repo ใช้) หมวด `Changed`; ภาษาไทยตามสไตล์ entry เดิมใน `CHANGELOG.md`
- ดูรูปแบบ entry เดิมใน `CHANGELOG.md` ก่อนเขียน (ตามรุ่น/หัวข้อที่ repo ใช้จริง)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- รูปแบบ adapter เดิม: `src/.claude/commands/warnyin/build.md` (มี model-tier mapping note เป็นตัวอย่าง adapter ที่ map generic→harness)
- รูปแบบ entry: `CHANGELOG.md` (entry ที่มีอยู่)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- ไม่มี
