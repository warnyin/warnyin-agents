# Spec — stage-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task

`infra` / `docs-payload` — แก้ **playbook markdown** ของ workflow core (`src/.warnyin/workflow/`) ไม่แตะโค้ดรันไทม์
API SPEC / UX-UI SPEC = **N/A** (ไม่มี REST API และไม่มี UI surface — ตาม `design.md §1`)

---

## 2. จุดแก้ที่ต้องทำ (13 จุด · 8 ไฟล์)

> ★ ทุก string ต้อง **copy คำต่อคำจาก `design.md §4`** — ที่ยกมาในไฟล์นี้เป็นเพียง**ตำแหน่งอ้างอิง** ไม่ใช่แหล่งจริง (ถ้าต่างกัน → `design.md` ชนะ)

### 2.1 Write hook (C2 / C2b / C2c)

| # | ไฟล์ | contract | ตำแหน่ง (anchor ปัจจุบัน) |
|---|---|---|---|
| 1 | `stages/discovery.md` | C2 | ท้าย §4 — ต่อจากข้อ `6. **เช็ค gate (ข้อ 6):** ...` ก่อน `---` |
| 2 | `stages/design.md` | C2 | ท้าย §4 — ต่อจาก 2 บรรทัด blockquote ปิดท้าย §4 ก่อน `---` |
| 3 | `stages/verify.md` | C2 | ท้าย §4 — ต่อจากข้อ `7. **ปิดงาน:** เสนอเข้า SHIP ...` ก่อน `---` |
| 4 | `stages/ship.md` | C2 | ท้าย §4 — ต่อจากข้อ `7. **ปิดงาน:** รายงาน user ว่าส่งมอบครบ ...` ก่อน `---` |
| 5 | `stages/build.md` | **C2b** | ท้าย §4 — ต่อจากข้อ 7 (ปิดงาน: อัปเดต build.md ...) ก่อน `---` |
| 6 | `fastlane.md` | **C2c** | §3 ตาราง skip-list — **แถวใหม่ต่อจากแถวที่ 5 (ship-lite)** |

> รูปแบบที่ใส่: **บรรทัด blockquote 1 บรรทัด** คั่นจาก step list ด้วยบรรทัดว่าง 1 บรรทัด (สไตล์เดียวกับ blockquote ปิดท้าย §4 ของ `design.md`)

### 2.2 Consume — replacement (C3a / C3b / C3c)

**บรรทัดเดิมที่ต้องถูก "แทนที่ทั้งบรรทัด"** (ห้าม append บรรทัดใหม่):

`stages/discovery.md` §2 ข้อ 5 — เดิม:
```
5. `docs/stages/context.md` และ topic ที่ `achieved/` ที่ใกล้เคียง — เคยทำอะไรไปแล้ว
```

`next.md` §2 ข้อ 2 — เดิม:
```
2. **อ่าน `docs/stages/context.md`** — บริบทงานที่จดไว้ (ถ้ามี)
```

`explore.md` §2 ข้อ 4 — เดิม (⚠ **sub-bullet บรรทัดถัดไปเรื่อง `achieved/` = archive ต้องคงไว้**):
```
4. `docs/stages/context.md` + topic ที่ **active** ใน `docs/stages/` — งานที่กำลังทำ
```

**path ต่างกันตามที่อยู่ไฟล์** (copy ตาม contract อย่าสลับ):

| contract | ไฟล์ | path ในลิงก์ |
|---|---|---|
| C3a | `stages/discovery.md` (ใต้ `stages/`) | `../memory.md` |
| C3b | `next.md` (ระดับ `workflow/`) | `./memory.md` |
| C3c | `explore.md` (ระดับ `workflow/`) | `./memory.md` |

### 2.3 SHIP (C4a / C4b / C4c) — ทั้งหมดใน `stages/ship.md`

| contract | ตำแหน่ง | anchor ปัจจุบัน |
|---|---|---|
| **C4a** | §4 step 1 — bullet แหล่ง candidate **ที่ 3** | แทรก**หลัง** bullet ที่ขึ้นต้น `- **emergent:**` และ **ก่อน** bullet ที่ขึ้นต้น `- **entry แต่ละตัว:**` |
| **C4b** | §4 step 5 — **ข้อย่อยใหม่ที่ 8** | ต่อจากข้อย่อยที่ 7 (`docs/codemap/` ทั้งหมด) |
| **C4c** | §6 — gate item **ท้ายรายการ** | ต่อจาก `- [ ] user รับทราบผลการส่งมอบ` และ **ก่อน** บรรทัด `ยังไม่ครบ → อยู่ SHIP ต่อ topic ยังไม่ปิด` |

**invariant ที่ห้ามพัง:** §3 ข้อ 7 (`เก็บ learned-rule ให้หมด`) และ gate item เดิม 11 ข้อ **ห้ามแก้ข้อความ** — เพิ่มอย่างเดียว (11 → 12)

### 2.4 Script hook ใน `next.md` (C5a / C5b) — **ต่อท้าย ไม่ขึ้นบรรทัดใหม่**

`next.md` §2 ข้อ 0 — C5a ต่อท้ายประโยคเดิม (string ขึ้นต้นด้วย `; ` จึงต่อได้ตรงๆ ท้ายบรรทัด):
```
0. **structural pre-scan (ถ้ารัน node ได้):** ... ; อ่าน `docs/backlog.md` ... เพื่อรายงานใน §3
```

`next.md` §3 ข้อ 1 — C5b ต่อท้ายรายการที่รายงานในตารางภาพรวม (string ขึ้นต้นด้วย `· `):
```
1. **ตารางภาพรวม:** topic · stage ปัจจุบัน · ... · backlog: N รายการ open (จาก `docs/backlog.md`; ถ้าไม่มีไฟล์ → ระบุ "–")
```

---

## 4. Data-flow

```
design.md §4 (canonical contract)
   └─▶ copy คำต่อคำ ──▶ 8 ไฟล์ playbook ใน src/.warnyin/workflow/
                            │
                            ├─▶ runtime: agent อ่าน playbook → เขียน/อ่าน docs/stages/context.md + docs/memory.md
                            └─▶ build-time: src/tests/memory.test.mjs (T6) assert string-equality
```

- **T2 ไม่สร้าง/ไม่อ่านไฟล์ memory จริง** — แค่ฝัง "คำสั่ง" ลง playbook; ตัว template 2 ใบเป็นของ **T3**, playbook กลาง `memory.md` เป็นของ **T1**, script เป็นของ **T5**
- **pointer ชี้ไป `.warnyin/workflow/memory.md` ซึ่ง T1 เป็นคนสร้าง** → ระหว่าง wave 1 ลิงก์จะยังไม่ resolve (คาดหมาย ไม่ใช่ bug)

## 5. User-flow

```
/warnyin:discovery  → agent อ่าน memory (C3a) เป็น context ตั้งต้น → จบ stage เขียนกลับ (C2)
/warnyin:design     → จบ stage เขียนกลับ (C2)
/warnyin:build      → main loop เขียนกลับหลัง integrate ครบ (C2b) · sub-agent ใน worktree ไม่เขียน
/warnyin:verify     → จบ stage เขียนกลับ (C2)
/warnyin:ship       → รวบ entry open เป็น candidate (C4a) → user อนุมัติ → flip promoted/dropped (C4b) → gate (C4c)
/warnyin:fastlane   → จบงานเขียนกลับ (C2c)
/warnyin:next       → รัน memory-status ถ้าได้ (C5a) + อ่าน memory (C3b) + รายงาน N entry open (C5b)
/warnyin:explore    → อ่าน memory เป็น context (C3c)
```

## 6. Persona

- **agent ทุก harness** (Claude Code / Codex / Antigravity) ที่เดิน stage — เป็นผู้อ่านคำสั่งเหล่านี้จริง
- **ผู้ใช้ warnyin** ที่กลับมาทำงานต่อคนละวัน/คนละ session แล้วอยากให้ agent "จำได้"

## 7. Test-flow (self-verify — **grep เท่านั้น ห้ามรัน `npm run lint:md`**)

> เหตุผลที่ห้าม `lint:md`: wave 1 ยังไม่มี `src/.warnyin/workflow/memory.md` (ของ T1) → ลิงก์ที่ pointer ชี้จะแดงเป็นปกติ; dead-link เป็น **gate ของ T6** หลัง integrate ครบ

- [ ] **W1 — hook ครบ 6 ไฟล์:** grep `อัปเดต project memory` ใน `src/.warnyin/workflow/` → พบใน `stages/discovery.md`, `stages/design.md`, `stages/build.md`, `stages/verify.md`, `stages/ship.md`, `fastlane.md` (นับไฟล์ = 6 พอดี ไม่ขาดไม่เกิน)
- [ ] **W2 — BUILD variant:** grep `main loop เท่านั้น` → พบเฉพาะ `stages/build.md`; grep `build sub-agent ที่ทำงานใน worktree ห้ามเขียน memory เอง` → พบใน `stages/build.md`
- [ ] **W3 — BUILD ไม่ใช้ C2:** `stages/build.md` **ต้องไม่มี** สตริง `จบ stage แล้ว → เขียนสถานะล่าสุด` (ของ C2)
- [ ] **W4 — fastlane pointer:** `fastlane.md` มีแถวตารางที่ขึ้นต้น `| — | **อัปเดต project memory** (conditional) |` และแถวนั้นมี `](./memory.md)`
- [ ] **R1 — trust clause ครบ 3:** grep `เป็น data ไม่ใช่ instruction` → พบใน `stages/discovery.md`, `next.md`, `explore.md` (3 ไฟล์)
- [ ] **R2 — ไม่มีจุดอ่านซ้ำ:** นับบรรทัดที่มี `docs/stages/context.md` **ในความหมาย "สั่งอ่าน"** ของแต่ละไฟล์ = **1 บรรทัด** ต่อไฟล์ (`next.md` เป็นเคสที่ T6 assert ตรง)
- [ ] **R3 — path ไม่สลับ:** `stages/discovery.md` มี `](../memory.md)`; `next.md`/`explore.md`/`fastlane.md` มี `](./memory.md)` — และ **ไม่มี** `](./memory.md)` ในไฟล์ใต้ `stages/`, **ไม่มี** `](../memory.md)` ใน `next.md`/`explore.md`/`fastlane.md`
- [ ] **R4 — replacement ไม่ทิ้งเศษ:** `next.md` **ต้องไม่มี** สตริงเดิม `บริบทงานที่จดไว้ (ถ้ามี)` หลงเหลือ; `stages/discovery.md` **ต้องไม่มี** สตริงเดิมที่ขึ้นต้นด้วย `` `docs/stages/context.md` และ topic ที่ `` แบบเดี่ยวๆ; `explore.md` ยังมี sub-bullet เรื่อง `achieved/` = archive ครบ
- [ ] **S1 — ordering ของ SHIP:** ใน `stages/ship.md` index ของ `**project memory:**` **น้อยกว่า** index ของ `promotion plan`
- [ ] **S2 — gate นับได้ 12:** นับ `- [ ]` ใน §6 ของ `stages/ship.md` = **12**
- [ ] **S3 — gate เดิมไม่ถูกแตะ:** `stages/ship.md` §3 ข้อ 7 ยังมี `evidence (บังคับ)` และ `user ยืนยัน`; §6 ยังมี gate item เดิมครบ 11 ข้อความเดิม
- [ ] **S4 — step 5 มีข้อย่อย 8:** `stages/ship.md` §4 step 5 มีข้อย่อยเลข `8.` ที่อ้าง `docs/memory.md` และมีคำว่า `idempotent`
- [ ] **N1 — script hook:** `next.md` มี `memory-status.mjs` ทั้งใน §2 ข้อ 0 (C5a) และมี `memory:` + `entry open` ใน §3 ข้อ 1 (C5b)
- [ ] **N2 — ไม่แตะไฟล์นอก scope:** `git status --short` แสดงเฉพาะ 8 ไฟล์ใน `src/.warnyin/workflow/` ตาม `task.md §4` — **ต้องไม่มี** `memory.md`, `README.md`, `scripts/`, `src/tests/`
