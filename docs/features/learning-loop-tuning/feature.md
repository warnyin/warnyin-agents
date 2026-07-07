# Feature — Learning Loop Tuning guidance

> ความรู้ถาวรระดับ feature · promote จาก topic `learning-loop-tuning` (achieved 2026-07-06)

## คืออะไร
**Learning Loop Tuning** = guidance ฝังใน playbook ที่มี **fix loop จริง** (BUILD full-gate, VERIFY "แก้จนผ่าน") ให้ AI agent ตัดสิน **"ปรับลำดับ/การจัดกลุ่มของการแก้"** ได้ดีขึ้นแทนการเดา — ตกผลึก insight จาก paper *"Understanding the Challenges in Iterative Generative Optimization with LLMs"* (arXiv:2603.23994v2) เป็น 2 knob:

| knob | สาระ |
|---|---|
| **credit horizon** | feed feedback แค่ไหนต่อรอบแก้ — สั้น (แก้ทีละ finding rerun ถี่) vs ยาว (รวม root-cause แก้เป็นชุด); ⚠ update ถี่เกิน→churn |
| **experience batching** | ตอน delegate fix แบ่ง failure ตาม component/root-cause; ⚠ batch ใหญ่ ≠ ดีกว่าเสมอ (task-dependent) |

เสริมด้วย **starting-artifact note** ใน DESIGN: decomposition + starting spec กำหนด "solution ที่ BUILD เอื้อมถึง"

## ทำงานยังไง
- **guidance-only ผูก tier (zero-config)** — ไม่มี knob ที่ตั้งค่าได้จริง (เลี่ยง setup-burden ที่ paper ชี้ว่าเป็นต้นเหตุ adoption ต่ำ); pattern เดียวกับ `minimalism`/`change-sizing`
- **แยกหน้าที่ (canonical-copy — ไม่ duplicate):**
  - **why + วิธีตัดสิน** เป็น **single-file canonical** ที่ `workflow/loop-tuning.md` (orchestrator-only — ผู้อ่าน = main loop ตอน fix loop มี finding >1); จุดที่ loop รันจริง (`build.md §4 step 6` + §3 item 8 · `verify.md §4 step 5` + §3 item 5) เหลือ **pointer + report requirement** _(เดิม: copy why-block ทั้ง 2 stage — เปลี่ยนเป็น single-source โดย topic `build-lean` เพื่อลด context ฝั่ง agent)_
  - **default-by-tier** (canonical เดียว) อยู่ `triage.md §2C "Loop-tuning default per tier"` — build/verify pointer มา
  - **starting-artifact note** อยู่ `design.md §4 step 7`
- **non-blocking** — C3 report note (ระบุ credit-horizon choice `per-finding | batched` + เหตุผล) อยู่**ท้าย loop ไม่ใช่ใน gate checklist** (ไม่เพิ่ม `- [ ]` — เลี่ยง hard-gate ที่ block ด้วย filled-detection)
- **guard "lazy not negligent" ของ loop** — loop tuning ปรับแค่ลำดับ/การจัดกลุ่ม **ไม่ลด correctness/test-floor** (คู่ของ config-protection)

## ขอบเขต / ข้อจำกัด
- **tool-agnostic** — vocab generic (`credit horizon`/`batching`/`per-finding`/tier) ไม่ผูกชื่อรุ่น/tool; เป็น **guidance ไม่ใช่ hard gate**
- **default = starting point ปรับได้ ไม่ lock** (escalate/downgrade ตาม triage §2B)
- **out of scope (defer):** explicit tunable knob ต่อ topic · telemetry นับรอบ→KB · knob ตัวที่ 4+ (starting-artifact เป็นแค่ note)
- **zero-dependency** — `.md` ล้วน ship ผ่าน allowlist `src/.warnyin`

## ไฟล์ที่เกี่ยวข้อง
- `src/.warnyin/workflow/loop-tuning.md` — why-guidance canonical เดียว (orchestrator-only)
- `src/.warnyin/workflow/stages/build.md` (§3 item 8, §4 step 6 — pointer + report), `stages/verify.md` (§1 hook, §3 item 5, §4 step 5 — pointer + report)
- `src/.warnyin/workflow/triage.md §2C` (default-by-tier canonical), `stages/design.md §4 step 7` (starting-artifact note)
- เทียบมิติ: `docs/features/change-sizing/` (tier ที่ default ผูก), `docs/features/build-orchestration/` (fix loop ที่ guidance ลง)
- rule: `docs/rule.md` "loop-tuning convention"
