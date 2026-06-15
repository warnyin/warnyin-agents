# Proposal — Ponytail Minimalism (principle "เขียนโค้ดน้อยที่สุด" ฝังใน workflow)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `ponytail-minimalism` |
| **ประเภท** | `docs` (playbook/payload — เปลี่ยนพฤติกรรม agent ที่เดินผ่าน workflow) |
| **ขนาด** | `standard` (cross-cutting หลาย surface + เพิ่ม shipped artifact; ไม่มี hard-floor) |
| **วันที่** | `2026-06-15` |
| **มาจาก Discovery?** | `./discovery.md` |

## 1. สรุป change (what)
> เพิ่ม **principle กลางตัวใหม่** `minimalism.md` ใน playbook (top-level ของ `.warnyin/workflow/`) ที่ตกผลึกปรัชญา "lazy senior dev" จาก `ponytail` — decision hierarchy 6 ขั้น + guardrail "lazy not negligent" + over-engineering lens — แล้วให้ surface ฝั่งผลิต (developer role, build context/stage) และฝั่งตรวจ (review context, verify stage) **ลิงก์มาที่ไฟล์แกนเดียว** (pointer บาง ไม่ duplicate); ship ไป downstream ทุก install + mirror dogfood + ผ่าน gate

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** AI agent มีแนวโน้ม over-engineer (custom สิ่งที่ stdlib/native ทำได้, เพิ่ม abstraction ที่ยังไม่จำเป็น, เขียนเกิน spec) → โค้ดบวม cost/เวลาสูง รีวิวยาก. `ponytail` พิสูจน์ว่า decision hierarchy ชัดๆ ลดโค้ด 80-94%. workflow เรามี *seed* กระจัดกระจาย (build context "reuse ก่อนเขียนใหม่", developer "ไม่แถมสิ่งที่ไม่ได้ขอ") แต่ยังไม่มีลำดับ stdlib→native→dep→one-liner ที่ชัด และไม่มี guardrail กันตัดเกิน
- **ผลถ้าไม่ทำ:** ทุก install ยังเสี่ยง output บวมตามสันดาน LLM; seed ที่มีอยู่กระจัดกระจาย ไม่ถูกใช้เป็นแกนร่วม; พลาดโอกาสยกระดับคุณภาพ output ของ "ways of work กลาง" โดยไม่มี cost (zero-config/zero-dep)

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A (แนะนำ): ฝัง principle native — ไฟล์แกนเดียว top-level + pointer** | zero-dep, ตรง unify-in-place/canonical-copy, ship ทุก install, แก้ที่เดียว | ต้องเขียน principle เอง + คุม token-lean | ✅ |
| B: bundle ponytail plugin จริง | ได้ของครบทันที | ขัด zero-dependency, ผูก dependency นอก, เป็นโค้ด JS ไม่ใช่ playbook | ❌ |
| C: copy ปรัชญาเข้าหลายไฟล์ (build/developer/review) ตรงๆ | ไม่เพิ่มไฟล์ | duplicate logic ผิด CLAUDE.md/canonical-copy, drift ง่าย | ❌ |
| D: เพิ่ม intensity levels + command (เลียน ponytail) | ยืดหยุ่น | เพิ่ม state/command/โค้ด ขัด zero-config + ขัด minimalism ที่กำลังสอน | ❌ |

- **เหตุผลที่เลือก A:** สอดคล้องกฎ repo ครบ — `unify-in-place` (รวม seed กระจัดกระจายเป็นแกนเดียว ไม่สร้างกลไกขนาน), `canonical-copy` (นิยามที่เดียว ที่อื่น pointer), `กระทัดรัด opinionated` (top-level doc เหมือน triage.md/api-doc.md ไม่เพิ่ม folder), `zero-dependency` (เอกสารล้วน)

## 4. Scope
**In scope**
- ไฟล์แกน `src/.warnyin/workflow/minimalism.md`: decision hierarchy 6 ขั้น + guardrail "lazy not negligent" + over-engineering review lens + 1 ตัวอย่าง before/after สั้น (เป็นทั้งสื่อสอน + evidence)
- Pointer บางจาก surface ฝั่งผลิต: `roles/developer.md` (checklist), `contexts/build.md` (posture), `stages/build.md` (§3 operating principle — pointer บรรทัดเดียว)
- Pointer บางจาก surface ฝั่งตรวจ: `contexts/review.md` (over-engineering lens → ชี้แกน), `stages/verify.md` (§3 operating principle — pointer บรรทัดเดียว, **ไม่เพิ่ม hard gate item**)
- Register ไฟล์ใน `workflow/README.md` (ตารางโครงสร้าง + บรรทัดอธิบาย)
- Mirror src→root (`npm run setup:dogfood` หรือเทียบเท่า) + ผ่าน `npm test` / `verify:pack` / `lint:md` (dead-link)
- CHANGELOG entry (payload เปลี่ยน = user-facing)

**Out of scope**
- ❌ bundle/install ponytail plugin จริง
- ❌ intensity levels (lite/full/ultra/off) + command สลับ
- ❌ debt marker `ponytail:` + `/ponytail-debt`
- ❌ benchmark harness
- ❌ slash command ใหม่ (`/ponytail-review`, `/ponytail-audit`)
- ❌ เพิ่ม hard gate item ใน verify.md §6 (ใช้ pointer ใน posture แทน — ยืนยันกับ user แล้ว)
- ❌ แตะ DESIGN/SHIP stage playbook (principle โฟกัส generate+review; DESIGN มี vertical-slice/DAG-width คุม scope อยู่แล้ว)

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** `roles/developer.md`, `contexts/build.md`, `contexts/review.md`, `stages/build.md`, `stages/verify.md`, `workflow/README.md` — ทุกจุดเป็น **เพิ่ม pointer บรรทัดสั้น** ไม่แก้ logic เดิม (backward compatible); ไม่กระทบ command/script/installer
- **ความเสี่ยง + วิธีลด:**
  - *บวมจนขัดหลักเอง* → คุม minimalism.md ให้ token-lean (เทียบสเกล triage.md/api-doc.md); reviewer ตรวจ
  - *over-cut (ตัด validation/security)* → guardrail "lazy not negligent" ต้องเด่น เป็น box แรกๆ ของไฟล์
  - *duplicate ผิดกฎ* → ทุก surface เป็น pointer เท่านั้น (lint-md dead-link gate ช่วยจับ link เสีย)
  - *drift src↔root* → mirror + `verify:pack` เป็น gate; canonical = `src/` เท่านั้น
  - *tool-agnostic* → ห้ามผูกชื่อรุ่น/tool ใน minimalism.md (vocab generic) ตาม rule payload-guidance

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Discovery: `./discovery.md` · Research: `./research.md`
- แหล่งต้นทาง: https://github.com/DietrichGebert/ponytail
