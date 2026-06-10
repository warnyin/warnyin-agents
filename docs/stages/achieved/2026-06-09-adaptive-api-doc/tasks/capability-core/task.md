# Task — capability-core

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ — self-contained

| | |
|---|---|
| **Task** | `capability-core` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (payload `src/.warnyin/workflow/`) |
| **Wave** | 1 (ต้องเสร็จก่อน `stage-integration`) |
| **สถานะ** | `เสร็จ` (retrofit — implement แล้ว) |

## 1. เป้าหมายของ task (vertical slice)
สร้าง capability doc กลาง **`src/.warnyin/workflow/api-doc.md`** = single source ของ adaptive API documentation — นิยาม auto-detect, 3 mode, per-stage behavior, มาตรฐาน+เครื่องมือ (reference), ที่อยู่ artifact; เป็นสมองที่ 3 stage เรียกใช้

## 2. Dependency
- ต้องทำหลัง: — (ไม่มี — เป็น wave 1)
- ปลดล็อกให้: `tasks/stage-integration` (hook อ้าง **เลข section** ของไฟล์นี้: `§2` detect, `§4` per-stage)
- ส่ง output ต่อ: ไฟล์ `api-doc.md` + เลข section ที่ stable (§2/§4) ให้ task-2 ชี้

## 3. Sub-tasks
- [x] 1. เขียน §1 (คืออะไร/ใช้เมื่อไหร่ — ไม่ใช่ stage, ไม่มี slash command, adaptive) — _ผลลัพธ์:_ กรอบ capability
- [x] 2. เขียน **§2 Auto-detect** (signal: techstack/route/annotation/API task/endpoint; ไม่ใช่→ข้าม; คลุมเครือ→ถาม) — _แก่นของ adaptive_
- [x] 3. เขียน §3 (3 mode: design-first/code-first/hybrid)
- [x] 4. เขียน **§4 บทบาทต่อ stage** (DESIGN ผลิต / VERIFY validate+runtime-security / SHIP promote) — _contract ให้ task-2 ชี้_
- [x] 5. เขียน §5 (มาตรฐาน OpenAPI 3.1 + secret hygiene + เครื่องมือ reference ไม่ vendor)
- [x] 6. เขียน §6 (artifact location + `<component>` resolution ห้ามเดา)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- สร้างใหม่: `src/.warnyin/workflow/api-doc.md` (ไฟล์เดียว)
- **ห้ามแตะ:** stage playbook, adapter, CHANGELOG (= งานของ task-2)

## 5. Acceptance criteria
- [x] `src/.warnyin/workflow/api-doc.md` มีอยู่ + ครบ section §1-§6 (โดยเฉพาะ "Auto-detect", "เลือกโหมด", "บทบาทต่อ stage")
- [x] **tool-agnostic** — ไม่มี model-tier ฝังเป็น guidance (header callout product-name อนุญาตตาม convention)
- [x] **reference ไม่ vendor** — ชี้ skill ภายนอกเป็น pointer ไม่ก๊อปเข้า repo
- [x] **secret hygiene** §5 ระบุ scrub `openapi.yaml` ก่อน commit (Security panel)
- [x] เลข section §2/§4 stable (task-2 จะอ้าง) — ถ้าเรียงใหม่ต้องแจ้ง task-2
- [x] ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
