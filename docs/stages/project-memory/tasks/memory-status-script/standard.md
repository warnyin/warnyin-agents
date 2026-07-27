# Standard — memory-status-script

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> อิงจาก `docs/techstack/installer/standard.md` + `docs/rule.md §2` (zero-dep lint-gate convention)

## 1. Standard กลางที่ยึด (จาก techstack)
- **zero-dep + ESM** — built-in `node:*` เท่านั้น (`node:fs`, `node:path`, `node:url`); `import.meta.url` ห้าม `__dirname`/`require` (`docs/rule.md §2`)
- **pure fn + injectable IO + main-guard** — pattern เดียวกับ `src/.warnyin/workflow/scripts/validate-topic.mjs` (`export function checkTopic(files)` — fs อยู่ใน `main()` เท่านั้น) และ `src/scripts/verify-pack.mjs` (`export function checkFiles(files)`)
- **main-guard = argv[1] comparison** (`src/scripts/verify-pack.mjs` บรรทัดท้ายไฟล์) — **ไม่ realpath** (กฎ realpath ใน `docs/techstack/installer/rule.md` ผูกกับ `bin`/npx symlink เท่านั้น; script นี้รันผ่าน `node` ตรง)
- **`export function` ได้** — ข้อห้าม top-level `export` ผูกกับ script ที่รันผ่าน **Workflow tool** (`build-wave.mjs`) เท่านั้น; `memory-status.mjs` รันผ่าน `node` ตรงเหมือน `validate-topic.mjs` (`design.md §4 C10` หมายเหตุ)
- **ภาษาไทย** ทั้งคอมเมนต์และข้อความผู้ใช้ (สไตล์ `src/bin/cli.mjs`)
- **cross-platform** — `path.join` เสมอ, `fileURLToPath(new URL(...))` ห้าม `.pathname` (Windows คืน `/D:/...`), spawn ในเทสส่ง array args **ห้าม `shell:true`**
- **anti-false-green** (`docs/rule.md §5`) — `pass === tests` → **ห้าม `t.skip()`**; เคสที่รันไม่ได้ให้ `console.log(...)` + `return` ภายในเคส
- **negative-grep เป็นเคส node ไม่ใช่ shell `grep`** (`docs/rule.md §5`) — อ่านไฟล์ด้วย `readFileSync` แล้ว `.includes()`

## 2. Pattern การเขียนโค้ดของ task นี้
- **โครงไฟล์ `memory-status.mjs` (ลำดับตาม `validate-topic.mjs`):** header comment อธิบายหน้าที่+ข้อจำกัด security → const (`STATUS_SET`, `LIMIT_CONTEXT_LINES=60`, `LIMIT_OPEN=30`, `STALE_DAYS=90`) → helper บริสุทธิ์เล็ก ๆ (`normalize`, `parseRow`, `findLastUpdated`) → `export function summarize()` → `render()` → `main()` → main-guard
- **ห้าม magic number ในตรรกะ** — เกณฑ์ 60/30/90 ประกาศเป็น const มีคอมเมนต์อ้าง `design.md §3.3`
- **normalize ครั้งเดียวที่ทางเข้า:** `const lines = String(text).replace(/\r\n/g, '\n').split('\n')` — ห้ามมี `\r` handling กระจายหลายจุด
- **closed-set ใช้ `Set` + เทียบเท่ากันทั้งเซลล์** — ห้าม regex `\w`/`\b` (พังกับข้อความไทย) และห้าม `includes` แบบ substring
- **error handling:** `main()` ห่อ `readFileSync` ด้วย try/catch → คืน `null` (ENOENT/EACCES เหมือนกัน) — **ห้าม log absolute path ของผู้ใช้** (precedent `validate-topic.mjs` ENOENT guard) และห้ามเปลี่ยน exit code
- **immutability:** `summarize()` สร้าง object ใหม่คืนเสมอ ไม่แก้ argument; `counts` สะสมใน local แล้ว spread ออก
- **ขนาด:** ทั้งไฟล์ควร ≤ 150 บรรทัด, ทุกฟังก์ชัน < 50 บรรทัด (`docs/rule.md` / coding-style)
- **เทส:** ประกาศ fixture เป็น **const template literal ที่ต้นไฟล์เทส** แล้ว reuse (fixture เดียวใช้ทั้ง LF/CRLF ด้วย `.replace(/\n/g,'\r\n')` — กัน fixture 2 ชุด drift); assertion message ต้องบอก **ค่าที่ได้จริง** เช่น `` `counts=${JSON.stringify(counts)}` ``
- **fixture generator สำหรับเคสเกินเกณฑ์:** สร้างแถวด้วย loop (`Array.from({length:31}, (_,i)=>row(i+1))`) ไม่ hardcode 31 แถว

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `src/.warnyin/workflow/scripts/validate-topic.mjs` — คัด pattern (`isFilled` heuristic, ENOENT guard, main-guard, การแยก pure/IO) **มาเป็นแบบ ห้าม import ข้ามไฟล์** (คนละ concern; payload script ต้อง self-contained)
- `src/tests/verify-pack.test.mjs` — precedent unit ที่ import pure fn ตรง + ป้อน input ปลอม (โครงเดียวกับเทสนี้)
- **ไม่ต้องใช้ harness `makeTempProject`/`runCli` ของ `installer.test.mjs`** (ผูกกับ `cli.mjs`) — เทสนี้เขียน temp dir เองด้วย `mkdtempSync(path.join(os.tmpdir(), 'wy-mem-'))` + `t.after(() => rmSync(dir,{recursive:true,force:true}))`

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- **pattern ใหม่:** "report-script = exit 0 เสมอ + pure `summarize()` + negative-property test อ่านซอร์สตัวเอง" — ถ้าใช้ได้ผลให้ note ใน `rule.md §2` เสนอขึ้น `docs/techstack/installer/standard.md` ตอน SHIP (ตอนนี้ standard กลางมีแต่ pattern ของ gate ที่ exit 1)
