# Task — design-stage-lean (DESIGN stage เบาลง)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `design-stage-lean` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `workflow core` (`src/.warnyin/workflow/`) + `adapters` (`src/.claude/commands/warnyin/`) |
| **Model tier** | `balanced` |
| **สถานะ** | `build done` |

## 1. เป้าหมายของ task (vertical slice)

ทำให้ **DESIGN stage จ่าย ceremony ตามขนาดงานจริง** โดยไม่ลด correctness floor — ครบใน 2 ไฟล์:

- **fast → จบในเซสชันเดียว** — หลัง receipt ถามยืนยัน 1 ครั้ง แล้ว handoff ไป fastlane (ปฏิเสธ = พฤติกรรมเดิม)
- **optional gate 2 ตัว (review panel / dry-run) → trigger by signal** — ไม่เข้าเงื่อนไขข้ามเงียบ ไม่ถาม
- **wireframe → detect ผ่านแล้ววาดเลย** ตัดคำถาม "จะวาดไหม" (approve gate ของภาพยังอยู่)
- **DESIGN ไม่มี write point ของ project memory อีกต่อไป** (C7)
- adapter `/warnyin:design` สะท้อนพฤติกรรมใหม่แบบ **ชี้ playbook ไม่ duplicate**

## 2. Dependency

- **ต้องทำหลัง:** _ไม่มี_ — **wave 1** ขนานกับ `build-verify-seam` · `validator-cap-gate` · `memory-hook-lean` (decouple ด้วย contract-first — `../../design.md §7`)
- **ปลดล็อกให้:** `tasks/release-hygiene` (wave 2 — dead-link + CHANGELOG + full gate) และ `tasks/validator-cap-gate` (เจ้าของเทส negative-grep ที่ assert ผลของ A7)
- **ส่ง output อะไรต่อ:** ไฟล์ playbook/adapter ที่มี string ตาม C5 + fragment C6 ให้ slice อื่น assert ได้
- **ห้ามแตะไฟล์ของ slice อื่น** — ดู `rule.md §1.6` (โดยเฉพาะ `fastlane.md`, `memory.md`, `src/tests/**`, template, `CHANGELOG.md`)

## 3. Sub-tasks

- [x] 1. **อ่านก่อนแก้** — `../../design.md` §4 (contract C5/C6) + ไฟล์เป้าหมายทั้ง 2 ใบเต็ม; จด heading list ของไฟล์ A ไว้เทียบภายหลัง (T11)
- [x] 2. **A2/A3 — §3 ข้อ 7 + ข้อ 8** — เปลี่ยน label เป็น trigger-by-signal; วาง **needle C5 ที่ข้อ 7 ครั้งเดียว**, ข้อ 8 เป็น pointer — _ผลลัพธ์:_ T2/T3/T4 ผ่านบางส่วน
- [x] 3. **A4/A5 — §4 step 6 + step 10** — นำ step ด้วยการเช็ค signal (pointer `§3 ข้อ 7`) ก่อนถาม; **ไม่รื้อ sub-step เดิม** — _ขึ้นกับ 2 (ต้องมี canonical ให้ชี้ก่อน)_
- [x] 4. **A1 — §4 step 1.5 handoff** — เขียนทับ blockquote ท้าย step ให้เป็น: ถามยืนยัน 1 ครั้ง → ตกลง: เดินครบ 4 row ตาม `../fastlane.md` (ชี้ ไม่ลอก) · ปฏิเสธ: หยุดที่ receipt + บอก `/warnyin:fastlane` · ระบุ `ที่ user ยืนยันในเซสชัน` `นับเป็น user-invoked` — _ผลลัพธ์:_ T5/T6/T7
- [x] 5. **A6 — §4 step 4.5** — ลบ bullet คำถาม "จะวาดไหม" + `user ปฏิเสธ → บันทึกว่าข้าม`, ปรับ label เป็น conditional, คง detect/exclusion/approve gate/fallback ครบ — _ผลลัพธ์:_ T8/T9
- [x] 6. **A7 — ลบ memory hook ท้าย §4** ทั้ง blockquote ไม่เหลือ pointer กำพร้า — _ผลลัพธ์:_ T1
- [x] 7. **ไฟล์ B — adapter ข้อ 4/5/6** — ข้อ 4 (review panel) + ข้อ 6 (dry-run) → trigger by signal ชี้ `playbook §3 ข้อ 7` / `§4 step 10`; ข้อ 5 (fast-track) → เพิ่มบรรทัดเดียวว่า confirm 1 ครั้งแล้ว handoff (logic อยู่ `playbook §4 step 1.5`) — _ขึ้นกับ 2-6 (พฤติกรรมต้องนิ่งก่อน)_ — _ผลลัพธ์:_ T12/T13
- [x] 8. **self-verify** — เดิน T1-T15 ใน `spec.md §7` ด้วย grep/อ่านไฟล์ (ห้ามรัน `lint:md`; `npm test` แดงที่ M2 = คาดไว้แล้ว)

## 4. ขอบเขตไฟล์ที่จะแตะ

| ไฟล์ | จุดแก้ |
|---|---|
| `src/.warnyin/workflow/stages/design.md` | §3 ข้อ 7 · §3 ข้อ 8 · §4 step 1.5 · §4 step 4.5 · §4 step 6 · §4 step 10 · ลบ blockquote memory ท้าย §4 |
| `src/.claude/commands/warnyin/design.md` | ข้อ 4 (bullet review panel) · ข้อ 5 (fast-track path) · ข้อ 6 (dry-run) |

> **2 ไฟล์ · 10 จุดแก้** — ไม่สร้างไฟล์ใหม่ ไม่แตะไฟล์อื่นใดทั้งสิ้น (รวมถึง root `.warnyin/`/`.claude/` ที่เป็น dogfood gitignored)

## 5. Acceptance criteria

- [x] **T1-T15 ใน `spec.md §7` ผ่านครบทุกข้อ** (falsifiable ด้วย grep/อ่านไฟล์)
- [x] needle C5 ปรากฏ **1 ครั้ง** ในไฟล์ A + pointer 3 จุด — และทั้งสอง gate ยังมีข้อความ `ถาม user ก่อนเสมอ`
- [x] `grep 'อัปเดต project memory'` ในไฟล์ A = **0**
- [x] step 4.5 ไม่มีคำถามก่อนวาด แต่ยังมี exclusion-ก่อน-signals · approve gate · fallback ครบ
- [x] §8 gate ยัง **11 item** ถ้อยคำเดิม และ heading ทั้งไฟล์ไม่เปลี่ยน (anchor-immutability)
- [x] adapter ไม่ duplicate เงื่อนไข/ขั้นตอน — ชี้ playbook + เลข step
- [x] `git status --short` มีเฉพาะ 2 ไฟล์เป้าหมาย
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern การเขียน playbook): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Contract canonical (แหล่ง copy): `../../design.md` §4 (C5, C6) + §9 Spec delta
