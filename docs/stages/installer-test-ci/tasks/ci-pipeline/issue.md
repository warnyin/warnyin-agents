# Issue (dry-run) — ci-pipeline

> ผล dry-run 2026-06-06 (agent verify จริงบน node 24/npm 11 — read-only)

## Blocker
**ไม่มี hard blocker** — schema `npm pack --dry-run --json` (`[{files:[{path}]}]`), `execFileSync('npm',...)` คืน stdout JSON สะอาด, `npm` บน ubuntu PATH, ไม่ตั้ง cache ไม่ error, `node --test tests/` บน node 20+ ใช้ได้, sequential กับ `installer-test-suite` ถูกต้อง — verify ผ่านหมด

## Decision — BK-1 (resolved ✅)

### BK-1 — pack-verify denylist → **allowlist** (user เลือก 2026-06-06)
- **เดิม:** `leaked = files.filter(p => startsWith 'tests/' || '.github/')` (denylist) — จับ leak *ชนิดใหม่* ในอนาคตไม่ได้
- **ข้อเท็จจริงแก้ความเข้าใจ:** `.warnyin/installer/templates/CLAUDE.md` **ไม่ใช่ leak** — `cli.mjs:157` อ่านตอนติดตั้ง ต้องอยู่ใน package (อยู่ใต้ `.warnyin/` allowlist ถูกต้อง)
- **แก้แล้วใน `spec.md`:** allowlist — `ALLOWED_PREFIX=[bin/, .warnyin/, .claude/, docs/stages/]` + `ALLOWED_FILE=[package.json, README, CLAUDE, AGENTS, CHANGELOG, LICENSE]` (รวม npm always-include กัน false-positive); ยัง assert `.warnyin/workflow/` ติด (บทเรียน 0.6.0)

## Defer (ทำตอนเขียน/ไม่ขวาง BUILD)

- **SHA-pin actions:** ต้อง resolve SHA จริงจาก GitHub ตอนเขียน workflow (online) — จำเป็นก่อน merge (`task.md` acceptance)
- **Windows runner ใน verify-pack:** spec note ว่า matrix รัน ubuntu อย่างเดียว → defer ได้; แต่ dev รัน `node scripts/verify-pack.mjs` บน Windows จะ ENOENT (`npm`→`npm.cmd`) — dev-only ไม่ขวาง CI
- **`actionlint`:** optional — อ่านทาน YAML มือได้ถ้าไม่มี tool
- **ย้อนบันทึก 0.6.0 ใน CHANGELOG:** optional (migration เต็ม = roadmap P0#3)
- **`fail-fast: false`:** ใส่ตอนเขียนได้เลย ไม่ต้อง defer

**สรุป: ไม่มี hard blocker — เหลือ BK-1 (denylist vs allowlist) รอ user ตัดสินก่อนเขียน verify-pack**
