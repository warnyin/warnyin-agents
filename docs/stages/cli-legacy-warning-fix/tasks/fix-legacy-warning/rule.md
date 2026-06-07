# Rule — fix-legacy-warning

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack)
- [ ] **เอกสาร migration ↔ cli ต้อง sync** — warning ใน `cli.mjs` = คำสั่งใน `CHANGELOG.md` Migration guide เป๊ะ (`docs/techstack/installer/rule.md` §เอกสาร migration)
- [ ] **executable-verified** — คำสั่งใหม่ใน warning ต้องผ่าน executable migration proof (`docs/techstack/installer/test.md`) ก่อนปิดงาน
- [ ] **legacy string ใน test copy codepoint ตรงจาก `cli.mjs`** (en-dash U+2013, ≤ U+2264) — `docs/techstack/installer/standard.md`
- [ ] **black-box test** — assert จาก stderr จริง (spawn cli) ไม่ import logic (`docs/rule.md` §5)
- [ ] **zero-dependency / ESM** คงเดิม — แตะแค่ string literal ไม่เพิ่ม dep
- [ ] **ไม่แตะ behavior** — เฉพาะข้อความ warning; `ensureScaffold`/install flow คงเดิม (scope out option B)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] ไม่มี rule ใหม่ — งานนี้เป็นการ **ปิด defer** ที่ rule (executable-verified + เอกสาร↔cli sync) ถูก promote ไปแล้วใน topic `roadmap-sync-p0`; task นี้แค่ทำให้ cli compliant กับ rule นั้น
