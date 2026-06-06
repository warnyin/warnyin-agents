# Test plan — src-bootstrap (VERIFY)

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md` · role: QA (`.warnyin/workflow/roles/qa.md`)
> guideline: `docs/techstack/installer/test.md` · env: `docs/infra.md` (zero-service, node ≥20 + npm + tar)
> ปลายทางตอน SHIP: merge เข้า `docs/techstack/installer/test.md`

## จุดประสงค์ topic ที่ต้องยืนยัน (เทสตามเจตนา ไม่ใช่แค่เขียว)
แยก source → `src/` (publish layer) + repo install **release เสถียร** ที่ root เป็น dogfood (gitignored) = **bootstrap/self-hosting** — ต้องพิสูจน์ว่า:
1. installer ที่ย้ายไป `src/bin/cli.mjs` ยัง install payload จาก `src/` ถูก (mirror layout)
2. publish config ไม่ leak tooling/docs/dogfood + dotfolder nested ติดครบ
3. test suite เขียวจริงบนโครงใหม่ (pass count, ไม่ false-green)
4. **กลไก dogfood/bootstrap ทำงาน e2e จริงใน local env** (carry-over หลักจาก BUILD)
5. docs ตรงโค้ดจริงหลัง restructure

## Env
- local: Windows 11, node ≥20, npm, tar (มีใน Win10+) · zero service
- npm latest = `@warnyin/agents@0.6.0` (dogfood baseline, `.warnyin` layout) — ยืนยันแล้ว
- branch: `build/src-bootstrap` · tree สะอาดก่อนเริ่ม

---

## Test cases

### TC-1 — functional: test suite เขียวทั้ง suite (T1+T3, pass-count)
- รัน `npm test` (bare `node --test`) → bare discover เจอ `src/tests/installer.test.mjs` (9) + `verify-pack.test.mjs` (9)
- **เกณฑ์:** tests=18 / pass=18 / fail=0 (เห็น pass count จริง ไม่ใช่แค่ exit 0 — BL-2)
- pipe ผ่าน `check-test-count.mjs` → exit 0 (gate `fail==0 ∧ pass>=9 ∧ pass==tests`)

### TC-2 — package cleanliness: pack payload ถูก (T2, R1/R2)
- `npm pack --dry-run --json` → feed `checkFiles` (Windows: verify-pack รันตรง ENOENT → ใช้ workaround troubleshooting #4)
- **เกณฑ์:** payload มี `src/.warnyin/workflow/` **และ** `src/.claude/commands/warnyin/` (R1 nested dotfolder 2 ก้อน) + `src/bin/cli.mjs` + `src/AGENTS.md`
- **denylist:** ไม่มี `src/tests/`, `src/scripts/`, `docs/`, `.github/`, root dogfood (`^.warnyin/`/`^.claude/`/root CLAUDE.md/AGENTS.md), tripwire (`*.tgz`/`settings.local.json`/`.env*`)

### TC-3 — installer behavior: fresh install จาก src/ ลง temp (T1)
- `( cd <temp> && node <repo>/src/bin/cli.mjs )` (cwd=temp เสมอ — กัน leak ลง repo root, troubleshooting #1)
- **เกณฑ์:** target ได้ `.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`, `docs/stages`, `docs/project.md`, `CLAUDE.md`, `AGENTS.md` ครบ
- **regression:** payload byte-equal กับ `src/` ต้นฉบับ (พิสูจน์ source = `src/` จริง ไม่ใช่ root เก่า)
- scaffold เปล่า ไม่ leak `docs/stages/<topic>` ของ repo ต้นทาง

### TC-4 — ★ live `setup:dogfood` e2e (T4, carry-over หลักจาก BUILD — acceptance ที่ `[~]`)
- รัน `npm run setup:dogfood` จาก repo root จริง (user authorize ผ่าน /warnyin:verify · live env)
- **บน Windows:** npx bin-shim ล้ม (troubleshooting #3) → ต้องเข้า **fallback** (npm pack→extract→node cli) แล้ว exit 0 — พิสูจน์ fallback ทำงานจริง (ไม่ false-green)
- **เกณฑ์:**
  - [ ] root มี `.warnyin/`, `.claude/commands/warnyin/`, `.claude/agents/`, `CLAUDE.md`, `AGENTS.md`
  - [ ] artifact ทั้งหมด **ติด .gitignore** (`git status --porcelain` ไม่โชว์ root dogfood layer)
  - [ ] **`git status --porcelain docs/` ว่าง** (BL-3 — seed/scaffold skip เพราะมี project.md/infra.md/achieved/.gitkeep)
  - [ ] `/warnyin:*` ใช้ได้ (มี `.claude/commands/warnyin/*.md` ที่ root)

### TC-5 — idempotent: รัน setup:dogfood ซ้ำ (T4)
- รัน `npm run setup:dogfood` รอบ 2 → pointer `CONTRIBUTING.md` ใน root CLAUDE.md **ไม่ append ซ้อน** (marker check) + git ยังสะอาด

### TC-6 — setup:sandbox: install v-next ลง temp (T4)
- `npm run setup:sandbox` → temp dir (`os.tmpdir()` ไม่ hardcode) มี v-next ครบ + print path; รันบน Windows ผ่าน (spawn array args ไม่ shell)
- dogfood ที่ root **ไม่โดนแตะ**

### TC-7 — committed artifacts ถูกต้อง (T4)
- `CONTRIBUTING.md` มีจริงที่ root (committed) เนื้อ dev-instructions
- `.gitignore` dogfood patterns root-anchored ทุกบรรทัด (`/` นำหน้า) — `git check-ignore` จับ root dogfood, `src/` ไม่ถูก ignore

### TC-8 — docs ตรงโค้ดจริง (T5)
- structure.md/test.md/about.md/codemap: path/ค่าคงที่/allowlist ตรง `src/bin/cli.mjs`+`package.json` จริง; ไม่มี path เก่า (`bin/cli.mjs`/`tests/`/`scripts/` ลอย); 2-layer ชัด
- `docs/rule.md` ไม่ถูกแก้ (git diff สะอาด); rule ใหม่อยู่ใน `tasks/*/rule.md §2` รอ SHIP

---

## Negative / edge (QA lens — หาทางพัง)
- N-1: setup:dogfood เมื่อ root dogfood มีอยู่แล้ว → install ทับได้ + docs/ ยังสะอาด (re-entrant)
- N-2: setup:dogfood เมื่อ network/registry ใช้ไม่ได้ → exit ด้วย error ชัด (ไม่ false-green) — เทสเชิงตรวจ logic flow (`installViaNpx() || installViaPack()` → `exit(1)`)
- N-3: fresh install โดย cwd=repo root → ต้อง**ไม่**ทำ (รันใน temp เสมอ) — ยืนยัน guard no-op ไม่ทำให้ leak
- N-4: `npm test` ต้องไม่ตี src/scripts/build-wave.mjs (Workflow DSL) เป็น test — bare discover เฉพาะ `*.test.*`

## Out of scope (รอ SHIP/outward)
- CI เขียวจริงบน PR (Linux node 20/22/24 matrix) = ยืนยันตอนเปิด PR/merge (outward — นอก VERIFY)
- bump 0.7.0 + CHANGELOG + publish (SHIP/release)
