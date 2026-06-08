# Design (How) — context.md working-memory (Gap A)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture**

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` (`src/bin/cli.mjs` scaffold) + **playbook กลาง** (`src/.warnyin/workflow/`) + **template** (`src/.warnyin/template/`)
- **แนวทางหลัก:** context.md = **working-notes ข้าม topic** (เฉพาะส่วนที่ folder derive ไม่ได้). 2 จุดที่ต้องอุด: (1) ให้มี skeleton ตอน scaffold, (2) ให้ SHIP เป็น producer. status board ปล่อยให้ `next.md` derive (honors `unify-in-place`)

## 2. Vertical slices
| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **ติดตั้งแล้วได้ context.md ที่มีโครง** — template skeleton + installer seed (seed-if-absent) + test | template · installer(cli.mjs) · test | `tasks/context-skeleton-seed/` |
| 2 | **context.md ถูก maintain จริง** — SHIP เป็น producer + readers รู้ว่ามันคือ working-notes | playbook (ship/next/discovery/explore) | `tasks/ship-maintenance-wiring/` |

## 3. Data model / schema — context.md (canonical ★)
> นิยาม canonical ที่เดียวที่นี่ — task/template/playbook **copy ตามนี้ ห้ามแต่งใหม่** (`canonical-copy convention`)

โครง `docs/stages/context.md` (working-notes — ทุก section "derive ไม่ได้"):
```markdown
# Context — working memory (ข้าม topic)

> ความจำใช้งานข้าม topic — เฉพาะสิ่งที่ derive จากโครง folder ไม่ได้
> สถานะ topic ว่าอยู่ stage ไหน → ใช้ /warnyin:next (derive จากไฟล์จริง) ไม่จดที่นี่

## โฟกัส/ธีมปัจจุบัน
> กำลังโฟกัสอะไรอยู่ตอนนี้ (1-3 บรรทัด) — DESIGN/DISCOVERY อัปเดตเมื่อโฟกัสขยับ
-

## Decision ข้าม topic
> การตัดสินใจที่ไม่สังกัด topic เดียว (มีผลหลาย topic) — มีวันที่
| วันที่ | decision | เหตุผล/ที่มา |
|---|---|---|

## Parking lot
> ไอเดีย/สิ่งที่ค่อยกลับมาทำ (ยังไม่เป็น topic) — ใครก็ jot ได้
-

## เพิ่ง ship (ล่าสุด N รายการ)
> SHIP append ตอน archive — เก่าเกิน N ตัดออก (ราย topic เต็มอยู่ใน achieved/ แล้ว)
| วันที่ | slug | ไฮไลต์ (1 บรรทัด) |
|---|---|---|
```
- **N (จำนวน recently-shipped ที่เก็บ):** `5` (พอเห็นบริบทล่าสุด ไม่บวม — รายละเอียดเต็มอยู่ `achieved/`)

## 4. Interface / contract
- **installer seed (cli.mjs):** ตอน scaffold ถ้า `docs/stages/context.md` **ไม่มี** → เขียนเนื้อหาจาก template `.warnyin/template/stages/context.md`; **มีอยู่แล้ว → skip (ห้ามทับ)**; เคารพ `DRY` + `stats` เดิม
  - seed จาก **template dir** (`.warnyin/template/`) = scaffold material ที่ ship มากับ package — **ไม่ใช่** copy `docs/stages/` ของ repo ต้นทาง (กัน scaffold-leak ตาม installer rule §4)
  - context.md **ห้ามอยู่ใน `CORE`** (CORE ถูก overwrite ตอน `--update`) — ต้องอยู่ใน ensureScaffold path (seed-if-absent) เพื่อกันทับ working-notes ของ user
- **SHIP producer contract (ship.md):** ขั้นตอน archive (playbook §4) → หลังย้าย topic ไป achieved/ ให้ append 1 แถวใน "เพิ่ง ship" (`วันที่ | slug | ไฮไลต์`) + prune เหลือ N ล่าสุด; ถ้าโฟกัสโปรเจกต์ขยับ → อัปเดต "โฟกัส/ธีมปัจจุบัน"; ถ้า section/ไฟล์ไม่มี → สร้างจาก canonical (robust)

## 5. Flow
- **data-flow:** `SHIP archive → เขียน context.md` ⟶ `DISCOVERY/EXPLORE/NEXT อ่าน context.md` (orient เร็ว); DESIGN/DISCOVERY อัปเดตโฟกัส/decision; user jot parking-lot ได้ทุกเมื่อ
- **user-flow:** กลับมาทำงาน → `/warnyin:next` (status board, derived) + อ่าน context.md (โฟกัส/decision/parking-lot) → เข้าใจบริบทครบโดยไม่ต้องรื้อ folder

## 6. ผลกระทบต่อระบบเดิม
- `next.md` คง read-only เด็ดขาด (§4.1) — แค่ปรับ wording ว่า context.md = working-notes (ไม่เพิ่มหน้าที่เขียน)
- `validate-topic.mjs` SKIP context.md อยู่แล้ว (`:242`) — **ไม่แตะ**
- `verify-pack`: template ใหม่อยู่ใต้ `src/.warnyin/` → อยู่ใน `ALLOWED_PREFIX` แล้ว **ไม่ต้องแก้**
- backward-compat: target เก่าที่มี context.md ว่าง (`''`) อยู่แล้ว → installer `--update`/install ครั้งถัดไป **ไม่ทับ** (มีไฟล์อยู่ = skip); user ที่อยากได้ skeleton ลบไฟล์ว่างแล้ว install ใหม่ หรือ copy จาก template เอง (note ใน CHANGELOG)

## 7. Dependency ระหว่าง slice/task
```
context-skeleton-seed ──▶ ship-maintenance-wiring
(template + installer)     (ship producer อ้าง section จาก canonical/skeleton)
```
- task-2 อ้าง section ของ context.md ที่ task-1 สถาปนา → ทำ task-1 ก่อน (sequential)

## 8. Test strategy ระดับ design
- **task-1 (installer):** `node:test` black-box ตาม `installer.test.mjs` harness — (a) install ใน temp → `docs/stages/context.md` มีอยู่ + **non-empty** (มี header canonical) (b) มี context.md เนื้อหาเดิมอยู่ → install/`--update` แล้ว **byte-equal เดิม** (skip, ไม่ทับ) (c) `--dry-run` ไม่เขียนจริง
- **task-2 (playbook = markdown):** ไม่มี unit; ยืนยันด้วย VERIFY (dogfood: รัน SHIP จริงแล้ว context.md ได้ row + structural `validate-topic.mjs` ผ่าน) + เช็ค wording readers สอดคล้อง canonical

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> ไม่มี feature เดิมชื่อ context-working-memory ใน `docs/features/` → ทั้งหมดเป็น **ADDED** (feature ใหม่; SHIP สร้าง `docs/features/context-working-memory/spec.md`)

### ADDED
#### Requirement: context.md scaffolded ด้วย skeleton (→ feature: context-working-memory)
installer ต้อง scaffold `docs/stages/context.md` ด้วยโครง working-notes (canonical §3) เมื่อไฟล์ยังไม่มี — **ห้ามทับ** ถ้ามีอยู่แล้ว (ทั้ง install และ `--update`)
- Scenario: target ไม่มี context.md → install → ได้ context.md ที่มี 4 section (โฟกัส/decision/parking-lot/เพิ่ง ship)
- Scenario: target มี context.md เนื้อหาเดิม → install/`--update` → เนื้อหาเดิมคงอยู่ byte-equal (skip)

#### Requirement: SHIP เป็น producer ของ context.md (→ feature: context-working-memory)
ตอน SHIP archive topic → append ไฮไลต์ 1 บรรทัดใน "เพิ่ง ship" (วันที่|slug|ไฮไลต์) + prune เหลือ N=5 ล่าสุด; อัปเดต "โฟกัส/ธีมปัจจุบัน" ถ้าขยับ
- Scenario: ship topic X → context.md "เพิ่ง ship" มีแถวของ X ชี้ achieved/
- Scenario: มี >5 แถว → เหลือ 5 ล่าสุด

#### Requirement: context.md = working-notes ไม่ใช่ status board (→ feature: context-working-memory)
context.md เก็บเฉพาะสิ่งที่ derive จาก folder ไม่ได้ (โฟกัส/decision ข้าม topic/parking-lot/ไฮไลต์ ship); สถานะ topic-stage ยัง derive โดย `next.md` (ไม่ซ้ำ); `next.md` คง read-only ต่อ context.md
- Scenario: เปิด /warnyin:next → status board มาจากการ scan folder ไม่ใช่จาก context.md
