# Build report — build-wave-export-fix (fast-track)

> branch: `build/build-wave-export-fix` (จาก main) · 1 task

## ผล
| task | tier | status | ไฟล์ | test |
|---|---|---|---|---|
| `remove-export` | cheap | ✅ passed | `src/.warnyin/workflow/scripts/build-wave.mjs` · `CHANGELOG.md` | npm test 66/66 · lint ✓ |

## สิ่งที่ทำ
- ลบ `export` หน้า `function normalizeTasks` (บรรทัด 28) + `function buildOpts` (บรรทัด 35) — เหลือ `export const meta` จุดเดียว
- เพิ่ม comment กันเผลอ re-add (`★ ห้าม export function — Workflow runtime ... + ชี้ installer/rule.md`) — กัน occurrence ที่ 4
- CHANGELOG `### Fixed` entry

## Full gate (fast-track — test เขียว blocking)
- **T2** `grep ^export` → 1 บรรทัด (`export const meta`) ✓
- **T1** `npm test` → 66/66 pass; 6 เคส build-wave (A/B/C/D/E + isolate) ผ่าน — **extractFn ยังหา `function ${name}` เจอ ไม่ต้องแก้ test** (ยืนยัน design §3) ✓
- `lint-md` ✓ (90 ไฟล์)

## หมายเหตุ
- **T3 (Workflow launch proof)** ยังไม่รัน — ต้อง sync src→root ก่อน (root build-wave.mjs ยังเก่า) → ทำที่ VERIFY
- behavior ของ build-wave identical — ไม่แตะ logic/test

## → VERIFY
`/warnyin:verify build-wave-export-fix` — รัน T3 (executable proof) หลัง sync src→root
