# Standard — release-hygiene

> อิงจาก `docs/techstack/installer/standard.md` §CHANGELOG

## 1. Standard กลางที่ยึด

- **Keep a Changelog** format: `[Unreleased]` หรือ version ใหม่ก่อน; กลุ่ม `Added` / `Changed` / `Fixed` / `Removed`
- **semver:** feature ใหม่ = minor bump; bugfix = patch bump

## 2. Pattern

### CHANGELOG entry format

```md
## [Unreleased]
### Added
- installer: รองรับ IDE เพิ่มเติม (Cursor, Windsurf, Copilot Chat, Cline/Roo Code, Gemini CLI) — adapter file ติดตั้งอัตโนมัติพร้อมกับ Claude Code และ Codex
```

### CLAUDE.md template section "รองรับหลาย AI"

```md
## รองรับหลาย AI
installer ติดตั้ง adapter ให้อัตโนมัติสำหรับ:
- Claude Code: `.claude/` + ไฟล์นี้
- Codex / Antigravity: `AGENTS.md`
- Cursor: `.cursor/rules/warnyin.mdc`
- Windsurf: `.windsurf/rules/warnyin.md`
- Copilot Chat: `.github/copilot-instructions.md`
- Cline / Roo Code: `.clinerules`
- Gemini CLI: `GEMINI.md`
ทุกเครื่องชี้กลับ playbook กลางชุดเดียวใน `.warnyin/workflow/stages/`
```
