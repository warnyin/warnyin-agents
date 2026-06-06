# Issue — docs-sync

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.9)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD — **สร้างเฉพาะเมื่อพบ issue**

## 1. สรุป
- ผลสแกน: blocker **1** ข้อ · defer **2** ข้อ
- สถานะรวม: ☑ มี blocker ค้าง (ห้ามเข้า BUILD จนกว่า user จะ clarify ข้อ #1)

## 2. รายการ issue

| # | ประเภท | จุดที่พบ (ไฟล์/spec/โค้ด) | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | blocker | `rule.md §1.1` vs `task.md §4` vs `standard.md §4` / `rule.md §2` | **ขอบเขต component rule กำกวม-ขัดกันเอง:** task บอกขัดกันว่าจะแก้ `docs/techstack/installer/rule.md` ได้หรือไม่ — `rule.md §1.1` บรรทัด 11 **อนุญาต** ("ปรับเฉพาะ path/wording ที่สะท้อนโค้ดได้") แต่ `task.md §4 "แก้ได้"` (บรรทัด 31) + sub-tasks §3 + `spec.md §2` **ไม่ลิสต์ `rule.md`** และ `standard.md §4` + `rule.md §2` ข้อท้าย กลับสั่งให้ SHIP แก้ `installer/rule.md` → ไม่รู้ว่า BUILD แก้ได้หรือต้อง defer | **clarify ก่อน BUILD** → แนะนำตัดสิน: ให้ BUILD แก้เฉพาะ **path ที่ผิดหลังย้าย** ใน `installer/rule.md` (เป็น component rule สะท้อนโค้ด ไม่ใช่ global) แล้วแก้ scope §4/sub-tasks ให้ตรงกัน **หรือ** ห้ามแตะทั้งคู่แล้วลบประโยคอนุญาตใน §1.1 ออก — เลือกทางเดียวให้ task ไม่ขัดกันเอง | open |
| 2 | defer | dependency · `task.md §2` / design §7 | **ordering hazard:** task นี้ "document โค้ดจริงหลัง build" แต่เป็น wave สุดท้าย (T5) — ถ้า T1–T4 ยัง **ไม่ integrate/merge** เข้า working tree (ยังเป็น worktree แยกของแต่ละ wave) ตอน T5 รัน `src/` จะยังไม่มี → document ไม่ได้ | ไม่ block design — แต่ BUILD orchestrator **ต้องบังคับ integrate T1–T4 เข้า tree ก่อนปล่อย T5** (build playbook fan-out ตาม DAG ทำให้อยู่แล้ว: T5 ขึ้นกับ T4) · ปัจจุบัน `src/` ยังไม่มีจริง (ground truth = pre-T1) → **ยืนยัน: ห้ามรัน T5 เดี่ยวก่อน T1–T4 เสร็จ+integrate** | open |
| 3 | defer | scope check · `task.md §3.6` / design §3,§7 | `docs/project.md` + `docs/infra.md` **ยังไม่มีจริงตอนนี้** (สร้างใน T4) — sub-task 6 สั่ง "เช็คความครบ" สองไฟล์นี้ ทำได้ก็ต่อเมื่อ T4 สร้างเสร็จจริง | ไม่ block — ผูกกับ #2 (T4 ต้องเสร็จก่อน) · ถ้า T4 สร้างแล้ว sub-task 6 ทำได้ตรง ๆ; ถ้ายังไม่มี = สัญญาณว่า T4 ยังไม่ integrate (ดู #2) | open |

## 3. ผลการแก้ไข
<!-- รอ user clarify ข้อ #1 ก่อนเข้า BUILD — ยังไม่แก้ design.md / task -->

### รายละเอียดประเด็น clarify (#1) — ขอบเขต component rule vs global rule
สถานะโค้ดจริง ณ dry-run (path เก่าที่จะผิดหลังย้าย):
- `docs/rule.md`: §2 บรรทัด 14 (`bin/cli.mjs`), §4 บรรทัด 27 (`tests/`), §5 บรรทัด 31 (`bin/cli.mjs`) — **global rule, ทุกฝ่ายเห็นพ้องว่า "ห้ามแตะ" รอ SHIP** (ชัดเจน ไม่กำกวม)
- `docs/techstack/installer/rule.md`: บรรทัด 5 (`bin/cli.mjs` → ต้องเป็น `src/bin/cli.mjs`) **+ บรรทัด 12 "guard self-install ต้อง error"** ซึ่งหลังย้าย design §4.1 บอก guard กลายเป็น defensive no-op (`pkgRoot=src/` ไม่มีทาง===target) → wording นี้ **ผิดความจริง** ด้วย ไม่ใช่แค่ path

→ ประเด็นคือ **component rule** นี้ผิด 2 จุดหลังย้าย แต่ task เอกสารกำกวมว่าใครแก้ (BUILD-T5 หรือ SHIP) ต้องให้ user ชี้ขาด ก่อน BUILD เพื่อ:
1. ไม่ให้ doc ค้างชี้ path เก่า (ขัด acceptance "docs ตรงโค้ดจริง 100%" + standard §2 "ลบ path เก่าให้หมด")
2. ไม่ให้ build agent เดาเอง (ขัด rule กลาง "ห้ามเดา")
