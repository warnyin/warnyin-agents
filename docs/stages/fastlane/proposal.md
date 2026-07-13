# Proposal — fastlane (`/warnyin:fastlane`)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Slug** | `fastlane` |
| **ประเภท** | `feature` |
| **ขนาด** | `standard` (แตะ playbook หลายไฟล์ + surface ใหม่ + test — ไม่แตะ hard-floor 5 หมวด) |
| **วันที่** | `2026-07-13` |
| **มาจาก Discovery?** | ไม่มี (scope ชัดจากการสัมภาษณ์ใน DESIGN) |

## 1. สรุป change (what)
เพิ่ม command `/warnyin:fastlane` = **executor ของ fast tier แบบ end-to-end ในคำสั่งเดียว** — บังคับ `tier=fast` (ข้าม triage), เดิน pre-flight receipt → code-first → loop จน test เขียว + acceptance ผ่าน → เติม receipt → ship-lite + archive
กฎทั้งหมด **reuse [fast-track skip-list](../../../.warnyin/workflow/triage.md) canonical เดิม** — fastlane เป็น "ผู้เดิน" ไม่ใช่ "ผู้ตั้งกฎใหม่"

## 2. ทำไม (why)
- **ปัญหา:** fast tier มีกฎครบแล้ว แต่ยังไม่มีใครรันมันจบในทีเดียว — user ต้องสั่ง 4 command (`design`→`build`→`verify`→`ship`) สำหรับงานที่แก้ 1-2 ไฟล์ → ceremony ของ "การสั่งงาน" ยังอยู่ครบ ทั้งที่ fast tier ตั้งใจตัด ceremony ทิ้ง
- **ผลถ้าไม่ทำ:** งานเล็กยังแพงกว่าที่ควร → คนเลี่ยง workflow ไปแก้เองนอก flow → ความรู้ไม่ถูก archive/promote (เสียแก่นของ workflow)

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A. command ใหม่ = executor บาง ชี้ skip-list เดิม** (แนะนำ) | 1 คำสั่งจบ; กฎอยู่ที่เดียว (`triage.md`); `triage` ยัง read-only → regression baseline เดิมไม่พัง | ต้องแก้ hook 4 stage ให้รู้จัก executor | ✅ |
| B. ทำให้ `/warnyin:triage` auto-execute เมื่อได้ tier fast | ไม่มี surface ใหม่ | ทำลาย contract "triage read-only แนะนำแล้วหยุด" (spec ปัจจุบัน) + collapse การตัดสินใจ mis-size เข้ากับการลงมือ | |
| C. เขียน playbook fast แยกครบชุด (กฎของตัวเอง) | อิสระจาก triage | ละเมิด rule "unify-in-place ไม่สร้างกลไกขนาน" + กฎ fast แตกเป็น 2 ที่ → drift | |

- **เหตุผลที่เลือก A:** ได้ one-shot โดยไม่แตะ contract ของ triage และไม่ duplicate rubric

> **★ change นี้กลับ decision เดิมที่บันทึกไว้** — `docs/features/change-sizing/feature.md:29` + `business.md:22` เคยระบุว่า "ไม่เพิ่ม one-shot / auto-execution (เสี่ยง mis-size)"
> **สิ่งที่เปลี่ยนไป:** ตอนนั้น fast tier ยังไม่มี guard; วันนี้มี **hard-floor 5 หมวด + escalation symmetric + validator fast-mode** แล้ว → ความเสี่ยง mis-size ถูกคุมด้วยกลไก ไม่ใช่ด้วยการห้าม
> **mitigation ที่ใส่ใน design:** hard-floor scan **ก่อนแตะโค้ด** (เตือนชัด — user override ได้เพราะเป็นคนสั่งเอง แต่ต้องถูกบันทึกลง receipt) + escalate ได้กลางทางโดย topic ไม่ต้องเริ่มใหม่
> → ต้องแก้ `feature.md`/`business.md` ของ change-sizing ตอน SHIP (ไม่ปล่อยให้เอกสารขัดกันเอง)

## 4. Scope
**In scope**
- playbook `src/.warnyin/workflow/fastlane.md` (executor doc — orchestration + gate; **ไม่ลอก rubric ทั้งตารางและ prose**)
- adapter `src/.claude/commands/warnyin/fastlane.md` (user-invoked เท่านั้น ไม่ auto-invoke)
- **ผ่อน hard-floor policy 1 ระดับ** — เพิ่มข้อยกเว้น "explicit user override" (เตือน → ถาม → ยืนยัน → บันทึกลง receipt) ที่ `triage.md` (row SHIP + ใต้ skip-list), `stages/ship.md`, template `receipt.md`
- hook/pointer: `stages/{design,build,verify,ship}.md` (ยอมรับ tier fast จาก fastlane), `next.md` (route resume)
- registry: `src/.warnyin/workflow/README.md`, `src/.warnyin/installer/templates/{CLAUDE.md,codebuddy-rules.md}`
- test (falsifiable, node ล้วน) + CHANGELOG + version bump

**Out of scope**
- เปลี่ยน rubric/caps/skip-list 4 row ของ fast tier (คงเดิม — แก้เฉพาะเงื่อนไข hard-floor override)
- ทำให้ `/warnyin:triage` auto-execute หรือแนะนำ fast เมื่อแตะ hard-floor (ยัง read-only + ยังห้ามแนะนำ — override เกิดได้เฉพาะเมื่อ user สั่ง fastlane เอง)
- auto-invoke fastlane เอง (stateful + irreversible → command user-only ตาม `docs/rule.md:10`)
- แตะ git (branch/commit/worktree) — fastlane แก้บน working tree ปัจจุบัน; merge โค้ด/PR อยู่นอก workflow ตามเดิม

## 5. ผลกระทบ & ความเสี่ยง
- **กระทบ:** feature `change-sizing` (route + skip-list + **hard-floor requirement** → มี Spec delta 2 ข้อ), stage playbook 4 ไฟล์, template receipt, `docs/rule.md:26` (แก้ตอน SHIP)
- **เสี่ยง 1 — mis-size:** user สั่ง fastlane กับงานที่จริงๆ ใหญ่ → *ลด:* hard-floor gate ถาม user ก่อนแตะโค้ด + escalate ได้กลางทาง (เติม artifact ที่ข้ามไป ไม่ต้องเริ่มใหม่)
- **เสี่ยง 2 — กฎ drift 2 ที่:** *ลด:* `fastlane.md` ห้ามมีตาราง/prose ที่ซ้ำ skip-list (test negative-grep ด้วย string เอกลักษณ์)
- **เสี่ยง 3 — goalpost moving:** เขียน acceptance หลังแก้เสร็จ = acceptance ที่ fit กับผลลัพธ์ → *ลด:* receipt §1+§2 เขียน **ก่อนแตะโค้ด** + resume ห้ามเขียนทับ
- **เสี่ยง 4 — ผ่อน hard-floor = ลด guard ของงานอ่อนไหว:** *ลด:* override ต้องเป็น **explicit 2 ชั้น** (user สั่ง fastlane เอง + ยืนยันซ้ำหลังถูกเตือน) + ถูกบันทึกถาวรใน receipt (audit trail) + `/warnyin:triage` ยังห้ามแนะนำ fast เหมือนเดิม
- **เสี่ยง 5 — one-shot จบด้วย archive (irreversible):** *ลด:* archive เป็นขั้นสุดท้ายหลัง gate เขียวเท่านั้น + promote learned rule ยังต้อง user ยืนยัน (ตาม `ship.md` เดิม)

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Business: `./business.md`
