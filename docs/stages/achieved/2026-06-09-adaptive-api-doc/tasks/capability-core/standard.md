# Standard — capability-core

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern ของ capability doc กลาง

## 1. Standard กลางที่ยึด (จาก techstack)
- `docs/techstack/installer/` — payload `.md` เป็นเอกสารที่ AI execute ต่อ; ภาษาไทย (ตาม `docs/rule.md` §2)
- pattern **capability doc** ที่มีอยู่: `explore.md` / `next.md` / `codemap.md` / `init.md` — โครง: header callout "Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน" + "เป้าหมาย:" แล้วตามด้วย section มีเลข

## 2. Pattern การเขียนของ task นี้
- **โครง/naming:** ตามพี่น้อง capability doc — `# <NAME> — <หนึ่งบรรทัดว่าทำอะไร>` + blockquote header callout + section `## 1.`, `## 2.` ... (เลขคงที่ — task อื่นจะอ้าง)
- **single source:** logic ทั้งหมด (detect/mode/per-stage) อยู่ในไฟล์นี้ที่เดียว — stage playbook **ชี้กลับ** ไม่ copy (canonical-copy convention `docs/rule.md` §1)
- **adaptive:** ระบุชัดว่า "ไม่ใช่ REST API → ข้ามเงียบ" (ไม่ยัดเยียด) + "คลุมเครือ → ถาม user" (ห้ามเดา)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- มาตรฐาน OpenAPI 3.1 (ภายนอก — ไม่นิยามเอง)
- skill `openapi-spec-generation` + เครื่องมือ (Spectral/Redocly/openapi-generator) — **อ้างอิง ไม่ vendor**

## 4. เพิ่มเติมเฉพาะ task
- เป็น capability doc แบบใหม่ (ตัวแรกที่ stage **เรียกใช้แบบ conditional/auto-detect** ต่างจาก explore/next ที่ user เรียกตรง) — ถ้ารูปแบบนี้ดี อาจ generalize เป็น convention "stage-invoked capability" — note ใน `rule.md` §2 (รอ SHIP)
