# Discovery — defensive-rules (เสริม 2 กฎเชิงป้องกันใน BUILD/VERIFY)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `defensive-rules` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-07 |
| **ผู้ร่วมตัดสินใจ** | user (smf.claude) + AI |
| **เริ่มจาก** | `docs/roadmap.md` P1 #6 · `docs/rule.md` §1 ("ห้ามเดา") |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> เสริม **2 กฎเชิงป้องกัน** เป็น **rule ใน playbook (portable `.md`)** ไม่ใช่ vendor hook — (1) **investigate-before-edit**: ก่อนแก้ไฟล์ที่มีอยู่ต้องเข้าใจก่อน (ใครใช้/อ่าน, schema/contract, เจตนาเดิม), (2) **config-protection**: ห้ามแก้ config linter/formatter/test "เพื่อให้ผ่าน" แทนการแก้โค้ดจริง — ทั้งคู่คือ **เวอร์ชัน enforce ของ "ห้ามเดา"** (`docs/rule.md` §1)

## 2. Problem & Why now
- **ปัญหา/โอกาส:** "ห้ามเดา" เป็นปรัชญาแก่น แต่ตอน BUILD/VERIFY ยังไม่มีกฎรูปธรรมดัก 2 พฤติกรรมเสี่ยงที่พบบ่อยสุด: (ก) แก้ไฟล์โดยไม่เข้าใจบริบท (พังของที่ผูกอยู่), (ข) แก้ config/test ให้เขียวแทนแก้โค้ด (false-green ซ่อน defect)
- **ทำไมตอนนี้:** roadmap P1 #6 — ECC hook `gateguard-fact-force` + `config-protection` พิสูจน์ว่าเป็น failure mode จริง; เราทำเป็น **rule portable** (ทุก harness ได้, ไม่ผูก Claude hook)
- **ผูกเป้าหมายโปรเจกต์:** `docs/project.md` + `rule.md` §1 — tool-agnostic, opinionated, ห้ามเดา (กฎนี้ขยาย enforce)

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- เพิ่ม **operating principle** 2 ข้อใน `src/.warnyin/workflow/stages/build.md` §3 + `verify.md` §3 (ทั้งคู่มี edit loop)
- เพิ่ม **checklist line** ใน `src/.warnyin/workflow/roles/developer.md` (BUILD) + `qa.md` (VERIFY)
- **note global rule** 1 บรรทัด ขยาย `docs/rule.md` §1 "ห้ามเดา" → รอ SHIP promote (ไม่แตะ docs/rule.md ตอน BUILD)

**Out of scope (จะไม่ทำ)**
- **vendor hook** (Claude-only `gateguard`/`config-protection` แบบ ECC) — เราเลือก rule portable (D1)
- **Gate checklist item ใหม่** ใน BUILD/VERIFY Gate (D4 — กัน Gate บวม; enforce ผ่าน principle+checklist พอ)
- documented-investigation ceremony หนักต่อการแก้แต่ละไฟล์ (D2 — เลือกเบา)
- runtime enforcement / lint tool ตรวจอัตโนมัติ (เป็น rule ที่ AI อ่าน ไม่ใช่โปรแกรม)

## 4. Decision Log
| # | ประเด็น | ทางเลือก | เลือกจริง | เหตุผล |
|---|---|---|---|---|
| 1 | placement | playbook+role+global / playbook+role / global-only | **playbook §3 + role checklist + note global rule.md §1** | ครอบทั้ง enforce point ที่ AI อ่านจริง (principle ตอนเริ่ม stage + checklist ก่อนส่งงาน + ปรัชญากลาง) |
| 2 | น้ำหนัก investigate-before-edit | เบา / หนัก (documented) | **เบา — 1 principle + 1 checklist line** | เคารพ "กระทัดรัด opinionated"; documented ceremony เสียดทานเกินคุณค่า |
| 3 | ท่าที config-protection | ห้ามเพื่อเลี่ยง(แก้จริงได้) / ห้ามเด็ดขาด | **ห้ามแก้ "เพื่อให้ผ่าน"; config ผิดจริงแก้ได้ พร้อมเหตุผล + note** | จริงจังกับ false-green โดยไม่บล็อกการแก้ config ที่ควรแก้ |
| 4 | Gate item? | เพิ่ม Gate / principle+checklist พอ | **principle + role checklist พอ — ไม่เพิ่ม Gate item** | กัน Gate บวม; rule enforce ผ่าน checklist ที่ส่งงานอยู่แล้ว |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** AI อ่าน operating principle ใน playbook §3 + role checklist ตอนทำ stage (เหมือน rule อื่นที่มีอยู่)
- **ข้อจำกัด:** 2-layer — แก้ใน `src/.warnyin/workflow/` (publish) เท่านั้น; root dogfood = release (รอ publish); docs/rule.md เป็น central → ห้ามแตะตอน BUILD, note รอ SHIP
- rule ต้อง **กระทัดรัด** (เพิ่มน้อยบรรทัด) ไม่ทำให้ playbook บวม

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- 2 principle ปรากฏใน `build.md` §3 + `verify.md` §3 (wording ตรง D2 เบา + D3 config)
- checklist line เพิ่มใน `developer.md` + `qa.md`
- global rule bullet ถูก note ใน `tasks/*/rule.md` §2 (รอ SHIP) — SHIP promote เข้า `docs/rule.md` §1
- `npm test` 18/18 + `verify:pack` เขียว (ไม่กระทบ test เดิม — ไม่มี assertion อ้าง playbook content)

## 7. Feature ideas / ทางเลือกของวิธีแก้
- wording investigate-before-edit (เบา): "ก่อนแก้ไฟล์ที่มีอยู่ → รู้ก่อน: ใครใช้/อ่านไฟล์นี้, schema/contract/สัญญาของมัน, เจตนาเดิม — แก้โดยไม่เข้าใจ = เดา"
- wording config-protection: "ห้ามแก้ config (linter/formatter/test threshold) หรือ disable rule เพื่อให้ build/test ผ่าน แทนการแก้โค้ดจริง; ถ้า config ผิดจริง → แก้ได้แต่ต้องมีเหตุผลชัด + note (ไม่ใช่เพื่อเลี่ยง finding)"
- slice (design detail): อาจ 1 task (4 ไฟล์ payload) หรือ 2 slice (playbook principles / role checklists)

## 8. Open questions
- ไม่มี open question ที่ block — scope + placement + wording ปิดครบ (slice เป็น design detail)

## 9. ความเสี่ยงหลัก
- **ต่ำ** — `.md` ล้วน ไม่แตะ runtime/installer; ความเสี่ยง = rule ซ้ำซ้อน/ขัด "ห้ามเดา" เดิม → mitigate: ผูกเป็น "enforce ของ ห้ามเดา" ชัดเจน, เพิ่มน้อยบรรทัด

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- `docs/roadmap.md` P1 #6 · `docs/rule.md` §1 · `.warnyin/workflow/stages/{build,verify}.md` · `roles/{developer,qa}.md`

---

## ✅ Gate → DESIGN
- [x] Problem / why-now ชัด ผูกกับ project.md/rule.md
- [x] Scope in/out ชัด
- [x] Decision log ปิดครบ 4 ประเด็น ไม่มี open question block
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (2026-06-07 — invoke /warnyin:design)
