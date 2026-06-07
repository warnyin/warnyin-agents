# Research — learned-rule

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `learned-rule` |
| **วันที่** | 2026-06-07 |

---

## 1. คำถามวิจัย
- [x] RQ1: กลไก "รอ SHIP" ปัจจุบันครอบ emergent learning (ตอน BUILD/VERIFY) ไหม
- [x] RQ2: ตอน SHIP มี evidence source อะไรให้อ้างบ้าง
- [x] RQ3: ECC instinct/continuous-learning แก่นคืออะไร — ยืมแบบ manual ได้แค่ไหน
- [x] RQ4: promote target ปัจจุบัน + learned-rule ต่าง troubleshooting ยังไง

## 2. วิธี & แหล่งข้อมูล
- [x] doc inspection — `stages/ship.md`, `.claude/commands/warnyin/ship.md`, `template/stages/[topic]/ship.md`, achieved ship.md ของ #5-#7
- [x] roadmap P1 #8 (ที่มา ECC instinct/continuous-learning)

## 3. Findings

### RQ1: กลไก "รอ SHIP" เดิม (เฉพาะ planned — ไม่ครอบ emergent)
- **พบว่า:** rule ใหม่ note ใน `tasks/<task>/rule.md` §2 "เสนอเพิ่ม rule ใหม่ (รอ SHIP)" — เขียน **ตอน DESIGN** (ก่อนลงมือ); ship.md §3 principle 7 + §6 gate บังคับ "พิจารณาครบ"
- **นัย:** จับ rule ที่ **คาดไว้ล่วงหน้า** ได้ดี แต่ **instinct ที่โผล่ตอนทำ** (BUILD/VERIFY) ไม่มีช่องจับเป็น rule — #8 เติมส่วนนี้ (unify เข้า capture step เดียว)

### RQ2: evidence sources ตอน SHIP (มีพร้อม — อ้างได้)
- **พบว่า:** ตอน SHIP อ่าน topic ครบทุกไฟล์อยู่แล้ว (ship.md §2) — มี `build.md` (ผล/integration notes), `verify.md` (รายการแก้+จำนวนรอบ), `troubleshooting.md` (ปัญหา/root cause/กันซ้ำ), diff/commit, `tasks/*/rule.md` §2
- **นัย:** evidence บังคับ (D3) ทำได้จริง — ทุก learned-rule ชี้ artifact ที่มีอยู่; `troubleshooting.md` เป็น candidate ชัดสุด ("กันซ้ำ" = rule ในตัว)

### RQ3: ECC instinct — แก่นที่ยืม (manual ~80%)
- **พบว่า (จาก roadmap):** ECC instinct/continuous-learning เต็มรูปต้องมี runtime observer (hook + SQLite) คอยจับ behavior — ขัดปรัชญา tool-agnostic/zero-runtime ของ repo
- **นัย:** ยืม **แก่น** = `rule + evidence + scope + user-confirm` เป็น **artifact manual ตอน SHIP** (ไม่ต้อง observe runtime) — ได้คุณค่า ~80% (จับบทเรียนเป็นกฎถาวร) โดยไม่มี dependency/runtime; **user-confirm** = safety แทน auto-learn

### RQ4: promote target + learned-rule vs troubleshooting
- **พบว่า:** promote target เดิม = `docs/rule.md` (project-wide) + `docs/techstack/<component>/rule.md` (component) — ตรง scope 2 ระดับ (D2)
- **learned-rule ≠ troubleshooting:** troubleshooting = **ปัญหา-อาการ-วิธีแก้** (incident log); learned-rule = **กฎถาวรที่ generalize** จากบทเรียน (เช่น troubleshooting "X พังเพราะ Y" → learned-rule "ก่อนแก้ Z ต้องเช็ค Y เสมอ") — คนละ abstraction; learned-rule อาจ *อ้าง* troubleshooting เป็น evidence
- **นัย:** reuse target เดิม ไม่สร้างปลายทางใหม่; ระบุชัดใน playbook ว่า learned-rule = generalized rule ไม่ใช่ incident

## 4. Code/doc inspection
| ไฟล์ | พบ | นัย |
|---|---|---|
| `stages/ship.md` §3/§5/§6 | principle 7 "เก็บ รอ SHIP" + process §5.5 promote + gate | ขยาย principle 7 (รวม emergent) + capture ใน §1/§5 + gate item ใหม่ |
| `.claude/commands/warnyin/ship.md` | step 3 (อ่าน topic + รอ SHIP) + step 5 (promote) | mirror: เติม collect emergent (step 3) + fold approval (step 5) |
| `template/[topic]/ship.md` | §2 เอกสารอัปเดต + §3 note ตัดทิ้ง | +section "Learned rules" (rule|evidence|scope|promote?) |
| achieved ship.md #5-#7 | มี table "note รอ SHIP พิจารณาครบ" อยู่แล้ว | learned-rule = superset ของ pattern นี้ |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| manual capture ตอน SHIP (unify) | tool-agnostic, zero-runtime, ต่อยอดกลไกเดิม | พึ่ง AI เสนอ + user ยืนยัน (ไม่ auto) | ✅ |
| runtime observer (hook+SQLite) | auto, ครบถ้วน | runtime หนัก, dependency, ขัดปรัชญา | — (roadmap ตัด) |

## 6. ความเสี่ยง / unknown
- ไม่มี unknown ที่ block — ปิดด้วย doc inspection

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำ:** unify capture step ใน ship.md (planned + emergent, evidence บังคับ, scope component/project, fold ยืนยันเข้า approval เดิม) + mirror command + template section; note global discipline รอ SHIP
- **ป้อนกลับ discovery.md:** D1-D5 ยืนยัน — กลไกเดิมจับเฉพาะ planned, evidence sources พร้อม, ยืมแก่น ECC แบบ manual, learned-rule ≠ troubleshooting (generalized vs incident)
