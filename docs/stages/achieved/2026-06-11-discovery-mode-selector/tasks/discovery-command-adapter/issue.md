# Issue — discovery-command-adapter

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 10)
> ผลสแกนหา defer/blocker ก่อนเข้า BUILD

## 1. สรุป
- ผลสแกน: blocker **0** ข้อ · defer **3** ข้อ
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (พร้อมเข้า BUILD)

## 2. รายการ issue
| # | ประเภท | จุดที่พบ | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | contract §4.2 anchor (cross-task) | Task B ชี้ section anchor ที่ Task A สร้าง — resolve ได้หลัง integrate ทั้งคู่; ถ้า Task A เปลี่ยนชื่อ section → anchor ตาย | contract §4.2 fix ชื่อ "Discovery modes (ความเข้มของ Discovery)" แล้ว — VERIFY รัน anchor-resolve หลัง integrate (มี cover §8.2) | open (VERIFY-time) |
| 2 | defer | grill regression (cross-task) | grill ใน command บรรทัด 17 + playbook §3 → fold เป็น alias ละเอียด; section grill ใน playbook เป็นของ Task A | VERIFY QA-S2 ยืนยันไม่เหลือ behavior grill ซ้ำ | open (VERIFY-time) |
| 3 | defer | design §8.2 Infra-1 | VERIFY ที่เดิน Discovery จริงต้องชี้ playbook `src/` ที่เพิ่งแก้ (หรือ setup:sandbox) ไม่ใช่ root dogfood stale | track ตอน VERIFY กัน false-green | open (VERIFY-time) |

## 3. ผลการแก้ไข
ไม่มี blocker. dry-run ยืนยัน: command `discovery.md` extend mode-select แบบ additive ได้ (frontmatter `argument-hint` อัปเดตได้, flow เดิมไม่กระทบ), keyword map ไม่ inline behavior (เส้นแบ่ง alias vs behavior ชัด), README capability tree (บรรทัด 46) เพิ่ม mode ได้, file-ownership disjoint กับ Task A จริง. defer ทั้ง 3 เป็น cross-task integration ที่ตรวจตอน VERIFY (มี coverage ใน design §8.2 แล้ว).
