# Task — add-md-lint

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `add-md-lint` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | installer/dev-tooling (`src/scripts/` + `src/tests/` + CI) |
| **สถานะ** | `build เสร็จ (self-verify เขียว)` |

## 1. เป้าหมายของ task (vertical slice)
dead-link gate ครบสาย: `lint-md.mjs` (logic) → unit test (พิสูจน์จับ + ข้าม code-span) → `npm run lint:md` (รัน) → CI job (enforce) — zero-dep ทั้งหมด

## 2. Dependency
- ต้องทำหลัง: — (task เดียว coupled)
- ปลดล็อกให้: —

## 3. Sub-tasks (★ ลำดับ)
- [x] 1. NEW `src/scripts/lint-md.mjs` — `export checkLinks(docs, exists)` (strip code → match `[](...)` → skip http/anchor/mailto → resolve+exists) + `main()` (walk src/+docs/, exclude `node_modules/`+`src/.warnyin/template/`+`docs/stages/achieved/`) + main-guard (mirror verify-pack)
- [x] 2. NEW `src/tests/lint-md.test.mjs` — unit: good / dead / inline-code skip / fenced skip / http+anchor+mailto skip / `path#anchor` (7 เคส) ด้วย fake docs + fake `exists`
- [x] 3. `package.json` `scripts` +`"lint:md": "node src/scripts/lint-md.mjs"`
- [x] 4. `.github/workflows/ci.yml` +job `lint-md` (mirror `pack-verify`: pinned SHA เดิม, node 22, `run: npm run lint:md`)
- [x] 5. self-verify: `node src/scripts/lint-md.mjs` → 0 dead exit 0 · `npm test` เขียว (count ขึ้น) · `npm run verify:pack` เขียว (lint-md ไม่ ship) · `git diff package.json` devDeps ยังว่าง

## 4. ขอบเขตไฟล์ที่จะแตะ
- **สร้าง:** `src/scripts/lint-md.mjs`, `src/tests/lint-md.test.mjs`
- **แก้:** `package.json` (scripts), `.github/workflows/ci.yml`
- **ห้ามแตะ:** payload (`src/.warnyin/`, `src/.claude/`, `src/AGENTS.md`), `verify-pack.mjs` (denylist ครอบแล้ว), playbook กลาง, `docs/rule.md` central (รอ SHIP), ลิงก์เก่าใน archived (exclude)

## 5. Acceptance criteria
- [x] `lint-md.mjs` zero-dep (node:* ล้วน) + `checkLinks` pure export + main-guard
- [x] unit 7 เคส เขียว (จับ dead + ข้าม code-span/http/anchor — พิสูจน์ logic)
- [x] `node src/scripts/lint-md.mjs` บน repo → **0 dead-link** exit 0 (75 ไฟล์ 44 ลิงก์)
- [x] `npm test` เขียว (pass==tests=26 ≥9, count 19→26) + `verify:pack` เขียว (75 ไฟล์)
- [x] devDeps ยังว่าง (zero-dep คง — `git diff package.json` มีแค่ scripts)
- [x] CI job `lint-md` (pinned SHA เดิม, node 22, no secrets/npm-ci)
- [x] ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
