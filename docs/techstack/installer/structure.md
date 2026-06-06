# Structure — installer

> โครงไฟล์จริงของ component installer (ณ 2026-06-07 — หลังย้าย source เข้า `src/`)
> **2-layer:** SOURCE (`src/**` committed/publish) · DOGFOOD (root `.warnyin/`/`.claude/`/`CLAUDE.md`/`AGENTS.md` — gitignored, install จาก release)

## ไฟล์ (SOURCE layer — `src/`)
```
src/bin/cli.mjs                   installer หลัก (zero-dep, ~190 บรรทัด); npm bin → ที่นี่
src/tests/installer.test.mjs      black-box integration test ของ installer (9 เคส)
src/tests/verify-pack.test.mjs    unit test ของ checkFiles (9 เคส, BL-4 testable denylist)
src/scripts/verify-pack.mjs       pack-verify gate (allowlist + denylist; export checkFiles)
src/scripts/check-test-count.mjs  pass-count gate (anti-false-green; MIN_PASS=9)
src/scripts/setup-dogfood.mjs     dev: ติดตั้ง release ลง root (dogfood)
src/scripts/setup-sandbox.mjs     dev: ติดตั้ง v-next จาก src/ ลง temp (sandbox)
src/.warnyin/{workflow,template}  playbook กลาง + template (payload)
src/.warnyin/installer/templates/CLAUDE.md   template CLAUDE.md ของ target
src/.claude/{commands/warnyin,agents}        adapter Claude (payload)
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
parse args (--update/--dry-run/--help)
guard pkgRoot === target → error   // defensive no-op หลังย้าย: pkgRoot=src/ แทบไม่มีทาง===target
warn legacy ≤0.2.x (workflow/, warnyin-stages/)
warn legacy 0.3–0.5.x (warnyin/{workflow,template,installer,stages})
─────
for CORE      → copyTree(dir, {overwrite: UPDATE})   // .warnyin/{workflow,template}, .claude/{commands/warnyin,agents}
ensureScaffold()                                      // generate docs/stages/context.md + achieved/.gitkeep (เปล่า)
seedDocs()                                            // .warnyin/template/docs/** → docs/** (ข้าม [...])
installRootDoc('CLAUDE.md', pkgRoot/.warnyin/installer/templates/CLAUDE.md)
installRootDoc('AGENTS.md', pkgRoot/AGENTS.md)
print สรุป created/updated/skipped
```
> guard `pkgRoot===target` หลังย้ายเป็น **defensive no-op โดยตั้งใจ** — pkgRoot=`src/` ไม่มีทาง===repo root/temp; เก็บไว้ zero-cost (design §4.1/§7)

## helper signatures
```
copyTree(relDir, {overwrite})    recursive copy pkgRoot→target; skip ถ้ามีอยู่+!overwrite หรือ byte-equal
ensureScaffold()                 generate SCAFFOLD_FILES เปล่า; skip ถ้ามี; เคารพ DRY
seedDocs(relDir=TEMPLATE_DOCS)   copy template docs→docs/; ข้าม entry ขึ้นต้น '['; ไม่ทับ
installRootDoc(name, srcPath)    ไม่มี→สร้าง; มีแต่ไม่มี marker→append section; มี marker→skip
```

## helper dev tooling (`src/scripts/` — ไม่ publish)
```
checkFiles(files[]) → error[]    pure function (verify-pack.mjs); export ให้ unit test เรียกได้ (ไม่ trigger npm pack)
setup-dogfood.mjs                installViaNpx() || installViaPack() → appendContributingPointer() (idempotent marker 'CONTRIBUTING.md')
setup-sandbox.mjs                mkdtempSync(os.tmpdir(),'wy-sandbox-') → spawn node src/bin/cli.mjs ลง temp
check-test-count.mjs             อ่าน summary node --test จาก stdin → fail ถ้า fail!=0 / pass<MIN_PASS / pass!=tests
```

## ค่าคงที่สำคัญ
- `CORE` = `.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`, `.claude/agents` (relative กับ pkgRoot=src/)
- `SCAFFOLD_FILES` = `docs/stages/context.md`, `docs/stages/achieved/.gitkeep`
- `TEMPLATE_DOCS` = `.warnyin/template/docs`
- marker idempotent CLAUDE/AGENTS = substring `warnyin/workflow/stages/`

## `package.json files` allowlist (granular — exclude dev tooling)
```
src/bin
src/.warnyin
src/.claude/commands
src/.claude/agents
src/AGENTS.md
README.md  CHANGELOG.md  LICENSE
```
- **dotfolder nested ต้องระบุชัด** (`src/.warnyin`, `src/.claude/commands`, `src/.claude/agents`) — npm ไม่รวม nested dotfolder อัตโนมัติ (บทเรียน 0.6.0 ขยายผล)
- **ไม่อยู่ใน list:** `src/tests`, `src/scripts` (dev-only), root `CLAUDE.md`/`AGENTS.md` (dogfood gitignored — payload AGENTS.md อยู่ `src/AGENTS.md`)
- `package.json` รวมเองโดย npm เสมอ; `verify-pack` เป็นตัวพิสูจน์ allowlist (ดู `test.md`)
