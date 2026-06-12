# Rule — feedback-registration

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack + `docs/rule.md`)
> ดึงเฉพาะข้อที่เกี่ยวกับ task นี้ (registry/doc edit ของ installer)
- [ ] **CHANGELOG ทุก user-facing change** (`docs/rule.md §2`) — เพิ่ม command ใหม่ = user-facing → ต้องมี entry ใน `CHANGELOG.md` (Keep a Changelog) ให้ผู้ใช้ npm migrate เองได้โดยไม่ต้องเดา
- [ ] **canonical tracked = `src/` เท่านั้น** (`docs/rule.md §6` src→root sync-gap) — `README.md` ของ payload แก้ที่ `src/.warnyin/workflow/README.md` (canonical, committed); **ห้ามแก้ root `.warnyin/` dogfood** (gitignored — git ไม่เห็น). ส่วน `CLAUDE.md`/`CHANGELOG.md` ที่ **root เป็นไฟล์ repo committed** (ไม่ใช่ dogfood) → แก้ที่ root ได้ตามปกติ
- [ ] **ภาษาไทย** (`docs/rule.md §2`) — ข้อความ/คอมเมนต์ที่เติมทุกไฟล์เป็นภาษาไทยตามสไตล์ repo
- [ ] **investigate-before-edit** (`docs/rule.md §1` — enforce ของ "ห้ามเดา") — ก่อนเติมบรรทัด ต้องเข้าใจ **รูปแบบ/alignment/เจตนาเดิม** ของแต่ละไฟล์ (utility list block ของ README, list pattern ของ CLAUDE.md, โครง Keep a Changelog) แล้วเลียนแบบให้ตรง — แก้โดยไม่เข้าใจรูปแบบ = เดา
- [ ] **canonical-copy convention** (`docs/rule.md §1`) — wording/ชื่อ/path ดึงจาก `design.md §1.1 Contract` (canonical เดียว) **copy ไม่แต่งใหม่ต่อไฟล์** — โดยเฉพาะบรรทัด registry ของ `CLAUDE.md` ต้องตรงเป๊ะ Contract §1.1
- [ ] **ห้ามเดา** (`docs/rule.md §1`) — ไม่ตัดสินชื่อ/path/wording เอง; ยึด Contract; ไม่ชัด → ถาม

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/techstack/.../rule.md` หรือ `docs/rule.md` ตอนนี้ — แค่ note ไว้ก่อน
- [ ] ไม่มี rule ใหม่ — task นี้เดินตาม rule ที่มีอยู่ครบ (CHANGELOG-on-user-facing-change + canonical-copy + investigate-before-edit) ไม่เกิดบทเรียน generalize ใหม่
