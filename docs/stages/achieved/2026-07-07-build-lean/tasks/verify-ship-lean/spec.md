# Spec — verify-ship-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`docs` (workflow playbook + command adapter — ไม่มี runtime; ยืนยันด้วย observable artifact: grep/count บนไฟล์)

## 4. Data-flow
> receipt lifecycle ฝั่ง VERIFY/SHIP (canonical: design §3 + skip-list row ใน triage.md)

- VERIFY-lite: อ่าน acceptance จาก `receipt.md §2` → test เขียว → เติมผลลง `receipt.md §4` (ไม่สร้าง test.md/verify.md)
- SHIP-lite: เติม `receipt.md §3/§5` → สแกน diff เทียบ hard-floor 5 หมวด → archive ทั้งโฟลเดอร์; learned rule promote เฉพาะจาก §5 (evidence + user ยืนยัน)

## 7. Test-flow
> ยืนยันความถูกต้องด้วย grep/count เทียบก่อน/หลังแก้ (ไฟล์ทั้งหมดใต้ `src/`)

- [ ] **Gate item count เท่าเดิม (regression learning-loop-tuning + design §4.6):**
  - `verify.md` §6 → `- [ ]` = **7** item (เท่าก่อนแก้)
  - `ship.md` §6 → `- [ ]` = **10** item (เท่าก่อนแก้ — นับจากไฟล์จริง `awk Gate section | grep -c '^- \[ \]'`) — และ `ship.md §4` process ไม่ถูกแก้
- [ ] **hook ไม่ซ้ำ:** grep `★ fast-track hook` ใน `verify.md` = 1 · ใน `ship.md` = 1 (MODIFY ไม่ใช่ ADD)
- [ ] **wording block ตรง design §4.5 คำต่อคำ:** block `★ loop tuning (fix loop มี finding >1)` + `Loop-tuning report` ใน `verify.md §4 ข้อ 5` ตรงกับ `build.md §4 ข้อ 6` ทุกตัวอักษร (diff กันแล้วต่างแค่ indent/ตำแหน่ง) — build.md แก้โดย `build-stage-lean` wave เดียวกัน → เช็คข้อนี้ระดับ integration หลัง merge wave 2
- [ ] **pointer เป็น md link:** grep `](../loop-tuning.md)` เจอใน `verify.md` (markdown link — ไม่ใช่ inline code เปล่า); dead-link gate `lint:md` ต้อง resolve ได้หลัง merge wave — แดงเพราะไฟล์ข้าม slice ยังไม่ merge = integration gate ไม่ใช่ failure ของ task นี้
- [ ] **theory ไม่เหลือใน verify.md (negative grep):** "credit horizon" แบบเต็มพร้อมตัวเลือก — `· สั้น =` / `· ยาว =` / `⚠ update ถี่เกิน` / `⚠ batch ใหญ่` — **ต้องไม่เจอใน `verify.md`** (เจอเต็มได้เฉพาะ `loop-tuning.md`)
- [ ] **regression report note (spec learning-loop-tuning):** `verify.md` ยังมี enum `per-finding | batched` + "เหตุผล 1 บรรทัด" (บรรทัด report คงคำเดิม)
- [ ] **negative-grep เดิมยัง hold:** ตาราง default-by-tier (§2C) ไม่โผล่ใน `verify.md`/`ship.md` — pointer `[triage.md loop-tuning default](../triage.md)` เท่านั้น
- [ ] **hard-floor 5 หมวดใน ship.md:** grep hook ship-lite เจอครบ auth/authz · data-migration/schema · secret/credential · public-API/contract · security-sensitive + ข้อความ "เจอ → ห้าม ship-lite ต้อง upgrade" (ตาม triage §2B)
- [ ] **receipt lifecycle ใน hook:** `verify.md` hook มี "receipt §2" + "receipt §4" + ไม่สร้าง test.md/verify.md สำหรับ fast · `ship.md` hook มี "receipt §3/§5" + archive ทั้งโฟลเดอร์ + promote จาก receipt §5 (evidence + user ยืนยัน)
- [ ] **command adapter:** `src/.claude/commands/warnyin/{verify,ship}.md` มี fast path สั้นชี้ playbook (ไม่ duplicate skip-list/lifecycle)
