# Design (How) — defensive-rules

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> Lens: SA (`.warnyin/workflow/roles/sa.md`) · แตก task ด้วย Tech Lead lens

## 1. ภาพรวมสถาปัตยกรรม
- **component:** workflow core (payload `.md` ใต้ `src/.warnyin/workflow/`) — ไม่แตะ installer/runtime
- **แนวทางหลัก:** เพิ่ม 2 rule เชิงป้องกันเป็น **enforce layer ของ "ห้ามเดา"** — เกาะ 3 จุด: operating principle (playbook §3, ตอนเริ่ม stage) + role checklist (ก่อนส่งงาน) + global rule (ปรัชญาแก่น, รอ SHIP)
- **หลักการกัน drift:** ทั้ง 2 rule wording เป็น **canonical ใน design นี้** — ทุกจุดที่เกาะอ้าง wording เดียวกัน (1 task เขียนทุกจุดในรอบเดียว)

## 2. Canonical wording (สัญญาหลัก — ทุกจุดใช้ตรงนี้)
> **R1 · investigate-before-edit:** ก่อนแก้ไฟล์ที่มีอยู่ ต้องเข้าใจก่อน — **ใครใช้/อ่านไฟล์นี้, schema/contract/สัญญาของมัน, เจตนาเดิม**; แก้โดยไม่เข้าใจ = เดา (กรณีไม่ชัด → ถาม user / อ่านโค้ดที่อ้างถึง ก่อนแก้)

> **R2 · config-protection:** ห้ามแก้ config (linter/formatter/test threshold) หรือ disable rule **"เพื่อให้ build/test ผ่าน"** แทนการแก้โค้ดจริง — ถ้า config ผิดจริง แก้ได้แต่ต้องมี **เหตุผลชัด + note** (ไม่ใช่เพื่อเลี่ยง finding)

- เวอร์ชันสั้น (สำหรับ role checklist 1 บรรทัด):
  - dev: "เข้าใจไฟล์ก่อนแก้ (ใครใช้/contract/เจตนา) — ไม่แก้แบบไม่เข้าใจ; ไม่แก้ config/test ให้เขียวแทนแก้โค้ดจริง"
  - qa: "ตอน fix loop — ไม่ลด bar (config/test threshold/disable rule) เพื่อให้ผ่าน; แก้ root cause จริง"

## 3. Vertical slices
> change เล็ก + 2 rule เดียวกระจาย 4 จุด → **1 task เดียว** (กัน wording drift ระหว่างจุด — vertical slice = "2 rule ปรากฏครบทุก enforce point อย่างสม่ำเสมอ")

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **2 defensive rule บังคับใช้ครบทุก enforce point** — playbook §3 (build+verify) + role checklist (developer+qa) wording สม่ำเสมอ + global noted | playbook · role card · (global note) · verify (npm test/pack) | `tasks/add-defensive-rules/` |

## 4. Interface / contract — จุดเกาะ (mapping)
| จุดเกาะ | ไฟล์ | ใส่อะไร |
|---|---|---|
| operating principle | `stages/build.md` §3 | R1 + R2 (ต่อจากข้อ 4 self-verify / ใกล้กลุ่ม "ห้ามแตะ rule กลาง") |
| operating principle | `stages/verify.md` §3 | R1 + R2 (R2 เน้น fix loop ข้อ 5 "แก้จนผ่าน") |
| role checklist | `roles/developer.md` | +2 checklist line (เวอร์ชันสั้น dev) |
| role checklist | `roles/qa.md` | +2 checklist line (เวอร์ชันสั้น qa) |
| global (รอ SHIP) | note `tasks/add-defensive-rules/rule.md` §2 → `docs/rule.md` §1 | 1 bullet ขยาย "ห้ามเดา": investigate-before-edit + config-protection |

## 5. Flow
- ไม่มี runtime — doc reference: AI อ่าน playbook §3 ตอนเริ่ม stage → ปฏิบัติ; ก่อนส่งงานไล่ role checklist → R1/R2 ถูกย้ำซ้ำ (principle + checklist = 2 enforce point)

## 6. ผลกระทบต่อระบบเดิม
- backward compat: เพิ่มบรรทัด ไม่ลบ/แก้ของเดิม; ผู้ใช้รุ่นเก่ารับตอน `--update`
- **regression check:** ไม่มี test assert เนื้อหา playbook/role `.md` (installer test = black-box cli behavior) → `npm test` ควรเขียวไม่กระทบ; ยืนยันใน BUILD
- ไม่ duplicate: R1 เสริมมุม "เข้าใจ contract ไฟล์เป้าหมาย" (developer.md เดิม = "อ่าน spec ของงาน"); R2 เสริม "ไม่ลด bar" (เดิม = "ไม่รายงาน passed ปลอม") — research.md RQ2

## 7. Dependency ระหว่าง slice/task
```
add-defensive-rules   (task เดียว — ไม่มี dependency)
```

## 8. Test strategy ระดับ design
- **structural:** R1+R2 ปรากฏใน build.md §3 + verify.md §3 + developer.md + qa.md (grep หา keyword/wording)
- **consistency:** wording 4 จุดมาจาก canonical §2 เดียวกัน (ไม่ขัดกัน)
- **regression:** `npm test` 18/18 + `verify:pack` เขียว (ไม่กระทบ test เดิม)
- **VERIFY (ภายหลัง):** อ่าน behavioral — principle ชัด actionable, ไม่ขัด "ห้ามเดา" เดิม, global bullet พร้อม promote

## 9. หมายเหตุการตัดสินใจ (ไม่ block)
- root dogfood copy: ข้าม (รอ release — เหมือน #5)
- 1 task (ไม่ใช่ 2) — เพราะ 2 rule เดียวกระจาย 4 จุด, แยก task เสี่ยง wording drift; 1 agent เขียนรอบเดียวสม่ำเสมอกว่า
