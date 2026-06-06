# BUILD report — src-bootstrap

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`
> build branch: `build/src-bootstrap` · วันที่: 2026-06-07 · orchestrator: main loop + fan-out sub-agent (Workflow)

## 1. สรุปผล

ทำครบ **5 task** ตาม dependency `T1 → (T2 ∥ T3) → T4 → T5` — ทุก task **passed**, full build/test gate **เขียว**

**Prerequisite (นอก workflow):** ✅ publish `@warnyin/agents@0.6.0` (main ปัจจุบัน, `.warnyin/` layout) ขึ้น npm เป็น dogfood baseline ก่อน build (user authorize · `npm view` = 0.6.0)

### Execution mode (ปรับจากแผนเดิมตามข้อจำกัด self-hosting)
แผนเดิม = worktree 4-wave (T2∥T3 parallel) แต่เจอ **self-hosting paradox:** T1 ย้าย `.warnyin/` (tooling ที่ orchestration ใช้) → `src/.warnyin/` → worktree sub-agent ของ wave หลังอ่าน playbook/role ที่ root ไม่เจอ
**วิธีเดินจริง (user เลือก):** Wave 1 (T1) worktree → merge → **restore root dogfood** (`@warnyin/agents@0.6.0`) → Wave 2-5 **shared-tree ทีละ task** (sub-agent อ่าน tooling จาก root dogfood, ไม่ commit เอง — main loop commit ให้)

## 2. ผลต่อ task

| task | สถานะ | commit | test/verify |
|---|---|---|---|
| **T1** move-source-to-src | ✅ passed | `ad2316e` (merge) + `c51f664` | 9/9 test, fresh install payload ตรง provenance src/ |
| **T2** packaging-config | ✅ passed | `c0c3dc5` | 18/18 (เพิ่ม 9 เคส verify-pack), pack ครบไม่ leak, main-guard argv[1] |
| **T3** test-suite-relocation | ✅ passed | `c5713b3` | pass-count gate structural (fail==0 ∧ pass==tests ∧ pass≥9), zero-dep |
| **T4** dogfood-bootstrap | ✅ passed¹ | `6d7a4c2` | .gitignore root-anchored, setup-sandbox รันจริง Windows, BL-3 collision ปิด, idempotent pointer |
| **T5** docs-sync | ✅ passed² | `2 commits ล่าสุด` | techstack/installer + codemap 2-layer ตรง ground truth, off-limits docs ไม่แตะ |

¹ T4: live `npm run setup:dogfood` (e2e) mark `[~]` **deferred-to-VERIFY** — sandbox classifier บล็อก external-exec+agent-config-write ใน build context; logic + Windows fallback (npm pack→extract→node, resolve cli จาก package.json bin) + deterministic acceptance (collision/idempotent/gitignore/sandbox) verify ครบในแลบ
² T5: build-wave โชว์ "skipped" เป็น false flag (agent คืน task name `"docs-sync (T5)"` ไม่ตรง key `"docs-sync"`) — งานทำจริง status=passed

## 3. Full build & test gate (หลัง integrate ทุก task)

| gate | ผล |
|---|---|
| build/syntax (installer code) | ✅ PASS — cli/verify-pack/check-test-count/setup-dogfood/setup-sandbox/tests ผ่าน `node --check` |
| test suite (CI gate command `set -o pipefail; npm test \| check-test-count.mjs`) | ✅ PASS — tests 18 / pass 18 / fail 0 |
| pack payload (`npm pack --dry-run --json`) | ✅ PASS — 68 ไฟล์, must-have ครบ, 0 leak |

**Windows dev-env limitation (documented, ไม่ block — CI ubuntu ผ่าน):**
- `node src/scripts/verify-pack.mjs` ตรง → `npm.cmd` spawn EINVAL/ENOENT (troubleshooting #4) · logic ผ่าน unit 9 เคส + manual workaround `npm pack --dry-run --json` ผ่าน
- `build-wave.mjs` ไม่ผ่าน `node --check` = Workflow DSL (top-level `return` by design)

## 4. Integration notes
- **package.json (shared T1/T2/T4):** serialize สำเร็จ — T1=bin, T2=files+verify:pack, T4=scripts.setup:* — ไม่ชนกัน
- **ci.yml (shared T2/T3):** T2=job pack-verify, T3=job test — คนละ hunk, commit ตามลำดับ ไม่ conflict
- **T2↔T3 integration:** T3 พบ acceptance "pass=9" จะ false-FAIL หลัง T2 เพิ่ม test file ที่ 2 (bare discover รวม 18) → เปลี่ยน gate เป็น structural invariant (คงเจตนา troubleshooting #3, ทนไฟล์ test เพิ่ม)
- **fix ระหว่าง gate:** main loop แก้ bug fallback ใน setup-dogfood.mjs (hardcode `src/bin/cli.mjs` แต่ 0.6.0 baseline = `bin/cli.mjs`) → resolve cli จาก package.json `bin` (พิสูจน์กับ tarball 0.6.0 จริง)
- **dogfood layer:** root `.warnyin/`/`.claude/`/`AGENTS.md` = gitignored (restore จาก 0.6.0); `CLAUDE.md` → `CONTRIBUTING.md` (tracked); `docs/project.md`+`docs/infra.md` = repo doc จริง (กัน collision)

## 5. รอ SHIP (note ไว้ ไม่แตะตอน BUILD)
- **rule/standard กลาง** — note ใน `tasks/*/rule.md §2`: path `bin/cli.mjs`→`src/bin/cli.mjs` (docs/rule.md §4-5), component rule guard wording, harness `cliPath`, verify-pack pattern ใหม่, npm scripts cross-platform, .gitignore root-anchored, setup:dogfood review-payload policy
- **DF-1 CHANGELOG + bump 0.7.0** — design §5.3 step 8 / dry-run defer (ทำที่ SHIP/release) · ปัจจุบัน package.json ยัง 0.6.0
- **docs/infra.md เนื้อเต็ม** — BUILD เขียนพอกัน seed (กัน collision); promote runbook transition + กฎ cross-platform npm scripts เต็มตอน SHIP

## 6. Carry-over เข้า VERIFY
- ▶ **live `npm run setup:dogfood`** จาก repo root (มี user authorize + live env): ยืนยัน root ได้ `.warnyin/`+`.claude/`+`CLAUDE.md`+`AGENTS.md` (ติด .gitignore) + `git status --porcelain docs/` ว่าง + `/warnyin:*` ใช้ได้ + idempotent pointer (รันซ้ำไม่ซ้อน) — บน Windows ใช้ fallback path (npx ล้ม → npm pack→extract→node)
- ▶ verify:pack รันตรง (CI ubuntu) — ยืนยันบน Linux ได้ exit 0 (Windows ใช้ workaround)

## 7. Gate BUILD → VERIFY
- [x] ทุก task implement + integrate เข้า build branch
- [x] ทุก task passed (T1-T5) — ไม่มี failed ค้าง
- [x] ไม่มี merge conflict ค้าง
- [x] Full build ผ่าน — ไม่มี build error
- [x] test suite ทั้งหมดเขียว (18/18 บน build branch)
- [x] build.md สรุปครบ
- [x] ไม่แตะ rule/standard กลางใน docs/ (note รอ SHIP)

→ **พร้อมเข้า VERIFY** ด้วย `/warnyin:verify src-bootstrap`
