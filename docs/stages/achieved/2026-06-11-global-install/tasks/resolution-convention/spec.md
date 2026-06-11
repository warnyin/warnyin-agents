# Spec — resolution-convention

> feature ประเภท payload `.md` (ไม่มี runtime) → THEN = observable artifact (section/string มีจริง)

## persona
agent (Claude/Codex) ที่อ่าน root doc เข้า context → รู้ว่า resolve path `.warnyin/` ยังไง + workspace ไม่มีทำไง

## data-flow
install → root doc (CLAUDE.md/AGENTS.md per-project, CLAUDE.global.md→`~/.claude/CLAUDE.md` global) อยู่ใน context → agent ใช้ convention

## test-flow (task-scope — structural)
1. **resolution มีครบ 3 ไฟล์:** grep "local-first"/`./.warnyin/` → `~/.warnyin/` ใน `CLAUDE.md`, `AGENTS.md`, `CLAUDE.global.md`
2. **workspace-guard:** grep "docs/stages/" + "/warnyin:init" (ไม่มี workspace → init ก่อน) ทั้ง 3 ไฟล์
3. **wording ตรงกัน:** เนื้อ resolution/guard ใน 3 ไฟล์สอดคล้อง (consistency — ไม่ขัดกัน)
4. **CLAUDE.global.md note-only:** grep **ไม่พบ** "Slash commands (namespace" / รายการ `/warnyin:design`...(ตารางกฎหลักของ project template) — เป็น note สั้น
5. **marker:** `CLAUDE.global.md` มีบรรทัด `<!-- warnyin:global-note -->`
6. **marker เดิมคงอยู่:** `CLAUDE.md` per-project มี `warnyin/workflow/stages/` (idempotent guard ไม่พัง)
7. **generic:** grep ไม่พบชื่อรุ่น/ผลิตภัณฑ์ harness
8. **lint:md own-file** ผ่าน

## observable
- 3 ไฟล์มี convention; `CLAUDE.global.md` note-only + marker; marker เดิมใน CLAUDE.md ไม่หาย
