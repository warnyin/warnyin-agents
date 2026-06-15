# Discovery — Ponytail Minimalism (ฝังปรัชญา "เขียนโค้ดน้อยที่สุด" เข้า Warnyin Workflow)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `ponytail-minimalism` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | `2026-06-15` |
| **ผู้ร่วมตัดสินใจ** | `rujiroj.ta` |
| **เริ่มจาก** | `docs/project.md` — เป้าหมาย "ways of work กลาง" + ข้อจำกัด zero-dependency / self-hosting (src↔root) |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> ตกผลึก *ประโยชน์* จาก `ponytail` (ปรัชญา "lazy senior dev" — เขียนโค้ดน้อยที่สุดเท่าที่จำเป็น) แล้วฝังเป็น **principle กลาง native** ของ Warnyin Standard Workflow ให้ AI agent ทุกตัวที่ทำงานผ่าน playbook เขียนโค้ดกระชับขึ้น — โดยไม่พึ่ง plugin ภายนอก (รักษา zero-dependency) และให้ ship ไปกับทุก `npx @warnyin/agents`

## 2. Problem & Why now
- **ปัญหา / โอกาส:** AI agent มีแนวโน้ม over-engineer (เขียนเกินที่ขอ, custom สิ่งที่ stdlib/native ทำได้, เพิ่ม abstraction ที่ยังไม่จำเป็น) → โค้ดบวม, cost/เวลาสูง, รีวิวยาก. `ponytail` แสดงให้เห็นว่า decision hierarchy ที่ชัดเจนลดโค้ดได้ 80-94% และลด cost 47-77%
- **ทำไมต้องทำตอนนี้:** `@warnyin/agents` เป็น playbook กลางที่ AI agent อ่านตอน DESIGN/BUILD/VERIFY อยู่แล้ว — เป็น "เจ้าบ้าน" ที่เหมาะที่สุดสำหรับ ruleset แบบนี้ และเรามี seed อยู่แล้ว (build context/developer role) แค่ยังไม่ตกผลึกเป็น hierarchy ที่ชัด
- **ผูกกับเป้าหมายโปรเจกต์:** ตรงเป้า "ติดตั้งแล้ว ways of work กลางใช้ได้ครบ" — เพิ่มคุณภาพ output ของทุก install โดยไม่เพิ่ม config (zero-config) และไม่เพิ่ม dependency

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- **principle กลาง** เป็น single-source artifact ใน `src/.warnyin/workflow/` (ship ไป downstream): decision hierarchy + หลักคุมเพดาน "lazy not negligent"
- **ฝั่งผลิต (BUILD):** เสริม `contexts/build.md` + `roles/developer.md` ให้อ้าง principle ตอน generate โค้ด
- **ฝั่งตรวจ (VERIFY/review):** เพิ่ม lens "จับ over-engineering / bloat" ใน `contexts/review.md` + จุดที่เกี่ยวใน `stages/verify.md`
- ทุกจุดข้างบน *ลิงก์* มาที่ไฟล์แกนเดียว (DRY ตาม CLAUDE.md — ห้าม duplicate logic)
- mirror การแก้จาก `src/` ลง dogfood ที่ root (ตามสถาปัตยกรรม 2-layer) + ผ่าน verify-pack

**Out of scope (จะไม่ทำในรอบนี้)**
- ❌ ติดตั้ง/bundle ponytail plugin จริง (ขัด zero-dependency)
- ❌ intensity levels lite/full/ultra/off + command สลับระดับ (เลือก always-on ระดับเดียว, zero-config)
- ❌ debt marker `ponytail:` + `/ponytail-debt` (track shortcut) — ใช้กลไก note/troubleshooting เดิมแทน ถ้าจำเป็นค่อยพิจารณารอบหน้า
- ❌ benchmark harness วัดผลจริงแบบ ponytail (หนัก + ขัด minimalism เอง)
- ❌ slash command ใหม่ (`/ponytail-review`, `/ponytail-audit`) — ใช้ flow VERIFY/review เดิม

## 4. Decision Log (เดินทีละกิ่งของ decision tree)
> หนึ่งแถว = หนึ่งการตัดสินใจ บันทึกทันทีที่ตกลงได้

| # | คำถาม / ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| 1 | รูปแบบการเอามาใช้ | ฝังแนวคิด native / ติดตั้ง plugin / ให้ช่วยวิเคราะห์ | ฝังแนวคิด native | **ฝังแนวคิด native** | zero-dependency + self-hosting — หยิบ "ปรัชญา" ไม่ใช่ "โค้ด" ของ ponytail |
| 2 | จุดที่จะฝัง (scope in) | rule กลาง / BUILD / VERIFY / debt marker | rule + BUILD + VERIFY | **rule + BUILD + VERIFY** (ตัด debt marker) | ครอบทั้งฝั่งผลิต+ฝั่งตรวจ; debt marker ซ้ำกับ note/troubleshooting เดิม |
| 3 | rule กลางอยู่ชั้นไหน | src/.warnyin/workflow (ship) / docs/ เฉพาะ repo / ทั้งสอง | ship ใน src/ | **ship ใน src/.warnyin/workflow/** | เป็น product feature — ทุก install ควรได้ minimalism; ต้องผ่าน verify-pack/dogfood |
| 4 | intensity levels | ไม่เอา (always-on) / 4 ระดับ / on-off | ไม่เอา always-on | **always-on ระดับเดียว** | zero-config; ปรับความเข้มผ่าน triage tier เดิมได้; เพิ่มปุ่ม = ขัด minimalism ที่กำลังสอน |
| 5 | รูปทรง artifact | ไฟล์แกนเดียว+ลิงก์ / fold ลงไฟล์เดิม / ให้ DESIGN ตัดสิน | ไฟล์แกนเดียว+ลิงก์ | **ไฟล์แกนเดียว + ลิงก์จากทุกจุด** | DRY ตาม CLAUDE.md (single source of truth, ห้าม duplicate logic) |
| 6 | เกณฑ์ความสำเร็จ | dogfood+before/after / benchmark จริง / verify-pack พอ | dogfood + before/after | **dogfood gate + 1 ตัวอย่าง before/after** | repo เป็น playbook ไม่ใช่ runtime — benchmark หนักเกิน; ต้องมีหลักฐานเชิงรูปธรรมอย่างน้อย 1 |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** การฝัง principle ใน playbook (สิ่งที่ AI อ่านก่อนทำงาน) มีผลต่อพฤติกรรม generation จริง (เหมือนที่ ponytail ใช้ ruleset เป็น context) — วัดเชิงคุณภาพผ่านตัวอย่าง before/after
- **ข้อจำกัด:**
  - zero-dependency — ใช้เฉพาะเอกสาร/playbook ไม่เพิ่มแพ็กเกจ
  - 2-layer bootstrap — แก้ที่ `src/.warnyin/workflow/` แล้ว mirror ลง root dogfood; ต้องไม่ duplicate logic
  - ต้องไม่ทำให้ playbook ยาว/บวมจนขัดหลักเอง — principle ต้อง token-lean
  - ต้องผ่าน verify-pack (payload ครบ) เป็น gate ก่อน publish

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- [ ] มีไฟล์ principle แกนเดียวใน `src/.warnyin/workflow/` (เช่น `principles/minimalism.md`) บรรจุ decision hierarchy + "lazy not negligent"
- [ ] `contexts/build.md`, `roles/developer.md`, `contexts/review.md`, `stages/verify.md` *ลิงก์* มาที่ไฟล์แกน (ไม่ copy เนื้อหา) — ตรวจว่าไม่มี logic ซ้ำ
- [ ] dogfood ที่ root ถูก mirror ตรงกับ src/ + `npm test` / verify-pack เขียว
- [ ] มีตัวอย่าง before/after อย่างน้อย 1 ชุด แสดงว่า principle ทำให้ output กระชับลงจริง
- [ ] principle ทั้งไฟล์ token-lean (ไม่ทำให้ playbook บวมเกินจำเป็น)

## 7. Feature ideas / ทางเลือกของวิธีแก้
> ส่งต่อให้ DESIGN พิจารณา (ยังไม่ลงรายละเอียด)
- ไฟล์ `principles/minimalism.md` (layer ใหม่ "principles") เป็น single source — หรือถ้า DESIGN เห็นว่าไม่อยากเพิ่ม layer ให้ fold เป็น section ในที่เหมาะสม (ตัดสินตอน DESIGN)
- decision hierarchy เขียนแบบ checklist สั้น: `ต้องมีไหม?→ข้าม(YAGNI)` → `stdlib?` → `native?` → `dep ที่ลงแล้ว?` → `one-liner?` → `ค่อยเขียนเองขั้นต่ำ`
- guardrail box "lazy not negligent": validation ที่ trust-boundary / data-loss / security / accessibility = ห้ามตัด
- VERIFY/review lens: เพิ่ม bullet "มี over-engineering/abstraction ที่ยังไม่จำเป็นไหม? ตัดได้ไหมโดยไม่เสีย acceptance"
- (อนาคต) before/after ตัวอย่างเก็บใน `docs/` หรือ examples topic เดิม

## 8. Open questions (ที่ยังค้าง)
> ปิดครบแล้ว — ไม่มีข้อ block การออกแบบ
- [x] รูปแบบการเอามาใช้ → ฝัง native
- [x] scope จุดฝัง → rule + BUILD + VERIFY
- [x] ชั้นที่วาง → src/ (ship)
- [x] intensity → always-on
- [x] artifact shape → ไฟล์แกนเดียว + ลิงก์
- [x] success criteria → dogfood + before/after
- [ ] (ฝาก DESIGN) ชื่อ/ตำแหน่งไฟล์แกนจริง: เพิ่ม folder `principles/` หรือวางที่อื่น — direction = "single source + ลิงก์"

## 9. ความเสี่ยงหลัก
- **เสี่ยงบวม:** เพิ่ม principle ยาวเกินไปจนขัดหลัก minimalism เอง → คุมด้วย token-lean + รีวิวตัวเอง
- **เสี่ยง over-cut:** agent ตัดมากเกินจน "negligent" (ตัด validation/security) → guardrail "lazy not negligent" ต้องเด่นชัด
- **เสี่ยง duplicate:** copy เนื้อหา principle ไปหลายไฟล์ → ผิดกฎ DRY ของ CLAUDE.md → ใช้ลิงก์เท่านั้น
- **เสี่ยง drift src↔root:** ลืม mirror dogfood → verify-pack เป็น gate กัน

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- เอกสารโปรเจกต์: `docs/project.md`, `CLAUDE.md`, `docs/rule.md`
- โค้ด/ไฟล์ที่ตรวจสอบ: `.warnyin/workflow/contexts/build.md`, `.warnyin/workflow/roles/developer.md`, `.warnyin/workflow/contexts/review.md`, `.warnyin/workflow/contexts/README.md`
- แหล่งต้นทาง: https://github.com/DietrichGebert/ponytail

---

## ✅ Gate → DESIGN (ดู `.warnyin/workflow/stages/discovery.md` ข้อ 6)
- [x] Problem / why-now ชัด ผูกกับ project.md
- [x] Scope in/out ชัด
- [x] Decision log ปิดทุกประเด็นสำคัญ ไม่มี open question ที่ block (ข้อค้างเดียวเป็นรายละเอียดที่ฝาก DESIGN)
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [ ] user ยืนยัน "เข้าใจตรงกันแล้ว" ← รอยืนยันปิด gate
