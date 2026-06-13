# Issue — design-stage-integration (T3)

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.9)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD

## 1. สรุป
- ผลสแกน: blocker 1 ข้อ · defer 1 ข้อ
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (resolve ใน DESIGN — task.md sub-task 2 + acceptance)

## 2. รายการ issue
| # | ประเภท | จุดที่พบ (ไฟล์/spec/โค้ด) | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | blocker→clarity | `src/.warnyin/workflow/stages/design.md:47-48` (§3 ข้อ 7/8) | legacy pointer `(ดูขั้นตอนข้อ 4.6)` / `(ดูขั้นตอนข้อ 4.10)` ใช้ format กำกวม — อ่านเป็น sub-step "4.6/4.10" ได้ ทั้งที่หมายถึง **§4 ข้อ 6 / §4 ข้อ 10**. T3 จะเติม panel note "panel = §4 step 6" ที่ §3 ข้อ 7 จุดเดียวกัน → ถ้าคง format เดิม note ใหม่จะดูขัดกับ pointer เดิมในย่อหน้าเดียว + build agent เสี่ยงตีความผิด/แก้เกิน scope | **ตรวจความหมายแล้ว: 4.6/4.10 ถูก** (= §4 ข้อ 6/10 = panel step 6 / dry-run step 10 ตรง). ไม่ใช่ correctness bug → **demote เป็น clarity fix**: แก้ format `ข้อ 4.6`→`§4 step 6`, `ข้อ 4.10`→`§4 step 10` ในขณะ T3 แตะ §3 ข้อ 7/8 อยู่แล้ว (scoped, ความหมายเดิม). ระบุใน task.md sub-task 2 + acceptance + §4 ขอบเขต. **ห้ามแก้อย่างอื่นใน 2 ข้อ** (กัน diff เกิน) | resolved |
| 2 | defer | `design.md §10B/§10D` (canonical wording) | pointer ใน canonical block เขียนเป็น **backtick inline** (`` `roles/ux.md` ``) ไม่ใช่ markdown-link `[](path)` → `lint-md.mjs` ไม่ตรวจ path เหล่านี้ → lint เขียวไม่การันตี pointer ถูก | รับทราบ — verify อาศัย **verify-method 2** (agent อิสระ structural, spec.md §7B) เป็นหลักตามที่ design §8 ระบุแล้ว; BUILD ต้องรู้ตัวว่า "lint เขียว ≠ pointer ถูก" → ตรวจ path ใน backtick ด้วยตา | tracked |

## 3. ผลการแก้ไข
- **BLOCKER-1 → resolved ใน DESIGN** (ไม่ต้อง rerun dry-run — แก้ที่ spec/task ไม่แตะ source):
  - `task.md` sub-task 2 เพิ่มขั้น clarity fix (format `4.6→§4 step 6`, `4.10→§4 step 10`, ความหมายเดิม, ห้ามแก้อื่น)
  - `task.md` §4 ขอบเขต + §5 acceptance เพิ่มข้อ clarity fix (scoped diff)
- **DEFER-2 → tracked** ใน acceptance (verify-method 2 อิสระ จับ pointer ผิดใน backtick); user รับทราบ
- **T1/T2 dry-run: ผ่าน** ไม่มี blocker (T1 defer: promote `generator` รอ SHIP + guard placement ยืดหยุ่น; T2 defer: copy blueprint drop `.blueprint` — path ปลายทางชัด) — track ใน rule.md/spec ของแต่ละ task แล้ว
- **ไม่มี blocker ค้าง** → พร้อมเข้า BUILD
