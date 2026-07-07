# Rule — fast-track-receipt

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก `docs/rule.md` + `docs/techstack/installer/rule.md`)

- [ ] **canonical-copy convention** (`docs/rule.md` §1 #18) — skip-list/caps/route นิยาม canonical ที่ design `§4.1` แล้ว copy คำต่อคำลง `triage.md`; ไฟล์อื่นเป็น pointer บาง ห้ามแต่ง wording ใหม่ต่อไฟล์
- [ ] **structural validator: ✖ ไม่พึ่ง filled-detection** (`docs/rule.md` §1 #21) — สิ่งที่ task นี้วาง (receipt existence, template ≤40 บรรทัด) ต้องเช็คได้แบบ existence/structure ล้วน; อย่าเขียน guidance ใน playbook ที่บังคับ gate ด้วย heuristic "เติมแล้วหรือยัง"
- [ ] **src→root sync-gap** (`docs/rule.md` §1 #20) — canonical tracked = `src/` เท่านั้น; root `.warnyin/`/`.claude/` เป็น dogfood gitignored — **ห้ามแก้ไฟล์ root โดยตรง** (git ไม่เห็น) แก้ที่ `src/**` เท่านั้น
- [ ] **unify-in-place ไม่สร้างกลไกขนาน** (`docs/rule.md` §1 #17) — fast path/exclusion-precedence = ขยาย section เดิมใน `stages/design.md` (§4 / §7 / detect / Gate §8) ไม่เพิ่มไฟล์หรือ gate ใหม่ขนาน
- [ ] **source/dogfood แยกชั้นเด็ดขาด** (`docs/rule.md` §6) — commit เฉพาะ `src/**`; ตรวจ `git check-ignore` ถ้าสงสัยว่าไฟล์เป็น dogfood
- [ ] **tool-agnostic / adapter บาง** (`docs/rule.md` §1) — logic fast-track อยู่ playbook กลาง (`triage.md` + `stages/design.md`); `.claude/commands/warnyin/design.md` แค่ชี้กลับ ไม่ผูก vocab ของ harness/ชื่อรุ่น
- [ ] **test installer = black-box spawn** (`docs/rule.md` §5 + techstack) — assertion ใหม่ spawn cli จริง assert side-effect; ห้าม import logic จาก `cli.mjs`

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

- [ ] rule ที่เสนอ: **"template ระดับ stage ที่ห้ามติด whole-folder copy → วางนอก `[topic]/` (top-level ใน `template/stages/`)"** — เหตุผล: template ใต้ `[topic]/` ถูก copy ทั้งโฟลเดอร์ทุกครั้งที่เปิด topic → ทุก topic จะมี `receipt.md` ติดไปด้วย ทำให้ validator ตีความเป็น fast-track ผิด (design review SA B1/QA B3 ของ topic นี้ = evidence); เป็นคู่ของ rule เดิม "template ระดับ feature ต้องอยู่ใต้ `[...]`" (`docs/techstack/installer/rule.md` seedDocs-skip invariant) — ฝั่งนี้ครอบทิศกลับ: ไฟล์ที่ต้อง copy **แบบเลือกเอง** ต้องอยู่นอกโฟลเดอร์ที่ถูก copy เหมา
