# Spec — add-ide-adapters

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task

`logic` + `infra` (installer behavior)

---

## 4. Data-flow

```
src/.warnyin/installer/templates/<file>
    ↓ copyTree (Cursor/Windsurf) หรือ installAdapterDoc (Copilot/Cline/Gemini)
<target>/<destPath>
```

- Cursor: `templates/cursor-rules.mdc` → `<target>/.cursor/rules/warnyin.mdc`
- Windsurf: `templates/windsurf-rules.md` → `<target>/.windsurf/rules/warnyin.md`
- Copilot: `templates/copilot-instructions.md` → `<target>/.github/copilot-instructions.md`
- Cline: `templates/clinerules` → `<target>/.clinerules`
- Gemini: `templates/GEMINI.md` → `<target>/GEMINI.md`

## 5. User-flow

1. user รัน `npx @warnyin/agents` (project หรือ global)
2. installer copy Cursor/Windsurf rules ผ่าน `copyTree` (overwrite: false; true เมื่อ --update)
3. installer append Copilot/Cline/Gemini ผ่าน `installAdapterDoc` (append-once ด้วย marker; ถ้าไม่มีไฟล์ → สร้างใหม่)
4. log `+ <path>` (สร้างใหม่) หรือ `↻ <path>` (update) หรือ `± <path>` (ต่อท้าย) ตาม convention

## 6. Persona

ผู้ใช้ปลายทางที่รัน `npx @warnyin/agents` แล้วเปิดโปรเจกต์ด้วย IDE ที่ไม่ใช่ Claude Code

## 7. Test-flow

- [ ] **T1-project-basic:** `runCli(tmpDir, ['--project'])` → assert ไฟล์ครบ 5 adapter + มี marker ใน content
- [ ] **T1-idempotent:** รัน 2 ครั้ง → `.clinerules`, `copilot-instructions.md`, `GEMINI.md` ไม่มี content ซ้ำ (marker ปรากฏ 1 ครั้ง)
- [ ] **T1-update:** รัน `--project` ก่อน → แก้ `.cursor/rules/warnyin.mdc` → รัน `--update` → ไฟล์กลับเป็น content จาก template
- [ ] **T1-existing-clinerules:** สร้าง `.clinerules` มีเนื้อหาเดิมก่อน → install → ไฟล์ต้องมีทั้งเนื้อเดิม + section warnyin (ไม่เขียนทับ)
- [ ] **T1-global:** `runCli(tmpHomeDir, ['--global'])` → assert adapter ใน `~/.cursor/rules/`, `~/.windsurf/rules/`, `~/.github/`, ฯลฯ
- [ ] **T1-dry-run:** `runCli(tmpDir, ['--project', '--dry-run'])` → log มี path ของ adapter แต่ไม่สร้างไฟล์จริง
