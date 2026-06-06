<!-- Generated: 2026-06-06 | Files scanned: ~62 | Token estimate: ~600 -->
# Architecture — Warnyin Standard Workflow

## ภาพรวม
```
ผู้ใช้ปลายทาง
   │  npx @warnyin/agents
   ▼
bin/cli.mjs ──copy──▶ โปรเจกต์ปลายทาง:
   │                    .warnyin/{workflow,template}  (core, อัปเดตได้)
   │                    .claude/{commands/warnyin,agents}  (adapter Claude)
   │                    docs/stages/ (scaffold เปล่า — generate)
   │                    docs/* (seed จาก template), CLAUDE.md, AGENTS.md
   ▼
AI harness (Claude Code / Codex) อ่าน playbook กลาง → เดินงาน 5 stage
```

## 5-stage flow (playbook กลางที่ `.warnyin/workflow/stages/`)
```
Discovery(optional) ▶ DESIGN ▶ BUILD ▶ VERIFY ▶ SHIP
   discovery.md      design.md  build.md  verify.md ship.md
                                  │
                                  └─ build-wave.mjs (Workflow fan-out ตาม dependency DAG)

output งานจริง: docs/stages/<slug>/  (copy จาก template .warnyin/template/stages/[topic]/)
ความรู้ถาวร: docs/  (SHIP promote ขึ้นมา: features/techstack/rule/troubleshooting/codemap)
```

## installer flow (bin/cli.mjs)
```
guard pkgRoot≠target → warn legacy(≤0.2.x / 0.3–0.5.x)
 → copyTree(CORE, overwrite=--update)   .warnyin/{workflow,template} + .claude/{commands/warnyin,agents}
 → ensureScaffold()                     generate docs/stages/{context.md, achieved/.gitkeep} เปล่า (ไม่ copy → กัน leak)
 → seedDocs()                           .warnyin/template/docs/** → docs/** (ข้าม [...], ไม่ทับ)
 → installRootDoc CLAUDE.md + AGENTS.md (append section ถ้ามีอยู่ + marker กันซ้ำ)
```
รายละเอียด helper/ค่าคงที่: `docs/techstack/installer/structure.md`

## tool-agnostic design
- **แก่นเดียว** = `.warnyin/workflow/*.md` (ทุก harness อ่านชุดเดียวกัน)
- **adapter บาง:** `.claude/commands/warnyin/*.md` (slash command) + `.claude/agents/warnyin-*.md` (reviewer subagent) + `AGENTS.md` (Codex/Antigravity) — ทุกตัวชี้กลับ playbook กลาง ไม่ duplicate logic

## role / review
`.warnyin/workflow/roles/` — BA/PO/SA/Tech Lead/Developer/QA/Security/Infra (lens ต่อ stage)
`.claude/agents/warnyin-{sa,tech-lead,qa,security,infra}.md` — reviewer subagent (DESIGN review panel, read-only)

## เผยแพร่ (packaging)
- `package.json files` (allowlist): `bin`, `.warnyin`, `.claude/{commands,agents}`, `CLAUDE.md`, `AGENTS.md` — **ไม่รวม `docs/`** (งานจริง/roadmap ไม่ publish; scaffold installer สร้างเอง)
- CI: `.github/workflows/ci.yml` → test matrix [20,22,24] + pack-verify gate
- zero external dependency — ทุกอย่าง built-in `node:*`
