# Spec — build-wave-model-arg

## 1. ชนิดของ task
`logic` / `script` (Node ESM, zero-dep)

## 2. Interface (args ของ build-wave — ตาม design §3C)
| | |
|---|---|
| `tasks` | `string[]` (เดิม) **หรือ** `Array<{name: string, model?: string}>` |
| normalize | string element → `{name, model: undefined}` |
| `agent()` opts | มี `model` เฉพาะเมื่อ task.model truthy → `{ ...opts, model }`; มิฉะนั้น opts ไม่มี key `model` |
| `model` semantics | **pass-through string** — ไม่ map/ไม่ hardcode ชื่อรุ่น |

## 4. Data-flow
orchestrator (command) → `args.tasks: {name, model}[]` → normalize → `parallel(tasks.map)` → `agent(prompt, opts[+model])`

## 7. Test-flow (unit — pattern `docs/techstack/installer/test.md`: สกัดฟังก์ชัน + inject globals)
- [ ] **เคส A (backward-compat):** `tasks: ['a','b']` → normalize เป็น `{name:'a',model:undefined}` ; `agent` ถูกเรียก **ไม่มี key `model`** ใน opts
- [ ] **เคส B (มี model):** `tasks: [{name:'a', model:'opus'}]` → `agent` opts มี `model: 'opus'`
- [ ] **เคส C (ผสม/ไม่มี model):** `tasks: [{name:'a'}]` → opts **ไม่มี key `model`** (ไม่ใช่ `undefined`)
- [ ] assert pass count บน CI (`check-test-count.mjs` — exit 0 ไม่พอ)
- [ ] backward: ไม่ส่ง `baseRef`/`model` → พฤติกรรมเดิมทุกอย่าง
