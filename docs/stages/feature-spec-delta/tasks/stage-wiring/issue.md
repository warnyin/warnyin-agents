# Issue — stage-wiring

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.10)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD — **สร้างเฉพาะเมื่อพบ issue**

## 1. สรุป
- ผลสแกน: blocker 0 ข้อ · defer 2 ข้อ
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (dry-run 2026-06-07 — พิกัดทั้ง 10 ไฟล์ตรงไฟล์จริง, canonical wording ไม่เพี้ยนจาก design §4)

## 2. รายการ issue
| # | ประเภท | จุดที่พบ (ไฟล์/spec/โค้ด) | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | `CHANGELOG.md:85` | compare link `[Unreleased]` ยัง pin `v0.7.0...HEAD` ทั้งที่ release ล่าสุด 0.8.5 — หนี้เดิมสะสมหลายรุ่น ไม่ใช่ของ task นี้ | นอก scope ใบนี้ — track ไว้; แก้ตอน release/publish รอบหน้า (bump เป็น `v0.8.5...HEAD` + เติม compare entry 0.8.x) | open (tracked) |
| 2 | defer | `src/.claude/commands/warnyin/ship.md:15` (sub-bullet `docs/features/`) | ตอนเสริม pointer "merge delta + key ไม่เจอ → STOP" ใน command mirror ต้องคุม wording ให้**บาง** (ชี้ playbook §4 step 5) ห้ามลอกกติกา merge เต็มลง command — เสี่ยงขัด rule "adapter บาง" | เป็น guidance ให้ผู้ทำ BUILD — acceptance ของ task มีข้อ "command mirror ไม่ duplicate logic" คุมอยู่แล้ว | resolved (คุมใน acceptance) |

> - **blocker** — ทำให้ implement ตาม spec ไม่ได้ → ต้องแก้ DESIGN ก่อนเข้า BUILD
> - **defer** — ตัดสินใจ/ทำทีหลังได้ ไม่ block การเริ่ม BUILD แต่ต้องบันทึกและให้ user รับทราบ

## 3. ผลการแก้ไข
ไม่มี blocker — ไม่ต้องแก้ design/task; defer #1 track ไว้ระดับ topic (แจ้ง user แล้ว), defer #2 ปิดด้วย acceptance เดิมของ task
