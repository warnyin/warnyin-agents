# Structure — installer

> โครงไฟล์จริงของ component installer (ณ 2026-06-06)

## ไฟล์
```
bin/cli.mjs                  installer หลัก (zero-dep, ~180 บรรทัด)
tests/installer.test.mjs     black-box integration test (9 เคส)
scripts/verify-pack.mjs      pack-verify gate (allowlist)
.github/workflows/ci.yml     CI: test matrix [20,22,24] + job pack-verify
package.json                 files allowlist, scripts.test, engines>=20
CHANGELOG.md                 Keep a Changelog
```

## flow `bin/cli.mjs` (main, ล่างสุดของไฟล์)
```
parse args (--update/--dry-run/--help)
guard pkgRoot === target → error
warn legacy ≤0.2.x (workflow/, warnyin-stages/)
warn legacy 0.3–0.5.x (warnyin/{workflow,template,installer,stages})
─────
for CORE      → copyTree(dir, {overwrite: UPDATE})   // .warnyin/{workflow,template}, .claude/{commands/warnyin,agents}
ensureScaffold()                                      // generate docs/stages/context.md + achieved/.gitkeep (เปล่า)
seedDocs()                                            // .warnyin/template/docs/** → docs/** (ข้าม [...])
installRootDoc('CLAUDE.md', .warnyin/installer/templates/CLAUDE.md)
installRootDoc('AGENTS.md', AGENTS.md)
print สรุป created/updated/skipped
```

## helper signatures
```
copyTree(relDir, {overwrite})    recursive copy pkgRoot→target; skip ถ้ามีอยู่+!overwrite หรือ byte-equal
ensureScaffold()                 generate SCAFFOLD_FILES เปล่า; skip ถ้ามี; เคารพ DRY
seedDocs(relDir=TEMPLATE_DOCS)   copy template docs→docs/; ข้าม entry ขึ้นต้น '['; ไม่ทับ
installRootDoc(name, srcPath)    ไม่มี→สร้าง; มีแต่ไม่มี marker→append section; มี marker→skip
```

## ค่าคงที่สำคัญ
- `CORE` = `.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`, `.claude/agents`
- `SCAFFOLD_FILES` = `docs/stages/context.md`, `docs/stages/achieved/.gitkeep`
- `TEMPLATE_DOCS` = `.warnyin/template/docs`
- marker idempotent CLAUDE/AGENTS = substring `warnyin/workflow/stages/`
