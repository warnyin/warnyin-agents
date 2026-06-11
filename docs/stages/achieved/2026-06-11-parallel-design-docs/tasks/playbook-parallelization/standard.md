# Standard — playbook-parallelization

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน playbook guidance ที่ task นี้ต้องยึด

## 1. Standard กลางที่ยึด (จาก techstack / rule.md)
- **canonical edit = `src/` เท่านั้น** — root `.warnyin/` เป็น dogfood gitignored (rule.md §6 + "src→root sync-gap")
- **payload-guidance ต้อง generic** — guidance ใน `.warnyin/` ห้ามผูกชื่อรุ่น/tooling harness; ใช้ vocab generic เช่น `read-only sub-agent`, `fan-out` (rule.md §1)
- **unify-in-place ไม่สร้างกลไกขนาน** — เสริม mechanism ที่ทับซ้อนของเดิม → ขยายในที่เดิม (เช่น ผูกหลักการแกนกับ §3 ข้อ 2/7) ไม่เพิ่มข้อใหม่ขนาน (rule.md §1)
- **canonical-copy convention** — behavior contract นิยาม canonical ที่ `design.md §3` ของ topic แล้ว task copy ตาม ไม่แต่งใหม่ (rule.md §1)
- **stage playbook ชี้ context ที่เข้าคู่** — DESIGN→research+build; อย่าทำให้ callout เดิมเพี้ยน (rule.md §1)

## 2. Pattern การเขียน guidance ของ task นี้
- **โครงสร้าง:** แทรกในที่เดิมของ §3/§4/§7 — ไม่ย้าย/renumber step โดยไม่จำเป็น; ถ้าต้องเพิ่ม step ย่อยให้คงเลขเดิมของ step ข้างเคียง (อิง pattern build-wave.mjs ที่แทรก step "0." โดยไม่ renumber 1-9)
- **fallback pattern:** ทุกจุด fan-out เขียนคู่ "เครื่องที่ fan-out ไม่ได้ → ทำตามลำดับเหมือนเดิม" — เลียน pattern line 80 เดิม ("เครื่องที่ fan-out ขนานไม่ได้ → ...")
- **ภาษา:** ไทย ตามสไตล์ playbook เดิม
- **cross-ref:** อ้าง section ด้วย § + เลข/ชื่อ ตรงกับของจริงในไฟล์หลังแก้

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **reference pattern (ไม่ vendor):** อ้าง `build-wave.mjs` เป็นตัวอย่าง fan-out pattern ได้ (BUILD analog) — แต่ **ไม่ duplicate logic**, แค่ชี้ว่า "แนวเดียวกับ wave fan-out ของ BUILD"
- **precedent:** `docs/stages/achieved/2026-06-10-improve-performance/` (โครงคำอธิบาย DAG-width/fan-out)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- ไม่มี pattern ใหม่ — เป็นการขยาย guidance เดิมตามมาตรฐานที่มีอยู่
