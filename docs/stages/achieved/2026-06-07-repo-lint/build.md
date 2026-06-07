# Build Report — repo-lint (zero-dep dead-link gate)

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`

## 1. ภาพรวม
- **Slug:** `repo-lint` · **Build branch:** `build/repo-lint` (จาก `main`)
- **Isolation:** shared-tree (`isolate:false`) — 1 task code zero-dep
- **DAG / wave:** 1 wave · 1 task `add-md-lint`
- **ผล:** ✅ ผ่าน — full gate เขียว (1 รอบแก้: strip-code alternation)

## 2. ผลต่อ task
| Task | สถานะ | สรุป |
|---|---|---|
| `add-md-lint` | ✅ passed | `lint-md.mjs` (zero-dep dead-link gate, pure `checkLinks`+main-guard mirror verify-pack) + unit 7 เคส + `npm run lint:md` + CI job `lint-md` |

## 3. ไฟล์ที่แก้ (4)
- **NEW** `src/scripts/lint-md.mjs` — `checkLinks(docs, exists)` export (strip code → match `[](...)` → skip http/mailto/anchor → resolve+exists) + `main()` (walk src/+docs/, exclude `node_modules/`+`src/.warnyin/template/`+`docs/stages/achieved/`) + main-guard
- **NEW** `src/tests/lint-md.test.mjs` — unit 7 เคส (good/dead/inline-skip/fenced-skip/http+mailto+anchor/path#anchor/injectable-exists)
- `package.json` — +`"lint:md": "node src/scripts/lint-md.mjs"`
- `.github/workflows/ci.yml` — +job `lint-md` (mirror pack-verify: pinned SHA, node 22)

## 4. รอบแก้ (1) — strip-code alternation
- **เจอ (main-loop full-gate):** `lint:md` แดง 2 false-positive ใน active stage docs (`design.md`/`spec.md` ของ repo-lint เอง = meta-doc มี `` ``` `` ฝังใน inline-code)
- **Root cause:** strip code 2-pass แยก (`.replace(fenced).replace(inline)`) — fenced-pass กินทะลุ inline span ที่มี `` ``` `` ฝัง
- **แก้:** alternation pass เดียว `/```[\s\S]*?```|`[^`\n]*`/g` (match อันเปิดก่อนตามลำดับ) → คง exclude แค่ `docs/stages/achieved/` (ตาม D — ไม่ over-exclude active stage); ดู `troubleshooting.md` #1
- **บทเรียน:** sub-agent self-verify เคลมเขียว (`| tail` บัง exit) → main-loop ตรวจ exit จริงจับได้

## 5. Full gate (main loop) — ผ่านครบ
- ✅ **lint:md บน repo: 0 dead-link** exit 0 (75 ไฟล์ 44 ลิงก์)
- ✅ unit lint-md 7/7
- ✅ `npm test`: tests **26** / pass 26 / fail 0 (19→26; pass==tests ≥ MIN_PASS 9)
- ✅ `npm run verify:pack`: เขียว 75 ไฟล์ (lint-md.mjs + test ไม่ ship — denylist `src/scripts/`+`src/tests/` ครอบ)
- ✅ **zero-dep คง:** devDeps `{}` (git diff package.json = แค่ scripts)

## 6. Integration notes
- ไม่แตะ payload/playbook กลาง; ไม่แตะ verify-pack.mjs (denylist ครอบ lint-md แล้ว)
- rule ใหม่ (zero-dep lint-gate convention + strip-code-before-link) note `tasks/add-md-lint/rule.md` §2 → รอ SHIP
- CI: lint-md job อิสระ (ไม่ `needs` — เร็ว, ขนานได้); pinned SHA + ไม่มี secrets/npm-ci (zero-dep)

## 7. Gate (build.md §7) — ผ่านครบ
- [x] task implement + integrate
- [x] task passed — ไม่มี failed
- [x] ไม่มี conflict (shared-tree)
- [x] Full build/gate ผ่าน (lint+test+pack)
- [x] test suite เขียว (26/26)
- [x] build.md สรุปครบ + troubleshooting #1 บันทึก
- [x] ไม่แตะ rule/standard กลาง (rule ใหม่ note รอ SHIP)

→ พร้อมเข้า **VERIFY**
