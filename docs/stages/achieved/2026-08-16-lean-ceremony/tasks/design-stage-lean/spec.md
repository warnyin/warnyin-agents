# Spec — design-stage-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task

## 1. ชนิดของ task

`playbook` (payload `.md`) + `adapter` — **ไม่มีโค้ด ไม่มี API/UI/data schema ใหม่** ทั้ง task คือการแก้ข้อความใน 2 ไฟล์

| | |
|---|---|
| ไฟล์ A (playbook กลาง) | `src/.warnyin/workflow/stages/design.md` |
| ไฟล์ B (adapter บาง) | `src/.claude/commands/warnyin/design.md` |

---

## 2. Contract ที่ต้อง copy คำต่อคำ (แหล่ง: `../../design.md` §4 — ห้ามอ่านไฟล์ของ slice อื่น)

### 2.1 C5 — needle ที่ต้องปรากฏ **1 ครั้งเท่านั้น** ในไฟล์ A

```
`tier=large` **หรือ** change แตะ hard-floor 5 หมวด **หรือ** จำนวน task ≥ 4 → เสนอ user (ถาม); ไม่เข้าเงื่อนไข → **ข้ามเงียบ ไม่ถาม**
```

- วาง canonical ที่ **§3 ข้อ 7** (principle level — ครอบทั้ง review panel และ dry-run)
- **§3 ข้อ 8 · §4 step 6 · §4 step 10** ใช้ **pointer** `signal ตาม §3 ข้อ 7` — ห้าม copy needle ซ้ำ (single-source ในไฟล์เดียวกัน)
- ข้อความ "ถาม user ก่อนเสมอ" **ยังต้องคงอยู่ทั้ง 2 gate** (เข้า signal แล้วยังถาม ไม่ auto-run agent)

### 2.2 C6 — ไฟล์ A **อ้างถึง ไม่ copy ประโยคเต็ม**

- ประโยค C6 เต็ม (`★ user-invoked เท่านั้น — AI auto-invoke เองไม่ได้; …`) เป็นของ **`fastlane.md §1` (slice 4)** — **ห้ามปรากฏใน `design.md`** (กัน single-source แตก)
- ไฟล์ A ต้องมี fragment ทั้งสองชิ้นนี้ใน §4 step 1.5: `ที่ user ยืนยันในเซสชัน` และ `นับเป็น user-invoked`

---

## 3. จุดแก้ — ไฟล์ A `src/.warnyin/workflow/stages/design.md`

| # | ตำแหน่ง | เปลี่ยนเป็น |
|---|---|---|
| A1 | §4 step 1.5 — bullet `fast-track path` + blockquote ท้าย step | หลังเขียน receipt → **ถามยืนยันหนึ่งครั้ง** ว่าจะเดิน fastlane ต่อในเซสชันเดียวไหม · ตกลง → เดินครบ **4 row** ตาม fastlane โดยเขียนเป็น markdown-link ชี้ `../fastlane.md` (**ชี้ ไม่ลอกขั้นตอน/skip-list**) · ปฏิเสธ → **หยุดที่ receipt** + บอก command `/warnyin:fastlane` ที่ user สั่งเองได้ · ระบุว่า handoff **ที่ user ยืนยันในเซสชัน** **นับเป็น user-invoked** |
| A2 | §3 ข้อ 7 (review panel) | label `(optional — trigger by signal; เข้าเงื่อนไขแล้วยังถาม user ก่อนเสมอ)` + วาง **needle C5** ที่นี่ (ครั้งเดียวในไฟล์) |
| A3 | §3 ข้อ 8 (dry-run) | label เดียวกัน + pointer `signal ตาม §3 ข้อ 7` |
| A4 | §4 step 6 (review panel) | นำด้วย "เช็ค signal ก่อน — ไม่เข้าเงื่อนไข → ข้ามเงียบ ไม่ถาม (signal ตาม §3 ข้อ 7)" แล้วค่อยเป็น flow เดิม (ถาม → fan-out → blocker → บันทึก) |
| A5 | §4 step 10 (dry-run) | เหมือน A4 — เช็ค signal ก่อนถาม; flow ย่อย 1-6 เดิมไม่แตะ |
| A6 | §4 step 4.5 (UX wireframe) | label → `(conditional — เฉพาะ change มี UI surface)`; detect ผ่าน → **วาดเลย ไม่ถามก่อนวาด**; **ลบ** bullet ที่เสนอ user ว่าจะวาดไหม/`user ปฏิเสธ → บันทึกว่าข้าม` |
| A7 | ท้าย §4 (blockquote `★ อัปเดต project memory (conditional)`) | **ลบทั้ง blockquote** (C7 — canonical อยู่ `memory.md §5` ของ slice 4) |

**สิ่งที่ห้ามเปลี่ยนในไฟล์ A (regression guard):**
- block `### UX wireframe — detect ว่า change มี UI surface ไหม?` ทั้งก้อน — **Exclusion เช็คก่อน signals**, 3 signals, บรรทัด "ไม่แน่ใจจริง → ถาม user ทีละข้อ"
- `★ approve gate` ของ wireframe · บรรทัด `fallback` ของ step 4.5 · บรรทัด "design.md §5 (UI layer) อ้าง wireframe ที่ approve"
- §8 gate ทั้ง 11 item (โดยเฉพาะ item UX ที่ลงท้าย `ไม่มี UI surface → ข้อนี้ N/A`) — **ห้ามเพิ่ม/ลด/แก้ถ้อยคำ**
- ทุก **heading** ของไฟล์ (anchor-immutability) และ fallback ของทุกจุด fan-out

## 4. Data-flow (ไม่มีข้อมูลรันไทม์ — flow ของ "การตัดสินใจ" ในไฟล์ A)

```
step 1.5 tier → fast?  ──yes─→ receipt → [ถามยืนยัน 1 ครั้ง] ──ตกลง──→ fastlane 4 row (pointer)
                       │                                     └─ปฏิเสธ─→ หยุดที่ receipt + บอก command
                       └─no──→ step 3..5 → step 4.5 (detect UI → วาดเลย → approve gate)
                                        → step 6  [C5 signal? ─ไม่เข้า→ ข้ามเงียบ / เข้า→ ถาม user]
                                        → step 7..9
                                        → step 10 [C5 signal? ─ไม่เข้า→ ข้ามเงียบ / เข้า→ ถาม user]
```

## 5. User-flow (สิ่งที่ผู้ใช้เห็นเปลี่ยนไป)

- งาน fast: ตอบคำถามยืนยัน **1 ครั้ง** แล้วจบทั้งเส้นในเซสชันเดียว (เดิมต้องพิมพ์ command ที่สอง)
- งาน standard 3 task ไม่แตะ hard-floor: **ไม่ถูกถามเรื่อง panel/dry-run เลย** (เดิมถูกถาม 2 ครั้ง)
- งานที่มี UI surface: ได้ wireframe ทันที แล้วค่อยยืนยัน/ปรับภาพ (เดิมถูกถาม "จะวาดไหม" ก่อน 1 ครั้ง)

## 6. Persona

ผู้ใช้ workflow ที่เดิน `/warnyin:design` (และ AI agent ทุก harness ที่อ่าน playbook นี้)

## 7. Test-flow (self-verify ด้วย grep — falsifiable ทุกข้อ)

> รันจาก repo root · `F_A=src/.warnyin/workflow/stages/design.md` · `F_B=src/.claude/commands/warnyin/design.md`
> ⚠ **ห้ามรัน `npm test` แล้วไล่แก้ให้เขียว** — เคส `M2` ใน `src/tests/memory.test.mjs` จะแดงเพราะ A7 (คาดไว้แล้ว; expected ของ M2 และ gate เต็มเป็นของ `release-hygiene` — wave 2)

- [ ] **T1 (A7)** — `grep -c 'อัปเดต project memory' $F_A` = **0**
- [ ] **T2 (C5 single-source)** — นับ needle C5 (§2.1) ใน `$F_A` ได้ **1** พอดี
- [ ] **T3 (C5 pointer)** — `grep -n 'signal ตาม §3 ข้อ 7' $F_A` เจอ **3 จุด** (§3 ข้อ 8 · §4 step 6 · §4 step 10)
- [ ] **T4 (C5 ยังถามก่อนเสมอ)** — `grep -c 'ถาม user ก่อนเสมอ' $F_A` ≥ **2** และ `grep 'ข้ามเงียบ ไม่ถาม' $F_A` เจอ
- [ ] **T5 (A1 handoff)** — `$F_A` §4 step 1.5 มีครบ: `ถามยืนยันหนึ่งครั้ง` · `4 row` · `ที่ user ยืนยันในเซสชัน` · `นับเป็น user-invoked` · ลิงก์ `](../fastlane.md)`
- [ ] **T6 (C6 ไม่ซ้ำ)** — `grep 'AI auto-invoke เองไม่ได้' $F_A` = **ไม่เจอ**
- [ ] **T7 (ไม่ลอก skip-list)** — `grep 'pre-flight: สร้าง' $F_A` = **ไม่เจอ** (executor-playbook convention — ชี้ `triage.md`/`fastlane.md` เท่านั้น)
- [ ] **T8 (A6 ตัดคำถาม)** — `grep 'จะวาด wireframe' $F_A` = **ไม่เจอ** และ `grep 'user ปฏิเสธ → บันทึกว่าข้าม' $F_A` = **ไม่เจอ**
- [ ] **T9 (A6 คงของเดิม)** — `$F_A` ยังมีครบ: `Exclusion (เช็คก่อน` · `★ approve gate` · `fallback` ของ step 4.5 · `ไม่แน่ใจจริง → ถาม user ทีละข้อ`
- [ ] **T10 (gate ไม่ถูกลดทอน)** — นับ `- [ ]` ใน `$F_A` §8 ได้ **11** พอดี และยังมีข้อความ `ไม่มี UI surface → ข้อนี้ N/A`
- [ ] **T11 (heading คงเดิม)** — `grep -c '^#' $F_A` เท่ากับก่อนแก้ และรายชื่อ heading ตรงกันทุกบรรทัด (diff heading ก่อน/หลัง = ว่าง)
- [ ] **T12 (adapter บาง)** — `$F_B` ข้อ 4/5/6 อ้าง `playbook §3 ข้อ 7` / `§4 step 1.5` / `§4 step 10` และ **ไม่มี** needle C5 ฉบับเต็ม (`grep 'จำนวน task ≥ 4' $F_B` = ไม่เจอ) — adapter ชี้ ไม่ duplicate
- [ ] **T13 (adapter ตรงพฤติกรรมใหม่)** — `$F_B` **ไม่มี** `Review panel (ถาม user ก่อน)` และ `Dry-run (ถาม user ก่อนเสมอ)` แบบไม่มีเงื่อนไข; มีคำว่า `trigger by signal` หรือ `เข้า signal` ในทั้งสองข้อ
- [ ] **T14 (ลิงก์ resolve)** — ทุก markdown-link ที่ **task นี้เพิ่ม/แก้** ชี้ไฟล์ที่มีจริง (`../fastlane.md`, `../triage.md#fast-track-skip-list` เดิม) — ตรวจด้วย `ls` ตาม relative path จากที่อยู่ของไฟล์ผู้ชี้
- [ ] **T15 (ไฟล์นอกขอบเขต)** — `git status --short` แสดงเฉพาะ 2 ไฟล์เป้าหมาย ไม่มีไฟล์อื่น
