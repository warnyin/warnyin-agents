# Build Report — <ชื่อ change>

> Output ของ BUILD stage · playbook: `warnyin/workflow/stages/build.md`
> รายงานผลการ implement ต่อ task + การ integrate

| | |
|---|---|
| **Slug** | `<kebab-case>` |
| **Build branch** | `<branch>` |
| **Isolation** | `worktree` / `shared-tree` |
| **วันที่** | `YYYY-MM-DD` |
| **ผลรวม** | ผ่าน __ / ล้ม __ / ทั้งหมด __ task |

## 1. Execution plan (waves ตาม dependency)
```
wave 1 (parallel): task-a, task-b
wave 2:            task-c  (ขึ้นกับ task-a)
wave 3:            task-d  (ขึ้นกับ task-b, task-c)
```

## 2. ผลต่อ task
| Wave | Task | สถานะ | Test/Lint | ไฟล์ที่แก้ | Branch | หมายเหตุ |
|---|---|---|---|---|---|---|
| 1 | task-a | ✅ passed | | | | |
| 1 | task-b | ❌ failed | | | | เหตุผล... |

## 3. Integration notes
- การ merge แต่ละ wave / conflict ที่เจอและวิธีแก้:

## 3.5 Full build & test gate (หลัง integrate ทุก wave)
> รัน build ทั้งหมด + test suite ทั้งหมด (รวม unit test) บน build branch — ต้องเขียวหมดก่อนปิด BUILD

| Component | Build | Unit test | Test อื่น | รอบที่แก้ |
|---|---|---|---|---|
| api-service | ✅ / ❌ | ผ่าน __/__ | | |
| admin-console | | | | |

- error ที่เจอตอนรวม + วิธีแก้:

## 4. ปัญหา/ค้าง (ถ้ามี)
- task ที่ล้ม + สาเหตุ + แผนแก้:

## 5. Rule/standard ใหม่ที่ note ไว้ (รอ SHIP)
> รวบรวมจาก `tasks/<task>/rule.md` และ `standard.md` — รอ SHIP อัปเดตไฟล์กลางใน `docs/`
-

## 6. ปัญหายาก/ซ้ำที่เจอ
> บันทึกละเอียดที่ `./troubleshooting.md` (SHIP ยกขึ้น `docs/troubleshooting.md`)
- ดู `./troubleshooting.md`

## ✅ Gate → VERIFY (ดู `warnyin/workflow/stages/build.md` ข้อ 7)
- [ ] ทุก task implement + merge เข้า build branch แล้ว
- [ ] ทุก task `passed` (test/build เขียว) ไม่มี `failed` ค้าง
- [ ] ไม่มี merge conflict ค้าง
- [ ] Full build ของทุก component ผ่าน (ไม่มี build error)
- [ ] test suite ทั้งหมด (รวม unit test) เขียวหมดบน build branch
- [ ] build.md สรุปครบทุก task + ผล full build/test
- [ ] ไม่แตะ rule/standard กลางใน docs/
