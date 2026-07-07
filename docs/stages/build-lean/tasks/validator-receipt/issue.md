# Issue — validator-receipt (ผล dry-run)

## 1. สรุป
ไม่มี hard blocker — implement + test ได้แบบ contract-first; มี 1 contract gap ข้าม task ที่ปิดแล้ว

## 2. รายการ issue
| # | ชนิด | รายละเอียด | สถานะ |
|---|---|---|---|
| 1 | contract | design §3 ไม่ pin H1 ของ receipt template — ถ้าบรรทัดแรกเป็น meta table (ไม่มี `<...>`) `isFilled` จะมองว่า template = filled → topic ที่เพิ่ง copy โดน detect เป็น fast ผิด | ✅ ปิดแล้ว — design §3 pin H1 `# Receipt — <ชื่อ change>` + fast-track-receipt sub-task 3 pin ตาม |
| 2 | defer | mixed topic จะ match ทั้ง row DESIGN + fast-track ใน next.md (ambiguity เชิงอ่าน) — validator จัดการด้วย ⚠ C6 อยู่แล้ว | รับทราบ |

## 3. ผลการแก้ไข
contract gap ปิดครบ — ไม่มี blocker ค้าง เข้า BUILD ได้; แนวทาง C6/`stage:'fast-track'`/helper ร่วมกับ C2 ตาม dry-run ถูกยืนยันว่า integrate ได้จริง
