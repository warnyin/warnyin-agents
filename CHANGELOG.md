# Changelog

ทุกการเปลี่ยนแปลงที่สำคัญของโปรเจกต์นี้ถูกบันทึกในไฟล์นี้

รูปแบบอ้างอิง [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
และโปรเจกต์ยึด [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## Migration guide

อัปเกรดจากรุ่นเก่าที่ layout ต่างไป (installer จะ **เตือนให้ย้ายเอง ไม่แตะงานจริงของคุณ**):

> **ลำดับที่แนะนำ: ย้ายงานจริงก่อน แล้วค่อยรัน `npx @warnyin/agents`**
> คำสั่งย้ายด้านล่างใช้รูปแบบ `git mv <เก่า>/* docs/stages/` (ย้าย *เนื้อหา* ไม่ใช่ทั้งโฟลเดอร์) จึงปลอดภัยทั้งกรณีที่ยังไม่มี `docs/stages/` และกรณีที่เผลอรัน installer ไปก่อน (installer สร้าง `docs/stages/` เปล่าให้แล้ว) — กันงานจริงไปซ้อนเป็น `docs/stages/stages/`

| จากรุ่น | layout เดิม | ต้องทำเอง (งานจริงปลอดภัย ไม่ถูกแตะ) |
|---|---|---|
| **≤0.2.x** | core `workflow/` + งานจริง `warnyin-stages/` ที่ root | `mkdir -p docs/stages && git mv warnyin-stages/* docs/stages/` แล้วลบ core เก่า `rm -rf workflow warnyin-stages` |
| **0.3–0.5.x** | ทุกอย่างใต้ `warnyin/{workflow,template,installer,stages}` | `mkdir -p docs/stages && git mv warnyin/stages/* docs/stages/` แล้วลบ core เก่า `rm -rf warnyin` |

จากนั้นรัน installer อีกครั้ง — installer จะวาง `.warnyin/` (core) ชุดใหม่ + แยกงานจริงไว้ที่ `docs/stages/` ให้

> **0.6.0 → 0.7.0:** ผู้ใช้ปลายทาง (`npx @warnyin/agents`) **ไม่ต้องทำอะไร** — payload ที่ติดตั้งคงเดิม การเปลี่ยนแปลงทั้งหมด (bin path → `src/`, dogfood 2-layer) เป็นเรื่องภายใน repo เท่านั้น; ผู้พัฒนา repo เอง (contributor) ดู [`CONTRIBUTING.md`](CONTRIBUTING.md)

## [Unreleased]

### Added
- **Structural validator + status script (`validate-topic.mjs`) wired เข้า workflow 3 จุด** — script เดียวใน payload (`src/.warnyin/workflow/scripts/validate-topic.mjs`, zero-dep ตาม pattern `lint-md.mjs`) 2 โหมด: **status** (ไม่ใส่ arg → ตารางทุก active topic, exit 0 เสมอ) · **validate** (`<slug>` → `✖`/`⚠` structural ละเอียด มี code C1–C5 กำกับ, exit 1 เมื่อมี ✖ · 0 เมื่อสะอาด/มีแค่ ⚠ · 2 slug ไม่ถูกต้อง/path traversal). wire เข้า playbook **3 จุดแบบ unify-in-place + node-guard ทุกจุด**: `next.md` (§2 step pre-scan โหมด status ก่อนอ่าน semantic — ตาราง heuristic เดิมคง fallback) · `stages/design.md` (§8 gate item "ทุก task มี 4 ไฟล์ครบ" → validate `<slug>` ควรไม่มี ✖, guidance ไม่ใช่ hard gate) · `stages/ship.md` (§4 step 1 → validate `<slug>` ก่อน promote, มี ✖ ควรแก้ก่อน) + command mirror `next/design/ship` (ชี้ playbook ไม่ duplicate รายการเช็ค). **structural เท่านั้น** — semantic ยังเป็นหน้าที่ model/ผู้ ship; **backward compatible** (เครื่องไม่มี node → playbook คง fallback เดิม); payload ติดมากับ `--update` รอบถัดไป
- **วงจร Feature spec delta ครบ 3 stage (DESIGN/VERIFY/SHIP)** — wiring discipline ของ behavior spec แบบ unify-in-place ลง playbook กลาง + template + command adapter: `src/.warnyin/workflow/stages/design.md` (§2 input อ่าน `docs/features/<name>/spec.md` · §4 step 5 + §5 + §8 gate ครอบ "Spec delta") · `verify.md` (feature spec = regression baseline — scenario เดิม = regression case, delta = test case ใหม่; §2/§3/§4/§6) · `ship.md` (§4 step 5.1 merge `spec.md` ตาม delta — ADDED ต่อท้าย/MODIFIED แทนที่/REMOVED ลบ + **read-modify-verify key ไม่เจอ → STOP** + rename `[เดิมชื่อ:]` + stale delta re-check; §3/§5/§6 gate) · template `stages/[topic]/design.md` (+section "9. Spec delta") + `ship.md` (+แถว `spec.md`) · `src/.warnyin/workflow/README.md` note `spec.md` (living behavior spec) · command mirror `design/verify/ship` (ชี้ playbook ไม่ duplicate logic). **backward compatible** (feature ไม่มี spec → วิธีเดิม; topic ไม่มี §9 delta → SHIP ทำแบบเดิม); payload `.md` ล้วน ติดมากับ `--update` รอบถัดไป

## [0.8.5] - 2026-06-07

### Added
- **Model-tier guidance ใน context profile** — `src/.warnyin/workflow/contexts/{research,build,review}.md` เพิ่มบรรทัด "Model tier" ใน section Tool preference (generic: `research`→`deepest reasoning` · `build`→`balanced`/fan-out worker เชิงกลไก→`cheap` · `review`→`balanced+`) + ตาราง legend ใน `contexts/README.md` — แนะนำ model tier ตาม posture เพื่อคุม token/cost; **tool-agnostic** ไม่ผูกชื่อรุ่น (harness map เอง) · global `docs/rule.md` §1 payload-guidance-generic — `.md` ล้วน, ติดมากับ `--update` รอบถัดไป
- **Worked-example pointer ใน README** — section "ตัวอย่างจริง (worked example)" ชี้ `docs/example-walkthrough.md` (เดิน topic จริง `cli-legacy-warning-fix` ครบ 5 stage บน repo) ให้ผู้ใช้ใหม่เห็น artifact จริง

## [0.8.4] - 2026-06-07

### Added
- **Utility skills (Claude adapter, auto-invocable)** — 3 safe utility skill ใหม่ `src/.claude/skills/{update-codemaps,explore,next}/SKILL.md` (`/update-codemaps`, `/explore`, `/next`): Claude project skill ที่ model **auto-invoke ได้เอง (description-driven)** body ชี้ playbook กลางเดิม (`.warnyin/workflow/{codemap,explore,next}.md`) ไม่ duplicate — auto-invoke เฉพาะ utility **read-only safe**; ผู้ใช้ปลายทางรับ skills อัตโนมัติตอน `npx @warnyin/agents` / `--update`. command `/warnyin:*` เดิม **ไม่เปลี่ยน** (non-breaking); build/ship คงเป็น command user-only (irreversible). global `docs/rule.md` §1 skill-adapter convention

### Changed
- **installer/packaging รองรับ skills** — `cli.mjs` CORE +`.claude/skills`; `package.json files` +`src/.claude/skills` (nested dotfolder ระบุชัด); `verify-pack` ALLOWED_PREFIX +`src/.claude/skills/` + R1 assert `hasSkills` (skills เป็น required payload กันหล่นเงียบ); test suite 18→19 (verify-pack 9→10)

## [0.8.3] - 2026-06-07

### Added
- **Learned-rule capture ใน SHIP** — `ship.md` playbook (§3 principle 7 ขยาย + §4 step 1/3/5 + §6 gate) + command + template `[topic]/ship.md` (section "Learned rules"): จับ rule ที่ได้จากการทำจริง (planned + emergent จาก build/verify/troubleshooting) ด้วย `rule + evidence(บังคับ) + scope` แล้ว user ยืนยัน per-rule ก่อน promote — unify กับกลไก "รอ SHIP" เดิม; global `docs/rule.md` §1 + continuous-learning discipline + unify-in-place — `.md` ล้วน, ติดมากับ `--update` รอบถัดไป

## [0.8.2] - 2026-06-07

### Added
- **Security checklist (agent-runtime + supply-chain)** — `roles/security.md` เพิ่ม section "Runtime / operational security" (secret isolation · no-egress · identity separation + Claude adapter note) + checklist item supply-chain/MCP (prompt-injection surface); `verify.md` §2 อ้าง runtime security ตอนรัน local env; `install-skill.md` step 4 เสริม warning prompt-injection; global `docs/rule.md` §3 ขยายเป็น Security baseline 2 มิติ (CI + agent-runtime) — `.md` ล้วน, ติดมากับ `--update` รอบถัดไป

## [0.8.1] - 2026-06-07

### Added
- **Defensive rules** ใน BUILD/VERIFY playbook (§3) + developer.md/qa.md checklist + global `docs/rule.md` §1 — เวอร์ชัน enforce ของ "ห้ามเดา": (1) **investigate-before-edit** ก่อนแก้ไฟล์ที่มีอยู่ต้องเข้าใจ (ใครใช้/contract/เจตนา), (2) **config-protection** ห้ามแก้ config/test "เพื่อให้ผ่าน" แทนแก้โค้ดจริง — `.md` ล้วน, ติดมากับ `--update` รอบถัดไป

## [0.8.0] - 2026-06-07

### Added
- **Context profiles** (`.warnyin/workflow/contexts/{research,build,review,README}.md`) — session-level posture 3 โหมด (สำรวจ/สร้าง/ตรวจ) คู่ขนานกับ role card (task-level lens); playbook แต่ละ stage มี callout ชี้ context ที่เข้าคู่ (Discovery→research · DESIGN→research+build · BUILD→build · VERIFY→review · SHIP→review) — `.md` ล้วน, ติดมากับ `--update` รอบถัดไป ไม่ต้องตั้งค่าเพิ่ม

### Fixed
- โครงสร้าง repo ใน `.warnyin/workflow/README.md` ให้ตรง layout จริงหลัง restructure 0.7.0 (`src/` layer + `.warnyin/`) — เดิมยังเป็น layout เก่า (`warnyin/`, `bin/cli.mjs`)

## [0.7.0] - 2026-06-07

### Added
- **Bootstrap / self-hosting (2-layer):** แยก source ของ warnyin ทั้งหมดเข้า `src/` (committed/publish layer); repo install release เสถียรไว้ root เป็น dogfood (`.warnyin/`/`.claude/`/`CLAUDE.md`/`AGENTS.md` — gitignored) เพื่อพัฒนา `src/` โดย workflow ที่ใช้ทำงานยังเสถียร
- `npm run setup:dogfood` — คืน dogfood env ที่ root จาก release (`npx @latest` + fallback `npm pack`→extract→node สำหรับ Windows), append pointer → `CONTRIBUTING.md` แบบ idempotent
- `npm run setup:sandbox` — install v-next จาก `src/` ลง temp dir (`os.tmpdir()`) เพื่อทดสอบ version skew โดยไม่แตะ dogfood ที่ root
- `CONTRIBUTING.md` — dev-instructions ของ repo (แยกจาก root `CLAUDE.md` เดิม)
- pass-count gate (`src/scripts/check-test-count.mjs`) — anti-false-green: fail ถ้า `fail≠0` / `pass<9` / `pass≠tests`
- Automated installer test suite (`node:test` black-box — spawn `src/bin/cli.mjs` จริงใน temp dir แล้ว assert side-effect) + unit test `checkFiles` รันด้วย `npm test`
- GitHub Actions CI (`.github/workflows/ci.yml`) — matrix node 20/22/24 + job `pack-verify`
- npm-pack verify (`src/scripts/verify-pack.mjs`) — testable `checkFiles(files)→errors[]`: allowlist granular + denylist (tooling/`docs/`/dogfood ที่ root) + tripwire (`settings.local.json`/`*.tgz`/`.env*`); assert `src/.warnyin/workflow/` + `src/.claude/commands/warnyin/` ติด tarball

### Changed
- **bin path** `bin/cli.mjs` → `src/bin/cli.mjs` (restructure source เข้า `src/`) — `pkgRoot` resolve เป็น `src/` อัตโนมัติ, payload คงเดิม
- `package.json files` เป็น allowlist granular — nested dotfolder ระบุชัด (`src/.warnyin`, `src/.claude/commands`, `src/.claude/agents`); ตัด `src/tests`/`src/scripts` (dev-only)
- test/scripts ย้ายไป `src/tests/` + `src/scripts/`; `npm test` = `node --test` bare (auto-discover, portable node 20/22/24)
- `engines.node` `>=18` → `>=20` (node 18 EOL)
- `.gitignore` เพิ่ม dogfood layer (root-anchored ทุกบรรทัด — กัน match `src/.claude`/`src/.warnyin`)

### Removed
- รองรับ node 18 (drop ตาม EOL)

[Unreleased]: https://github.com/warnyin/warnyin-agents/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/warnyin/warnyin-agents/compare/v0.6.0...v0.7.0
