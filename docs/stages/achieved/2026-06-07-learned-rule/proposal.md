# Proposal — learned-rule (instinct แบบ manual ใน SHIP)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Slug** | `learned-rule` |
| **ประเภท** | `docs` (`.md` ล้วน — playbook กลาง + adapter command + template) |
| **ขนาด** | `เล็ก` |
| **วันที่** | 2026-06-07 |
| **มาจาก Discovery?** | `./discovery.md` + `./research.md` |

## 1. สรุป change (what)
เพิ่ม **learned-rule capture step** ใน SHIP (unify กับ note "รอ SHIP" เดิม) — ตอน SHIP รวบรวม rule candidate จาก **(1) planned** (`tasks/*/rule.md` §2) + **(2) emergent** (บทเรียนที่โผล่ตอน BUILD/VERIFY — สแกน `build.md`/`verify.md`/`troubleshooting.md`/diff); ทุกตัวต้องมี **rule + evidence (concrete pointer, บังคับ) + scope (component/project)** แล้ว **fold เข้า approval เดิมของ SHIP ให้ user ยืนยัน per-rule** ก่อน promote — แก้ 3 ไฟล์ (`ship.md` playbook + command + template `[topic]/ship.md`)

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** กลไก promote rule ปัจจุบันจับเฉพาะ rule ที่ **note ล่วงหน้าตอน DESIGN** — "instinct" ที่เกิดตอนลงมือ (BUILD/VERIFY: pattern แก้ซ้ำ, เกือบพลาด, บทเรียนจาก troubleshooting) ไม่มีจุดจับเป็นกฎถาวร กระจัดกระจาย/หายไป
- **ผลถ้าไม่ทำ:** roadmap P1 #8 ค้าง; ความรู้ที่ได้จากการทำจริงไม่สะสมเป็น rule — ทำผิดซ้ำได้
- **ทำไมตอนนี้:** ต่อยอด #5–#7 (playbook `.md` work, risk ต่ำ); SHIP ทบทวนทั้ง topic อยู่แล้ว — เติม discipline ต้นทุนต่ำ คุณค่าสูง; ยืมแก่น ECC instinct แบบ **manual (zero-runtime)** ตรงปรัชญา

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. manual capture ตอน SHIP (unify, evidence บังคับ, user-confirm) | tool-agnostic, zero-runtime, ต่อยอดกลไกเดิม, ไม่ duplicate | พึ่ง AI เสนอ + user ยืนยัน (ไม่ auto) | ✅ (D1–D5) |
| B. runtime observer (hook + SQLite) จับ behavior อัตโนมัติ | auto, ครบ | runtime หนัก, dependency, ขัด zero-dep/tool-agnostic | — (roadmap ตัด) |
| C. artifact + gate แยกจาก "รอ SHIP" | แยกชัด | 2 กลไกขนาน ซ้ำซ้อน/สับสน | — (D1 unify) |

- **เหตุผลที่เลือก A:** ตรง D1–D5 — unify, evidence บังคับ, scope 2 ระดับ, fold approval, 3 surface; manual ได้คุณค่า ~80% โดยไม่มี runtime

## 4. Scope
**In scope**
- `src/.warnyin/workflow/stages/ship.md` — §3 principle 7 ขยาย (planned+emergent) + §4 process (collect emergent step 1, fold approval step 3, promote ตาม scope step 5) + §6 gate item
- `src/.claude/commands/warnyin/ship.md` — mirror step 3 (collect emergent) + step 5 (fold learned-rule table เข้า approval)
- `.warnyin/template/stages/[topic]/ship.md` — +section "Learned rules" (rule | evidence | scope | promote?) แทน/ขยาย §3 เดิม
- note global bullet ขยาย `docs/rule.md` §1 → `tasks/*/rule.md` §2 (รอ SHIP)

**Out of scope**
- runtime observer / hook / SQLite / auto-detect (manual เท่านั้น — roadmap)
- scope level ใหม่นอก component/project (D2)
- separate artifact file / gate ยืนยันแยก (D1, D4)
- เปลี่ยน promote target (reuse `docs/rule.md` + `docs/techstack/*/rule.md`)
- แตะ `docs/rule.md` central ตอน BUILD (รอ SHIP)

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบเดิมที่กระทบ:** ไม่มี runtime/installer; เพิ่ม step/บรรทัดใน 3 ไฟล์ `.md` — ต่อยอด §3/§5/§6 เดิม ไม่ลบ logic เดิม (note "รอ SHIP" กลายเป็น subset ของ learned-rule)
- **ความเสี่ยง + ลด:** (1) ship.md บวม → *ลด:* unify ต่อยอดกลไกเดิม ไม่สร้างกลไกขนาน; (2) ซ้ำ troubleshooting → *ลด:* learned-rule = กฎ generalize (troubleshooting = incident; learned-rule *อ้าง* มันเป็น evidence) — ระบุชัดใน playbook; (3) AI เดา rule → *ลด:* evidence บังคับ + user ยืนยัน per-rule

## 6. ลิงก์
- Design (how): `./design.md` · Tasks: `./tasks/`
- Discovery: `./discovery.md` · Research: `./research.md`
