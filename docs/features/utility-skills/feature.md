# Feature — Utility skills (Claude adapter, auto-invocable)

> ความรู้ถาวรระดับ feature · promote จาก topic `skill-format` (achieved 2026-06-07)

## คืออะไร
**utility skill** = Claude Code **project skill** (`src/.claude/skills/<name>/SKILL.md` → `/<name>`) ที่ model **auto-invoke ได้เอง (description-driven)** เมื่อ task ตรง — เป็น **adapter Claude-specific บาง** ที่ body ชี้ playbook กลางเดิม **ไม่ duplicate** (มิติเดียวกับ command `/warnyin:*` แต่ command ต้อง user เรียกมือ)

มี 3 skill (utility read-only ปลอดภัย):
| Skill | `/<name>` | ชี้ playbook | auto-invoke เมื่อ |
|---|---|---|---|
| `update-codemaps` | `/update-codemaps` | `.warnyin/workflow/codemap.md` | หลังเพิ่ม/ย้าย/ลบไฟล์ หรือเปลี่ยนโครงสร้าง → refresh `docs/codemap/` |
| `explore` | `/explore` | `.warnyin/workflow/explore.md` | ต้องการเข้าใจ/ตอบคำถามโครงสร้าง/โค้ด แบบ read-only |
| `next` | `/next` | `.warnyin/workflow/next.md` | อยากรู้ topic ค้าง stage ไหน + command ถัดไป |

## ทำงานยังไง
- **skill format (canonical):** frontmatter YAML 4 key — `name` (=ชื่อ folder, kebab) · `description` (actionable, ใช้ตัดสิน auto-invoke) · `when_to_use` (trigger context, description-driven — **ไม่มี event/file-watch**) · `allowed-tools` (read-only set: `Read, Grep, Glob, Bash(find/ls/grep:*)`); body ภาษาไทยสไตล์ command — "ทำหน้าที่เป็น `<role>` ... อ่าน playbook `.warnyin/workflow/<x>.md` แล้วทำตาม"
- **auto-invocable:** ไม่ใส่ `disable-model-invocation` (default = model เรียกได้) — ปลอดภัยเพราะ **read-only** เท่านั้น
- **ไม่พึ่ง `$ARGUMENTS`:** skill รับ context จาก request ตอน auto-invoke (ไม่ใช้ arg-substitution ของ slash command)
- **pipeline เหมือน payload อื่น:** ship ผ่าน installer `cli.mjs` CORE (`copyTree` recursive) → `package.json files` allowlist (`src/.claude/skills`) → `verify-pack` allow + R1 assert `hasSkills`
- **runtime:** user request ตรง `description` → model auto-invoke skill → skill body พา agent อ่าน playbook กลาง → ทำตาม (เหมือน command path)

## ขอบเขต / ข้อจำกัด (การตัดสินใจเชิงสถาปัตยกรรม)
- **เฉพาะ utility read-only safe → skill auto-invoke** — คุม blast radius ของ auto-invocation
- **irreversible/stateful (build/ship/design/discovery/verify) คงเป็น command** (user-only โดยธรรมชาติ) — มี note ใน `build.md`/`ship.md` ระบุเจตนา; ไม่ทำ skill auto
- **ไม่แปลง package เป็น plugin** — เพื่อรักษา namespace `/warnyin:*` ของ command (non-breaking); skill ยอมรับ namespace `/<name>` (ไม่มี prefix) → **namespace ผสม** เป็น trade-off ที่ยอมรับ
- **ไม่แตะ `AGENTS.md`** (Codex adapter — skill เป็น Claude-only); playbook กลางไม่แตะ (skill ชี้กลับ)
- **3 skill พอ** (opinionated — เฉพาะ utility ที่ปลอดภัยจริง ไม่ไหลเป็น catalog)

## ไฟล์ที่เกี่ยวข้อง
- `src/.claude/skills/{update-codemaps,explore,next}/SKILL.md`
- installer: `src/bin/cli.mjs` (CORE +`.claude/skills`) · `package.json` files (+`src/.claude/skills`) · `src/scripts/verify-pack.mjs` (ALLOWED_PREFIX + `hasSkills` R1)
- guard test: `src/tests/{verify-pack,installer}.test.mjs`
- เจตนา command-only: note ใน `src/.claude/commands/warnyin/{build,ship}.md`
- เทียบมิติ: command `/warnyin:*` (`src/.claude/commands/warnyin/`) = user-invoked adapter; rule กลาง `docs/rule.md` §1 (skill-adapter convention)
