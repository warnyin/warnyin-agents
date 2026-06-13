# Ship Report — UX/UI designer agent + wireframe ใน DESIGN stage

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ topic `uxui-designer-stage` (archived 2026-06-13)

## 1. Feature
- **ใหม่: `uxui-wireframe`** — `docs/features/uxui-wireframe/` (feature.md + business.md + spec.md)
  - spec.md สร้างจาก Spec delta §9 (ADDED 1 Requirement / 6 scenario observable)
  - stage-invoked capability **generator variant** ตัวแรก (read-only generator + approve gate)

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/uxui-wireframe/` (ใหม่) | feature.md (capability/ทำงานยังไง/ขอบเขต/ไฟล์) + business.md + spec.md |
| `docs/rule.md §1` | เติม evidence `uxui-wireframe` (generator variant) เข้า bullet **stage-invoked capability convention** (unify-in-place — ขยาย evidence เดิม ไม่สร้าง rule ใหม่) |
| `docs/troubleshooting.md` | +#23 (negative grep-assert + negation phrase) +#24 (แทรก flat-numbered step ผิดตำแหน่งใน list ที่มี sub-bullet) |
| `docs/techstack/installer/test.md` | +section "verify stage-invoked capability + generator agent" (structural/behavioral/canonical อิสระ/regression) |
| `docs/techstack/installer/structure.md` | +listing `src/.claude/agents/` (reviewer 5 + generator `warnyin-ux`) |
| `docs/project.md` | ขอบเขต in: "reviewer agent" → "reviewer + generator agent (UX wireframe)" |
| `docs/codemap/index.md` | +entry generator agent `warnyin-ux` + capability UX wireframe (step 4.5) |

## 3. Learned-rule (พิจารณาครบทุกตัว)
| # | rule | evidence | ผล |
|---|---|---|---|
| 1 | `generator` เป็น role-format ที่ 3 ใน §โครง role card (payload) | T1 warnyin-ux | ✂️ **ตัด** — YAGNI (generator ตัวเดียว); note ใต้ตาราง `roles/README.md` (T1 ทำแล้ว) สื่อพอ; SHIP ไม่ code-change payload — ยกเป็นโครงกลางเมื่อมี generator ตัวที่ 2 |
| 2 | template repeatable sub-block ต้องมี comment + 2 block | wireframe.md §2 | ✂️ **ตัด** — niche craft; self-documenting ใน template (comment "ทำซ้ำ block ได้" + 2 ตัวอย่าง) แล้ว; กัน bloat docs/rule.md ที่ opinionated |
| 3 | stage-invoked capability **generator variant** | topic uxui-wireframe | ✅ **promote** → `docs/rule.md §1` (เติม evidence ของ bullet เดิม) |
| 4-5 | TS-1 (negative grep-assert) / TS-2 (inline-numbered step insert) | troubleshooting.md ของ topic | ✅ **merge** → `docs/troubleshooting.md` #23/#24 (incident — ไม่ promote เป็น rule ใหม่: TS-1 = specialization ของ rule §5 เดิม, TS-2 = tactical editing tip) |

## 4. Archive
- `docs/stages/uxui-designer-stage/` → `docs/stages/achieved/2026-06-13-uxui-designer-stage/` (git mv)

## 5. หมายเหตุ
- **โค้ด/payload (src/)** merge build branch `build/uxui-designer-stage` → main จัดการนอก workflow (SHIP เป็นเอกสาร + archive เท่านั้น)
- ไม่มี `openapi.yaml` (ไม่แตะ REST API) — API contract promotion N/A
- full-gate ตอน VERIFY: test 85/85 · verify-pack 86 · lint-md (ลิงก์ resolve ครบ)
