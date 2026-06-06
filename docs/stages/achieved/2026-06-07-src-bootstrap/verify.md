# VERIFY report — src-bootstrap

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md` · role: QA
> branch: `build/src-bootstrap` · วันที่: 2026-06-07 · env: Windows 11, node 24, npm, tar (zero service)

## 1. สรุปผล
เทสตาม **จุดประสงค์ topic** (bootstrap/self-hosting: source→`src/` + dogfood ที่ root จาก release) ครบ **8 test case + 4 negative/edge** — **ผ่านทั้งหมด**
**จำนวนการแก้ไข (code fix) = 0** — ทุกอย่างเขียวรอบแรก (BUILD gate ครอบคลุมดีแล้ว); VERIFY แก้เฉพาะ **เอกสาร** (อัปเดต acceptance `[~]`→`[x]` + troubleshooting addendum)

**ไฮไลต์:** carry-over หลักจาก BUILD (live `npm run setup:dogfood` e2e ที่เคย mark `[~]` deferred) **รันจริงผ่าน** ใน VERIFY context

## 2. ผลรายเคส

| TC | เคส | ผล | หลักฐาน |
|---|---|---|---|
| TC-1 | test suite เขียว (pass-count, BL-2) | ✅ | `npm test` tests=18 / pass=18 / fail=0 · `check-test-count.mjs` gate exit 0 |
| TC-2 | pack payload ถูก (R1/R2) | ✅ | `npm pack --json`→`checkFiles`: 68 ไฟล์, dotfolder 2 ก้อนติด, 0 leak, errors=NONE |
| TC-3 | fresh install จาก src/ (T1) | ✅ | install→temp payload ครบ · **byte-equal กับ `src/`** (workflow tree+AGENTS.md) · scaffold ไม่ leak topic · ไม่ leak ลง repo |
| **TC-4** | **★ live `setup:dogfood` e2e (T4)** | ✅ | exit 0 · **npx primary path สำเร็จ** · restore root `CLAUDE.md` ที่หายจริง · `/warnyin:*` 10 commands · **`git status docs/` สะอาด (BL-3)** · dogfood ติด `.gitignore` ครบ |
| TC-5 | idempotent (รัน 2 รอบ) | ✅ | รอบ 2 "ข้าม 71" + pointer "อยู่แล้ว — ข้าม" · pointer count คง 1 · docs/ สะอาด |
| TC-6 | `setup:sandbox` v-next | ✅ | temp dir (`os.tmpdir()`) 71 ไฟล์ · byte-equal กับ `src/` · print path · root dogfood ไม่โดนแตะ |
| TC-7 | committed artifacts | ✅ | `CONTRIBUTING.md` tracked (70 บรรทัด) · `.gitignore` root-anchored ครบ 5 บรรทัด (`/` นำหน้า) · `git check-ignore` ถูก (root ignore, src/ ไม่ ignore) |
| TC-8 | docs ตรงโค้ด (T5) | ✅ | structure/test/about/codemap ไม่มี stale path · 2-layer ครบทั้ง 2 codemap · src/ path ทุกตัวมีจริง · `docs/rule.md` ไม่ถูกแตะ · 5 task rule.md มี note รอ SHIP |

### Negative / edge (QA lens)
| # | เคส | ผล |
|---|---|---|
| N-1 | re-entrant (dogfood มีอยู่แล้ว → install ทับ) | ✅ docs/ ยังสะอาด, idempotent (TC-4/TC-5) |
| N-2 | network/registry fail → exit 1 (ไม่ false-green) | ✅ logic verified (`installViaNpx() \|\| installViaPack()` → `exit(1)`) — ไม่ทดสอบ live (กัน disrupt) |
| N-3 | install cwd=repo root → ต้องไม่ leak | ✅ TC-3 รันใน temp เสมอ, repo root ไม่มี stray |
| N-4 | `npm test` ไม่ตี `build-wave.mjs` (DSL) เป็น test | ✅ bare discover เฉพาะ `*.test.*` (18 เคส, ไม่มี DSL) |
| N-fb | **fallback path (npm pack→extract→node) จริง** | ✅ verify แยก: npm pack 0.6.0 → extract → **resolve cli=`bin/cli.mjs`** (จาก package.json bin) → `node cli` install exit 0, payload OK |

## 3. Findings (เชิงบวก — ไม่มี blocker)
1. **npx primary path ใช้ได้จริงบน Windows** (ผ่าน `shell:true` ใน `setup-dogfood.mjs`) — ต่างจากสมมติฐาน BUILD (troubleshooting #3 ว่า npx ล้มบน Windows). สาเหตุ: BUILD ทดสอบ npx แบบ **manual** ใน Git Bash/PowerShell ตรง ๆ (shim ยังไม่ cache); ส่วน script ใช้ `shell:true` (win32) → resolve ได้ (เห็น DEP0190 ตามดีไซน์). **implementation robust กว่าที่ BUILD รายงาน** — มีทั้ง primary (npx) ที่ใช้งานได้ + fallback (pack) เป็น safety net ที่ verify แล้วทำงาน
2. **pre-VERIFY: root `CLAUDE.md` หายไป** (BUILD restore ทิ้งไว้หลัง git mv → CONTRIBUTING.md) → `setup:dogfood` **restore กลับมาถูกต้อง** (สร้างใหม่ 1) — พิสูจน์กลไก dogfood จัดการสถานะ "ไฟล์หาย" จริงได้
3. **BL-3 ยืนยัน live:** `git status --porcelain docs/` ว่างหลัง setup:dogfood (seed/scaffold skip เพราะ project.md/infra.md/achieved/.gitkeep มีอยู่) — docs collision ปิดสนิท

## 4. troubleshooting ที่อัปเดต
- **#3 addendum:** npx primary path ใช้ได้ผ่าน `shell:true` ใน script (≠ manual invocation); fallback ยังจำเป็นเป็น safety net
- **#5 RESOLVED:** live setup:dogfood ที่เคยถูก classifier บล็อกใน build context → รันผ่านใน VERIFY (user authorize)

## 5. รอ SHIP (ไม่แตะใน VERIFY)
- bump 0.7.0 + CHANGELOG (DF-1)
- promote component rule/standard (stale path `bin/cli.mjs`→`src/bin/cli.mjs`, harness `cliPath`, verify-pack pattern) จาก `tasks/*/rule.md §2` — **ยังเป็น stale โดยตั้งใจใน `rule.md`/`standard.md` รอ SHIP แก้**
- promote `test.md` (topic) → `docs/techstack/installer/test.md` · `troubleshooting.md` → `docs/troubleshooting.md`
- docs/infra.md เนื้อเต็ม (runbook transition)
- **outward (นอก VERIFY):** CI เขียวจริงบน PR (Linux node 20/22/24 matrix) ยืนยันตอนเปิด PR/merge

## 6. Gate VERIFY → SHIP
- [x] เทสตามจุดประสงค์ topic ครบ (functional ตาม test-flow ทุก spec)
- [x] Frontend UX/UI — ไม่มี (topic เป็น dev tooling/infra ไม่มี UI)
- [x] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่านหมด (0 fix — เขียวรอบแรก)
- [x] `test.md` (แผน) + `verify.md` (สรุป + จำนวนการแก้ = 0) เขียนครบ
- [x] ปัญหายาก/ซ้ำบันทึก `troubleshooting.md` (#3 addendum, #5 resolved)

→ **พร้อมเข้า SHIP** ด้วย `/warnyin:ship src-bootstrap`
