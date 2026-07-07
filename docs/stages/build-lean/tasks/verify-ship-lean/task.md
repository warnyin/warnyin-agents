# Task — verify-ship-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `verify-ship-lean` |
| **Slice อ้างอิง** | `design.md` slice #3 |
| **Component** | `installer` (repo นี้เอง — แก้เฉพาะ `src/**`) |
| **Model tier** | `balanced` |
| **สถานะ** | `build done` |

## 1. เป้าหมายของ task (vertical slice)

VERIFY และ SHIP **รู้จัก receipt lifecycle ของ fast tier** (design §3): verify-lite เติมผลลง receipt §4, ship-lite เติม §3/§5 + hard-floor scan + archive — และ **★ loop-tuning theory ย้ายออกจาก `verify.md`** เหลือ canonical wording block (design §4.5) ชี้ `loop-tuning.md`

**งานนี้เป็น MODIFY hook/block ที่มีอยู่ทั้งหมด — ไม่ใช่ ADD** (ห้ามมี fast-track hook ซ้ำ 2 อันในไฟล์เดียว — แก้ของเดิม in-place)

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- ต้องทำหลัง: `tasks/loop-tuning-extract` (wave 1 — เพราะ wording block ใหม่มี md link `../loop-tuning.md` → dead-link gate ต้องเห็นไฟล์ `src/.warnyin/workflow/loop-tuning.md` จริงบน build branch ก่อน) → **task นี้อยู่ wave 2**
- ปลดล็อกให้: `tasks/release-hygiene` (wave 3 — สรุป CHANGELOG จากผลทุก slice)
- ส่ง output อะไรต่อให้ task ถัดไป: `verify.md`/`ship.md` + command adapter เวอร์ชัน lean (เป็น input ให้ CHANGELOG entry)

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)

- [x] 1. **`src/.warnyin/workflow/stages/verify.md` — MODIFY ★ fast-track hook เดิม (บรรทัด 14)** — anchor ของเดิม (quote เพื่อ investigate-before-edit — แก้บรรทัดนี้ in-place):
  ```
  > **★ fast-track hook:** ถ้า topic เป็น tier `fast` (จาก `/warnyin:triage`) → **verify-lite** ตาม [fast-track skip-list](../triage.md#fast-track-skip-list) — functional ตาม spec + test เขียว, ข้าม empirical/panel ที่ไม่เกี่ยว; **correctness floor คงไว้ — test ต้องเขียวจริง**. tier `standard`/`large` → flow เต็มด้านล่าง (hook นี้ N/A ไม่ลด bar)
  ```

  แก้เป็น verify-lite ตาม skip-list row VERIFY (design §4.1): **functional ตาม acceptance ใน receipt §2 + test เขียว → เติมผลลง receipt §4** — **ไม่สร้าง `test.md`/`verify.md` สำหรับ fast** (ผลอยู่ใน receipt แทน); **คง correctness floor "test ต้องเขียวจริง"** + คง link `[fast-track skip-list](../triage.md#fast-track-skip-list)` เดิม (canonical อยู่ triage.md) — _ผลลัพธ์:_ hook เดิมอันเดียว อธิบาย receipt lifecycle ฝั่ง VERIFY
  - บรรทัด 15 (loop-tuning proxy note ใต้ hook) **คงเดิม** — ยังชี้ §4 ข้อ 5 ถูกต้องหลังแก้
- [x] 2. **`verify.md` §4 ข้อ 5 — แทน ★ theory block ด้วย canonical wording block (design §4.5) คำต่อคำ** — ★ theory block เดิม (บรรทัด 58-65: เริ่ม `**★ loop tuning (fix loop มี finding >1)** — จาก paper "iterative generative optimization"...` จนถึงบรรทัด `- default-by-tier: ดู [triage.md loop-tuning default](../triage.md)`) → แทนด้วยบรรทัดแรกของ block §4.5:
  ```
  - **★ loop tuning (fix loop มี finding >1)** — วิธีตัดสิน credit horizon / experience batching + ⚠ ดู [`loop-tuning`](../loop-tuning.md); default-by-tier: ดู [triage.md loop-tuning default](../triage.md)
  ```
  ส่วน `- Loop-tuning report (...)` 4 บรรทัด (บรรทัด 66-69) **ตรงกับ design §4.5 อยู่แล้ว — ห้ามแตะ** (spec learning-loop-tuning grep enum `per-finding | batched` + "เหตุผล 1 บรรทัด" คำเดิม); indent ปรับตามตำแหน่ง nesting เดิมใน §4 ข้อ 5 แต่ **wording คำต่อคำตาม §4.5 ห้ามแต่งใหม่**; **ห้ามแตะ Gate §6** (7 item เท่าเดิม) — _ขึ้นกับ 1 (ไฟล์เดียวกัน):_ theory เต็มเหลือไฟล์เดียวที่ `loop-tuning.md`
- [x] 3. **`src/.warnyin/workflow/stages/ship.md` — MODIFY ★ fast-track hook เดิม (บรรทัด 17)** — anchor ของเดิม:
  ```
  > **★ fast-track hook:** ถ้า topic เป็น tier `fast` (จาก `/warnyin:triage`) → **ship-lite** ตาม [fast-track skip-list](../triage.md#fast-track-skip-list) — promote เฉพาะที่มี (อาจไม่มี learned-rule), archive ครบ; **correctness floor คงไว้ — archive ครบ + ไม่แตะ rule กลางมั่ว**. tier `standard`/`large` → flow เต็มด้านล่าง (hook นี้ N/A ไม่ลด bar)
  ```

  แก้เป็น ship-lite ตาม skip-list row SHIP (design §4.1): **เติม receipt §3/§5 → สแกน diff เทียบ hard-floor 5 หมวด (auth/authz · data-migration/schema · secret/credential · public-API/contract · security-sensitive — เจอ → ห้าม ship-lite ต้อง upgrade ตาม triage §2B) → archive ทั้งโฟลเดอร์**; promote learned rule **เฉพาะที่มีใน receipt §5** (evidence + user ยืนยัน — ตามหลัก §3 ข้อ 7 เดิม); **คง floor "receipt ครบทุก section + archive ครบ + ไม่แตะ rule กลางมั่ว"** + คง link skip-list เดิม; **ห้ามแตะ §4 process และ Gate §6** (10 item เท่าเดิม — นับจากไฟล์จริง) — _ผลลัพธ์:_ hook เดิมอันเดียว อธิบาย ship-lite + hard-floor scan
- [x] 4. **`src/.claude/commands/warnyin/{verify,ship}.md` — เพิ่ม fast path สั้น** — adapter บาง: เพิ่ม 1-2 บรรทัดว่า tier `fast` → verify-lite / ship-lite ตาม hook ใน playbook (`stages/verify.md` / `stages/ship.md`) — **ชี้ playbook ไม่ duplicate เนื้อหา skip-list/lifecycle** — _ขึ้นกับ 1,3:_ adapter สอดคล้อง hook ใหม่

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

- `src/.warnyin/workflow/stages/verify.md` (MODIFY: hook บรรทัด 14 + §4 ข้อ 5 theory block)
- `src/.warnyin/workflow/stages/ship.md` (MODIFY: hook บรรทัด 17 เท่านั้น)
- `src/.claude/commands/warnyin/verify.md`, `src/.claude/commands/warnyin/ship.md` (เพิ่ม fast path สั้น)
- **ห้ามแตะ:** root dogfood (`.warnyin/`, `.claude/` ที่ root — gitignored), `triage.md` (slice 1 เจ้าของ), `build.md` (slice 2), `loop-tuning.md` (slice 4)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)

- [x] hook ทั้งสองไฟล์เป็น **การแก้ของเดิม in-place** — grep `★ fast-track hook` เจอ **1 ครั้งต่อไฟล์** (ไม่มี hook ซ้ำ 2 อัน)
- [x] wording block ใน `verify.md §4 ข้อ 5` ตรง design §4.5 **คำต่อคำ** (pointer เป็น md link `../loop-tuning.md` — ไม่ใช่ inline code)
- [x] **Gate item count เท่าเดิม:** `verify.md §6` = 7 `- [ ]` · `ship.md §6` = 10 `- [ ]` (นับจากไฟล์จริง — dry-run ยืนยัน)
- [x] theory ไม่เหลือใน `verify.md` — ไม่มี "credit horizon" แบบเต็ม (ตัวเลือก ·/⚠) เหลืออยู่
- [x] hard-floor scan 5 หมวด + upgrade ตาม §2B อยู่ใน ship-lite hook
- [x] ผ่าน test ตาม `spec.md` (test-flow)
- [x] ทำตาม `rule.md` และ `standard.md`
- **note `lint:md`:** pointer `../loop-tuning.md` ต้องมีไฟล์จริง — wave 2 มีแล้ว (loop-tuning-extract = wave 1); ถ้า lint แดงเพราะไฟล์ข้าม slice ยังไม่ merge = **integration gate หลัง merge ทั้ง wave ไม่ใช่ failure ของ task นี้** (design §6)

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
