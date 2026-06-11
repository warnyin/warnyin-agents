# Proposal — design-tier-gate

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `design-tier-gate` |
| **ประเภท** | `docs` (playbook wording-guidance) |
| **ขนาด** | `fast` (จาก `/warnyin:triage` 2026-06-11 — wording-guidance, 2 ไฟล์ modify, ไม่ cross-cutting, ไม่แตะ hard-floor) |
| **วันที่** | 2026-06-11 |
| **มาจาก Discovery?** | `ไม่มี` (fast-track — triage → design) |

## 1. สรุป change (what)
> เพิ่ม **establish-tier step** ต้น DESIGN: ก่อนเดินทำ artifact ให้ DESIGN **ประเมิน tier เบื้องต้นเอง** (signals + hard-floor) → **มั่นใจ → กำหนด tier + บันทึก `proposal.md` ขนาด**; **ไม่มั่นใจ → ถาม user (options): (ก) ประเมินด้วย `/warnyin:triage` ก่อน / (ข) user กำหนด tier เองถ้ารู้**. + ปรับช่อง "ขนาด" ใน proposal template ให้ใช้ vocab `{fast,standard,large}` ตรง triage

## 2. ทำไม (why)
- **ปัญหา:** `design.md §7` **บริโภค** tier ("ปรับ ceremony ตาม tier ที่ triage ประเมิน") แต่**ไม่มีตัวการันตีว่า tier ถูก established จริง** → DESIGN เดินต่อได้โดยไม่รู้ขนาด แล้วจ่าย ceremony ตามสัญชาตญาณ (เกิดจริง: topic `global-install` ข้าม triage)
- **ผลถ้าไม่ทำ:** dogfooding miss ซ้ำ — มี `change-sizing` แต่ DESIGN ไม่บังคับใช้; ceremony ไม่สม่ำเสมอ (งานเล็กจ่ายเกิน / งานใหญ่หลุด Discovery)

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A: establish-tier step (ประเมินเอง→มั่นใจกำหนด / ไม่มั่นใจถาม options)** | อุดช่องว่าง, ไม่ฝืน (ก้ำกึ่งถาม), เคารพ user ที่รู้แล้ว | +1 step ต้น DESIGN | ✅ (ตรง requirement user) |
| B: บังคับรัน `/warnyin:triage` ทุกครั้งก่อน DESIGN | strict สุด | ฝืนเคสที่ user รู้ tier แล้ว / งานชัด | ✗ |
| C: ปล่อยเป็น guidance เฉยๆ (ไม่มี step) | เบาสุด | = สถานะปัจจุบันที่พลาด | ✗ |

- **เหตุผลที่เลือก A:** ตรง requirement — มั่นใจกำหนดเลย, ไม่มั่นใจถาม, user override ได้; ไม่ rigid

## 4. Scope
**In scope**
- `design.md §4` เพิ่ม step establish-tier (ประเมินเอง / ถาม options เมื่อก้ำกึ่ง) + tie กับ §7
- proposal template `ขนาด` → vocab `{fast,standard,large}` + note "อ้างอิง triage/ประเมิน"

**Out of scope**
- บังคับ triage แบบ hard gate (เป็น judgment ⚠ ไม่ใช่ ✖) · แตะ design command adapter (logic อยู่ playbook — adapter ชี้ playbook อยู่แล้ว) · auto-run triage จาก DESIGN (read-only ยังให้ user สั่ง)

## 5. ผลกระทบ & ความเสี่ยง
- **กระทบเดิม:** `design.md §4/§7` (เพิ่ม step/tie wording), proposal template (vocab) — backward compatible (เพิ่ม step ไม่ลบ flow เดิม)
- **ความเสี่ยง:** ถาม options บ่อยเกินจนน่ารำคาญ → คุมด้วย "มั่นใจ→กำหนดเลย ไม่ถาม" (ถามเฉพาะก้ำกึ่ง); tier ผิด → escalate/downgrade ได้ทุกเมื่อ (triage §2B)

## 6. ลิงก์
- Design (how): `./design.md` · Tasks: `./tasks/`
