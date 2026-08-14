# Spec — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`infra` (release metadata + integration-level gate ของทั้ง topic) + `docs` (CHANGELOG + runbook `docs/infra.md`) — ไม่ใช่ API/UX

**ตำแหน่งใน DAG:** wave 2 (สุดท้าย) — เป็น **integration-level gate** ที่ต้องเห็นไฟล์ครบทั้ง 4 slice (`docs/rule.md §1` release-hygiene task เป็น wave สุดท้ายเสมอ)

---

## 2. API SPEC
N/A — ไม่มี endpoint (repo-level gate + เอกสาร)

## 3. UX/UI SPEC
N/A — ไม่มี UI surface (change เป็น docs/tooling ล้วน → exclusion ของ wireframe detect)

## 4. Data-flow
```
wave 1 integrate ครบ 4 slice (design-stage-lean · build-verify-seam · validator-cap-gate · memory-hook-lean)
  │
  ├─ [A] วัด baseline: npm test → อ่าน pass count จริง (N) + อ่าน MIN_PASS ปัจจุบันจาก source
  ├─ [B] ตัดสิน version bump (minor vs patch) → เขียน package.json
  ├─ [C] เขียน CHANGELOG.md — entries ของ topic + วันที่ + ### Migration  (slice สุดท้าย = เจ้าของ header date + Migration)
  ├─ [D] เขียน runbook `✖ [C7]` ลง docs/infra.md
  ├─ [E] bump MIN_PASS ตามสูตรจาก N ที่วัดได้จริง (ข้อ A)
  ├─ [F] cross-slice consistency check (negative-grep · orphan pointer · C1 wording · doc coherence)
  └─ [G] cross-cutting gate: npm test + pass-count · lint:md · verify:pack · validate-topic (dogfood + v-next)
```

- **input:** working tree หลัง integrate ครบ · `design.md §4` contract C1–C7 (แหล่ง wording ที่ถูก assert)
- **output:** `CHANGELOG.md` finalized · `package.json` version · `src/scripts/check-test-count.mjs` MIN_PASS · `docs/infra.md` runbook section · รายงานผล gate ทุกตัว (คำสั่ง + exit code + ตัวเลขจริง)

## 5. User-flow
- **ผู้ใช้ npm ที่ `--update` ขึ้นรุ่นใหม่** → อ่าน CHANGELOG → รู้ว่า DESIGN จะถาม confirm เดินต่อ, BUILD จะถามเดิน VERIFY ต่อ, artifact เหลือ `build.md` ไฟล์เดียว, และเอกสารที่ยาวเกิน cap จะถูก block
- **ผู้ใช้ที่มี topic ค้างอยู่** (มี `test.md`/`verify.md` เดิม) → อ่าน `### Migration` → รู้ว่า **ไม่ต้องย้ายอะไร** โครงเก่ายังใช้ต่อได้จนจบ topic
- **ผู้ใช้ที่รัน validate แล้วเจอ `✖ [C7]`** → เปิด `docs/infra.md` runbook → รู้ 3 ทางออก (ย่อเอกสาร / ระบุ tier ใน `proposal.md` / tier `large` ไม่มี cap)
- **maintainer** → รัน gate ครบชุด → เห็นตัวเลข pass count จริง → bump MIN_PASS แบบ evidence-based → release

## 6. Persona
- **ผู้ใช้ปลายทาง (npm)** — คนที่ workflow เปลี่ยนพฤติกรรมใต้เท้า ต้องอ่าน CHANGELOG แล้วเข้าใจได้โดยไม่ต้องเดา
- **ผู้ใช้ที่ topic ค้างกลางทาง** — กังวลว่า upgrade แล้วงานที่ทำค้างจะพัง
- **maintainer ของ repo** — คนกด release + คนที่ต้อง debug gate แดง

## 7. Test-flow
> คำสั่งที่ **ต้องรันจริง** + expected ของแต่ละ gate — ห้ามรายงานผลโดยไม่รัน

### 7.1 Baseline (ก่อนแก้อะไร — config-protection)
- [ ] `grep -n "MIN_PASS" src/scripts/check-test-count.mjs` → **expected:** เห็นค่าปัจจุบัน `200` + comment ที่มา (จด baseline ไว้)
- [ ] `grep -n '"version"' package.json` → **expected:** `0.29.1`
- [ ] `set -o pipefail; npm test 2>&1 | node src/scripts/check-test-count.mjs` → **expected:** exit 0 + จด `pass` = N (ยอดหลัง integrate 4 slice; baseline ก่อน topic นี้ = 212)

### 7.2 Version bump
- [ ] ตัดสิน minor vs patch แล้ว **เขียนเหตุผลลง build report** — **expected:** สรุปว่าเป็น **minor `0.30.0`** เพราะ payload เปลี่ยน **พฤติกรรมที่ผู้ใช้เห็น** (auto-route fast, BUILD→VERIFY continue, artifact 3→1, C7 block ได้) ไม่ใช่แค่ fix; ยัง backward-compatible (ไม่มี ✖ ใหม่กับ topic เก่า) จึงไม่ใช่ major
- [ ] `git diff package.json` → **expected:** เปลี่ยนเฉพาะบรรทัด `"version"` ไม่มี field อื่นขยับ
- [ ] `grep -n '"version"' package.json` → **expected:** `"0.30.0"`

### 7.3 CHANGELOG
- [ ] `sed -n '/## \[0.30.0\]/,/## \[0.29.1\]/p' CHANGELOG.md` → **expected:** section เดียว มี
  - หัวข้อ `## [0.30.0] - YYYY-MM-DD` (วันที่จริงที่ finalize)
  - กลุ่ม `### Added` / `### Changed` ครอบ behavior change ครบ **6 ข้อ**: auto-route fast (confirm 1 ครั้ง) · C7 cap ที่ block ได้ · optional gate trigger-by-signal · memory hook 6→2 จุด · BUILD→VERIFY continue · artifact `build.md` ไฟล์เดียว 4 section (แทน `build/test/verify` 3 ไฟล์)
  - `### Migration` เป็น section **ล่างสุด** ของ 0.30.0
- [ ] อ่าน `### Migration` → **expected:** ครอบ 2 เคสอย่างน้อย — (1) topic ที่ค้างอยู่ใช้โครงเก่า (`test.md`/`verify.md`) ได้ต่อ ไม่ต้องย้าย ไม่ error (2) เอกสารที่ยาวเกิน cap จะถูก **block** ด้วย `✖ [C7]` พร้อมชี้ไป runbook ใน `docs/infra.md`
- [ ] `git diff CHANGELOG.md` → **expected:** ไม่มี entry ของ release เก่า (`0.29.1` ลงไป) ถูกแก้/ย้าย/ลบ
- [ ] ถ้ามี slice อื่นสร้าง header `## [0.30.0]` ไว้แล้ว (ไม่มีวันที่) → **expected:** task นี้ **เติมวันที่ + Migration** ไม่สร้าง header ซ้ำ ไม่เขียน entry ของ slice อื่นใหม่ (`docs/rule.md §1` CHANGELOG header ownership)

### 7.4 Runbook ใน `docs/infra.md`
- [ ] `grep -n "C7" docs/infra.md` → **expected:** พบ section ใหม่ `## Runbook — \`✖ [C7]\` cap เอกสารเกิน`
- [ ] อ่าน section → **expected:** มีครบ 3 ส่วนตาม pattern ของ runbook เดิม — **อาการ** (ข้อความ error จริงที่ผู้ใช้เห็น + exit code 1) · **สาเหตุ** (cap ต่อ tier ตาม C3) · **วิธีแก้ 3 ทาง**: ย่อเอกสารให้อยู่ใน cap / ระบุ tier ในช่อง `ขนาด` ของ `proposal.md` ให้ถูก / ประกาศ `large` (ไม่มี cap) เมื่อ change ใหญ่จริง — และระบุว่า `design.md` **นับเฉพาะบรรทัดก่อน `## 9. Spec delta`**
- [ ] **expected (config-protection):** runbook **ห้าม** เสนอวิธีแก้แบบ "แก้ตัวเลข cap ใน `triage.md §2D`" หรือ "ปิด C7"
- [ ] path ทุกตัวใน section เขียนเป็น **inline-code ไม่ใช่ markdown-link** (`docs/rule.md §4` — `docs/infra.md` อยู่ใน `SCAN_ROOTS` ของ `lint:md`)

### 7.5 MIN_PASS bump (evidence-based)
- [ ] ใช้ N จากข้อ 7.1 → คำนวณ `MIN_PASS = floor((N − 5) / 10) × 10` (สูตรเดิมใน comment ของไฟล์)
- [ ] แก้ค่า + **comment ระบุที่มา** (topic + slice ที่เพิ่มเคส + N ที่วัดได้)
- [ ] `set -o pipefail; npm test 2>&1 | node src/scripts/check-test-count.mjs` → **expected:** exit 0 + `pass === tests` + `pass ≥ MIN_PASS` ใหม่
- [ ] **expected (config-protection):** ถ้า gate แดงเพราะ test จริงพัง → **แก้ต้นเหตุ/รายงาน ห้ามลด MIN_PASS**

### 7.6 Cross-slice consistency check
> เช็คเฉพาะสิ่งที่ slice อื่นทำไม่ได้เพราะมองไม่เห็นกันตอน wave 1 — เจอ inconsistency ให้ **รายงาน + แก้เฉพาะจุดเชื่อม (pointer/ชื่อไฟล์)** ห้าม rewrite นโยบายของ slice อื่น

- [ ] **negative-grep memory hook** — `grep -rn "อัปเดต project memory" src/.warnyin/workflow/stages/ src/.warnyin/workflow/fastlane.md`
  → **expected:** พบใน `stages/build.md`, `stages/ship.md`, `fastlane.md` **เท่านั้น**; **ไม่พบ** ใน `stages/discovery.md`, `stages/design.md`, `stages/verify.md`
  → **ข้อควรระวัง:** `src/.warnyin/workflow/memory.md` เป็น **ผู้นิยาม** hook (พูดถึงข้อความนี้โดยธรรมชาติ) จึง **ไม่นับ** ในการนับ exact-set นี้ — scope ของ grep ต้องจำกัดที่ `stages/` + `fastlane.md` (`docs/rule.md §2` compound-needle)
- [ ] **orphan pointer ของ template ที่ถูกลบ** — `grep -rn "test\.md\|verify\.md" src/.warnyin/ src/.claude/ src/AGENTS.md`
  → **expected:** ไม่มีจุดใดอ้าง template `[topic]/test.md` หรือ `[topic]/verify.md` ในฐานะ **artifact ของ topic** (การอ้าง `stages/verify.md` ซึ่งเป็น playbook ยังถูกต้อง — แยกให้ออก)
  → เช็ครวม CLAUDE.md/AGENTS.md template ที่ installer ใช้: `grep -rn "test\.md\|verify\.md" src/.warnyin/installer/templates/`
  → `ls src/.warnyin/template/stages/\[topic\]/` → **expected:** มี `build.md` ไม่มี `test.md` / `verify.md`
- [ ] **C1 wording ตรงกัน 3 ที่** — ชื่อ 4 section ของ `build.md` (`## 1. ผล build ต่อ task` · `## 2. Full build & test gate` · `## 3. แผนเทส (VERIFY)` · `## 4. ผล verify + การแก้`) ต้อง **ตรงคำต่อคำ** ระหว่าง template `src/.warnyin/template/stages/[topic]/build.md` · playbook `src/.warnyin/workflow/stages/{build,verify}.md` · test ของ validator (`src/tests/validate-topic.test.mjs`)
  → **expected:** ตรงทั้ง 3; ไม่ตรง → **รายงาน + แก้ให้ตรง contract C1 ใน `design.md §4`** (contract ชนะไฟล์ปลายทางเสมอ) ไม่แต่ง wording ใหม่
- [ ] **★ M2 expected 6→3** — หลัง negative-grep ข้างบนผ่านแล้วเท่านั้น: แก้ const `M2_EXPECTED` ใน `src/tests/memory.test.mjs` ให้เหลือ `src/.warnyin/workflow/stages/build.md` · `src/.warnyin/workflow/stages/ship.md` · `src/.warnyin/workflow/fastlane.md` + แก้คอมเมนต์หัวข้อ `M2. write hook ครบ 6 ไฟล์` → 3
  → `set -o pipefail; npm test 2>&1 | node src/scripts/check-test-count.mjs` → **expected:** `M2` เขียว, `M2b` เขียวโดยไม่ถูกแก้, ไม่มีเคสอื่นในไฟล์ถูกแตะ (`git diff src/tests/memory.test.mjs` เห็นเฉพาะ 2 จุด)
  → **เส้นแบ่งกับ config-protection:** นี่คือ **spec เปลี่ยนโดยเจตนา** (hook 6→2 จุด + fastlane — user อนุมัติใน `proposal.md §4`) เทสจึงต้องตามความจริงใหม่; ที่ห้ามคือแก้ expected **เพราะเทสแดง** โดยยังไม่พิสูจน์ว่า hook หายจริง — ถ้า negative-grep ยังเจอ hook ในไฟล์ที่ควรหาย → **หยุด รายงาน slice เจ้าของ ห้ามแก้เทส**
- [ ] **doc coherence** — อ่าน `docs/example-walkthrough.md` + `src/.warnyin/workflow/README.md`
  → **expected:** ไม่มีจุดที่ยังบรรยายโครง artifact เก่า (3 ไฟล์) หรือลำดับ stage ที่ขัดกับ BUILD→VERIFY continue; ผิด → แก้เฉพาะ **จุดเชื่อม/ชื่อไฟล์** ไม่เขียนเนื้อ policy ใหม่

### 7.7 Cross-cutting gate (รันจริงทั้งหมด — ห้ามประกาศผ่านลอย ๆ)
- [ ] `set -o pipefail; npm test 2>&1 | node src/scripts/check-test-count.mjs` → **expected:** exit 0 · `fail 0` · `pass === tests` · `pass ≥ MIN_PASS`
- [ ] `npm run lint:md` → **expected:** exit 0 — ไม่มี dead link (gate นี้คือตัวจับ pointer ข้าม slice ที่พังหลังยุบไฟล์ `test.md`/`verify.md`)
- [ ] `npm run verify:pack` → **expected:** exit 0 — payload ครบ, template ที่เปลี่ยนโครงยังติด tarball, ไม่มีไฟล์นอก allowlist หลุด
- [ ] `node .warnyin/workflow/scripts/validate-topic.mjs lean-ceremony` (**dogfood** = validator รุ่นที่ผู้ใช้ปัจจุบันมี) → **expected:** ไม่มีบรรทัดขึ้นต้น `✖`
- [ ] `node src/.warnyin/workflow/scripts/validate-topic.mjs lean-ceremony` (**v-next** = validator ที่มี C7 จาก slice 3) → **expected:** ไม่มี `✖` — คือ topic นี้ผ่าน cap ของตัวเอง (`proposal.md` ≤ 60 · `design.md` ก่อน `## 9. Spec delta` ≤ 120)
  → **ถ้าแดง:** ย่อเอกสารของ topic นี้ — **ห้ามแก้ cap หรือเปลี่ยน tier เพื่อให้ผ่าน** (config-protection)

### 7.8 RED proof (falsifiability — พิสูจน์ว่า gate จับได้จริง)
- [ ] แทรก markdown-link ไปไฟล์ที่ไม่มีจริงใน `docs/infra.md` → `npm run lint:md` → **expected:** exit ≠ 0 + ชี้ไฟล์/ลิงก์ที่พัง → revert → เขียว
- [ ] ตั้ง `MIN_PASS` สูงเกิน pass จริงชั่วคราว → `set -o pipefail; npm test 2>&1 | node src/scripts/check-test-count.mjs` → **expected:** exit ≠ 0 → revert เป็นค่าที่คำนวณได้ → เขียว
- [ ] (C7) สร้าง fixture topic ชั่วคราวใน temp ที่ `proposal.md` ระบุ `standard` + `design.md` ยาวเกิน 120 บรรทัดก่อน §9 → รัน v-next validator → **expected:** เห็น `✖ [C7]` + exit 1 → ลบ fixture
