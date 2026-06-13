# Standard — design-stage-integration (T3)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน payload ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` (payload markdown) — เพิ่มเติมเฉพาะ task

## 1. Standard กลางที่ยึด (จาก techstack / rule)
- **stage-invoked capability convention** (`docs/rule.md` §1) — capability ที่ stage เรียกเองแบบ conditional ต้อง: (1) detect section ระบุ "ไม่เข้าเงื่อนไข → ข้าม" ชัด, (2) gate item conditional/N-A (backward compatible), (3) logic canonical ที่เดียว stage ชี้ pointer (ไม่ duplicate), (4) tool-agnostic (detect-in-playbook ไม่ใช่ description-trigger)
- **canonical-copy convention** (`docs/rule.md` §1) — wording ของ step/detect/panel/role-lens/gate นิยาม canonical ที่ `design.md` §10 แล้ว **copy คำต่อคำ** ลง playbook — **ห้ามแต่งใหม่ตอน build**
- **unify-in-place ไม่สร้างกลไกขนาน** (`docs/rule.md` §1) — role lens (§3 ข้อ 6) + panel note (§3 ข้อ 7) = **ขยายประโยค/principle เดิมในที่เดิม** ไม่เพิ่ม list/กลไกใหม่ขนาน
- **src/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ **`src/` เท่านั้น**; root `.warnyin/`/`.claude/` gitignored ห้ามแตะ
- **ภาษาไทย** (`docs/rule.md` §2) — ข้อความ payload เป็นภาษาไทยตามสไตล์ playbook เดิม

## 2. Pattern การเขียนโค้ดของ task นี้
- **★ reference pattern = `src/.warnyin/workflow/api-doc.md` §2** — adaptive-api-doc คือ precedent ของ stage-invoked capability ที่ detect+skip (evidence ใน `docs/rule.md` §1 "stage-invoked capability convention"). UX wireframe step **ทำตาม pattern เดียวกัน**: detect section รูปแบบ "ดูสัญญาณ (เจออย่างน้อยหนึ่งที่ชัด = ใช่)" + "สัญญาณคลุมเครือ → ไม่ใช่ → ข้าม" + "ไม่แน่ใจ → ถาม user ทีละข้อ + เสนอคำตอบแนะนำ" — §10A เขียนตาม shape นี้แล้ว ให้ copy ตรงๆ
- **anchor precision (★ สำคัญสุด):** ใส่ wording ที่ anchor ground-truth ของ `src/.warnyin/workflow/stages/design.md`:
  - step ใหม่ = **§4 step 4.5** (precedent step 1.5 "Establish tier")
  - detect block = ใต้ step 4.5
  - role lens = **§3 ข้อ 6** (ขยายประโยค)
  - panel note = **§4 step 6 + §3 ข้อ 7** — **ไม่ใช่ §4.6/§7** (§7 = 3-tier ceremony; "4.6" ที่ §3 ข้อ 7 อ้าง = legacy mismatch ของ playbook เอง อย่า copy ตาม)
  - gate item = **§8** ติด API-contract gate item
- **conditional/N-A:** gate item ต้องมีประโยค "ไม่มี UI surface → ข้อนี้ N/A" (ตาม §10E) — backward compatible
- **pointer ไม่ duplicate:** playbook ชี้ `roles/ux.md` / `wireframe.md` ด้วย path เดียว ไม่ copy logic ของ role/template มา

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **ของ T1:** `src/.warnyin/workflow/roles/ux.md` (role lens — pointer ใน step 4.5/role lens), `src/.claude/agents/warnyin-ux.md` (agent — README enumerate)
- **ของ T2:** `src/.warnyin/template/stages/[topic]/wireframe.md` (artifact — gate item อ้างชื่อ section)
- **canonical wording:** `docs/stages/uxui-designer-stage/design.md` §10A–§10E (copy source — อย่าแต่งใหม่)
- **lint gate:** `src/scripts/lint-md.mjs` (markdown-link) — ใช้ verify ไม่ต้องเขียนใหม่

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- ไม่มี pattern ใหม่ — T3 reuse stage-invoked capability convention (api-doc.md §2) + canonical-copy ที่มีอยู่; ถ้าระหว่าง build พบว่าต้อง generalize → note ใน `rule.md` §2 (รอ SHIP) ไม่แก้ rule กลางตอนนี้
