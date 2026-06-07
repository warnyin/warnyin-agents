# Rule — sync-p0-docs

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)
> ดึงจาก `docs/rule.md` + `docs/techstack/installer/rule.md` — เฉพาะข้อที่เกี่ยวกับ task นี้
- [ ] **CHANGELOG ทุก user-facing change** — migration ของ breaking (`warnyin/`→`.warnyin/`) ต้องมีให้ผู้ใช้ migrate เองได้ (`docs/rule.md` §2)
- [ ] **ภาษาไทย** — เนื้อหาเอกสารเป็นไทย ตามสไตล์ repo (`docs/rule.md` §2)
- [ ] **ห้ามเดา** — migration content = string จริงจาก `src/bin/cli.mjs` (copy codepoint ตรง) ไม่แต่งขึ้นเอง (`docs/rule.md` §1)
- [ ] **ห้ามแตะ `src/`** — งานนี้เอกสารล้วน; `src/bin/cli.mjs` อ่านอย่างเดียว (เป็น source-of-truth ของ migration)
- [ ] **ไม่แก้ entry `[0.7.0]` เดิม** ใน CHANGELOG — เพิ่ม section ใหม่เท่านั้น (กัน regress changelog history)
- [ ] **ไม่ติ๊ก checkbox ลวง** ใน roadmap — `- [x]` เฉพาะที่เสร็จจริง ส่วนที่ปิดบางส่วนเขียนหมายเหตุ

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md`/`docs/techstack/installer/rule.md` ตอนนี้ — แค่ note ไว้ก่อน
- [ ] rule ที่เสนอ: **"เอกสาร migration ต้อง mirror legacy warning ใน `cli.mjs` (เอกสาร sync กับโค้ดเตือน — codepoint ตรง)"** — เหตุผล: กันเอกสาร migration คลาดจากสิ่งที่ installer เตือนผู้ใช้จริง; ถ้า legacy warning เปลี่ยน เอกสารต้องตามทันที
