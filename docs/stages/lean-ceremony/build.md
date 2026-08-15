# Build + Verify — lean-ceremony

> Output ของ BUILD + VERIFY stage · playbook: `.warnyin/workflow/stages/build.md`
> รายงานผลการ implement + verify ต่อ topic — artifact เดียว 4 section

| | |
|---|---|
| **Slug** | `lean-ceremony` |
| **Build branch** | `build/lean-ceremony` |
| **Wave** | wave 1 = 4 task ขนาน (worktree) · wave 2 = 1 task (shared-tree) |
| **วันที่** | 2026-08-14 → 15 |

## 1. ผล build ต่อ task

| task | สถานะ | ไฟล์ที่แก้ | หมายเหตุ |
|---|---|---|---|
| `design-stage-lean` | ✅ passed | `stages/design.md` · `commands/warnyin/design.md` | 7 จุดแก้ (A1-A7): handoff confirm-once · C5 needle single-source + pointer 3 จุด · signal check ที่ step 6/10 · ตัดคำถามก่อนวาด wireframe · ลบ memory hook — T1-T15 ผ่าน |
| `build-verify-seam` | ✅ passed | `stages/{build,verify}.md` · `template/[topic]/build.md` · ลบ `template/[topic]/{test,verify}.md` · `commands/warnyin/{build,verify}.md` | ยุบ artifact 3→1 (4 section ตาม C1) · W1 ผู้ตรวจอิสระ · W2 confirm handoff · unify 4 duplicate block เหลือ pointer |
| `validator-cap-gate` | ✅ passed | `scripts/validate-topic.mjs` · `tests/validate-topic.test.mjs` | C7 cap gate (pure fn `checkCaps` + const `CAPS`) · section-based VERIFY inference · **+26 เคส** (213 → 239) |
| `memory-hook-lean` | ✅ passed | `workflow/memory.md` · `stages/discovery.md` · `workflow/fastlane.md` | hook 6→3 จุด (ตาราง §5 เหลือ 3 แถว) · C6 คำต่อคำใน `fastlane.md §1` · `ship.md` ไม่ต้องแตะ |
| `release-hygiene` | ✅ passed | `CHANGELOG.md` · `package.json` · `check-test-count.mjs` · `tests/memory.test.mjs` · `workflow/README.md` · `docs/infra.md` | version `0.30.0` · runbook `✖ [C7]` · M2 expected 6→3 · MIN_PASS 200→230 · cross-slice sweep |

**Integration**
- wave 1 integrate ด้วย `git diff > patch` + `git apply` (ไม่ใช้ `git checkout <branch> -- <files>` ตาม KB#11) — 4 patch apply สะอาด ไม่มี conflict (ไม่มีไฟล์ซ้ำระหว่าง slice)
- wave 2 ทำบน shared-tree ของ build branch โดยตรง

**rule/standard ใหม่ที่เสนอ (รอ SHIP)**
> รวบรวมจาก `tasks/<task>/rule.md §2` — 19 ข้อจาก 5 task; ที่เด่น: stage-seam confirm convention · independent-verifier เป็น property ของ stage · เกณฑ์ยุบ artifact ข้าม stage · pointer ต้องระบุพิกัด · hook ที่จุดจบงาน · heading freeze ทนต่อการเปลี่ยนความหมาย
> **เพิ่มจาก VERIFY:** validator ที่ parse ค่าจากตาราง markdown ต้องอ่านเฉพาะ cell ค่า + ให้ค่าใน backtick มาก่อน และถือ ambiguous = อ่านไม่ได้ (กัน default state ของ template กลายเป็นค่าที่ถูกต้องโดยบังเอิญ) · heuristic ที่ตัดสิน "artifact เริ่มเติมหรือยัง" ต้องมีเคสที่ใช้ **template จริง** เป็น fixture

**ปัญหาที่เจอ**
> ดู `./troubleshooting.md`

## 2. Full build & test gate

| gate | ผล |
|---|---|
| `npm test` + pass-count | ✅ **248 tests / 248 pass / 0 fail** (MIN_PASS 240 — รวม +9 เคสจาก VERIFY fix loop) |
| `npm run lint:md` | ✅ 155 ไฟล์ 111 ลิงก์ |
| `npm run verify:pack` | ✅ 105 ไฟล์ |
| `validate-topic lean-ceremony` (dogfood 0.29.1) | ✅ โครงครบ |
| `validate-topic lean-ceremony` (v-next มี C7) | ✅ โครงครบ — cap ผ่าน (proposal 53/60 · design narrative 68/120) |
| negative-grep memory hook | ✅ พบเฉพาะ `stages/build.md` · `stages/ship.md` · `fastlane.md` |
| template artifact | ✅ มี `build.md` · ไม่มี `test.md`/`verify.md` |

**M2 expected failure ระหว่าง wave 1 (ตามออกแบบ)**
เคส `M2` assert เซตไฟล์ที่มี hook เป๊ะ 6 ไฟล์ — wave 1 ลบ hook คนละไฟล์จึงมองไม่เห็นกัน ผลหลัง integrate wave 1: actual = 3 ไฟล์ตรง contract C7 พอดี ⇒ ใช้เป็นหลักฐาน negative-grep แล้ว `release-hygiene` จึงแก้ expected 6→3 (ไม่ใช่แก้เพราะเทสแดง) · `git diff` ยืนยันว่าแตะเฉพาะ `M2_EXPECTED` + คอมเมนต์/ชื่อเคส

**การแก้ของ main loop หลัง wave 2 (integration review)**
- `CHANGELOG.md §[0.30.0]` — **เขียนใหม่ทั้ง section**: เนื้อหาเดิมที่ agent เขียนคลาดจากงานจริงหลายจุด (ระบุว่า auto-route ไปที่ VERIFY ทั้งที่จริงคือ fastlane · อ้าง signal `gate=optional` บน C7 ที่ไม่มีอยู่ · เขียนว่า "ไม่ต้องเดิน VERIFY loop เพิ่มเติม" ซึ่งขัดกับ W1 · หลายประโยคอ่านไม่เป็นภาษา) — ทุก gate เขียวหมดแต่จับไม่ได้ ตรงกับ `docs/rule.md §5` (เอกสาร narrative ต้อง verify accuracy เทียบ source)
- `docs/infra.md` runbook — แก้ถ้อยคำที่เพี้ยน 3 บล็อก (ตาราง cap · วิธีแก้ข้อ 3 · ข้อระวัง) โครงเดิมถูกต้องแล้ว
- `src/tests/memory.test.mjs` — ชื่อเคส `M2b` ยังเขียน "ต่างจาก 5 ไฟล์ที่เหลือ" → แก้เป็น 2

## 3. แผนเทส (VERIFY)

> เขียนโดย VERIFY phase — อ้างอิง guideline `.warnyin/workflow/stages/verify.md`
> ตอน SHIP แผนนี้จะ merge เข้า `docs/techstack/installer/test.md`

| | |
|---|---|
| **Component** | `installer` (payload markdown + `node:test` suite) |
| **จุดประสงค์ที่ต้อง verify** | ceremony ลดลงจริงตาม 5 ข้อใน `proposal.md §4` **โดยไม่มี gate เดิมข้อใดถูกลด** และเอกสารที่ผู้ใช้อ่านตรงกับพฤติกรรมจริง |

### ขอบเขตการเทส (ตามจุดประสงค์ topic)
topic นี้เป็น **payload markdown + zero-dep script** ไม่มี runtime UI ⇒ เทสคือ (ก) unit/executable ของ validator (ข) structural check ของ playbook ด้วย grep/negative-grep พร้อมพิกัด (ค) **accuracy ของ narrative เทียบ source** (`docs/rule.md §5`) — ความเสี่ยงเฉพาะของ topic ประเภท "ลด ceremony" คือเผลอลด correctness และเอกสารเล่าเกินจริง

### ชนิดการเทส
- [x] Functional — acceptance ของ 5 task (`tasks/*/spec.md`) เดินทีละข้อโดยผู้ตรวจอิสระ
- [ ] E2E smoke — N/A (ไม่มี FE)
- [x] Integration — validator ผ่าน spawn จริง + `setup:sandbox` ติดตั้ง v-next แล้วรัน validator ในโปรเจกต์ปลายทาง
- [ ] UX/UI verify — N/A
- [x] Adversarial review — ล่า false-green / narrative ที่ไม่ตรง source / เทส vacuous
- [x] Regression — feature spec baseline 6 ตัวที่ Spec delta แตะ + gate เดิม 8 ตัว

### Local env ที่ต้องรัน (จาก `docs/infra.md`)
| Service | คำสั่งรัน | port / หมายเหตุ |
|---|---|---|
| — | ไม่มี service | zero-dep · รันบน node ≥20 ในเครื่อง |

### Test cases
| # | สถานการณ์ (อิงจุดประสงค์) | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|---|
| 1 | cap บังคับได้จริงต่อ tier | fixture ใน temp: standard/design เกิน–พอดี–ต่ำกว่า · fast/receipt · large | เกิน → error C7 + exit 1 · พอดี/ต่ำกว่า/large → exit 0 |
| 2 | tier อ่านไม่ได้ต้อง fail-safe **ไม่เงียบ** | proposal ที่ยังเป็นแถว template / vocab เก่า / ambiguous | warn C7 "ไม่ระบุ tier" + exit 0 (ห้ามเป็น error และห้ามเงียบ) |
| 3 | tier ของ proposal จริงไม่ regress | probe `parseTier` เทียบเวอร์ชันก่อน/หลัง บน proposal จริงทุกใบ | ผลตรงกันทุกใบ ยกเว้น template ที่ตั้งใจให้พลิกเป็น null |
| 4 | stage inference สะท้อนความจริง | feed `template/[topic]/build.md` **ของจริง** ทั้งเติมแค่ H1 และเติมเนื้อใน §4 | H1 อย่างเดียว → BUILD · มีเนื้อ §4 → VERIFY |
| 5 | memory hook เหลือ 3 จุด | negative-grep ข้อความ hook ใน `stages/` + `fastlane.md` | พบเฉพาะ `build.md` / `ship.md` / `fastlane.md` |
| 6 | artifact ยุบ 3→1 ครบเส้น | grep ผู้บริโภคปลายทาง (SHIP / next / roles / README / walkthrough) | ไม่มีจุดใดอ้าง `test.md`/`verify.md` เป็น artifact ของ topic โดยไม่ระบุ backward-compat |
| 7 | เนื้อกฎไม่หายตอน unify block | ไล่ 4 needle (step 0 · investigate-before-edit · config-protection · loop-tuning) แล้วตาม pointer ไปพิกัดจริง | canonical เหลือไฟล์เดียว และอีกฝั่งมี pointer ที่ resolve ไปเนื้อจริง |
| 8 | gate เดิมไม่ถูกลด | ตรวจ full-gate blocking · hard-floor 5 หมวด · evidence-before-promote · ship gate 12 ข้อ · approve gate wireframe · cap 3 รอบ fastlane | ครบทุกข้อ ไม่มีการผ่อน |
| 9 | narrative ตรง source | ทุก claim ใน CHANGELOG/runbook/README เทียบไฟล์จริง + รันคำสั่งที่เขียนใน runbook | ไม่มี claim ที่อ้างของที่ไม่มีจริง · คำสั่งรันแล้วได้ผลตามที่บอก |
| 10 | เทสใหม่ non-vacuous | รัน suite ปัจจุบันทับโค้ดก่อนแก้ + mutation test | เคสใหม่ต้องแดงกับโค้ดเก่า |

### วิธีรันเทส (reproducible)
```bash
npm test 2>&1 | node src/scripts/check-test-count.mjs   # unit + executable + pass-count gate
npm run lint:md                                          # dead-link
npm run verify:pack                                      # payload ที่ผู้ใช้จะได้
node src/.warnyin/workflow/scripts/validate-topic.mjs lean-ceremony   # v-next (มี C7)
node .warnyin/workflow/scripts/validate-topic.mjs lean-ceremony       # dogfood (release เสถียร)
npm run setup:sandbox                                    # ติดตั้ง v-next ลง temp แล้วรัน validator ที่นั่น
```

## 4. ผล verify + การแก้

| | |
|---|---|
| **วันที่ verify** | 2026-08-15 |
| **ผลรวม** | ผ่าน |
| **จำนวนรอบการแก้ไข (fix iterations)** | 1 รอบ |
| **จำนวนจุดที่แก้** | 21 จุด (validator 3 · pointer ปลายทาง 14 · narrative 4) |

### ผลการเทส
| # | เคส | ผล | หลักฐาน |
|---|---|---|---|
| 1 | cap บังคับต่อ tier | ✅ | fixture ใน temp → error C7 ระบุไฟล์/จำนวนบรรทัด/cap/tier + exit 1 · พอดี/large → exit 0 |
| 2 | fail-safe ไม่เงียบ | ✅ **(เคยพัง — แก้แล้ว)** | เดิมแถว template คืน `fast` ⇒ ไม่ cap เลยและไม่มี warn; ตอนนี้ → warn C7 + exit 0 |
| 3 | proposal จริงไม่ regress | ✅ | probe เทียบ parser เก่า/ใหม่บน proposal จริง 38 ใบ — ต่างเฉพาะ template ที่ตั้งใจ |
| 4 | stage inference | ✅ **(เคยพัง — แก้แล้ว)** | template จริง + H1 → BUILD (เดิม VERIFY) · เติมเนื้อ §4 → VERIFY |
| 5 | memory hook 3 จุด | ✅ | negative-grep + เทส `M2` (exact-set) |
| 6 | artifact ยุบครบเส้น | ✅ **(เคยพลาด — แก้แล้ว)** | 14 จุดปลายทางแก้แล้ว รวมจุดที่เคยสั่งให้ SHIP หยุดเมื่อไม่มี `verify.md` |
| 7 | เนื้อกฎไม่หาย | ✅ | ผู้ตรวจ 2 คนยืนยันตรงกัน + pointer ทุกตัวชี้พิกัดถูก |
| 8 | gate เดิมไม่ถูกลด | ✅ | ยืนยันครบ 8 gate (รวม ship gate 12 ข้อ · approve gate wireframe · cap 3 รอบ) |
| 9 | narrative ตรง source | ✅ **(เคยพลาด — แก้แล้ว)** | CHANGELOG/runbook เขียนใหม่ · คำสั่งใน runbook รันได้จริงและนับตรงกับ validator ทุกไฟล์ |
| 10 | เทสใหม่ non-vacuous | ✅ | รัน suite ทับโค้ดก่อนแก้ → แดง 6 เคส + mutation ยืนยันอีก 5 |

**Gate ทั้งชุด (รันจริง):** `npm test` 248/248 pass (MIN_PASS 240) · `lint:md` 155 ไฟล์ 111 ลิงก์ · `verify:pack` 105 ไฟล์ · `validate-topic` เขียวทั้ง dogfood และ v-next · sandbox install v-next แล้ว validator ในโปรเจกต์ปลายทางทำงานถูก

### รายการแก้ไข (สรุปการแก้ระหว่าง verify)
| # | finding | ความรุนแรง | การแก้ |
|---|---|---|---|
| F1 | `parseTier` อ่านแถว template ได้ `fast` ⇒ C7 ปิดตัวเองเงียบ (ไม่ error ไม่ warn) | blocker | อ่านเฉพาะ cell ค่า + ให้ค่าใน backtick มาก่อน · ambiguous → null |
| F2 | stage inference นับแค่ heading §4 ซึ่ง template มีเสมอ ⇒ ทุก topic กระโดดเป็น VERIFY | blocker | นับ "เนื้อจริง" แบบ template-aware + เคส D8/D9 ใช้ template จริงเป็น fixture |
| F3 | SHIP / next / roles / README / walkthrough ยังอ้าง `verify.md`/`test.md` เป็น artifact ของ topic | blocker | แก้ 14 จุด → `build.md §3/§4` + ระบุ backward-compat ของ topic เก่า |
| F4 | เทส `C7 C1`/`A8` เรียก `checkCaps` ตรง ⇒ ไม่เคยพิสูจน์ `parseTier` | blocker | เปลี่ยนไปวิ่งผ่าน `checkTopic` + เพิ่ม 9 เคส |
| F5 | CHANGELOG อ้าง evidence ที่วัดคนละกติกากับ gate (12 ไฟล์ / 611 บรรทัด ซึ่งเป็น topic `large` ที่ไม่มี cap) | ควรแก้ | วัดใหม่ด้วยกติกาจริง: 8 ไฟล์ · standard 4 · สูงสุด 180 |
| F6 | runbook ยกตัวอย่าง error string ที่ไม่มีในโค้ด + คำสั่ง grep/sed ที่ให้ผลผิด | ควรแก้ | sync กับ output จริง + `awk` ที่นับตรงกับ validator ทุกไฟล์ |
| F7 | contract C2/C4 ใน `design.md` บรรยายพฤติกรรมเดิมที่ถูกแก้ทิ้ง | ควรแก้ | เขียน contract ใหม่พร้อมเหตุผลของการเปลี่ยน |
| F8 | `proposal.md §4` เขียน "6→2 จุด" · `README.md` เขียน "hook ทุก stage" · comment MIN_PASS ระบุ N เก่า | ควรแก้ | แก้ให้ตรงความจริงทั้งหมด (MIN_PASS 230→240) |

### ปัญหายาก/ซ้ำ → troubleshooting
> ดู `./troubleshooting.md` — เคสที่ generalize ได้ถูกยกเป็น learned-rule ใน `tasks/*/rule.md §2` แล้ว (ดู §1)

### หมายเหตุถึง user (ถ้าถามระหว่างทาง)
- ยืนยันให้เดิน VERIFY ต่อในเซสชันเดียวหลัง BUILD — dogfood flow ใหม่ที่ topic นี้สร้าง ใช้งานได้จริง
- ตัดสินเองระหว่างทาง 2 เรื่อง: C7 นับ cap เฉพาะ narrative (ไม่รวม §9) · ไม่ยุบ VERIFY เป็น phase ของ BUILD เพื่อรักษา property ผู้ตรวจอิสระ

### known limits ที่ยอมรับไว้ (heuristic ระดับ report ไม่ใช่ error)
- **false-VERIFY:** HTML comment หลายบรรทัดใน §4 · เส้นคั่นแบบ `- - -`
- **false-BUILD:** cell ที่มี `/` และสั้น (เช่น `ผ่าน (12/12)`) หรือตัวเลขล้วน ถูกมองเป็น placeholder — ในทางปฏิบัติ §4 ที่ verify เสร็จจริงมีบรรทัดอื่นพลิกอยู่แล้ว
- **cap ตัดหางที่ §9:** ถ้าเพิ่ม `## 10.` ต่อจาก §9 จะไม่ถูกนับด้วย (ปัจจุบัน §9 เป็น section สุดท้ายของ template)
- **tier `fast` ไม่ cap `proposal`/`design`** — ตามเจตนาของ skip-list แต่ topic ที่ escalate กลางคันจะหลุด cap

### ✅ Gate → SHIP (ดู `.warnyin/workflow/stages/verify.md` §6)
- [x] เทสตามจุดประสงค์ครบ (functional — 10 เคส)
- [x] regression ตาม baseline ผ่าน (feature spec 6 ตัวที่ Spec delta แตะ + gate เดิม 8 ตัว)
- [x] FE: UX/UI verify — N/A (ไม่มี FE)
- [x] API contract — N/A (ไม่มี `openapi.yaml`)
- [x] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่าน (แก้ root cause ไม่ลด bar — ไม่มีการผ่อน gate/threshold ใด)
- [x] build.md §3 + §4 เขียนครบ
- [x] ปัญหายากบันทึก troubleshooting.md แล้ว
