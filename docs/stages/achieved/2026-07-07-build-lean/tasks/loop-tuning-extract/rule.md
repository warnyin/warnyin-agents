# Rule — loop-tuning-extract

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)

> ดึงจาก `docs/rule.md` (อ้างเลขบรรทัด) — เฉพาะข้อที่เกี่ยวกับ task นี้

- [ ] **canonical-copy convention** (`docs/rule.md` บรรทัด 18) — ความรู้ชุดเดียวที่กระจายหลายไฟล์ต้องมี canonical ที่เดียว ที่เหลือเป็น pointer บาง: **หลัง task นี้ `loop-tuning.md` กลายเป็น canonical ใหม่ของ why-guidance** (แทน canonical-copy 2 stage เดิม) — เนื้อ theory ในไฟล์ใหม่ต้อง **copy จาก block เดิมคำต่อคำในสาระ ห้ามแต่งใหม่**; ตาราง default-by-tier คง canonical ที่ `triage.md §2C` (ห้ามย้าย/copy เข้าไฟล์ใหม่)
- [ ] **loop-tuning convention** (`docs/rule.md` บรรทัด 35) — เคารพแก่นทั้ง 6 ข้อของ convention: guidance-only ไม่ทำ knob จริง · ⚠ ทั้งสองตัวคงอยู่ · **"ปรับแค่ sequencing ไม่ลด correctness/test-floor" ต้องคงชัดในไฟล์ใหม่** (คู่ config-protection) · report note เป็น non-blocking (wording report **ไม่ย้าย** มาไฟล์นี้ — อยู่ `build.md`/`verify.md` ชี้ด้วย pointer) · default ไม่รั่วออกจาก triage
- [ ] **source/dogfood แยกชั้นเด็ดขาด** (`docs/rule.md` บรรทัด 79) — แก้เฉพาะ `src/**`; **ห้ามสร้าง/แตะไฟล์ใน root `.warnyin/`** (dogfood, gitignored — git ไม่เห็น จะหายตอน sync); ตรวจได้ด้วย `git status` เห็นไฟล์ใหม่ใต้ `src/` เท่านั้น
- [ ] **ขอบเขตเจ้าของไฟล์ (จาก design §7):** สร้าง `src/.warnyin/workflow/loop-tuning.md` ไฟล์เดียว — ห้ามแตะ `build.md`/`verify.md`/`triage.md` แม้เห็นว่า block เดิมซ้ำกับไฟล์ใหม่ (การลบ = wave 2, repoint §2C = task `fast-track-receipt`)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

> ห้ามแก้ `docs/rule.md` ตอนนี้ — แค่ note ไว้ก่อน ถึง SHIP ค่อยพิจารณาย้ายขึ้นไป

- [ ] rule ที่เสนอ: **อัปเดต wording ของ loop-tuning convention (`docs/rule.md` บรรทัด 35) ข้อ (3)** — จาก "why อยู่จุดที่ loop รัน (`build.md §4 step 6` / `verify.md §4 step 5`), canonical-copy 2 stage" → เป็น "why canonical เดียวที่ `workflow/loop-tuning.md` (orchestrator-only); จุดที่ loop รันเหลือ pointer + report requirement" — เหตุผล: หลัง topic นี้ ship โครงจริงเปลี่ยนจาก canonical-copy 2 ที่ เป็น single-file canonical; ถ้าไม่อัปเดต rule กลางจะชี้ตำแหน่ง theory ผิด (ขัด investigate-before-edit ของคนอ่าน rule ภายหลัง) — สอดกับ MODIFIED learning-loop-tuning ใน design §9 ที่ SHIP ต้อง merge เข้า `docs/features/learning-loop-tuning/spec.md` อยู่แล้ว
