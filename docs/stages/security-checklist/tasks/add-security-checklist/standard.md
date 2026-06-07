# Standard — add-security-checklist

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การแก้ role card / playbook / command เดิม — อิงสไตล์ section + checklist + step ที่มีอยู่

## 1. Standard กลางที่ยึด
- **single source of truth** (CLAUDE.md) — wording canonical ที่ design §2 แล้ว reference; ไม่กระจายความหมายต่าง
- **tool-agnostic** (`docs/rule.md` §1) — principle portable เป็นแก่น; Claude settings = *adapter note* เท่านั้น (ไม่ใช่ rule หลัก)
- **กระทัดรัด opinionated** (`docs/rule.md` §1) — เพิ่ม section/บรรทัดเท่าที่จำเป็น ไม่บวม role card
- **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/.warnyin/` + `src/.claude/commands/` เท่านั้น; ห้ามแตะ root dogfood

## 2. Pattern การเขียนของ task นี้
- **role card section (`security.md`):** เพิ่ม `## Runtime / operational security` ต่อจาก `## Checklist` ก่อน `## Output`; รูปแบบ bullet `- **P1 · ...:** ...` ตามสไตล์ Lens เดิม; Claude note เป็น sub-bullet ระบุชัดว่า "ตัวอย่าง/adapter"
- **role checklist item (`security.md`):** ต่อในบล็อก `## Checklist` เดิม รูปแบบ `- [ ] ...` เหมือนข้ออื่น (1 บรรทัด S1)
- **playbook reference (`verify.md` §2):** เพิ่มเป็น sub-point ในรายการ "ก่อนเทส — อ่านให้เข้าใจก่อนเสมอ" รูปแบบเดียวกับข้ออื่น สั้น actionable ชี้ `roles/security.md`
- **command warning (`install-skill.md` step 4):** ขยาย wording warning เดิม (ไม่เพิ่ม step ใหม่) — คงโครง AskUserQuestion เดิม
- **ภาษาไทย** ตามสไตล์ repo; โทนสั้น actionable
- **idempotent ทางความหมาย:** ถ้ามี section/item/warning นี้อยู่แล้ว ไม่เพิ่มซ้ำ

## 3. Shared component / utility (อย่าเขียนซ้ำ)
- wording มาจาก `design.md` §2 canonical — ห้ามคิด wording ใหม่ต่อไฟล์ (กัน drift)
- runtime section ผูกเป็น "มิติใหม่คู่ app-security เดิม" — ไม่ทับ/ไม่ซ้ำ checklist app-security เดิม (research RQ1)
- S1 เสริม Lens "supply chain" เดิม (= "dependency ใหม่ = ความเสี่ยงใหม่") ให้ครอบ skill/MCP/payload — ไม่สร้าง Lens ใหม่ซ้ำ

## 4. เพิ่มเติมเฉพาะ task
- Claude adapter note ต้องระบุชัดว่าเป็น **ตัวอย่างเฉพาะ Claude Code** (harness อื่นปรับเทียบ) — กันเข้าใจผิดว่าเป็น rule กลาง (D3)
- `install-skill.md` step 4 เดิมมี "third-party (ไม่ใช่ official, ตรวจเนื้อหาได้ที่ skills.sh)" — เสริม **prompt-injection** เข้าไป ไม่ลบของเดิม
