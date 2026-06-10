# Proposal — เร่งความเร็ว BUILD stage (improve-performance)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `improve-performance` |
| **ประเภท** | `docs` (playbook) + `refactor` (build-wave.mjs) |
| **ขนาด** | `กลาง` |
| **วันที่** | `2026-06-10` |
| **มาจาก Discovery?** | `./discovery.md` |

## 1. สรุป change (what)
> ปรับ **playbook กลาง** (`src/.warnyin/workflow/`) ให้ BUILD เร็วขึ้น 2 ชั้น: **โครงสร้าง** (DESIGN แตก DAG กว้างขึ้น เดินขนานได้ + วัด critical-path) และ **กลไก** (model routing per task, ลด self-verify ซ้ำ, task/context lean) — ทุกอย่าง generic cross-stack + unify-in-place ตาม mechanism เดิม

## 2. ทำไม (why)
- **ปัญหา:** BUILD ~2 ชม./wave + agent ตัวเดียว/wave เพราะ DESIGN แตก task เป็น dependency chain เส้นตรง (เคส `scaffold-foundation`: 4 task = 4 wave × 1 ตัว) — ดู `discovery.md` §2
- **ผลถ้าไม่ทำ:** BUILD stage ใช้งานจริงไม่ไหว → workflow ขาด stage สำคัญ; ทุก project ปลายทางเจอคอขวดเดียวกัน

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A (แนะนำ) **Toolkit + unify-in-place** | generic, ไม่ over-prescribe, ขยาย mechanism เดิม (tech-lead/contexts/developer) ไม่สร้างขนาน | ต้องมี gate บังคับวัด critical-path กัน chain เผลอ | ✅ |
| B Hardcode contract-first เป็นหลักการหลัก | ตีตรงเคสนี้ | ขัด philosophy vertical-slice, over-prescribe, ไม่ generalize | ❌ |
| C แก้แค่กลไก (ไม่ยุ่ง DAG) | เสี่ยงน้อย | ไม่แก้ root cause (chain ยังเส้นตรง) | ❌ |

- **เหตุผลที่เลือก A:** decision discovery #1 (แก้ทั้งสองชั้น) + #2 (toolkit); สอดคล้อง rule `กระทัดรัด opinionated` + `unify-in-place` — feature 5/6 ตัวมี mechanism เดิมอยู่แล้ว แค่ขยาย/ทำให้ explicit, มีแค่ model routing ที่ต้องเพิ่มโค้ดใน build-wave.mjs

## 4. Scope
**In scope**
- DESIGN playbook: toolkit ลด serialization + critical-path gate (design.md + tech-lead.md + template/design.md)
- BUILD กลไก: model routing per task (build-wave.mjs + contexts/ + template/task.md + command), ลด self-verify ซ้ำ + task/context lean (build.md + developer.md)
- แก้ที่ `src/` → sync ลง root dogfood; ปิดด้วย 1 empirical run (scaffold-foundation)

**Out of scope**
- runtime/installer (`cli.mjs`), ผูก techstack เฉพาะ (pnpm/turbo), rewrite build-wave.mjs ทั้งตัว, stage อื่น (VERIFY/SHIP) นอกจุดกระทบตรง

## 5. ผลกระทบ & ความเสี่ยง
- **กระทบเดิม:** design.md/build.md/build-wave.mjs/contexts/tech-lead/developer + template + command — ไฟล์แกนของ workflow → regression ต้องระวัง (full test suite + empirical run เป็น gate)
- **ความเสี่ยง + ลด:**
  - contract-first ขัดนิยาม vertical-slice → **reconcile ใน design** (คงนิยามเดิม + toolkit เป็นเทคนิคเสริม) — _รอ user ยืนยันจุดยืน_
  - ขนานมากขึ้น → integration risk ↑ → full-gate เดิม (build.md §3.8/§4.6) รับอยู่แล้ว
  - model routing ต้อง generic (rule payload-guidance) → ใช้ vocab `deepest/balanced/cheap` ของ `contexts/` ที่มีอยู่ ไม่ผูกชื่อรุ่น

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Discovery: `./discovery.md` · Research: `./research.md`
