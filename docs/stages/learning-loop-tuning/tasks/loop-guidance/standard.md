# Standard — loop-guidance

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน playbook markdown ที่ task นี้ต้องยึด

## 1. Standard กลางที่ยึด (จาก docs/rule.md — repo นี้ไม่มี techstack component สำหรับ playbook)
- **unify-in-place** — ขยายข้อความ principle/mechanism เดิมในที่เดิม (build §3 item8/§4 step6, verify §3 item5/§4 step5) **ห้าม append บล็อก/ข้อ/section ขนาน**
- **canonical-copy** — copy wording จาก `design.md §2.5` ตรงตัว ห้ามแต่งใหม่ต่อไฟล์; ข้ามไฟล์ที่ต้องอ้างถึงกัน = **pointer (markdown link) ไม่ inline ซ้ำ**
- **minimalism** — เขียนกระชับ; guidance เป็น note/guidance ไม่ใช่ hard gate (ไม่เพิ่ม `- [ ]` ใน gate)
- **tool-agnostic** — vocab generic (`credit horizon`/`batching`/`per-finding`/tier `fast/standard/large`) ห้ามผูกชื่อรุ่น/tool
- **structural validator ✖ ไม่พึ่ง filled-detection** — proxy เป็น report requirement ไม่ใช่ gate ✖ ที่ block ด้วย heuristic

## 2. Pattern การเขียน
- โครงสร้าง: บล็อก guidance ใช้ fenced code หรือ callout สั้น สอดรูปแบบ callout เดิมของ playbook (`★`/`⚠` เหมือน principle อื่น)
- pointer: `[ข้อความ](../triage.md#...)` / `[..](./build.md#...)` แบบ relative ตาม convention ไฟล์รอบข้าง
- ภาษา: ไทย (ตาม `docs/rule.md §2`)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- อ้าง section เดิมที่มีอยู่แล้วด้วย pointer (build §4 step6, verify §4 step5, triage §2B) — ไม่ทำสำเนา logic
- reference precedent: `minimalism.md` + pointer 6 surface (รูปแบบ canonical + arrow-summary), `discovery.md §3.5.3` (observable proxy table)

## 4. เพิ่มเติมเฉพาะ task
- ยึด anchor ตาม `design.md §2.5` insertion-anchor callout (ตรวจกับไฟล์จริงก่อนแก้ — investigate-before-edit)
