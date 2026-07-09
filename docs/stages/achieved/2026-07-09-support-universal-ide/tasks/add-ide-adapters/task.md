# Task — add-ide-adapters

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `add-ide-adapters` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` |
| **Model tier** | `balanced` |
| **สถานะ** | `เสร็จ (built 2026-07-09)` |

## 1. เป้าหมายของ task (vertical slice)

เพิ่ม adapter template file สำหรับทุก IDE + แก้ `cli.mjs` ให้ install + เขียน test ครอบ — ทำงาน end-to-end: รัน `npx @warnyin/agents` แล้วได้ adapter ทุก IDE ในโปรเจกต์

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- ต้องทำหลัง: ไม่มี (task แรก)
- ปลดล็อกให้: `tasks/update-verify-pack/` (ต้องรู้ path template จริงก่อน)
- ส่ง output: path ของ template file ใหม่ใน `src/.warnyin/installer/templates/`

## 3. Sub-tasks

- [x] 1. สร้าง template file ทุก IDE ใน `src/.warnyin/installer/templates/` — _ผลลัพธ์: ไฟล์ครบ 5 ตัว_
- [x] 2. ใช้ `installAdapterDoc` สำหรับทุก IDE (ไม่เพิ่ม CORE — template ชื่อ ≠ dest ชื่อ) — _ผลลัพธ์: explicit destRel mapping_
- [x] 3. เพิ่ม helper `installAdapterDoc` ใน `cli.mjs` — _ผลลัพธ์: helper พร้อมใช้_
- [x] 4. เรียก `installAdapterDoc` สำหรับ Cursor/Windsurf/Copilot/Cline/Gemini ใน project mode และ global mode — _ขึ้นกับ 3_
- [x] 5. เขียน black-box test ครอบ project install + global install + idempotent + existing file behavior + dry-run — _pass 32/32_

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

- `src/.warnyin/installer/templates/cursor-rules.mdc` (ใหม่)
- `src/.warnyin/installer/templates/windsurf-rules.md` (ใหม่)
- `src/.warnyin/installer/templates/copilot-instructions.md` (ใหม่)
- `src/.warnyin/installer/templates/clinerules` (ใหม่, no extension)
- `src/.warnyin/installer/templates/GEMINI.md` (ใหม่)
- `src/bin/cli.mjs` — แก้ `CORE` array + เพิ่ม helper + เพิ่ม call ใน main()
- `src/tests/installer.test.mjs` — เพิ่ม test case

## 5. Acceptance criteria

- [x] รัน `node src/bin/cli.mjs --project` ใน temp dir → มีไฟล์ครบ: `.cursor/rules/warnyin.mdc`, `.windsurf/rules/warnyin.md`, `.github/copilot-instructions.md`, `.clinerules`, `GEMINI.md`
- [x] content ของทุก adapter มี marker ถูก (Copilot: `<!-- warnyin:copilot -->`, Cline: `<!-- warnyin:cline -->`, Gemini: `<!-- warnyin:gemini -->`)
- [x] รัน install ซ้ำ (idempotent) → append-once สำหรับ Copilot/Cline/Gemini (marker กัน duplicate)
- [x] `installAdapterDoc` skip ถ้า marker มีอยู่แล้ว — idempotent ทุก adapter
- [x] ไม่มีไฟล์ใหม่ที่ break test เดิม (exit 0, test count 32 ≥ 27 เดิม)
- [x] ผ่าน test ตาม `spec.md` — T1-project-basic, T1-idempotent, T1-existing-clinerules, T1-global, T1-dry-run pass ทั้งหมด
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
