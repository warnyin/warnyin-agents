# Issue — discovery-playbook-modes

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 10)
> ผลสแกนหา defer/blocker ก่อนเข้า BUILD

## 1. สรุป
- ผลสแกน: blocker **0** ข้อ · defer **3** ข้อ
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (พร้อมเข้า BUILD)

## 2. รายการ issue
| # | ประเภท | จุดที่พบ | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | spec/design wording "Agent tool" | คำว่า "Agent tool" ควร consistent กับ playbook เดิม (design.md ใช้ "read-only sub-agent/fan-out") — generic term ไม่ใช่ชื่อรุ่น → ไม่ violate `docs/rule.md §1` | author ใช้ wording เดียวกับ `design.md` playbook เดิม + คง fallback tool-agnostic | open (ตัดสินตอนเขียน BUILD) |
| 2 | defer | spec §7 / design §8.2 | full spawn-real proof ของ debate = optional (VERIFY ใช้ structural) | track ที่ VERIFY ถ้า token budget พอ | open (VERIFY-time) |
| 3 | defer | rule.md §2 | 2 proposed rule (stage-intensity mode orthogonal · debate pattern) | รอ SHIP promote เข้า `docs/rule.md` | open (SHIP-time) |

## 3. ผลการแก้ไข
ไม่มี blocker ต้องแก้ DESIGN. dry-run ยืนยัน: section "Discovery modes" แทรกได้ (grill เดิมจริงที่ playbook §3 บรรทัด 42-44 + ref บรรทัด 15 → fold ได้), debate มี precedent ใน `design.md` playbook (fan-out persona + synthesize + fallback), observable proxy §8.1 นับได้, contract anchor §4.2 consistent. defer ทั้ง 3 เป็น VERIFY/SHIP-time ไม่ block BUILD.
