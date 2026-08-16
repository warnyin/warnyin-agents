# Spec — validator-cap-gate

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — slice #3 ของ `design.md` ("cap บังคับได้จริง")

## 1. ชนิดของ task
`logic` (pure function ใน CLI script) + `test` — ไม่มี UI/API/DB

## 2. สิ่งที่ต้องได้ (behavior spec)

### 2.1 C7 cap (contract C3)
| tier | artifact | cap | เกิน → |
|---|---|---|---|
| fast | `receipt.md` | ≤ 40 บรรทัด | `level: 'error'` (✖ block, exit 1) |
| standard | `proposal.md` | ≤ 60 บรรทัด | `level: 'error'` |
| standard | `design.md` | ≤ 120 บรรทัด | `level: 'error'` |
| large | — | ไม่มี cap | ไม่มี issue C7 เลย |

- **ตัวเลข canonical = `.warnyin/workflow/triage.md §2D`** — อ่านอย่างเดียว **ห้ามแก้ไฟล์นั้น**; ในโค้ดเก็บเป็น const เดียว (เช่น `CAPS`) พร้อมคอมเมนต์อ้าง `triage.md §2D`
- **นิยามการนับบรรทัด (deterministic = ใช้เป็น ✖ ได้):** เท่ากับ `wc -l` — `content.split('\n')` แล้ว **ตัด element สุดท้ายทิ้งถ้าเป็น `''`** (ไฟล์ที่จบด้วย `\n` ไม่นับบรรทัดว่างท้าย)
- **`design.md` นับเฉพาะบรรทัด "ก่อน" heading `## 9. Spec delta`** (ไม่รวมบรรทัด heading เอง) — anchor H2 เป๊ะ (`/^##\s+9\.\s+Spec delta/` แบบเดียวกับ C3 `^##\s+3\.\s+Learned rules`); ไม่เจอ heading → นับทั้งไฟล์
- เช็คเฉพาะไฟล์ที่ **มีอยู่จริงใน `files`** (ไม่มีไฟล์ = ไม่ใช่ issue ของ C7 — เรื่องไฟล์ขาดเป็นของ C1/C2)
- ไม่พึ่ง `isFilled()` (การนับบรรทัดเป็น structural ล้วน — `docs/rule.md §1`)

### 2.2 tier source (contract C4 — fail-safe)
ลำดับการหา tier:
1. `proposal.md` — หา row ที่ขึ้นต้นด้วย `| **ขนาด** |` แล้ว match `fast|standard|large` **ตัวแรกที่เจอ** ในบรรทัดนั้น (ค่าจริงอยู่ใน backtick เช่น `` | **ขนาด** | `standard` | ``)
2. ไม่มี `proposal.md` แต่ topic เป็น **fast-mode** (receipt-only ตาม `detectMode`) → tier = `fast` (structural inference ของ mode เอง ไม่ใช่การเดา)
3. นอกนั้น → tier = `null` → issue `{ code: 'C7', level: 'warn' }` ข้อความประมาณ `ไม่ระบุ tier — ข้ามเช็ค cap` **และไม่บังคับ cap ใด ๆ** (ไม่ทำให้ exit 1)
   - ⚠ ตัวนี้ออกเฉพาะเมื่อ topic **มี artifact ที่ cap ครอบอย่างน้อย 1 ไฟล์** (`receipt.md`/`proposal.md`/`design.md`) — topic ว่าง/ยังไม่เริ่ม ต้องไม่มี noise

### 2.3 fast-mode ต้องไม่พัง (behavior เดิม)
`checkTopic` ปัจจุบัน early-return เมื่อ `detectMode === 'fast'` (`issues: []`, `stage: 'fast-track'`).
ใหม่: early-return เดิมยังอยู่ (C1-C4 + C6 ยังถูกข้าม) แต่ **คืน issues ของ `checkCaps(files, 'fast')`** แทน array ว่าง

### 2.4 stage inference (contract C2)
- `VERIFY` = `build.md` filled **และ** มี heading `## 4. ผล verify` (anchor H2 เป๊ะ)
- `BUILD` = `build.md` filled แต่ไม่มี section นั้น
- const `STAGES` แถว VERIFY เดิม `required: ['verify.md','test.md']` → **ห้ามคง required เดิม** (ไม่งั้น topic ใหม่ที่ไม่มี 2 ไฟล์นี้จะโดน ⚠ C1 ปลอม) และ **ห้ามลบการรองรับไฟล์เก่า** (topic เก่าที่มี `verify.md`/`test.md` filled ต้องยัง infer เป็น VERIFY และต้องไม่เกิด issue ใหม่)

## 4. Data-flow
```
main() → readTopicFiles(dir) → Map<relPath, content>   [IO ชั้นเดียว เดิม]
            │
            └→ checkTopic(files)                        [pure]
                 ├→ detectMode(files)
                 ├→ resolveTier(files, mode) ─── parse row `| **ขนาด** |` ของ proposal.md
                 └→ checkCaps(files, tier) ──→ issues[] {code:'C7', level, msg}
                                                 ↓
                                       render `${SYM[level]} [C7] ${msg}` → exit 1 เมื่อมี error
```
pure fn **ห้าม import `node:fs`** — รับ `Map` เข้ามาอย่างเดียว (testable ด้วย Map ปลอม)

## 7. Test-flow
> ไฟล์: `src/tests/validate-topic.test.mjs` (เพิ่มเคสท้ายไฟล์ — ห้ามสร้างไฟล์เทสใหม่) · `node:test` + `node:assert/strict` · reuse helper เดิม (`byCode`/`hasError`/`hasWarn`/`makeTempProject`/`runScript`/`writeTopic`)
> helper แนะนำเพิ่ม: `linesOf(n, tier?)` สร้างเนื้อ n บรรทัด และ `proposalWithTier(tier)` สร้าง `proposal.md` สั้นที่มี row `| **ขนาด** |`

### A. cap ต่อ tier (unit — feed Map ปลอม)
- [ ] A1 `C7: standard · design.md 121 บรรทัด → ✖ [C7]` — input: `proposal.md` (tier standard, สั้น) + `design.md` 121 บรรทัด ไม่มี §9 → expect `hasError(issues,'C7')` และ msg มี `design.md`, `121`, `120`
- [ ] A2 `C7: standard · design.md 120 พอดี → ไม่มี C7` — expect `byCode(issues,'C7').length === 0` (boundary ≤ ผ่าน)
- [ ] A3 `C7: standard · design.md 119 → ไม่มี C7`
- [ ] A4 `C7: standard · proposal.md 61 บรรทัด → ✖ [C7] ระบุ proposal.md` (row ขนาด standard อยู่ในไฟล์เดียวกัน)
- [ ] A5 `C7: standard · proposal.md 60 พอดี → ไม่มี C7`
- [ ] A6 `C7: fast · receipt.md 41 บรรทัด → ✖ [C7]` — input: receipt filled 41 บรรทัด (ไม่มี proposal/design/task = fast-mode) → expect ✖ C7 **และ** `stage === 'fast-track'`
- [ ] A7 `C7: fast · receipt.md 40 พอดี → ไม่มี issue + stage fast-track` (พฤติกรรมเดิมไม่พัง)
- [ ] A8 `C7: large · ทุกไฟล์ยาวเกินทุก cap → ไม่มี issue C7` — proposal tier `large` + design 300 บรรทัด
- [ ] A9 `นับบรรทัดแบบ wc -l: ไฟล์ 40 บรรทัดจบด้วย \n → นับ 40 ไม่ใช่ 41` (receipt tier fast, ต้องไม่ ✖) — กัน off-by-one

### B. exclude §9 ของ design.md
- [ ] B1 `C7: design 300 บรรทัด แต่ก่อน '## 9. Spec delta' มี 100 → ไม่มี C7`
- [ ] B2 `C7: ไม่มี heading §9 → นับทั้งไฟล์ → เกิน → ✖ C7`
- [ ] B3 `C7: '#### 9. Spec delta' (H4) ไม่ถูกนับเป็น cut point → ยังนับทั้งไฟล์ → ✖ C7` (anchor H2 เป๊ะ — mirror เคส C5 H4 เดิม)

### C. tier parse (fail-safe)
- [ ] C1 `tier: row ขนาด = \`standard\` → บังคับ cap จริง` (ครอบด้วย A1 แล้ว — assert เพิ่มว่า **ไม่มี** ⚠ C7 warn)
- [ ] C2 `tier: ไม่มี row ขนาด ใน proposal → ⚠ [C7] + ไม่มี ✖` — input: proposal ไม่มี row + design 200 บรรทัด → expect `hasWarn(issues,'C7')` และ `!hasError(issues,'C7')`
- [ ] C3 `tier: ค่าเพี้ยน (\`กลาง\`) → ⚠ [C7] ไม่บังคับ cap` — ⚠ fixture ห้ามมี substring `fast`/`standard`/`large` ที่อื่นในไฟล์ (`docs/rule.md §5` negative fixture ของ keyword-heuristic)
- [ ] C4 `tier: topic ว่าง (ไม่มี receipt/proposal/design) → ไม่มี C7 เลย` (ไม่ noise)

### D. stage inference (contract C2)
- [ ] D1 `stage: build.md filled + '## 4. ผล verify' → stage = 'VERIFY'`
- [ ] D2 `stage: build.md filled ไม่มี section นั้น → stage = 'BUILD'`
- [ ] D3 `backward-compat: topic เก่า verify.md/test.md filled (ไม่มี section ใน build.md) → stage = 'VERIFY' และไม่เกิด ✖ ใหม่`
- [ ] D4 `backward-compat: build.md filled แต่ไม่มี verify.md/test.md → ไม่มี ⚠ C1 ที่อ้างถึง verify.md/test.md` — assert `!issues.some(i => i.msg.includes('verify.md'))`
- [ ] D5 `stage: ship.md filled + ไม่มี verify.md → C1 ต้องไม่บ่นถึง VERIFY` (กัน required เดิมหลงเหลือ)

### E. pure/structured + กัน gate ลวง
- [ ] E1 `checkCaps เป็น pure fn — เรียกตรงด้วย Map + tier ได้ ไม่แตะ fs` (export แล้ว import ในเทส; assert คืน array ของ `{code,level,msg}`)
- [ ] E2 `negative: cap ที่ต่ำกว่าเนื้อจริงต้องจับได้` — เรียก `checkCaps` ตรงด้วย tier `standard` + design 121 บรรทัด แล้ว assert `issues.length === 1 && issues[0].level === 'error'`; และคู่กับ 120 บรรทัด assert `issues.length === 0` (พิสูจน์ว่า gate แยกสองฝั่งได้จริง ไม่ใช่คืนค่าเดียวตลอด)

### F. executable (spawn จริงใน temp — mirror harness เดิม)
- [ ] F1 `exe: standard topic ที่ design เกิน cap → exit 1 + stdout มี '✖ [C7]'`
- [ ] F2 `exe: tier อ่านไม่ได้ + design ยาวเกิน → exit 0 + stdout มี '⚠ [C7]'` (fail-safe ไม่ block)
- [ ] F3 `exe: fast topic receipt เกิน 40 → exit 1 + '✖ [C7]' + ยังแสดง fast-track`
- [ ] F4 `exe: output ไม่มี absolute path / ไม่ echo เนื้อ artifact` — assert `!r.stdout.includes(tmp)` และไม่มี marker เนื้อไฟล์ (`assert.ok(!r.stdout.includes('บรรทัดตัวอย่างในไฟล์'))`)
