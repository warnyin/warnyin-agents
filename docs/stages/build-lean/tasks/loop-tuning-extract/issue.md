# Issue — loop-tuning-extract (ผล dry-run)

## 1. สรุป
ไม่มี blocker — theory 2 ที่ byte-identical merge trivial; มี 1 trap + 2 defer ระดับ SHIP

## 2. รายการ issue
| # | ชนิด | รายละเอียด | สถานะ |
|---|---|---|---|
| 1 | trap | copy verbatim จะพา `../triage.md` (path จาก `stages/`) มาด้วย — ไฟล์ใหม่อยู่ `workflow/` ต้อง rewrite เป้า link (`triage.md` sibling) | รับทราบ — standard.md §3 ระบุ path ถูกแล้ว + acceptance T4 จับได้ |
| 2 | defer | `docs/features/learning-loop-tuning/feature.md:18,:31` + `docs/codemap/index.md:39` อ้างตำแหน่ง theory เดิม — จะ stale หลัง wave 2 | ✅ เก็บแล้ว — เพิ่ม note สำหรับ SHIP ใน design §9 |
| 3 | defer | `docs/rule.md` loop-tuning convention ข้อ why-location จะ stale | ✅ เก็บแล้ว — rule.md §2 ของ task นี้เสนอ update ตอน SHIP |

## 3. ผลการแก้ไข
ไม่มี blocker ค้าง เข้า BUILD ได้
