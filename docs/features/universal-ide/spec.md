# Spec — universal-ide

> Behavior spec ของ feature universal-ide
> source: topic `support-universal-ide` build + verify (2026-07-09)

## Requirements

| ID | Requirement |
|---|---|
| R1 | installer ติดตั้ง adapter ครบทุก IDE (Cursor, Windsurf, Copilot, Cline, Gemini) ทุกครั้งโดยไม่ detect |
| R2 | Cursor: `.cursor/rules/warnyin.mdc` — overwrite เมื่อ `--update`, skip ถ้า byte-equal |
| R3 | Windsurf: `.windsurf/rules/warnyin.md` — overwrite เมื่อ `--update`, skip ถ้า byte-equal |
| R4 | Copilot: `.github/copilot-instructions.md` — append-with-marker idempotent; ห้าม overwrite แม้ `--update` |
| R5 | Cline: `.clinerules` — append-with-marker idempotent; ห้าม overwrite แม้ `--update` |
| R6 | Gemini: `GEMINI.md` — append-with-marker idempotent; ห้าม overwrite แม้ `--update` |
| R7 | idempotent: รัน 2 ครั้ง → marker ปรากฏ 1 ครั้ง / file byte-equal |
| R8 | `--dry-run`: log adapter paths ทั้งหมด แต่ไม่เขียนไฟล์ |
| R9 | global mode: adapter ลงที่ `os.homedir()` (path เดียวกับ project mode) |

## Scenarios (test-flow)

### T1-project-basic
GIVEN: target ว่าง, รัน installer ปกติ
THEN: `.cursor/rules/warnyin.mdc` มีเนื้อหา + `.windsurf/rules/warnyin.md` มีเนื้อหา + `.github/copilot-instructions.md` มี marker + `.clinerules` มี marker + `GEMINI.md` มี marker

### T1-idempotent
GIVEN: ติดตั้งครั้งแรกสำเร็จ, รัน installer ซ้ำ
THEN: marker ปรากฏ 1 ครั้ง; stdout มี "ข้าม" สำหรับ append-strategy

### T1-existing-clinerules
GIVEN: `.clinerules` มีเนื้อหา user อยู่ก่อน, รัน installer
THEN: เนื้อหา user ยังอยู่ครบ + warnyin section ถูก append ต่อท้าย

### T1-update
GIVEN: ติดตั้งครั้งแรก, รัน `--update`
THEN: Cursor/Windsurf ถูก overwrite ด้วย template ใหม่; Copilot/Cline/Gemini marker ยังปรากฏ 1 ครั้ง (ไม่ซ้ำ)

### T1-dry-run
GIVEN: target ว่าง, รัน `--dry-run`
THEN: log path adapter ทั้ง 5 แต่ไม่มีไฟล์ใดถูกสร้าง

### T1-global
GIVEN: `--global`, HOME=temp dir, รัน installer
THEN: adapter ครบ 5 ตัวลงที่ temp HOME (same relative paths)

## Template paths (SOURCE layer)

```
src/.warnyin/installer/templates/cursor-rules.mdc        → .cursor/rules/warnyin.mdc
src/.warnyin/installer/templates/windsurf-rules.md       → .windsurf/rules/warnyin.md
src/.warnyin/installer/templates/copilot-instructions.md → .github/copilot-instructions.md
src/.warnyin/installer/templates/clinerules              → .clinerules
src/.warnyin/installer/templates/GEMINI.md               → GEMINI.md
```
