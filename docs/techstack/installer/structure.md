# Structure — installer

> โครงไฟล์จริงของ component installer (ณ 2026-06-07 — หลังย้าย source เข้า `src/`)
> **2-layer:** SOURCE (`src/**` committed/publish) · DOGFOOD (root `.warnyin/`/`.claude/`/`CLAUDE.md`/`AGENTS.md` — gitignored, install จาก release)

## ไฟล์ (SOURCE layer — `src/`)
```
src/bin/cli.mjs                   installer หลัก (zero-dep); npm bin → ที่นี่ (export resolveMode + isEntrypoint)
src/tests/installer.test.mjs      black-box integration test ของ installer (33 เคส; รวม global + version stamp a–d + isEntrypoint truth table + black-box symlink + universal-ide T1-project-basic/T1-idempotent/T1-existing-clinerules/T1-update/T1-dry-run/T1-global)
src/tests/verify-pack.test.mjs    unit test ของ checkFiles (13 เคส, BL-4 testable denylist; รวม stamp-deny + T2-adapter-templates/T2-negative)
src/scripts/verify-pack.mjs       pack-verify gate (allowlist + denylist; export checkFiles)
src/scripts/check-test-count.mjs  pass-count gate (anti-false-green; MIN_PASS=180 — bump พร้อม topic ที่เพิ่มเคส)
src/scripts/lint-md.mjs           dead-link gate (zero-dep; export checkLinks; strip-code alternation)
src/tests/lint-md.test.mjs        unit test ของ checkLinks (7 เคส, BL-4 testable)
src/tests/memory.test.mjs         structural test ข้าม slice ของ project memory (21 เคส M1-M9: heading freeze / hook exact-set / negative-grep / registry / template / SHIP gate regression)
src/tests/memory-status.test.mjs  unit ของ summarize() + spawn จริง (18 เคส: parse contract, flags, placeholder, negative-property)
src/tests/eol.test.mjs            EOL gate — payload/tooling ต้องเป็น LF (EOL1-EOL4: workflow script / src *.mjs / normalizeEol unit / ทุกไฟล์ text ใต้ src)
src/tests/setup-dogfood.test.mjs  unit test ของ verifyInstalled/semverGte/checkTarballVersion/parse/readStamp (32 เคส, BL-4; truth table active≥0.17.0 + drift-guard + wire-proof)
src/scripts/setup-dogfood.mjs     dev: ติดตั้ง release ลง root (--update + version-aware verifyInstalled; pin-exact + prefer-online สมมาตร npx/pack; checkTarballVersion ที่ source; npx explicit bin; export + main-guard)
src/scripts/setup-sandbox.mjs     dev: ติดตั้ง v-next จาก src/ ลง temp (sandbox)
src/.warnyin/{workflow,template}  playbook กลาง (stages/ roles/ contexts/ scripts/) + template (payload)
src/.warnyin/workflow/loop-tuning.md         why-guidance ของ fix loop (orchestrator-only single-source — build/verify ชี้ pointer มา)
src/.warnyin/workflow/memory.md              canonical ของ project memory (9 heading freeze: semantic/governance/schema/layout/write/consume/promote/trust/ทบทวน)
src/.warnyin/workflow/scripts/memory-status.mjs  report script สุขภาพ memory (read-only, exit 0 เสมอ, export summarize)
src/.warnyin/template/docs/memory.md         template บทเรียนสะสม (ตาราง 6 คอลัมน์ + closed-set + คำเตือน; แถวตัวอย่างเป็น HTML comment)
src/.warnyin/template/docs/stages/context.md template working state (4 section คงที่ เขียนทับ)
src/.warnyin/template/stages/receipt.md      template fast-track receipt (≤40 บรรทัด, H1 placeholder = isFilled contract) — **นอก `[topic]/` โดยเจตนา** กัน whole-folder copy (ดู rule.md)
src/.warnyin/installer/templates/CLAUDE.md   template CLAUDE.md ของ target (per-project root doc + resolution note)
src/.warnyin/installer/templates/CLAUDE.global.md   note-only (resolution + workspace-guard + marker) → installGlobalNote เขียนลง ~/.claude/CLAUDE.md (global mode)
src/.warnyin/installer/templates/cursor-rules.mdc        template Cursor adapter → .cursor/rules/warnyin.mdc (overwrite strategy)
src/.warnyin/installer/templates/windsurf-rules.md       template Windsurf adapter → .windsurf/rules/warnyin.md (overwrite strategy)
src/.warnyin/installer/templates/copilot-instructions.md template Copilot adapter → .github/copilot-instructions.md (append-with-marker)
src/.warnyin/installer/templates/clinerules              template Cline adapter → .clinerules (append-with-marker)
src/.warnyin/installer/templates/GEMINI.md               template Gemini adapter → GEMINI.md (append-with-marker)
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
writeVersionStamp()   → target/.warnyin/.warnyin-version (= pkg version, unconditional; เคารพ DRY)  // ทั้ง 2 mode หลัง CORE
[project] ensureScaffold() + seedDocs() + installRootDoc(CLAUDE.md) + installRootDoc(AGENTS.md)
[global]  skip scaffold/seed (ยกให้ /warnyin:init) + installGlobalNote() → ~/.claude/CLAUDE.md + ข้าม AGENTS.md global
print สรุป created/updated/skipped
─────
main-guard: if (isEntrypoint(process.argv[1], import.meta.url)) await main()   // realpath argv[1] กัน symlink พังเงียบ
```
> guard `pkgRoot===target` = **defensive no-op โดยตั้งใจ** — pkgRoot=`src/` ไม่มีทาง===homedir/cwd/temp; zero-cost
> main flow ห่อ **async เฉพาะ path TTY** (readline prompt); non-TTY/flag-explicit ไม่แตะ readline (ไม่ค้าง)
> **main-guard ใช้ `isEntrypoint` realpath ทั้งสองฝั่ง** — npx รัน bin ผ่าน `.bin` symlink + dogfood extract ลง symlinked tmpdir → `path.resolve(argv[1])` เดิม mismatch realpath → main() เงียบ (ดู rule §cli.mjs + troubleshooting #13)

## helper signatures
```
resolveMode({globalFlag,projectFlag,isTTY,answer}) → 'project'|'global'   // pure-fn (export, main-guard กัน trigger); unit-testable ไม่ต้อง spawn TTY
isEntrypoint(argv1, metaUrl, realpath=fs.realpathSync) → boolean   // pure-fn (export); realpath(argv1)===fileURLToPath(metaUrl) + fallback path.resolve เมื่อ realpath throw — entrypoint detection ทน symlink (npx/.bin, dogfood tmpdir)
copyTree(relDir, {overwrite})    recursive copy pkgRoot→target; skip ถ้ามีอยู่+!overwrite หรือ byte-equal
ensureScaffold()                 generate SCAFFOLD_FILES เปล่า; skip ถ้ามี; เคารพ DRY  (project mode)
seedDocs(relDir=TEMPLATE_DOCS)   copy template docs→docs/; ข้าม entry ขึ้นต้น '['; ไม่ทับ  (project mode)
installRootDoc(name, srcPath)    ไม่มี→สร้าง; มีแต่ไม่มี marker→append section; มี marker→skip  (เขียนทั้งไฟล์ — per-project)
installGlobalNote()              อ่าน templates/CLAUDE.global.md → ~/.claude/CLAUDE.md append-with-marker `<!-- warnyin:global-note -->`; defensive-skip ถ้า template ไม่มี; เคารพ DRY  (global mode — note-only ไม่ทับ personal memory)
installAdapterDoc(srcPath, destPath, {overwrite}) → อ่าน template → ถ้า !destExists: writeFileSync (created); ถ้า destExists+!overwrite: marker-check → ไม่มี marker→append section+marker · มี marker→skip; ถ้า destExists+overwrite=true: writeFileSync (updated) — universal-ide: Cursor/Windsurf ส่ง overwrite=UPDATE; Copilot/Cline/Gemini ส่ง overwrite=false เสมอ
readPkgVersion() → string        อ่าน pkgRoot/../package.json → version (ทั้ง dev + tarball layout)
writeVersionStamp()              เขียน target/.warnyin/.warnyin-version = pkgVersion+'\n' (unconditional writeFileSync ไม่ skip-if-equal; เคารพ DRY; stats/log +/↻) — version identity ของ payload
```

## helper dev tooling (`src/scripts/` — ไม่ publish)
```
checkFiles(files[]) → error[]    pure function (verify-pack.mjs); export ให้ unit test เรียกได้ (ไม่ trigger npm pack)
setup-dogfood.mjs                resolveExpectedVersion() → installViaNpx(EXPECTED) || installViaPack(EXPECTED) (ทั้งคู่ส่ง `--update` + pin-exact spec + prefer-online สมมาตร + `verifyInstalled(repoRoot, expected)`; npx explicit bin `warnyin-agents`; pack เรียก `checkTarballVersion` ก่อน --update) → appendContributingPointer(); export verifyInstalled/readStamp/parseNpmViewVersion/semverGte/checkTarballVersion + main-guard
verifyInstalled(root, expected?) → boolean  CORE markers + (optional) เทียบ stamp กับ expected ตาม truth table transition-safe (falsy expected→degrade marker-only · stamp ขาด + expected≥0.17.0→**false** active · stamp ขาด + <0.17.0/non-semver→true transition · stamp≠expected→false drift · normalize trim สองฝั่ง); export ให้ unit test
semverGte(a,b) → boolean         pure; numeric tuple compare (split '.' → parseInt||0 NaN-safe); export
checkTarballVersion(extractDir, expected) → boolean   pure; อ่าน package.json ของ tarball เทียบ version กับ expected exact-equality (trim สองฝั่ง); expected falsy/อ่านไม่ได้→true degrade; export (testable temp dir)
readStamp(root) → string|null          อ่าน root/.warnyin/.warnyin-version (trim; empty/ไม่มี→null); export
parseNpmViewVersion(stdout) → string|null  pure: ดึงบรรทัด semver จริงจาก stdout (ทน notice/warning ปน); export ให้ unit ไม่ต้อง spawn
resolveExpectedVersion() → string|null  spawn `npm view @warnyin/agents version` (timeout 15s) → parseNpmViewVersion; fail→null+warn loud (degrade)
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
- **`src/.claude/agents/`** = `warnyin-{sa,tech-lead,qa,security,infra}` (reviewer read-only, DESIGN panel) + **`warnyin-ux`** (generator read-only — วาด wireframe, DESIGN step 4.5; ดู `docs/features/uxui-wireframe/`); ทุกตัว frontmatter `tools: Read, Grep, Glob`
