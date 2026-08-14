# Build — publish-pack-polish

> รายงานผล BUILD stage · playbook: `.warnyin/workflow/stages/build.md`
> สถานะ: ✅ เสร็จ · ปิด gate §7 ครบ · พร้อมเข้า VERIFY

## สรุป

| Wave | Task | Status | Branch / commit | Test |
|---|---|---|---|---|
| 1a | verify-pack-hardening (Slice A) | ✅ passed | `worktree-wf_629a58f3-2d1-1` (integrate `962ce08`) | 28/28 verify-pack + 211/211 full |
| 1b | cli-help-wording (Slice B) | ✅ passed | `worktree-wf_629a58f3-2d1-2` (integrate `962ce08`) | 40/40 installer + 198/198 full |
| 2 | release-hygiene (Slice C) | ✅ passed | shared-tree on `build/publish-pack-polish` (commit `3e9c436`) | full-gate green |

**Commits บน `build/publish-pack-polish` (3 commits เหนือ `7b2d6e6` DESIGN):**
1. `962ce08` — integrate Wave 1 (verify-pack hardening + cli --help wording)
2. `3e9c436` — integrate Wave 2 (release-hygiene 0.29.1)

## ผลต่อ task

### Slice A: verify-pack-hardening — ✅
- `getNpmCmd(platform = process.platform)` — pure fn ใหม่, Windows = `process.execPath + npm_execpath` (CVE-2024-27980 mitigation)
- `checkEol(entries)` — pure fn ใหม่, Buffer-level `0x0D` check + error prefix `eol:` + sanitized path
- `readTextEntries(files, opts = {})` — I/O ที่ขอบ, path guards 3 ชั้น (absolute/`..`/symlink) + size cap 5 MB + injectable readFile
- `main()` refactor เรียก helper ทั้ง 3 + `--ignore-scripts`
- `TEXT_EXT` export จาก `src/bin/cli.mjs` + เพิ่ม `.css/.html/.cjs`
- +13 unit tests (4 getNpmCmd + 4 checkEol + 5 readTextEntries) — **28/28 verify-pack pass**
- RED proof verified (revert checkEol → checkEol-CRLF test fail; restore → pass)

### Slice B: cli-help-wording — ✅
- แก้ wording `--help` `"ไม่แตะ docs/"` → `"เขียนทับเฉพาะ CORE — ไฟล์ docs/ ถูก seed จาก template ถ้ายังไม่มี ไม่ทับของเดิม"` ใน 4 จุด:
  - `src/bin/cli.mjs` (line 46-49)
  - `src/.warnyin/installer/templates/CLAUDE.md` (line 49)
  - `src/.warnyin/workflow/README.md` (line 101)
  - `README.md` (line 40)
- template อื่น (CLAUDE.global.md / copilot-instructions.md / clinerules / GEMINI.md) grep ไม่เจอ substring เก่า → ไม่ต้องแก้
- +1 spawn test regression guard (substring ใหม่ปรากฏ + substring เก่า `NOT includes` + exit 0) — **40/40 installer pass**
- สร้าง `CHANGELOG` `## [0.29.1]` (ว่าง) + `### Fixed` entry ของ slice B (slice C เติมวันที่ + Migration ภายหลัง)
- RED proof verified (revert cli.mjs → spawn test fail; restore → pass)

### Slice C: release-hygiene — ✅
- `package.json` version: `0.29.0` → `0.29.1` (SemVer patch)
- `MIN_PASS`: `180` → `200` (สูตร `floor((N − 5) / 10) × 10`; N = 212 หลัง integrate Wave 1; slice A +13 + slice B +1 = +14 จาก 198)
- comment ระบุที่มา (slice A +13 verify-pack, slice B +1 installer; headroom 5; snap ลงหลักสิบ)
- `CHANGELOG.md` `## [0.29.1] - 2026-08-14` + `### Migration` section (text ตรง design §Impact — commit/stash warning + threshold 2026-07-14 + renormalize command)
- `docs/infra.md` เพิ่ม `## Runbook — \`verify:pack\` gate failure` — error categories ครบ (denylist/allowlist/eol/path/R1/R2/tripwire/stamp) + ขั้นตอน debug + Windows dev note
- full-gate green (ดู §Full-gate ด้านล่าง)

## Full-gate (blocking — playbook §3 #8)

```
✓ npm test       → 212/212 pass (เดิม 198 + slice A +13 + slice B +1)
✓ lint:md        → 146 ไฟล์ 110 ลิงก์ (dead-link clean)
✓ verify:pack    → 107 ไฟล์ (EOL check ผ่าน)
```

## Files changed (14 ไฟล์)

**Source code (8):**
- `src/bin/cli.mjs` (TEXT_EXT export + --help text)
- `src/scripts/verify-pack.mjs` (+148 บรรทัด)
- `src/scripts/check-test-count.mjs` (MIN_PASS 180→200 + comment)
- `src/tests/verify-pack.test.mjs` (+154 บรรทัด)
- `src/tests/installer.test.mjs` (+22 บรรทัด)
- `src/.warnyin/installer/templates/CLAUDE.md` (wording)
- `src/.warnyin/workflow/README.md` (wording)
- `README.md` (wording)

**Metadata (3):**
- `package.json` (version 0.29.0 → 0.29.1)
- `CHANGELOG.md` ([0.29.1] + Migration section)
- `docs/infra.md` (Runbook section)

**Topic docs (3 — status + acceptance ticked):**
- `docs/stages/publish-pack-polish/tasks/verify-pack-hardening/task.md`
- `docs/stages/publish-pack-polish/tasks/cli-help-wording/task.md`
- `docs/stages/publish-pack-polish/tasks/release-hygiene/task.md`

## Integration notes

### Worktree isolation (Wave 1)
- Agents sync `build/publish-pack-polish` เข้า worktree (fast-forward ที่ `7b2d6e6`) → อ่าน `docs/stages/publish-pack-polish/tasks/<task>/{task,spec,standard,rule}.md` + `design.md` ก่อน implement
- Per KB#11: integrate ใช้ `git apply` (ไม่ใช่ `git checkout` ทั้ง branch) เพื่อ scope เฉพาะ source files
- Wave 1a + Wave 1b ทั้งคู่แก้ `src/bin/cli.mjs` — non-overlapping (Wave 1a: line 105-107 TEXT_EXT, Wave 1b: line 46-49 --help) → apply ทั้ง 2 patches สำเร็จ

### Shared-tree (Wave 2)
- Main loop อยู่ `build/publish-pack-polish` ก่อนรัน (playbook §3 #3) — ไม่ fork worktree
- Sub-agent ทำงานแต่ไม่ commit เอง (per playbook guard)
- Sub-agent ตายกลางทาง (API error) หลังทำ 4 ไฟล์เสร็จ (package.json, check-test-count, CHANGELOG, docs/infra.md) — main loop ทำ full-gate verify + commit ต่อเอง

### Migration section text (locked)
Text ใน `CHANGELOG.md` `### Migration` ตรงตัวตาม design.md §Impact (commit/stash warning + threshold 2026-07-14 + renormalize command)

## Troubleshooting notes (Wave 1)

**จาก Wave 1b (cli-help-wording):** Claude Code Edit tool มี quirk ตอน Edit ไฟล์ Thai ที่มี multi-codepoint characters contiguous — U+FFFD (replacement char) แทนที่บางตัวอักษร; workaround: ใช้ Python `open/read/replace/write` bytes-correct + verify ด้วย `od -c` ก่อน commit (note จะถูกยกขึ้น `docs/troubleshooting.md` ตอน SHIP)

**จาก Wave 1a (verify-pack-hardening):** 2 test patterns ที่ต้องระวัง:
1. Injectable partial deps — test inject only `readFile`/`root` แต่ `lstatSync` ไม่ injectable → ต้องสร้าง real file ใน tmpdir ด้วย `mkdtempSync` ก่อน
2. Test name strings — ใช้ double quotes เมื่อ test name มี quoted code/path examples (single-quote nested = syntax error)

## Note นอก scope (จะเสนอ backlog ตอน SHIP)

- **`check-test-count.mjs`**: comment เก่าบอก "MIN_PASS = 180 ... ยอดจริงวัด N = 192" — N = 192 มาจากไหน? ไม่ตรงกับ test count ก่อน integrate (198 ผ่าน Wave 1a + 1b แล้ว N = 212). TODO: ตรวจสอบ N = 192 ของ project-memory topic (อาจเป็น baseline ที่ bump ไว้ครั้งก่อน) — **ไม่กระทบ build นี้** (เพราะ bump ตาม N ปัจจุบัน)
- **Windows CI ad-hoc verify**: ยังไม่ trigger `windows-latest` workflow — เสนอเป็น backlog item ตอน SHIP (Infra suggestion #4)
- **rule.md §2 ของทั้ง 3 task** มี rule ใหม่ที่ note ไว้ (canonical-copy discipline / negative grep regression / CHANGELOG header ownership / runbook section / Migration executable proof / MIN_PASS evidence-based / error category prefix / Buffer-level byte check / size cap pattern / importable TEXT_EXT / spawn test pattern) — จะย้ายขึ้น `docs/rule.md` กลางตอน SHIP

## Gate §7 (verify before VERIFY)

- [x] ทุก task implement + merge เข้า build branch
- [x] ทุก task รายงาน passed (test-flow + build/lint เขียว)
- [x] ไม่มี merge conflict
- [x] Full build ไม่มี error
- [x] test suite ทั้งหมดเขียวบน build branch (212/212)
- [x] build.md สรุปผลครบ
- [x] ไม่มีแตะ rule/standard กลาง (rule ใหม่ note รอ SHIP)

→ **พร้อมเข้า VERIFY** ด้วย `/warnyin:verify publish-pack-polish`
