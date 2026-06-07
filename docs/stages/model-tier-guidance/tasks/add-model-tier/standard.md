# Standard — add-model-tier

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern: context card (#5 context-profiles)

## 1. Standard กลางที่ยึด
- **tool-agnostic** (`docs/rule.md` §1) — generic tier ไม่ผูกชื่อรุ่น (harness map เอง); payload `.md` ใช้ได้ทุก harness
- **unify-in-place** (`docs/rule.md` §1) — เสริมใน "Tool preference" ที่มีอยู่ ไม่สร้างกลไก/ไฟล์ใหม่
- **opinionated / ไม่ catalog** (`docs/rule.md` §1) — 3 tier คงที่ + worker note บรรทัดเดียว
- **context ไม่ duplicate** (`docs/rule.md` §1 + `contexts/README.md`) — ชี้กลับ posture ไม่ copy checklist
- **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/.warnyin/workflow/contexts/` เท่านั้น; ห้ามแตะ root dogfood
- **ภาษาไทย** (`docs/rule.md` §2)

## 2. Pattern การเขียน
- **โครง context card คงที่ 4 section** (`contexts/README.md`) — Model tier เป็น **บรรทัดใน Tool preference** (ไม่เพิ่ม section ที่ 5)
- bullet สไตล์เดิม: `- **Model tier:** \`<tier>\` — <เหตุผลสั้น>`
- vocab: `` `deepest reasoning` `` / `` `balanced` `` / `` `balanced+` `` / `` `cheap` `` (backtick, generic)
- README legend: ตาราง markdown แบบ "ตาราง context↔stage" ที่มีอยู่ + note tool-agnostic

## 3. Shared component (อย่าเขียนซ้ำ)
- reuse โครง Tool preference เดิม (เพิ่มบรรทัด ไม่รื้อ); legend อิงตาราง context↔stage ที่มีใน README

## 4. เพิ่มเติมเฉพาะ task
- ถ้า "model-tier convention" ควรเป็นกฎกลาง → note `rule.md` §2 (รอ SHIP) — เช่น "lint/format/model-guidance ใน payload ต้อง generic ไม่ผูกชื่อรุ่น"
