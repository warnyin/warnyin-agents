<!-- Generated: 2026-06-06 | Files scanned: ~62 | Token estimate: ~450 -->
# Codemap — Warnyin Standard Workflow

> repo = **tool/library** (npm `@warnyin/agents`) ไม่ใช่ app — ส่งมอบ "ways of work" 5 stage ลงโปรเจกต์อื่น
> token-lean codemap สำหรับโหลดเข้า context

## ชนิด
single library (zero-dependency, ESM, Node ≥20) เผยแพร่ผ่าน npx

## Component หลัก
| component | ที่อยู่ | หน้าที่ | codemap |
|---|---|---|---|
| **installer** | `bin/cli.mjs` + `tests/` + `scripts/` + `.github/` | ติดตั้ง/อัปเดต workflow ลงโปรเจกต์ปลายทาง (โค้ดรันได้เดียวใน repo) | `docs/techstack/installer/` |
| **workflow core** | `.warnyin/workflow/` | playbook กลาง 5 stage + role card + script (เนื้อหา `.md` tool-agnostic) | `architecture.md` |
| **templates** | `.warnyin/template/` | โครง output ของแต่ละ stage + seed `docs/` | `architecture.md` |
| **adapters** | `.claude/` + `AGENTS.md` | thin adapter ชี้กลับ playbook กลาง (Claude Code / Codex) | `architecture.md` |

## Entry points
- `bin/cli.mjs` — installer (npx)
- `.warnyin/workflow/scripts/build-wave.mjs` — Workflow fan-out ของ BUILD stage
- `.warnyin/workflow/stages/*.md` — playbook ต้นทางของแต่ละ stage (single source of truth)

## ไฟล์ codemap
- `architecture.md` — โครงระดับสูง + flow installer + การไหลของ 5 stage
- (ไม่มี backend/frontend/data — repo เป็น tool เนื้อหา `.md` + installer)
