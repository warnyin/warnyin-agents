# Task — model-routing-docs

> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ · ชี้ canonical `design.md` §3C (ไม่ลอก)

| | |
|---|---|
| **Task** | `model-routing-docs` |
| **Slice อ้างอิง** | `design.md` slice #4 |
| **Component** | `installer` (contexts + template + command) |
| **Model tier** | `balanced` (เขียน guidance + ผูก orchestrator — copy canonical) |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
เขียน **model-routing guidance** + ผูก orchestrator→build-wave ให้ครบ — DESIGN ระบุ tier ต่อ task ได้ + BUILD command map tier→รุ่น ส่ง `model` เข้า build-wave (ใช้ arg shape ที่ `build-wave-model-arg` สร้าง)

## 2. Dependency
- **ต้องทำหลัง:** `tasks/build-wave-model-arg` (★ chain แท้ — ต้องอ้าง **arg shape จริง** `tasks: {name, model?}[]` ที่ task นั้น lock; design §3C/§4)
- **ปลดล็อกให้:** —
- **ส่ง output:** routing guidance ครบ ผูกกับ build-wave จริง

## 3. Sub-tasks
- [ ] 1. `contexts/README.md` §"Model tier" — **ขยายตารางเดิม** (บรรทัด ~39): เพิ่มแถว/หมายเหตุ "per-task ใน BUILD ใช้ subset `{cheap, balanced, deepest}`" (ไม่แตะ `balanced+` ของ review) + mapping จาก design §3C
- [ ] 2. `contexts/build.md` (บรรทัด ~21 "worker → cheap") — **ขยายที่เดิม** เป็น per-task tier (unify, ไม่เพิ่มบล็อกใหม่)
- [ ] 3. `template/stages/[topic]/tasks/[task-name]/task.md` — เพิ่ม field **`Model tier`** ใน meta table (optional; ไม่ระบุ = balanced)
- [ ] 4. `.claude/commands/warnyin/build.md` — _ขึ้นกับ build-wave-model-arg:_ orchestrator อ่าน `Model tier` จาก task.md → **map tier→ชื่อรุ่นจริง (Claude adapter)** → ส่ง `tasks: {name, model}[]` เข้า build-wave; เพิ่ม pointer ใน `.claude/commands/warnyin/design.md` ว่าระบุ tier ตอนแตก task
- [ ] 5. ตรวจ Scenario เดิมของ `docs/features/context-profiles` ยัง pass (regression boundary — panel QA-B2)

## 4. ขอบเขตไฟล์ที่จะแตะ (★ disjoint)
- `src/.warnyin/workflow/contexts/README.md`, `src/.warnyin/workflow/contexts/build.md`
- `src/.warnyin/template/stages/[topic]/tasks/[task-name]/task.md`
- `.claude/commands/warnyin/build.md`, `.claude/commands/warnyin/design.md`
- ❌ **ห้ามแตะ** `build-wave.mjs` (เจ้าของ build-wave-model-arg), `stages/design.md`+`build.md` (task อื่น)

## 5. Acceptance criteria
- [ ] routing guidance อยู่ใน contexts/ (ขยายที่เดิม unify), subset `{cheap,balanced,deepest}` ไม่แตะ `balanced+`
- [ ] template task.md มี field `Model tier` (optional)
- [ ] command/build.md ส่ง `tasks: {name, model}[]` ตรง arg shape จริง + map tier→รุ่น (orchestrator เป็นคน map — ไม่ใช่ payload)
- [ ] wording copy จาก `design.md` §3C คำต่อคำ (`canonical-copy`)
- [ ] Scenario เดิม context-profiles ยัง pass (ไม่ regression)
- [ ] ผ่าน test ตาม `spec.md` · ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิง
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical: `../../design.md` §3C, §4 (pointer convention), §9 (spec delta)
- Dependency: `../build-wave-model-arg/` (arg shape)
