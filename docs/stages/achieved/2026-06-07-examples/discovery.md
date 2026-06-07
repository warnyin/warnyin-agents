# Discovery — examples (worked example สำหรับผู้ใช้ใหม่)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `examples` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-07 |
| **ผู้ร่วมตัดสินใจ** | maintainer |
| **เริ่มจาก** | `docs/project.md` (persona "ผู้ใช้ปลายทาง/contributor") + roadmap P2 #10 |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> ทำ **worked example เดินครบ 5 stage** ให้ **ผู้ใช้ใหม่** เห็นว่า artifact จริงหน้าตาเป็นยังไง (ไม่ใช่แค่ template เปล่า) โดย **surface achieved topic เดิม** ผ่าน narrative walkthrough — ไม่ duplicate, ไม่ ship ไฟล์

## 2. Problem & Why now
- **ปัญหา/โอกาส:** ผู้ใช้ใหม่ที่ `npx @warnyin/agents` ได้แค่ template `[topic]/` **เปล่า** — ไม่เห็นตัวอย่าง output จริงว่า discovery/design/build/verify/ship ที่ "ทำดีแล้ว" หน้าตาเป็นยังไง; เรามี achieved 9 topic จริงแต่ไม่มีจุด onboard ให้ดู
- **ทำไมตอนนี้:** roadmap P2 #10 เตือน "ทำเมื่อ workflow นิ่ง" — P0+P1 ครบแล้ว, โครง stage นิ่ง → เหมาะ
- **ผูกกับ project.md:** เป้าหมาย "ติดตั้งแล้วใช้ครบ 5 stage โดยไม่ต้องตั้งค่าเพิ่ม" — worked example ลดแรงเสียดทาน onboarding (persona ผู้ใช้ปลายทาง + contributor)

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- `docs/example-walkthrough.md` — narrative ไล่ 5 stage ของ topic `cli-legacy-warning-fix` + ลิงก์ไฟล์จริงใน `docs/stages/achieved/2026-06-07-cli-legacy-warning-fix/`
- README — เพิ่ม section สั้นชี้ไป walkthrough
- **disclaimer** ใน walkthrough: เป็น snapshot ณ วันที่ + ชี้ `.warnyin/workflow/stages/` เป็น source ปัจจุบัน
- VERIFY: dead-link check (ลิงก์ทั้งหมดไป achieved/ + playbook resolve จริง)

**Out of scope (จะไม่ทำในรอบนี้)**
- สร้างโฟลเดอร์ `examples/` แยก / duplicate ไฟล์ achieved (Q1)
- ใส่ example ลง npm package `files` (ไม่ ship — ผู้ใช้ดูบน GitHub)
- เขียน topic ตัวอย่าง "สังเคราะห์" ใหม่ (ใช้ของจริงที่มี)
- walkthrough หลายตัว (เริ่ม 1 ตัว canonical ก่อน)

## 4. Decision Log
| # | ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| 1 | รูปร่าง example | surface achieved / examples ship / examples repo-only | surface achieved | **surface achieved** | ไม่ duplicate, ไม่ ship, maintenance ต่ำสุด (สอด roadmap "ระวัง staleness") |
| 2 | topic ไหนเป็น canonical | cli-legacy-warning-fix / skill-format / context-profiles | cli-legacy-warning-fix | **cli-legacy-warning-fix** | ครบ 5 stage + code+test จริง + กระทัดรัด (1 task สะอาด, VERIFY ผ่าน 0 รอบ) ไม่ล้นหลาม |
| 3 | walkthrough อยู่ไหน | docs+README pointer / README เดียว / docs เดียว | docs + README pointer | **docs + README pointer** | README ลีน, doc โฟกัส, มีจุด onboard |
| 4 | กัน staleness | disclaimer+dead-link / +CONTRIBUTING note / disclaimer เดียว | disclaimer + dead-link verify | **disclaimer + dead-link verify** | achieved freeze แล้ว (ไฟล์ไม่เปลี่ยน); disclaimer กัน narrative drift + dead-link กันลิงก์พัง — effort ต่ำ |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** achieved topic เป็น snapshot ถาวร (ไม่ถูกแก้) → ลิงก์เสถียร; ผู้ใช้ใหม่เข้าถึง GitHub ได้
- **ข้อจำกัด:** docs-only (ไม่แตะ `src/`, installer, npm payload); README อยู่ใน npm `files` (แก้ section ได้ ไม่กระทบ payload)

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- `docs/example-walkthrough.md` ไล่ครบ 5 stage + ลิงก์ artifact จริงทุก stage (discovery→ship) + 1 task
- README มี section ชี้ walkthrough
- **dead-link = 0** (ทุกลิงก์ไป achieved/ + playbook resolve)
- มี disclaimer (snapshot + pointer playbook ปัจจุบัน)
- ไม่แตะ `src/` / npm payload (verify-pack เขียวเหมือนเดิม)

## 7. Feature ideas / ทางเลือกของวิธีแก้ (ส่งต่อ DESIGN)
- walkthrough เป็นตารางต่อ stage: stage · สิ่งที่ตัดสิน/ทำ · ลิงก์ artifact · gate ที่ผ่าน
- เน้น "ทำไมตัดสินใจแบบนั้น" (decision) ไม่ใช่แค่ลิสต์ไฟล์ — สอน reasoning ของ workflow

## 8. Open questions
- (ไม่มี — ปิดครบใน Q1–Q4)

## 9. ความเสี่ยงหลัก
- **narrative drift** เมื่อโครง stage เปลี่ยนอนาคต → ลด: disclaimer snapshot + ชี้ playbook ปัจจุบัน (ไม่ describe playbook ซ้ำ)
- **ลิงก์พัง** ถ้า achieved ถูกย้าย/เปลี่ยนชื่อ → ลด: dead-link verify ใน VERIFY (+ rerun ได้)

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- เอกสารโปรเจกต์: `docs/project.md`, `docs/roadmap.md` (P2 #10)
- ตัวอย่างที่ใช้: `docs/stages/achieved/2026-06-07-cli-legacy-warning-fix/` (ครบ 13 ไฟล์ + 1 task)

---

## ✅ Gate → DESIGN
- [x] Problem / why-now ชัด ผูกกับ project.md (onboarding + roadmap P2 #10)
- [x] Scope in/out ชัด (surface achieved, docs-only, 1 canonical)
- [x] Decision log ปิดครบ (Q1–Q4) ไม่มี open question ที่ block
- [x] success criteria วัดผลได้ (5 stage links + dead-link 0 + disclaimer)
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (รอยืนยัน)
