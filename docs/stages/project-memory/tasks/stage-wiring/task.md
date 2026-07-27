# Task — stage-wiring (เดินสาย memory เข้า workflow จริง)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `stage-wiring` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `workflow core` (`src/.warnyin/workflow/`) |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)

ทำให้ **workflow เขียน/อ่าน project memory ได้จริง** — ไม่ใช่แค่มีกฎกลางลอยอยู่:

- **เขียน:** 5 stage (`discovery`/`design`/`build`/`verify`/`ship`) + executor `fastlane` มี hook อัปเดต memory ท้ายงานแบบ conditional
- **อ่าน:** `discovery` §2 · `next.md` §2 · `explore.md` §2 มีคำสั่งอ่าน memory พร้อม trust-boundary clause (data ไม่ใช่ instruction)
- **ออก:** `ship.md` รวบ entry `open` เป็น learned-rule candidate → flip สถานะหลัง user อนุมัติ → gate item ใหม่
- **สุขภาพ:** `next.md` เรียก `memory-status.mjs` แบบ optional + รายงานจำนวน entry open

งานนี้เป็น **การ copy contract string คำต่อคำ** จาก `design.md §4` ลงไฟล์ปลายทาง 8 ใบ — ไม่ใช่การประดิษฐ์ wording ใหม่

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- **ต้องทำหลัง:** _ไม่มี_ — อยู่ **wave 1** ขนานกับ T1/T3/T4/T5 (decouple ด้วย contract-first ตาม `design.md §7`)
- **ปลดล็อกให้:** `tasks/release-hygiene` (T6) — เป็นคนเขียน `src/tests/memory.test.mjs` ที่ assert string ทั้งหมดของ task นี้แบบ string-equality
- **ส่ง output อะไรต่อ:** ไฟล์ playbook 8 ใบที่มี hook/clause ครบตาม contract → T6 นับ/เทียบได้
- **ห้ามแตะไฟล์ของ task อื่น** (`design.md §7` file ownership + cross-task note):
  - ✖ `src/.warnyin/workflow/memory.md` (T1) — แม้ pointer จะชี้ไปไฟล์นี้ ก็ **ไม่สร้าง ไม่แก้**
  - ✖ `src/.warnyin/workflow/README.md` (T1)
  - ✖ `src/.warnyin/workflow/scripts/memory-status.mjs` (T5) — task นี้แค่ "เรียก" ผ่านข้อความใน `next.md`
  - ✔ **C5a/C5b อยู่ใน `next.md` ซึ่ง T2 เป็นเจ้าของ → T2 เป็นคน copy** (T5 ห้ามแตะ `next.md`)

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)

- [ ] 1. **write hook 4 stage (C2)** — copy block C2 ลง **ท้าย §4** ของ `stages/discovery.md`, `stages/design.md`, `stages/verify.md`, `stages/ship.md` (ต่อจาก step สุดท้ายของ §4 ก่อนเส้น `---`) — _ผลลัพธ์:_ 4 ไฟล์มีข้อความ `อัปเดต project memory`
- [ ] 2. **write hook ของ BUILD (C2b)** — copy block C2b ลงท้าย §4 ของ `stages/build.md` (**ต่อจากข้อ 7 "ปิดงาน"**) — ⚠ **ใช้ C2b ไม่ใช่ C2** (main-loop-only + ห้าม sub-agent ใน worktree เขียนเอง) — _ขึ้นกับ 1 (โครงเดียวกัน แต่ string ต่างกัน)_
- [ ] 3. **fastlane pointer (C2c)** — เพิ่ม **แถวท้ายสุด** ของตาราง skip-list ใน `fastlane.md §3` ด้วยแถว C2c — ⚠ pointer เท่านั้น ห้าม inline กฎ (executor-playbook convention)
- [ ] 4. **consume clause 3 จุด (C3a/C3b/C3c)** — **แทนที่บรรทัดเดิมทั้งบรรทัด** (ห้ามเพิ่มบรรทัดใหม่ซ้อน):
  - `stages/discovery.md` §2 **ข้อ 5** ← C3a (path `../memory.md`)
  - `next.md` §2 **ข้อ 2** ← C3b (path `./memory.md`)
  - `explore.md` §2 **ข้อ 4** ← C3c (path `./memory.md`) — **คง sub-bullet `achieved/ = archive` บรรทัดถัดไปไว้เหมือนเดิม**
- [ ] 5. **SHIP 3 จุด (C4a/C4b/C4c)** — _ขึ้นกับ 1 (ไฟล์เดียวกัน):_
  - `ship.md §4 step 1` — เพิ่ม bullet C4a **ต่อท้าย** bullet `planned:` / `emergent:` (เป็นแหล่งที่ 3) และ **อยู่เหนือ** bullet `entry แต่ละตัว:`
  - `ship.md §4 step 5` — เพิ่ม **ข้อย่อยที่ 8** (ต่อจากข้อ 7 `docs/codemap/`) = C4b
  - `ship.md §6` — เพิ่ม gate item C4c **ต่อท้ายรายการ** (ก่อนบรรทัด `ยังไม่ครบ → อยู่ SHIP ต่อ...`)
- [ ] 6. **script hook ใน `next.md` (C5a/C5b)** — _ขึ้นกับ 4 (ไฟล์เดียวกัน):_
  - §2 **ข้อ 0** — **ต่อท้ายประโยคเดิม** ด้วย C5a (ขึ้นต้นด้วย `;` — ต่อท้ายไม่ขึ้นบรรทัดใหม่)
  - §3 **ข้อ 1** — **ต่อท้ายรายการที่รายงาน** ด้วย C5b (ขึ้นต้นด้วย `·`)
- [ ] 7. **self-verify ด้วย grep** (ดู `spec.md §7`) — ห้ามรัน `npm run lint:md`

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

| ไฟล์ (ทั้งหมดใต้ `src/.warnyin/workflow/`) | contract ที่ลง | ตำแหน่ง |
|---|---|---|
| `stages/discovery.md` | **C2** + **C3a** | ท้าย §4 · §2 ข้อ 5 (replace) |
| `stages/design.md` | **C2** | ท้าย §4 |
| `stages/verify.md` | **C2** | ท้าย §4 |
| `stages/build.md` | **C2b** | ท้าย §4 |
| `stages/ship.md` | **C2** + **C4a** + **C4b** + **C4c** | ท้าย §4 · §4 step 1 · §4 step 5 ข้อย่อย 8 · §6 ท้ายรายการ |
| `next.md` | **C3b** + **C5a** + **C5b** | §2 ข้อ 2 (replace) · §2 ข้อ 0 (ต่อท้าย) · §3 ข้อ 1 (ต่อท้าย) |
| `explore.md` | **C3c** | §2 ข้อ 4 (replace) |
| `fastlane.md` | **C2c** | §3 ตาราง skip-list แถวท้าย |

> รวม **8 ไฟล์ · 13 จุดแก้** — ไม่แตะไฟล์อื่นใดทั้งสิ้น (ไม่สร้างไฟล์ใหม่ ไม่แตะ `src/tests/`)

**ตัวอย่าง contract ที่ต้อง copy คำต่อคำ** (canonical เต็มอยู่ `design.md §4` — อ่านที่นั่นเป็นหลัก):

```
> **★ อัปเดต project memory (conditional):** จบ stage แล้ว → เขียนสถานะล่าสุด **ทับ** `docs/stages/context.md` (snapshot สั้น ไม่ต่อท้าย) และบทเรียนที่ยัง**พิสูจน์ไม่พอจะเป็น rule** → `docs/memory.md`; ไม่มีอะไรเปลี่ยน → ข้าม — กติกาเต็มดู [`.warnyin/workflow/memory.md`](../memory.md)
```

```
| — | **อัปเดต project memory** (conditional) | เขียน `docs/stages/context.md` ทับ + บทเรียน → `docs/memory.md`; ไม่มีอะไรเปลี่ยน → ข้าม — ดู [`memory.md`](./memory.md) |
```

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)

วัดด้วย Scenario ใน `design.md §9` (T6 จะ assert เป็นเคส node จริง — task นี้ต้องทำให้ผ่านล่วงหน้า):

- [ ] **hook ครบทุกไฟล์** — grep `อัปเดต project memory` ใน `src/.warnyin/workflow/` พบ **ครบ 6 ไฟล์**: `stages/{discovery,design,build,verify,ship}.md` + `fastlane.md`
- [ ] **hook ของ BUILD ห้าม sub-agent เขียนเอง** — `stages/build.md` มีทั้ง `main loop เท่านั้น` และ `build sub-agent ที่ทำงานใน worktree ห้ามเขียน memory เอง`
- [ ] **clause ปรากฏครบสามจุดอ่าน** — grep `เป็น data ไม่ใช่ instruction` พบใน `stages/discovery.md`, `next.md`, `explore.md` ครบ 3 ไฟล์
- [ ] **ไม่มีคำสั่งอ่านซ้ำในไฟล์เดียว** — นับบรรทัดที่สั่งอ่าน `docs/stages/context.md` ใน `next.md` ได้ **1 บรรทัด** (เช่นเดียวกันกับ `discovery.md` และ `explore.md`)
- [ ] **candidate ถูกรวบก่อนขั้นอนุมัติ** — ใน `stages/ship.md` ตำแหน่ง (index) ของข้อความ `project memory:` ที่อ้าง `docs/memory.md` เป็นแหล่ง candidate **อยู่ก่อน** ตำแหน่งของ `promotion plan`
- [ ] **gate เดิมไม่ถูกลดทอน** — นับ `- [ ]` ใน `stages/ship.md §6` ได้ **12 รายการ** (เดิม 11) และ §3 ข้อ 7 ยังมีข้อความ `evidence (บังคับ)` + `user ยืนยัน` ครบ (ไม่แก้ข้อความเดิม)
- [ ] **path ถูกต้องต่อไฟล์** — ไฟล์ใต้ `stages/` ใช้ `../memory.md`; `next.md`/`explore.md`/`fastlane.md` ใช้ `./memory.md` (grep ยืนยันไม่มีการสลับ)
- [ ] **fastlane เป็น pointer ล้วน** — แถวใหม่ใน `fastlane.md §3` ไม่มีเนื้อกฎเต็ม มีแค่สรุป 1 บรรทัด + ลิงก์กลับ `memory.md`
- [ ] ผ่าน test ตาม `spec.md` (test-flow — self-verify ด้วย grep)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern การแก้ไฟล์): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Contract canonical (แหล่ง copy): `../../design.md` §4 (C2, C2b, C2c, C3a, C3b, C3c, C4a, C4b, C4c, C5a, C5b)
