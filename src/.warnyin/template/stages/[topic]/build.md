# Build Report — <ชื่อ change>

> Output ของ BUILD + VERIFY stage · playbook: `.warnyin/workflow/stages/build.md`
> รายงานผลการ implement + verify ต่อ topic — artifact เดียว 4 section

| | |
|---|---|
| **Slug** | `<kebab-case>` |
| **Build branch** | `<branch>` |
| **Isolation** | `worktree` / `shared-tree` |
| **วันที่** | `YYYY-MM-DD` |
| **ผลรวม BUILD** | ผ่าน __ / ล้ม __ / ทั้งหมด __ task |

## 1. ผล build ต่อ task

### Execution plan (waves ตาม dependency)
```
wave 1 (parallel): task-a, task-b
wave 2:            task-c  (ขึ้นกับ task-a)
```

### ผลต่อ task
| Wave | Task | สถานะ | Test/Lint | ไฟล์ที่แก้ | Branch | หมายเหตุ |
|---|---|---|---|---|---|---|
| 1 | task-a | ✅ passed | | | | |
| 1 | task-b | ❌ failed | | | | เหตุผล... |

### Rule/standard ใหม่ที่ note ไว้ (รอ SHIP)
> รวบรวมจาก `tasks/<task>/rule.md` และ `standard.md` — รอ SHIP อัปเดตไฟล์กลางใน `docs/`
-

### ปัญหายาก/ซ้ำที่เจอตอน BUILD
> บันทึกละเอียดที่ `./troubleshooting.md` (SHIP ยกขึ้น `docs/troubleshooting.md`)
- ดู `./troubleshooting.md`

## 2. Full build & test gate

> รัน build ทั้งหมด + test suite ทั้งหมด (รวม unit test) บน build branch — ต้องเขียวหมดก่อนปิด BUILD

| Component | Build | Unit test | Test อื่น | รอบที่แก้ |
|---|---|---|---|---|
| | ✅ / ❌ | | | |

- error ที่เจอตอนรวม + วิธีแก้:

### ✅ Gate BUILD → ยืนยัน VERIFY (ดู `.warnyin/workflow/stages/build.md` §7)
- [ ] ทุก task implement + merge เข้า build branch แล้ว
- [ ] ทุก task `passed` (test/build เขียว) ไม่มี `failed` ค้าง
- [ ] ไม่มี merge conflict ค้าง
- [ ] Full build ของทุก component ผ่าน (ไม่มี build error)
- [ ] test suite ทั้งหมด (รวม unit test) เขียวหมดบน build branch
- [ ] build.md §1/§2 สรุปครบทุก task + ผล full build/test
- [ ] ไม่แตะ rule/standard กลางใน docs/

## 3. แผนเทส (VERIFY)

> เขียนโดย VERIFY agent — อ้างอิง guideline `.warnyin/workflow/stages/verify.md`
> อิง guideline จาก `docs/techstack/<component>/test.md` (ถ้าไม่มี = เสนอวิธีใหม่ที่นี่)
> ตอน SHIP แผนนี้จะ merge เข้า `docs/techstack/<component>/test.md`

| | |
|---|---|
| **Component** | `<component>` |
| **จุดประสงค์ที่ต้อง verify** | (สรุปจาก spec/tasks) |

### ขอบเขตการเทส (ตามจุดประสงค์ topic)
- สิ่งที่ต้องยืนยันว่าทำงานถูก:

### ชนิดการเทส
- [ ] Functional (ตาม test-flow ใน `tasks/*/spec.md`)
- [ ] E2E smoke — เครื่องมือ: `playwright-cli` (ถ้าเป็น FE)
- [ ] Integration / API
- [ ] UX/UI verify (ถ้าเป็น FE)
- [ ] อื่นๆ:

### Local env ที่ต้องรัน (จาก `docs/infra.md`)
| Service | คำสั่งรัน | port / หมายเหตุ |
|---|---|---|
| | | |

### Test cases
| # | สถานการณ์ (อิงจุดประสงค์) | ขั้นตอน | ผลที่คาดหวัง |
|---|---|---|---|
| 1 | | | |

### E2E smoke (FE)
- flow ที่ smoke:
- คำสั่ง playwright-cli:

### UX/UI checklist (FE)
- [ ] layout ตรงตาม spec/wireframe
- [ ] states: loading / empty / error / success
- [ ] responsive
- [ ] interaction / user-flow ลื่นไหล

### วิธีรันเทส (reproducible)
```
<คำสั่ง / ขั้นตอน>
```

## 4. ผล verify + การแก้

> เขียนโดย VERIFY agent — สรุปผลการ verify + การแก้ไขที่เกิดขึ้น

| | |
|---|---|
| **วันที่ verify** | `YYYY-MM-DD` |
| **ผลรวม** | ผ่าน / ไม่ผ่าน |
| **จำนวนรอบการแก้ไข (fix iterations)** | __ รอบ |
| **จำนวนจุดที่แก้** | __ จุด |

### ผลการเทส
| # | Test case / flow | ชนิด | ผล | หมายเหตุ |
|---|---|---|---|---|
| 1 | | functional / e2e / uxui | ✅ / ❌→✅ (แก้แล้ว) | |

### UX/UI verify (ถ้าเป็น FE)
- [ ] layout / states / responsive / user-flow — ผล:

### รายการแก้ไข (สรุปการแก้ระหว่าง verify)
> นับรวมเป็น "จำนวนการแก้ไข" ด้านบน

| รอบ | ปัญหาที่เจอ | วิธีแก้ | ไฟล์ที่แก้ |
|---|---|---|---|
| 1 | | | |

### ปัญหายาก/ซ้ำ → troubleshooting
- บันทึกไว้ที่ `./troubleshooting.md` (SHIP ยกขึ้น `docs/troubleshooting.md`): มี/ไม่มี

### หมายเหตุถึง user (ถ้าถามระหว่างทาง)
-

### ✅ Gate → SHIP (ดู `.warnyin/workflow/stages/verify.md` §6)
- [ ] เทสตามจุดประสงค์ครบ (functional)
- [ ] regression ตาม baseline ผ่าน (scenario เดิมใน `docs/features/<name>/spec.md` ยังผ่าน)
- [ ] FE: UX/UI verify ผ่าน
- [ ] API contract (ถ้ามี `openapi.yaml`) — implementation ตรง contract
- [ ] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่าน (แก้จนผ่าน = แก้ root cause ไม่ลด bar)
- [ ] build.md §3 + §4 เขียนครบ
- [ ] ปัญหายากบันทึก troubleshooting.md แล้ว
