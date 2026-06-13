# Standard — UX role + agent (T1)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** payload-md convention ของ repo (role card + agent adapter) — ไม่มี techstack/component runtime

## 1. Standard กลางที่ยึด (จาก techstack)
> repo นี้ = payload markdown (installer) ไม่มี code component — ยึด convention ที่มีอยู่ของ workflow

- **โครง role card** ตาม `src/.warnyin/workflow/roles/README.md` §"โครงของ role card ทุกใบ": 4 section ตามลำดับ **Mission → Lens → Checklist → Output** + section "Skill เสริม (optional)" ท้ายไฟล์ (reference ไม่ vendor)
- **agent adapter convention** ตาม `src/.warnyin/workflow/roles/README.md`: Claude adapter อยู่ที่ `.claude/agents/warnyin-<role>.md`; frontmatter `name` + `description` + `tools`; body = "อ่าน role card ก่อน แล้วทำงานตาม"
- **4 ข้อ convention** ใน `docs/rule.md` (stage-invoked capability / canonical-copy / unify-in-place / context⊥role) — ดู rule.md ของ task นี้

## 2. Pattern การเขียนโค้ดของ task นี้
- **reuse-pattern = `src/.claude/agents/warnyin-sa.md`** (★ ก๊อปโครงมาเป็นต้นแบบ): frontmatter `tools: Read, Grep, Glob` (read-only) + body ข้อ 1 = "อ่าน `.warnyin/workflow/roles/<role>.md` ให้ครบก่อน"
- **⚠️ note สำคัญ — body ต่างจาก `warnyin-sa.md`:** `warnyin-sa` body เป็น **reviewer** (อ่าน artifact → ให้ความเห็น **blocker/suggestion**); `warnyin-ux` body เป็น **generator** (อ่าน data → **ผลิต ASCII wireframe + user flow + screen states เป็น text** ให้ main loop persist) — reuse แค่ frontmatter pattern (read-only tools) + "อ่าน role card ก่อน" ไม่ใช่ reuse body
- **frontmatter `description`:** สื่อ "generator / วาด wireframe" ชัด — **ห้ามใช้คำว่า "reviewer"** (กัน DESIGN panel fan-out เป็น reviewer ตัวที่ 6 ตาม design §6/§10D)
- **single-writer invariant:** agent **ห้ามมี `Write`/`Edit`/`NotebookEdit`** — คืน text ให้ main loop เขียนไฟล์ (เหมือน reviewer panel เดิม least-privilege)
- **2 guard อยู่ใน role card** (ไม่ใช่แค่ agent prompt) — เพื่อ fallback path (AI หลักสวม lens) ได้ guard เดียวกัน (design §10F / panel Security S1-S3); agent prompt ย้ำซ้ำได้
- **naming:** ไฟล์ `ux.md` / `warnyin-ux.md`; role key = `ux` (สอดคล้องชุดเดิม `sa`/`tech-lead`/`qa`/...)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- โครง role card กลาง: `src/.warnyin/workflow/roles/README.md` (อย่านิยามโครงใหม่ — ยึดตามนี้)
- ต้นแบบ agent adapter: `src/.claude/agents/warnyin-sa.md` (และ reviewer ตัวอื่น) — copy frontmatter pattern
- ต้นฉบับ guard wording: `docs/stages/uxui-designer-stage/design.md` §10F (canonical — copy ไม่แต่งใหม่)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
> pattern ใหม่ที่ task นี้แนะนำ — ถ้าควรเป็นมาตรฐานกลาง ให้ note ใน `rule.md` (รอ SHIP อัปเดต standard กลาง)

- **role-format ใหม่ `generator`** — ต่างจาก `lens` / `reviewer` เดิม: agent ที่ "ผลิต artifact" (wireframe) แทนการ "ให้ความเห็น read-only". เพิ่มเป็นค่าใหม่ในคอลัมน์ "รูปแบบ" ของตาราง `roles/README.md` + note อธิบายใต้ตาราง (เสนอ promote ขึ้น standard กลางตอน SHIP — ดู rule.md §2)
