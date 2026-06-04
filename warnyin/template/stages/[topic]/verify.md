# Verify Report — <ชื่อ change>

> Output ของ VERIFY stage · playbook: `warnyin/workflow/stages/verify.md`
> สรุปผลการ verify ตามจุดประสงค์ของ topic + การแก้ไขที่เกิดขึ้น

| | |
|---|---|
| **Slug** | `<kebab-case>` |
| **วันที่** | `YYYY-MM-DD` |
| **ผลรวม** | ผ่าน / ไม่ผ่าน |
| **จำนวนรอบการแก้ไข (fix iterations)** | __ รอบ |
| **จำนวนจุดที่แก้** | __ จุด |

## 1. จุดประสงค์ที่ verify (จาก spec/tasks)
-

## 2. ผลการเทส
| # | Test case / flow | ชนิด | ผล | หมายเหตุ |
|---|---|---|---|---|
| 1 | | functional / e2e / uxui | ✅ / ❌→✅ (แก้แล้ว) | |

## 3. UX/UI verify (ถ้าเป็น FE)
- [ ] layout / states / responsive / user-flow — ผล:

## 4. รายการแก้ไข (สรุปการแก้ระหว่าง verify)
> นับรวมเป็น "จำนวนการแก้ไข" ด้านบน

| รอบ | ปัญหาที่เจอ | วิธีแก้ | ไฟล์ที่แก้ |
|---|---|---|---|
| 1 | | | |

## 5. ปัญหายาก/ซ้ำ → troubleshooting
- บันทึกไว้ที่ `./troubleshooting.md` (SHIP ยกขึ้น `docs/troubleshooting.md`): มี/ไม่มี

## 6. หมายเหตุถึง user (ถ้าถามระหว่างทาง)
> กรณีวนแก้นาน/หลายรอบ แล้วถาม user — สรุปคำถาม/คำตอบ/การตัดสินใจ
-

## ✅ Gate → SHIP (ดู `warnyin/workflow/stages/verify.md` ข้อ 6)
- [ ] เทสตามจุดประสงค์ครบ (functional)
- [ ] FE: UX/UI verify ผ่าน
- [ ] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่าน
- [ ] test.md + verify.md เขียนครบ
- [ ] ปัญหายากบันทึก troubleshooting.md แล้ว
