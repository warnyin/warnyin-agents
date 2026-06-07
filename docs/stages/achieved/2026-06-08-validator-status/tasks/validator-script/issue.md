# Issue — validator-script

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.10)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD — **สร้างเฉพาะเมื่อพบ issue**

## 1. สรุป
- ผลสแกน: blocker 0 ข้อ · defer 3 ข้อ (implementation nuance — จัดการตอน BUILD)
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (dry-run 2026-06-08 — H1 heuristic/stage table/C3 data-row/slug guard implement ได้ครบ; precedent lint-md+installer.test ครอบ pattern ทุกตัว)

## 2. รายการ issue
| # | ประเภท | จุดที่พบ | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | C5 `checkFeatureSpec` — `docs/features/*/spec.md` | มี paragraph คั่นระหว่าง `## Requirement:` กับ `### Scenario:` (เช่น spec-delta L11-12) — ต้อง group Scenario กับ Requirement ด้วย **section boundary** (เจอ `## Requirement:` ถัดไป = ปิด block) ไม่ใช่ "บรรทัดติดกัน" | implement boundary-based grouping (straightforward, ระวัง off-by-one); ทั้ง 3 dogfood spec well-formed → C5 จะเขียว | resolved (แนวทางชัด) |
| 2 | defer | C5 H-level anchor | อย่าให้ match `#### Requirement:` (H4) ใน design.md §9 Spec delta — anchor `^## Requirement:` (H2 เป๊ะ) กัน false-match ถ้า content ผิดไฟล์ | anchor regex H2 + checkFeatureSpec รันเฉพาะ walk path `docs/features/*/spec.md` (คนละ path กับ design.md) | resolved (anchor ชัด) |
| 3 | defer | executable harness reuse | `makeTempProject`/`runCli` ใน `installer.test.mjs` ไม่ export → ต้อง **copy harness** (standard §3 สั่งไว้) ไม่ใช่ import | copy ตาม standard เดิม; เป็น candidate learned-rule "executable-spawn-harness สำหรับ payload script" รอ SHIP | resolved (standard ครอบ) |

> - **blocker** — ทำให้ implement ตาม spec ไม่ได้ → ต้องแก้ DESIGN ก่อนเข้า BUILD
> - **defer** — ตัดสินใจ/ทำทีหลังได้ ไม่ block การเริ่ม BUILD แต่ต้องบันทึกและให้ user รับทราบ

## 3. ผลการแก้ไข
ไม่มี blocker — ไม่ต้องแก้ design/task; 3 defer เป็น implementation nuance ที่ spec/standard ครอบแนวทางแล้ว (boundary grouping, H2 anchor, copy harness) — BUILD agent ทำตามได้ตรง
