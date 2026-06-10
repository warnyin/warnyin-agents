# Task — build-wave-model-arg

> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ · ชี้ canonical `design.md` §3C (ไม่ลอก)

| | |
|---|---|
| **Task** | `build-wave-model-arg` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (`build-wave.mjs` + test) |
| **Model tier** | `deepest` (แก้ orchestration script + backward-compat + unit test = ตรรกะหนัก) |
| **สถานะ** | `build เสร็จ — เขียว (58/58 test, verify:pack, lint:md, runtime e2e proof)` |

## 1. เป้าหมายของ task (vertical slice)
ให้ `build-wave.mjs` รับ + ส่ง **`model` per task แบบ pass-through** เข้า `agent()` พร้อม unit test — end-to-end: normalize args → prompt/agent call → test ครอบ backward-compat

## 2. Dependency
- **ต้องทำหลัง:** — (wave 1; อ่าน `design.md` §3C contract เป็น input)
- **ปลดล็อกให้:** `tasks/model-routing-docs` (ต้องอ้าง **arg shape จริง** ที่ task นี้ fix — chain แท้ code→doc)
- **ส่ง output:** args contract จริง (`tasks: string[] | {name, model?}[]`) ให้ model-routing-docs เขียน guidance/command ตาม

## 3. Sub-tasks
- [x] 1. `build-wave.mjs` — normalize `tasks`: รับทั้ง `string[]` (เดิม) และ `Array<{name, model?}>` → ภายในเป็น `{name, model}` (string → `{name, model: undefined}`) — สกัด pure helper `normalizeTasks()`
- [x] 2. `agent()` call — `buildOpts(task, isolate)` conditional spread: `...(task.model && {model})` → key `model` หายเมื่อไม่มีค่า; pass-through string ไม่ map/ไม่ hardcode
- [x] 3. unit test (`src/tests/build-wave.test.mjs`) — runtime-extract (KB#16) สกัด `normalizeTasks`/`buildOpts` ด้วย `new Function` inject `RESULT_SCHEMA` ปลอม; 6 เคส (A string[] / B มี model / C ไม่มี model→ไม่มี key / D !isolate / E empty + backward) ทุกเคส `test()` ตรง ไม่ skip
- [x] 4. อัปเดต comment header args ของ build-wave.mjs ให้ตรง shape ใหม่ (`string[] | {name, model?}[]`)

## 4. ขอบเขตไฟล์ที่จะแตะ (★ disjoint)
- `src/.warnyin/workflow/scripts/build-wave.mjs`
- test ใน `src/tests/` (ไฟล์ใหม่หรือไฟล์ test ของ build-wave ที่มีอยู่)
- ❌ **ห้ามแตะ** `command/`, `contexts/`, `template/`, stages playbook (เจ้าของ task อื่น — guidance/command เป็นของ model-routing-docs)

## 5. Acceptance criteria
- [x] `tasks` รับ `string[]` เดิมได้ (backward compat) + `{name, model?}[]` ใหม่ — runtime e2e proof: mixed input ทำงานครบ
- [x] task มี model → `agent` opts มี key `model` (pass-through); ไม่มี → ไม่มี key `model` — proof: `has model key: false/true` ตรงเคส
- [x] ไม่ hardcode ชื่อรุ่น/ไม่ map tier ในไฟล์ payload (`build-wave.mjs`) — `model` ส่ง string ตรงจาก task.model
- [x] unit test เขียว (`node --test`) ครอบ 3 เคส + assert pass count — 58/58 pass, pass-count gate OK (>=9, pass==tests, fail=0)
- [x] ผ่าน test ตาม `spec.md` · ทำตาม `rule.md` + `standard.md` — verify:pack + lint:md เขียวด้วย

## 6. อ้างอิง
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical: `../../design.md` §3C (args contract), §8 (test-flow)
