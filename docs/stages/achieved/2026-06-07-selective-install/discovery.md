# Discovery — selective-install (feasibility evaluation → DEFER)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> **ผลลัพธ์: ไม่ไป DESIGN** — Discovery เชิง evaluation สรุปว่า **re-affirm deferral** (decision record)

| | |
|---|---|
| **Slug** | `selective-install` |
| **สถานะ** | `ปิด — decision: DEFER (ไม่เข้า DESIGN)` |
| **วันที่** | 2026-06-07 |
| **ผู้ร่วมตัดสินใจ** | maintainer |
| **เริ่มจาก** | roadmap P2 #11 + `docs/rule.md` §1 (opinionated) §2 (zero-dep) |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> ประเมินความเป็นไปได้ของ "selective install (เลือกติดตั้งบาง stage/role ผ่าน manifest)" — สรุป **ไม่ทำ** (re-affirm YAGNI ด้วยหลักฐานเชิงเทคนิค ไม่ใช่แค่ gut)

## 2. Problem & Why now
- **ทำไมเปิด evaluation:** user อยากสำรวจ #11 ก่อนตัดสินถาวร (Q1 = สำรวจ, ยังไม่มี demand)
- **ผลผูก project.md/rule:** ขัด "opinionated ครบชุด" (§1) + เสี่ยง "zero-dependency" (§2)

## 3. Scope (ของ evaluation นี้)
**In scope:** feasibility (อะไรแยกได้, zero-dep schema, cost/benefit, narrow alternative) — `research.md`
**Out of scope:** สร้างจริง (ไม่เข้า DESIGN/BUILD)

## 4. Decision Log
| # | ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| Q1 | why-now (มี demand?) | มี use-case / สำรวจก่อน / override | สำรวจก่อน | **สำรวจก่อน** | ยังไม่มี demand — ทำ evaluation ไม่ผูกมัด |
| Q2 | หลังเห็น feasibility | defer(C) / profiles(B) / manifest(A) | re-affirm defer (C) | **DEFER (C)** | หลักฐาน: stage แยกไม่ได้เชิงความหมาย + zero-dep schema ขัดจุดขาย + benefit ~0 + no demand |

## 5. หลักฐานชี้ขาด (จาก `research.md`)
- **stage แยกไม่ได้** — workflow ผูกลำดับ (BUILD↔DESIGN output, SHIP↔ทุก stage); contexts ผูก 5/5, roles 4/5 → เลือกบางส่วน = workflow พัง
- **zero-dep JSON Schema เป็นไปไม่ได้สวย** — node ไม่มี validator built-in → hand-roll (โค้ดเยอะ) หรือ ajv (ทำลาย zero-dep)
- **แยกได้จริงแค่ agents(5)+skills(3)** = `.md` เล็ก → ไม่มี install-size/perf benefit
- **cost ≫ benefit** (manifest+schema+flag+partial-copy+test+docs vs ~0)

## 6. เกณฑ์ความสำเร็จ (ของ decision นี้)
- evaluation มีหลักฐานเชิงเทคนิคพอให้ตัดสินถาวร ✅ (ไม่ใช่ gut YAGNI)
- roadmap #11 note อัปเดตให้มี evidence (กัน re-litigate รอบสาม) ✅

## 7. เงื่อนไขที่จะ "rเปิดใหม่" (trigger)
ทำ #11 **เฉพาะเมื่อ** มีอย่างน้อยหนึ่ง: (ก) user/ทีมจริงขอ install บางส่วน + เหตุผลชัด, (ข) workflow โตจนมี module ที่ optional จริง (เช่น role set แยกตามภาษา) — และทำ **B (bounded profiles) ก่อน A**; **ห้าม** เอา manifest อิสระ/SQLite ของ ECC

## 8. Open questions
- (ไม่มี — evaluation ปิดครบ; decision = DEFER)

## 9. ความเสี่ยงหลัก (ถ้าฝืนทำ A)
- ผู้ใช้ติดตั้งไม่ครบ → workflow พังเงียบ (support burden) · manifest drift · zero-dep หลุด

## 10. ลิงก์
- Research (feasibility): `./research.md`
- roadmap P2 #11 · `docs/rule.md` §1 §2

---

## ✅ Gate → ปิด topic (decision: DEFER — ไม่เข้า DESIGN)
- [x] Problem/why-now ชัด (evaluation, ผูก rule §1/§2)
- [x] Scope ชัด (feasibility เท่านั้น)
- [x] Decision log ปิดครบ (Q1/Q2) — decision = DEFER มีหลักฐาน
- [x] success criteria (evaluation พอตัดสิน + roadmap note evidence)
- [x] ความเสี่ยง/เงื่อนไข reเปิด บันทึก
- [x] user ยืนยัน DEFER
