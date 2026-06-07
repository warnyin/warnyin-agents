# Verify Report — learned-rule

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md` · QA lens: `roles/qa.md`

| | |
|---|---|
| **Slug** | `learned-rule` |
| **Build branch** | `build/learned-rule` |
| **วันที่** | 2026-06-07 |
| **จำนวนรอบแก้** | **0** (ผ่านทุกเคสรอบแรก) |

## 1. ผลเทส (ตาม `test.md`)
| # | เคส | ผล | หลักฐาน |
|---|---|---|---|
| T1 | functional regression | ✅ PASS | npm test 18/18 (fail 0) · verify:pack 72 ไฟล์ |
| T2 | executable install proof | ✅ PASS | `setup:sandbox` → emergent(3)/learned-rule(7) ใน ship.md, command mirror(2), template section(1) ลงครบผ่าน cli.mjs; **root dogfood emergent=0 (ไม่โดนแตะ)** |
| T3 | ครบทุก surface | ✅ PASS | playbook §3 principle 7 + §4 step 1/3/5 + §6 gate · command step 3/5/7 · template §3 section Learned rules |
| T4 | 3-way consistency | ✅ PASS | "evidence" ปรากฏ playbook(5) ↔ command(2) ↔ template(2) — canonical §2 ตรงกัน |
| T5 | unify (ไม่บวม/ไม่ขนาน) | ✅ PASS | §3 = **7 principle** (ข้อ 7 ขยายในที่เดิม ไม่เพิ่มข้อ 8) · gate §6 = **8 items เท่า main** (item 3 "รอ SHIP" แก้เป็น learned-rules ในที่เดิม) |
| T6 | learned-rule ≠ troubleshooting | ✅ PASS | "learned-rule = กฎ generalize ไม่ใช่ incident" ปรากฏในนิยาม playbook §3 + §4 |
| T7 | dead-link / scope target | ✅ PASS | `docs/rule.md` (project) + `docs/techstack/` (component) → resolve จริง |
| T8 | global note พร้อม SHIP | ✅ PASS | `rule.md` §2 มี "continuous-learning discipline" รอ promote → docs/rule.md §1 |

## 2. Behavioral assessment (อ่านในมุมผู้ส่งมอบ SHIP จริง)
- **capture (step 1):** AI อ่าน topic → ได้คำสั่งชัดให้รวบรวมทั้ง planned (`tasks` §2) + emergent (build/verify/troubleshooting) เป็นตาราง rule+evidence+scope — actionable, ครอบ source ที่มีจริง
- **confirm (step 3 fold):** learned-rule fold เข้า AskUserQuestion approval เดิม — **ไม่เพิ่ม gate/ขั้นตอนซ้อน** (D4 สำเร็จ); user ยืนยัน per-rule ชัด
- **promote (step 5):** routing ตาม scope ชัด (component→techstack, project→docs/rule.md) reuse target เดิม — ไม่สร้างปลายทางใหม่ (D2)
- **evidence บังคับ:** ระบุ "ไม่มี evidence = ไม่ promote" ทั้ง playbook+command — กัน rule เดา (สอด "ห้ามเดา"); user-confirm = safety แทน auto-learn (แก่น ECC manual)
- **unify:** note "รอ SHIP" กลายเป็น subset (planned) อย่างเป็นธรรมชาติ — ไม่มี 2 กลไกขนาน, ไม่สับสน; learned-rule ≠ troubleshooting แยก abstraction ชัด

## 3. รายการแก้ไข
- **ไม่มี** — ผ่านทุกเคสรอบแรก (0 รอบแก้)

## 4. troubleshooting
- ไม่มีปัญหายาก/ซ้ำ (payload `.md` ล้วน)

## 5. Gate → SHIP
- [x] เทสตามจุดประสงค์ topic ครบ (T1–T8 + behavioral)
- [x] ไม่ใช่ FE — ไม่มี UX/UI verify (N/A)
- [x] ทุกข้อผ่าน — 0 รอบแก้
- [x] `test.md` + `verify.md` ครบ (จำนวนรอบแก้ = 0)
- [x] ปัญหายาก/ซ้ำบันทึก (ไม่มี)

→ พร้อมเข้า SHIP ด้วย `/warnyin:ship learned-rule`

> **★ หมายเหตุพิเศษ (dogfooding):** topic นี้ทำให้ SHIP มี learned-rule capture — ดังนั้น **SHIP ของ topic นี้เองควรเป็นครั้งแรกที่ลองใช้กลไก** (รวบรวม emergent learned จาก build/verify ของ learned-rule เอง + planned `rule.md` §2 → fold approval) เป็นการ dogfood mechanism ที่เพิ่งสร้าง
