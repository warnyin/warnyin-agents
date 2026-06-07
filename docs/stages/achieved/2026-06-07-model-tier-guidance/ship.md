# Ship Report — model-tier-guidance

> ส่งมอบ 2026-06-07 · archive ของ topic `model-tier-guidance` (จาก ECC #1 feasibility — token optimization)

## 1. feature: ปรับปรุง `context-profiles` (ไม่สร้างใหม่)
เพิ่ม **model-tier guidance** เข้า context card ที่มีอยู่ (Tool preference) — ต่อยอด feature เดิม ไม่ใช่ capability ใหม่

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/rule.md` §1 | **L1** payload-guidance ต้อง generic — guidance ที่อ้าง model/tooling ของ harness ใช้ vocab generic ไม่ผูกชื่อรุ่น/ผลิตภัณฑ์ (แม้ในประโยคปฏิเสธก็เลี่ยง enumerate กัน grep false-positive) |
| `docs/features/context-profiles/feature.md` | +model-tier guidance ใน Tool preference (research=deepest · build=balanced/worker→cheap · review=balanced+, generic) + ตาราง legend ใน README |
| `docs/codemap/architecture.md` | context profile +model-tier guidance note |

## 3. note "รอ SHIP" — พิจารณาครบ
- **payload-guidance generic** (task rule.md §2) → **promote** L1 (`rule.md` §1) ✅

## 4. Learned-rule (dogfood #8 — user ยืนยัน per-rule)
| # | rule | evidence | scope | ปลายทาง |
|---|---|---|---|---|
| L1 | payload-guidance ต้อง generic (tool-agnostic) | task rule.md §2 + grep ชื่อรุ่น=0 + build รอบแก้ reword legend | project | `rule.md` §1 |

## 5. troubleshooting
- ไม่มี entry ใหม่ (BUILD รอบแก้ = reword legend = literal-grep nicety, บันทึก build.md §4 พอ; ไม่ใช่ปัญหายาก/ซ้ำ)

## 6. โค้ด/deliverable (merge นอก workflow)
- branch `build/model-tier-guidance` (commit `1565b4c` build + `f12b9a1` report + `2da7c7d` verify) → merge `main`
- **payload `.md` (contexts)** ติดมากับ `--update`; ไม่กระทบ installer/test behavior → **ไม่ bump version** (payload-only เหมือน context-profiles เดิม; ผู้ใช้รับตอน `--update` รอบถัดไป)

  > หมายเหตุ: ถ้าจะให้ผู้ใช้ npm ได้ model-tier guidance ต้อง **publish เวอร์ชันใหม่** (payload เปลี่ยน) — พิจารณา batch กับ change payload อื่นในอนาคต หรือ bump patch ตอน release รอบถัดไป
- verify: structural + tool-agnostic grep=0 + install proof (sandbox) + regression 26/26

## 7. ผลพลอยได้
- ปิด **ECC #1 (token optimization)** ส่วนที่ portable/คุ้ม — model-tier ระดับ workflow (generic) โดยคง tool-agnostic + zero-dep
- dogfood: lint-md เช็คเอกสารกลางที่ promote = 0 dead

## 8. สถานะ
✅ topic ปิดสมบูรณ์ — improvement จาก ECC feasibility (หยิบเฉพาะที่คุ้ม + อยู่ในปรัชญา)
