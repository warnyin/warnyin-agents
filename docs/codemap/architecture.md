<!-- Generated: 2026-06-11 (rescan หลัง change-sizing-router: triage.md + §7 3-tier) | Files scanned: ~85 src (73 .md + 12 .mjs) | Token estimate: ~860 -->
# Architecture — Warnyin Standard Workflow

## 2-layer (bootstrap / self-hosting)
```
SOURCE (committed, publish)              DOGFOOD (gitignored, install จาก release)
  src/bin/cli.mjs                          root .warnyin/  .claude/{commands/warnyin,agents}
  src/.warnyin/{workflow,template}         root CLAUDE.md  AGENTS.md
  src/.claude/{commands/warnyin,agents}      └ regen: npm run setup:dogfood
  src/AGENTS.md  src/tests/ src/scripts/   .gitignore root-anchored กัน match src/.claude/*
```
- พัฒนา v-next ที่ "อาจพัง" ใน `src/` ได้ โดย workflow ที่ใช้ทำงาน (root dogfood) ยังเสถียร

## ภาพรวม (ผู้ใช้ปลายทาง)
```
ผู้ใช้ปลายทาง
   │  npx @warnyin/agents          (bin → src/bin/cli.mjs; pkgRoot resolve = src/)
   ▼
src/bin/cli.mjs ──copy──▶ โปรเจกต์ปลายทาง:
   │                    .warnyin/{workflow,template}  (core, อัปเดตได้)
   │                    .claude/{commands/warnyin,agents,skills}  (adapter Claude; skills=utility auto-invocable)
   │                    docs/stages/ (scaffold เปล่า — generate)
   │                    docs/* (seed จาก template), CLAUDE.md, AGENTS.md
   ▼
AI harness (Claude Code / Codex) อ่าน playbook กลาง → เดินงาน 5 stage
```

## 5-stage flow (playbook กลางที่ `src/.warnyin/workflow/stages/`)
```
Discovery(optional) ▶ DESIGN ▶ BUILD ▶ VERIFY ▶ SHIP
   discovery.md      design.md  build.md  verify.md ship.md
                                  │
                                  └─ build-wave.mjs (Workflow fan-out ตาม dependency DAG)

output งานจริง: docs/stages/<slug>/  (copy จาก template src/.warnyin/template/stages/[topic]/)
ความรู้ถาวร: docs/  (SHIP promote ขึ้นมา: features/techstack/rule/troubleshooting/codemap)

วงจร spec (living behavior spec — docs/features/<name>/spec.md):
DESIGN เขียน "Spec delta" (design.md §9: ADDED/MODIFIED/REMOVED) ▶ VERIFY ใช้ spec เป็น regression baseline
▶ SHIP merge กึ่ง mechanical (key ไม่เจอ → STOP) ▶ spec ใหม่ = baseline รอบถัดไป — ดู docs/features/spec-delta/

capability เสริม conditional (เฉพาะ topic แตะ REST API — auto-detect): api-doc.md
▶ DESIGN ผลิต openapi.yaml ▶ VERIFY validate โค้ดตรง contract ▶ SHIP promote docs/techstack/<c>/openapi.yaml — ดู docs/features/api-doc/

change-sizing (ต้นน้ำ ก่อนเข้า flow — read-only): triage.md
/warnyin:triage ประเมินขนาด change → tier {fast,standard,large} (signals + hard-floor 5 หมวด) → แนะนำ route แล้วหยุด
▶ fast = fast-track (design §7 skip-list canonical → build 1 agent → verify-lite → ship-lite, คง test floor) ▶ large = บังคับ Discovery — ดู docs/features/change-sizing/
```

## installer flow (src/bin/cli.mjs)
```
pkgRoot = resolve(dirname(import.meta.url), '..')  → src/ (sibling ของ bin/)
guard pkgRoot===target → error  (defensive no-op หลังย้าย: pkgRoot=src/ ไม่มีทาง===target)
 → warn legacy(≤0.2.x / 0.3–0.5.x)
 → copyTree(CORE, overwrite=--update)   .warnyin/{workflow,template} + .claude/{commands/warnyin,agents,skills}
 → ensureScaffold()                     generate docs/stages/{context.md, achieved/.gitkeep} เปล่า (ไม่ copy → กัน leak)
 → seedDocs()                           .warnyin/template/docs/** → docs/** (ข้าม [...], ไม่ทับ)
 → installRootDoc CLAUDE.md + AGENTS.md (append section ถ้ามีอยู่ + marker กันซ้ำ)
```
รายละเอียด helper/ค่าคงที่: `docs/techstack/installer/structure.md`

## dev tooling (src/scripts/ — ไม่ publish)
```
setup-dogfood.mjs   installViaNpx() || installViaPack(npm pack→extract→node cli) → append pointer CONTRIBUTING.md
setup-sandbox.mjs   mkdtempSync(os.tmpdir(),'wy-sandbox-') → node src/bin/cli.mjs ลง temp (test version skew)
verify-pack.mjs     npm pack --json → checkFiles(files)→error[] (allowlist+denylist+tripwire; export ให้ unit)
check-test-count.mjs  parse summary node --test → fail ถ้า fail!=0 / pass<9 / pass!=tests
lint-md.mjs         walk src/+docs/ (exclude template+archived) → checkLinks(docs,exists)→error[] (dead-link gate zero-dep; export ให้ unit)
```

## tool-agnostic design
- **แก่นเดียว** = `src/.warnyin/workflow/*.md` (ทุก harness อ่านชุดเดียวกัน)
- **adapter บาง:** `src/.claude/commands/warnyin/*.md` (user-invoked) + `src/.claude/skills/*/SKILL.md` (auto-invocable, utility read-only) + `src/.claude/agents/warnyin-*.md` + `src/AGENTS.md` (Codex) — ชี้กลับ playbook กลาง ไม่ duplicate logic (skill-adapter convention: `docs/rule.md` §1)
- role card: `src/.warnyin/workflow/roles/` (BA/PO/SA/Tech Lead/Developer/QA/Security/Infra) = **task-level lens**; reviewer subagent `src/.claude/agents/warnyin-{sa,tech-lead,qa,security,infra}.md`
- context profile: `src/.warnyin/workflow/contexts/` (research/build/review) = **session-level posture** (คนละชั้นกับ role); playbook แต่ละ stage มี callout ชี้ context ที่เข้าคู่ (Discovery→research · DESIGN→research+build · BUILD→build · VERIFY→review · SHIP→review); แต่ละ context มี **model-tier guidance** (generic: deepest/balanced/cheap) ใน Tool preference

## เผยแพร่ (packaging)
- `package.json files` granular: `src/bin`, `src/.warnyin`, `src/.claude/commands`, `src/.claude/agents`, `src/.claude/skills`, `src/AGENTS.md`, `README/CHANGELOG/LICENSE` — **ไม่รวม** `src/tests`/`src/scripts` (dev), root dogfood (gitignored)
- nested dotfolder ต้องระบุชัด (npm ไม่รวมอัตโนมัติ — บทเรียน 0.6.0); `verify-pack` เป็น gate พิสูจน์
- CI `.github/workflows/ci.yml`: test matrix [20,22,24] + pass-count gate + pack-verify gate + lint-md gate (dead-link); zero-dep (built-in `node:*`)
