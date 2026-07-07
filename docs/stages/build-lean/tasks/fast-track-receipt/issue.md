# Issue — fast-track-receipt (ผล dry-run)

## 1. สรุป
ไม่มี hard blocker — มี 3 defer ที่เก็บลง task แล้ว + watch-point ระดับ execution

## 2. รายการ issue
| # | ชนิด | รายละเอียด | สถานะ |
|---|---|---|---|
| 1 | defer | ตำแหน่งแทรก fast path ใน §4 ไม่ระบุ — เสี่ยง agent วางคนละที่ | ✅ เก็บแล้ว — pin "branch หลัง step 1.5" ใน sub-task 2 |
| 2 | defer | stale "fast = 1 task เขียนเอง" ค้างที่ `stages/design.md:102,:115` + `commands/warnyin/design.md:21` — ขัดโมเดลใหม่ | ✅ เก็บแล้ว — เพิ่ม reconcile ใน sub-task 2 + 5 |
| 3 | defer | anchor เพี้ยน pre-existing `stages/design.md:157` ("§3B" ที่จริงคือ §2B) | ✅ เก็บแล้ว — opportunistic fix ใน sub-task 2 |
| 4 | contract | H1 ของ template ต้องมี `<...>` placeholder (contract กับ validator `isFilled` — จาก dry-run validator-receipt) | ✅ เก็บแล้ว — pin ใน sub-task 3 + design §3 |

## 3. ผลการแก้ไข
ทุกข้อถูก fold เข้า task.md แล้ว — ไม่มี blocker ค้าง; watch-point (route string ต่อเนื่อง, caps เว้นวรรค, §2C ห้ามรั่ว) อยู่ใน spec/standard แล้ว
