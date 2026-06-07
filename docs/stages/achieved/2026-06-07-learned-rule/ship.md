# Ship — learned-rule (instinct แบบ manual ใน SHIP)

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`

## 1. สรุป topic
- **ทำอะไร:** เพิ่ม **learned-rule capture** ใน SHIP (3 surface: playbook `ship.md` §3/§4/§6 + command + template `[topic]/ship.md` section "Learned rules") — จับ rule ที่ได้จากการทำจริง (planned `tasks/*/rule.md` §2 + emergent จาก build/verify/troubleshooting) ด้วย `rule (generalize) + evidence (บังคับ) + scope (component/project)` แล้ว **user ยืนยัน per-rule** (fold เข้า approval เดิม) ก่อน promote — unify กับกลไก "รอ SHIP" เดิม (กลายเป็น subset planned)
- **ประเภท:** ☑ rule/mechanism enhancement (ไม่ใช่ feature ใหม่ — ไม่สร้าง `docs/features/`)
- **ปิด:** roadmap **P1 #8**
- **ผล VERIFY:** T1–T8 ผ่านครบ **0 รอบแก้** (executable install proof + unify ยืนยัน §3=7 principle/gate=8 เท่า main)

## 2. 🧠 Learned rules (dogfood กลไกใหม่ครั้งแรก — user ยืนยัน per-rule)
> SHIP ของ topic นี้ใช้ learned-rule capture ที่เพิ่งสร้างเป็นครั้งแรก — promote 2 rule (user ยืนยันทั้งคู่)

| rule (generalize) | evidence (pointer) | scope | promote? |
|---|---|---|---|
| **continuous-learning discipline** — ความรู้ตอนทำ (BUILD/VERIFY) → จับเป็น learned-rule ที่ SHIP ด้วย evidence+scope+user-confirm | `tasks/add-learned-rule/rule.md` §2 (planned) + ทั้ง topic นี้คือกลไกนั้น | project → `docs/rule.md` §1 | ✅ promoted |
| **unify-in-place ไม่สร้างกลไกขนาน** — เสริม mechanism ที่ทับของเดิม → ขยายในที่เดิม (ของเก่ากลายเป็น subset) | `verify.md` T5 (§3=7 principle, gate=8 เท่า main) + `build.md` "unify สำเร็จ" + precedent #6/#7 | project → `docs/rule.md` §1 | ✅ promoted |

## 3. เอกสารกลางที่อัปเดต (promote)
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/rule.md` §1 | +2 bullet ปรัชญาแก่น: **continuous-learning discipline** (คู่ "ห้ามเดา") + **unify-in-place ไม่สร้างกลไกขนาน** (จาก L1+L2 ที่ user ยืนยัน) |
| `docs/roadmap.md` P1 #8 | ติ๊ก `[x]` DONE + จุดที่ลง (playbook+command+template+global §1) |
| `CHANGELOG.md` `[Unreleased]` | Added: learned-rule capture ใน SHIP — รอ assign version ตอน release step |

## 4. ที่ไม่ทำ (พร้อมเหตุผล)
| รายการ | เหตุผล |
|---|---|
| `docs/features/` | ไม่สร้าง — rule/mechanism ไม่ใช่ product feature |
| `docs/codemap/` | ไม่เปลี่ยน — แก้ content ในไฟล์เดิม (ship.md/command/template) ไม่มีไฟล์/โครงใหม่ |
| `docs/techstack/installer/test.md` | ไม่เปลี่ยน — reuse pattern "verify payload `.md`" เดิม |
| `docs/troubleshooting.md` | ไม่มี entry (0 รอบแก้) |
| `docs/{project,infra}.md` | ไม่กระทบ scope/env |

## 5. Archive
- `docs/stages/learned-rule/` → `docs/stages/achieved/2026-06-07-learned-rule/` (`git mv`, 2026-06-07)

## 6. นอก SHIP (release step — รอ user สั่ง)
- version bump (rule enhancement = patch → `0.8.3`) + assign CHANGELOG `[Unreleased]` → `[0.8.3]` + merge `build/learned-rule` → main
- **ค้างสะสม:** main ยังไม่ push + npm ยังไม่ publish (v0.8.0–0.8.3)
