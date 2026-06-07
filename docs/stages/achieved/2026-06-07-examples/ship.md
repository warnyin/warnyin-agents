# Ship Report — examples (worked-example walkthrough)

> ส่งมอบ 2026-06-07 · archive ของ topic `examples` (P2 #10)

## 1. feature: ไม่สร้าง feature folder (Q1)
worked-example = **เอกสาร onboarding ล้วน** (ไม่ ship payload, ไม่ใช่ workflow capability แบบ context-profiles/utility-skills) → บันทึกผ่าน rule §1 (convention) + roadmap + codemap pointer + ship.md แทนการสร้าง `docs/features/`
- **deliverable ถาวร:** `docs/example-walkthrough.md` (คงอยู่ ไม่ archive) + README section "ตัวอย่างจริง"

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/rule.md` §1 | **L1 (planned)** worked-example convention — surface achieved ไม่ duplicate · disclaimer snapshot + pointer playbook source · ไม่ ship npm · ลิงก์ `src/.warnyin/` (committed) · เน้น decision ไม่ลอกขั้นตอน |
| `docs/rule.md` §5 | **L2 (emergent)** verify เอกสาร narrative = accuracy เทียบ source — dead-link + claim ตรง source จริง + snapshot honesty (รายงานค่าประวัติ ไม่ใช่ปัจจุบัน) |
| `docs/roadmap.md` #10 | mark ✅ DONE + แก้ bullet ให้ตรงของจริง (surface achieved ไม่ใช่สร้าง `examples/` folder) |
| `docs/codemap/index.md` | section "เอกสาร onboarding" ชี้ `docs/example-walkthrough.md` |
| `docs/example-walkthrough.md` *(deliverable)* | NEW — narrative 5 stage ของ `cli-legacy-warning-fix` + disclaimer + ลิงก์ artifact จริง (อยู่บน build branch → merge main นอก workflow) |
| `README.md` *(deliverable)* | +section pointer (build branch → merge main นอก workflow) |

## 3. note "รอ SHIP" — พิจารณาครบ
- **worked-example convention** (`tasks/add-example-walkthrough/rule.md` §2) → **promote** L1 (`docs/rule.md` §1) ✅; placement เลือก §1 (convention ระดับโปรเจกต์) ไม่ใช่ techstack ใหม่ (ไม่มี `docs/techstack/docs/` — overkill)
- ไม่มี note อื่นค้าง

## 4. Learned-rule (dogfood #8 — user ยืนยันต่อ rule)
| # | rule | evidence | scope | ปลายทาง |
|---|---|---|---|---|
| L1 | worked-example convention | topic นี้: surface achieved + disclaimer/pointer + ไม่ ship + ลิงก์ src | project | `docs/rule.md` §1 |
| L2 | verify-doc accuracy-vs-source | VERIFY V2/V3 (claim ตรง achieved + snapshot honesty 18/18) | component | `docs/rule.md` §5 |

## 5. troubleshooting
- ไม่มี entry ใหม่ (BUILD 0 รอบ · VERIFY 0 รอบ)

## 6. ข้อสังเกตที่บันทึกต่อ (ไม่ block — แยกงาน)
- DESIGN doc เขียน "13 ไฟล์ achieved" จริงมี 14 — ไม่กระทบ deliverable (archive แล้ว)
- ⚠️ **นอก scope:** root `.warnyin/` อาจยัง tracked ใน git (ควร gitignored ตาม rule §6) → ควรเปิด topic แยกตรวจ (bootstrap leak ที่อาจมีจริง)

## 7. โค้ด/deliverable (merge นอก workflow)
- branch `build/examples` (commit `ff092cc` build + `43296f0` verify) → merge `main` (docs-only, ไม่ bump version — ไม่ใช่ payload/code เปลี่ยน)
- dead-link 0/34 · npm test 19/19 · verify:pack เขียว · payload ไม่แตะ

## 8. สถานะ
✅ topic ปิดสมบูรณ์ — **P2 #10 DONE**; เหลือ P2 #11 (selective install — optional) + #12 (lint/format)
