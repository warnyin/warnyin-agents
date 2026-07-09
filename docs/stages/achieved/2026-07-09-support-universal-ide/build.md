# Build Report — support-universal-ide

> Stage: BUILD · playbook: `.warnyin/workflow/stages/build.md`
> วันที่: 2026-07-09

## 1. Execution summary

| Wave | Task | สถานะ | self-verify | ไฟล์ที่แตะ |
|---|---|---|---|---|
| 1 | `add-ide-adapters` | ✅ passed | pass 32/32 | 7 ไฟล์ (template×5, cli.mjs, installer.test.mjs) |
| 2 | `update-verify-pack` | ✅ passed | pass 13/13 | 3 ไฟล์ (verify-pack.mjs, verify-pack.test.mjs, check-test-count.mjs) |
| 3 | `release-hygiene` | ✅ passed | รัน full gate | 4 ไฟล์ (CHANGELOG.md, package.json, CLAUDE.md template, AGENTS.md) |

**Isolation mode:** wave เดี่ยวทุก wave → `isolate: false` (shared tree, ไม่ใช่ git repo ที่รองรับ worktree)

## 2. ไฟล์ที่สร้าง/แก้

### Wave 1 — add-ide-adapters

**ไฟล์ใหม่ (template):**
- `src/.warnyin/installer/templates/cursor-rules.mdc` — Cursor adapter (frontmatter `alwaysApply: true`, marker `<!-- warnyin:cursor -->`)
- `src/.warnyin/installer/templates/windsurf-rules.md` — Windsurf adapter (marker `<!-- warnyin:windsurf -->`)
- `src/.warnyin/installer/templates/copilot-instructions.md` — Copilot Chat adapter (marker `<!-- warnyin:copilot -->`)
- `src/.warnyin/installer/templates/clinerules` — Cline/Roo Code adapter, no extension (marker `<!-- warnyin:cline -->`)
- `src/.warnyin/installer/templates/GEMINI.md` — Gemini CLI adapter (marker `<!-- warnyin:gemini -->`)

**ไฟล์แก้:**
- `src/bin/cli.mjs` — เพิ่ม helper `installAdapterDoc(destRel, srcFilename, marker)` + เรียก 5 ครั้งใน project mode + 5 ครั้งใน global mode
- `src/tests/installer.test.mjs` — เพิ่ม 5 test cases: T1-project-basic, T1-idempotent, T1-existing-clinerules, T1-global, T1-dry-run

**Design decision (BUILD):** ใช้ `installAdapterDoc` สำหรับทุก IDE (ทั้ง Cursor/Windsurf และ Copilot/Cline/Gemini) — ไม่เพิ่ม CORE array เพราะ template ชื่อ (`cursor-rules.mdc`) ≠ dest (`warnyin.mdc`); explicit destRel mapping ชัดเจนกว่าและ consistent กับ pattern ของ `installGlobalNote`

### Wave 2 — update-verify-pack

- `src/scripts/verify-pack.mjs` — เพิ่ม note ยืนยัน `src/.warnyin/` prefix ครอบ `installer/templates/` อยู่แล้ว (ไม่ต้องเพิ่ม prefix ใหม่)
- `src/tests/verify-pack.test.mjs` — เพิ่ม T2-adapter-templates (path ใหม่ pass allowlist) + T2-negative (denylist ยังจับ path ต้องห้าม)
- `src/scripts/check-test-count.mjs` — bump `MIN_PASS` จาก 9 → 45 (installer 32 + verify-pack 13)

### Wave 3 — release-hygiene

- `CHANGELOG.md` — เพิ่ม entry `[0.25.0] - 2026-07-09` section Added
- `package.json` — bump version `0.24.0` → `0.25.0`
- `src/.warnyin/installer/templates/CLAUDE.md` — อัปเดต section "รองรับหลาย AI / IDE" แสดง IDE 7 ตัว (Claude/Codex/Cursor/Windsurf/Copilot/Cline/Gemini)
- `src/AGENTS.md` — อัปเดต header แสดง harness ทั้งหมดที่รองรับ

## 3. Full gate result

| Gate | ผล |
|---|---|
| `node --test` (full suite) | ✅ pass 134/134, fail 0 |
| `check-test-count` (MIN_PASS=45) | ✅ pass 134 ≥ 45 |
| `verify:pack` | ✅ ผ่าน 98 ไฟล์ |
| merge conflict | ✅ ไม่มี |
| rule/standard กลาง ถูกแตะ | ✅ ไม่มี (rule ใหม่ note ไว้ใน task rule.md) |

## 4. Integration notes

- `src/.warnyin/installer/templates/` ครอบโดย `src/.warnyin/` prefix ใน `ALLOWED_PREFIX` ของ verify-pack → ไม่ต้องแก้ allowlist
- `installAdapterDoc` reuse pattern ของ `installGlobalNote` ทุกประการ (defensive skip + DRY + stats + marker) — ลด code duplication
- adapter ทุกตัวมีเนื้อหา generic pointer ไม่อ้าง model/tool name เฉพาะ (ตาม `rule.md` tool-agnostic)
- backward compat 100% — ไม่ลบ/แตะไฟล์เดิมของ user

## 5. ขั้นถัดไป

→ `/warnyin:verify support-universal-ide`
