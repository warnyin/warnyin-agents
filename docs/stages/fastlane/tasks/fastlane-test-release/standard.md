# Standard — fastlane-test-release

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> อิงจาก `docs/techstack/installer/standard.md` + `docs/techstack/installer/test.md`

## 1. Standard กลางที่ยึด (จาก techstack)
- **harness กลาง** (`docs/techstack/installer/standard.md` §Test harness) — **reuse ของเดิมใน `src/tests/installer.test.mjs`**: `makeTempProject(t)` (mkdtemp + `t.after` cleanup), `runCli(cwd,args,env,opts)` (spawn จริง array args, ห้าม `shell:true`), `ok(r,msg)` (assert `code===0` + surface stderr) — **ห้ามเขียน harness ใหม่ซ้ำ**
- **cross-platform:** `process.execPath`, `path.join`, `fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))` — **ห้าม `.pathname`** (Windows คืน `/D:/...`)
- **black-box:** เคส install assert **target-side path** (`.warnyin/workflow/fastlane.md`) ไม่ใช่ `src/.warnyin/...`
- **zero-dep:** built-in `node:*` เท่านั้น (`node:test`, `node:assert/strict`, `node:fs`, `node:path`, `node:url`)
- **anti-false-green** (`test.md` §pass-count gate): `pass === tests` → **ห้าม `t.skip()` / conditional-skip**; เคส platform-specific ที่รันไม่ได้ให้ `console.log(...) ; return` ภายในเคส (ยังนับเป็น pass — pattern เดียวกับ symlink case)
- **CHANGELOG:** Keep a Changelog — กลุ่ม Added/Changed + version + วันที่

## 2. Pattern การเขียนโค้ดของ task นี้
- **negative-grep = node ล้วน:** อ่านไฟล์ด้วย `readdirSync(dir, { recursive: true })` (node 20+) หรือ walker เล็ก + `readFileSync(f,'utf8')` แล้ว `.includes(NEEDLE)` — **ห้าม `spawnSync('grep'/'rg')`** (Windows พัง) และห้าม dependency ภายนอก
- **canonical string เป็น const เดียวในไฟล์ test** (เช่น `const DESC = '...'`, `const CANON_PREFLIGHT = '...'`) แล้ววน assert ทุก consumer — กัน string เพี้ยนในตัว test เอง (contract C4 คำต่อคำ)
- **ordering ใช้ index ของบรรทัด** (`lines.findIndex`) + assert `idxA >= 0 && idxB >= 0 && idxA < idxB` — หาไม่เจอต้อง fail ไม่ใช่ผ่านเงียบ (`-1 < 0` = false-green)
- **path จาก test → repo root:** `fileURLToPath(new URL('../../', import.meta.url))` (จาก `src/tests/`) แล้ว `path.join(root, 'src/.warnyin/workflow')`
- error handling: assertion message ต้องระบุ **ไฟล์ + สิ่งที่คาด** (เช่น `` `พบ canonical ใน ${files.join(',')} — ต้องมีไฟล์เดียว` ``)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `makeTempProject` / `runCli` / `ok` / `listFiles` — มีอยู่แล้วใน `src/tests/installer.test.mjs`
- pattern อ่าน version สดจาก `package.json` (`pkgVersion`) — มีอยู่แล้ว ห้าม hardcode version ในเคสใดๆ
- `src/scripts/check-test-count.mjs` — gate สำเร็จรูป **ไม่ต้องแก้** (ดู `rule.md` §1)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- ถ้าเคส structural/canonical (B/C/D/E/F) รวมกันแล้วยาวเกินจนไฟล์ `installer.test.mjs` เทอะทะ → แยกเป็น `src/tests/fastlane.test.mjs` ได้ (bare `node --test` recurse discover `src/tests/*.test.mjs` เอง — **ห้ามใส่ path arg ใน `npm test`**) แต่เคส **install proof (A) ต้องอยู่ใน `installer.test.mjs`** เพื่อ reuse harness ตรง
- pattern "canonical single-source ด้วย node negative-grep" (แทน `grep -rl` ใน `test.md`) เป็นของใหม่ — ถ้าใช้ได้ผลให้ note ใน `rule.md` §2 เสนอขึ้น `docs/techstack/installer/test.md` ตอน SHIP
