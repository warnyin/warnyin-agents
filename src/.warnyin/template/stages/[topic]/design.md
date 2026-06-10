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
> slice/task เชื่อมกันยังไง ลำดับการทำ — วาด DAG แล้ววัด width (กัน chain เผลอ)

```
task-1 ──▶ task-2 ──▶ task-3
              └──▶ task-4
```

- **critical-path depth (longest chain):** <จำนวน wave ของ chain ที่ยาวที่สุด>
- **max wave width:** <จำนวน task สูงสุดใน wave เดียว — >1 = ขนานได้>
- **เหตุผลถ้า task ใดถูก serialize:** <ถ้า DAG เป็น chain เส้นตรง (ทุก wave 1 task) → ทำไม decouple ด้วย DAG-width toolkit (design.md §3 ข้อ 2) ไม่ได้>



## 8. Test strategy ระดับ design
- จะยืนยันว่า design ทำงานถูกอย่างไร (ภาพรวม — รายละเอียดอยู่ใน task spec):

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> พฤติกรรมที่ change นี้ เพิ่ม/แก้/ลบ — SHIP จะ merge ตามนี้แบบกึ่ง mechanical
> change ไม่แตะพฤติกรรม feature (refactor/docs/tooling) → เขียน "ไม่มี delta" บรรทัดเดียวพอ

### ADDED
#### Requirement: <ชื่อ> (→ feature: <feature-name>)
<พฤติกรรม + scenario ตาม format ของ spec.md>

### MODIFIED
#### Requirement: <ชื่อใหม่> (→ feature: <feature-name>) [เดิมชื่อ: <ชื่อเก่า> — ใส่เฉพาะกรณี rename]
<เวอร์ชันใหม่เต็ม> _(เดิม: <สรุปสั้น>)_

### REMOVED
#### Requirement: <ชื่อเดิมใน spec> (→ feature: <feature-name>) — เหตุผลที่เลิก
