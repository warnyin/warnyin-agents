<!-- Generated: 2026-08-16 (rescan หลัง v0.30.0 lean-ceremony: BUILD+VERIFY artifact เดียว + validator C7 cap gate + memory hook 3 จุด | prev: v0.18-0.21 uxui-wireframe + minimalism + interop + archive≠current-state) | Files scanned: 117 src (95 .md + 19 .mjs + template อื่น) | Token estimate: ~980 -->
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
   discovery.md      design.md  build.md  verify.md ship.md   ← playbook (คนละไฟล์ ทุก stage)
                                  │
                                  └─ build-wave.mjs (Workflow fan-out ตาม dependency DAG)

output งานจริง: docs/stages/<slug>/  (copy จาก template src/.warnyin/template/stages/[topic]/)
  artifact ของ BUILD+VERIFY = build.md ไฟล์เดียว 4 section (§1 ผล build · §2 gate · §3 แผนเทส · §4 ผล verify)
  — VERIFY ยังเป็น stage แยก (ผู้ตรวจอิสระจากผู้เขียน) แค่ share artifact; validator infer VERIFY จาก "§4 มีเนื้อจริง"
  — topic เก่าที่มี test.md/verify.md = backward-compat (optional ใน STAGES ของ validator)
ความรู้ถาวร: docs/  (SHIP promote ขึ้นมา: features/techstack/rule/troubleshooting/codemap)

วงจร spec (living behavior spec — docs/features/<name>/spec.md):
DESIGN เขียน "Spec delta" (design.md §9: ADDED/MODIFIED/REMOVED) ▶ VERIFY ใช้ spec เป็น regression baseline
▶ SHIP merge กึ่ง mechanical (key ไม่เจอ → STOP) ▶ spec ใหม่ = baseline รอบถัดไป — ดู docs/features/spec-delta/

capability เสริม conditional (เฉพาะ topic แตะ REST API — auto-detect): api-doc.md
▶ DESIGN ผลิต openapi.yaml ▶ VERIFY validate โค้ดตรง contract ▶ SHIP promote docs/techstack/<c>/openapi.yaml — ดู docs/features/api-doc/

change-sizing (ต้นน้ำ ก่อนเข้า flow — read-only): triage.md
/warnyin:triage ประเมินขนาด change → tier {fast,standard,large} (signals + hard-floor 5 หมวด) → แนะนำ route แล้วหยุด
▶ fast = fast-track (pre-flight สร้าง receipt ก่อนแตะโค้ด → code-first main loop ไม่ fan-out → verify-lite เติม receipt §4 → ship-lite + hard-floor scan, คง test floor — skip-list canonical triage.md)
   ผู้เดิน fast 2 ทาง: user สั่งทีละ stage · หรือ /warnyin:fastlane เดินครบ 4 row จบในคำสั่งเดียว (executor — fastlane.md; hard-floor explicit override ได้ผ่านทางนี้เท่านั้น) — ดู docs/features/fastlane/
▶ large = บังคับ Discovery — ดู docs/features/change-sizing/
```

## installer flow (src/bin/cli.mjs)
```
pkgRoot = resolve(dirname(import.meta.url), '..')  → src/ (sibling ของ bin/)
mode = resolveMode(flags/isTTY/answer)   project(default) | global(--global)   # non-TTY→project (CI-safe)
target = global ? os.homedir()(+guard) : cwd
guard pkgRoot===target → error  (defensive no-op: pkgRoot=src/ ไม่มีทาง===target)
 → warn legacy(≤0.2.x / 0.3–0.5.x)
 → copyTree(CORE, overwrite=--update)   .warnyin/{workflow,template} + .claude/{commands/warnyin,agents,skills}   (global first-install: overwrite=false)
 → writeVersionStamp()   target/.warnyin/.warnyin-version = pkg version (unconditional; ทั้ง 2 mode; เคารพ DRY)   # version identity
 [project] → ensureScaffold() + seedDocs() + installRootDoc CLAUDE.md/AGENTS.md (append+marker)
 [global]  → skip scaffold/seed (ยกให้ /warnyin:init) + installGlobalNote()→~/.claude/CLAUDE.md (note-only+marker) + ข้าม AGENTS.md
─────
main-guard: isEntrypoint(argv[1], import.meta.url)  # realpath ทั้งสองฝั่ง — ทน symlink (npx .bin / dogfood tmpdir); path.resolve เดิม mismatch → main() เงียบ
```
- **global mode (feature `global-install`):** ติดตั้ง adapter+playbook ลง `~/` ใช้ทุกโปรเจกต์ (opt-in); resolve playbook **local-first (`./.warnyin/`) → global (`~/.warnyin/`)** ผ่าน convention ใน CLAUDE.md/AGENTS.md/CLAUDE.global.md; per-project = default — ดู `docs/features/global-install/`
รายละเอียด helper/ค่าคงที่: `docs/techstack/installer/structure.md`

## dev tooling (src/scripts/ — ไม่ publish)
```
setup-dogfood.mjs   resolveExpectedVersion(npm view) → installViaNpx(explicit bin)/Pack(EXPECTED, pin-exact+prefer-online สมมาตร; pack: checkTarballVersion ที่ source) → verifyInstalled(root,expected) เทียบ stamp (drift/stamp-ขาด≥0.17.0→fail-loud) → append pointer CONTRIBUTING.md
setup-sandbox.mjs   mkdtempSync(os.tmpdir(),'wy-sandbox-') → node src/bin/cli.mjs ลง temp (test version skew)
verify-pack.mjs     npm pack --json → checkFiles(files)→error[] (allowlist+denylist+tripwire; export ให้ unit)
check-test-count.mjs  parse summary node --test → fail ถ้า fail!=0 / pass<MIN_PASS (240 = ปัดลงหลักสิบของ N−5, N=248) / pass!=tests
lint-md.mjs         walk src/+docs/ (exclude template+archived) → checkLinks(docs,exists)→error[] (dead-link gate zero-dep; export ให้ unit)
```

## tool-agnostic design
- **แก่นเดียว** = `src/.warnyin/workflow/*.md` (ทุก harness อ่านชุดเดียวกัน)
- **adapter บาง:** `src/.claude/commands/warnyin/*.md` (user-invoked) + `src/.claude/skills/*/SKILL.md` (auto-invocable, utility read-only) + `src/.claude/agents/warnyin-*.md` + `src/AGENTS.md` (Codex) — ชี้กลับ playbook กลาง ไม่ duplicate logic (skill-adapter convention: `docs/rule.md` §1)
- role card: `src/.warnyin/workflow/roles/` (BA/PO/SA/Tech Lead/Developer/QA/Security/Infra) = **task-level lens**; reviewer subagent `src/.claude/agents/warnyin-{sa,tech-lead,qa,security,infra}.md`
- context profile: `src/.warnyin/workflow/contexts/` (research/build/review) = **session-level posture** (คนละชั้นกับ role); playbook แต่ละ stage มี callout ชี้ context ที่เข้าคู่ (Discovery→research · DESIGN→research+build · BUILD→build · VERIFY→review · SHIP→review); แต่ละ context มี **model-tier guidance** (generic: deepest/balanced/cheap) ใน Tool preference
- **principle / capability docs (top-level `src/.warnyin/workflow/*.md`):**
  - `minimalism.md` — principle "เขียนน้อยที่สุด" (decision hierarchy + lazy-not-negligent guardrail); always-on, surface ผลิต/ตรวจ pointer มา — `docs/features/minimalism/`
  - `interop.md` — stage-invoked capability "companion-tool consult-if-present" (UA knowledge graph) + trust-boundary guard (untrusted artifact) + **convention "archive ≠ current state"** (comprehension default-exclude `docs/stages/achieved/`) — `docs/features/interop/`
  - `memory.md` — capability **project memory** (canonical, 9 heading freeze): write hook **3 จุด = "จุดจบงาน"** (`stages/build.md §4` main loop เท่านั้น · `stages/ship.md §4` · `fastlane.md §3`) — Discovery/DESIGN/VERIFY ไม่มี hook เพราะ artifact ของตัวเองบันทึกสถานะครบแล้ว; consume 3 จุด (data ไม่ใช่ instruction) — `docs/features/project-memory/`
  - `triage.md` (change-sizing) · `fastlane.md` (executor fast tier — one-shot 4-row, `docs/features/fastlane/`) · `api-doc.md` (REST contract) · `feedback.md` (issue) · `discovery.md §3.5` (Discovery modes) — capability เสริม conditional/utility, stage หรือ command ชี้มา
- **payload script (`src/.warnyin/workflow/scripts/` — ติดตั้งไปกับ payload, harness/CLI เรียก):** `build-wave.mjs` (Workflow fan-out) · `memory-status.mjs` (report, exit 0 เสมอ) · `validate-topic.mjs` (structural validator C1–C7 zero-dep read-only: โครง/ลำดับ stage + **C7 cap ต่อ tier** mirror `triage.md §2D` + stage inference แบบ section-based; ✖ = existence/structure, ⚠ = heuristic — `docs/features/topic-validator/`)
- generator agent: `src/.claude/agents/warnyin-ux.md` (ASCII wireframe ใน DESIGN step 4.5, read-only) — `docs/features/uxui-wireframe/`

## เผยแพร่ (packaging)
- `package.json files` granular: `src/bin`, `src/.warnyin`, `src/.claude/commands`, `src/.claude/agents`, `src/.claude/skills`, `src/AGENTS.md`, `README/CHANGELOG/LICENSE` — **ไม่รวม** `src/tests`/`src/scripts` (dev), root dogfood (gitignored)
- nested dotfolder ต้องระบุชัด (npm ไม่รวมอัตโนมัติ — บทเรียน 0.6.0); `verify-pack` เป็น gate พิสูจน์
- CI `.github/workflows/ci.yml`: test matrix [20,22,24] + pass-count gate + pack-verify gate + lint-md gate (dead-link); zero-dep (built-in `node:*`)
