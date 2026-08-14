# Test — publish-pack-polish

> แผนการ verify สำหรับ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> ครอบ regression baseline (scenario เดิม feature spec) + test case ใหม่ (Spec delta scenarios)

## 1. จุดประสงค์ของ topic (ที่ต้อง verify)

**3 สิ่งที่ BUILD ส่งมอบ:**

1. **EOL gate ใน `verify:pack`** — payload text files ต้องเป็น LF เสมอ (ตรวจ CR ผ่าน Buffer-level check) — ป้องกัน `script contains control characters` พังตอน user รัน `/warnyin:build`
2. **Cross-platform npm binary** — Windows dev รัน `verify:pack` ได้โดยใช้ `process.execPath + npm_execpath` (ไม่ใช้ `.cmd` → ปิด CVE-2024-27980 + PATH/CWD hijack)
3. **`--help` wording ตรงความจริง** — `--update` เขียนทับ CORE + seed `docs/` แต่ไม่ทับของเดิม (single canonical 5 จุด)

**Acceptance (จาก task.md §5 ทุก slice):**

- A: `verify:pack` exit 0 บน LF payload, exit 1 บน CR payload (error prefix `eol:` + count + sanitized path)
- A: `getNpmCmd('win32')` + `npm_execpath` → `{ bin: process.execPath, prefix: [path] }`; no `npm_execpath` → `null`
- A: `readTextEntries(['/etc/passwd'])` → error `path: absolute path` (ไม่ read)
- B: `stdout` ของ `cli.mjs --help` includes `เขียนทับเฉพาะ CORE` + NOT includes `ไม่แตะ docs/`
- C: `package.json` version = `0.29.1`; MIN_PASS = 200; CHANGELOG `## [0.29.1] - 2026-08-14` + `### Migration`

## 2. Regression baseline

**Feature ที่ topic แตะ:** `docs/features/installer-version-stamp/spec.md`

Scenario เดิมที่ต้องไม่พัง:
- [ ] stamp ไม่หลุดขึ้น tarball (`verify:pack` ไม่ flag stamp file)
- [ ] payload template ติดครบ (existing R1 check: `.warnyin/workflow/`, `.claude/commands/warnyin/`, `.claude/skills/`, `.warnyin/template/docs/`)
- [ ] denylist ทำงาน (`src/tests/`, `src/scripts/`, `docs/`, `.github/`, `.warnyin/`, `.claude/` ที่ root = flag)
- [ ] allowlist safety net (ไฟล์นอก `ALLOWED_PREFIX`/`ALLOWED_FILE` = flag)

→ ครอบด้วย **existing 13 เคสใน `verify-pack.test.mjs`** (regression guard) + `npm test` ทั้ง suite

## 3. Spec delta (test cases ใหม่ — 10 scenarios จาก design.md §Spec delta)

| # | Scenario | ทดสอบด้วย | Expected |
|---|---|---|---|
| 1 | payload text = LF → no eol-error | unit `checkEol([{buf: LF, ext:.md}])` + sandbox e2e | errors=[] |
| 2 | payload text มี CR → error (count) | unit + sandbox e2e สร้าง CRLF file | error prefix `eol:` + count |
| 3 | binary (ext ไม่ใน TEXT_EXT) → skip | unit `checkEol([{ext:.png, buf:CR byte}])` | errors=[] |
| 4 | path absolute → `path:` error | unit + sandbox | ไม่ read ไฟล์ |
| 5 | path มี `..` → `path:` error | unit | ไม่ read ไฟล์ |
| 6 | file = symlink → `path:` error | unit + real symlink | ไม่ read ไฟล์ |
| 7 | Windows → `execPath + npm_execpath` | unit `getNpmCmd('win32')` | `{bin, prefix}` |
| 8 | mac/linux → npm ตรง | unit `getNpmCmd('darwin'\|'linux')` | `{bin:'npm', prefix:[]}` |
| 9 | empty file → pass EOL | unit | errors=[] |
| 10 | lone CR (Mac classic) → error | unit | error prefix `eol:` |
| 11 | size > 5MB → skip + warn | unit + console.warn check | entries.buf=null, no error |
| 12 | Wording regression | spawn `cli.mjs --help` | includes new + NOT includes old |

## 4. local env setup

- Node.js ≥20 (CI matrix: 20/22/24); mac/linux local dev
- ไม่มี service/DB
- `npm test` → ใช้ built-in `node --test` (no external runner)
- `npm run verify:pack` → spawn `npm pack --dry-run --json --ignore-scripts` บน working tree

## 5. e2e smoke + sandbox

### Sandbox EOL proof (rule §5 verify เอกสาร narrative — executable)
```bash
TMPDIR=$(mktemp -d)
cp -r src package.json CHANGELOG.md README.md LICENSE "$TMPDIR/"
cd "$TMPDIR"
# inject CRLF ในไฟล์ text ที่อยู่ใน payload (e.g. src/.warnyin/workflow/README.md)
# ใช้ awk หรือ printf + redirect บรรทัดใหม่แบบ \r\n
node ../../src/scripts/verify-pack.mjs   # คาดว่า exit 1 + "eol: ไฟล์ text มี CR N ครั้ง (src/.warnyin/workflow/README.md)"
echo "exit code: $?"   # → 1
# renormalize per Migration section
git init -q && git add -A && git commit -qm init
echo "*.md text eol=lf" > .gitattributes   # บังคับ LF
git rm --cached -r . >/dev/null
git reset --hard >/dev/null
node ../../src/scripts/verify-pack.mjs   # คาดว่า exit 0
echo "exit code: $?"   # → 0
cd - && rm -rf "$TMPDIR"
```

### Wording consistency (4 ไฟล์)
```bash
grep -c 'เขียนทับเฉพาะ CORE' src/bin/cli.mjs src/.warnyin/installer/templates/CLAUDE.md src/.warnyin/workflow/README.md README.md
# expected: 1 1 1 1 (4 matches)
grep -F 'ไม่แตะ docs/' src/bin/cli.mjs src/.warnyin/installer/templates/CLAUDE.md src/.warnyin/workflow/README.md README.md
# expected: empty (4 files clean)
```

### CHANGELOG Migration text vs design.md §Impact (byte-for-byte)
- อ่าน `## [0.29.1] - 2026-08-14` + `### Migration` section ใน `CHANGELOG.md`
- เทียบกับ text ที่ lock ใน `docs/stages/publish-pack-polish/design.md §Impact` (commit/stash warning + threshold 2026-07-14 + renormalize command)
- ต้องตรงทุก codepoint (รวม Thai multi-codepoint + en-dash ถ้ามี)

### CLI real-environment checks
- `node src/bin/cli.mjs --help` → assert substring ใหม่ + NOT substring เก่า + exit 0
- `node src/scripts/verify-pack.mjs` (working tree LF) → exit 0
- `node src/scripts/check-test-count.mjs < <(npm test)` → exit 0 + pass ≥ 200

## 6. Acceptance checklist

- [ ] regression baseline ผ่าน — npm test 212/212 + lint:md + existing verify-pack
- [ ] scenario 1-11 (Spec delta) ผ่าน — unit + sandbox
- [ ] scenario 12 (wording) ผ่าน — spawn check
- [ ] sandbox EOL proof ผ่าน — sandbox CRLF → exit 1 + renormalize → exit 0
- [ ] wording consistency ผ่าน — 4 files canonical
- [ ] CHANGELOG Migration text matches design.md §Impact byte-for-byte
- [ ] `verify.md` เขียนครบ (สรุป + จำนวนรอบแก้)

→ ผ่าน gate §6 ของ VERIFY → เข้า SHIP ได้
