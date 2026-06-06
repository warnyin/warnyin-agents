# SHIP report — src-bootstrap

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> วันที่ ship: 2026-06-07 · archive: `docs/stages/achieved/2026-06-07-src-bootstrap/`

## 1. สรุปส่งมอบ
topic **src-bootstrap** (bootstrap/self-hosting — แยก source เข้า `src/` + dogfood ที่ root จาก release) ปิดสมบูรณ์ — VERIFY ผ่าน Gate (8 TC + 5 negative, 0 fix), promote ความรู้ขึ้นเอกสารกลางครบ, archive แล้ว

## 2. จำแนก feature
- **ไม่สร้าง `docs/features/`** (user decision) — topic เป็น `chore / architecture (internal restructure)` ไม่ใช่ product feature; capability (dogfood/bootstrap 2-layer) บันทึกใน `docs/project.md` §bootstrap + `docs/infra.md` + `docs/rule.md §6` แล้ว (สอดคล้องแบบ topic ก่อน `installer-test-ci` ที่ไม่สร้าง features/)

## 3. เอกสารกลางที่อัปเดต

| ไฟล์ | สาระที่ promote/แก้ |
|---|---|
| `docs/techstack/installer/rule.md` | แก้ stale `bin/cli.mjs`→`src/bin/cli.mjs` + guard wording ("ต้อง error"→**defensive no-op**) · เพิ่ม: mirror layout, pack-verify testable, denylist dogfood+tripwire, files granular nested dotfolder, setup scripts cross-platform, review-payload policy |
| `docs/techstack/installer/standard.md` | แก้ stale path (bin/tests/scripts→`src/`) · harness `cliPath` (relative `../bin/cli.mjs`) · verify-pack pattern (`checkFiles`+main-guard `argv[1]`) · setup-dogfood/sandbox + check-test-count pattern |
| `docs/rule.md` | แก้ stale path §2/§4/§5 · §2 +npm scripts cross-platform · §4 pack-verify testable+granular · §5 +pass-count gate +ห้าม path-arg `node --test` · **+§6 Bootstrap/self-hosting** (2-layer + .gitignore root-anchored + setup:dogfood/sandbox) |
| `docs/troubleshooting.md` | +#6 cwd-leak guard · +#7 npx-Windows (manual ล้ม/script ผ่าน shell:true) · +#8 fallback version-skew cli-resolve · +#9 ทำ BUILD/VERIFY บน repo self-host (worktree/classifier) |
| `docs/infra.md` | finalize (ตัด caveat "seed/รอ SHIP") — runbook transition + กฎ cross-platform npm scripts ครบ |
| `CHANGELOG.md` | roll [Unreleased] → **[0.7.0] - 2026-06-07** (bootstrap, setup scripts, CONTRIBUTING, pass-count gate, restructure, bin path, files granular) |
| `package.json` | bump version `0.6.0` → **0.7.0** |
| `docs/techstack/installer/{structure,test,about}.md`, `docs/codemap/*`, `docs/project.md` | already current (T5 + VERIFY TC-8 ยืนยัน) — re-verify freshness 2026-06-07, ไม่ต้องแก้เพิ่ม |

## 4. note "รอ SHIP" — พิจารณาครบ 11 ข้อ (promote ทั้งหมด)
| จาก task | ข้อเสนอ | ปลายทาง |
|---|---|---|
| move-source | mirror layout `src/`=target | installer/rule.md |
| packaging | pack-verify testable (`checkFiles`+unit) | installer/rule.md+standard.md, rule.md §4 |
| packaging | denylist dogfood root + tripwire | installer/rule.md+standard.md, rule.md §4 |
| test-reloc | acceptance=pass count | rule.md §5 |
| test-reloc | ห้าม path/glob arg ให้ `node --test` | rule.md §5 |
| dogfood | npm scripts cross-platform (node script) | rule.md §2, installer/rule.md |
| dogfood | .gitignore dogfood root-anchored | rule.md §6 |
| dogfood | setup:dogfood review payload diff | installer/rule.md |
| docs-sync | source/dogfood 2-layer (bootstrap) | rule.md §6, project.md |
| docs-sync | files allowlist granular nested dotfolder | installer/rule.md+standard.md, rule.md §4 |
| docs-sync | แก้ path/wording rule/standard กลางหลังย้าย | installer/rule.md+standard.md, rule.md §2/§4/§5 |

→ **ไม่มีข้อที่ตัดทิ้ง** — promote ครบทุกข้อ

## 5. นอก workflow (action ของ user — outward/irreversible)
- **merge `build/src-bootstrap` → `main`** (จัดการนอก workflow)
- **publish `@warnyin/agents@0.7.0`** ขึ้น npm + tag `v0.7.0` (version bump + CHANGELOG เตรียมไว้แล้วบน build branch) — เป็น action outward ที่ user ทำเอง
- ก่อน publish: CI เขียวจริงบน PR (Linux node 20/22/24 matrix) ยืนยัน verify:pack + test

## 6. Gate SHIP
- [x] topic ย้ายไป `achieved/2026-06-07-src-bootstrap/` (ไม่เหลือใน `docs/stages/`)
- [x] features/ — พิจารณาแล้ว (ข้ามตาม decision; capability บันทึกใน project/infra/rule §6)
- [x] note "รอ SHIP" ครบ 11 ข้อ — promote ทั้งหมด ไม่มีตัดทิ้ง
- [x] `docs/troubleshooting.md` merge entry topic (#6-#9)
- [x] `docs/techstack/`, `docs/rule.md`, `docs/infra.md`, `docs/project.md` อัปเดต
- [x] `docs/codemap/` ตรงโค้ดจริง (freshness 2026-06-07)
- [x] `ship.md` เขียนครบ
