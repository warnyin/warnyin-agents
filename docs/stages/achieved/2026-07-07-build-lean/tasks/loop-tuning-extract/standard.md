# Standard — loop-tuning-extract

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack)

- **ภาษาไทย** — เนื้อหา/คอมเมนต์เป็นภาษาไทยตามสไตล์ payload ทั้ง repo (`docs/rule.md` §2)
- **mirror layout `src/` = target paths** — วางที่ `src/.warnyin/workflow/loop-tuning.md` → install แล้วเป็น `.warnyin/workflow/loop-tuning.md` (top-level ใน `workflow/` เหมือน `triage.md`/`minimalism.md`/`api-doc.md` — ไม่ต้องแก้ packaging เพราะ `package.json files` allowlist ครอบ `src/.warnyin` ทั้งก้อนอยู่แล้ว)
- **tool-agnostic** — vocab generic ไม่ผูกชื่อรุ่น/ผลิตภัณฑ์ของ harness

## 2. Pattern การเขียนของ task นี้ (รูปแบบไฟล์ principle เดี่ยวใน `workflow/`)

> ดู `src/.warnyin/workflow/minimalism.md` เป็น **reference รูปแบบ** (principle file เดี่ยว)

- **โครง:** H1 ชื่อ principle → blockquote callout ใต้ title (บอกว่าไฟล์นี้คือใครอ่าน/ใช้เมื่อไหร่ + "surface อื่นชี้กลับที่นี่ด้วย pointer ไม่ copy ซ้ำ") → `---` คั่น section → เนื้อ theory → pointer ขาออก
- **callout ของไฟล์นี้ต้องระบุ:** orchestrator-only — ผู้อ่าน = main loop ตอน fix loop มี finding >1; ไม่ใช่ playbook ที่ build/verify agent ต้องอ่านก่อนทำงาน
- **สั้นกระชับ:** เนื้อ = theory ที่ย้ายมาเท่านั้น ไม่แต่งเพิ่ม ไม่เพิ่มตัวอย่าง/section เกินจาก source (minimalism: เขียนน้อยที่สุดเท่าที่จำเป็น)
- **สัญลักษณ์คงเดิมจาก source:** `★` / `⚠` / `·` ใช้ตามเนื้อ block เดิม (คงคำสำคัญที่ spec เดิม grep เช่น "credit horizon", "⚠ batch ใหญ่ ≠ ดีกว่าเสมอ")

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)

- **link ทุกตัวเป็น markdown link เท่านั้น** (`[ข้อความ](path.md)`) — inline code เปล่าจะหลุด dead-link gate (`lint:md`)
- relative path จากตำแหน่งไฟล์ (`src/.warnyin/workflow/`): sibling → `triage.md` · stage playbook → `stages/build.md`, `stages/verify.md`
- **ไม่ duplicate:** ตาราง default-by-tier อยู่ `triage.md §2C` ที่เดียว (ชี้ link) · report requirement wording อยู่ `build.md`/`verify.md` (ชี้ link) — ไฟล์นี้ถือเฉพาะ **why/theory**

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)

- ไม่มี pattern ใหม่ — ทำตามแบบ principle file ที่มีอยู่ (`minimalism.md`) เท่านั้น
