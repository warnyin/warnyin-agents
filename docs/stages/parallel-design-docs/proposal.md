# Proposal — ลดเวลาสร้างเอกสาร DESIGN ด้วย parallelization

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `parallel-design-docs` |
| **ประเภท** | `docs` (แก้ playbook guidance ของ DESIGN stage) |
| **ขนาด** | `standard` (ประเมินใน DESIGN step 1.5 — 3 capability ใหม่, แก้ playbook กลาง + adapter, ไม่แตะ hard-floor 5 หมวด) |
| **วันที่** | `2026-06-11` |
| **มาจาก Discovery?** | ไม่มี (มาจากบทสนทนา — ผู้ใช้สังเกตว่า "ตอนสร้างเอกสาร DESIGN นานมาก") |

## 1. สรุป change (what)
เพิ่ม **guidance การ parallelize** ลงใน DESIGN playbook 3 จุด เพื่อลด wall-clock การสร้างเอกสาร โดยไม่ลด correctness:
1. **Parallel grounding** — fan-out read-only sub-agent อ่าน input หลายโดเมนขนาน แทนการอ่านเรียงทีละไฟล์ (§4 step 2)
2. **Task-file fan-out เป็น default** สำหรับ tier standard/large — หนึ่ง agent ต่อหนึ่ง task เขียน 4 ไฟล์ขนาน หลังผ่าน Gate (§4 step 9, เดิมเป็น optional)
3. **Design narrative = research-fan-out + single-writer** — fan-out เก็บ fact ขนานได้ แต่เขียน narrative โดย main loop คนเดียว (กัน coherence cost) (§4 step 5)

ทั้งหมดทำเป็น **playbook guidance** (ไม่เพิ่ม script ใหม่) + มี **tool-agnostic fallback** (เครื่องที่ fan-out ไม่ได้ → ทำตามลำดับเหมือนเดิม)

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** DESIGN stage สร้างเอกสารแบบ serial เกือบทั้งหมด — grounding อ่าน input 7 อย่างเรียงกัน (§2), เขียน proposal/design/task ทีละไฟล์ใน main loop คอขวด wall-clock จริงอยู่ที่ grounding + การเขียน task files หลายใบ
- **มีของพร้อม reuse:** ฝั่ง BUILD แก้เรื่องนี้ไปแล้ว (topic `improve-performance`: DAG-width toolkit + fan-out wave + lean self-verify) — DESIGN เป็น analog ที่ยังไม่ได้รับประโยชน์เดียวกัน; line 79 ของ playbook มี "fan-out task files ได้" อยู่แล้วแต่เป็น optional ไม่ถูกใช้จริง
- **ผลถ้าไม่ทำ:** DESIGN ยังช้าเท่าเดิม — เสีย wall-clock ทุกครั้งที่รัน stage ทั้งที่งานหลายส่วน independent ขนานได้ฟรี

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A (แนะนำ) — playbook guidance 3 จุด + fallback | กระทัดรัด, ไม่เพิ่ม mechanism ขนาน, tool-agnostic, reuse pattern เดิม | ไม่ deterministic เท่า script (พึ่ง main loop ทำตาม guidance) | ✅ |
| B — เพิ่ม script `design-wave.mjs` คู่ build-wave | deterministic orchestration + structured result | ขัด rule "unify-in-place ไม่สร้างกลไกขนาน" + "กระทัดรัด"; worktree ไม่จำเป็น (task คนละโฟลเดอร์ ไม่ชนกัน); ผูก Workflow tool (ไม่ tool-agnostic) | |
| C — เฉพาะ parallel grounding | เสี่ยงต่ำสุด | ได้ ROI แค่ส่วนเดียว ทิ้งคอขวด task-files | |

- **เหตุผลที่เลือก A:** ผู้ใช้ยืนยัน scope ทั้ง 3 ข้อ + กลไก playbook-only; การเขียน task files แต่ละใบอยู่คนละโฟลเดอร์ → ไม่มี file conflict → ไม่ต้องใช้ worktree/script; main loop spawn Agent ขนานเองได้ตรงๆ (อ้าง pattern `build-wave.mjs` เป็น reference ไม่ต้อง vendor)

## 4. Scope
**In scope**
- แก้ `src/.warnyin/workflow/stages/design.md` — เพิ่มหลักการ §3 + hook §4 step 2/5/9 + ปรับ §7 tier table (ทั้ง 3 capability + tool-agnostic fallback)
- sync adapter `src/.claude/commands/warnyin/design.md` (task fan-out เป็น default สำหรับ standard/large) + `CHANGELOG.md` entry

**Out of scope**
- เพิ่ม script ใหม่ (`design-wave.mjs`) — ตัดทิ้ง (ทางเลือก B)
- แตะ `validate-topic.mjs` / โครง template / structural gate — change นี้เป็น process guidance ไม่เพิ่ม structural requirement ต่อ topic
- แตก narrative-writing ให้หลาย agent — จงใจห้าม (coherence cost — เป็น guardrail ของ capability 3)
- เปลี่ยนพฤติกรรม BUILD/VERIFY/SHIP

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** ทุก DESIGN run หลังจากนี้ (เปลี่ยน default ของ task-file generation สำหรับ standard/large); fast tier ไม่กระทบ (1 task → ไม่ fan-out)
- **ความเสี่ยง + วิธีลด:**
  - *fan-out grounding ทำให้ main loop พลาด context ที่ต้องอ่านเอง* → sub-agent คืน summary + path/บรรทัด, main loop สังเคราะห์ + ถาม user จุดกำกวมเอง (ไม่ delegate การตัดสิน scope)
  - *task files fan-out แล้ว dependency/contract ข้าม task ไม่ consistent* → main loop review coherence หลัง integrate (Gate §8 ยังต้องผ่านก่อน fan-out เหมือนเดิม)
  - *เครื่องที่ไม่มี sub-agent tool ทำตามไม่ได้* → ทุกจุดมี fallback "ทำตามลำดับเหมือนเดิม" ระบุชัดใน playbook (tool-agnostic)

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Precedent (BUILD analog): `docs/stages/achieved/2026-06-10-improve-performance/`
