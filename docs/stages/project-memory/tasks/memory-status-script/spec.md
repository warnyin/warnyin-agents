# Spec — memory-status-script

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ทุกข้อลอกจาก `design.md §4 C10` + `§3.1` + `§3.3` ห้ามตีความเอง**

## 1. ชนิดของ task
`logic` (script + unit) — ไม่มี API/UI; zero-dep `node:*` ล้วน, read-only, report ไม่ใช่ gate

## 2. Interface (C10 — ห้ามเปลี่ยน)

| | |
|---|---|
| เรียก | `node .warnyin/workflow/scripts/memory-status.mjs [rootDir]` (default `process.cwd()`) |
| อ่าน | `<rootDir>/docs/stages/context.md`, `<rootDir>/docs/memory.md` |
| export | `export function summarize({ contextText, memoryText })` → `{ contextLines, lastUpdated, counts, flags }` (**pure** — ไม่แตะ fs/เวลา/argv) |
| main-guard | argv[1] comparison แบบ `src/scripts/verify-pack.mjs` — `if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()` (**ไม่ต้อง realpath** — ไม่ผูกกับ `bin`/npx symlink) |
| exit code | **0 เสมอ** (report ไม่ใช่ gate — ห้ามเรียก `process.exit(1)` ทุกกรณี รวมกรณีอ่านไฟล์ไม่ได้) |

### 2.1 รูปร่างของค่าที่คืน (deterministic — เทสล็อกทุก field)

| field | ชนิด | นิยาม |
|---|---|---|
| `contextLines` | `number` | จำนวนบรรทัดของ `context.md` หลัง normalize CRLF และตัด newline ปิดท้าย 1 ตัว; ไม่มีไฟล์/ว่าง/ไม่มี heading → `0` |
| `lastUpdated` | `string \| null` | ข้อความหลัง `## อัปเดตล่าสุด`; ไม่มี section/ไม่มีบรรทัดเนื้อ → `null` |
| `counts` | `object` | `{ open, promoted, dropped, unknown, total }` — ทุกช่องเป็น `number` เริ่มที่ `0`; `total` = ผลรวมทั้ง 4 ช่อง (= จำนวน entry ที่ตรวจพบ) |
| `flags` | `Array<{code,value}>` | ว่าง `[]` เมื่อไม่เกินเกณฑ์ · ลำดับคงที่ตาม §5 |

- `summarize()` รับ **field ที่ 3 แบบ optional: `now`** (`Date`, default `new Date()`) — ใช้เฉพาะคำนวณ flag "entry ค้างนาน" เพื่อให้ unit deterministic; ไม่เปลี่ยน signature ของ C10 (อยู่ใน object เดียวกัน)
- input `contextText`/`memoryText` เป็น `string | null` (`null` = ไม่มีไฟล์) — `undefined` ต้องปฏิบัติเหมือน `null`

## 3. Data-flow
`<rootDir>/docs/stages/context.md` + `<rootDir>/docs/memory.md`
→ `readFileSync(..., 'utf8')` ใน `main()` (try/catch → `null`)
→ `summarize({contextText, memoryText})` (pure)
→ `console.log` เฉพาะ **ตัวเลข/วันที่/flag** → exit 0

## 4. Parse contract (C10 — คำต่อคำ)

```
- normalize `\r\n` → `\n` ก่อน parse (บทเรียน CRLF: commit 0a2e7c4)
- entry = บรรทัดที่ขึ้นต้น `|` และคอลัมน์แรก (trim) เป็น "ตัวเลขล้วน" เท่านั้น
  → หัวตาราง, separator (`|---|`), legend, prose, แถวตัวอย่างที่คอลัมน์แรกไม่ใช่ตัวเลข = ไม่นับ
- สถานะ = คอลัมน์สุดท้าย trim + strip backtick → ต้อง match ทั้งเซลล์กับ open|promoted|dropped
  ไม่ match → counts.unknown++ (พิมพ์ ⚠ ไม่ throw ไม่เปลี่ยน exit code)
- lastUpdated = ข้อความหลัง "## อัปเดตล่าสุด" บรรทัดถัดไปที่ไม่ว่าง; ไม่มี section → null
- ไฟล์ไม่มี หรือ ไฟล์ว่าง/ไม่มี heading → ปฏิบัติเหมือนไม่มี: contextLines=0, lastUpdated=null, counts ทุกช่อง=0, พิมพ์ "–"
- flags = เกณฑ์ §3.3 (contextLines>60, counts.open>30, entry open ที่วันที่เก่ากว่า 90 วัน)
```

### 4.1 การแตกเซลล์ (ทำให้ deterministic — รายละเอียดที่ implementation ต้องยึด)
- แตกด้วย `line.split('|')` แล้ว **ตัด element แรกทิ้ง** (บรรทัดขึ้นต้น `|` → element แรกเป็น `''`) และ **ตัด element สุดท้ายทิ้งเมื่อ trim แล้วว่าง** (รองรับทั้งบรรทัดที่ปิดด้วย `|` และไม่ปิด)
- **คอลัมน์แรก** = `cells[0].trim()` ต้อง match `/^\d+$/` (ASCII digit ล้วน) — **ห้ามใช้ `\w`/`\b`** (พังกับข้อความไทยและเลขไทย)
- **สถานะ** = `cells[cells.length - 1]` → strip ทุก backtick → trim → เทียบ **เท่ากันทั้งเซลล์** กับสมาชิกของ `Set(['open','promoted','dropped'])` (ห้าม `includes`/`test` แบบ substring — legend/prose จะ match ผิด)
- **วันที่** = `cells[cells.length - 2]` (คอลัมน์ก่อนสถานะ ตาม schema 6 คอลัมน์ `§3.1`) → strip backtick → trim → ต้อง match `/^\d{4}-\d{2}-\d{2}$/` จึงนำไปคำนวณ staleness; ไม่ match → **ข้ามเฉพาะการคำนวณ staleness** (ไม่นับ `unknown` — `unknown` สงวนไว้ให้สถานะเท่านั้น ไม่ throw)
- แถวที่มีคอลัมน์ < 2 หลังตัดขอบ → ไม่นับเป็น entry
- ไม่รองรับ escaped pipe (`\|`) ในเซลล์ — นอกขอบเขต (schema ห้าม prose ยาวอยู่แล้ว)

### 4.2 `lastUpdated`
- หา **บรรทัดแรก** ที่ trim แล้วขึ้นต้นด้วย `## อัปเดตล่าสุด`
- คืน **บรรทัดถัดไปที่ trim แล้วไม่ว่าง** (trim ก่อนคืน); ถ้าเจอ heading `##` ถัดไปก่อน หรือหมดไฟล์ → `null`
- ไม่มี section → `null` (ไม่ throw)

### 4.3 "ไฟล์ว่าง/ไม่มี heading = ถือว่ายังไม่มี" (C13)
- ใช้กับ **`context.md`**: `contextText` เป็น `null`/`undefined`/trim แล้วว่าง/**ไม่มีบรรทัดใดขึ้นต้นด้วย `#`** → `contextLines = 0`, `lastUpdated = null`
- ใช้กับ **`memory.md`**: `null`/`undefined`/trim แล้วว่าง → `counts` ทุกช่อง `0` (ไฟล์ที่มีเนื้อแต่ไม่มีแถวข้อมูล → ก็ได้ `0` อยู่แล้วตาม row-based parse)

## 5. `flags` (เกณฑ์ `design.md §3.3` — guidance ไม่ block)

| ลำดับ | `code` | เงื่อนไข | `value` |
|---|---|---|---|
| 1 | `context-lines` | `contextLines > 60` | `contextLines` |
| 2 | `open-over-limit` | `counts.open > 30` | `counts.open` |
| 3 | `stale-open` | จำนวน entry สถานะ `open` ที่วันที่ **เก่ากว่า 90 วัน** เทียบ `now` > 0 | จำนวน entry นั้น |

- เปรียบเทียบเป็น **strict** (`60`/`30` พอดี = ไม่ติด flag; อายุ 90 วันพอดี = ไม่ stale, 91 วัน = stale)
- อายุ = `Math.floor((now - Date.parse('<YYYY-MM-DD>T00:00:00Z')) / 86400000)` โดย `now` normalize เป็น UTC epoch เช่นกัน (deterministic ข้าม timezone — **ห้ามใช้ local-time constructor**)
- วันที่ parse ไม่ได้ / อยู่อนาคต → ไม่นับ stale

## 6. รูปแบบรายงาน (stdout — ตัวเลข/วันที่/flag เท่านั้น)

```
project memory
  context.md : <contextLines> บรรทัด · อัปเดตล่าสุด <lastUpdated | –>
  memory.md  : open <n> · promoted <n> · dropped <n> · unknown <n> (รวม <total>)
  ⚠ <ข้อความ flag ที่มีแต่ตัวเลข/เกณฑ์>
```

- ไม่มีไฟล์/ว่าง → พิมพ์ `–` แทนค่านั้น (en-dash U+2013)
- `counts.unknown > 0` → พิมพ์บรรทัด ⚠ บอก **จำนวน** entry ที่สถานะไม่อยู่ใน closed-set (**ห้ามพิมพ์เลขแถว/เนื้อเซลล์**)
- **ห้ามพิมพ์**: ข้อความบทเรียน, evidence pointer, ประเภท, path แบบ absolute ของ rootDir
- ข้อความทั้งหมดเป็นภาษาไทย (`docs/rule.md §2`)

## 7. Test-flow — `src/tests/memory-status.test.mjs`
> zero-dep (`node:test`, `node:assert/strict`, `node:fs`, `node:os`, `node:path`, `node:url`, `node:child_process` **เฉพาะในไฟล์เทส** สำหรับ spawn) · **ห้าม `t.skip()`** (`check-test-count.mjs` fail เมื่อ `pass !== tests`)
> fixture ใช้ **ค่าไทยจริงตาม schema 6 คอลัมน์** (ประเภท `gotcha`/`บทเรียน`/`ข้อสังเกต`, evidence เป็น inline-code backtick) — ไม่ใช่ ASCII ล้วน

**U. unit ของ `summarize()` (pure)**
- [ ] U1 — ไม่มีไฟล์ทั้งคู่ (`{contextText:null, memoryText:null}`) → `contextLines===0`, `lastUpdated===null`, `counts` ทุกช่อง `0`, `flags` `[]`
- [ ] U2 — ไฟล์ว่าง (`''` และ `'\n  \n'`) → ผลเท่ากับ U1 (deepEqual)
- [ ] U3 — **legend-only**: `memoryText` มีหัวตาราง + separator + บรรทัด legend ที่ระบุครบทั้ง `` `open` `` / `` `promoted` `` / `` `dropped` `` + prose — **ไม่มีแถวข้อมูล** → `counts` **ทุกช่องเป็น 0** (รวม `unknown`)
- [ ] U4 — entry คละสถานะ: `open` 2 แถว + `promoted` 1 แถว + `dropped` 1 แถว → `counts.open===2`, `counts.promoted===1`, `counts.dropped===1`, `counts.unknown===0`, `counts.total===4`
- [ ] U5 — สถานะนอก closed-set (เช่น `` `รอดู` ``, `open ?`, เซลล์ว่าง) → นับเข้า `counts.unknown` ครบทุกแถว ไม่ throw
- [ ] U6 — **CRLF**: fixture เดียวกับ U4 แต่ `\r\n` ทุกบรรทัด → ผล `deepEqual` กับ U4 (พิสูจน์ normalize)
- [ ] U7 — `context.md` **ไม่มี** `## อัปเดตล่าสุด` (มี heading อื่น) → `lastUpdated===null` แต่ `contextLines>0`
- [ ] U8 — `context.md` มี `## อัปเดตล่าสุด` แล้วเว้นบรรทัดว่าง 1 บรรทัดก่อนเนื้อ → คืนเนื้อบรรทัดนั้น (trim แล้ว) เช่น `2026-07-27 · SHIP`
- [ ] U9 — `context.md` ที่ไม่มีบรรทัดขึ้นต้น `#` เลย (ไฟล์ prose) → `contextLines===0`, `lastUpdated===null` (C13)
- [ ] U10 — **flags เกินเกณฑ์**: context 61 บรรทัด (มี heading) + `open` 31 แถว + 1 แถว `open` วันที่ห่าง 91 วันจาก `now` ที่ fix → `flags` มีครบ 3 code ตามลำดับ `context-lines`, `open-over-limit`, `stale-open`
- [ ] U11 — **boundary ไม่ติด flag**: context 60 บรรทัด + `open` 30 แถว + entry `open` อายุ 90 วันพอดี → `flags` เป็น `[]`
- [ ] U12 — แถวที่คอลัมน์แรกไม่ใช่ตัวเลข (`| # |`, `|---|---|`, `| ตัวอย่าง | ... | `` `open` `` |`) ปนอยู่กับแถวข้อมูลจริง 1 แถว → นับได้ `total===1`

**S. spawn จริง (black-box — `spawnSync(process.execPath, [scriptPath, dir])` array args ห้าม `shell:true`)**
- [ ] S1 — temp dir ที่มี `docs/stages/context.md` + `docs/memory.md` ครบ → `status===0` และ stdout มีตัวเลขของ `counts` ที่คาด
- [ ] S2 — temp dir **เปล่า** (ไม่มี 2 ไฟล์) → `status===0` และ stdout มี `–` (Scenario "ไม่มีไฟล์ memory ก็ไม่ error")
- [ ] S3 — `docs/memory.md` มีข้อความบทเรียนเฉพาะตัว (เช่น `ห้ามลืมล้าง cache ก่อน deploy`) + evidence backtick เฉพาะตัว → stdout **ไม่มี** ทั้งสองสตริง (Scenario "ไม่พิมพ์เนื้อ entry")

**N. negative property (อ่านซอร์สของ script ด้วย `readFileSync`)**
- [ ] N1 — เนื้อไฟล์ `src/.warnyin/workflow/scripts/memory-status.mjs` **ไม่มี** `node:child_process`, `node:http`, `node:https`, `node:net` และ **ไม่มี** API เขียนไฟล์ (`writeFileSync`, `appendFileSync`, `mkdirSync`, `rmSync`, `createWriteStream`) — assert ทีละ token พร้อม message ระบุ token ที่พบ
- [ ] LF ล้วน — **ครอบด้วย `src/tests/eol.test.mjs` (EOL1/EOL2) อยู่แล้ว ห้ามเขียนเคสซ้ำ** (แค่ต้องไม่ทำให้แดง)
- [ ] main-guard — พิสูจน์โดยปริยาย: ไฟล์เทส `import { summarize }` แล้วต้องไม่มี output/exit ของ `main()` หลุดออกมา (ถ้า guard พัง เคส S* จะเห็น stdout ปน)

## 8. Negative properties (บังคับ — C10)

```
- ห้าม import node:child_process, node:http(s), node:net (read-only + no egress)
- ห้ามเขียนไฟล์ใด ๆ
- ห้ามพิมพ์เนื้อ entry — พิมพ์เฉพาะตัวเลข/วันที่/flag (กันข้อมูลอ่อนไหวออกทาง log)
- ไฟล์ต้องเป็น LF ล้วน (src/tests/eol.test.mjs บังคับ .mjs ใต้ src/)
```

## 9. Persona
maintainer/agent ที่กำลังจะเริ่มงาน (`/warnyin:next`, `/warnyin:memory`) — อยากรู้ว่า memory บวมหรือยัง โดย **ไม่ต้องเปิดไฟล์อ่านเนื้อ** และไม่มีอะไร block งานตัวเอง
