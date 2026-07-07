# Issue — verify-ship-lean (ผล dry-run)

## 1. สรุป
dry-run พบ 1 blocker (doc/AC error) + 2 defer — blocker แก้แล้ว

## 2. รายการ issue
| # | ชนิด | รายละเอียด | สถานะ |
|---|---|---|---|
| 1 | blocker | `task.md` pin `ship.md §6` = 9 item แต่ไฟล์จริง = 10 (spec.md ถูกอยู่แล้ว) — เสี่ยง implementer ลบ item ให้เหลือ 9 | ✅ แก้แล้ว — task.md 2 จุด → 10 |
| 2 | defer | design §3 lifecycle บอก BUILD+VERIFY เติม §3+§4 แต่ §4.1/task บอก SHIP เติม §3/§5 — ตีความ "SHIP ensure §3 ครบ" ได้ ไม่ขัด implement | รับทราบ — reconcile ตอน integrate |
| 3 | defer | lint:md dead-link `../loop-tuning.md` + wording-parity กับ build.md = integration gate หลัง merge wave | รับทราบ — ระบุใน task แล้ว |

## 3. ผลการแก้ไข
blocker ปิดครบ — ไม่มี blocker ค้าง เข้า BUILD ได้
