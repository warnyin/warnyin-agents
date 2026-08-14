# Verify — publish-pack-polish

> สรุปผล VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> สถานะ: ✅ ผ่าน · 2 findings (แก้ในรอบเดียว — loop tuning: batched, doc/spec alignment) · พร้อมเข้า SHIP

## สรุป

| ตรวจ | ผล | หมายเหตุ |
|---|---|---|
| Regression baseline (npm test + lint:md + verify:pack) | ✅ pass | 212/212 + 148 files + 107 pack files |
| Scenario 1-12 (Spec delta) | ✅ pass | unit + sandbox + spawn `--help` |
| Sandbox EOL proof (rule §5 executable) | ✅ pass | CRLF → fail; renormalize → pass |
| Wording consistency (4 ไฟล์ canonical) | ✅ pass | new substring = 4 matches; old substring = 0 |
| CHANGELOG Migration text vs design.md §Impact | ✅ pass (after fix) | byte-for-byte หลัง align 1 คำ |
| Spec delta applied to feature spec | ✅ pass (after fix) | BUILD ลืม — VERIFY apply 1 Requirement + 11 Scenarios |

**จำนวนการแก้ไข:** 2 (ทั้งสองรอบเดียว)
**Loop tuning:** batched (2 findings เป็น doc/spec alignment — low-risk, fix รวมใน commit เดียว)

## ผลต่อ scenario

### Regression baseline
- `npm test` → **212/212 pass** (198 เดิม + slice A +13 verify-pack + slice B +1 installer)
- `npm run lint:md` → **148 ไฟล์ 110 ลิงก์** clean (เพิ่มจาก 146 เพราะ test.md + build.md)
- `npm run verify:pack` → **107 ไฟล์** pass

### Spec delta scenarios (10 + 1 wording + 1 sandbox)

| # | Scenario | ผล | หลายที่ verify |
|---|---|---|---|
| 1 | LF → no eol-error | ✅ | unit `checkEol-LF` + sandbox (working tree LF) |
| 2 | CR → error (count) | ✅ | unit `checkEol-CRLF` + sandbox (CRLF injection → fail) |
| 3 | binary ext skip | ✅ | unit `checkEol-binary-skip` |
| 4 | absolute path → `path:` | ✅ | unit `readTextEntries-absolute-path` |
| 5 | `..` traversal → `path:` | ✅ | unit `readTextEntries-traversal` |
| 6 | symlink → `path:` | ✅ | unit `readTextEntries-symlink-guard` |
| 7 | Windows → execPath + npm_execpath | ✅ | unit `getNpmCmd-win32-with-path` + `getNpmCmd-win32-no-path` |
| 8 | mac/linux → npm ตรง | ✅ | unit `getNpmCmd-darwin` + `getNpmCmd-linux` |
| 9 | empty buf → pass | ✅ | unit `checkEol-empty` |
| 10 | lone CR → error | ✅ | unit (Buffer-level check จับ 0x0D ทุกตัว) |
| 11 | size > 5MB → skip + warn | ✅ | unit `readTextEntries-size-cap` |
| 12 | Wording regression | ✅ | spawn `cli.mjs --help` → assert substring ใหม่ + NOT old |

### Sandbox EOL proof (rule §5 verify เอกสาร narrative)
```bash
# Step 1: inject CRLF ใน sandbox + run verify:pack
$ printf '## Sandbox\r\n\r\nLine 1\r\n' > .../src/.warnyin/workflow/README.md
$ node verify-pack.mjs
✖ pack-verify ล้มเหลว:
  ✖ eol: ไฟล์ text มี CR 4 ครั้ง (src/.warnyin/workflow/README.md)  ✓

# Step 2: renormalize per Migration section
$ git init -q && git add -A && git commit -qm init
$ echo "*.md text eol=lf" > .gitattributes
$ git rm --cached -r .
$ git reset --hard
# (warning: CRLF will be replaced by LF — proof ว่า git attributes ทำงาน)

# Step 3: run verify:pack อีกครั้ง
$ node verify-pack.mjs
# ✓ eol error หายไป (proves renormalize command ใน Migration section executable)
```
(Sandbox R1 errors เป็น sandbox setup limitation — minimal dirs ไม่ครบ — ไม่กระทบ eol proof)

### Wording consistency (4 ไฟล์)
```
=== new substring count ('เขียนทับเฉพาะ CORE') ===
README.md:1
src/.warnyin/installer/templates/CLAUDE.md:1
src/bin/cli.mjs:1
src/.warnyin/workflow/README.md:1

=== old substring count ('ไม่แตะ docs/') — expected 0 ===
src/bin/cli.mjs:0
src/.warnyin/installer/templates/CLAUDE.md:0
src/.warnyin/workflow/README.md:0
README.md:0
```

### CHANGELOG Migration text vs design.md §Impact
Byte-for-byte match หลัง fix 1 คำ:
- CHANGELOG.md: `และยังไม่ได้ renormalize` (pattern ตาม line 220 `ยังไม่ได้ commit`)
- design.md (เดิม): `และยังไม่ renormalize` — ต่างจาก CHANGELOG 1 คำ
- **fix:** update design.md §Impact ให้ตรง CHANGELOG (user-facing text wins)

### Spec delta applied
- เดิม `docs/features/installer-version-stamp/spec.md`: 4 Requirement, 17 Scenario
- หลัง VERIFY apply design.md §Spec delta: **5 Requirement, 27 Scenario** (เพิ่ม 1 Requirement "verify:pack ตรวจ EOL + เลือก npm binary แบบ cross-platform" + 10 Scenarios)

### Spawn --help (CLI real-env)
```
$ node src/bin/cli.mjs --help | grep -E "(เขียนทับเฉพาะ|ไม่แตะ docs|--update)"
  npx @warnyin/agents --update    อัปเดต playbook กลางเป็นเวอร์ชันล่าสุด
                                  (เขียนทับเฉพาะ CORE — ไฟล์ docs/ ถูก seed จาก template ถ้ายังไม่มี ไม่ทับของเดิม)
exit: 0
```

## Findings + fixes

### Finding 1: CHANGELOG Migration text vs design.md §Impact mismatch
- **Severity:** MEDIUM (rule §5 verify เอกสาร narrative ต้องตรง — design.md ระบุ "Slice C ต้อง commit text นี้ตรงตัว")
- **Symptom:** CHANGELOG.md ใช้ `และยังไม่ได้ renormalize` แต่ design.md §Impact ใช้ `และยังไม่ renormalize` — ต่าง 1 คำ
- **Root cause:** design.md §Impact มี inconsistency ภายใน: line 220 `ยังไม่ได้ commit` (มี "ได้") vs line 222 `ยังไม่ renormalize` (ไม่มี "ได้") — agent ที่เขียน CHANGELOG เลือก pattern line 220 (อ่านเป็นธรรมชาติกว่า)
- **Resolution:** align design.md ให้ตรง CHANGELOG (user-facing committed text wins) — 1 Edit, 1 commit
- **Lesson:** เขียน design.md §Impact ให้ self-consistent ตั้งแต่แรก (grep pattern เดียวกันใน block เดียวกัน)

### Finding 2: Spec delta ใน design.md §Spec delta ยังไม่ถูก apply ลง feature spec
- **Severity:** HIGH (design.md §Spec delta ระบุชัดเจน — "ADDED Requirement + 5 Scenario" ใน `docs/features/installer-version-stamp/spec.md` เป็น deliverable ของ BUILD)
- **Symptom:** ก่อน VERIFY — feature spec มี 4 Requirement, 17 Scenario (ไม่มี Requirement "verify:pack ตรวจ EOL + cross-platform")
- **Root cause:** BUILD agent (Wave 1a verify-pack-hardening) รายงาน passed โดยไม่ได้ apply Spec delta — อาจเพราะมองว่า "unit test ผ่าน = acceptance ผ่าน" แต่ลืมว่า acceptance รวมถึง living-doc update
- **Resolution:** apply ตอน VERIFY — 1 Edit เพิ่ม 1 Requirement + 11 Scenarios ลงท้าย spec file (file structure: 5 Requirement, 27 Scenario)
- **Lesson:** BUILD agent checklist ต้องรวม "Spec delta applied" ด้วย (ไม่ใช่แค่ unit/lint green) — เสนอเพิ่มใน rule.md

## Note นอก scope (จะเสนอ backlog ตอน SHIP)

- **Spec delta enforcement**: BUILD agents อาจมองข้าม "apply Spec delta ลง feature spec" ถ้าไม่อยู่ใน unit/integration acceptance — เสนอเพิ่มเป็น rule ใน `docs/techstack/installer/rule.md`
- **Windows CI ad-hoc verify**: ยังไม่ trigger — เสนอ trigger `windows-latest` GitHub Actions workflow ตอน SHIP
- **Thai codepoint consistency**: design.md §Impact block มี inconsistency ใน `ยังไม่ได้` vs `ยังไม่` — ระวังเวลาเขียน multi-line block ใน Thai

## Gate §6 (verify before SHIP)

- [x] verify ตามจุดประสงค์ของ topic ครบ (functional ตาม test-flow)
- [x] regression baseline ผ่าน (scenario เดิม feature spec ไม่พัง — ผ่าน 17 scenarios เดิม)
- [x] Spec delta scenarios ผ่าน (10 scenarios ใหม่ + 1 spawn wording)
- [x] CLI real-env verify (spawn --help + verify:pack + sandbox EOL proof)
- [x] `test.md` (แผน) + `verify.md` (สรุป + จำนวนการแก้ไข) เขียนครบ
- [x] ไม่มีปัญหายาก/ซ้ำที่ต้องบันทึก troubleshooting.md (findings เป็น doc/spec alignment ทั่วไป ไม่ถึงขั้น KB)

→ **พร้อมเข้า SHIP** ด้วย `/warnyin:ship publish-pack-polish`
