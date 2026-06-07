# Research — defensive-rules

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `defensive-rules` |
| **วันที่** | 2026-06-07 |

---

## 1. คำถามวิจัย
- [x] RQ1: 2 rule ไปเกาะจุดไหนใน playbook/role ที่ AI อ่านจริง (กันซ้ำ/ไม่ครอบ enforce point)
- [x] RQ2: ขัด/ซ้ำกับ rule ที่มีอยู่ไหม (developer.md, qa.md, docs/rule.md §1, common/testing.md)
- [x] RQ3: docs/rule.md แก้ตอน BUILD ได้ไหม (central docs)

## 2. วิธี & แหล่งข้อมูล
- [x] code/doc inspection — `.warnyin/workflow/stages/{build,verify}.md` §3, `roles/{developer,qa}.md`, `docs/rule.md`, `docs/roadmap.md` P1 #6
- [x] เทียบ ECC source: hook `gateguard-fact-force` (investigate/fact-force) + `config-protection`

## 3. Findings

### RQ1: จุดเกาะ enforce
- **พบว่า:** AI อ่าน rule 3 จุด — (1) **operating principle** ใน playbook §3 ตอนเริ่ม stage, (2) **role checklist** ก่อนส่งงาน (developer.md "Checklist ก่อนรายงานผล", qa.md "Checklist"), (3) **global** `docs/rule.md` §1 (ปรัชญาแก่น)
- **หลักฐาน:** `build.md` §3 (10 ข้อ operating principle), `verify.md` §3 (9 ข้อ), `developer.md` checklist 8 ข้อ, `qa.md` checklist
- **นัย:** เกาะทั้ง 3 จุด (D1) = ครอบ enforce point ครบ; BUILD+VERIFY ทั้งคู่มี edit loop จึงใส่ทั้งสอง playbook

### RQ2: ขัด/ซ้ำกับ rule เดิมไหม
- **พบว่า:** **ไม่ขัด — เสริมให้คม:**
  - developer.md มี "อ่านครบก่อนเขียน: task/spec/standard/rule" + "ไม่แตะนอก scope → note" → investigate-before-edit ขยายมุม "เข้าใจไฟล์ที่มีอยู่ก่อนแก้" (คนละแง่: อ่าน spec ของงาน vs เข้าใจ contract ของไฟล์เป้าหมาย)
  - developer.md มี "เขียวต้องเขียวจริง" + "ห้ามรายงาน passed ทั้งที่แดง" → config-protection เสริมว่า "ห้าม*ทำให้*เขียวปลอมด้วยการลด bar" (คนละแง่: ไม่โกหกผล vs ไม่ลดเกณฑ์)
  - user global `common/testing.md` มี "fix implementation, not tests" — สอดคล้อง config-protection แต่นั่นเป็น rule ส่วนตัว ไม่ใช่ของ repo → ควรมีใน playbook กลางเองด้วย
- **นัย:** เพิ่มได้โดยไม่ duplicate — เป็น "แง่ที่ยังไม่ถูกระบุชัด" ของปรัชญาเดิม

### RQ3: docs/rule.md ตอน BUILD
- **พบว่า:** `docs/rule.md` = central knowledge → workflow ห้ามแก้ตอน BUILD; rule ใหม่ note ใน `tasks/*/rule.md` §2 "รอ SHIP" → SHIP promote (แพทเทิร์นเดียวกับ context-profiles)
- **หลักฐาน:** ship.md §4-5, build.md หลักการข้อ 6 "ห้ามแตะ rule/standard กลางใน docs/"
- **นัย:** BUILD แก้เฉพาะ payload `src/.warnyin/workflow/` (playbook+role); global bullet → note รอ SHIP

## 4. Code inspection
| ไฟล์ | พบ | นัย |
|---|---|---|
| `stages/build.md` §3 | 10 operating principle (ข้อ 4 self-verify, 6 ห้ามแตะ rule กลาง, 10 troubleshooting KB) | แทรก 2 principle ใหม่ต่อท้าย/ใกล้ข้อ 4 |
| `stages/verify.md` §3 | 9 principle (edit loop ข้อ 5 "แก้จนผ่าน") | config-protection สำคัญสุดตรง fix loop นี้ |
| `roles/developer.md` | checklist 8 ข้อ | +1-2 line |
| `roles/qa.md` | checklist | +1-2 line |
| `docs/rule.md` §1 | "ห้ามเดา" bullet | + global bullet (รอ SHIP) |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| rule portable ใน playbook (เบา) | tool-agnostic, ตรงปรัชญา, ไม่ duplicate | ไม่ auto-enforce (พึ่ง AI อ่าน) | ✅ (D1/D2) |
| vendor hook (Claude gateguard) | auto-enforce | Claude-only, ขัด tool-agnostic, runtime หนัก | — (out) |

## 6. ความเสี่ยง / unknown
- ไม่มี unknown ที่ block — ปิดด้วย code/doc inspection

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำ:** เพิ่ม 2 operating principle ใน build.md+verify.md §3 + checklist line ใน developer.md+qa.md (wording ตาม discovery §7) + note global bullet รอ SHIP; verify ด้วย `npm test` + `verify:pack`
- **ป้อนกลับ discovery.md:** D1-D4 ยืนยันด้วย evidence — ไม่ขัด rule เดิม, docs/rule.md รอ SHIP
