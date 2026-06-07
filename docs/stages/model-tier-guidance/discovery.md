# Discovery — model-tier-guidance

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `model-tier-guidance` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-07 |
| **ผู้ร่วมตัดสินใจ** | maintainer |
| **เริ่มจาก** | feasibility eval ECC #1 (token optimization) + `docs/rule.md` §1 (tool-agnostic/opinionated) + context-profiles (#5) |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> เพิ่ม **model-tier guidance** (generic: deepest/balanced/cheap — ไม่ผูกชื่อรุ่น) ลงใน section "Tool preference" ของ context profile 3 ตัว เพื่อแนะนำว่า posture/stage ไหนควรใช้ model ระดับไหน — คุม token/cost โดย **unify-in-place** (ไม่สร้างกลไกใหม่)

## 2. Problem & Why now
- **โอกาส:** ECC #1 (token optimization) — model selection เป็นด้านที่เรามีบางส่วน (codemap-lean) แต่ขาด "guidance ว่า stage ไหนใช้ tier ไหน"; feasibility ชี้ว่าอันนี้ **คุ้มหยิบ** (low-cost, fit, ต่อยอด context-profile)
- **ทำไมตอนนี้:** roadmap หลักจบ → หยิบ improvement "แทบฟรี" แบบ #5; ปิด gap #1 ส่วนที่ portable
- **ผูก rule:** §1 tool-agnostic (generic tier ใช้ได้ทุก harness) + opinionated (3 tier ไม่เป็น catalog) + unify-in-place

## 3. Scope (กว้าง → แคบ)
**In scope**
- เพิ่ม 1 บรรทัด **model-tier** ใน "Tool preference" ของ `contexts/{research,build,review}.md`
  - research = **deepest reasoning** (exploration/architecture/decision)
  - build = **balanced** (orchestrator) + note: fan-out worker ที่ทำ task เชิงกลไก → **cheap** ได้
  - review = **balanced+** (skeptical, จับ bug — ไม่ลด)
- อัปเดต `contexts/README.md` ถ้าอธิบายโครง 4-section (mention model-tier เป็นส่วนของ Tool preference)
- vocab **generic** (deepest/balanced/cheap) — ไม่ผูกชื่อรุ่น (Claude/Opus/...)

**Out of scope**
- แตะ 5 stage playbook (stage ชี้ context อยู่แล้ว — กัน duplicate)
- per-stage callout / ไฟล์ tiers แยก (Q1)
- matrix context×role (Q2 — over-engineer)
- enforce/code (เป็น guidance `.md` ล้วน)
- ผูกชื่อรุ่น harness เฉพาะ

## 4. Decision Log
| # | ประเด็น | ทางเลือก | แนะนำ | เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| Q1 | placement | contexts Tool preference / per-stage / ไฟล์แยก | contexts | **contexts/ Tool preference** | unify-in-place; stage ชี้ context แล้ว ไม่ duplicate |
| Q2 | granularity | per-context+worker note / per-context ล้วน / matrix | +worker note | **per-context + worker note** | จับ cost-saving ของ fan-out worker โดยไม่ bloat |
| Q3 | vocab | generic tier / ชื่อรุ่น | generic | **generic (deepest/balanced/cheap)** | tool-agnostic — ใช้ได้ทุก harness (รหัส §1) |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** harness ตี generic tier เป็นรุ่นจริงเองได้ (เหมือน performance.md ของ user)
- **ข้อจำกัด:** payload tool-agnostic (ห้ามผูกชื่อรุ่น) · `.md` ล้วน (ไม่ enforce) · ไม่ duplicate (ชี้กลับ posture)

## 6. เกณฑ์ความสำเร็จ
- 3 context มี model-tier line ใน Tool preference (generic tier + worker note ใน build)
- ไม่แตะ 5 stage; ไม่ผูกชื่อรุ่น (grep ไม่เจอ Opus/Sonnet/Haiku ใน payload)
- `contexts/README.md` สอดคล้อง (ถ้าอธิบายโครง)
- dead-link 0 (lint-md) · npm test เขียว (ไม่กระทบ)

## 7. Feature ideas (ส่งต่อ DESIGN)
- เสริม mapping ตัวอย่างใน README: stage → context → model-tier (research→deepest ฯลฯ) แบบตาราง

## 8. Open questions
- (ไม่มี — Q1–Q3 ปิด)

## 9. ความเสี่ยงหลัก
- model name drift → generic vocab · prescriptive เกิน → guidance ("ควร/ลดได้") ไม่ enforce

## 10. ลิงก์
- Research: `./research.md` · feasibility: `docs/stages/achieved/2026-06-07-selective-install/` (แนวประเมิน)
- precedent: `contexts/` (#5 context-profiles), `docs/rule.md` §1

---

## ✅ Gate → DESIGN
- [x] Problem/why-now ชัด ผูก rule §1 + ECC #1 feasibility
- [x] Scope in/out ชัด (3 context, generic, ไม่แตะ stage)
- [x] Decision log ปิดครบ (Q1–Q3) ไม่มี open question
- [x] success criteria วัดได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง ครบ
- [x] user ยืนยัน (รอ)
