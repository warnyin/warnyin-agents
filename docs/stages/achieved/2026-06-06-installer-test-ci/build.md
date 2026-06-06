# Build report — installer-test-ci

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`
> build branch: `build/installer-test-ci` · วันที่: 2026-06-06 · mode: shared-tree (sequential)

## ผลต่อ task

| Wave | Task | สถานะ | ผล test | ไฟล์ |
|---|---|---|---|---|
| 1 | `installer-test-suite` | ✅ passed | `npm test` 8/8 เขียว | `tests/installer.test.mjs`, `package.json` |
| 2 | `ci-pipeline` | ✅ passed | npm test 8/8 + pack-verify PASS + contract 12/12 | `.github/workflows/ci.yml`, `scripts/verify-pack.mjs`, `CHANGELOG.md` |

## Full build & test gate (บน build branch ที่ integrate แล้ว)
- ✅ `npm test` (`node --test`, zero-dep) — **8/8 pass, 0 fail** (node v24 local)
- ✅ pack-verify logic — `npm pack --dry-run`: **83 ไฟล์**, `.warnyin/workflow/` ติด, ไม่มีไฟล์นอก allowlist รั่ว (`tests/`/`.github/` ไม่ติด)
- ✅ ci.yml security contract: `permissions: contents:read`, `on: pull_request` (ไม่มี `pull_request_target`), ไม่มี `secrets.*`, SHA-pin actions, matrix [20,22,24], ไม่มี `npm ci`/cache
- ไม่มี build step (tooling repo — ไม่มี compile)

## Integration notes
- shared-tree: main loop commit ให้แต่ละ wave (agent ไม่ commit เอง) — ไม่มี merge conflict
- ไม่แตะ `bin/cli.mjs` (black-box) · ไม่แตะ rule/standard กลางใน `docs/` (rule ใหม่ note ใน `tasks/*/rule.md` §2 รอ SHIP)

## Deviation จาก DESIGN (เจอตอน build — บันทึกใน `troubleshooting.md`)
1. **`node --test tests/` → `node --test` (bare)** — design §4/§5 lock `node --test tests/` แต่ node 24 ตีความ `tests/` เป็น module path (MODULE_NOT_FOUND) + glob ไม่ portable node 20 → ใช้ bare `node --test` (cwd-discovery) เขียวทุก matrix; CI เรียก `npm test` (spec ci-pipeline แก้แล้ว)
2. **`build-wave.mjs` รับ args เป็น string** (core fix) — harness ส่ง args ของ Workflow เป็น JSON string → แก้ให้ defensive parse (commit บน main แยก) → **ควรเข้า roadmap** (กระทบทุก BUILD)

## Gate → VERIFY ✅
ทุก task passed · ไม่มี conflict · full test เขียว · build.md ครบ · ไม่แตะ rule/standard กลาง — **พร้อม VERIFY**
