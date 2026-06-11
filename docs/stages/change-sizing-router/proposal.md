# Proposal — change-sizing-router

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Slug** | `change-sizing-router` |
| **ประเภท** | `feature` (workflow capability ใหม่) |
| **ขนาด** | `กลาง (standard)` — dogfood: triage rubric ที่กำลังสร้างจะจัดงานนี้เป็น standard เอง |
| **วันที่** | 2026-06-11 |
| **มาจาก Discovery?** | `./discovery.md` (ผ่าน gate 2026-06-10) — business context ครบใน Discovery จึง **ข้าม business.md** (§7) |

## 1. สรุป change (what)
> เพิ่ม **`/warnyin:triage`** (read-only router) + playbook `triage.md` ที่ **ประเมินขนาด change → 3 tier (fast/standard/large)** ด้วย rubric (signals + hard-floor) แล้ว **แนะนำ route** ; reframe `design.md §7` (2-level → 3-tier + fast-track skip-list) — งานเล็กไวขึ้นโดยคง correctness floor + escalate ได้ตลอด

## 2. ทำไม (why)
- **ปัญหา:** workflow เส้นทางเดียว ceremony เท่ากันหมด → typo/bugfix จ่าย overhead เกิน (เดินครบ 4 stateful command + panel/dry-run); งานใหญ่ก็ไม่มี trigger บังคับ Discovery
- **ผลถ้าไม่ทำ:** workflow ใช้ไม่คล่องกับงานเล็ก คน skip ความระวังเองแบบ ad-hoc (ไม่มี discipline)

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A: triage command + rubric + fast-track skip-list (lean ceremony, reuse command)** | ประเมินก่อนจ่าย ceremony, ไม่เพิ่ม heavy command, escalate ได้ | +1 utility command | ✅ (Discovery Q1-Q5) |
| B: `/warnyin:quick` one-shot รวบ stage | เร็วสุด | collapse gate เสี่ยง mis-size | ✗ (Q4) |
| C: แค่ formalize §7 ที่มี (ไม่ทำ command) | เบาสุด | ไม่มี surface ประเมินก่อน DESIGN — ไม่ fast จริง | ✗ (Q1/Q3) |

- **เหตุผลที่เลือก A:** ตรง MVP "assess + fast-track" (Q1), reuse command เดิม (Q4), surface ชัดด้วย triage (Q3)

## 4. Scope
**In scope**
- `triage.md` playbook (canonical rubric: 3-tier + signals + hard-floor + escalation + route + fast-track skip-list)
- `.claude/commands/warnyin/triage.md` (adapter บาง model ตาม `next.md`)
- reframe `design.md §7` (2-level → 3-tier + ชี้ skip-list canonical ใน triage.md)
- register triage ใน workflow `README.md`
- empirical demo (VERIFY): bugfix 1 เคส fast-track เทียบ standard

**Out of scope**
- decompose L/XL → epic/หลาย topic อัตโนมัติ (large แค่ route → Discovery บังคับ)
- 2 มิติ size×type · `/warnyin:quick` one-shot · auto-execution (triage แนะนำแล้วหยุด)
- แก้ stage playbook ทุกใบ (skip-list อยู่ canonical ที่ triage.md — ไม่ duplicate ลงทุก stage)

## 5. ผลกระทบ & ความเสี่ยง
- **กระทบเดิม:** `design.md §7` (reframe), `README.md` (เพิ่ม 1 capability); ไม่แตะ stage playbook อื่น (unify: skip-list canonical ที่เดียว)
- **ความเสี่ยง:** mis-size → คุมด้วย hard-floor + escalate-anytime · command บาน → triage เป็น surface ใหม่เดียว · fast ลด correctness → test-floor + hard-floor คงไว้

## 6. ลิงก์
- Design: `./design.md` · Tasks: `./tasks/` · Discovery: `./discovery.md` · Research: `./research.md`
