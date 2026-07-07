<!-- Generated: 2026-07-08 (rescan: +build-lean (fast-track receipt + loop-tuning.md single-source + worktree per-wave + prompt lean + validator fast-mode) +backlog (0.23.0) | prev: +learning-loop-tuning +minimalism +interop) | Files scanned: ~95 src | Token estimate: ~780 -->
# Codemap — Warnyin Standard Workflow

> repo = **tool/library** (npm `@warnyin/agents`) ไม่ใช่ app — ส่งมอบ "ways of work" 5 stage ลงโปรเจกต์อื่น
> token-lean codemap สำหรับโหลดเข้า context

## ชนิด
single library (zero-dependency, ESM, Node ≥20) เผยแพร่ผ่าน npx — สถาปัตยกรรม **bootstrap / self-hosting**

## 2-layer (bootstrap)
| layer | ที่อยู่ | สถานะ git | คือ |
|---|---|---|---|
| **SOURCE** | `src/**` | committed + publish | warnyin v-next ที่กำลังพัฒนา (= สิ่งที่ติดตั้งให้ผู้ใช้) |
| **DOGFOOD** | root `.warnyin/`, `.claude/{commands/warnyin,agents}`, `CLAUDE.md`, `AGENTS.md` | **gitignored** (root-anchored) | release เสถียรที่ install ไว้ "ใช้พัฒนา" `src/` — regen ด้วย `npm run setup:dogfood` |

## Component หลัก (อยู่ใน SOURCE layer `src/`)
| component | ที่อยู่ | หน้าที่ | codemap |
|---|---|---|---|
| **installer** | `src/bin/cli.mjs` + `src/tests/` + `src/scripts/` + `.github/` | ติดตั้ง/อัปเดต workflow ลงโปรเจกต์ปลายทาง (per-project default) + **global mode** (`--global` → `~/`, ใช้ทุกโปรเจกต์ — `docs/features/global-install/`) | `docs/techstack/installer/` |
| **workflow core** | `src/.warnyin/workflow/` | playbook กลาง 5 stage + role card + script (เนื้อหา `.md` tool-agnostic) | `architecture.md` |
| **templates** | `src/.warnyin/template/` | โครง output ของแต่ละ stage + seed `docs/` + living behavior spec ต่อ feature (`docs/features/[feature-name]/spec.md` — ดู `docs/features/spec-delta/`) | `architecture.md` |
| **adapters** | `src/.claude/` (`commands/warnyin` user-invoked · `skills` auto-invocable utility · `agents`) + `src/AGENTS.md` | thin adapter ชี้กลับ playbook กลาง (Claude Code / Codex) | `architecture.md` · `docs/features/utility-skills/` |

## Entry points
- `src/bin/cli.mjs` — installer (npx; bin → ที่นี่); main-guard ใช้ `isEntrypoint` realpath argv[1] (ทน symlink npx/.bin/dogfood-tmpdir); export `resolveMode` + `isEntrypoint`
- `src/.warnyin/workflow/scripts/build-wave.mjs` — Workflow fan-out ของ BUILD stage (รับ `baseRef` → agent sync build branch เข้า worktree ก่อนทำงาน; `tasks: string[] | {name, model?}[]` — `normalizeTasks`/`buildOpts` ส่ง `model` per task เข้า `agent()` แบบ pass-through generic; **prompt lean** — สั่งอ่านแค่ role card + 4 ไฟล์ task + techstack rule.md ของ component ที่แตะ, มี test คุ้ม contract เคส F-K; worktree เฉพาะ wave ≥2 task — wave เดี่ยว `isolate:false` shared tree)
- `src/.warnyin/workflow/scripts/validate-topic.mjs` — structural validator + status (zero-dep; เรียกจาก next/DESIGN gate/SHIP; **fast-mode**: receipt filled อย่างเดียว → ข้าม C1-C4 แสดง `fast-track`, ปนโครง full → full checks + ⚠ C6 — ดู `docs/features/topic-validator/`)
- `src/.warnyin/workflow/stages/*.md` — playbook ต้นทางของแต่ละ stage (single source of truth)
- `src/.warnyin/workflow/contexts/*.md` — context profile (session-level posture: research/build/review) ที่ stage playbook ชี้ถึง
- `src/.warnyin/workflow/roles/*.md` — role card (task-level lens); `ux.md` = UX/UI Designer (lens ของ generator `warnyin-ux`)
- `src/.claude/agents/warnyin-ux.md` — **generator agent** (read-only, `tools: Read,Grep,Glob`) วาด ASCII wireframe ใน DESIGN step 4.5 → คืน text, main loop persist; แยกจาก reviewer 5 ตัว (panel) — ดู `docs/features/uxui-wireframe/`
- `src/.warnyin/workflow/stages/design.md §4 step 4.5` — capability **UX wireframe** (stage-invoked, generator variant): auto-detect change มี UI surface → fan-out `warnyin-ux` วาด wireframe (`docs/stages/<slug>/wireframe.md`, 4 section) + approve gate ก่อนแตก task; ไม่มี UI surface → ข้าม + gate §8 N/A (backward compatible); template `template/stages/[topic]/wireframe.md` — ดู `docs/features/uxui-wireframe/`
- `src/.warnyin/workflow/api-doc.md` — capability เสริม conditional (stage เรียกเองเมื่อ auto-detect topic แตะ REST API): ผลิต/verify/promote OpenAPI 3.1 contract — ดู `docs/features/api-doc/`
- `src/.warnyin/workflow/minimalism.md` — **principle กลาง** "เขียนน้อยที่สุด" (single source): decision hierarchy 6 ขั้น (YAGNI→stdlib→native→dep→one-liner→ขั้นต่ำ) + guardrail "lazy not negligent"; surface ผลิต (`roles/developer.md`,`contexts/build.md`,`stages/build.md`) + ตรวจ (`contexts/review.md`,`stages/verify.md`) pointer มา (canonical-copy); always-on zero-config — ดู `docs/features/minimalism/`
- `src/.warnyin/workflow/interop.md` — **stage-invoked capability** "companion-tool consult-if-present" (single source): consult เครื่องมือภายนอกที่ผลิต artifact บนดิสก์ แบบ conditional file-exists (มี→agent อ่านเป็น untrusted context + trust-boundary guard; ไม่มี→suggest) + inclusion bar 4 ข้อ + reference-not-vendor; touchpoint comprehension (`init.md`,`codemap.md`,`explore.md`,`stages/discovery.md`,`roles/README.md`) pointer conditional มา; entry แรก = Understand-Anything (`.understand-anything/knowledge-graph.json`, MIT); **+ convention "archive ≠ current state"** (§2): comprehension default-exclude `docs/stages/achieved/` (archive — current state อ่านจาก features/rule/codemap) — ดู `docs/features/interop/`
- `src/.warnyin/workflow/triage.md` — capability `/warnyin:triage` (read-only router): ประเมินขนาด change → tier `{fast,standard,large}` (rubric canonical: signals + hard-floor 5 หมวด + escalation + fast-track skip-list + **caps §2D** ขนาดเอกสารต่อ tier) → แนะนำ route แล้วหยุด; fast = **pre-flight receipt → code-first → verify-lite → ship-lite** (template `template/stages/receipt.md` — นอก `[topic]/`); `design.md §7`/`build.md`/`verify.md`/`ship.md` ชี้ skip-list canonical นี้ — ดู `docs/features/change-sizing/`
- `src/.warnyin/workflow/stages/discovery.md §3.5` — capability **Discovery modes** (canonical): 5 mode ปรับความเข้ม Discovery `{ไว, สมดุล, ละเอียด, โต้วาที, ไต่สวน}` + auto-suggest (precedence) + multi-agent (`โต้วาที` fan-out / `ไต่สวน` Blue/Red iterative + memory `debate/`); orthogonal กับ tier/context-profile; command `/warnyin:discovery <slug> [mode]` ชี้มา — ดู `docs/features/discovery-modes/`
- `src/.warnyin/workflow/feedback.md` — capability **`/warnyin:feedback:issue`** (action-utility, canonical): เปิด GitHub issue ที่ `warnyin/warnyin-agents` (hardcode) 3 ประเภท (Bug/Feature/Improvement, title prefix + best-effort label) + detect ladder `gh`→`gh auth status`→fallback URL + confirm gate บังคับ + privacy (ไม่ดึง session context เอง); มี outward side-effect → command user-only (ไม่ auto-invoke) — ดู `docs/features/feedback-issue/`
- `src/.warnyin/workflow/loop-tuning.md` — capability **Learning Loop Tuning** (guidance-only, **orchestrator-only single-source**): why-guidance ของ fix loop (credit-horizon + experience-batching + guard ไม่ลด correctness) — จุดที่ loop รัน (`stages/build.md §4 step6` / `stages/verify.md §4 step5`) เหลือ pointer + report note non-blocking; default-by-tier canonical ที่ `triage.md §2C`; starting-artifact note ใน design §4 step7; ตกผลึกจาก paper arXiv:2603.23994v2 — ดู `docs/features/learning-loop-tuning/`
- `src/.warnyin/workflow/backlog.md` — capability **backlog** (canonical): เก็บ issue/idea ที่เลือกไม่ทำรอบนี้เป็น entry `open` ระดับ topic (`docs/stages/<slug>/backlog.md` — template ใน `[topic]/`) → SHIP promote เข้า `docs/backlog.md` global (dedup + `มาจาก topic`); hook ใน verify/ship/discovery/next (มากับ release 0.23.0)
- `src/.claude/skills/*/SKILL.md` — utility skill auto-invocable (`/update-codemaps`, `/explore`, `/next`) ชี้ playbook กลาง
- `src/.claude/commands/warnyin/triage.md` — command adapter `/warnyin:triage` (user-invoked, read-only) ชี้ `triage.md` playbook
- `src/.claude/commands/warnyin/feedback/issue.md` — command adapter `/warnyin:feedback:issue` (**nested namespace แรก** `warnyin/feedback/`) ชี้ `feedback.md` playbook

## Dev tooling (`src/scripts/` — ไม่ publish)
- `verify-pack.mjs` (pack-verify gate, export `checkFiles`) · `check-test-count.mjs` (pass-count gate) · `lint-md.mjs` (dead-link gate, export `checkLinks`)
- `setup-dogfood.mjs` (install release → root; `--update` + **version-aware** `verifyInstalled(root,expected)` เทียบ stamp ไม่ใช่แค่ marker, **active เมื่อ expected≥0.17.0**; pin-exact+prefer-online สมมาตร npx/pack + `checkTarballVersion` ที่ source; npx explicit bin; export resolveExpectedVersion/parseNpmViewVersion/readStamp/semverGte/checkTarballVersion) · `setup-sandbox.mjs` (install v-next จาก src/ → temp)

## ไฟล์ codemap
- `architecture.md` — โครงระดับสูง + 2-layer + flow installer + การไหลของ 5 stage
- (ไม่มี backend/frontend/data — repo เป็น tool เนื้อหา `.md` + installer)

## เอกสาร onboarding
- `docs/example-walkthrough.md` — worked example เดินครบ 5 stage ของ topic จริง (`cli-legacy-warning-fix`) ให้ผู้ใช้ใหม่เห็น artifact จริง (ชี้ `docs/stages/achieved/` + playbook `src/.warnyin/`); ดู `docs/rule.md` §1 worked-example convention
