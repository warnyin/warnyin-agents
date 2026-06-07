# Verify Report — cli-legacy-warning-fix

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`

| | |
|---|---|
| **Slug** | `cli-legacy-warning-fix` |
| **วันที่** | 2026-06-07 |
| **ผลรวม** | ✅ ผ่าน |
| **จำนวนรอบการแก้ไข (fix iterations)** | 0 รอบ (ผ่านรอบแรก — คำสั่ง verify แล้วใน topic ก่อน) |
| **จำนวนจุดที่แก้** | 0 |

## 1. จุดประสงค์ที่ verify
- cli legacy warning บอกคำสั่งที่ execute ได้จริง (ตรง Migration guide robust) — ไม่ซ้อน/ไม่ warn ซ้ำ
- 3-way consistency: cli ↔ CHANGELOG ↔ test เป็นชุดเดียวกัน
- regression-free

## 2. ผลการเทส
| # | Test case | ชนิด | ผล | หมายเหตุ |
|---|---|---|---|---|
| V1 | migration 0.3–0.5.x executable (install-after) | behavioral | ✅ | งานจริงอยู่ `docs/stages/mywork/`, ไม่ซ้อน, ไม่ warn ซ้ำ |
| V2 | migration ≤0.2.x executable (install-after) | behavioral | ✅ | เช่นเดียวกัน |
| V3 | **3-way consistency** | structural | ✅ | คำสั่ง `git mv .../* docs/stages/` ตรงกันทั้ง cli spawn / `CHANGELOG.md` / `installer.test.mjs` ทั้ง 2 รุ่น |
| V4 | regression | functional | ✅ | `npm test` 18/18 pass; `git diff main` แตะเฉพาะ `src/bin/cli.mjs` + `src/tests/installer.test.mjs` |

## 3. UX/UI verify
- N/A — ไม่ใช่ FE (CLI stderr message)

## 4. รายการแก้ไข
| รอบ | ปัญหา | วิธีแก้ | ไฟล์ |
|---|---|---|---|
| — | ไม่มี — ผ่านรอบแรก (คำสั่ง robust verify แล้วใน topic `roadmap-sync-p0`; topic นี้แค่ทำ cli/test ให้ตรง) | — | — |

## 5. ปัญหายาก/ซ้ำ → troubleshooting
- ไม่มีปัญหายาก/ใหม่ — `troubleshooting.md` ของ topic นี้ว่าง (finding ต้นเรื่องบันทึกแล้วใน `docs/troubleshooting.md` #10 จาก topic ก่อน)

## 6. หมายเหตุถึง user
- ไม่มีคำถามระหว่างทาง — scope ชัด, verify ผ่านรอบแรก

## ✅ Gate → SHIP
- [x] เทสตามจุดประสงค์ครบ (functional + behavioral + 3-way consistency)
- [x] FE: UX/UI — N/A
- [x] ทุกข้อผ่าน (ไม่มีที่ต้องแก้)
- [x] test.md + verify.md เขียนครบ
- [x] ปัญหายาก — ไม่มี (topic นี้)
