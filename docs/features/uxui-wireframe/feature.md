# Feature — UX/UI wireframe ใน DESIGN

> ความรู้ถาวรระดับ feature · promote จาก topic `uxui-designer-stage` (achieved 2026-06-13)

## คืออะไร
**capability ใน DESIGN stage** ที่ทำให้ playbook **auto-detect** ว่า change มี UI surface ไหม — ถ้าใช่ เสนอวาด **low-fidelity ASCII wireframe** (user flow + screen + states) ให้ user **เห็นภาพ + ยืนยันก่อนแตก task**; ถ้าไม่ใช่ → ข้ามเงียบ (backward compatible)

เป็น **stage-invoked capability** (เรียกเองแบบ conditional ตอน DESIGN) ไม่ใช่ stage แยก/ไม่มี slash command — และเป็น capability ตัวแรกที่ใช้ **read-only generator agent** (ต่างจาก api-doc ที่เป็น doc-producer ล้วน)

## ทำงานยังไง
- **จุดแทรก:** `design.md` **§4 step 4.5** "UX wireframe" — แทรกระหว่าง step 4 (proposal) กับ step 5 (design.md how) → user เห็นภาพ **ก่อน** เขียน technical design
- **auto-detect (step 4.5 detect block):** สัญญาณ = techstack เป็น frontend/web/mobile/desktop · change แตะ page/route/screen/view/component · มี user flow/navigation/form ใหม่ — เจอ ≥1 ชัด = ใช่; backend/REST API/CLI/library/docs ล้วน = ไม่ใช่ → ข้าม; คลุมเครือ → ถาม user (ห้ามเดา)
- **read-only generator (`warnyin-ux`):** fan-out agent (tools `Read, Grep, Glob` — ไม่มี Write) คืน **ASCII wireframe + user flow + screen states เป็น text** → **main loop persist** `docs/stages/<slug>/wireframe.md` (single-writer); fallback = AI หลักสวม lens `roles/ux.md` วาดเอง (tool-agnostic)
- **approve gate:** user ยืนยัน/ปรับ `wireframe.md` (status `draft`→`approved`) **ก่อนแตก task**; `design.md §5` (UI layer) อ้าง wireframe ที่ approve
- **gate item conditional (`design.md §8`):** change มี UI surface → require `wireframe.md` ครบ + user ยืนยัน; ไม่มี UI surface → **N/A** (ไม่ block)
- **artifact:** ASCII low-fidelity ใน `wireframe.md` (4 section: User flow · Wireframe ต่อ screen · Screen states · Design-honor note) — commit ลง repo, เห็นใน terminal/PR, tool-agnostic

## ขอบเขต / การตัดสินใจเชิงสถาปัตยกรรม
- **ASCII in-repo ไม่ vendor tool** — tool-agnostic (ทุก harness วาดได้) + token-lean; Figma MCP / HTML mockup เป็น **optional skill เสริม** (reference ไม่ vendor) ใน `roles/ux.md`
- **read-only generator + single-writer** — agent คืน text, main loop persist artifact ที่ user ต้องยืนยัน (ปลอด write, สอด "serialize narrative/artifact")
- **gate ทุกข้อ conditional (N/A เมื่อไม่มี UI surface)** — backward compatible
- **generator ≠ reviewer** — UX เป็น generator (ผลิต wireframe) แยกจาก review panel 5 role (reviewer read-only); `roles/README.md` ระบุรูปแบบ `generator`
- **canonical-copy** — wording ของ step/detect/gate canonical ใน design.md ของ topic → copy ลง playbook
- เป็น **generator variant** ของ "stage-invoked capability convention" (`docs/rule.md` §1) — ขยาย evidence ของ convention เดิม

## ไฟล์ที่เกี่ยวข้อง
- role/agent: `src/.warnyin/workflow/roles/ux.md` (lens + 2 guard) · `src/.claude/agents/warnyin-ux.md` (generator adapter)
- hook: `src/.warnyin/workflow/stages/design.md` (§3 ข้อ 6 role lens · §3 ข้อ 7/§4 step 6 panel note · §4 step 4.5 + detect · §8 gate item)
- template: `src/.warnyin/template/stages/[topic]/wireframe.md`
- registry: `src/.warnyin/workflow/roles/README.md` (แถว UX = generator) · `src/.warnyin/workflow/README.md` (file listing)
- artifact ระหว่างงาน: `docs/stages/<slug>/wireframe.md`
