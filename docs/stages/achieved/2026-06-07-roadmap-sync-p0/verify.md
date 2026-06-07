# Verify Report — roadmap-sync-p0

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> สรุปผลการ verify ตามจุดประสงค์ของ topic + การแก้ไขที่เกิดขึ้น

| | |
|---|---|
| **Slug** | `roadmap-sync-p0` |
| **วันที่** | 2026-06-07 |
| **ผลรวม** | ✅ ผ่าน |
| **จำนวนรอบการแก้ไข (fix iterations)** | 1 รอบ |
| **จำนวนจุดที่แก้** | 1 จุด (Migration guide commands → robust) + 1 defer (cli.mjs) |

## 1. จุดประสงค์ที่ verify (จาก spec/tasks)
- migration guide **ทำตามแล้ว migrate สำเร็จจริง** (executable proof — ไม่ใช่แค่มีข้อความ)
- README anchor `#migration-guide` คลิกได้ (slug unique)
- roadmap P0 สะท้อนสถานะถูก (ไม่ติ๊กลวง)
- regression-free (npm test + ไม่แตะ `src/`)

## 2. ผลการเทส
| # | Test case / flow | ชนิด | ผล | หมายเหตุ |
|---|---|---|---|---|
| V1 | migration 0.3–0.5.x executable (จำลอง legacy → ทำตามคำสั่ง → installer) | behavioral | ❌→✅ (แก้แล้ว) | คำสั่งเดิมซ้อน `docs/stages/stages/` เมื่อ install-ก่อน-migrate → แก้เป็น `git mv .../* docs/stages/ && rm -rf` |
| V2 | migration ≤0.2.x executable | behavioral | ❌→✅ (แก้แล้ว) | เคสเดียวกัน — แก้แล้วผ่าน |
| V1'/V2' | กรณี migrate-ก่อน-install (ลำดับแนะนำ) | behavioral | ✅ | คำสั่งใหม่ทนทั้ง 2 ลำดับ (verify ด้วย git repo จำลอง) |
| V3 | anchor link integrity | functional | ✅ | `## Migration guide` unique (1 ครั้ง) → slug `#migration-guide` ตรง README link |
| V4 | roadmap accuracy | functional | ✅ | #1–4 = ✅, #12 ยัง `[ ]` (out of scope — ไม่ติ๊กลวง) |
| V5 | regression | functional | ✅ | `npm test` 18/18 pass · `git diff main` แตะเฉพาะ `CHANGELOG.md`/`README.md`/`docs/roadmap.md` · src/ touched: 0 |

## 3. UX/UI verify (ถ้าเป็น FE)
- N/A — ไม่ใช่ FE (งานเอกสาร repo meta)

## 4. รายการแก้ไข (สรุปการแก้ระหว่าง verify)
| รอบ | ปัญหาที่เจอ | วิธีแก้ | ไฟล์ที่แก้ |
|---|---|---|---|
| 1 | migration command `git mv warnyin/stages docs/stages` ทำงานจริงซ้อน `docs/stages/stages/` เมื่อผู้ใช้รัน installer ก่อน migrate (installer สร้าง `docs/stages/` เปล่าไปแล้ว) + ไม่ลบ `warnyin/installer` → warn ซ้ำ | ปรับ Migration guide เป็น `git mv .../* docs/stages/` (ย้าย contents) + `rm -rf` core เก่าทั้ง tree + เน้นลำดับ "migrate ก่อน install"; verify จริงทั้ง 2 ลำดับ × 2 รุ่น | `CHANGELOG.md` · บันทึก defer (แก้ cli) → `docs/roadmap.md` |

## 5. ปัญหายาก/ซ้ำ → troubleshooting
- บันทึกแล้วที่ `./troubleshooting.md` **TS-1** (migration ซ้อน `docs/stages/stages/`) — มีค่าพอยกขึ้น `docs/troubleshooting.md` ตอน SHIP ✅

## 6. หมายเหตุถึง user (ถามระหว่างทาง)
- **คำถาม:** finding migration ซ้อน — root cause ที่ `cli.mjs` (นอก scope) จัดการยังไง?
- **คำตอบ user:** ปรับเอกสารให้ robust + defer แก้ cli
- **การตัดสินใจ:** แก้ Migration guide ใน `CHANGELOG.md` ให้ robust (ทนทั้งกรณี install-ก่อน/หลัง-migrate) + เปิด defer item ใน `docs/roadmap.md` P0 #3 ให้ `cli.mjs` legacy warning ตรงเอกสารภายหลัง
  - **ผลข้างเคียงต่อ design rule:** เดิม task rule กำหนด "migration content mirror `cli.mjs` ตรง" — หลัง decision เอกสาร **robust กว่า cli ชั่วคราว** (codepoint รุ่น/en-dash/≤ ยังตรง, ต่างเฉพาะคำสั่งย้ายที่ทำให้ปลอดภัยขึ้น) จน defer แก้ cli เสร็จ

## ✅ Gate → SHIP (ดู `.warnyin/workflow/stages/verify.md` ข้อ 6)
- [x] เทสตามจุดประสงค์ครบ (functional + behavioral executable proof)
- [x] FE: UX/UI verify — N/A (ไม่ใช่ FE)
- [x] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่าน (V1/V2 ❌→✅)
- [x] test.md + verify.md เขียนครบ
- [x] ปัญหายากบันทึก troubleshooting.md แล้ว (TS-1)
