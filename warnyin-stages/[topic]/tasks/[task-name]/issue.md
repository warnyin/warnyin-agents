# Issue — <ชื่อ task>

> Output ของ DESIGN dry-run · playbook: `workflow/stages/design.md` (ข้อ 4.9)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD — **สร้างเฉพาะเมื่อพบ issue**

## 1. สรุป
- ผลสแกน: blocker __ ข้อ · defer __ ข้อ
- สถานะรวม: ☐ แก้ครบ ไม่มี blocker ค้าง / ☐ มี blocker ค้าง (ห้ามเข้า BUILD)

## 2. รายการ issue
| # | ประเภท | จุดที่พบ (ไฟล์/spec/โค้ด) | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | blocker / defer | | | | open / resolved |

> - **blocker** — ทำให้ implement ตาม spec ไม่ได้ (ขัดแย้งกับโค้ดจริง/task อื่น, ข้อมูลขาด, dependency ผิด) → ต้องแก้ DESIGN ก่อนเข้า BUILD
> - **defer** — ตัดสินใจ/ทำทีหลังได้ ไม่ block การเริ่ม BUILD แต่ต้องบันทึกและให้ user รับทราบ

## 3. ผลการแก้ไข
<!-- แก้อะไรใน design.md / task ไหนบ้าง + ผล rerun dry-run; ข้อสรุปจากการสัมภาษณ์ user (ถ้ามี) -->
