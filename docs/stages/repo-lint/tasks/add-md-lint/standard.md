# Standard — add-md-lint

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern: mirror `src/scripts/verify-pack.mjs` (gate zero-dep testable)

## 1. Standard กลางที่ยึด
- **zero-dependency** (`docs/rule.md` §2) — import เฉพาะ `node:fs`/`node:path`/`node:url`; devDeps ต้องว่าง
- **ESM** (`docs/rule.md` §2) — `import`/`export`, `import.meta.url` (ไม่ใช่ `__dirname`/`require`)
- **gate testable — pure function + export** (`docs/techstack/installer/rule.md`) — `checkLinks` pure (injectable `exists`) + main-guard กัน import trigger main (BL-4 แบบ `checkFiles`)
- **test = unit import ตรง** (`docs/techstack/installer/test.md`) — feed input ปลอม assert; **acceptance = pass count** (`pass==tests` ≥ MIN_PASS 9)
- **npm scripts cross-platform** (`docs/rule.md` §2) — node script, `path.join/resolve`, ไม่ hardcode `/`
- **ภาษาไทย** (`docs/rule.md` §2) — ข้อความ error/log ไทยตามสไตล์ verify-pack

## 2. Pattern การเขียนของ task นี้
- **โครงไฟล์ = mirror verify-pack.mjs:** `import {..} from 'node:*'` → const config (EXCLUDE prefixes) → `export function checkLinks(docs, exists){...}` → `function main(){...}` → main-guard `if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()`
- **main-guard เป๊ะแบบ verify-pack** (argv[1] comparison — ไม่ใช่ `import.meta.main` ที่ undefined บน node 20)
- **test:** `import {test} from 'node:test'` + `assert` + `import {checkLinks} from '../scripts/lint-md.mjs'`; รูปแบบ `test('...', () => {...})` เดียวกับ verify-pack.test.mjs
- **error message:** `<file>: ลิงก์เสีย -> <target>` (actionable, มี path)

## 3. Shared component / utility (อย่าเขียนซ้ำ)
- main-guard + pure-fn + export = pattern เดียวกับ `verify-pack.mjs` (copy โครง ไม่คิดใหม่)
- CI job = mirror `pack-verify` ใน `ci.yml` (pinned action SHA เดิม, node 22, `needs` ไม่จำเป็น)
- ไม่ต้องแก้ `verify-pack.mjs` (denylist `src/scripts/`+`src/tests/` ครอบ lint-md แล้ว)

## 4. เพิ่มเติมเฉพาะ task
- **strip code ก่อน match link** — กัน false-positive จาก `[](...)` ใน inline/fenced code (บทเรียน pre-scan: เอกสาร repo-lint เองมี `[text](path)` เป็นตัวอย่าง)
- **EXCLUDE prefix** ต้องเทียบ path แบบ relative-from-root + POSIX (`src/.warnyin/template/`, `docs/stages/achieved/`)
- ถ้า pattern "zero-dep .md gate" ควรเป็นมาตรฐานกลาง → note `rule.md` §2 (รอ SHIP)
