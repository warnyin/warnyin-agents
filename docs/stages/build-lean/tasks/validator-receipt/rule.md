# Rule — validator-receipt

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก `docs/rule.md`)

- [ ] **#21 structural validator: ✖ ไม่พึ่ง filled-detection** — เช็คระดับ ✖ ต้องเป็น existence/structure ล้วน; เช็คที่พึ่ง heuristic "เติมแล้วหรือยัง" ต้องเป็น ⚠ เท่านั้น → **fast-mode detection ใช้ `isFilled` (H1-heuristic) ได้** เพราะเป็น pattern เดิมที่ sanction แล้ว (C1/C4 ใช้อยู่) และผลของมัน**ไม่สร้าง ✖ ใหม่** — มีแต่ *ข้าม* เช็ค (fast) หรือ *เพิ่ม ⚠* (mixed); **mixed-state ต้องเป็น ⚠ ห้ามเป็น ✖** และเมื่อ ambiguous ให้ fail-safe ไปทาง full checks (รันเช็คครบ ไม่ใช่ข้าม)
- [ ] **#79 source/dogfood แยกชั้นเด็ดขาด** — แก้เฉพาะ `src/**`; ห้ามแตะ root `.warnyin/`/`.claude/` (dogfood gitignored — git ไม่เห็น แก้ไปก็หาย); regression run ใช้ script จาก `src/` ตรง
- [ ] **#74 (test)** — gate ใช้ bare `node --test` (auto-discover) ห้ามใส่ path/glob arg ตัดสินผล (path arg ใช้ได้เฉพาะรันเจาะระหว่าง dev)
- [ ] **security ของ validator (header script + design §4.4 เดิม)** — เฉพาะ `node:fs/path/url`, ไม่ echo เนื้อ artifact, error ไม่ leak absolute path, slug whitelist เดิมห้ามผ่อน
- [ ] **ห้ามแก้ assertion/logic ที่เคสเดิม cover** — backward compatible คือ acceptance หลักของ slice นี้ (design §4.2: "receipt ไม่มี/ยัง template → พฤติกรรมเดิมทุกประการ")

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

- [ ] rule ที่เสนอ: **mode inference ของ validator ต้อง fail-safe ไปทาง full checks** — เงื่อนไขเข้า lean/fast mode ต้องเป็น conjunction ชัดเจน (ทุกข้อจริง) และสถานะก้ำกึ่ง/ปนกัน → รันเช็คเต็ม + ⚠ บอกผู้ใช้ ไม่ใช่ข้ามเช็คเงียบๆ — เหตุผล: ทิศ fail เดียวกับ #21 และ change-sizing (#26 "ก้ำกึ่ง → ปัดขึ้น standard") — การข้ามเช็คผิดตัวอันตรายกว่าเช็คเกิน; evidence: mixed-state ใน task นี้
