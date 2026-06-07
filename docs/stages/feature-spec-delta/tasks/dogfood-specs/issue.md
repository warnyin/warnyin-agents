# Issue — dogfood-specs

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.10)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD — **สร้างเฉพาะเมื่อพบ issue**

## 1. สรุป
- ผลสแกน: blocker 0 ข้อ · defer 1 ข้อ (+1 guidance)
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (dry-run 2026-06-07 — source pointer resolve ครบ, scenario observable ร่างได้จริง, ไม่ชน task อื่น)

## 2. รายการ issue
| # | ประเภท | จุดที่พบ (ไฟล์/spec/โค้ด) | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | dependency: `src/.warnyin/template/docs/features/[feature-name]/spec.md` | template ยังไม่ถูกสร้าง (เป็นของ wave-1 task `spec-template`) — dogfood ต้องรอ format จาก wave 1 | จัดการด้วย DAG อยู่แล้ว (wave 1 → wave 2); ถ้าจำเป็นใช้ design §4.1 เป็น canonical fallback (เนื้อหาเดียวกัน) | resolved (อยู่ใน dependency เดิม) |
| 2 | guidance | `src/scripts/lint-md.mjs:18,23-35` + convention ของ `docs/features/*` เดิม | path อ้างอิง `src/...` ใน spec ต้องเขียนเป็น **backtick inline-code** (ตาม convention feature.md/business.md เดิม) — lint-md strip code ก่อนเช็ค dead-link; ถ้าใช้ markdown link `[](...)` ต้องนับ `../../../` ถูก ไม่งั้น lint แดง | ให้ BUILD ใช้ backtick path ตาม convention พี่น้องไฟล์ — เลี่ยงความเสี่ยงทั้งหมด | resolved (ใส่เป็นแนวปฏิบัติ) |

> - **blocker** — ทำให้ implement ตาม spec ไม่ได้ → ต้องแก้ DESIGN ก่อนเข้า BUILD
> - **defer** — ตัดสินใจ/ทำทีหลังได้ ไม่ block การเริ่ม BUILD แต่ต้องบันทึกและให้ user รับทราบ

## 3. ผลการแก้ไข
ไม่มี blocker — ไม่ต้องแก้ design/task; #1 อยู่ใน DAG เดิม, #2 บันทึกเป็นแนวปฏิบัติให้ BUILD agent (อ้างใน task นี้ได้โดยตรง)
