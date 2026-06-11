# Structure — installer

> โครงไฟล์จริงของ component installer (ณ 2026-06-07 — หลังย้าย source เข้า `src/`)
> **2-layer:** SOURCE (`src/**` committed/publish) · DOGFOOD (root `.warnyin/`/`.claude/`/`CLAUDE.md`/`AGENTS.md` — gitignored, install จาก release)

## ไฟล์ (SOURCE layer — `src/`)
```
src/bin/cli.mjs                   installer หลัก (zero-dep, ~190 บรรทัด); npm bin → ที่นี่
src/tests/installer.test.mjs      black-box integration test ของ installer (9 เคส)
src/tests/verify-pack.test.mjs    unit test ของ checkFiles (10 เคส, BL-4 testable denylist)
src/scripts/verify-pack.mjs       pack-verify gate (allowlist + denylist; export checkFiles)
src/scripts/check-test-count.mjs  pass-count gate (anti-false-green; MIN_PASS=9)
src/scripts/lint-md.mjs           dead-link gate (zero-dep; export checkLinks; strip-code alternation)
src/tests/lint-md.test.mjs        unit test ของ checkLinks (7 เคส, BL-4 testable)
src/scripts/setup-dogfood.mjs     dev: ติดตั้ง release ลง root (dogfood)
src/scripts/setup-sandbox.mjs     dev: ติดตั้ง v-next จาก src/ ลง temp (sandbox)
src/.warnyin/{workflow,template}  playbook กลาง (stages/ roles/ contexts/ scripts/) + template (payload)
src/.warnyin/installer/templates/CLAUDE.md   template CLAUDE.md ของ target (per-project root doc + resolution note)
src/.warnyin/installer/templates/CLAUDE.global.md   note-only (resolution + workspace-guard + marker) → installGlobalNote เขียนลง ~/.claude/CLAUDE.md (global mode)
src/.claude/{commands/warnyin,agents,skills}  adapter Claude (payload) — skills = utility auto-invocable (ดู docs/features/utility-skills/)
src/AGENTS.md                     adapter Codex/Antigravity (payload)
```

## ไฟล์ root (committed — repo meta + CI)
```
package.json                 bin→src/bin/cli.mjs, files allowlist (granular), scripts, engines>=20
README.md CHANGELOG.md LICENSE CONTRIBUTING.md   repo meta + dev-instructions
docs/                        ความรู้ถาวร repo
.github/workflows/ci.yml     CI: test matrix [20,22,24] (pass-count gate) + job pack-verify
.gitignore                   ignore dogfood layer ที่ root (root-anchored)
```
> root `.warnyin/`/`.claude/{commands/warnyin,agents}`/`CLAUDE.md`/`AGENTS.md` = DOGFOOD layer (gitignored, regen ด้วย `npm run setup:dogfood`)

## flow `src/bin/cli.mjs` (main, ล่างสุดของไฟล์)
```
pkgRoot = resolve(dirname(import.meta.url), '..')   // = src/  (sibling ของ bin/)
parse args (--update/--dry-run/--help/--global/--project)
mode = resolveMode({globalFlag,projectFlag,isTTY,answer})  // pure-fn: conflict→throw · flag · non-TTY→project · TTY→prompt
target = mode==='global' ? os.homedir() : cwd      // global: homedir guard (falsy/root→error exit)
guard pkgRoot === target → error                   // defensive no-op (pkgRoot=src/, homedir/cwd ≠ src/)
warn legacy ≤0.2.x / 0.3–0.5.x
─────
for CORE      → copyTree(dir, {overwrite: UPDATE})   // global: first-install overwrite=false (ไม่ทับไฟล์ user)
[project] ensureScaffold() + seedDocs() + installRootDoc(CLAUDE.md) + installRootDoc(AGENTS.md)
[global]  skip scaffold/seed (ยกให้ /warnyin:init) + installGlobalNote() → ~/.claude/CLAUDE.md + ข้าม AGENTS.md global
print สรุป created/updated/skipped
```
> guard `pkgRoot===target` = **defensive no-op โดยตั้งใจ** — pkgRoot=`src/` ไม่มีทาง===homedir/cwd/temp; zero-cost
> main flow ห่อ **async เฉพาะ path TTY** (readline prompt); non-TTY/flag-explicit ไม่แตะ readline (ไม่ค้าง)

## helper signatures
```
resolveMode({globalFlag,projectFlag,isTTY,answer}) → 'project'|'global'   // pure-fn (export, main-guard กัน trigger); unit-testable ไม่ต้อง spawn TTY
copyTree(relDir, {overwrite})    recursive copy pkgRoot→target; skip ถ้ามีอยู่+!overwrite หรือ byte-equal
ensureScaffold()                 generate SCAFFOLD_FILES เปล่า; skip ถ้ามี; เคารพ DRY  (project mode)
seedDocs(relDir=TEMPLATE_DOCS)   copy template docs→docs/; ข้าม entry ขึ้นต้น '['; ไม่ทับ  (project mode)
installRootDoc(name, srcPath)    ไม่มี→สร้าง; มีแต่ไม่มี marker→append section; มี marker→skip  (เขียนทั้งไฟล์ — per-project)
installGlobalNote()              อ่าน templates/CLAUDE.global.md → ~/.claude/CLAUDE.md append-with-marker `<!-- warnyin:global-note -->`; defensive-skip ถ้า template ไม่มี; เคารพ DRY  (global mode — note-only ไม่ทับ personal memory)
```

## helper dev tooling (`src/scripts/` — ไม่ publish)
```
checkFiles(files[]) → error[]    pure function (verify-pack.mjs); export ให้ unit test เรียกได้ (ไม่ trigger npm pack)
setup-dogfood.mjs                installViaNpx() || installViaPack() → appendContributingPointer() (idempotent marker 'CONTRIBUTING.md')
setup-sandbox.mjs                mkdtempSync(os.tmpdir(),'wy-sandbox-') → spawn node src/bin/cli.mjs ลง temp
check-test-count.mjs             อ่าน summary node --test จาก stdin → fail ถ้า fail!=0 / pass<MIN_PASS / pass!=tests
checkLinks(docs,exists) → error[] pure function (lint-md.mjs); export ให้ unit; dead-link gate ของ .md (src/+docs/, exclude template+achieved)
```

## ค่าคงที่สำคัญ
- `CORE` = `.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`, `.claude/agents`, `.claude/skills` (relative กับ pkgRoot=src/)
- `SCAFFOLD_FILES` = `docs/stages/context.md`, `docs/stages/achieved/.gitkeep`
- `TEMPLATE_DOCS` = `.warnyin/template/docs`
- marker idempotent CLAUDE/AGENTS = substring `warnyin/workflow/stages/`

## `package.json files` allowlist (granular — exclude dev tooling)
```
src/bin
src/.warnyin
src/.claude/commands
src/.claude/agents
src/.claude/skills
src/AGENTS.md
README.md  CHANGELOG.md  LICENSE
```
- **dotfolder nested ต้องระบุชัด** (`src/.warnyin`, `src/.claude/commands`, `src/.claude/agents`, `src/.claude/skills`) — npm ไม่รวม nested dotfolder อัตโนมัติ (บทเรียน 0.6.0 ขยายผล)
- **ไม่อยู่ใน list:** `src/tests`, `src/scripts` (dev-only), root `CLAUDE.md`/`AGENTS.md` (dogfood gitignored — payload AGENTS.md อยู่ `src/AGENTS.md`)
- `package.json` รวมเองโดย npm เสมอ; `verify-pack` เป็นตัวพิสูจน์ allowlist (ดู `test.md`)
