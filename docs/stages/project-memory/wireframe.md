# Wireframe — <ชื่อ change / กลุ่มหน้าจอ>

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **low-fidelity wireframe** ของ change ที่มี UI surface — วาดก่อนเขียน technical design (`design.md` §5 UI layer) แล้วแตก task
> วาดโดย role/agent `warnyin-ux` (read-only generator) หรือ AI หลักสวม lens `.warnyin/workflow/roles/ux.md` (fallback) — main loop เขียนไฟล์นี้

| | |
|---|---|
| **Slug** | `<kebab-case ของ topic — ตรงกับ docs/stages/<slug>/>` |
| **วันที่** | `YYYY-MM-DD` |
| **Status** | `draft` / `approved` _(★ approve gate — user ต้องยืนยันให้เป็น `approved` ก่อนแตก task)_ |

<!--
วิธีกรอกไฟล์นี้ (อ่านก่อนเริ่ม):
- wireframe เป็น low-fidelity เท่านั้น — กล่อง/label generic พอให้เห็นโครงหน้าจอ ไม่ต้องสวย ไม่ใช่ pixel-perfect
- ★ privacy: ใช้ placeholder generic — ห้ามใส่ secret/token/credential/internal path/PII จริงลงในภาพ (ไฟล์นี้ commit ลง repo)
- แทนที่ทุก <...> และ [LABEL] ด้วยของจริงของ change นี้ แล้วลบ comment <!-- ... --> ที่เป็นคำสั่งกรอกออก
- 4 section ด้านล่าง (§1-§4) ชื่อตายตัวตาม contract — design.md/task อ้างชื่อนี้ ห้ามเปลี่ยนชื่อ/ลบ section
-->

## 1. User flow

> เส้นทาง screen-to-screen — ผู้ใช้เดินจากจอไหนไปจอไหน (ทำอะไร → เห็นอะไร)
> วาดเป็น ASCII arrow flow; แตกแขนง (branch) ได้ตาม action/เงื่อนไข

```
<!-- ตัวอย่าง — แทนที่ด้วย flow จริงของ change นี้ -->
[Entry / Landing]
      │ กดปุ่มหลัก
      ▼
[Form / Input screen] ──ใส่ข้อมูลไม่ครบ──▶ [Validation error inline]
      │ submit สำเร็จ
      ▼
[Result / Success screen]
      │ กดย้อนกลับ
      ▼
[Entry / Landing]
```

## 2. Wireframe ต่อ screen

> ASCII box หนึ่งกล่องต่อหนึ่ง screen — low-fidelity (กล่อง + label generic)
> ★ **ทำซ้ำ block "### Screen: ..." ด้านล่างได้หลายอัน** — หนึ่ง block ต่อหนึ่งหน้าจอใน user flow §1

### Screen: <ชื่อจอ A — เช่น Landing>

```
┌─────────────────────────────────────────┐
│  [LOGO]                      [User menu] │  <- header / nav
├─────────────────────────────────────────┤
│                                          │
│   <หัวข้อจอ / คำอธิบายสั้น>               │
│                                          │
│   ┌─────────────────────────────────┐    │
│   │  [Primary content / list item]  │    │
│   │  [Primary content / list item]  │    │
│   └─────────────────────────────────┘    │
│                                          │
│                     [ ปุ่มหลัก / CTA ]    │  <- action
│                                          │
└─────────────────────────────────────────┘
```

### Screen: <ชื่อจอ B — เช่น Form>

<!-- ทำซ้ำ block นี้ต่อหนึ่งหน้าจอ; ลบ block ตัวอย่างที่ไม่ใช้ออก -->

```
┌─────────────────────────────────────────┐
│  ◀ กลับ            <หัวข้อจอ>            │
├─────────────────────────────────────────┤
│                                          │
│   <Field 1 label>                        │
│   [____________________________]         │  <- input
│                                          │
│   <Field 2 label>                        │
│   [____________________________]         │
│   ( ) ตัวเลือก A   ( ) ตัวเลือก B         │  <- radio/option
│                                          │
│              [ ยกเลิก ]   [ ยืนยัน ]       │
│                                          │
└─────────────────────────────────────────┘
```

## 3. Screen states

> ต่อหนึ่ง screen ใน §2 ระบุหน้าตาแต่ละ state — empty / loading / error / success
> state ไหนไม่มีจริงสำหรับจอนั้น ใส่ `N/A` พร้อมเหตุผลสั้น

| Screen | empty | loading | error | success |
|---|---|---|---|---|
| `<ชื่อจอ A>` | `<ไม่มี item — แสดงอะไร>` | `<skeleton / spinner>` | `<โหลด list ไม่ได้ — แสดงอะไร>` | `<มี item — แสดงอะไร>` |
| `<ชื่อจอ B>` | `N/A (form ไม่มี empty)` | `<ขณะ submit — disable ปุ่ม>` | `<validation/server error inline>` | `<submit สำเร็จ → ไปจอไหน>` |

## 4. Design-honor note

> สิ่งที่ `design.md` (§5 UI layer) + task ใน BUILD **ต้องทำตาม** wireframe นี้ — กัน implementation หลุดจากที่ user approve
> เขียนเป็นข้อผูกมัด (constraint) ที่ตรวจได้ ไม่ใช่คำอธิบายลอย ๆ

- [ ] design.md §5 (UI layer) **อ้าง wireframe นี้** + ทุก screen ใน §2 มี task รองรับ
- [ ] ลำดับ screen ใน task ตรงกับ user flow §1 (entry → ... → result)
- [ ] ทุก screen implement ครบ 4 state ตาม §3 (ไม่ข้าม error/empty)
- [ ] `<constraint เฉพาะ change นี้ — เช่น "ปุ่ม CTA ต้องอยู่ขวาล่างเสมอ", "field บังคับมี inline validation">`
- [ ] เปลี่ยน layout/flow จาก wireframe นี้ → ต้อง rerun approve gate (กลับ status เป็น `draft` แล้วให้ user ยืนยันใหม่)
