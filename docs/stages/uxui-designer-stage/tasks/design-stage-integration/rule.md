# Rule — design-stage-integration (T3)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก `docs/rule.md` — เฉพาะข้อที่เกี่ยวกับ task นี้)
- [ ] **stage-invoked capability convention** (§1) — UX wireframe เป็น capability ที่ stage เรียกเอง: detect+skip ชัด · gate conditional/N-A · canonical logic ที่เดียว stage ชี้ pointer · tool-agnostic (detect-in-playbook) — pattern อ้างอิง `api-doc.md` §2
- [ ] **canonical-copy convention** (§1) — copy wording จาก `design.md` §10A–§10E **คำต่อคำ** ลง playbook; ห้ามแต่งใหม่ (verify semantic-consistency diff ว่าง)
- [ ] **unify-in-place ไม่สร้างกลไกขนาน** (§1) — role lens (§3 ข้อ 6) + panel note (§3 ข้อ 7) ขยายในที่เดิม ไม่เพิ่ม list/กลไกใหม่
- [ ] **investigate-before-edit** (§1, enforce "ห้ามเดา") — แก้ playbook ที่มีอยู่ ต้องเข้าใจ anchor จริงก่อน: panel = §4 step 6 + §3 ข้อ 7 (ไม่ใช่ §4.6/§7), step ใหม่ = 4.5 (precedent step 1.5) — อ่าน `src/.warnyin/workflow/stages/design.md` ให้ครบก่อนแทรก
- [ ] **src/dogfood แยกชั้น** (§6) — แก้ `src/.warnyin/workflow/stages/design.md` + `src/.warnyin/workflow/README.md` เท่านั้น; **ห้ามแตะ root** `.warnyin/`/`.claude/` (gitignored, git ไม่เห็น)
- [ ] **zero-dependency** (§2) — ไม่เพิ่ม dep ใดๆ; verify ใช้ `node src/scripts/*` ที่มีอยู่
- [ ] **ภาษาไทย** (§2) — wording payload เป็นภาษาไทยตามสไตล์ playbook
- [ ] **verify เอกสาร = accuracy เทียบ source + ตรวจอิสระจากผู้เขียน** (§5) — anchor/canonical wording ตรวจ structural + agent อิสระ (self-check ของ build agent ไม่พอ); markdown-link → lint-md

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` ตอนนี้ — แค่ note ไว้ก่อน ถึง SHIP ค่อยพิจารณา
- [ ] rule ที่เสนอ: **stage-invoked capability — generator variant** — `api-doc.md` §2 evidence เดิมเป็น contract-producer (artifact ล้วน); UX wireframe เพิ่มกรณี capability ที่ fan-out **read-only generator** (warnyin-ux) + **approve gate** ก่อน gate item — เหตุผล: เป็น sub-pattern ใหม่ของ convention เดิม (generator ≠ pure doc-gen) ที่ topic นี้พิสูจน์; ถ้า SHIP รับ → เติม evidence `uxui-wireframe` เข้า bullet "stage-invoked capability convention" ใน `docs/rule.md` §1 (ไม่สร้าง rule ใหม่ — ขยาย evidence ของเดิม ตาม unify-in-place)
