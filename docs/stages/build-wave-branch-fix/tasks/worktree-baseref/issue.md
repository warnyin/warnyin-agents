# Issue — worktree-baseref

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.10)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD — **สร้างเฉพาะเมื่อพบ issue**

## 1. สรุป
- ผลสแกน: blocker 0 ข้อ · defer 2 ข้อ (implementation hint — ไม่ block)
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (dry-run 2026-06-08 — แก้ 4 ไฟล์ได้ตาม spec; prompt step 0 / args / command / hard-stop contract implement ได้ครบ; CHANGELOG ไม่ชน)

## 2. รายการ issue
| # | ประเภท | จุดที่พบ | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | `build-wave.mjs` prompt() บรรทัด 63-66 | แทรก step 0 ควรอยู่ระหว่าง intro+blank (64) กับ "1. อ่านให้ครบ" (66) — `lines.unshift()` naive จะดัน step 0 เหนือ intro (ยังผ่าน ordering grep แต่อ่านเพี้ยน) | ใช้ `splice(2,0,...)` หรือ conditional-array แทน unshift — contract บังคับแค่ "ก่อน step 1" ทั้งสองวิธี satisfy | resolved (hint ใน standard) |
| 2 | defer | `CHANGELOG.md` [Unreleased] | spec บอกแค่ "entry [Unreleased]" ไม่ระบุ category | จัดใต้ `### Fixed` (reliability fix ตาม Keep-a-Changelog) | resolved (ชัดตอน build) |

> - **blocker** — implement ตาม spec ไม่ได้ → ต้องแก้ DESIGN ก่อนเข้า BUILD
> - **defer** — ทำ/ตัดสินใจทีหลังได้ ไม่ block แต่ต้อง track

## 3. ผลการแก้ไข
ไม่มี blocker — ไม่ต้องแก้ design/task; 2 defer เป็น implementation hint ที่ BUILD agent จัดการได้ (splice แทน unshift, CHANGELOG ใต้ Fixed) — มีหลักฐานใน standard/spec รองรับแล้ว
