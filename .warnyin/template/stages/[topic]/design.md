# Design (How) — <ชื่อ change>

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end

## 1. ภาพรวมสถาปัตยกรรม
- component/service ที่เกี่ยวข้อง (อิง `docs/techstack/*`):
- แนวทางหลัก:

## 2. Vertical slices
> หนึ่ง slice = หนึ่งหน่วยคุณค่า end-to-end (UI → API → domain → data → test) → จะกลายเป็น 1 task
> **ไม่แบ่งตาม layer แนวนอน**

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | | UI · API · domain · data · test | `tasks/<task-1>/` |
| 2 | | | `tasks/<task-2>/` |

## 3. Data model / schema
- entity / ตาราง / field ที่เพิ่มหรือแก้:
- migration (ถ้ามี):

## 4. Interface / contract
- API contract / event / interface ระหว่าง component:

## 5. Flow
- data-flow:
- user-flow:

## 6. ผลกระทบต่อระบบเดิม
- จุดที่ต้องระวัง / backward compatibility:

## 7. Dependency ระหว่าง slice/task
> slice/task เชื่อมกันยังไง ลำดับการทำ

```
task-1 ──▶ task-2 ──▶ task-3
              └──▶ task-4
```

## 8. Test strategy ระดับ design
- จะยืนยันว่า design ทำงานถูกอย่างไร (ภาพรวม — รายละเอียดอยู่ใน task spec):
