# Design (How) — build-wave-export-fix

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md` · **fast-track**

## 1. ภาพรวมสถาปัตยกรรม
- component: `installer` (workflow payload script `src/.warnyin/workflow/scripts/build-wave.mjs`)
- แนวทาง: ลบ keyword `export` ออกจาก 2 function declaration — พฤติกรรม runtime identical (function ใช้ภายใน script อยู่แล้ว ไม่ต้อง export ตอน Workflow รัน)

## 2. Vertical slices
| # | Slice | ตัดผ่าน layer | → task |
|---|---|---|---|
| 1 | build-wave.mjs launch ผ่าน Workflow tool ได้ (ลบ export) + unit test เขียว + CHANGELOG | script · test (verify) · changelog | `tasks/remove-export/` |

## 3. การแก้ที่แน่นอน (exact)
ใน `src/.warnyin/workflow/scripts/build-wave.mjs`:
- บรรทัด 28: `export function normalizeTasks(rawTasks) {` → `function normalizeTasks(rawTasks) {`
- บรรทัด 35: `export function buildOpts(task, isolate) {` → `function buildOpts(task, isolate) {`
- **คง** บรรทัด 14 `export const meta = {` ไว้ (Workflow tool บังคับต้องมี)

ทำไม test ไม่ต้องแก้: `src/tests/build-wave.test.mjs` ใช้ `extractFn(src, name)` ที่ `indexOf('function ${name}')` — substring นี้อยู่ในทั้ง `export function X` และ `function X` → `start` ชี้ที่ `function` เสมอ (ตัด `export` ตั้งแต่สกัด) → สกัดได้เหมือนเดิม, `new Function` factory ทำงานเดิม

## 4. Interface / contract
- ไม่เปลี่ยน — `normalizeTasks`/`buildOpts` signature + behavior เดิม; export ที่เอาออกไม่มีผู้ import จริง (test ใช้ extraction)

## 5. Flow
- BUILD orchestrator เรียก `Workflow({ scriptPath: ".warnyin/workflow/scripts/build-wave.mjs", args })` → runtime wrap body → เจอเฉพาะ `export const meta` (ผ่าน) → fan-out wave ปกติ

## 6. ผลกระทบต่อระบบเดิม
- backward compatible เต็ม — behavior ของ build-wave ไม่เปลี่ยน; ผู้ import functions เหล่านี้: ไม่มี (test extraction-based)
- **src→root sync-gap:** root `.warnyin/` dogfood gitignored + stale → Workflow รัน root copy; fix มีผลจริงเมื่อ root sync จาก src (release / setup:dogfood) — VERIFY ต้อง sync ก่อนทดสอบ launch

## 7. Dependency
- task เดียว (`remove-export`) — ไม่มี dependency; fast tier DAG width 1 (เหตุผล: change เล็ก 1 ไฟล์ 1 slice — ไม่มีอะไรให้ขนาน ตาม fast-track)

## 8. Test strategy ระดับ design
1. `npm test` — `build-wave.test.mjs` เขียว (regression: extraction ยังหา function เจอ)
2. grep: `src/...build-wave.mjs` ไม่มี `^export function` (เหลือเฉพาะ `export const meta`)
3. **executable proof (VERIFY):** sync src→root แล้ว `Workflow({ scriptPath: ".warnyin/workflow/scripts/build-wave.mjs", args: { slug: "x", tasks: [] } })` → ต้อง **launch สำเร็จ** (empty tasks → early-return ไม่ spawn agent) ไม่เจอ SyntaxError

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
- feature `build-orchestration` **ไม่มี `spec.md`** → ไม่มี delta ต่อ `docs/features/`; เป็น bugfix คืนพฤติกรรมที่ feature ตั้งใจ (build-wave launch ได้) — บันทึก CHANGELOG
- **สรุป: ไม่มี delta ต่อ `docs/features/`**

## 10. Design review
fast-track — ไม่ทำ panel (tier fast)

## 11. Dry-run
fast-track — ไม่ทำ dry-run (tier fast)
