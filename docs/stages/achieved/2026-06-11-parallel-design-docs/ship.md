# Ship report — parallel-design-docs

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> ส่งมอบ 2026-06-11 · topic ปิดสมบูรณ์

## Topic นี้ทำอะไร
เพิ่ม guidance parallelization 3 จุดใน DESIGN playbook เพื่อลดเวลาสร้างเอกสาร (ไม่ลด correctness) ภายใต้หลักการแกน **"Parallelize gathering, serialize judgment/narrative"** — C1 parallel grounding · C2 task-file fan-out default (standard/large) · C3 narrative single-writer guardrail · ทุกจุดมี tool-agnostic fallback · playbook-only (ไม่เพิ่ม script)

## Feature: **ปรับปรุง `build-orchestration`** (ไม่ใช่ feature ใหม่)
feature เดิมครอบ DESIGN+BUILD orchestration อยู่แล้ว → เพิ่มกลไก DESIGN doc-creation:
- เพิ่มองค์ประกอบ **#6 Parallel grounding · #7 Task-file fan-out default · #8 Narrative single-writer guardrail**
- update intro (ครอบ "การสร้างเอกสาร DESIGN") + flow DESIGN + files list (step 2/5/9)
- **ไม่มี `spec.md`** ใน feature นี้ → ไม่มี Spec delta merge (ตรง design §9 "ไม่มี delta ต่อ `docs/features/`")

## Learned-rules (ยืนยันโดย user)
| id | rule | scope → ปลายทาง | ผล |
|---|---|---|---|
| **R1** | Parallelize gathering, serialize judgment/narrative — fan-out เก็บข้อมูล/หน่วย independent ได้; ตัดสิน scope + narrative coherent = single-writer; ทุกจุดมี fallback | `project` → `docs/rule.md` | ✅ promote (ใหม่ — วางคู่ "DAG-width ก่อน serialize") |
| **R2** | Workflow-tool script ห้าม top-level `export` นอก `export const meta` | `component:installer` → `installer/rule.md` | ⚠️ **มีอยู่แล้ว** (line 26 จาก topic `global-install`) → ไม่ duplicate; **เติม evidence ครั้งที่ 3** + workaround Agent-tool fallback |

## เอกสารกลางที่อัปเดต
| ไฟล์ | สาระ |
|---|---|
| `docs/features/build-orchestration/feature.md` | +3 องค์ประกอบ (#6/#7/#8) + intro/flow/files |
| `docs/rule.md` | +R1 (หลักการแกน fan-out, คู่ DAG-width) |
| `docs/techstack/installer/rule.md` | เติม evidence ครั้งที่ 3 + Agent-tool workaround ใน rule export เดิม (§build orchestration) |

## ไม่แตะ (พร้อมเหตุผล)
- **`docs/troubleshooting.md`** — TS-1 (export bug) = duplicate ของ #16/#20 ที่มีอยู่แล้ว → ไม่เพิ่ม entry ซ้ำ (canonical-copy); topic troubleshooting.md เก็บใน archive เป็น occurrence record
- **`docs/features/.../spec.md`** — feature ไม่มี spec.md + ไม่มี delta
- **`docs/techstack/installer/{structure,test}.md`** — โครงไฟล์ไม่เปลี่ยน; topic test = docs-semantic-verify เฉพาะกิจ ไม่ใช่ component test pattern reusable
- **`docs/codemap/`** — ไม่มีไฟล์เพิ่ม/ลบ/ย้าย, `build-wave.mjs` โครงไม่เปลี่ยน → codemap ยังตรง
- **`docs/{project,infra}.md`** — ไม่มีข้อมูลใหม่เกี่ยวข้อง

## ★ ค้างที่ต้อง track (เสนอ user)
**Fix ถาวร `src/.warnyin/workflow/scripts/build-wave.mjs` ยัง overdue** — bug export ถูก document เป็น rule + troubleshooting #16/#20 ตั้งแต่ topic `build-wave-branch-fix`/`global-install` แต่ **build-wave.mjs ยังไม่ถูกแก้** → เจอซ้ำเป็นครั้งที่ 3 ใน topic นี้ (ต้องใช้ fallback ทุกครั้ง). ควรเปิด topic แก้แยก: ย้าย `normalizeTasks`/`buildOpts` ไป `build-wave.lib.mjs` (test import ที่ helper) หรือเลิก `export` ในตัว script

## สถานะ: ✅ topic ปิดสมบูรณ์
- archived → `docs/stages/achieved/2026-06-11-parallel-design-docs/`
- feature `build-orchestration` สะท้อนพฤติกรรมใหม่
- learned-rule promote/strengthen ครบ (R1 ใหม่ · R2 เสริม evidence)
- code (build branch `build/parallel-design-docs`) → merge เข้า main นอก workflow
