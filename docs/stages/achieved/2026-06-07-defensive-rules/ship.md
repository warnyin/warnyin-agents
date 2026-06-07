# Ship — defensive-rules (2 กฎเชิงป้องกัน enforce ของ "ห้ามเดา")

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`

## 1. สรุป topic
- **ทำอะไร:** เสริม 2 operating principle เชิงป้องกันใน `build.md`/`verify.md` §3 + checklist ใน `developer.md`/`qa.md` — (R1) investigate-before-edit, (R2) config-protection — เป็น rule portable `.md` (เวอร์ชัน enforce ของ "ห้ามเดา")
- **ประเภท:** ☑ rule enhancement (ไม่ใช่ feature ใหม่ — ไม่สร้าง `docs/features/`)
- **ปิด:** roadmap **P1 #6**
- **ผล VERIFY:** T1–T7 ผ่านครบ **0 รอบแก้** (install proof + consistency + ไม่ขัด "ห้ามเดา")

## 2. เอกสารกลางที่อัปเดต (promote)
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/rule.md` §1 (ปรัชญาแก่น) | **promote global** — เพิ่ม 2 sub-bullet ใต้ "ห้ามเดา": investigate-before-edit + config-protection (จาก note รอ SHIP) |
| `docs/roadmap.md` P1 #6 | ติ๊ก `[x]` DONE + ระบุจุดที่ลง (playbook §3 + role + global) |
| `CHANGELOG.md` `[0.8.1]` | Added: defensive rules |

## 3. note "รอ SHIP" — พิจารณาครบ (ไม่เหลือค้าง)
| note | จาก | ผล |
|---|---|---|
| ขยาย "ห้ามเดา" ด้วย R1 investigate-before-edit + R2 config-protection | `tasks/add-defensive-rules/rule.md` §2 | ✅ promote → `docs/rule.md` §1 |

## 4. ที่ไม่ทำ (พร้อมเหตุผล)
| รายการ | เหตุผล |
|---|---|
| `docs/features/` | ไม่สร้าง — เป็น rule ไม่ใช่ product feature (อยู่ `docs/rule.md` ถูกที่) |
| `docs/codemap/` | ไม่เปลี่ยน — rule เป็น content ใน playbook ไม่ใช่ structure/ไฟล์ใหม่ |
| `docs/techstack/installer/*` | ไม่เปลี่ยน — ไม่กระทบ installer/packaging |
| `docs/troubleshooting.md` | ไม่มี entry (docs ล้วน ไม่มีปัญหายาก/ซ้ำ) |

## 5. Archive
- `docs/stages/defensive-rules/` → `docs/stages/achieved/2026-06-07-defensive-rules/` (`git mv`, 2026-06-07)

## 6. นอก SHIP (release step)
- version bump `0.8.0 → 0.8.1` (rule enhancement = patch) + merge `build/defensive-rules` → main
