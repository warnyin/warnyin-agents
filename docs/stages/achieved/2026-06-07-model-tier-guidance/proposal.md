# Proposal — model-tier-guidance

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Slug** | `model-tier-guidance` |
| **ประเภท** | `feature` (playbook payload `.md`) |
| **ขนาด** | `เล็ก` |
| **วันที่** | 2026-06-07 |
| **มาจาก Discovery?** | `./discovery.md` (Q1–Q3 ปิด) |

## 1. สรุป change (what)
เพิ่ม **1 บรรทัด "Model tier"** ใน section "Tool preference" ของ `contexts/{research,build,review}.md` (generic tier: deepest/balanced/cheap — ไม่ผูกชื่อรุ่น) + อัปเดต `contexts/README.md` (โครง card item 3 + legend tier) — guidance ว่า posture ไหนใช้ model ระดับไหน เพื่อคุม token/cost; **unify-in-place** ไม่แตะ 5 stage

## 2. ทำไม (why)
- **โอกาส:** ECC #1 (token optimization) — feasibility ชี้ว่า model-tier guidance **คุ้มหยิบ** (low-cost, fit, ต่อยอด context-profile); ปิด gap ส่วนที่ portable
- **ผลถ้าไม่ทำ:** ไม่มี hint ระดับ workflow ว่า stage ไหนคุ้มใช้ tier ไหน (ปล่อยให้แต่ละ harness/ผู้ใช้เดาเอง)

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. contexts/ Tool preference (generic tier) | unify-in-place, tool-agnostic, ไม่ duplicate | — | ✅ (Q1/Q3) |
| B. per-stage callout | ใกล้ stage | duplicate (research×2 stage) | — |
| C. ผูกชื่อรุ่น (Opus/Sonnet/Haiku) | ชัดเจน | ขัด tool-agnostic (§1) | — |

- **เหตุผล A:** generic tier ใช้ได้ทุก harness; contexts มี "Tool preference" อยู่แล้ว = ที่ลงตัว

## 4. Scope
**In scope**
- `contexts/research.md` Tool preference: +Model tier = **deepest reasoning**
- `contexts/build.md` Tool preference: +Model tier = **balanced** (orchestrator) + worker note → **cheap**
- `contexts/review.md` Tool preference: +Model tier = **balanced+** (ไม่ลด)
- `contexts/README.md`: โครง card item 3 mention model-tier + legend (generic vocab + ตาราง context↔tier)

**Out of scope**
- แตะ 5 stage playbook (ชี้ context อยู่แล้ว)
- per-stage callout / ไฟล์ tiers แยก / matrix context×role
- ผูกชื่อรุ่น harness · enforce/code

## 5. ผลกระทบ & ความเสี่ยง
- **กระทบ:** payload `contexts/` (ติดมากับ `--update` รอบถัดไป) — `.md` ล้วน, ไม่กระทบ installer/test/behavior
- **ความเสี่ยง + ลด:** model name drift → generic vocab (ไม่ผูกรุ่น) · prescriptive เกิน → "guidance" (ควร/ลดได้) ไม่ enforce · catalog creep → 3 tier คงที่ + worker note บรรทัดเดียว

## 6. ลิงก์
- Design: `./design.md` · Discovery/Research: `./discovery.md` `./research.md`
- precedent: `contexts/` (#5 context-profiles)
