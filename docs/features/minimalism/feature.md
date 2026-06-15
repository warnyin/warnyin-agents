# Feature — Minimalism principle

> ความรู้ถาวรระดับ feature · promote จาก topic `ponytail-minimalism` (achieved 2026-06-15)

## คืออะไร
**Minimalism principle** = principle กลาง "เขียนโค้ดน้อยที่สุดเท่าที่จำเป็น" ฝังใน workflow ให้ AI agent ที่เดินผ่าน playbook เขียน output กระชับขึ้น — ตกผลึกปรัชญา "lazy senior dev" มาเป็น **single-source doc** `src/.warnyin/workflow/minimalism.md` (top-level เหมือน `triage.md`/`api-doc.md`) ที่ surface อื่น *pointer* มา (ไม่ duplicate)

แก่น 2 ส่วน:
| ส่วน | สาระ |
|---|---|
| **Decision hierarchy** (6 ขั้น) | `ต้องมีไหม?→ข้าม(YAGNI)` → `stdlib?` → `native?` → `dep ที่ลงแล้ว?` → `one-liner?` → `ค่อยเขียนเองขั้นต่ำ` |
| **Guardrail "lazy not negligent"** | ห้ามตัด: validation ที่ trust-boundary, data-loss handling, security, accessibility, test/spec/acceptance |

## ทำงานยังไง
- **single source:** full hierarchy + guardrail + before/after + over-cut boundary อยู่ใน `minimalism.md` ที่เดียว (guardrail วางก่อน hierarchy เพื่อเด่น)
- **pointer 6 surface (canonical-copy — ไม่ duplicate):**
  - ฝั่งผลิต (generate): `roles/developer.md` (Lens), `contexts/build.md` (Mindset), `stages/build.md §3` (operating principle)
  - ฝั่งตรวจ (review): `contexts/review.md` (section "Over-engineering lens"), `stages/verify.md §3` (operating principle)
  - registry: `workflow/README.md`
- pointer ใช้ **arrow-summary สั้น** (`YAGNI→stdlib→native→dep→one-liner→ขั้นต่ำ`) wording เหมือนกันทุกไฟล์ + ลิงก์ `[`minimalism`](../minimalism.md)` — ไม่ลอก full block
- **always-on zero-config:** ไม่มี intensity knob (lite/full/ultra/off) และไม่มี command สลับระดับ — ปรับความเข้มผ่าน triage tier เดิมถ้าจำเป็น
- **generate-flow:** build sub-agent อ่าน `developer.md` → เห็น pointer → ใช้ hierarchy เป็น default · **review-flow:** session สวม `review.md` → over-engineering lens → minimalism

## ขอบเขต / ข้อจำกัด
- **tool-agnostic** — `minimalism.md` ใช้ vocab generic ไม่อ้างชื่อรุ่น/tool/ผลิตภัณฑ์ (รวมในประโยคปฏิเสธ); เป็น **guidance ไม่ใช่ hard gate** (judgment อยู่ที่คนรีวิว/agent)
- **ไม่เพิ่ม context ตัวที่ 4** — minimalism เป็น principle ไม่ใช่ session posture (`contexts/` ยัง 3)
- **ไม่เพิ่ม hard gate** ใน `verify.md §6` — ฝั่งตรวจเป็น lens ใน posture เท่านั้น (เลี่ยง heuristic gate)
- **zero-dependency** — เอกสาร `.md` ล้วน ship อัตโนมัติผ่าน allowlist `src/.warnyin`
- ไม่ bundle ponytail plugin / ไม่เอา debt marker / ไม่มี benchmark harness (out of scope จงใจ)

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/workflow/minimalism.md` (single source)
- pointer: `src/.warnyin/workflow/{roles/developer.md, contexts/build.md, contexts/review.md, stages/build.md, stages/verify.md, README.md}`
- เทียบมิติ: `docs/features/context-profiles/` (context = posture, คนละชั้นกับ principle)
