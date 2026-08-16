# Design (How) — lean-ceremony

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `workflow core` (`src/.warnyin/workflow/`) · `templates` (`src/.warnyin/template/`) · `adapters` (`src/.claude/commands/warnyin/`) · `installer` (`src/tests/` สำหรับ validator test) — ดู `docs/codemap/index.md`
- **แนวทางหลัก:** แก้ที่ **canonical เดียวต่อกฎ** แล้วให้ surface อื่นเป็น pointer (`docs/rule.md §1 canonical-copy`); slice แบ่งตาม **ไฟล์เจ้าของกฎ** ไม่ใช่ตาม capability — เพราะ capability 5 ข้อ cross กันบน `design.md`/`build.md` ถ้าแบ่งตาม capability จะเกิด write conflict (re-slice ต่างแกน — `design.md §3` DAG-width toolkit ข้อ 2)

## 2. Vertical slices

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **DESIGN stage เบาลง** — auto-route fast (confirm 1 ครั้ง) + gate trigger-by-signal + ตัด memory hook ของ DESIGN | playbook `stages/design.md` · adapter `commands/warnyin/design.md` · gate §8 | `tasks/design-stage-lean/` |
| 2 | **BUILD↔VERIFY ไร้รอยต่อ** — continue 1 ครั้ง + ยุบ artifact 3→1 + ตัด block ซ้ำ | playbook `stages/{build,verify}.md` · template `[topic]/{build,test,verify}.md` · adapter `commands/warnyin/{build,verify}.md` | `tasks/build-verify-seam/` |
| 3 | **cap บังคับได้จริง** — C7 ใน validator + รองรับ artifact ใหม่ของ slice 2 | `scripts/validate-topic.mjs` · `src/tests/*.test.mjs` | `tasks/validator-cap-gate/` |
| 4 | **memory hook 6→2 + fastlane รับ handoff** — canonical + stage ที่เหลือ | `workflow/memory.md §5` · `stages/{discovery,ship}.md` · `workflow/fastlane.md` | `tasks/memory-hook-lean/` |
| 5 | **release hygiene** — CHANGELOG + dead-link + full gate หลัง integrate ครบ | `CHANGELOG.md` · `npm test` · `lint:md` | `tasks/release-hygiene/` |

## 3. Data model / schema
- ไม่มี DB — "schema" ของงานนี้คือ **โครง artifact ของ topic**:
  - เดิม: `build.md` (ผล build) + `test.md` (แผนเทส) + `verify.md` (ผล verify) — 3 ไฟล์
  - ใหม่: **`build.md` ไฟล์เดียว 4 section** (contract §4 C1)
- `validate-topic.mjs` const `STAGES`: VERIFY เปลี่ยนจาก `required: ['verify.md','test.md']` → **section-based ใน `build.md`** (C2)

## 4. Interface / contract
> **contract-as-copy-source** (`docs/rule.md §2`) — ข้อความ canonical ด้านล่างให้ task **copy คำต่อคำ** ห้ามแต่งใหม่ (ตัด read-dependency ข้าม task → wave 1 ขนานได้จริง)

- **C1 — 4 section ของ `build.md` (owner: slice 2; consumer: slice 3):**
  `## 1. ผล build ต่อ task` · `## 2. Full build & test gate` · `## 3. แผนเทส (VERIFY)` · `## 4. ผล verify + การแก้`
- **C2 — stage inference ของ validator (owner: slice 3):** stage = `VERIFY` เมื่อ `build.md` filled **และ section `## 4. ผล verify` มีเนื้อจริง** ; = `BUILD` เมื่อ filled แต่ §4 ยังเป็นโครงเปล่าของ template
  - **★ แก้จาก "มี heading = พอ" ตอน VERIFY (fix loop รอบ 1):** template ของ `build.md` มี heading §4 ติดมาตั้งแต่ต้น ⇒ ถ้านับแค่ heading ทุก topic จะกระโดดเป็น VERIFY ทันทีที่เริ่มเขียน `build.md` (stage BUILD ไม่มีทางถูก infer) — "เนื้อจริง" ต้องเป็น **template-aware**: ไม่นับ blockquote · heading ย่อย · HTML comment · เส้นคั่น · table separator/row ว่าง · checkbox ที่ยังไม่ติ๊ก · placeholder
  - เป็น **heuristic ระดับ report เท่านั้น** (stage inference ไม่ใช่ ✖) จึงไม่ขัดกับ "✖ ไม่พึ่ง filled-detection" ใน `docs/rule.md §1`
- **C3 — cap ต่อ tier (owner: slice 3; canonical เดิม `triage.md §2D` ไม่แก้ตัวเลข):** `fast: receipt.md ≤40` · `standard: proposal.md ≤60, design.md ≤120` · `large: ไม่มี cap` · **นับเฉพาะบรรทัดก่อน heading `## 9. Spec delta`** ของ `design.md` — เหตุผล: §9 คือเนื้อ spec ที่จะถูก merge ออกไปตอน SHIP ไม่ใช่ narrative ของ design (topic ที่แตะหลาย feature จะติด cap ทั้งที่ narrative สั้น)
- **C4 — tier source (owner: slice 3):** อ่านจาก row `| **ขนาด** |` ใน `proposal.md` — **อ่านเฉพาะ cell ค่า (หลัง pipe ตัวที่ 2) และให้ค่าใน backtick มาก่อน**; เจอ keyword ต่างชนิด >1 ตัว = **ambiguous → ถือว่าอ่านไม่ได้**; ไม่เจอ/ไม่ match/ambiguous → **⚠ C7 "ไม่ระบุ tier — ข้ามเช็ค cap"** ไม่บังคับ
  - **★ แก้จาก "match ตัวแรกที่เจอ" ตอน VERIFY (fix loop รอบ 1):** แถวของ template คือ `` | **ขนาด** | `fast` / `standard` / `large` (…) | `` ⇒ กติกาเดิมคืน `fast` ทุกครั้งที่ยังไม่เติม และเพราะ `CAPS.fast` มีแต่ `receipt.md` topic ที่มี proposal/design จึง **ไม่ถูก cap เลยและไม่มี ⚠ ด้วย** (gate เขียวลวง) · backtick-scoped จำเป็นเพราะ proposal จริงเขียนอธิบายก้ำกึ่งได้ เช่น `` `standard` (ก้ำกึ่ง fast/standard → ปัดขึ้น) `` ซึ่งต้อง resolve เป็น `standard` — ตรวจกับ proposal จริง 38 ใบแล้วผลไม่เปลี่ยนสักใบ (fail-safe ทิศเดียวกับ mode inference)
- **C5 — signal ที่เปิด optional gate (owner: slice 1):** `tier=large` **หรือ** change แตะ hard-floor 5 หมวด **หรือ** จำนวน task ≥ 4 → เสนอ user (ถาม); ไม่เข้าเงื่อนไข → **ข้ามเงียบ ไม่ถาม** (ใช้กับ review panel §4 step 6 + dry-run §4 step 10)
- **C6 — handoff ที่ user ยืนยัน = user-invoked (owner: slice 4, consumer: slice 1):** ประโยคที่ต้องปรากฏใน `fastlane.md §1` และอ้างถึงใน `design.md §4 step 1.5`:
  `★ user-invoked เท่านั้น — AI auto-invoke เองไม่ได้; handoff จาก DESIGN ที่ user ยืนยันในเซสชัน (design §4 step 1.5) นับเป็น user-invoked`
- **C7 — จุดเขียน memory ที่เหลือ (owner: slice 4):** anchor table ใน `memory.md §5` เหลือ 3 แถว — `BUILD` (main loop เท่านั้น, หลัง integrate ครบ) · `SHIP` · `fastlane` (ship-lite); แถว Discovery/DESIGN/VERIFY ถูกลบ และข้อความ hook ในไฟล์ `stages/{discovery,design,verify}.md` ถูกลบตาม (memory.md = เจ้าของนิยาม, stage = เจ้าของข้อความ)

## 5. Flow
- **fast:** `/warnyin:design` → step 1.5 ประเมิน tier=fast → pre-flight receipt → **ถาม 1 ครั้ง** "เดิน fastlane ต่อเลยไหม" → yes: เดิน 4 row จบ+archive ในเซสชันเดียว · no: หยุดที่ receipt (พฤติกรรมเดิม)
- **standard:** DESIGN (panel/dry-run ถามเฉพาะเข้า C5) → BUILD full-gate เขียว → **ถาม 1 ครั้ง** "เดิน VERIFY ต่อเลยไหม" → verify phase (fan-out agent อิสระจากผู้เขียน) → เขียน `build.md §3/§4` → SHIP

## 6. ผลกระทบต่อระบบเดิม
- **backward compatible:** topic เก่าที่มี `test.md`/`verify.md` อยู่แล้วไม่ error — validator ไม่บังคับว่าห้ามมี; `docs/stages/achieved/` ไม่ถูกสแกน (`SKIP_TOPIC`)
- **behavior change ที่ผู้ใช้เห็น:** C7 อาจ block topic ที่เอกสารยาวเกิน cap (ตั้งใจ) → ต้องมี CHANGELOG entry + runbook ใน `docs/infra.md` (`docs/rule.md §1 runbook section`)
- **gate ที่ไม่แตะเลย:** full-gate test เขียว · hard-floor 5 หมวด · evidence-before-promote ของ SHIP · approve gate ของ wireframe · cap 3 รอบของ fastlane

## 7. Dependency ระหว่าง slice/task

```
wave 1 (ขนาน):  design-stage-lean │ build-verify-seam │ validator-cap-gate │ memory-hook-lean
                        └──────────┴──────────┬─────────┴──────────┘
wave 2:                                release-hygiene
```

- **critical-path depth:** 2
- **max wave width:** 4
- **เหตุผลที่ serialize เฉพาะ wave 2:** `release-hygiene` ต้องเห็นไฟล์ครบข้าม slice (dead-link + CHANGELOG + full test) → เป็น integration-level gate ที่รันหลัง integrate เสมอ (`docs/rule.md §1 DAG-width`)
- **ที่ decouple แล้ว:** slice 3 พึ่ง **contract C1/C2** ของ slice 2 ไม่ใช่ไฟล์จริง (contract-first) → ขนานได้; slice 1 พึ่ง **C6** ที่ slice 4 เป็นเจ้าของ → copy คำต่อคำจาก §4 ไม่อ่านไฟล์ของกัน
- **★ exact-set assertion ข้าม slice (coherence review จับได้):** เคส `M2` ใน `src/tests/memory.test.mjs` assert **เซตไฟล์ที่มี hook เป๊ะ 6 ไฟล์** — wave 1 ลบ hook คนละไฟล์จึงมองไม่เห็นกัน ⇒ เทสแดงตลอด wave 1 เป็นเรื่องปกติ และ **`release-hygiene` (wave 2) เป็นเจ้าของการอัปเดต expected 6→3** หลังพิสูจน์ด้วย negative-grep; slice wave 1 ทุกตัว **ห้ามแตะไฟล์เทส** (`docs/rule.md §2` — assertion ที่นับ exact-set ต้องผูก constraint ที่ task เจ้าของ)

## 8. Test strategy ระดับ design
- **slice 3 (โค้ด):** unit `node:test` ต่อ pure fn — `checkCap` (เกิน/พอดี/ต่ำกว่า cap ต่อ tier), tier parse (เจอ/ไม่เจอ/ค่าเพี้ยน), exclude §9, stage inference C2 — feed Map ปลอมไม่แตะ fs (pattern เดิมของ `validate-topic.mjs`)
- **slice 1/2/4 (playbook):** structural check ใน suite — string จาก C1/C5/C6/C7 ปรากฏในไฟล์เจ้าของ, **negative-grep**: hook `อัปเดต project memory` ต้อง **ไม่** เจอใน `stages/{discovery,design,verify}.md` และเจอใน `{build,ship}.md`+`fastlane.md`, ทุก markdown-link resolve (`lint:md`)
- **slice 5:** `npm test` เต็ม + `lint:md` + pass-count gate

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)

### ADDED

#### Requirement: Validator บังคับ cap ขนาดเอกสารต่อ tier (→ feature: topic-validator)

validator เช็คจำนวนบรรทัดของ artifact เทียบ cap ต่อ tier (`triage.md §2D`) — เกิน = ✖ (block); tier อ่านจากช่อง `ขนาด` ใน `proposal.md` และเมื่ออ่านไม่ได้ = ⚠ ข้ามเช็ค (ไม่บังคับ); `design.md` นับเฉพาะบรรทัดก่อน `## 9. Spec delta`

##### Scenario: เกิน cap → ✖
- GIVEN topic ที่ `proposal.md` ระบุขนาด `standard` และ `design.md` มีเนื้อก่อน `## 9. Spec delta` เกิน 120 บรรทัด
- WHEN รัน `node .warnyin/workflow/scripts/validate-topic.mjs <slug>`
- THEN มีบรรทัด `✖ [C7]` ระบุไฟล์ + จำนวนบรรทัด + cap และ exit code = 1

##### Scenario: tier อ่านไม่ได้ → ⚠ ไม่บังคับ
- GIVEN topic ที่ `proposal.md` ไม่มีค่า `fast`/`standard`/`large` ในช่อง `ขนาด`
- WHEN รัน validate
- THEN มี `⚠ [C7]` ระบุว่าไม่ระบุ tier จึงข้ามเช็ค cap และไม่ทำให้ exit code เป็น 1

##### Scenario: tier large ไม่มี cap
- GIVEN topic ที่ระบุขนาด `large` และเอกสารยาวกว่าทุก cap
- WHEN รัน validate
- THEN ไม่มี issue รหัส C7

### MODIFIED

#### Requirement: ทุก stage และ fastlane มี hook เขียน memory (→ feature: project-memory)

playbook เขียน project memory ที่ **สองจุดจบงาน** เท่านั้น — จบ BUILD (main loop เท่านั้น หลัง integrate ครบทุก wave) และ SHIP — บวก executor `fastlane` ที่ ship-lite; `stages/{discovery,design,verify}.md` ไม่มี hook (สถานะของสาม stage นั้นอยู่ใน artifact ของตัวเองแล้ว: `discovery.md`/`proposal.md`+`design.md`/`build.md §4`) _(เดิม: hook ครบทั้งห้า stage + fastlane = 6 จุด)_

##### Scenario: hook เหลือสองจุด + fastlane
- GIVEN ไฟล์ `stages/{discovery,design,build,verify,ship}.md` และ `fastlane.md` ใน `src/.warnyin/workflow/`
- WHEN ค้นข้อความ `อัปเดต project memory`
- THEN พบใน `build.md`, `ship.md`, `fastlane.md` เท่านั้น — ไม่พบใน `discovery.md`, `design.md`, `verify.md`

##### Scenario: hook ของ BUILD ห้าม sub-agent เขียนเอง
- GIVEN `src/.warnyin/workflow/stages/build.md`
- WHEN อ่านบรรทัด hook
- THEN มีข้อความ `main loop เท่านั้น` และ `build sub-agent ที่ทำงานใน worktree ห้ามเขียน memory เอง`

##### Scenario: anchor table ตรงกับไฟล์จริง
- GIVEN `src/.warnyin/workflow/memory.md` section `## 5. Write points (hook ต่อ stage)`
- WHEN อ่านตาราง anchor
- THEN มีสามแถว (`BUILD`, `SHIP`, `fastlane`) และไม่มีแถว Discovery/DESIGN/VERIFY

#### Requirement: รันงาน fast จบในคำสั่งเดียวด้วย `/warnyin:fastlane` (→ feature: fastlane)

executor ของ fast tier — บังคับ `tier=fast` โดยข้าม triage แล้วเดิน skip-list ครบ 4 row ในคำสั่งเดียว; กฎทั้งหมด reuse canonical ของ `triage.md` (executor ไม่ตั้งกฎใหม่ ไม่ว่าเป็นตารางหรือ prose). **ผู้เรียกได้ 2 ทาง:** user สั่ง command เอง หรือ **handoff จาก DESIGN ที่ user ยืนยันในเซสชัน** (`design.md §4 step 1.5`) — ทั้งสองทางนับเป็น user-invoked; AI auto-invoke เองโดยไม่มีการยืนยันยังคงห้าม _(เดิม: user สั่ง command เท่านั้น)_

##### Scenario: surface มีจริง + adapter บาง
- GIVEN `src/.claude/commands/warnyin/fastlane.md` และ `src/.warnyin/workflow/fastlane.md`
- WHEN อ่าน adapter
- THEN มี frontmatter `description` + `argument-hint`, ใช้ `$ARGUMENTS`, ชี้ playbook ด้วย inline-code (ไม่ใช่ markdown-link — กัน dead link) และไม่ duplicate ตาราง rubric/skip-list

##### Scenario: executor ไม่ตั้งกฎซ้ำ (canonical เดียว)
- GIVEN `src/.warnyin/workflow/`
- WHEN สแกนหาประโยค ``pre-flight: สร้าง `receipt.md` จาก template``
- THEN เจอใน `triage.md` ไฟล์เดียว — `fastlane.md` มีแต่ markdown-link ไป `[fast-track skip-list](triage.md#fast-track-skip-list)` ที่ resolve ได้ทั้ง path และ anchor

##### Scenario: handoff ที่ user ยืนยัน = user-invoked
- GIVEN `src/.warnyin/workflow/fastlane.md` §1 และ `src/.warnyin/workflow/stages/design.md` §4 step 1.5
- WHEN อ่านเงื่อนไขผู้เรียก
- THEN `fastlane.md` ระบุว่า handoff จาก DESIGN ที่ user ยืนยันในเซสชันนับเป็น user-invoked และ `design.md` step 1.5 ระบุให้ **ถามยืนยันหนึ่งครั้ง** ก่อนเดินต่อ (ปฏิเสธ → หยุดที่ receipt)

#### Requirement: DESIGN establish tier ก่อนเดินต่อ (sizing gate) (→ feature: change-sizing)

DESIGN มี step ต้นทาง (§4 step 1.5) ที่ **establish tier ก่อนจ่าย ceremony** — ประเมินขนาด change เบื้องต้นเอง → **มั่นใจ = กำหนด tier + บันทึก proposal**; **ไม่มั่นใจ = ถาม user** (ประเมินด้วย `/warnyin:triage` หรือ user กำหนด tier เอง); hard-floor ยังบังคับ ≥ standard. **tier=fast → หลังเขียน receipt เสนอเดิน fastlane ต่อในเซสชันเดียว (ยืนยันหนึ่งครั้ง)** แทนการจบแล้วให้ user พิมพ์ command ที่สอง _(เดิม: จบที่ pre-flight receipt แล้วบอกให้ user สั่ง `/warnyin:fastlane` เอง)_

##### Scenario: design.md มี establish-tier step
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/design.md`
- WHEN อ่าน §4 (process)
- THEN มี step "Establish tier" ก่อน business/proposal ที่ระบุ: ประเมินเอง · มั่นใจ→กำหนด+บันทึก proposal · ไม่มั่นใจ→ถาม user (options: `/warnyin:triage` / user ระบุ tier เอง) · hard-floor → ≥ standard

##### Scenario: fast → เสนอเดินต่อหนึ่งครั้ง
- GIVEN change ที่ประเมินได้ `tier=fast` และเขียน receipt (meta+§1+§2) แล้ว
- WHEN จบ pre-flight
- THEN step 1.5 สั่งให้ถามยืนยันหนึ่งครั้งว่าจะเดิน fastlane ต่อไหม — ตอบตกลง → เดิน 4 row จบในเซสชันเดียว, ปฏิเสธ → หยุดที่ receipt แล้วบอก command ที่ user สั่งเองได้

##### Scenario: §7 ชี้ที่มาของ tier
- GIVEN section `## 7` ใน `design.md`
- WHEN อ่านประโยคนำ
- THEN ระบุว่า "tier ถูก established ที่ §4 step 1.5" (§7 = ceremony per tier, ไม่ inline rubric ซ้ำ — ชี้ `triage.md`)

##### Scenario: proposal บันทึก tier ด้วย vocab ตรง triage
- GIVEN template `src/.warnyin/template/stages/[topic]/proposal.md`
- WHEN อ่านช่อง `ขนาด`
- THEN ค่าเป็น `fast`/`standard`/`large` (ไม่ใช่ เล็ก/กลาง/ใหญ่)

#### Requirement: UX wireframe ใน DESIGN (→ feature: uxui-wireframe)

DESIGN stage มี capability วาด low-fidelity wireframe ให้ user เห็นภาพ + ยืนยันก่อนแตก task สำหรับ change ที่มี UI surface (conditional + backward-compatible); detect มี **exclusion precedence — เช็คก่อน signals**: change เป็น docs-only / config-only / tooling ล้วน → จบทันที ไม่ประเมิน signals ต่อ. **detect เข้าเงื่อนไข → วาดเลย ไม่ต้องถามก่อนวาด** (คำถามที่คงไว้คือ approve gate ของภาพ) _(เดิม: detect แล้วยังต้องถาม user ว่าจะวาดไหม ก่อนจึงวาด)_

##### Scenario: change มี UI surface → วาด wireframe เลย
- GIVEN change ที่ detect ว่าแตะ UI surface (techstack FE/web/mobile/desktop, มี page/route/screen/component, หรือ user flow ใหม่)
- WHEN จบ `proposal.md` ก่อนเขียน technical design
- THEN `design.md` §4 มี **step 4.5 "UX wireframe"** แทรกระหว่าง step 4 (proposal) กับ step 5 ที่สั่งวาด wireframe ทันทีเมื่อ detect ผ่าน (ไม่มีคำถาม "จะวาดไหม")

##### Scenario: ไม่มี UI surface → ข้าม + gate N/A
- GIVEN change ที่ไม่มี UI surface (backend/REST API/CLI/library/docs/tooling ล้วน)
- WHEN DESIGN รัน detect block
- THEN detect block ระบุ "ไม่ใช่ → ข้าม UX step ทั้งหมด" และ gate item §8 "UX wireframe (ถ้า change มี UI surface)" ระบุ "ไม่มี UI surface → N/A" (backward compatible)

##### Scenario: docs-only ไม่ trigger wireframe (exclusion ก่อน signals)
- GIVEN change ที่แตะเฉพาะไฟล์ docs/config/tooling
- WHEN เดิน DESIGN step 4.5 detect
- THEN playbook ระบุให้จบที่ exclusion (เช็คก่อน signals — เจอ → จบทันที ไม่ประเมิน signals ไม่วาด wireframe)

##### Scenario: สัญญาณ UI surface ก้ำกึ่ง → ถาม user
- GIVEN change ที่ detect ไม่ชัด (CLI ที่มี TUI, change แตะทั้ง API + component)
- WHEN DESIGN รัน detect แล้วสัญญาณคลุมเครือ
- THEN detect block ระบุ "ไม่แน่ใจจริง → ถาม user ทีละข้อ + เสนอคำตอบที่แนะนำ" (ห้ามเดา)

##### Scenario: วาด wireframe แบบ read-only generator
- GIVEN detect ผ่าน
- WHEN fan-out agent `warnyin-ux` (frontmatter `tools: Read, Grep, Glob` — ไม่มี Write/Edit) หรือ AI หลักสวม lens `roles/ux.md` (fallback)
- THEN agent คืน ASCII wireframe + user flow + screen states เป็น text; main loop เขียนลง `docs/stages/<slug>/wireframe.md` (single-writer) ที่มี 4 section: User flow · Wireframe ต่อ screen · Screen states · Design-honor note

##### Scenario: approve gate ก่อนแตก task
- GIVEN `wireframe.md` ถูกเขียนแล้ว (status `draft`)
- WHEN ก่อนแตก task
- THEN step 4.5 สั่งให้ user ยืนยัน/ปรับ wireframe (status → `approved`) ก่อน; `design.md §5` (UI layer) อ้าง wireframe ที่ approve; gate item §8 require "user ยืนยันแล้ว"

##### Scenario: fan-out ไม่ได้ → fallback เป็น lens
- GIVEN เครื่องที่ไม่มี Agent/sub-agent tool (fan-out ไม่ได้)
- WHEN ถึง step 4.5 และ detect ผ่าน
- THEN step 4.5 ระบุ fallback "AI หลักสวม lens `roles/ux.md` วาด wireframe เองตามลำดับ" — ยังได้ wireframe ครบ + ผ่าน approve gate เดิม

### ADDED (ต่อ)

#### Requirement: Optional gate เปิดด้วย signal ไม่ใช่ถามทุกครั้ง (→ feature: change-sizing)

review panel และ dry-run ใน DESIGN ถูกเสนอต่อ user **เฉพาะเมื่อเข้า signal อย่างน้อยหนึ่งข้อ**: `tier=large` · change แตะ hard-floor 5 หมวด · จำนวน task ≥ 4 — ไม่เข้าเงื่อนไข → ข้ามเงียบ ไม่ถาม (ลด round-trip ของงานขนาดปกติ); เมื่อเข้าเงื่อนไขยังคงถาม user ก่อนเสมอ (ไม่ auto-run agent)

##### Scenario: standard 3 task → ไม่ถาม
- GIVEN topic tier `standard` ที่แตก 3 task และไม่แตะ hard-floor
- WHEN เดิน DESIGN §4 step 6 และ step 10
- THEN playbook ระบุให้ข้ามทั้งสอง gate โดยไม่ถาม user

##### Scenario: เข้า signal → ถามก่อนเสมอ
- GIVEN topic ที่ `tier=large` หรือแตะ hard-floor หรือมี task ≥ 4
- WHEN ถึง step 6 / step 10
- THEN playbook ระบุให้เสนอ user ก่อน (ถาม) — ไม่ fan-out agent เองโดยไม่ถาม

#### Requirement: BUILD ต่อ VERIFY ในเซสชันเดียว + artifact เดียว (→ feature: build-orchestration)

หลัง full-gate เขียว BUILD เสนอเดิน VERIFY ต่อในเซสชันเดียวโดยยืนยันหนึ่งครั้ง (ปฏิเสธ → หยุด ให้ user สั่ง `/warnyin:verify` เอง); ผลของทั้งสอง stage เขียนลง `build.md` ไฟล์เดียว 4 section (`## 1. ผล build ต่อ task` · `## 2. Full build & test gate` · `## 3. แผนเทส (VERIFY)` · `## 4. ผล verify + การแก้`) แทน 3 ไฟล์เดิม; verify phase ยังบังคับใช้ agent อิสระจากผู้เขียน และ gate ของ VERIFY ไม่เปลี่ยน

##### Scenario: continue หนึ่งครั้งหลัง full-gate
- GIVEN BUILD ผ่าน full build + test gate
- WHEN จบ §4 ปิดงาน
- THEN `build.md` playbook ระบุให้ถามยืนยันหนึ่งครั้งเพื่อเดิน VERIFY ต่อ และระบุทางเลือกหยุดให้ user สั่ง command เอง

##### Scenario: artifact เดียวสี่ section
- GIVEN template `src/.warnyin/template/stages/[topic]/`
- WHEN อ่านรายชื่อไฟล์
- THEN มี `build.md` ที่มีครบสี่ section ตามชื่อข้างต้น และไม่มี `test.md`/`verify.md` แยก

##### Scenario: ผู้ตรวจอิสระจากผู้เขียน
- GIVEN `src/.warnyin/workflow/stages/verify.md`
- WHEN อ่านหลักการของ verify phase
- THEN ระบุว่าการ verify ต้องทำโดย agent/บทบาทที่อิสระจากผู้เขียนโค้ด (self-check ของ build agent ไม่นับ)

### REMOVED

ไม่มี — ทุก requirement เดิมยังอยู่ (ที่เปลี่ยนถูกเขียนเป็น MODIFIED)
