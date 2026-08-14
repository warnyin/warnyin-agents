# Ship — publish-pack-polish

> สรุปการส่งมอบ SHIP · playbook: `.warnyin/workflow/stages/ship.md`
> สถานะ: ✅ ส่งมอบครบ · ปิด backlog #1, #2, #4 · feature `installer-version-stamp` ปรับปรุง

## Feature ที่ปรับปรุง
**`installer-version-stamp`** — ขยายจาก stamp not leaking (เดิม) เพิ่ม 1 Requirement + 11 Scenarios ครอบ EOL gate + cross-platform npm binary (ครบตาม Spec delta จาก `design.md §Spec delta` — apply ตอน VERIFY):
- **Requirement ใหม่:** `verify:pack ตรวจ EOL + เลือก npm binary แบบ cross-platform` (added 0.29.1)
- **11 Scenarios ใหม่:** LF pass / CR fail (count) / binary ext skip / absolute path / `..` traversal / symlink / Windows execPath / Windows no execPath / mac+linux npm / empty buf / lone CR / size > 5MB skip

## เอกสารกลางที่อัปเดต

| ไฟล์ | สาระ |
|---|---|
| `docs/features/installer-version-stamp/spec.md` | เพิ่ม 1 Requirement + 11 Scenarios (Spec delta applied ตอน VERIFY) |
| `docs/techstack/installer/rule.md` | §2 Error category + scanning patterns (8 ข้อ — error prefix, Buffer-level, size cap, importable constant, negative-grep, spawn test, Migration executable proof, BUILD agent Spec delta checklist) + §3 Cross-platform verify-pack (supersede KB #4) |
| `docs/techstack/installer/test.md` | verify-pack.test 28 cases (15 เดิม + 13 ใหม่) · section EOL gate / cross-platform + sandbox proof / spawn test pattern |
| `docs/rule.md` | CHANGELOG header ownership (multi-slice) · runbook section ใน infra docs |
| `docs/troubleshooting.md` | #4 supersede (Windows fix: `getNpmCmd` ใช้ `process.execPath + npm_execpath`) + entry ใหม่: Claude Code Edit tool corrupts Thai multi-codepoint (Python workaround) |

## Backlog
- **#1** EOL guard tarball → ✅ done (supersede partial)
- **#2** Windows npm → ✅ done (supersede KB #4)
- **#4** cli --help wording → ✅ done
- **#5** universal-ide spec format → คง `open` (Topic B)

## Learned-rule ที่ promote (15 candidates → 13 ✅ + 1 ✂️ drop + 1 incident-only)
- ✅ **installer/rule.md §2** (8 ข้อ): error category prefix convention · Buffer-level byte check · size cap pattern · importable constant pattern · negative-grep regression · spawn test pattern · Migration section executable proof · BUILD agent Spec delta checklist
- ✅ **installer/rule.md §3** (1 ข้อ): cross-platform verify-pack Windows fix (supersede KB #4)
- ✅ **rule.md §1** (2 ข้อ): CHANGELOG header ownership multi-slice · runbook section ใน infra docs
- ✅ **troubleshooting.md** (1 incident): Claude Code Edit tool corrupts Thai multi-codepoint characters
- ✂️ **dropped:** CI windows-latest ad-hoc verify pattern (กว้างเกินไปต้อง config เพิ่ม — defer เป็น backlog แยก)
- ⏭️ **already exists** (no-op skip): canonical-copy discipline (rule.md §1) · MIN_PASS evidence-based (installer/rule.md §1) — ซ้ำกับกฎเดิม

## Note ที่ตัดทิ้ง (พร้อมเหตุผล)
- **CI windows-latest ad-hoc verify pattern** — rule ขยายขอบเขตเกิน topic นี้ (ต้องการ CI workflow ad-hoc + matrix config) → defer เสนอเป็น backlog item ใหม่ตอน SHIP รอบถัดไป
- **`check-test-count.mjs` baseline mismatch** (build.md note) — comment เก่าบอก N=192 แต่ของจริง=212 (delta มาจาก project-memory topic) — ไม่กระทบเพราะ bump ตาม N ปัจจุบัน + comment ระบุที่มาใหม่ครบ

## Archive
- `docs/stages/publish-pack-polish/` → `docs/stages/achieved/2026-08-14-publish-pack-polish/`
- 14 ไฟล์: `proposal.md` + `design.md` + `build.md` + `test.md` + `verify.md` + `tasks/{verify-pack-hardening,cli-help-wording,release-hygiene}/{task,spec,standard,rule}.md` (12 ไฟล์)

## Gate §6 (SHIP complete)
- [x] topic archived → `docs/stages/achieved/2026-08-14-publish-pack-polish/`
- [x] `docs/features/installer-version-stamp/spec.md` อัปเดต (Spec delta applied)
- [x] learned-rules (planned + emergent) พิจารณาครบ 15 ตัว → promote 13 + drop 1 + incident 1
- [x] `docs/troubleshooting.md` รวม entry ใหม่ + supersede #4
- [x] backlog #1, #2, #4 → dropped (ทำเสร็จ)
- [x] `docs/techstack/installer/rule.md`, `docs/techstack/installer/test.md`, `docs/rule.md`, `docs/infra.md` อัปเดตตาม promotion plan
- [x] `ship.md` สรุปการส่งมอบเขียนครบ
- [x] project memory snapshot อัปเดต (`docs/stages/context.md`)
- [x] ไม่มี `openapi.yaml` ใน topic (ไม่มี REST API contract)

→ **Topic A ปิดสมบูรณ์** · พร้อมเริ่ม Topic B (`universal-ide-spec`)
