# Standard — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> อิงจาก `docs/techstack/installer/standard.md` + `docs/techstack/installer/test.md` + precedent `src/tests/fastlane.test.mjs`

## 1. Standard กลางที่ยึด (จาก techstack)
- **zero-dep / ESM / LF** — built-in `node:*` เท่านั้น; `import`/`export`; `.mjs` ใต้ `src/` ต้อง LF ล้วน (`src/tests/eol.test.mjs`)
- **cross-platform** — `path.join`, `fileURLToPath(new URL('../../', import.meta.url))` สำหรับหา repo root · **ห้าม `.pathname`** (Windows คืน `/D:/...`) · ห้าม hardcode `/` หรือ `/tmp`
- **anti-false-green** (`test.md` §pass-count gate) — `pass === tests`, `fail === 0`, `skipped 0` → **ห้าม `t.skip()`**; เคสที่รันไม่ได้ให้ `console.log(...) ; return`
- **pure fn + main-guard** (`verify-pack.mjs` / `lint-md.mjs`) — logic อยู่ใน pure function ที่ unit import ตรงได้; `main()` ถูกกันด้วย `if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])` (ห้ามใช้ `import.meta.main` — undefined บน node 20)
- **CHANGELOG = Keep a Changelog** — Added / Changed (+ Migration สำหรับ note ที่ผู้ใช้ต้องทำ/ไม่ต้องทำ ตามแนวของ section `## Migration guide` ที่มีอยู่แล้วในไฟล์)

## 2. Pattern การเขียนโค้ดของ task นี้ (`src/tests/memory.test.mjs`)

**โครงหัวไฟล์ + walker (copy pattern จาก `fastlane.test.mjs` — ห้ามเขียน harness ใหม่ซ้ำแนวคิด)**
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const srcDir = path.join(root, 'src')
const workflowDir = path.join(srcDir, '.warnyin', 'workflow')
const templateDocsDir = path.join(srcDir, '.warnyin', 'template', 'docs')

// walker เขียนเอง (ไม่พึ่ง readdirSync({recursive:true})) — เก็บเฉพาะ .md
function walkMd(dir, base = root, acc = []) { /* ... เหมือน fastlane.test.mjs ... */ }

// path เทียบ root แบบ POSIX — ใช้ทั้งใน assertion message และการเทียบ set
const rel = (p) => path.relative(root, p).split(path.sep).join('/')
```

- **canonical/needle เป็น `const` เดียวที่หัวไฟล์** แล้ววนเช็คทุก consumer (กัน string เพี้ยนในตัวเทสเอง) — pattern เดียวกับ `const C4` ใน `fastlane.test.mjs`
- **นับไฟล์ด้วย set equality ไม่ใช่ length** — `assert.deepEqual(hits.map(rel).sort(), EXPECTED.sort())` ให้ error บอกทั้ง "ขาดไฟล์ไหน/เกินไฟล์ไหน" ในครั้งเดียว
- **compound needle ระดับบรรทัด** (M2) — `content.split('\n').some((l) => l.includes(A) && l.includes(B))` ไม่ใช่ `content.includes(A) && content.includes(B)` (กัน 2 คำอยู่คนละที่ในไฟล์แล้วนับผ่าน)
- **นับ markdown-link นอก code span** (M6b) — ใช้ regex ชุดเดียวกับ `lint-md.mjs` โดย **declare ซ้ำในไฟล์เทส** (ไม่ import — `lint-md.mjs` ไม่ export ค่าคงที่เหล่านี้):
  ```js
  const CODE_RE = /```[\s\S]*?```|`[^`\n]*`/g
  const LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g
  const links = [...content.replace(CODE_RE, '').matchAll(LINK_RE)].map((m) => m[0])
  assert.equal(links.length, 0, `${rel(f)} ต้องไม่มี markdown-link — เจอ: ${links.join(', ')}`)
  ```
- **heading ตามลำดับ** (M1) — เก็บ index ของแต่ละ heading ด้วย `lines.findIndex` แล้ว assert `idx >= 0` ทุกตัว **และ** `idx` เรียงเพิ่ม (`for` เทียบคู่ติดกัน) — หาไม่เจอต้อง fail ไม่ใช่ผ่านเงียบ
- **ordering proxy** (M8c) — `assert.ok(idxA >= 0 && idxB >= 0, ...)` ก่อนเสมอ แล้วค่อย `assert.ok(idxA < idxB, ...)` (กัน `-1 < n` = false-green)
- **นับ gate item** (M8) — `(content.match(/^- \[ \] /gm) ?? []).length` แล้ว `assert.equal(n, 12, ...)` (regex multiline anchored — ไม่นับ checkbox ที่ indent อยู่ใน sub-list)
- **assertion message** ต้องมี **ไฟล์ (rel path) + สิ่งที่คาด + สิ่งที่เจอ** เสมอ

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `src/tests/fastlane.test.mjs` — precedent ของ walker/negative-grep/const-canonical/ordering (B1-B3, C1, D1-D3, E1) → **ลอก pattern ไม่ลอกไฟล์**
- `src/tests/installer.test.mjs` — `makeTempProject` / `runCli` / `ok` / `listFiles` (**ไม่ต้องใช้ใน task นี้** — install-proof ของ topic นี้เป็นของ T3 + `setup:sandbox`; ห้ามเพิ่มเคส spawn ใน `installer.test.mjs` เพราะเป็นไฟล์ของ T3)
- `checkFiles()` ใน `src/scripts/verify-pack.mjs` — pure fn ที่มีอยู่แล้ว **ขยายในที่เดิม** ห้ามสร้าง validator ขนาน
- `src/scripts/check-test-count.mjs` — gate สำเร็จรูป แก้เฉพาะค่า `MIN_PASS` + คอมเมนต์

## 4. เพิ่มเติมเฉพาะ task

### 4.1 `verify-pack.mjs` — เพิ่ม R1 assertion ก้อนที่ 4 (ขยายในที่เดิม)
```js
// R1: template ที่ผู้ใช้ต้องได้ต้องติด tarball ด้วย (กัน gate ลวง — เดิม assert แค่ payload 3 ก้อน
//     → template หาย = ผู้ใช้ได้ scaffold เปล่า แต่ gate ยังเขียว)
const hasTemplateDocs = files.some((p) => p.startsWith('src/.warnyin/template/docs/'))
if (!hasTemplateDocs) errors.push('src/.warnyin/template/docs/ ไม่ติดใน package (R1)')
```
- วางต่อจากบล็อก R1 เดิม (`hasWarnyin`/`hasClaude`/`hasSkills`) — **ไม่แตะ `main()`**, ไม่แตะ `ALLOWED_PREFIX`/`DENY_*`

### 4.2 `verify-pack.test.mjs` — fixture ≠ assertion
- เติม `'src/.warnyin/template/docs/memory.md'` เข้า `const GOOD` (GOOD = **fixture** "payload ที่ถูกต้อง" → payload ที่ถูกต้องตอนนี้ต้องมี template docs) — **ห้ามแก้ข้อความ/รูปแบบของ `assert.*` เดิมแม้แต่บรรทัดเดียว**; เคส `deepEqual(checkFiles(GOOD), [])` และ `T2-adapter-templates` ยังเขียวเพราะ fixture ถูกต้องขึ้น ไม่ใช่เพราะ gate หลวมลง
- เคสใหม่ (negative — พิสูจน์ว่าไม่ใช่ gate ลวง):
  ```js
  test('R1 assertion: ขาด src/.warnyin/template/docs/ → คืน error (กัน gate ลวงของ template)', () => {
    const noTemplateDocs = GOOD.filter((p) => !p.startsWith('src/.warnyin/template/docs/'))
    const errors = checkFiles(noTemplateDocs)
    assert.ok(
      errors.some((e) => e.includes('src/.warnyin/template/docs/')),
      `hasTemplateDocs assertion ต้องทำงาน: ${errors.join(' | ')}`,
    )
  })
  ```

### 4.3 `check-test-count.mjs` — สูตร bump `MIN_PASS`
- **baseline ก่อน integrate topic นี้ (วัดจริง):** `tests 151 / pass 151 / fail 0` — ค่าปัจจุบัน `MIN_PASS = 46` จึงหลวมจนแทบไม่ทำงาน
- **สูตร:** หลัง integrate ครบ + เคสของ task นี้เขียว ให้อ่านยอดจริง `N` จาก summary แล้วตั้ง
  `MIN_PASS = ปัดลงหลักสิบของ (N − 5)` (เช่น `N = 172` → `167` → **`160`**) — ต่ำกว่ายอดจริงเล็กน้อยพอให้ลบเคสซ้ำซ้อนได้โดยไม่ churn แต่ยังจับ "ไฟล์เทสหายทั้งไฟล์/ไม่ถูก discover" ได้
- **อัปเดตคอมเมนต์บรรทัดเหนือ `const MIN_PASS`** ให้ระบุที่มา: ยอดจริง `N` · topic `project-memory` · วันที่ (ห้ามทิ้งคอมเมนต์เก่าที่อ้าง `installer 33 + verify-pack 13`)
- **พิสูจน์ว่า gate ทำงาน (falsifiable):** ตั้ง `MIN_PASS = N + 1` ชั่วคราว → `npm test 2>&1 | node src/scripts/check-test-count.mjs` ต้อง **exit 1 พร้อมข้อความ `pass count ต่ำกว่าขั้นต่ำ`** → คืนค่าตามสูตร

### 4.4 install-proof ด้วย `setup:sandbox` (G4)
- `npm run setup:sandbox` พิมพ์ path ของ temp dir → อ่าน `<sandbox>/docs/memory.md` และ `<sandbox>/docs/stages/context.md` ด้วย node/เครื่องมืออ่านไฟล์ (**ห้าม `cat`/shell POSIX** — ใช้ path ที่ script พิมพ์ตรง ๆ)
- ยืนยัน: ทั้งคู่ **ขนาด > 0 byte** · `context.md` มี 4 heading · `memory.md` มีหัวตาราง 6 คอลัมน์ + คำเตือน C12
- **ไม่รัน `cli.mjs` ที่ `cwd = repo root`** (dogfood leak — `troubleshooting.md` #6) และ **ไม่รัน `setup:dogfood`** ใน task นี้ (เป็นงานหลัง release)
- ผลลัพธ์ทั้งหมด (คำสั่งที่รัน + สรุปผล) แนบใน `build.md` ของ topic — ไม่ต้องแปลงเป็นเคสเทส (spawn installer เป็นของ T3)
