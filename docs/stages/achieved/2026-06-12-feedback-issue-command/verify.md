# Verify Report — command `/warnyin:feedback:issue`

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`

| | |
|---|---|
| **Slug** | `feedback-issue-command` |
| **วันที่** | `2026-06-12` |
| **ผลรวม** | ✅ ผ่าน |
| **จำนวนรอบการแก้ไข (fix iterations)** | 0 รอบ |
| **จำนวนจุดที่แก้** | 0 จุด |

## 1. จุดประสงค์ที่ verify (จาก spec/tasks)
- command `/warnyin:feedback:issue` (payload `.md` + nested adapter) **ติดตั้งได้จริง** ลงโปรเจกต์ปลายทาง
- playbook `feedback.md` ครอบ flow ตามจุดประสงค์: 3 ประเภท (Bug/Feature/Improvement) + title prefix + detect ladder (gh→`gh auth status`→fallback URL) + **confirm gate บังคับ** + **privacy** (ไม่ดึง session context เอง) + repo hardcode + best-effort label
- registry/contract สอดคล้อง (contract §1.1 ↔ adapter ↔ README/CLAUDE/CHANGELOG)
- ไม่ทำ command/registry เดิมพัง (additive)

## 2. ผลการเทส
| # | Test case / flow | ชนิด | ผล | หมายเหตุ |
|---|---|---|---|---|
| T1 | `npm test` | functional | ✅ | 69/69 pass |
| T2 | `verify:pack` + feedback ติด tarball | structural | ✅ | 83 ไฟล์ · `feedback.md`+`issue.md` ติด |
| T3 | `lint:md` dead-link | structural | ✅ | 0 dead (107 ไฟล์/48 ลิงก์) |
| T4 | `setup:sandbox` install proof | executable | ✅ | command/playbook/registry ลง target ครบ · **root dogfood ไม่โดนแตะ** |
| T5 | frontmatter + pointer adapter | structural | ✅ | `description`+`argument-hint` + ชี้ playbook + confirm-gate note |
| T6 | consistency contract §1.1 | consistency | ✅ | description/path/repo ตรง contract · repo hardcode 5 จุด |
| T7 | command-only intent | structural | ✅ | ไม่มี skill feedback (action-utility = command user-only) |
| T8 | observable behavior (playbook flow) | observable | ✅ | ครบทุก keyword: 3 ประเภท + prefix ×3 + gh create/auth + issues/new + urlenc + confirm/preview + no-session-pull + best-effort label retry |
| T9 | regression additive | regression | ✅ | feedback เพิ่มเข้า + command/utility เดิมครบ |

**Regression baseline:** feature `feedback-issue` ยังไม่มี `docs/features/*/spec.md` เดิม (Spec delta = ADDED ทั้งหมด ตาม `design.md §9`) → ไม่มี regression case จาก feature spec; regression ตรวจที่ "command/registry เดิมไม่ถูกลบ" (T9 ผ่าน)

## 3. UX/UI verify
- N/A — payload `.md` ไม่ใช่ FE

## 4. รายการแก้ไข
- **ไม่มี** — ทุกเทสผ่านรอบแรก (0 รอบแก้). design defect เรื่อง target CLAUDE.md ถูกจับ+แก้ตั้งแต่ BUILD integrate (TS-1) → VERIFY ยืนยัน template canonical install ลง target ถูกต้องแล้ว (T4)

## 5. ปัญหายาก/ซ้ำ → troubleshooting
- ไม่มีปัญหาใหม่ในขั้น VERIFY · troubleshooting เดิม (TS-1/TS-2 จาก BUILD) ยังอยู่ที่ `./troubleshooting.md`

## 6. หมายเหตุถึง user
- ไม่ได้ยิง issue จริงขึ้น GitHub (เลี่ยง side-effect public) — verify ที่ gh command/URL ประกอบถูกเชิงโครงสร้าง; การยิงจริงจะเกิดตอนผู้ใช้รัน command เอง (มี confirm gate ป้องกัน)
- command ใช้งานจริงในเครื่อง dev นี้ (dogfood root) ต้อง sync src→root ก่อน (`npm run setup:dogfood` ตอน release) — sandbox install proof ยืนยัน flow ติดตั้งถูกแล้ว

## ✅ Gate → SHIP (ดู `.warnyin/workflow/stages/verify.md` ข้อ 6)
- [x] เทสตามจุดประสงค์ครบ (functional/structural/observable)
- [x] FE: UX/UI verify — N/A (ไม่ใช่ FE)
- [x] regression baseline — additive ไม่พัง (feature ใหม่ไม่มี spec เดิม)
- [x] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่าน — ไม่มีข้อ fail (0 รอบ)
- [x] test.md + verify.md เขียนครบ
- [x] ปัญหายากบันทึก troubleshooting.md แล้ว (TS-1/TS-2 จาก BUILD)
