# Standard — cli-help-wording

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack)
> อ้างอิง `docs/techstack/installer/standard.md` — ข้อไหนเกี่ยวกับ task นี้
- **โค้ด installer (`src/bin/cli.mjs`)**: zero-dep + ESM; string ที่ถูก assert คำต่อคำ (legacy string copy codepoint — en-dash U+2013 ใน `0.3–0.5.x`, `≤` U+2264) → substring ใหม่ใน `--help` ต้อง **ไม่** paraphrase (test จะแดงถ้าแก้คำ)
- **Test harness กลาง** (`src/tests/installer.test.mjs`): `runCli(cwd, args)` = black-box spawn จริง array args ไม่ shell — ใช้ pattern เดียวกัน spawn `--help`
- **CHANGELOG**: Keep a Changelog format — `## [version]` + วันที่ + กลุ่ม Added/Changed/Removed/Fixed; entry ใหม่ของ task นี้ = `### Fixed`

## 2. Pattern การเขียนโค้ดของ task นี้
- **โครงสร้าง/naming:**
  - substring ใหม่: `เขียนทับเฉพาะ CORE — ไฟล์ docs/ ถูก seed จาก template ถ้ายังไม่มี ไม่ทับของเดิม` (single canonical — ใช้ตรงกันทุก 5 จุด; ห้าม paraphrase)
  - substring เก่าที่ห้าม: `ไม่แตะ docs/`, `ไม่แตะ \`docs/\``, `ไม่แตะ docs/ และงานจริง` (ทุก variant ต้องหายจาก 5 ไฟล์ที่แก้)
- **error handling:** ไม่มี (text-only change)
- **การจักษา state/data:**
  - ไฟล์ template (`src/.warnyin/installer/templates/CLAUDE.md`) = payload ที่ผู้ใช้ได้ → ต้อง consistent กับ source `src/bin/cli.mjs`
  - CHANGELOG entry = Slice B สร้าง header `## [0.29.1]` (ว่างไม่มีวันที่) + `### Fixed` + bullet ของตัวเอง; Slice C เติมวันที่ + Migration

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **`runCli(cwd, args)`** (test harness) — spawn `process.execPath` + `[cliPath, ...args]` (mirror `installer.test.mjs:21`)
- **spawn array args** — ห้าม `shell:true` (rule §2)
- **substring assert** — test assertion ใช้ `stdout.includes(substring)` pattern เดียวกับ `installer.test.mjs` legacy warning check
- **template `templates/stages/[topic]/tasks/[task-name]/spec.md`** — pattern ที่ task file นี้ใช้

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
> pattern ใหม่ที่ task นี้แนะนำ — ถ้าควรเป็นมาตรฐานกลาง ให้ note ใน `rule.md` (รอ SHIP อัปเดต standard กลาง)
- **canonical-copy discipline สำหรับ user-facing wording** — substring ที่ปรากฏหลายไฟล์ (5 ที่) ต้องเป็นข้อความเดียวกันเป๊ะ (canonical-copy rule §1) — ตัด drift — note ใน rule.md
- **negative grep regression** — substring เก่าที่ถูกแทนที่ต้อง **หายจากทุกไฟล์** (assert `NOT includes`) — pattern ใช้ซ้ำกับ wording fix อื่น — note ใน rule.md
- **CHANGELOG header ownership ระหว่าง slice** — slice B สร้าง header (ว่าง) + entries ตัวเอง; slice C เติมวันที่ + Migration (ไม่สร้าง/ย้าย entries ของ slice อื่น) — pattern ทั่วไปของ multi-slice SHIP — note ใน rule.md