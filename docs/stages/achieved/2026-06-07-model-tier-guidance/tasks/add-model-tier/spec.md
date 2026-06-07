# Spec — add-model-tier

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`docs`/`payload` (`.md` ล้วน — context profile) — ไม่มี code

## 2. สิ่งที่ต้องทำ (exact — ดู design.md §3)
1. `src/.warnyin/workflow/contexts/research.md` → Tool preference: +`- **Model tier:** \`deepest reasoning\` — สำรวจ/architecture/ตัดสินใจ trade-off`
2. `src/.warnyin/workflow/contexts/build.md` → Tool preference: +`- **Model tier:** \`balanced\` (orchestrator); fan-out worker เชิงกลไกตาม spec → \`cheap\` ได้`
3. `src/.warnyin/workflow/contexts/review.md` → Tool preference: +`- **Model tier:** \`balanced+\` — skeptical จับ bug/regression = ไม่ลด tier`
4. `src/.warnyin/workflow/contexts/README.md`:
   - §"โครงของ context card" item 3 → mention `+ **Model tier** (generic: deepest/balanced/cheap)`
   - เพิ่ม section legend `### Model tier (generic)` + ตาราง context↔tier + note ไม่ผูกชื่อรุ่น (เทียบ `~/.claude/rules/performance.md`)

## 3. Persona
ผู้ใช้/harness ปลายทาง — guidance ว่า posture/stage ไหนคุ้มใช้ model tier ไหน (คุม token/cost) แบบ portable

## 4. Test-flow (VERIFY)
- [ ] 3 context มี "Model tier" ใน Tool preference (generic vocab)
- [ ] README มี legend + ตาราง context↔tier + item 3 อัปเดต
- [ ] **tool-agnostic:** `grep -riE 'opus|sonnet|haiku|claude-' src/.warnyin/workflow/contexts/` = 0 (ไม่ผูกชื่อรุ่น)
- [ ] ไม่ duplicate: ไม่ copy checklist stage/role
- [ ] dead-link 0 (`lint:md` — README ตาราง/ลิงก์); `npm test` + `verify:pack` เขียว
- [ ] install proof: `setup:sandbox` → target contexts มี Model tier line
