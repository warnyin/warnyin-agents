# Proposal — Learning Loop Tuning guidance

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `learning-loop-tuning` |
| **ประเภท** | `docs` (playbook guidance) |
| **ขนาด** | `standard` |
| **วันที่** | `2026-07-05` |
| **มาจาก Discovery?** | `./discovery.md` |

## 1. สรุป change (what)
เพิ่ม **guidance กระชับ 2 knob** (credit-horizon + experience-batching) จาก paper *Iterative Generative Optimization* เข้า fix-loop principle ของ `build.md`/`verify.md` (why + วิธีตัดสิน + observable proxy) และ **default-by-tier** เข้า `triage.md` skip-list พร้อม **note starting-artifact** ใน `design.md` — ทุกไฟล์ที่ `src/.warnyin/workflow/`

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** warnyin มี learning loop จริง (BUILD full-gate fix, VERIFY "แก้จนผ่าน") แต่ "จะ feed feedback แค่ไหนต่อรอบ" และ "batch failure กี่จุดต่อการแก้" ยังฝัง/เดาเอง; paper ยืนยันเชิงประจักษ์ว่า loop-setup ที่เดาเองคือสาเหตุหลักที่ generative optimization ไม่ถูก adopt (9%)
- **ผลถ้าไม่ทำ:** agent ยังเข้า loop "แก้จุดหนึ่งพังอีกจุด" (credit-horizon สั้นเกิน update ถี่เกิน) และ "อัด failure ทั้งหมดเป็นก้อนเดียว" (batch ใหญ่ ≠ ดีกว่า) โดยไม่มี guidance

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A (แนะนำ) Guidance-only ผูก tier | zero-config, ต้นทุนต่ำ, ตรง paper (เลี่ยง over-engineer) | ไม่แม่นเท่า knob จริง | ✅ |
| B Explicit tunable knob ต่อ topic | คุมแม่น | setup burden ↑ (paper เตือนว่าเป็นต้นเหตุ 9%) | ✗ defer |
| C Full + telemetry นับรอบ | ครบ feedback-driven | over-engineer, scope ใหญ่ | ✗ defer |

- **เหตุผลที่เลือก A:** paper takeaway = "no universal setup, task-dependent" + เตือนต้นทุน knob; guidance ผูก tier ที่มีอยู่ = pattern เดียวกับ `minimalism`/`change-sizing` (zero-config, always-on)

## 4. Scope
**In scope**
- guidance credit-horizon + batching (why + วิธีตัดสิน) ใน `build.md` §3 item 8 + §4 step 6 · `verify.md` §3 item 5 + §4 step 5 — **ขยาย principle/mechanism เดิมในที่เดิม** (unify-in-place); C3 report note = non-blocking ท้าย fix loop (ไม่ใช่ gate item)
- default-by-tier ของ 2 knob ใน `triage.md` **§2C ใหม่ (Loop-tuning default per tier)** ต่อจาก §2B — ไม่ใช่ใต้ Fast-track skip-list (canonical ของ tier)
- note starting-artifact สั้นใน `design.md` (decomposition = solution ที่เอื้อมถึง)
- canonical wording block นิยามครั้งเดียวใน `design.md §2.5` ของ topic นี้ แล้ว copy ไปทุก surface (canonical-copy)

**Out of scope**
- explicit tunable knob ต่อ topic · telemetry นับรอบ→KB · แก้ root dogfood · guidance เต็มของ starting-artifact (แค่ note) · knob ตัวที่ 4+

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** `build-orchestration` (fix loop), `change-sizing` (tier skip-list) — ขยายในที่เดิม backward-compatible (guidance ไม่ใช่ hard gate ใหม่)
- **ความเสี่ยง + วิธีลด:**
  - guidance บวม → ทำลาย minimalism → **เขียนสั้น + pointer ไม่ inline ซ้ำ** (canonical-copy), review เทียบ `minimalism.md`
  - agent ไม่ทำตาม guidance subjective → **observable proxy table** (falsifiable, VERIFY assert ได้)
  - default-by-tier ขัดปรัชญา triage → **default = starting point ปรับได้ ไม่ lock** (สอด "sizing ปรับได้ทุกเมื่อ"), ไม่เพิ่ม hard gate

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Discovery: `./discovery.md` · Research: `./research.md`
