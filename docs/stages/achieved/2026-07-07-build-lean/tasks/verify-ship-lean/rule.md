# Rule — verify-ship-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)
> ดึงจาก `docs/rule.md` — เฉพาะข้อที่เกี่ยวกับ task นี้ (เลข = บรรทัดใน `docs/rule.md`)

- [ ] **canonical-copy convention** (`docs/rule.md:18`) — wording block loop-tuning นิยาม canonical ที่ `design.md §4.5` ของ topic แล้ว **copy คำต่อคำ** ลง `verify.md` (คู่กับ `build.md` ของ slice 2) — ห้ามแต่งใหม่ต่อไฟล์; skip-list canonical อยู่ `triage.md` — hook เป็น pointer บาง
- [ ] **investigate-before-edit** (`docs/rule.md:12`) — ก่อนแก้ hook/block ต้องหา anchor ตาม quote ใน `task.md §3` แล้วเข้าใจว่าใครอ้างถึง (บรรทัด 15 proxy note ชี้ §4 ข้อ 5, Gate §6 อ้าง test.md/verify.md, spec learning-loop-tuning grep report lines) — แก้ in-place ไม่เพิ่มซ้อน
- [ ] **source/dogfood แยกชั้นเด็ดขาด** (`docs/rule.md:79`) — แก้เฉพาะ `src/**`; root `.warnyin/`/`.claude/` เป็น dogfood gitignored ห้ามแตะ
- [ ] **change-sizing: fast-track ลดเฉพาะ ceremony ไม่ลด correctness** (`docs/rule.md:26`) — hook ใหม่ต้องคง correctness floor ชัดในตัว: VERIFY "test ต้องเขียวจริง" · SHIP "receipt ครบทุก section + archive ครบ + ไม่แตะ rule กลางมั่ว" + hard-floor 5 หมวดบังคับ upgrade (ห้ามงานอ่อนไหวเดิน ship-lite)
- [ ] **loop-tuning convention** (`docs/rule.md:35`) — regression ที่ห้ามพัง: gate `verify.md §6` item count เท่าเดิม (report note = non-blocking ไม่ใช่ gate `- [ ]`) + enum `per-finding | batched` + "เหตุผล 1 บรรทัด" คงคำเดิม + ตาราง default-by-tier ไม่รั่วเข้า verify/ship (อยู่ `triage.md §2C` ที่เดียว)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/techstack/.../rule.md` ตอนนี้ — แค่ note ไว้ก่อน ถึง SHIP ค่อยพิจารณาย้ายขึ้นไป

- [ ] rule ที่เสนอ: **stage hook = MODIFY in-place เท่านั้น** — hook conditional ต่อ stage (เช่น ★ fast-track hook) มีได้ 1 อันต่อไฟล์; เปลี่ยนพฤติกรรม tier → แก้ hook เดิม ห้ามเพิ่ม hook ใหม่ซ้อน (grep count = 1 เป็น acceptance ได้) — เหตุผล: เป็น instance เฉพาะของ unify-in-place ที่จับได้ด้วย grep; **เสนอแบบมีเงื่อนไข** — ถ้า SHIP เห็นว่า unify-in-place (`docs/rule.md:17`) ครอบอยู่แล้ว ให้ตัดทิ้งได้ (evidence: task นี้ + hook เดียวกันใน build.md slice 2)
