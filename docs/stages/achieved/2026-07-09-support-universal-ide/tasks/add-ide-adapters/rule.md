# Rule — add-ide-adapters

> rule ที่ task นี้ต้อง **focus/follow**

## 1. Rule ที่ต้อง follow (จาก techstack)

- [ ] **zero-dependency** (`docs/rule.md §2`) — ใช้เฉพาะ built-in `node:fs`, `node:path`, `node:os` ห้าม import ภายนอก
- [ ] **cross-platform path** (`docs/rule.md §2`) — `path.join` ทุกที่ ห้าม hardcode `/`, ห้าม `shell:true` ใน spawn
- [ ] **tool-agnostic template content** (`docs/rule.md §1`) — เนื้อหาใน adapter ต้องเป็น generic pointer ชี้กลับ `.warnyin/workflow/` ห้ามอ้าง model name / tool name เฉพาะในเนื้อหา template
- [ ] **DRY + stats pattern** (`docs/techstack/installer/standard.md`) — ทุก write เคารพ `DRY` flag + นับ `stats.{created,updated,skipped}`
- [ ] **ห้าม overwrite งาน user โดยไม่มี marker** (`docs/rule.md §4` installer rules) — ไฟล์ที่ user อาจมีเนื้อหาก่อน (`.clinerules`, `.github/copilot-instructions.md`, `GEMINI.md`) ต้อง append-with-marker ไม่ใช่ overwrite
- [ ] **test = black-box spawn** (`docs/rule.md §5`) — ห้าม import logic จาก `cli.mjs`; assert จาก side-effect จริงในไฟล์
- [ ] **assert `code===0` ก่อนเสมอ** (`docs/techstack/installer/standard.md`) — surface stderr ใน assertion message
- [ ] **investigate-before-edit** (`docs/rule.md §1`) — อ่าน `cli.mjs` ให้ครบก่อนแก้; เข้าใจ `copyTree` + `installRootDoc` + `installGlobalNote` ก่อน refactor

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

- [ ] rule ที่เสนอ: **adapter-install-strategy convention** — ไฟล์ที่ IDE อาจมีอยู่ก่อน (top-level config) ต้องใช้ append-with-marker; ไฟล์ใน directory เฉพาะของ IDE (subdirectory ที่ user ไม่น่ามีก่อน) ใช้ copyTree ได้ — เหตุผล: กัน overwrite งาน user + consistent กับ pattern ที่ CLAUDE.md ใช้อยู่
