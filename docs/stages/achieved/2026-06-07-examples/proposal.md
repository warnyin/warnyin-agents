# Proposal — examples (worked-example walkthrough)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `examples` |
| **ประเภท** | `docs` |
| **ขนาด** | `เล็ก` |
| **วันที่** | 2026-06-07 |
| **มาจาก Discovery?** | `./discovery.md` (Q1–Q4 ปิดครบ) |

## 1. สรุป change (what)
เพิ่ม **`docs/example-walkthrough.md`** — narrative ไล่ครบ 5 stage ของ topic จริง `cli-legacy-warning-fix` (Discovery→SHIP) พร้อมลิงก์ไป artifact จริงใน `docs/stages/achieved/2026-06-07-cli-legacy-warning-fix/` + **disclaimer** (snapshot ณ วันที่ + ชี้ playbook ปัจจุบัน) + เพิ่ม **section pointer ใน README** ชี้ไป walkthrough — **ไม่สร้าง `examples/`, ไม่ duplicate, ไม่ ship npm**

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** ผู้ใช้ใหม่ที่ `npx` ได้แค่ template `[topic]/` เปล่า — ไม่เห็นว่า output ที่ "ทำดีแล้ว" หน้าตาเป็นยังไง; achieved 9 topic มีของจริงแต่ไม่มีจุด onboard ชี้ไป
- **ผลถ้าไม่ทำ:** roadmap P2 #10 ค้าง; onboarding ผู้ใช้ใหม่มีแรงเสียดทาน (ต้องเดาเองว่า artifact ที่ดีคืออะไร)

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. surface achieved (narrative + pointer) | ไม่ duplicate, maintenance ต่ำสุด, ใช้ของจริง | ผู้ใช้ต้องเปิด GitHub ดู artifact | ✅ (Q1) |
| B. examples/ ship กับ npm | ได้ไฟล์ตอนติดตั้ง | duplicate + ขนาด package + staleness (ขัด rule §4) | — |
| C. examples/ repo-only (duplicate achieved) | อยู่ใน repo | duplicate กับ `docs/stages/achieved/` | — |

- **เหตุผลที่เลือก A:** สอด roadmap "ระวัง staleness" + tool-agnostic (ไม่ duplicate) + `docs/` ไม่อยู่ใน npm `files` อยู่แล้ว (ดู `docs/techstack/installer/structure.md`)

## 4. Scope
**In scope**
- `docs/example-walkthrough.md` (NEW) — narrative 5 stage + ลิงก์ artifact + disclaimer
- `README.md` — เพิ่ม section "ตัวอย่างจริง (worked example)" ชี้ walkthrough
- topic ตัวอย่าง: `cli-legacy-warning-fix` (Q2)

**Out of scope**
- สร้างโฟลเดอร์ `examples/` / duplicate ไฟล์ achieved
- เพิ่ม `docs/` เข้า npm `files` (ไม่ ship)
- walkthrough หลายตัว (เริ่ม 1 canonical)
- แตะ `src/`, installer, playbook กลาง, payload

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบเดิมที่กระทบ:** README (เพิ่ม section — ผู้ใช้ npm เห็นด้วยเพราะ README ติด tarball) + เอกสาร `docs/` ใหม่; **ไม่แตะ code/payload** → verify-pack/test เขียวเหมือนเดิม
- **ความเสี่ยง + ลด:**
  - **narrative drift** (โครง stage เปลี่ยนอนาคต) → *ลด:* disclaimer snapshot + ชี้ `.warnyin/workflow/stages/` เป็น source ปัจจุบัน, ไม่ re-describe playbook ละเอียด
  - **ลิงก์พัง** (achieved ย้าย/เปลี่ยนชื่อ) → *ลด:* dead-link verify (VERIFY) + rerun ได้

## 6. ลิงก์
- Design (how): `./design.md` · Tasks: `./tasks/`
- Discovery: `./discovery.md` · Research: `./research.md`
