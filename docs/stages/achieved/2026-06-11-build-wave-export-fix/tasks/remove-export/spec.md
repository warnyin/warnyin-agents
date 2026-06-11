# Spec — remove-export

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`logic` / `bugfix` (workflow payload script — zero-dep ESM)

## 4. Data-flow
Workflow tool อ่าน `build-wave.mjs` → wrap body เป็น async function → ยอมรับเฉพาะ `export const meta` → ไม่มี `export function` ค้าง → parse + launch สำเร็จ

## 7. Test-flow
- [ ] **T1** `npm test` → ทุก test เขียว ไม่มี fail (regression: extractFn ใน `build-wave.test.mjs` ยังหา `function normalizeTasks`/`function buildOpts` เจอ → 6 เคส A/B/C/D/E + isolate ผ่าน)
- [ ] **T2** `grep -nE "^export " src/.warnyin/workflow/scripts/build-wave.mjs` → คืน **1 บรรทัด** (`export const meta`) เท่านั้น
- [ ] **T3 (executable proof — VERIFY)** sync src→root dogfood แล้ว `Workflow({ scriptPath: ".warnyin/workflow/scripts/build-wave.mjs", args: { slug: "x", tasks: [] } })` → launch สำเร็จ (empty tasks → early-return `{slug:"x", results:[], failed:[]}`) **ไม่เจอ** `SyntaxError: Unexpected keyword 'export'`
- [ ] **T4** behavior identical — `normalizeTasks`/`buildOpts` output เดิม (test เคส A-E ครอบ: string[]/​{name,model}/isolate spread)
