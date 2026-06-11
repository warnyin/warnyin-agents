# Rule — resolution-convention

## 1. Rule ที่ต้อง follow
- **tool-agnostic / payload generic** (`docs/rule.md §1`) — ไม่ผูกชื่อรุ่น/ผลิตภัณฑ์ harness แม้ในประโยคปฏิเสธ
- **canonical-copy / ไม่ duplicate** (`docs/rule.md §1`) — resolution เนื้อเดียวกระจาย 3 ไฟล์ตรงกัน; **ไม่ inline ลงทุก adapter** (DQ2 — convention อยู่ root doc ที่โหลด context เสมอ)
- **กระทัดรัด opinionated** — note สั้น; `CLAUDE.global.md` note-only ไม่ลอก project template
- **mirror layout `src/`=target** (`installer/rule.md`) — `CLAUDE.global.md` ใต้ `installer/templates/`
- **template seedDocs-skip invariant ไม่เกี่ยว** — `CLAUDE.global.md` อยู่ใต้ `installer/templates/` (cli อ่านตรง) ไม่ใช่ `template/docs/` (seedDocs) → ไม่ต้องมี `[...]`
- **★ marker contract (design §4):** ต้องคง string `warnyin/workflow/stages/` เดิมใน `CLAUDE.md` (idempotent ของ `installRootDoc` per-project พึ่ง — แก้เนื้อ resolution ได้แต่ห้ามลบ marker line); `CLAUDE.global.md` ต้องมี `<!-- warnyin:global-note -->` (T1 พึ่ง)
- **★ path เป็น inline-code (backtick) ห้าม markdown-link** (dry-run T2 defer) — `installer/templates/` ถูก `lint:md` scan (ไม่อยู่ใน EXCLUDE); เขียน `` `.warnyin/workflow/...` `` / `` `~/.warnyin/...` `` เป็น code-span (lint strip ก่อน match link); ถ้าเขียน `[..](.warnyin/..)` = dead-link fail — ทำตาม sample ใน `standard.md` (ใช้ backtick อยู่แล้ว)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] — (ไม่มี; ใช้ canonical-copy + tool-agnostic + DQ2 convention-in-rootdoc เดิม)
