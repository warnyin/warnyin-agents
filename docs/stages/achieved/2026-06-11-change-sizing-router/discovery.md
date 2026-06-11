# Discovery — change-sizing-router

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `change-sizing-router` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-10 |
| **ผู้ร่วมตัดสินใจ** | smf.claude (เจ้าของโปรเจกต์) |
| **เริ่มจาก** | `docs/project.md` (project = ตัว workflow เอง — dogfood ตรง) |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> ระบบ **ประเมินขนาด (sizing) ของ change ตั้งแต่ต้น** ผ่าน command ใหม่ `/warnyin:triage` (read-only) → จัดเป็น **3 tier (fast / standard / large)** → **แนะนำ route ที่เหมาะ**: งานเล็ก (fix/แก้นิดหน่อย) เดิน **fast-track** (lean ceremony) ให้ไวขึ้น · งานกลาง flow เต็มปัจจุบัน · งานใหญ่บังคับ Discovery — โดยมี **hard floor** กันงานอ่อนไหว fast + **escalate ได้ตลอด** + คง correctness floor (test เขียว)

## 2. Problem & Why now
- **ปัญหา:** workflow มีเส้นทางเดียว ceremony เท่ากันหมด → งานเล็ก (typo/bugfix) จ่าย overhead เกิน (เดินครบ 4 stateful command + gate/panel); งานใหญ่ไม่มี trigger บังคับ Discovery
- **ทำไมตอนนี้:** เพิ่ง ship `build-orchestration` (0.11.0) — sizing เป็น **ต้นน้ำ** ป้อน model tier + DAG width ต่อยอดพอดี
- **ผูก project.md:** ตรง "กระทัดรัด opinionated" + ลด overhead ให้ workflow คล่องขึ้น

## 3. Ground — seed ที่มีอยู่
- `design.md §7` "ปรับความละเอียดตามขนาด" = 2 ระดับหยาบ, manual, ประเมินใน DESIGN (จ่าย ceremony ไปแล้ว)
- Discovery/business.md = optional ; `next.md` = router ตาม **stage ที่ค้าง** ไม่ใช่ตามขนาด request ใหม่

## 4. Decision Log (เดินทีละกิ่ง)
| # | ประเด็น | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|
| Q1 | scope ambition | MVP assess+fast-track | **MVP: assess + fast-track งานเล็ก** | โฟกัสคุณค่าสูงสุด, escalate ได้, full flow เดิมงานใหญ่ — ขยายทีหลัง |
| Q2 | taxonomy granularity | 3 ระดับ 1 มิติ | **fast / standard / large** | กระทัดรัด, ชนิดงานเป็นสัญญาณ/ตัวอย่างไม่ใช่แกนแยก |
| Q3 | จุดประเมิน | ขยาย next | **command ใหม่ `/warnyin:triage`** (read-only) | surface ชัดสำหรับ new change by size; ต่างจาก `next` (route topic เดิม by stage) |
| Q4 | fast-track mechanism | lean แต่ละ stage | **lean ceremony, reuse command เดิม** | fast = ข้าม business/panel/dry-run, 1 task, cheap tier, verify/ship-lite; gate ขั้นต่ำ (test) ยังอยู่ |
| Q5 | safety floor | hard floor + escalate | **Hard floor (auth/data-migration/secret/public-API/contract → ≥ standard) + escalate ได้ตลอด** | กัน typo-fix อันตราย; เริ่ม fast แล้ว upgrade ได้ |
| Q6 | success criteria | structural + empirical | **structural gate + empirical demo + วัด wall-clock** (fast vs standard) | dogfood ได้; wall-clock = informational (non-deterministic) |

## 5. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- `/warnyin:triage` command (read-only): รับคำอธิบาย change → ประเมิน tier (fast/standard/large) ด้วย heuristic + แนะนำ route → **หยุด ให้ user สั่ง** (เหมือน `next`)
- **Sizing rubric** ใน playbook: 3 tier + สัญญาณประเมิน (#ไฟล์/#component, new-vs-modify, cross-cutting) + **hard-floor list** (พื้นที่อ่อนไหว → ≥ standard)
- **Fast-track spec**: reframe `design.md §7` (2-level → 3-tier) + **skip-list ต่อ stage** ของ tier fast (ข้าม business/panel/dry-run, 1 task, cheap tier, verify/ship-lite) — gate floor (test เขียว) คงไว้
- **Escalation guidance**: เริ่ม fast → พบว่าใหญ่กว่า → upgrade tier ได้ทุกเมื่อ
- ทำให้ความสัมพันธ์ `triage` ↔ `next` ชัด (triage = new change by size; next = topic เดิม by stage)
- empirical demo: bugfix 1 เคส ผ่าน fast-track เทียบ standard (วัด #artifact/#step + wall-clock)

**Out of scope (จะไม่ทำรอบนี้)**
- กลไก decompose งาน L/XL เป็น epic/หลาย topic อัตโนมัติ (large tier แค่ route ไป "Discovery บังคับ" — decompose เต็มเลื่อน)
- 2 มิติ size × type matrix (ใช้ 1 มิติ + ชนิดเป็นสัญญาณ)
- command รวม `/warnyin:quick` one-shot (collapse gate — เสี่ยง mis-size)
- auto-execution (triage แนะนำเท่านั้น ไม่รันเอง)

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- triage rubric (3 tier + สัญญาณ + hard-floor) มีจริงใน playbook · `validate-topic`/`lint:md` ผ่าน
- fast-track **skip-list ต่อ stage** documented · fast ข้าม ceremony ≥3 รายการเทียบ standard (observable)
- hard-floor: เคส sensitive → rubric บังคับ ≥ standard (พิสูจน์ด้วยตัวอย่าง)
- **empirical:** bugfix 1 เคสเดิน fast-track → #stage-artifact/#step น้อยกว่า standard + **wall-clock fast < standard** (informational)

## 7. สมมติฐาน & ข้อจำกัด
- topic = payload `.md` + 1 command (`triage`) — zero-dep, tool-agnostic (command = adapter บางชี้ playbook)
- triage = **judgment heuristic (⚠ ไม่ใช่ ✖)** สอด philosophy "structural validator ✖ ไม่พึ่ง filled-detection"
- reuse command เดิมสำหรับ execution (ไม่เพิ่ม heavy command)

## 8. Feature ideas → ส่งต่อ DESIGN
- `triage` command + playbook `triage.md` (sizing rubric: tier/สัญญาณ/hard-floor/escalation)
- reframe `design.md §7` → 3-tier + skip-list ต่อ stage
- ผูก build-orchestration: fast → model tier `cheap` + 1 task (DAG width 1)
- triage↔next: อาจให้ triage ชี้ next หลังเลือก route

## 9. ความเสี่ยงหลัก
- **mis-size** → escalation ต้องถูก+ง่าย (คุมด้วย hard-floor + escalate-anytime)
- **command proliferation** → triage เป็น surface ใหม่เดียว, execution reuse ของเดิม
- **fast ลด correctness** → gate floor (test เขียว) + hard-floor พื้นที่อ่อนไหว

## 10. ลิงก์
- Research: `./research.md` · `docs/project.md` · seed `src/.warnyin/workflow/stages/design.md §7`, `next.md`
- ต่อยอด: feature `build-orchestration` (achieved 2026-06-10-improve-performance)

---

## ✅ Gate → DESIGN
- [x] Problem/why-now ชัด ผูก project.md
- [x] Scope in/out ชัด
- [x] Decision log ปิด 6 ประเด็น — ไม่มี open question ที่ block
- [x] success criteria วัดผลได้ (structural + empirical + wall-clock)
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] **user ยืนยัน "เข้าใจตรงกันแล้ว"** (2026-06-10)
