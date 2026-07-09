# Task — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `release-hygiene` |
| **Slice อ้างอิง** | `design.md` slice #3 |
| **Component** | `installer` / docs |
| **Model tier** | `cheap` |
| **สถานะ** | `เสร็จ (built 2026-07-09)` |

## 1. เป้าหมายของ task (vertical slice)

อัปเดต CHANGELOG + bump version + อัปเดต template docs (CLAUDE.md, AGENTS.md section) ให้สะท้อน IDE ที่รองรับใหม่ — ทำหลัง T1+T2 integrate ครบ

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- ต้องทำหลัง: `tasks/add-ide-adapters/` + `tasks/update-verify-pack/` (ต้องรู้ผลจริง full-gate ก่อนเขียน CHANGELOG)
- ปลดล็อกให้: SHIP stage
- ส่ง output: package พร้อม publish

## 3. Sub-tasks

- [x] 1. เพิ่ม entry `[0.25.0] - 2026-07-09` ใน `CHANGELOG.md` section Added — _ผลลัพธ์: CHANGELOG อัปเดต_
- [x] 2. bump `package.json version` 0.24.0 → 0.25.0 — _ขึ้นกับ 1_
- [x] 3. อัปเดต `src/.warnyin/installer/templates/CLAUDE.md` section "รองรับหลาย AI / IDE" แสดง 7 IDE — _ผลลัพธ์: template สะท้อนความจริง_
- [x] 4. อัปเดต `src/AGENTS.md` header แสดง harness ทั้งหมด — _ขึ้นกับ 1_
- [x] 5. รัน `node --test` → pass 134/134, fail 0 — full gate ผ่าน

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

- `CHANGELOG.md`
- `package.json` (version field)
- `src/.warnyin/installer/templates/CLAUDE.md`
- `src/AGENTS.md`

## 5. Acceptance criteria

- [x] `CHANGELOG.md` มี entry `[0.25.0]` ระบุ IDE ที่เพิ่มครบ 5 ตัว
- [x] `package.json version` bump 0.24.0 → 0.25.0
- [x] `CLAUDE.md` template section "รองรับหลาย AI / IDE" แสดง Claude/Codex/Cursor/Windsurf/Copilot/Cline/Gemini
- [x] `node --test` exit 0, pass 134/134 ≥ 45 (MIN_PASS)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
