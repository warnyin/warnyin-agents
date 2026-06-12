# Issue — setup-dogfood-verify

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.10)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD

## 1. สรุป
- ผลสแกน: blocker **0** ข้อ · defer **3** ข้อ
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (พร้อมเข้า BUILD)
- ยืนยัน anchor โค้ดจริง: verify call site `setup-dogfood.mjs:63` (npx) + `:126` (pack), `PKG` ใช้ 4 จุด (L48/51/74/76/82 — module-local ไม่ export), npm pattern `:75`, main-guard `:175`, harness `makeTempProject:12` ✓

## 2. รายการ issue
| # | ประเภท | จุดที่พบ | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | integration end-to-end | `npm run setup:dogfood` จริงพิสูจน์เต็มได้หลัง publish release ที่มี stamp (transition window design §6) | manual proof รอ release — **ไม่ใช่ gate ของ topic**; VERIFY บันทึก snapshot รอบที่เริ่มจับ drift ได้ (ตรง design §8) | defer (track → VERIFY/SHIP) |
| 2 | defer | `docs/infra.md` | เพิ่ม env `npm_config_prefer_online` + network-to-registry requirement ของ setup:dogfood + stamp artifact note | ยกไป SHIP (ตรง design §10 Defer) | defer (→ SHIP) |
| 3 | defer | learned-rule (rule.md §2) | "external-version query → parse ทน noise (pure fn) + degrade graceful + เทียบค่า version" | ห้ามแก้ `docs/rule.md` ตอนนี้ — รอ SHIP รวมกับ learned-rule ของ installer-version-stamp | defer (→ SHIP) |

## 3. ผลการแก้ไข
ไม่มี blocker → ไม่ต้องแก้ design/task. ข้อสังเกต non-blocking ที่ฝาก BUILD ระวัง (ครอบใน standard.md/rule.md แล้ว):
1. **warn อยู่ที่ caller** — `verifyInstalled` คืน `boolean` บริสุทธิ์ (unit เดิม `assert.equal(verifyInstalled(tmp), false)` ต้องไม่พัง); caller เรียก `readStamp(repoRoot)` ซ้ำตอน log ได้ (ถูกกว่าเปลี่ยน return type)
2. **อย่าทำลาย `!shimMissing`** ใน success-detection L63 — เพิ่มแค่ arg `expected` ตัวที่ 2 (rule.md investigate-before-edit)
3. **`env:` ใน spawn** ต้อง `{ ...process.env, npm_config_prefer_online:'true' }` (spread กัน child ขาด PATH) — codebase ไม่มี precedent `env:` แต่เป็น Node API มาตรฐาน
