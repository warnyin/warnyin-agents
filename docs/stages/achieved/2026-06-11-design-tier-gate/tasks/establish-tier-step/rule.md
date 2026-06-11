# Rule — establish-tier-step

## 1. Rule ที่ต้อง follow
- **unify-in-place** (`docs/rule.md §1`) — ขยาย §4/§7 เดิม ไม่สร้างกลไกขนาน
- **canonical-copy / ไม่ duplicate** (`docs/rule.md §1`) — rubric อยู่ `triage.md` เดียว; design.md ชี้ pointer ไม่ลอก signals/hard-floor/tier table
- **change-sizing เป็น judgment router (⚠ ไม่ใช่ ✖)** (`docs/rule.md §1`) — establish-tier เป็น guidance ให้ AI ประเมิน + ถาม user เมื่อก้ำกึ่ง; **ไม่ทำ mechanical ✖** ใน validator; hard-floor บังคับ ≥ standard คงไว้
- **structural validator: ✖ ไม่พึ่ง filled-detection** (`docs/rule.md §1`) — ไม่เพิ่ม check ใน `validate-topic.mjs` ว่า "proposal ระบุ tier แล้วหรือยัง" (tier = judgment)
- **tool-agnostic** — wording generic; "ถาม user เป็น options" (ไม่ผูก AskUserQuestion เป็นข้อบังคับ — เครื่องอื่นถามด้วยวิธีตัวเอง)
- **กระทัดรัด opinionated** — step สั้น
- **mirror layout** — แก้ `src/.warnyin/` เท่านั้น

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] — (ไม่มี; ใช้ change-sizing + unify-in-place + canonical-copy เดิม — establish-tier เป็น enforcement ของ rule ที่มีอยู่แล้ว)
