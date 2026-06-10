# Spec — model-routing-docs

## 1. ชนิดของ task
`docs` (context/template) + `config` (command adapter)

## 2. Contract ที่ต้องตรง (จาก build-wave-model-arg)
- build-wave รับ `tasks: string[] | {name, model?}[]` → command ต้องส่ง `{name, model}[]`
- `model` = ชื่อรุ่นจริง (orchestrator map จาก tier generic); build-wave pass-through

## 4. Data-flow
`task.md` `Model tier` (generic) → command อ่าน → map tier→รุ่น (Claude adapter) → `build-wave args.tasks: {name, model}[]` → `agent({model})`

## 6. Persona
DESIGN (ระบุ tier ต่อ task) + BUILD orchestrator (map + ส่ง) — ลดเวลา/ค่าใช้จ่ายต่อ agent

## 7. Test-flow
- [ ] `validate-topic.mjs improve-performance` ไม่มี ✖
- [ ] lint-md ผ่าน
- [ ] **regression:** Scenario เดิมของ `docs/features/context-profiles/spec.md` ยัง pass (โครง 4 section + `balanced+` ของ review ไม่ถูกแตะ)
- [ ] canonical-copy: wording routing ใน contexts/task.md/command ตรงกับ `design.md` §3C
- [ ] command ส่ง arg shape ตรงกับที่ build-wave.mjs รับจริง (cross-check `build-wave-model-arg`)
- [ ] payload generic: contexts/template/build-wave **ไม่มีชื่อรุ่น**; ชื่อรุ่นจริงอยู่ได้เฉพาะ `.claude/commands/` (adapter)
