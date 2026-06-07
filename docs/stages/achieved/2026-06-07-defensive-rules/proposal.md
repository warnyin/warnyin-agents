# Proposal — defensive-rules (2 กฎเชิงป้องกันใน BUILD/VERIFY)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Slug** | `defensive-rules` |
| **ประเภท** | `docs` (`.md` ล้วน — แก่นกลาง workflow) |
| **ขนาด** | `เล็ก` |
| **วันที่** | 2026-06-07 |
| **มาจาก Discovery?** | `./discovery.md` + `./research.md` |

## 1. สรุป change (what)
เสริม **2 operating principle เชิงป้องกัน** เข้า BUILD/VERIFY playbook §3 + checklist ใน developer.md/qa.md — (1) **investigate-before-edit**, (2) **config-protection** — เป็น rule portable `.md` (เวอร์ชัน enforce ของ "ห้ามเดา"); global bullet 1 บรรทัด note รอ SHIP เข้า `docs/rule.md` §1

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** "ห้ามเดา" เป็นปรัชญาแต่ยังไม่มีกฎรูปธรรมดัก 2 failure mode บ่อยสุดตอน edit loop: แก้ไฟล์โดยไม่เข้าใจ context (พังของที่ผูกอยู่), แก้ config/test ให้เขียวแทนแก้โค้ด (false-green)
- **ผลถ้าไม่ทำ:** roadmap P1 #6 ค้าง; AI ยังเสี่ยงทำ 2 พฤติกรรมนี้โดยไม่มี anchor เตือน
- **ทำไมตอนนี้:** ต่อยอดจาก #5 (playbook `.md` work, risk ต่ำ); ECC พิสูจน์ว่าเป็น failure mode จริง — เราทำเป็น rule portable ไม่ผูก vendor hook

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. rule portable ใน playbook+role+global (เบา) | tool-agnostic, ตรงปรัชญา, ไม่ duplicate | พึ่ง AI อ่าน (ไม่ auto-enforce) | ✅ |
| B. vendor hook (Claude gateguard/config-protection) | auto-enforce | Claude-only, runtime หนัก, ขัด tool-agnostic | — |
| C. เพิ่มเป็น Gate item | enforce แข็ง | Gate บวม | — (D4) |

- **เหตุผลที่เลือก A:** ตรง D1-D4 — portable, เบา, ไม่บวม Gate

## 4. Scope
**In scope**
- `src/.warnyin/workflow/stages/build.md` §3 — +2 operating principle
- `src/.warnyin/workflow/stages/verify.md` §3 — +2 operating principle (config-protection สำคัญตรง fix loop)
- `src/.warnyin/workflow/roles/developer.md` — +checklist line (BUILD)
- `src/.warnyin/workflow/roles/qa.md` — +checklist line (VERIFY)
- note global bullet ขยาย `docs/rule.md` §1 → `tasks/*/rule.md` §2 (รอ SHIP)

**Out of scope**
- vendor hook / runtime enforcement / lint tool อัตโนมัติ
- Gate checklist item ใหม่ (D4)
- documented-investigation ceremony หนัก (D2)
- แตะ `docs/rule.md` ตอน BUILD (central → รอ SHIP)

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบเดิมที่กระทบ:** ไม่มี runtime/installer; เพิ่มไม่กี่บรรทัดใน 4 ไฟล์ payload — ไม่ลบ/แก้ logic เดิม
- **ความเสี่ยง + ลด:** rule ซ้ำ/ขัด "ห้ามเดา" เดิม → *ลด:* ผูกเป็น "enforce ของ ห้ามเดา" ชัด, wording สม่ำเสมอ (1 task เดียวเขียนทุกจุด กัน drift), เพิ่มน้อยบรรทัด

## 6. ลิงก์
- Design (how): `./design.md` · Tasks: `./tasks/`
- Discovery: `./discovery.md` · Research: `./research.md`
