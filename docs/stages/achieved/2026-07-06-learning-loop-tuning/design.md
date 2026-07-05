# Design (How) — Learning Loop Tuning guidance

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end
> **UX wireframe:** ข้าม — ไม่มี UI surface (แก้ playbook markdown ล้วน)

## 1. ภาพรวมสถาปัตยกรรม
- **component ที่เกี่ยวข้อง:** workflow playbook (`src/.warnyin/workflow/`) — ไม่ใช่ techstack component (`installer` เดียวเท่านั้น); กติกาอยู่ `docs/rule.md`
- **แนวทางหลัก:** guidance-only (Discovery D1) — **ขยาย fix-loop principle เดิมในที่เดิม** (unify-in-place) ไม่สร้างกลไก/ข้อ/section ขนาน; นิยาม canonical wording ครั้งเดียวใน §2.5 ของไฟล์นี้ แล้ว copy ไปทุก surface (canonical-copy)
- **แก้เฉพาะ `src/.warnyin/workflow/`** (root = dogfood gitignored, sync ตอน release)

## 2. Vertical slices
> หนึ่ง slice = หนึ่งหน่วยคุณค่า end-to-end (เอกสาร: surface + observable proxy + gate ที่เกี่ยวข้อง)

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **fix-loop tuning guidance** — credit-horizon + batching (why+วิธีตัดสิน+observable proxy) ใน build/verify + default-by-tier ใน triage | build.md · verify.md · triage.md (guidance + proxy = "test") | `tasks/loop-guidance/` |
| 2 | **starting-artifact note** — decomposition กำหนด solution ที่เอื้อมถึง (เสริม DAG-width เดิม) | design.md (note) | `tasks/design-note/` |

## 2.5 ★ Canonical wording (นิยามที่เดียว — task copy ไปวาง ไม่แต่งใหม่)
> ตาม `docs/rule.md` "canonical-copy convention" — wording ด้านล่างเป็นแหล่งเดียว; build.md/verify.md/triage.md copy บล็อกที่ระบุ, เขียนกระชับ (minimalism) ไม่ inline ซ้ำข้าม surface

### C1 — credit-horizon + batching guidance (why + วิธีตัดสิน)
> **insertion anchor (unify-in-place — ขยายข้อความเดิม ไม่ append บล็อกขนาน):**
> - `build.md` → **§3 item 8** (full-gate blocking principle) ต่อท้ายด้วย pointer สั้น + **§4 step 6** (จุด delegate-fix จริง "อาจ delegate fix ให้ sub-agent ทีละจุด") = home ของบล็อกเต็ม
> - `verify.md` → **§3 item 5** ("แก้จนผ่าน (loop) + นับรอบ") + **§4 step 5** ("ไม่ผ่าน → แก้ → rerun")
> - บล็อกนี้ copy ลงทั้ง build + verify โดยเจตนา (canonical-copy — แต่ละ stage มี fix loop ของตัวเอง); triage เก็บแค่ default (C2) + pointer กลับมาที่นี่

```
★ loop tuning (fix loop มี finding >1) — จาก paper "iterative generative optimization":
loop tuning ปรับแค่ "ลำดับ/การจัดกลุ่ม" ของการแก้ — ไม่ลด correctness/test-floor
(สอด config-protection: "แก้จนผ่าน" = แก้ root cause ไม่ใช่ลด bar). ก่อนแก้ตัดสิน 2 อย่าง
แล้วระบุ choice + เหตุผล 1 บรรทัดในรายงาน:
- credit horizon (feed feedback แค่ไหนต่อรอบ):
  · สั้น = แก้ทีละ finding rerun ถี่ — เหมาะเมื่อ finding independent + สัญญาณเฉพาะหน้าสอดคล้องเป้า (เร็วกว่า)
  · ยาว = รวม failure ทั้งชุด วิเคราะห์ root cause ร่วม แล้วแก้เป็นชุด — เหมาะเมื่อ finding coupled (แก้จุดนึงเสี่ยงพังอีกจุด)
  ⚠ update ถี่เกินด้วย horizon สั้นเกิน → churn/ผลแย่ลง (อย่าแก้ทีละจุดถ้า failure โยงกัน)
- experience batching (ตอน delegate fix): แบ่ง failure ตาม component/root-cause แล้ว delegate ทีละกลุ่ม
  ⚠ batch ใหญ่ ≠ ดีกว่าเสมอ (task-dependent) — เลือกขนาดกลุ่มตามโครงเหตุ-ผล ไม่ใช่ "อัด context เยอะ = ดี"
default-by-tier: ดู [triage.md loop-tuning default](../triage.md) — default ปรับได้ ไม่ lock
```

### C2 — default-by-tier (default table, canonical ของ tier)
> **insertion anchor:** `triage.md` → **เพิ่ม sub-section ใหม่ "§2C Loop-tuning default per tier" ต่อจาก §2B** (ไม่ใช่ใต้ "Fast-track skip-list" — skip-list เป็น concept ของ fast tier เท่านั้น; ตารางนี้ครบ 3 tier จึงอยู่โซน taxonomy/§2B) + อัปเดตบรรทัด "★ canonical ของ rubric" (triage §top) ให้ครอบ loop-tuning default ด้วย

```
§2C Loop tuning default per tier (fix loop) — starting point ปรับได้ ไม่ lock (escalate/downgrade ตาม §2B):
| tier     | credit horizon                              | batching                                  |
| fast     | สั้น — แก้ทีละ finding                        | 1 agent จัดการ failure น้อยๆ ตรงๆ           |
| standard | group by root-cause แล้วแก้ทีละกลุ่ม           | delegate ต่อ root-cause group               |
| large    | รวมชุด วิเคราะห์ cross-cutting root cause ก่อนแก้ | กลุ่มใหญ่ขึ้นแต่ยังแบ่ง — ระวัง "ใหญ่≠ดีกว่า"   |
why/วิธีตัดสิน: ดู build.md §3 item 8 / §4 step 6 · verify.md §3 item 5 (★ loop tuning) — ไม่ inline ซ้ำที่นี่
```

### C3 — observable proxy (report requirement — **non-blocking, ไม่ใช่ gate item**)
> **insertion anchor:** วางเป็น **note ต่อท้าย loop ที่มันเกิด — ไม่ใช่ใน gate checklist** (กัน hard-gate ที่ block ด้วย filled-detection — ขัด rule "structural validator ✖ ไม่พึ่ง filled-detection"):
> - `build.md` → ท้าย **§4 step 6** (fix loop) เป็น output/report requirement
> - `verify.md` → ท้าย **§4 step 5** (fix loop) เป็น output/report requirement
> - **ห้ามเพิ่มเป็น `- [ ]`** ใน build §7 / verify §6 gate — จำนวน+เนื้อหา gate checklist เดิมต้องคงเดิม (backward-compat, ดู §9 scenario)

```
Loop-tuning report (fix loop มี finding >1 — non-blocking guidance):
- ระบุ credit-horizon choice (per-finding | batched) + เหตุผล 1 บรรทัด ในรายงาน ก่อนแก้
- ตอน delegate fix → failure ถูก group (รายงานเห็น ≥1 group boundary by component/root-cause)
  หรือ ระบุเหตุผลว่าทำไมกลุ่มเดียวพอ — ไม่ dump ก้อนเดียวเงียบๆ
```

### C4 — starting-artifact note (เป็น "why" เสริม ไม่ใช่กลไกใหม่)
> **insertion anchor:** `design.md` (playbook) → **§3 item 3** (DAG-width toolkit) หรือ **§4 step 7** (แตก tasks) — **ไม่ใช่ §7** (§7 = ปรับ ceremony ตาม tier); note สั้นเสริมวินัย vertical-slice/DAG-width เดิม

```
★ starting-artifact (paper): วิธี decompose (1 task vs หลาย slice) + spec/standard ตั้งต้น
กำหนด "solution ที่เอื้อมถึง" ของ BUILD — decomposition ที่แย่ตีกรอบผลลัพธ์ไว้ก่อนเริ่ม
→ ย้ำวินัย vertical-slice + DAG-width เดิม (ไม่ใช่ knob ใหม่)
```

## 3. Data model / schema
- ไม่มี — เอกสารล้วน ไม่มี schema/migration

## 4. Interface / contract
- ไม่มี API/contract; "contract" ระหว่าง surface = canonical wording §2.5 (build/verify ↔ triage reference กันด้วย pointer ไม่ inline ซ้ำ)

## 5. Flow
- **agent-flow (ผลลัพธ์ที่ต้องการ):** agent เข้า fix loop (build full-gate / verify) → เจอ finding >1 → อ่าน ★ loop tuning (C1) → ตัดสิน horizon+batching ตาม tier default (C2) → ระบุ choice+เหตุผลในรายงาน (C3 proxy) → แก้
- ไม่มี user-flow (ไม่มี UI)

## 6. ผลกระทบต่อระบบเดิม
- **build-orchestration / change-sizing / minimalism (touched-surface — 0 delta แต่ต้อง regression):** ขยายในที่เดิม backward-compatible — guidance ไม่ใช่ hard gate ใหม่ (**ไม่เพิ่ม `- [ ]` ใน build §7 / verify §6 gate**; C3 proxy = report note นอก checklist, non-blocking); gate checklist เดิม count+เนื้อหาต้องคงเดิม
- **minimalism / canonical-copy guard:** C1 why-block **copy ลง build + verify ทั้งคู่โดยเจตนา** (แต่ละ stage มี fix loop ของตัวเอง = canonical-copy ที่ถูกต้อง ไม่ใช่ dup ผิด); **ห้าม copy ข้าม kind:** why-block ไม่ลงใน triage (triage เก็บแค่ default C2 + pointer), default-table C2 ไม่ลงใน build/verify (build/verify pointer มาที่ triage)
- **tool-agnostic:** wording generic ไม่ผูกชื่อรุ่น/tool (สอด `docs/rule.md §1`)

## 7. Dependency ระหว่าง slice/task
```
(canonical §2.5 ตายตัวใน design.md แล้ว — ทั้ง 2 task แค่ copy ไปวาง)
wave 1 (ขนาน):  task: loop-guidance   ‖   task: design-note
```
- **critical-path depth (longest chain):** 1 wave
- **max wave width:** 2 (ขนานได้จริง — คนละไฟล์: loop-guidance แตะ build/verify/triage · design-note แตะ design.md; ไม่มี file conflict, coherence ถูก resolve ที่ canonical §2.5 แล้ว)
- **เหตุผลถ้า serialize:** N/A — ไม่ใช่ chain เส้นตรง (width 2)

## 8. Test strategy ระดับ design
- **VERIFY = ตรวจ observable artifact ใน `src/` เท่านั้น** (feature ประเภท playbook ไม่มี runtime — assert "ไฟล์/section/key string มีจริง" ไม่ assert "agent ทำตามตอน runtime"):
  1. **C1 ปรากฏ:** grep บล็อก "★ loop tuning" ใน `src/.warnyin/workflow/stages/build.md` **และ** `verify.md` (คาดเจอ 2 ที่ = canonical-copy ที่ตั้งใจ) + มี guard "ไม่ลด correctness/test-floor"
  2. **C2 canonical-only (dedup 2 ทิศ):** ตาราง "loop-tuning default per tier" (header 3 tier) เจอ **เฉพาะ `triage.md`** (negative-grep: ไม่โผล่ใน build/verify) **และ** triage ไม่ inline why-block (เก็บแค่ default + pointer กลับ build/verify)
  3. **C3 non-blocking:** report note อยู่ท้าย loop (build §4 step 6 / verify §4 step 5) **ไม่ใช่** ใน gate checklist; **gate `- [ ]` ใน build §7 + verify §6 count+เนื้อหาคงเดิม** (diff เทียบก่อนแก้ = backward-compat)
  4. **anchor link resolve:** reference ข้าม surface เป็น markdown link จริง (dead-link gate `lint-md.mjs` ครอบ)
  5. **src-only + parity:** แก้เฉพาะ `src/` (grep target = `src/` ไม่ใช่ root dogfood ที่ stale); verify-pack/publish payload ไม่พัง

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> feature ใหม่ `learning-loop-tuning` (ยังไม่มี spec เดิม) — SHIP สร้าง `docs/features/learning-loop-tuning/spec.md`
> **Touched-surface baseline (0 delta แต่ VERIFY ต้องโหลด regression):** change แก้ไฟล์ใต้ spec เดิม `change-sizing` (triage.md), `build-orchestration` (build.md), `minimalism` (build/verify/design.md) — **ไม่แก้ requirement เดิมของ feature เหล่านี้** (ขยาย implementation location เท่านั้น) แต่ verify.md §3 ต้องรัน scenario เดิมของ 3 feature นี้เป็น regression (โดยเฉพาะ minimalism "full hierarchy block ปรากฏที่เดียว" — ยืนยัน C1 ไม่ไปกระทบ block ของ minimalism, และ "gate ไม่มี item เพิ่ม")
> **descriptive + observable artifact** (playbook ไม่มี runtime → THEN = "ไฟล์/section/string มีจริง" ไม่ใช่ "agent ทำตาม")

### ADDED

#### Requirement: fix-loop มี credit-horizon + batching guidance (→ feature: learning-loop-tuning)
fix loop ของ BUILD และ VERIFY มีบล็อก guidance ★ loop tuning (credit-horizon + experience-batching + guard ไม่ลด correctness) เป็น observable artifact ในไฟล์

##### Scenario: guidance block ปรากฏใน build.md + verify.md
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/build.md` (§3 item 8 / §4 step 6) และ `verify.md` (§3 item 5 / §4 step 5)
- WHEN grep บล็อก "★ loop tuning"
- THEN เจอในทั้งสองไฟล์ (canonical-copy) โดยมี: credit-horizon สั้น/ยาว + ⚠ update ถี่เกิน + batching + ⚠ ใหญ่≠ดีกว่า + guard "ปรับแค่ลำดับ/การจัดกลุ่ม ไม่ลด correctness/test-floor" + pointer (markdown link) ไป triage สำหรับ default

##### Scenario: C3 report note เป็น non-blocking (ไม่ทำ gate เดิมพัง)
- GIVEN build.md §7 gate + verify.md §6 gate (checklist `- [ ]`)
- WHEN เทียบ count + เนื้อหา item ก่อน/หลัง change
- THEN gate checklist เดิมคงเดิมทุก item (ไม่มี `- [ ]` ใหม่ของ loop-tuning); C3 report note อยู่ท้าย fix loop (§4 step 6 / step 5) เป็น requirement นอก checklist ระบุ enum `per-finding | batched` + "เหตุผล 1 บรรทัด"

#### Requirement: default-by-tier ของ loop tuning อยู่ใน triage เดียว (→ feature: learning-loop-tuning)
triage มี default credit-horizon + batching ต่อ 3 tier (fast/standard/large) เป็น canonical เดียว starting-point ปรับได้ ไม่ lock

##### Scenario: default table canonical-only (dedup 2 ทิศ)
- GIVEN ไฟล์ `src/.warnyin/workflow/triage.md`
- WHEN อ่าน sub-section §2C "Loop-tuning default per tier" (ต่อจาก §2B, ไม่ใช่ใต้ Fast-track skip-list)
- THEN มีตาราง default ต่อ 3 tier + pointer (markdown link) กลับ build.md §3 item8/§4 step6 · verify.md §3 item5 สำหรับ why; **ตาราง default ไม่ปรากฏใน build/verify** (negative-grep) และ **why-block ไม่ปรากฏใน triage**

#### Requirement: starting-artifact note ใน design.md (→ feature: learning-loop-tuning)
design.md (playbook) มี note ว่า decomposition + starting spec กำหนด solution ที่ BUILD เอื้อมถึง (เสริม DAG-width เดิม)

##### Scenario: note ปรากฏใกล้ DAG-width / แตก task
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/design.md`
- WHEN อ่าน §3 item 3 (DAG-width toolkit) หรือ §4 step 7 (แตก tasks)
- THEN มี note สั้น "★ starting-artifact" อ้าง paper ว่า decomposition กำหนด solution ที่เอื้อมถึง (เสริมวินัยเดิม ไม่ใช่ knob ใหม่)

### MODIFIED
- ไม่มี (ไม่แก้ requirement เดิมของ change-sizing/build-orchestration/minimalism — touched-surface 0 delta)

### REMOVED
- ไม่มี

---

## 10. Design review (panel 5 มุม — 2026-07-05)
fan-out `warnyin-sa` / `warnyin-tech-lead` / `warnyin-qa` / `warnyin-security` / `warnyin-infra` (read-only ขนาน)

### Blocker (แก้ครบแล้ว)
| # | Blocker | โดย | แก้ที่ |
|---|---|---|---|
| B1 | พิกัด build.md ผิด (gate=§7 ไม่ใช่ §6; fix-loop=§4 step 6 ไม่ใช่ §3) — ลาม C1/C2/C3/§9/proposal | SA·TechLead·QA | §2.5 C1/C2/C3 insertion anchor + §9 scenario + proposal §4 |
| B2 | พิกัด C4 ผิด (design.md §7=tier ceremony; แตก task=§4 step7, DAG-width=§3 item2-3) | TechLead | §2.5 C4 anchor |
| B3 | proxy วางท้าย gate §7 → กลายเป็น hard gate (filled-detection) ขัด rule | SA·QA | C3 → non-blocking note ท้าย loop + §9 scenario "gate คงเดิม" |
| B4 | §9 Scenario 2 assert runtime (ไม่ falsifiable, ไม่มี runtime) | QA | เปลี่ยนเป็น observable-artifact (proxy text มีจริง) |
| B5 | regression baseline ขาด touched feature (change-sizing/build-orchestration/minimalism) | QA | §9 + §6 touched-surface baseline note |

### Suggestion (รับ)
- **Sec-S1:** guard line ใน C1 "ปรับแค่ลำดับ/การจัดกลุ่ม ไม่ลด correctness/test-floor" → เพิ่มแล้ว
- **TechLead/QA:** pin C1 ถึง item-level (build §3 item8/§4 step6 · verify §3 item5) กัน parallel block → §2.5 C1 anchor
- **SA-S1:** ย้าย C2 ออกจาก Fast-track skip-list → §2C ใหม่ → แก้แล้ว
- **QA-S1/S5/TechLead-S3:** no-dup check เจาะจง 2 ทิศ (C2 triage-only + triage ไม่ inline why) → §8.2 + §9 scenario
- **QA-S2:** ตัด threshold "N≤เกณฑ์" subjective → "ระบุเหตุผลว่าทำไมกลุ่มเดียวพอ"
- **QA-S3:** reference เป็น markdown anchor link จริง (dead-link gate ครอบ) → §2.5 + §8.4
- **QA-S4:** verify.md §1 fast-track hook เติม 1 บรรทัดว่า proxy non-blocking ใน lite → **มอบ task loop-guidance ทำ**

### Suggestion (defer/note — ไม่ block)
- **SA-S2:** ใส่ pointer 1 บรรทัดใน `docs/features/change-sizing` ว่ามี behavior นี้ถูก add โดย topic อื่น → **ทำตอน SHIP** (promote learned-rule)
- **TechLead-S4/SA-S3:** task `design-note` เล็ก (C4 เดี่ยว) — **รับได้**: แยกเพื่อ concern isolation + ได้ DAG width-2 สะอาด (C4 ไม่ cross-ref C1–C3)
