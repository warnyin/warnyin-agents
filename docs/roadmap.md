# Roadmap — การพัฒนา Warnyin Standard Workflow

> แผนพัฒนา **ตัว tool Warnyin เอง** (ไม่ใช่ docs ของโปรเจกต์ปลายทาง)
> ไฟล์นี้ไม่ถูก publish ขึ้น npm — `package.json` `files` ไม่รวม `docs/` (เจาะจงเฉพาะ `bin`/`.warnyin`/`.claude` + root docs); scaffold `docs/stages` installer สร้างเองตอนติดตั้ง
> อัปเดต: 2026-06-07 · ทยอยติ๊ก `- [ ]` เมื่อทำเสร็จ

## หลักการชี้นำ (กันเดินผิดทาง)

ทุกข้อใน roadmap ต้องผ่าน 3 เกณฑ์นี้ ไม่งั้นตัดทิ้ง:
- **กระทัดรัด opinionated** — เลือก 5 stage + role จำกัดเป็นจุดแข็ง ห้ามไหลเป็น catalog (บทเรียนจาก ECC ที่จมกับ skill 251 ตัว overlap กันเอง)
- **tool-agnostic** — แก่นเป็น `.md` กลางที่ทุก harness อ่านได้ (`.warnyin/workflow/`) อะไรที่ผูก Claude (hook/skill) ต้องเป็น *adapter บาง* ชี้กลับแก่นกลาง ไม่ย้ายแก่นไปผูก tool
- **ห้ามเดา** — ไม่ชัดถาม user; enforce ด้วย rule/checklist ในตัว playbook

---

## P0 — ความแข็งแรงพื้นฐาน (ทำก่อน — เพิ่งปล่อย 0.6.0 breaking แต่ยังไม่มี test/CI)

### 1. Test ของ installer (`bin/cli.mjs`) ✅ (ship 2026-06-06 · topic `installer-test-ci`)
- [x] test: วางโครงถูกตำแหน่ง (`.warnyin/{workflow,template}`, `docs/stages`, seed `docs/`)
- [x] test: **idempotent** — รันซ้ำไม่พัง ไม่ทับซ้ำ
- [x] test: `--update` เขียนทับเฉพาะ CORE ไม่แตะ `docs/` และงานจริง
- [x] test: legacy detection เตือนถูกเมื่อเจอ `warnyin/` เก่า (และ ≤0.2.x)
- **ทำไม:** installer คือหัวใจที่คนติดตั้งจริง แต่ตอนนี้ทดสอบด้วยมือล้วน
- **เสร็จแล้ว:** `tests/installer.test.mjs` black-box 9 เคส (เกิน 4 — เพิ่ม installRootDoc/seedDocs/--dry-run/scaffold-leak), `npm test` เขียวใน temp จริง

### 2. CI (`.github/workflows`) ✅ (ship 2026-06-06 · topic `installer-test-ci`)
- [x] รัน test ข้อ 1 ทุก PR (matrix: **node 20/22/24** — node 18 EOL, drop)
- [x] **`npm pack` + ยืนยัน `.warnyin/` dotfolder ติดไปจริง** + ไม่มี `docs/`/`tests`/`.github` รั่ว (`scripts/verify-pack.mjs`)
- [ ] (ทำต่อจากข้อ 12) lint/format check
- **เสร็จแล้ว:** `.github/workflows/ci.yml` (test matrix + job pack-verify, security baseline); ยืนยัน CI เขียวบน PR จริงทำตอนเปิด PR/merge

### 3. CHANGELOG.md + migration note 0.6.0 ✅ (topic `roadmap-sync-p0`)
- [x] สร้าง `CHANGELOG.md` (รูปแบบ Keep a Changelog)
- [x] บันทึก 0.6.0: ย้าย `warnyin/` → `.warnyin/` (core) + `docs/stages/` (งานจริง) — **breaking** (รวมใน Migration guide section)
- [x] เขียน migration ที่ผู้ใช้เดิมต้องทำ
- [x] **(ปิดแล้ว · topic `cli-legacy-warning-fix` 2026-06-07)** แก้ legacy warning ใน `src/bin/cli.mjs` ให้ตรง Migration guide robust (`git mv .../* docs/stages/` + `rm -rf` core เก่า) — 3-way consistency (cli/CHANGELOG/test) + executable migration proof ผ่านทั้ง 2 รุ่น
- **เสร็จแล้ว:** Migration guide section ใน `CHANGELOG.md` ครอบ ≤0.2.x / 0.3–0.5.x + ระบุ 0.6.0→0.7.0 ไม่กระทบผู้ใช้ปลายทาง; คำสั่ง verify จริงแล้วทั้งกรณี migrate-ก่อน/หลัง-install (VERIFY)

### 4. ตรวจ/เสริม README ✅ (topic `roadmap-sync-p0`)
- [x] เช็คว่าทุก path/โครงใน README ตรงโครง (อัปเดตเป็น 0.7.0 layout `.warnyin/` + `src/` แล้ว — topic `src-bootstrap`)
- [x] มี quickstart (`npx @warnyin/agents` → `/warnyin:init` → stage แรก)
- [x] ลิงก์ไป migration ใน CHANGELOG (section "ติดตั้ง" → `CHANGELOG.md#migration-guide`)
- **เสร็จแล้ว:** อ่าน README แล้วเริ่มใช้ + อัปเกรดจากรุ่นเก่าได้โดยไม่ต้องเปิดซอร์ส

---

## P1 — เพิ่มคุณค่า workflow (ไอเดียจาก ECC ที่ผ่านเกณฑ์ปรัชญา)

### 5. Context profiles (คุ้มสุด — แทบฟรี) ✅ DONE (2026-06-07 · topic `context-profiles`)
- [x] เพิ่ม `.warnyin/workflow/contexts/{research,build,review,README}.md` — **session-level mode** (คนละมิติกับ role card ที่เป็น task-level lens)
- [x] ผูกเข้าแต่ละ stage ใน playbook (callout: Discovery→research · DESIGN→research+build · BUILD→build · VERIFY→review · SHIP→review)
- **ที่มา:** ECC `contexts/` · `.md` ล้วน ไม่ผูก tool ตรงปรัชญา · ดู `docs/features/context-profiles/`
- **ต่อยอด (future):** auto-activation ตาม stage (รอบนี้ manual); context เพิ่มเกิน 3 ตัวถ้าจำเป็น

### 6. Defensive rules ใน BUILD/VERIFY playbook ✅ DONE (2026-06-07 · topic `defensive-rules`)
- [x] **investigate-before-edit** — ก่อนแก้ไฟล์ ต้องเข้าใจ (ใครใช้ไฟล์นี้ / schema/contract / เจตนา) ก่อน
- [x] **ห้ามแก้ config linter/formatter ให้ผ่าน** แทนการแก้โค้ดจริง (config-protection)
- **ที่มา:** ECC hook `gateguard-fact-force` + `config-protection` — แต่เราทำเป็น **rule ใน playbook** (portable) ไม่ใช่ vendor hook (Claude-only) = เวอร์ชัน enforce ของ "ห้ามเดา"
- **ผล:** 2 operating principle ใน build.md/verify.md §3 + checklist ใน developer.md/qa.md + global `docs/rule.md` §1

### 7. Security checklist รูปธรรม ✅ DONE (2026-06-07)
- [x] เสริม `.warnyin/workflow/roles/security.md` + VERIFY: section "Runtime / operational security" (P1 secret isolation / P2 no-egress / P3 identity separation + Claude adapter note `Read(**/.env*)`/`~/.ssh`); `verify.md` §2 อ้างตอนรัน local env
- [x] **supply-chain ของ MCP/skill** — `install-skill.md` step 4 เสริม warning prompt-injection + checklist item S1 ใน security.md
- [x] global: `docs/rule.md` §3 ขยายเป็น Security baseline 2 มิติ (3.1 CI + 3.2 agent-runtime)
- **ที่มา:** ECC `the-security-guide.md` — หยิบเฉพาะสาระ portable · **ลงที่:** role card + VERIFY playbook + install-skill command + global rule §3.2

### 8. Learned-rule artifact ใน SHIP (instinct แบบ manual) ✅ DONE (2026-06-07)
- [x] SHIP เพิ่ม learned-rule capture: `rule (generalize) + evidence (บังคับ) + scope (component/project)` ที่ **user ยืนยัน per-rule** — fold เข้า approval เดิม (`ship.md` §4 step 1/3/5 + §6 gate)
- [x] ต่อยอดกลไก promote เดิม (unify — note "รอ SHIP" = subset planned ของ learned-rule); mirror command + template section "Learned rules"
- [x] global: `docs/rule.md` §1 + continuous-learning discipline + unify-in-place (dogfood: SHIP ของ topic นี้ promote 2 learned-rule เอง)
- **ที่มา:** ECC instinct/continuous-learning — ยืมแค่*แก่น* manual ~80% โดยไม่มี runtime observer (hook+SQLite) · **ลงที่:** `ship.md` playbook + command + template `[topic]/ship.md` + global rule §1

### 9. Skill-format สำหรับ utility ที่ปลอดภัย ✅ DONE (2026-06-07 · ship 0.8.4)
- [x] `update-codemaps` / `explore` / `next` → 3 skill auto-invocable (`src/.claude/skills/<name>/SKILL.md`, description-driven; read-only allowed-tools) body ชี้ playbook กลาง ไม่ duplicate
- [x] `build` / `ship` **คงเป็น command (user-only)** + note เหตุผล (irreversible/stateful) — *แทน* `disable-model-invocation` ที่ moot สำหรับ command (DESIGN D3); ไม่แปลง package เป็น plugin (รักษา namespace `/warnyin:*` = non-breaking)
- [x] plumbing: `cli.mjs` CORE + `package.json files` + `verify-pack` (`hasSkills` R1) + 2 test (suite 18→19); คง playbook กลาง + `AGENTS.md` (Codex) ไม่แตะ
- [x] global: `docs/rule.md` §1 skill-adapter convention + feature `docs/features/utility-skills/`
- **ที่มา:** roadmap P1 ปิดท้าย · **ลงที่:** Claude adapter (`src/.claude/skills/`) + installer/packaging/test + global rule §1 + feature doc

---

## P2 — ความครบถ้วน/ประสบการณ์ผู้ใช้ (ทำเมื่อ workflow นิ่ง)

### 10. Worked example — topic ตัวอย่างเดินครบ 5 stage ✅ DONE (2026-06-07 · topic `examples`)
- [x] 1 ตัวอย่างจริง (discovery→ship): `docs/example-walkthrough.md` ไล่ topic `cli-legacy-warning-fix` ครบ 5 stage (เน้น decision + ลิงก์ artifact จริง) + README pointer
- [x] **surface achieved เดิม ไม่ duplicate/ไม่ ship** (Q1) — เลี่ยง staleness ที่ roadmap เตือน; disclaimer snapshot + ชี้ `src/.warnyin/` เป็น source ปัจจุบัน
- [x] global: `docs/rule.md` §1 worked-example convention + §5 verify-doc accuracy-vs-source
- **หมายเหตุ:** ไม่สร้างโฟลเดอร์ `examples/` แยก (achieved/ เป็น single source — walkthrough ชี้กลับ); ดูแลง่าย maintenance ต่ำ

### 11. Selective install (manifest-driven) — ⏸️ DEFER (feasibility eval 2026-06-07)
- [ ] เฉพาะถ้าจะรองรับ "เลือกติดตั้งบาง stage/role" — แพทเทิร์น `install-modules.json` + JSON Schema validate
- **ระวัง:** **อย่าเอา SQLite state store** ของ ECC มา (over-engineer)
- **ตัดสิน (2026-06-07 · feasibility evaluation):** **ยังไม่ทำ** — มีหลักฐานเชิงเทคนิค (ไม่ใช่แค่ YAGNI gut): (1) **stage แยกไม่ได้เชิงความหมาย** — workflow ผูกลำดับ (BUILD↔DESIGN output, SHIP↔ทุก stage); contexts ผูก 5/5 stage, roles 4/5 → เลือกบางส่วน = workflow พัง; (2) **zero-dep JSON Schema เป็นไปไม่ได้สวย** — node ไม่มี validator built-in → hand-roll (โค้ดเยอะ) หรือ ajv (**ทำลาย zero-dep จุดขาย** §2); (3) แยกได้จริงแค่ agents(5)+skills(3)=`.md` เล็ก → ไม่มี install benefit; (4) ไม่มี demand. ดู eval เต็ม: `docs/stages/achieved/2026-06-07-selective-install/`
- **เงื่อนไข reเปิด:** มี demand จริง (user ขอ + เหตุผลชัด) หรือ workflow โตจนมี optional module จริง → ทำ **bounded profiles (`--minimal`) ก่อน manifest อิสระ**

### 12. Lint ของ repo เอง ✅ DONE (2026-06-07 · topic `repo-lint`)
- [x] **dead-link gate zero-dep** `src/scripts/lint-md.mjs` (node:* ล้วน — **ไม่ใช้ markdownlint/prettier** เพราะขัด zero-dep) — validate markdown-link `[](path)` ใน `src/**`+`docs/**` resolve จริง (exclude template+archived; strip-code alternation กัน false-positive)
- [x] unit 7 เคส (pure `checkLinks`) + `npm run lint:md` + **CI job `lint-md`** (เชื่อม CI ข้อ 2)
- [x] global: `docs/rule.md` §2 zero-dep lint-gate convention; troubleshooting #12 (strip-code) + #13 (main-loop ตรวจ exit)
- **หมายเหตุ:** เลือก dead-link เป็นแกน (need ที่ทำมือซ้ำทุก VERIFY) แทน markdownlint/prettier เต็มชุด — opinionated high-signal + คง zero-dep (จุดขาย)


### 13. Feature behavior spec + delta discipline (จาก OpenSpec) ✅ DONE (2026-06-07 · topic `feature-spec-delta`)
- [x] template `docs/features/[feature-name]/spec.md` — living behavior spec แบบ lean (Requirement + Scenario GIVEN/WHEN/THEN, ไม่บังคับ RFC 2119)
- [x] วงจร delta ครบ 3 stage: DESIGN เขียน "Spec delta" (§9, ADDED/MODIFIED/REMOVED) → VERIFY ใช้ spec เป็น regression baseline → SHIP merge กึ่ง mechanical (read-modify-verify, key ไม่เจอ → STOP, rename `[เดิมชื่อ:]`, stale re-check)
- [x] dogfood: backfill spec จริง 2 feature (`context-profiles`, `utility-skills`) + merge trace 5 เคสพิสูจน์กติกา
- **ที่มา:** วิเคราะห์ OpenSpec (Fission-AI) 2026-06-07 — ยืม 2 เทคนิคที่ผ่านเกณฑ์ปรัชญา; **ตัดทิ้ง:** OPSX schema engine (over-engineer), เลิก phase gate (gate คือจุดขายเรา), workspaces (beta), adapter 30+ tools (ขัด non-goal) · ดู `docs/features/spec-delta/`

### 14. Structural validator + status script (จาก OpenSpec) ✅ DONE (2026-06-08 · topic `validator-status`)
- [x] `validate-topic.mjs` (zero-dep `node:*` ตาม precedent `lint-md.mjs`) — เช็คโครง: C2 task มี 4 ไฟล์, C3 ship มี data row learned-rules, C5 feature spec format (Requirement/Scenario/GWT) = ✖; C1 artifact ข้าม stage, C4 Spec delta = ⚠
- [x] 2 โหมด: status (ไม่ใส่ arg — ตารางทุก topic, exit 0) / validate (`<slug>` — ✖/⚠ + exit 1/0/2); path traversal guard
- [x] wiring 3 จุด (node-guard): `/warnyin:next` pre-scan, DESIGN gate §8, SHIP step 1 — ทั้งหมด guidance + fallback เครื่องไม่มี node
- **หลักการที่ได้:** ✖ ไม่พึ่ง filled-detection (deterministic), heuristic ที่เดา "เติมแล้ว" = ⚠ best-effort (`docs/rule.md` §1) · structural เท่านั้น semantic เป็นของ model · ดู `docs/features/topic-validator/`
- **ที่มา:** ข้อ 3 จากวิเคราะห์ OpenSpec — ทำหลัง #13 ship (spec/delta format นิ่งแล้ว); end-to-end proof แรกของวงจร Spec delta (§9 delta จริง → SHIP สร้าง feature spec จาก ADDED)

---

## 🐛 Core bug ที่เจอ+แก้ระหว่าง dogfood (2026-06-06 · topic `installer-test-ci`)
> รัน workflow ตัวเองทำ P0#1-2 จริง → จับ bug ที่ test/design มองไม่เห็น (พิสูจน์คุณค่า BUILD/VERIFY)
- [x] **`build-wave.mjs` รับ `args` เป็น string** — harness ส่ง `args` ของ Workflow เป็น JSON string → defensive parse (commit `0770104`); ดู `troubleshooting.md` #5
- [x] **scaffold leak** — installer `copyTree(docs/stages)` ลากงานจริงของ repo ต้นทางไป target + ติด published package → เปลี่ยนเป็น generate scaffold เอง (commit `e3c0074`); ดู `troubleshooting.md` #1, `rule.md` §4
- [x] **root dogfood ถูก commit (tracked)** ทั้งที่ rule §6 ว่า gitignored (2026-06-07 · topic `gitignore-dogfood-fix`) — `.gitignore` ไม่มี dogfood entries + runbook src-bootstrap step ตกหล่น → `git rm -r --cached` 64 ไฟล์ + `.gitignore` root-anchored; verify ด้วย fresh-clone sim (src 78 ไม่หาย) + regen round-trip; ดู `troubleshooting.md` #11, `rule.md` §6

## ❌ Non-goals — ตัดสินใจไม่ทำ (กันบวมตาม ECC)

- **catalog skill/agent จำนวนมาก** — opinionated คือจุดแข็ง
- **runtime instinct observer** (hook + background agent + SQLite + CLI หลายตัว) — หนักเกิน ขัดปรัชญา → ใช้ข้อ 8 แทน
- **รองรับ harness จำนวนมาก** (12+ แบบ ECC) — โฟกัส Claude Code + Codex/Antigravity ที่ parity เต็ม
- **Rust control-plane / dashboard / billing** — นอก scope "ways-of-work"

---

## ที่มา

- สำรวจ `affaan-m/ecc` (2026-06-06) — kitchen-sink harness system; หยิบเฉพาะแก่นที่ผ่านเกณฑ์ปรัชญา
- ยืนยันจาก ECC: ปรัชญา cross-harness "reusable layer + thin adapters" = ทิศทาง playbook-กลาง + adapter-บาง ของ Warnyin **มาถูกทางแล้ว**
