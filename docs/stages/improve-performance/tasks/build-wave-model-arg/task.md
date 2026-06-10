# Task — build-wave-model-arg

> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ · ชี้ canonical `design.md` §3C (ไม่ลอก)

| | |
|---|---|
| **Task** | `build-wave-model-arg` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (`build-wave.mjs` + test) |
| **Model tier** | `deepest` (แก้ orchestration script + backward-compat + unit test = ตรรกะหนัก) |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
ให้ `build-wave.mjs` รับ + ส่ง **`model` per task แบบ pass-through** เข้า `agent()` พร้อม unit test — end-to-end: normalize args → prompt/agent call → test ครอบ backward-compat

## 2. Dependency
- **ต้องทำหลัง:** — (wave 1; อ่าน `design.md` §3C contract เป็น input)
- **ปลดล็อกให้:** `tasks/model-routing-docs` (ต้องอ้าง **arg shape จริง** ที่ task นี้ fix — chain แท้ code→doc)
- **ส่ง output:** args contract จริง (`tasks: string[] | {name, model?}[]`) ให้ model-routing-docs เขียน guidance/command ตาม

## 3. Sub-tasks
- [ ] 1. `build-wave.mjs` — normalize `tasks`: รับทั้ง `string[]` (เดิม) และ `Array<{name, model?}>` → ภายในเป็น `{name, model}` (string → `{name, model: undefined}`)
- [ ] 2. `agent()` call — _ขึ้นกับ 1:_ ถ้า task มี `model` → `agent(prompt, { ...opts, model })`; ไม่มี → opts **ไม่มี key `model`** (ไม่ใช่ `model: undefined`); `model` = pass-through string **ห้าม hardcode/map ชื่อรุ่น** (payload generic-safe)
- [ ] 3. unit test (`src/tests/`) — _ขึ้นกับ 2:_ 3 เคสตาม spec test-flow (string[] / มี model / ไม่มี model→ไม่มี key)
- [ ] 4. อัปเดต comment header args ของ build-wave.mjs ให้ตรง shape ใหม่

## 4. ขอบเขตไฟล์ที่จะแตะ (★ disjoint)
- `src/.warnyin/workflow/scripts/build-wave.mjs`
- test ใน `src/tests/` (ไฟล์ใหม่หรือไฟล์ test ของ build-wave ที่มีอยู่)
- ❌ **ห้ามแตะ** `command/`, `contexts/`, `template/`, stages playbook (เจ้าของ task อื่น — guidance/command เป็นของ model-routing-docs)

## 5. Acceptance criteria
- [ ] `tasks` รับ `string[]` เดิมได้ (backward compat) + `{name, model?}[]` ใหม่
- [ ] task มี model → `agent` opts มี key `model` (pass-through); ไม่มี → ไม่มี key `model`
- [ ] ไม่ hardcode ชื่อรุ่น/ไม่ map tier ในไฟล์ payload (`build-wave.mjs`)
- [ ] unit test เขียว (`node --test`) ครอบ 3 เคส + assert pass count
- [ ] ผ่าน test ตาม `spec.md` · ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิง
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical: `../../design.md` §3C (args contract), §8 (test-flow)
