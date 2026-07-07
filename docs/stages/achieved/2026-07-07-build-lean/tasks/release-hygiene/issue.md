# Issue — release-hygiene (ผล dry-run)

## 1. สรุป
dry-run พบ 1 blocker จริง (version pin ชน release train) + 1 ข้อกล่าวหาที่ตรวจแล้วไม่จริง — แก้แล้ว

## 2. รายการ issue
| # | ชนิด | รายละเอียด | สถานะ |
|---|---|---|---|
| 1 | blocker | pin `0.21.0→0.22.0` ชนของจริง: `origin/release/0.23.0` ใช้ 0.22.0/0.23.0 ไปแล้ว (publish npm) — main ค้างที่ 0.21.0 เฉพาะ CHANGELOG/version parity | ✅ แก้แล้ว — re-pin **0.24.0** + precondition merge `origin/release/0.23.0` เข้า build branch ก่อน bump + entry แทรกเหนือ `[0.23.0]` (task/spec/standard ครบ 3 ไฟล์) |
| 2 | refuted | ข้อกล่าวหา "loop-tuning block ยังไม่อยู่บน main → slice 4 ไม่มีอะไรให้ extract" — ตรวจ git แล้ว**ไม่จริง**: เนื้อโค้ด/playbook ship อยู่บน main แล้ว (grep เจอใน `src/`) ที่ตามหลังมีแค่ CHANGELOG/version | ✅ ปิด — ไม่ต้องแก้อะไรเพิ่ม |
| 3 | defer | ผล gate 4 ตัว + MIN_PASS หลังเพิ่ม test — ประเมินได้หลัง integrate จริง (sequencing ปกติของ wave 3) | รับทราบ |

## 3. ผลการแก้ไข
blocker ปิดครบ — ไม่มี blocker ค้าง เข้า BUILD ได้
