# Standard — validator-cap-gate

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern โค้ดที่ task นี้ต้องยึด — **อิง** `docs/techstack/installer/standard.md` + `docs/techstack/installer/test.md`

## 1. Standard กลางที่ยึด (จาก techstack)
- **zero-dep lint-gate pattern** (`docs/rule.md §2`) — gate ของ repo = `node:*` script เขียนเอง แยก **pure function + injectable IO + main-guard** และต้อง testable (unit feed ปลอม) + executable verify (spawn จริง)
- **main-guard แบบ argv[1] comparison** — `if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()` (ห้าม `import.meta.main` — undefined บน node 20); import จาก unit ต้องไม่ trigger `main()`
- **ESM + zero-dependency** — `import`/`export`, ใช้เฉพาะ `node:fs`/`node:path`/`node:url`; ห้ามเพิ่ม devDeps
- **ข้อความผู้ใช้/คอมเมนต์ภาษาไทย** (สไตล์ `src/bin/cli.mjs`)
- **security ของ validator** — report **structural เท่านั้น** (ชื่อไฟล์ / section / code / ตัวเลขบรรทัด) — **ห้าม echo เนื้อ artifact** และ **ห้ามพ่น absolute path** (มี ENOENT/EACCES guard อยู่แล้วในชั้น IO)

## 2. Pattern การเขียนโค้ดของ task นี้ (`validate-topic.mjs`)

### 2.1 โครงไฟล์ที่มีอยู่ — ต้องเดินตามลำดับเดิม
```
const STAGES / STAGE_FILES / TASK_REQUIRED     ← canonical ระดับไฟล์ (คอมเมนต์อ้าง design §4)
isFilled() / topLevel() / collectRealTasks()   ← helper ร่วม (ห้าม duplicate เงื่อนไข)
checkTasks()  C2 ✖ · checkShipData() C3 ✖ · inferStageAndC1() C1 ⚠+stage · checkSpecDelta() C4 ⚠
detectMode()  fast|mixed|normal
export checkTopic(files) → { issues, stage }   ← ประกอบทุกเช็ค (pure)
export checkFeatureSpec(name, content)         ← C5
SYM / countLevels / readTopicFiles / listTopics / readFeatureSpecs / main()
```
- helper ใหม่วางเป็น **section คั่นด้วยคอมเมนต์ `// ── ชื่อ ─────`** แบบเดียวกับของเดิม พร้อมระบุ contract ที่มา (`contract C3/C4` ของ `design.md §4`)
- **ห้าม refactor ส่วนที่ไม่เกี่ยวเพื่อความสวย** (minimalism — เขียนน้อยที่สุดเท่าที่จำเป็น); `STAGE_FILES` ปัจจุบันไม่มีผู้ใช้ — ตรวจก่อนแตะ ถ้าไม่จำเป็นให้ปล่อยไว้

### 2.2 pure function + issue object (สัญญาเดียวกันทั้งไฟล์)
```js
// ทุกเช็คคืน array ของ issue object เดียวกัน — render ที่เดียวใน main()
{ code: 'C7', level: 'error' | 'warn', msg: 'ข้อความไทย structural' }
```
- **pure = รับ `Map<relPath, content>` (หรือ string) เท่านั้น** — ห้าม `readFileSync`/`process.*` ในฟังก์ชันเช็ค (IO อยู่ `readTopicFiles`/`main` ชั้นเดียว)
- ฟังก์ชันที่เพิ่ม: `checkCaps(files, tier)` (+ helper เล็ก เช่น `countLines(content)`, `parseTier(content)` / `resolveTier(files, mode)`) — **export เฉพาะเท่าที่ unit ต้องเรียกตรง** (`checkCaps` อย่างน้อยหนึ่งตัว เพื่อเทส pure ได้โดยไม่ต้องผ่าน `checkTopic`)
- ค่าคงที่ cap อยู่ **const เดียว** ใกล้ `STAGES`:
  ```js
  // canonical ตัวเลข: .warnyin/workflow/triage.md §2D (อ่านอย่างเดียว — ห้ามแก้ไฟล์นั้น)
  const CAPS = { fast: { 'receipt.md': 40 }, standard: { 'proposal.md': 60, 'design.md': 120 }, large: {} }
  ```

### 2.3 การ match heading — anchor เป๊ะแบบเดิม
- ใช้ regex บรรทัดต่อบรรทัด (`lines[i]`) ไม่ใช่ `/m` บนทั้งไฟล์ ถ้าต้องรู้ index — pattern เดียวกับ `checkShipData` (`/^##\s+3\.\s+Learned rules/`)
- `## 9. Spec delta` → `/^##\s+9\.\s+Spec delta/` · `## 4. ผล verify` → `/^##\s+4\.\s+ผล verify/` (H2 เป๊ะ — กัน false-match `####` ตาม defer #2 เดิม)

### 2.4 fail-safe direction (บังคับ)
- อ่าน tier ไม่ได้ → **⚠ + ข้ามเช็ค** (ไม่ block) — ทิศเดียวกับ mode inference (`docs/rule.md §1`)
- แต่ **การนับบรรทัดเอง = deterministic** → เกิน cap เป็น **✖ ได้** (ไม่ใช่ heuristic, ไม่พึ่ง `isFilled`)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `topLevel(files, name)` — ดึง content ระดับ topic
- `isFilled(content)` — ใช้ได้เฉพาะกับ stage inference (⚠/รายงาน) **ห้ามใช้ตัดสิน ✖ ของ C7**
- `detectMode(files)` / `collectRealTasks(files)` — ห้ามเขียนเงื่อนไข fast-mode ซ้ำ
- `SYM` + `countLevels` + loop render ใน `main()` — C7 ต้อง render ผ่านทางนี้อัตโนมัติ (ไม่เพิ่ม print แยก)

## 4. Test harness ของ repo (`src/tests/validate-topic.test.mjs`)
- **เพิ่มเคสในไฟล์เดิม** (มีทั้ง unit + executable อยู่แล้ว) — ห้ามสร้างไฟล์เทสใหม่, ห้ามเพิ่ม runner/dep
- unit: `import { checkTopic, checkFeatureSpec } from '../.warnyin/workflow/scripts/validate-topic.mjs'` + `new Map([...])` — เพิ่ม `checkCaps` เข้า import เดียวกัน
- helper เดิมที่ต้อง reuse: `FILLED_H1` / `TEMPLATE_H1` / `RECEIPT_FILLED` / `byCode` / `hasError` / `hasWarn`
- executable: `makeTempProject(t)` + `writeTopic(root, slug, fileMap)` + `runScript(cwd, args)` — spawn **array args ห้าม `shell:true`**, assert `code` พร้อม surface `stdout/stderr` ใน message
- fixture generator ควรเป็น helper สั้น ๆ (เช่น `linesOf(n)` = `Array.from({length:n}, (_,i) => 'บรรทัด '+(i+1)).join('\n') + '\n'`) — คุมจำนวนบรรทัดให้ **ตรงเป๊ะ** เพราะเทสเป็น boundary test
- ⚠ **negative fixture ห้ามมี trigger keyword** (`fast`/`standard`/`large`/`Spec delta`) หลุดเข้าไปใน filler (`docs/rule.md §5`)

## 5. เพิ่มเติมเฉพาะ task (ถ้ามี)
- pattern ใหม่ที่อาจควรเป็นมาตรฐานกลาง: **"cap/threshold ที่ประกาศใน playbook ต้องมี validator บังคับ + unit boundary test (≤ ผ่าน / +1 แดง)"** — ถ้าเห็นว่าใช้ซ้ำได้ ให้ note ใน `rule.md §2` (รอ SHIP) **ห้ามแก้ rule กลางตอนนี้**
