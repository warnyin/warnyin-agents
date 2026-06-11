# Spec — setup-dogfood-reliable

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`logic` (dev-tooling script + unit test) · ไม่ใช่ REST API

## 4. Data-flow
- release tarball (`@warnyin/agents@latest`) → `cli.mjs --update` → `copyTree(overwrite:true)` → root CORE (`.warnyin/`, `.claude/commands/warnyin/`)
- `verifyInstalled(repoRoot)` → อ่าน root fs → boolean (CORE markers ครบ?)

## 5. User-flow
- dev รัน `npm run setup:dogfood` หลัง release ใหม่ → root dogfood = release version จริง (ไม่ใช่ค้างเก่า)

## 6. Persona
- contributor/maintainer ที่ dogfood `src/` v-next ด้วย release เสถียร (`CONTRIBUTING.md`)

## 7. Test-flow
> unit เฉพาะ `verifyInstalled` (pure fs-read, ไม่ spawn install — pattern `verify-pack.mjs`)

- [ ] **false — ไม่มี CORE:** temp dir เปล่า → `verifyInstalled(tmp) === false`
- [ ] **true — CORE ครบ:** สร้าง `tmp/.warnyin/workflow/stages/discovery.md` + `tmp/.claude/commands/warnyin/` → `=== true`
- [ ] **false — บางส่วน:** มีแค่ `.warnyin/...` ไม่มี `.claude/commands/warnyin` → `=== false` (ต้องครบทั้งคู่)
- [ ] **import ไม่ trigger install:** import `verifyInstalled` จาก test → ไม่มี side-effect (main-guard กัน `main()`)
- [ ] **regression:** `npm test` ทั้ง suite เขียว (`check-test-count`: `pass===tests`, `pass≥9` — เพิ่มเคสใหม่ ไม่ลด count)
- [ ] **CHANGELOG:** `lint:md` ผ่าน (entry Fixed ไม่มี dead-link)

**defer (executable integration):** จริง `npm run setup:dogfood` → root CORE = release version — spawn npx/npm จริง (network) → ทำตอน release ถัดไป (manual proof), ไม่ block BUILD
