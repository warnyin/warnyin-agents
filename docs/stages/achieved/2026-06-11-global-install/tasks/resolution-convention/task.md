# Task — resolution-convention

> ชี้ canonical `design.md` §3C/§3E/§4 (ไม่ลอก logic)

| | |
|---|---|
| **Task** | `resolution-convention` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (payload templates) |
| **Model tier** | `balanced` (wording tool-agnostic + marker contract — ระวัง consistency 3 ไฟล์) |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
เขียน **resolution convention** (local-first `./.warnyin/` → global fallback `~/.warnyin/`) + **workspace-guard** (ไม่มี `docs/stages/` → `/warnyin:init`) ลง 3 ที่ (tool-agnostic, เนื้อเดียวกัน) + สร้าง template **note-only `CLAUDE.global.md`** (มี marker `<!-- warnyin:global-note -->`) ที่ T1 เขียนลง `~/.claude/CLAUDE.md`

## 2. Dependency
- **ต้องทำหลัง:** — (wave 1; อ่าน `design.md` §3C/§3E เป็น input)
- **ปลดล็อกให้:** — (T1 `installGlobalNote()` อ่าน `CLAUDE.global.md` ผ่าน **contract path** ที่ตกลงใน §4 — ไม่พึ่ง runtime)
- **ส่ง output:** resolution note ใน 3 ไฟล์ + marker contract

## 3. Sub-tasks
- [ ] 1. `installer/templates/CLAUDE.md` — เพิ่ม section resolution + workspace-guard (§3C) ; **ต้องคง string `warnyin/workflow/stages/` เดิม** (idempotent marker ของ `installRootDoc` per-project พึ่ง — §4)
- [ ] 2. `src/AGENTS.md` — เพิ่ม resolution + workspace-guard เนื้อเดียวกัน (tool-agnostic; global limitation = per-project path)
- [ ] 3. **สร้าง `installer/templates/CLAUDE.global.md` (ใหม่)** — note-only: resolution + workspace-guard เท่านั้น (ไม่มี slash-command list/กฎหลัก) + บรรทัด **marker `<!-- warnyin:global-note -->`** (shared contract กับ T1)

## 4. ขอบเขตไฟล์ที่จะแตะ (★ disjoint)
- `src/.warnyin/installer/templates/CLAUDE.md`, `src/.warnyin/installer/templates/CLAUDE.global.md` (ใหม่), `src/AGENTS.md`
- ❌ **ห้ามแตะ** `cli.mjs`/test (T1), `workflow/init.md` (T3), `.claude/commands/` (adapter ไม่ต้องแก้ — DQ2)

## 5. Acceptance criteria
- [ ] resolution (local-first→global) + workspace-guard มีครบทั้ง 3 ไฟล์ wording ตรงกัน
- [ ] `CLAUDE.global.md` = note-only (grep ไม่พบ slash-command list/ตารางกฎหลักของ project template) + มี marker `<!-- warnyin:global-note -->`
- [ ] `CLAUDE.md` per-project **ยังมี string `warnyin/workflow/stages/`** (marker เดิมไม่หาย)
- [ ] tool-agnostic — ไม่ผูกชื่อรุ่น/ผลิตภัณฑ์ (`docs/rule.md §1`)
- [ ] `lint:md` own-file ผ่าน · ทำตาม `rule.md`+`standard.md`

## 6. อ้างอิง
- Canonical: `../../design.md` §3C (wording), §3E (marker), §4 (contract T1↔T2)
- ของเดิม: `src/.warnyin/installer/templates/CLAUDE.md`, `src/AGENTS.md`
