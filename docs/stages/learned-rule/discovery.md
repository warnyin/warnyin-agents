# Discovery — learned-rule (instinct แบบ manual ใน SHIP)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `learned-rule` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-07 |
| **ผู้ร่วมตัดสินใจ** | user (smf.claude) + AI |
| **เริ่มจาก** | `docs/roadmap.md` P1 #8 · `.warnyin/workflow/stages/ship.md` · กลไก "รอ SHIP" |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> เพิ่ม **learned-rule capture step** ใน SHIP (unify กับ note "รอ SHIP" เดิม) — รวม rule ที่ **วางแผนตอน DESIGN** + rule ที่ **โผล่ตอน BUILD/VERIFY** (instinct) ทุกตัวต้องมี **rule + evidence (concrete pointer, บังคับ) + scope (component/project)** แล้ว **user ยืนยันเอง** (fold เข้า approval เดิมของ SHIP) ก่อน promote เข้าเอกสารกลาง — manual ไม่มี runtime observer (ยืมแก่น ECC instinct ~80%)

## 2. Problem & Why now
- **ปัญหา/โอกาส:** กลไก promote rule ปัจจุบันจับเฉพาะ rule ที่ **note ล่วงหน้าใน DESIGN** (`tasks/*/rule.md` §2 "รอ SHIP") — แต่ "instinct" จริงมักเกิด **ตอนลงมือ** (BUILD/VERIFY: เจอ pattern ซ้ำ, แก้แล้วได้บทเรียน, เกือบพลาด); บทเรียนพวกนี้กระจัดกระจาย (`troubleshooting.md` หรือหายไป) ไม่มีจุดจับเป็น **rule ถาวร** อย่างตั้งใจ
- **ทำไมตอนนี้:** roadmap P1 #8; SHIP เป็นจุด natural ที่ทบทวนทั้ง topic อยู่แล้ว — เติม discipline จับ learned-rule ได้คุณค่าสูง ต้นทุนต่ำ
- **ผูกเป้าหมายโปรเจกต์:** ต่อยอดกลไก promote-to-`docs/` ที่มีอยู่ (`docs/project.md`: playbook 5 stage เป็นแก่น); คง **manual/tool-agnostic** — ไม่มี hook+SQLite runtime observer ที่ขัดปรัชญา (out ของ project.md: "ไม่ใช่โปรแกรมที่รัน")

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- **playbook** `src/.warnyin/workflow/stages/ship.md` — เพิ่ม learned-rule capture: รวบรวม candidate จาก (1) `tasks/*/rule.md` §2 + (2) `build.md`/`verify.md`/`troubleshooting.md` (emergent) → ทุกตัว rule+evidence+scope; fold เข้า approval เดิม (§5 process); +gate item (§6); ขยาย principle 7 (§3) "รอ SHIP → รวม learned"
- **command** `src/.claude/commands/warnyin/ship.md` — mirror: step 3 (collect emergent candidate) + step 5 (fold learned-rule table เข้า approval)
- **template** `.warnyin/template/stages/[topic]/ship.md` — +section "Learned rules" (ตาราง: rule | evidence | scope | promote?)
- note global bullet (รอ SHIP) ใน `docs/rule.md` §1 — discipline "ความรู้ที่ได้ตอนทำ → จับเป็น rule ที่ SHIP ด้วย evidence + user-confirm"

**Out of scope (จะไม่ทำในรอบนี้)**
- runtime observer / hook / SQLite / auto-detect (ยืมแก่น manual เท่านั้น — roadmap)
- scope level ใหม่นอก component/project (D2)
- separate artifact file / separate gate ยืนยัน (D1, D4 — unify + fold)
- เปลี่ยน promote target (reuse `docs/rule.md` + `docs/techstack/*/rule.md` เดิม)
- แตะ `docs/rule.md` central ตอน BUILD (รอ SHIP)

## 4. Decision Log
| # | ประเด็น | ทางเลือก | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|
| 1 | artifact & ความสัมพันธ์กับ "รอ SHIP" | unify / separate file | **Unify — capture step เดียว** | รวม planned + emergent, artifact เดียวไม่ซ้ำ/สับสน |
| 2 | scope levels | 2 (component/project) / 3 (+workflow-global) | **2 ระดับ: component / project** | ตรง promote target เดิม, generic ทุกโปรเจกต์ ("global" ใน roadmap = project-wide `docs/rule.md`) |
| 3 | evidence | บังคับ+pointer / แนะนำ | **บังคับ + concrete pointer** | กัน rule ลอย/เดา — สอด "ห้ามเดา"; ไม่มี evidence = ไม่ promote |
| 4 | user ยืนยัน | fold เข้า approval เดิม / gate แยก | **Fold เข้า SHIP approval เดิม** | reuse AskUserQuestion เดิม, ไม่เพิ่ม gate ซ้อน |
| 5 | change surface | 3 (playbook+command+template) / 2 | **3 จุด** | playbook=นิยาม, command=สั่ง AI ทำจริง, template=ที่ artifact ลง |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** AI (ตอน SHIP) เสนอ learned-rule candidate จาก evidence จริงใน topic; **user เป็นคนยืนยัน** (ไม่ auto-promote); evidence อ้าง artifact ที่มีอยู่ (build/verify/troubleshooting/diff)
- **ข้อจำกัด:** 2-layer — แก้ `src/.warnyin/workflow/` + `src/.claude/commands/` + template เท่านั้น; `docs/rule.md` central รอ SHIP; กระทัดรัด (ไม่บวม ship.md); manual (พึ่ง AI อ่าน playbook + user ยืนยัน — ไม่ auto-enforce)

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- `ship.md` playbook มี learned-rule capture (รวม planned `tasks/*/rule.md` §2 + emergent จาก build/verify/troubleshooting) — ทุกตัว rule+evidence+scope
- evidence **บังคับ** ระบุชัดใน playbook (ไม่มี = ไม่ promote)
- user ยืนยัน per-rule fold ใน approval เดิม (§5)
- gate §6 มี item "learned-rules พิจารณาครบ — promote/ตัดทิ้งพร้อมเหตุผล"
- command `ship.md` mirror playbook (step 3 + 5)
- template `[topic]/ship.md` มี section "Learned rules" (rule|evidence|scope|promote?)
- global bullet note ใน `tasks/*/rule.md` §2 (รอ SHIP → `docs/rule.md` §1)
- `npm test` 18/18 + `verify:pack` เขียว

## 7. Feature ideas / ทางเลือกของวิธีแก้
- learned-rule entry format: `| rule | evidence (ที่มา+ลิงก์ artifact) | scope (component:<c> / project) | promote? (✅/✂️+เหตุผล) |`
- capture sources (emergent): `build.md` (pattern แก้ซ้ำ), `verify.md` (รอบแก้/บทเรียน), `troubleshooting.md` (ปัญหายาก→กันซ้ำ = candidate rule ชัดสุด), diff/commit
- principle 7 ขยาย: "เก็บ 'รอ SHIP' + learned ให้หมด — ทั้ง planned (tasks rule.md §2) และ emergent (build/verify/troubleshooting) ต้องพิจารณาครบ ทุกตัวมี evidence+scope, user ยืนยันก่อน promote"
- slice (design detail): 1 task (3 ไฟล์ unify wording) หรือแยก — เป็น design detail

## 8. Open questions (ที่ยังค้าง)
- ไม่มี open question ที่ block — scope/format/surface ปิดครบ (slice เป็น design detail)

## 9. ความเสี่ยงหลัก
- **ต่ำ** — `.md` ล้วน ไม่แตะ runtime/installer; ความเสี่ยง = (1) ship.md บวม (เลี่ยง: unify ต่อยอดกลไกเดิม ไม่สร้างกลไกขนาน) (2) ซ้ำ troubleshooting (เลี่ยง: troubleshooting = ปัญหา-วิธีแก้; learned-rule = กฎถาวรที่ generalize จากบทเรียน — คนละ abstraction) (3) AI เดา rule เอง (เลี่ยง: evidence บังคับ + user ยืนยัน)

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- `docs/roadmap.md` P1 #8 · `.warnyin/workflow/stages/ship.md` · `src/.claude/commands/warnyin/ship.md` · `.warnyin/template/stages/[topic]/ship.md` · กลไก `tasks/*/rule.md` §2

---

## ✅ Gate → DESIGN
- [x] Problem / why-now ชัด ผูกกับ project.md/roadmap
- [x] Scope in/out ชัด
- [x] Decision log ปิดครบ 5 ประเด็น ไม่มี open question block
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (2026-06-07)
