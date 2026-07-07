# Design (How) — build-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture**

## 1. ภาพรวมสถาปัตยกรรม

- component: `installer` (repo นี้เอง) — แก้เฉพาะ `src/**` (SOURCE layer; root dogfood sync หลัง release)
- แนวทางหลัก: **tier เป็นตัวคุม ceremony ทุก stage** — canonical อยู่ที่ `triage.md` (skip-list + caps) stage อื่นชี้ pointer; fast tier เดินเส้นทางใหม่ pre-flight→code-first→receipt; standard/large โครงเดิมแต่ตัด overhead (worktree wave เดี่ยว, reading list, theory ใน playbook ฝั่ง agent)

## 2. Vertical slices

| # | Slice (ส่งมอบคุณค่าอะไร) | ไฟล์ที่แตะ (ใน `src/`) | → task |
|---|---|---|---|
| 1 | fast-track = pre-flight receipt + code-first (skip-list canonical + caps §2D + repoint §2C + UX-detect fix + template + installer.test assertion) | `workflow/triage.md`, `workflow/stages/design.md`, `template/stages/receipt.md` (ใหม่ — **นอก** `[topic]/`), `tests/installer.test.mjs`, `.claude/commands/warnyin/design.md` | `tasks/fast-track-receipt/` |
| 2 | BUILD stage lean (fast hook + worktree เฉพาะ wave ขนาน + integrate 2 mode + prompt lean + prompt test) | `workflow/stages/build.md`, `workflow/scripts/build-wave.mjs`, `tests/build-wave.test.mjs`, `.claude/commands/warnyin/build.md`, `installer/templates/CLAUDE.md` (บรรทัด `/warnyin:build`) | `tasks/build-stage-lean/` |
| 3 | VERIFY+SHIP lean (fast hook → เติม receipt, ship-lite + hard-floor scan) | `workflow/stages/verify.md`, `workflow/stages/ship.md`, `.claude/commands/warnyin/{verify,ship}.md` | `tasks/verify-ship-lean/` |
| 4 | loop-tuning theory แยกเป็นไฟล์ orchestrator-only | `workflow/loop-tuning.md` (ใหม่) | `tasks/loop-tuning-extract/` |
| 5 | validator รู้จัก fast topic (filled-guard + mixed-state) + next.md รู้จัก receipt | `workflow/scripts/validate-topic.mjs`, `tests/validate-topic.test.mjs`, `workflow/next.md` | `tasks/validator-receipt/` |
| 6 | release hygiene | `CHANGELOG.md`, `package.json` (bump) | `tasks/release-hygiene/` |

## 3. Data model / schema (โครงเอกสาร)

**`receipt.md`** — template ที่ `src/.warnyin/template/stages/receipt.md` (**นอก `[topic]/` โดยเจตนา** — กัน whole-folder copy ติดไปทุก topic):
- **H1 ของ template ต้องเป็น `# Receipt — <ชื่อ change>` (มี `<...>` placeholder)** — เป็น contract กับ validator: `isFilled` เดิมจับ template ที่ยังไม่เติมจาก placeholder ใน H1 (convention กลางของทุก template artifact)
- meta table: slug · tier=fast · ประเภท · วันที่ · **hard-floor: ผ่าน (ไม่แตะ 5 หมวด) / แตะหมวด X → upgrade**
- §1 ทำอะไร + ทำไม (≤3 บรรทัด) · §2 acceptance (1-3 ข้อ) · §3 ไฟล์ที่แตะ + สรุป diff · §4 ผล test (+ note ถ้าแตะ config/test-threshold พร้อมเหตุผล) · §5 learned rule / troubleshooting (ถ้ามี)
- **lifecycle เดียว (canonical — ทุก stage hook อ้างตามนี้):**
  1. **pre-flight (DESIGN fast path, ก่อนแตะโค้ด):** copy template → เติม meta (รวม hard-floor row) + §1 + §2 — acceptance จึงประกาศก่อนแก้แบบมี artifact ยืนยัน
  2. **BUILD (code-first) + VERIFY-lite:** แก้โค้ด → test เขียว → เติม §3 + §4
  3. **SHIP-lite:** เติม §5 (ถ้ามี) → สแกน diff เทียบ hard-floor 5 หมวด → archive ทั้งโฟลเดอร์
- ทั้งไฟล์ **≤ 40 บรรทัด** (วัดด้วยจำนวนบรรทัด — deterministic กับภาษาไทย ไม่ใช้ word count)

**`loop-tuning.md`** (ใหม่ — orchestrator-only): เนื้อ ★ theory ที่ย้ายจาก `build.md §4 ข้อ 6` + `verify.md §4 ข้อ 5` (credit horizon ตัวเลือก/เงื่อนไข, experience batching, ⚠ churn, paper ref) — **ห้ามมีตาราง default-by-tier** (ยังอยู่ `triage.md §2C` ที่เดียว)

## 4. Interface / contract

1. **Skip-list canonical (`triage.md`)** — ตารางใหม่ทั้ง 4 row (self-contained — delta §9 ใช้ก้อนเดียวกัน):

   | stage | fast-track ทำ | คงไว้ (correctness floor) |
   |---|---|---|
   | DESIGN | pre-flight: สร้าง `receipt.md` จาก template เติม meta + §1 + §2 **ก่อนแตะโค้ด** — ไม่สร้าง business/proposal/design/tasks, ไม่ panel ไม่ dry-run, model tier `cheap` | hard-floor เช็ค + acceptance ประกาศก่อนแก้ (มี artifact ใน receipt) |
   | BUILD | code-first — main loop แก้โค้ดเอง ไม่เรียก build-wave/ไม่ fork worktree | full-gate (test เขียว) blocking · config-protection · investigate-before-edit · ห้ามแตะ rule/standard กลาง (note ลง receipt §5 รอ SHIP) |
   | VERIFY | lite — functional ตาม acceptance ใน receipt §2 + test เขียว → เติมผลลง receipt §4 | test เขียวจริง |
   | SHIP | lite — เติม receipt §3/§5 → สแกน diff เทียบ hard-floor 5 หมวด → archive; promote learned rule เฉพาะที่มีใน §5 | receipt ครบทุก section + archive ครบ + hard-floor scan ผ่าน (เจอ → upgrade ตาม §2B ห้าม ship-lite) |

   - **caps (section ใหม่ `triage.md §2D` — แยกจาก skip-list anchor):** fast receipt ≤ 40 บรรทัด · standard proposal ≤ 60 / design ≤ 120 บรรทัด · large = judgment
   - **escape hatch:** กลางทางพบใหญ่กว่า/hard-floor → upgrade ตาม §2B (trigger ได้จากกลาง BUILD; receipt ที่มีอยู่คงไว้เป็นบันทึก pre-flight — validator จัดการ mixed-state ตามข้อ 2)
   - **repoint §2C:** บรรทัด why ใน `triage.md:51` ชี้ → `loop-tuning.md` (slice 1 เจ้าของ — slice 4 ห้ามแตะ triage.md)
2. **Validator contract (feature: topic-validator)** — structural + filled-guard (pattern `isFilled` เดิม):
   - `receipt.md` มีอยู่ **และ filled** และไม่มี proposal.md/design.md filled และไม่มี task folder จริง → mode `fast`: ข้าม C1-C4, ตาราง status แสดง `fast-track`
   - receipt filled **ร่วมกับ** artifact ชุดเต็ม (filled proposal/design หรือมี tasks/) → **mixed-state: รัน full checks + ⚠** ("topic มีทั้งโครง full และ receipt — ระบุ mode ให้ชัด")
   - receipt ไม่มี/ยังเป็น template → พฤติกรรมเดิมทุกประการ (backward compatible)
   - installer.test เพิ่ม assertion: หลัง install มี `.warnyin/template/stages/receipt.md` (ปิด gap ที่ lint-md exclude template + verify-pack เช็คแค่ระดับโฟลเดอร์)
3. **build-wave prompt (lean)** — คงอ่าน: role card developer + 4 ไฟล์ task + `docs/techstack/<component>/rule.md` ของ component ที่ task แตะ (safety net security rule) + step 0 sync (เฉพาะ worktree); **ตัด**: path playbook ในบรรทัดแรก, `design.md`/`proposal.md`, techstack แบบเหมา → แทนด้วย "อ่านเพิ่มเฉพาะไฟล์ที่ task.md/standard.md/rule.md อ้างถึง"; troubleshooting KB อ่านเมื่อเจอ error (เดิม); **เพิ่ม test `prompt()`** (extractFn ตาม KB#16): เชิงลบ — ไม่มี path ของ `stages/build.md`/`design.md`/`proposal.md`; เชิงบวก — role card + 4 ไฟล์ task + step 0 เฉพาะ `isolate&&baseRef`
4. **Worktree policy (`build.md §3 ข้อ 3` + `§4 ข้อ 5`)** — wave ≥2 task → worktree ต่อ task + integrate แบบเดิม (`git checkout <branch> -- <files>`); wave เดี่ยว → `isolate:false` **shared tree บน working tree จริง**: orchestrator ต้อง **checkout build branch ก่อนรัน wave** (กัน commit ตกลง main), agent ไม่ commit เอง (guard เดิมใน build-wave), main loop review แล้ว commit — ครอบทั้งสอง mode ใน playbook กัน orchestrator เดินตาม instruction เก่า; fallback non-git เดิมคงอยู่
5. **Canonical wording block (loop-tuning pointer + report)** — slice 2 และ 3 **copy คำต่อคำ** ลง `build.md §4 ข้อ 6` / `verify.md §4 ข้อ 5` แทน ★ theory block เดิม (pointer เป็น markdown link เท่านั้น — inline code จะหลุด dead-link gate):

   ```
   - **★ loop tuning (fix loop มี finding >1)** — วิธีตัดสิน credit horizon / experience batching + ⚠ ดู [`loop-tuning`](../loop-tuning.md); default-by-tier: ดู [triage.md loop-tuning default](../triage.md)
   - Loop-tuning report (fix loop มี finding >1 — non-blocking guidance):
     - ระบุ credit-horizon choice (per-finding | batched) + เหตุผล 1 บรรทัด ในรายงาน ก่อนแก้
     - ตอน delegate fix → failure ถูก group (รายงานเห็น ≥1 group boundary by component/root-cause)
       หรือ ระบุเหตุผลว่าทำไมกลุ่มเดียวพอ — ไม่ dump ก้อนเดียวเงียบๆ
   ```

   (บรรทัด report คงคำเดิมของไฟล์ปัจจุบันเป๊ะ — spec learning-loop-tuning grep enum `per-finding | batched` + "เหตุผล 1 บรรทัด"; **gate checklist `build.md §7` / `verify.md §6` ไม่เปลี่ยนจำนวน item**)
6. **Verify แบบ falsifiable หลังย้าย theory** — full why-block ปรากฏไฟล์เดียว (`loop-tuning.md`); ตาราง default §2C ไม่โผล่ใน `loop-tuning.md`/`build.md`/`verify.md` (negative-grep เดิมของ spec ยัง hold)

## 5. Flow

- **fast:** triage/ประเมิน fast → pre-flight สร้าง receipt (meta+§1+§2) → main loop แก้โค้ด + test เขียว → เติม §3/§4 → ship-lite (เติม §5 + hard-floor scan + archive) — session เดียว ไม่มี sub-agent; ไม่บังคับ build branch แยก (ใช้ git discipline ปกติของ user — trade-off ที่ยอมรับ, บันทึกใน proposal §5)
- **standard/large:** เดิมทุกขั้น ยกเว้น: wave เดี่ยวไม่ fork worktree, agent อ่านน้อยลง, เอกสารมี cap

## 6. ผลกระทบต่อระบบเดิม

- topic ค้างโครงเดิม → valid เสมอ (receipt เป็นทางเลือกเพิ่ม; ไม่มี receipt = พฤติกรรมเดิม)
- test ที่ต้องอัปเดต: `build-wave.test.mjs` (เพิ่ม prompt tests — เคส A-E เดิมไม่แตะ prompt), `validate-topic.test.mjs` (เพิ่มเคส fast/mixed — assertion เดิมไม่แก้), `installer.test.mjs` (+1 assertion) · pass รวมห้ามต่ำกว่า MIN_PASS=9
- `lint:md` (dead-link) = **gate ระดับ integration หลัง merge ทั้ง wave** — task ห้ามตีความ lint แดงจาก pointer ข้าม slice เป็น failure ของตัวเอง (ระบุใน task spec ของ slice 2/3)
- `AGENTS.md` ไม่แตะ (adapter บางชี้ playbook อยู่แล้ว) — defer การเพิ่ม mention fast-track เป็น backlog

## 7. Dependency ระหว่าง slice/task

```
wave 1: fast-track-receipt · loop-tuning-extract · validator-receipt   (width 3)
wave 2: build-stage-lean · verify-ship-lean                            (width 2)
wave 3: release-hygiene                                                (width 1)
```

- **critical-path depth:** 3 · **max wave width:** 3
- **เหตุผล serialize:** slice 2/3 แทรก markdown pointer ไป `loop-tuning.md` — dead-link gate ต้องเห็นไฟล์จริงบน build branch ก่อน (file-existence dependency, contract-first ใช้แทนไม่ได้กับ link resolution); slice 6 ต้องสรุป CHANGELOG จากผลทุก slice — chain แท้ทั้งคู่
- ใน wave ไม่มีไฟล์ทับกัน (slice 1 เจ้าของ `triage.md` คนเดียว รวม repoint §2C; slice 4 สร้างไฟล์ใหม่อย่างเดียว)

## 8. Test strategy ระดับ design

- `npm test` เขียว (รวม test ใหม่ตาม §4.2-4.3) + `npm run verify:pack` + `lint:md` ผ่านหลัง integrate + `check-test-count` ≥ 9
- regression: gate-count `build.md §7`/`verify.md §6` เท่าเดิม · §2C อยู่ `triage.md` ที่เดียว · negative-grep ของ learning-loop-tuning ยังผ่าน (§4.6)

## 9. Spec delta (เทียบ docs/features/*/spec.md ปัจจุบัน)

### ADDED

#### Requirement: Validator รู้จัก fast-track topic ผ่าน receipt (→ feature: topic-validator)
topic ที่มี `receipt.md` filled และไม่มี artifact ชุดเต็ม → mode fast; ปนกัน → full checks + ⚠
##### Scenario: fast topic ข้าม C1-C4
- GIVEN topic มี `receipt.md` ที่ filled (H1 ไม่ใช่ placeholder) และไม่มี proposal.md/design.md filled/ไม่มี task folder WHEN รัน `validate-topic.mjs <slug>` THEN exit 0 + ตาราง/รายงานแสดง mode `fast-track` และไม่มี ✖ C1-C4
##### Scenario: mixed-state ไม่ข้ามเช็ค
- GIVEN topic มีทั้ง receipt.md filled และ design.md filled (หรือ tasks/ จริง) WHEN รัน validate THEN full checks ทำงานปกติ + มี ⚠ mixed-state ใน output
##### Scenario: ไม่มี receipt → พฤติกรรมเดิม
- GIVEN topic ไม่มี receipt.md (หรือยังเป็น template) WHEN รัน validate THEN ผลเหมือน validator เวอร์ชันก่อน change ทุกประการ

#### Requirement: Worktree เฉพาะ wave ที่ขนานจริง (→ feature: build-orchestration — ยังไม่มี spec.md, SHIP สร้างใหม่จาก ADDED)
##### Scenario: wave เดี่ยวไม่ fork worktree
- GIVEN wave มี task เดียว WHEN BUILD ตาม playbook THEN `build.md §3 ข้อ 3` ระบุ wave เดี่ยว → `isolate:false` (shared tree, orchestrator checkout build branch ก่อน, main loop commit) และ `§4 ข้อ 5` ครอบ integrate ทั้งสอง mode

#### Requirement: Build-agent prompt อ่านเฉพาะที่จำเป็น (→ feature: build-orchestration)
##### Scenario: prompt ไม่สั่งอ่านเอกสารเหมา
- GIVEN `prompt()` ใน build-wave.mjs WHEN สกัดข้อความ prompt (extractFn) THEN ไม่มี path `stages/build.md` / `design.md` / `proposal.md` และยังมี role card + 4 ไฟล์ task + techstack rule.md ของ component ที่แตะ (test ใน `build-wave.test.mjs`)

#### Requirement: Fast tier ไม่ผ่าน build-wave (→ feature: build-orchestration)
##### Scenario: fast hook ใน BUILD playbook
- GIVEN tier fast WHEN อ่าน `build.md` fast-track hook THEN ระบุ main loop แก้โค้ดเอง code-first ไม่ spawn sub-agent/worktree + correctness floor ครบตาม skip-list row BUILD (canonical `triage.md`)

### MODIFIED

#### Requirement: Fast-track ลด ceremony ไม่ลด correctness (canonical skip-list) (→ feature: change-sizing)
ตาราง skip-list เวอร์ชันใหม่เต็ม = ตารางใน §4.1 ของ design นี้ (4 row: pre-flight receipt / code-first + anti-gaming floor / verify-lite เติม §4 / ship-lite + hard-floor scan) + `triage.md §2D` caps (fast ≤40 บรรทัด · standard proposal ≤60 / design ≤120 · large judgment) _(เดิม: DESIGN สร้าง proposal/design สั้น + 1 task 4 ไฟล์; BUILD "1 agent DAG width 1"; ไม่มี caps)_
##### Scenario: skip-list canonical + floor ใหม่
- GIVEN `triage.md` หลัง change WHEN อ่าน section Fast-track skip-list THEN ตารางตรงกับ §4.1 (มี receipt lifecycle + anti-gaming floor + hard-floor scan) และ caps อยู่ §2D แยก anchor; stage hooks ยังชี้ skip-list ด้วย link เดิม

#### Requirement: Triage ประเมินขนาด change → แนะนำ tier + route (read-only) (→ feature: change-sizing)
scenario "change เล็ก → fast": route = "design fast-track (pre-flight สร้าง receipt) → code-first → verify-lite → ship-lite" _(เดิม: "`/warnyin:design` แบบ skip panel/dry-run")_
##### Scenario: route ของ fast ชี้เส้นทาง code-first
- GIVEN คำอธิบาย change ขนาดเล็ก WHEN triage รายงาน route THEN ข้อความ route ใน `triage.md §2A` row fast ตรงเวอร์ชันใหม่

#### Requirement: fix-loop มี credit-horizon + batching guidance (→ feature: learning-loop-tuning)
why-guidance (ตัวเลือก/เงื่อนไข/⚠/paper ref) อยู่ที่ `workflow/loop-tuning.md`; `build.md §4 ข้อ 6` / `verify.md §4 ข้อ 5` เหลือ wording block ตาม §4.5 (pointer + report requirement — enum `per-finding | batched` + "เหตุผล 1 บรรทัด" คงคำเดิม) _(เดิม: why-block inline ทั้งสอง stage)_
##### Scenario: theory single-source
- GIVEN playbook หลัง change WHEN grep เนื้อ why-block (เช่น "credit horizon" พร้อมตัวเลือก ·/⚠) THEN เจอเต็มเฉพาะ `loop-tuning.md`; `build.md`/`verify.md` มีเฉพาะ wording block §4.5; gate checklist `build.md §7`/`verify.md §6` จำนวน item เท่าเดิม
- **note สำหรับ SHIP (dry-run พบ):** นอกจาก `spec.md` ให้อัปเดต ref ตำแหน่ง theory ใน `docs/features/learning-loop-tuning/feature.md` (บรรทัด ~18, ~31 — "copy 2 stage โดยเจตนา" → single-file canonical) + `docs/codemap/index.md` (บรรทัด ~39 — capability anchor) + `docs/rule.md` loop-tuning convention ข้อ why-location (task loop-tuning-extract note ไว้ใน rule.md §2 แล้ว)

#### Requirement: default-by-tier ของ loop tuning อยู่ใน triage เดียว (→ feature: learning-loop-tuning)
บรรทัด why-pointer ใต้ตาราง §2C ชี้ → `loop-tuning.md` _(เดิม: ชี้ "build.md §4 ข้อ 6 · verify.md §4 ข้อ 5")_; ตาราง default ยังอยู่ `triage.md` ที่เดียว
##### Scenario: §2C pointer ใหม่ + dedup คงเดิม
- GIVEN `triage.md §2C` หลัง change WHEN ตรวจ pointer + grep ตาราง default THEN pointer ชี้ loop-tuning.md และตาราง default ไม่โผล่ใน `build.md`/`verify.md`/`loop-tuning.md`

#### Requirement: UX wireframe detect (→ feature: uxui-wireframe — ใช้ key จริงใน spec ตอน SHIP ด้วย read-modify-verify)
เพิ่ม precedence: **exclusion เช็คก่อน signals** — change เป็น docs-only / config-only / tooling ล้วน → ข้าม UX step ทันที ไม่ประเมิน signals ต่อ _(เดิม: exclusion เป็น note ท้าย signals — เคยหลุด trigger กับ docs-only topic)_
##### Scenario: docs-only ไม่ trigger wireframe
- GIVEN change ที่แตะเฉพาะไฟล์ docs/config/tooling WHEN เดิน DESIGN step 4.5 detect THEN playbook ระบุให้จบที่ exclusion (ไม่เข้า signals, ไม่เสนอ wireframe)

### REMOVED
— ไม่มี

## Design review (panel 5 role — 2026-07-06)

- **Blocker ที่พบและแก้แล้วใน revision นี้:** receipt lifecycle ขัดกันเอง + pre-flight ไม่มี artifact (Security B1/SA B3 → lifecycle §3 + skeleton ก่อนโค้ด) · template ใน `[topic]/` ทำทุก topic กลาย fast (SA B1/QA B3 → ย้ายนอก `[topic]/` + filled-guard + mixed-state) · fast path หลุดกฎ anti-gaming (Security B2 → floor ใน skip-list row BUILD) · wave 1 ขนาน 5 ตัวชน dead-link gate (TL B1 → re-wave depth 3) · `triage.md §2C` pointer ไร้เจ้าของ (TL B2/SA B4 → slice 1 + delta ใหม่) · delta key mismatch / format ไม่ merge ได้ / ขาด uxui-wireframe / validator ผิด feature (SA B2/B5, QA B1/B2 → §9 เขียนใหม่) · wording block ไม่ canonical (SA B6 → §4.5) · receipt template ไม่มี gate ครอบ (Infra B1 → installer.test)
- **Suggestion ที่รับ:** prompt() test (TL S1/QA S1) · integrate 2 mode + checkout build branch (TL S2/Infra S4) · next.md → slice 5 (TL S4/QA S6) · caps แยก §2D + วัดเป็นบรรทัด (SA S4/QA S2) · md-link only + lint:md integration-level (Infra S2/S3) · installer templates CLAUDE.md → slice 2 (Infra S5) · คง techstack rule.md scoped read (Security S1) · hard-floor scan ตอน ship-lite (Security S2) · single-source grep (QA S5) · MODIFY hooks พร้อม anchor (SA S6/TL S5 → ใส่ใน task spec)
- **Suggestion ที่ไม่ทำ + เหตุผล:** เพิ่ม mention fast-track ใน AGENTS.md (Infra S6) — defer backlog, adapter บางชี้ playbook อยู่แล้ว
