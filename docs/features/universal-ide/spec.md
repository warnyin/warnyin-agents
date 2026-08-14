# Spec — universal-ide

> Behavior spec ของ feature universal-ide
> source: topic `support-universal-ide` build + verify (2026-07-09)

## Requirement: installer ติดตั้ง adapter ครบทุก IDE (Cursor, Windsurf, Copilot, Cline, Gemini) ทุกครั้งโดยไม่ detect

installer ติดตั้ง **adapter ครบทุกตัว** แบบ **unconditional** (zero-config) — ไม่ตรวจว่า user ใช้ IDE อะไร — การ detect IDE ทำให้ logic เปราะ + user ต้องรัน installer ซ้ำเมื่อเปลี่ยน IDE; ติดตั้งพร้อมกันทั้ง `--project` และ `--global` mode

### Scenario: project install ครบ 5 adapter
- GIVEN target ว่าง, รัน `npx @warnyin/agents` (mode project)
- WHEN ติดตั้งเสร็จ
- THEN มีไฟล์ 5 adapters: `.cursor/rules/warnyin.mdc` + `.windsurf/rules/warnyin.md` + `.github/copilot-instructions.md` (มี marker) + `.clinerules` (มี marker) + `GEMINI.md` (มี marker)

## Requirement: Cursor adapter (`.cursor/rules/warnyin.mdc`) — overwrite เมื่อ `--update`

### Scenario: install Cursor ครั้งแรก
- GIVEN target ไม่มี `.cursor/rules/warnyin.mdc`
- WHEN รัน installer
- THEN มี `.cursor/rules/warnyin.mdc` มีเนื้อหาครบ (template)

### Scenario: `--update` overwrite Cursor
- GIVEN `.cursor/rules/warnyin.mdc` มีอยู่แล้ว (template เก่า)
- WHEN รัน `npx @warnyin/agents --update`
- THEN `.cursor/rules/warnyin.mdc` ถูก overwrite ด้วย template ใหม่ (ถ้า byte ต่าง); byte-equal → skip

## Requirement: Windsurf adapter (`.windsurf/rules/warnyin.md`) — overwrite เมื่อ `--update`

### Scenario: install Windsurf ครั้งแรก
- GIVEN target ไม่มี `.windsurf/rules/warnyin.md`
- WHEN รัน installer
- THEN มี `.windsurf/rules/warnyin.md` มีเนื้อหาครบ

### Scenario: `--update` overwrite Windsurf
- GIVEN `.windsurf/rules/warnyin.md` มีอยู่แล้ว
- WHEN รัน `--update`
- THEN `.windsurf/rules/warnyin.md` ถูก overwrite ด้วย template ใหม่ (byte-equal → skip)

## Requirement: Copilot adapter (`.github/copilot-instructions.md`) — append-with-marker idempotent

ห้าม overwrite แม้ `--update` (top-level file ที่ user อาจมีเนื้อหาก่อน) — append warnyin section + marker; idempotent (marker ปรากฏ 1 ครั้ง)

### Scenario: install Copilot ครั้งแรก
- GIVEN target ไม่มี `.github/copilot-instructions.md`
- WHEN รัน installer
- THEN มี `.github/copilot-instructions.md` มี marker `<!-- warnyin:adapter -->` + warnyin section

### Scenario: `--update` append Copilot ไม่ซ้ำ
- GIVEN `.github/copilot-instructions.md` มี marker warnyin อยู่แล้ว
- WHEN รัน `--update`
- THEN marker warnyin ยังปรากฏ 1 ครั้ง (ไม่ append ซ้ำ); เนื้อหา user ก่อน marker คงเดิม

## Requirement: Cline adapter (`.clinerules`) — append-with-marker idempotent

ห้าม overwrite แม้ `--update` — append warnyin section + marker; idempotent

### Scenario: existing Cline content คงอยู่
- GIVEN `.clinerules` มีเนื้อหา user อยู่ก่อน
- WHEN รัน installer
- THEN เนื้อหา user ยังอยู่ครบ + warnyin section ถูก append ต่อท้าย + marker 1 ครั้ง

## Requirement: Gemini adapter (`GEMINI.md`) — append-with-marker idempotent

ห้าม overwrite แม้ `--update` — append warnyin section + marker; idempotent

### Scenario: install Gemini ครั้งแรก
- GIVEN target ไม่มี `GEMINI.md`
- WHEN รัน installer
- THEN มี `GEMINI.md` มี marker warnyin + section

### Scenario: `--update` Gemini marker ไม่ซ้ำ
- GIVEN `GEMINI.md` มี marker warnyin อยู่แล้ว
- WHEN รัน `--update`
- THEN marker ยังปรากฏ 1 ครั้ง (ไม่ append ซ้ำ)

## Requirement: idempotent — รัน 2 ครั้งต้อง byte-equal / marker 1 ครั้ง

### Scenario: รัน installer ซ้ำ — marker ไม่ซ้ำ, file byte-equal
- GIVEN ติดตั้งครั้งแรกสำเร็จ
- WHEN รัน installer ซ้ำ (ครั้งที่ 2)
- THEN marker ใน append-strategy adapter (Copilot/Cline/Gemini) ปรากฏ 1 ครั้ง (ไม่ซ้ำ); file ใน overwrite-strategy (Cursor/Windsurf) byte-equal; stdout มี "ข้าม" สำหรับ append-strategy

## Requirement: `--dry-run` — log แต่ไม่เขียนไฟล์

### Scenario: dry-run ไม่สร้างไฟล์จริง
- GIVEN target ว่าง
- WHEN รัน `npx @warnyin/agents --dry-run`
- THEN log path adapter ทั้ง 5 ใน stdout แต่ไม่มีไฟล์ใดถูกสร้างใน target

## Requirement: `--global` mode — adapter ลง `os.homedir()` (path เดียวกับ project mode)

### Scenario: --global ติดตั้งครบ 5 ลง temp HOME
- GIVEN `--global`, `HOME=temp` (override)
- WHEN รัน installer
- THEN adapter ครบ 5 ลงที่ temp HOME (path เดียวกับ project mode: `.cursor/rules/warnyin.mdc`, `.windsurf/rules/warnyin.md`, `.github/copilot-instructions.md`, `.clinerules`, `GEMINI.md`)

## Template paths (SOURCE layer)

```
src/.warnyin/installer/templates/cursor-rules.mdc        → .cursor/rules/warnyin.mdc
src/.warnyin/installer/templates/windsurf-rules.md       → .windsurf/rules/warnyin.md
src/.warnyin/installer/templates/copilot-instructions.md → .github/copilot-instructions.md
src/.warnyin/installer/templates/clinerules              → .clinerules
src/.warnyin/installer/templates/GEMINI.md               → GEMINI.md
```
