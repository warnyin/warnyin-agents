# Standard — remove-export

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Standard กลางที่ยึด
- **payload workflow script ห้าม top-level `export` นอก `export const meta`** (`docs/techstack/installer/rule.md` §build orchestration) — นี่คือ rule ที่ task นี้บังคับใช้/แก้ให้สอด
- **zero-dependency / ESM** — build-wave.mjs ใช้ built-in + globals ที่ harness inject (`args/agent/parallel/log/phase`)
- **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/` เท่านั้น
- **CHANGELOG ทุก user-facing change** (`docs/rule.md` §2)

## 2. Pattern การแก้
- ลบเฉพาะ keyword `export ` (มี space ต่อท้าย) หน้า `function` — ไม่แตะ signature/body/ลำดับ
- คอมเมนต์เหนือ function (ถ้ามีอธิบาย export) — ปรับให้ตรงถ้าจำเป็น แต่ comment เดิมอธิบาย normalize/immutable ไม่ได้พูดเรื่อง export → ไม่ต้องแตะ

## 3. Shared component / utility ที่ต้องใช้
- test pattern เดิม `src/tests/build-wave.test.mjs` (extractFn + new Function) — **ไม่แตะ** ใช้ยืนยัน regression

## 4. เพิ่มเติมเฉพาะ task
- ไม่มี
