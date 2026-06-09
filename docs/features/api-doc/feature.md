# Feature — Adaptive API documentation (OpenAPI 3.1)

> ความรู้ถาวรระดับ feature · promote จาก topic `adaptive-api-doc` (achieved 2026-06-09)

## คืออะไร
**capability กลาง** `.warnyin/workflow/api-doc.md` ที่ทำให้ stage **auto-detect** ว่า topic แตะ backend/REST API ไหม — ถ้าใช่ ผลิต + ยืนยัน + ส่งมอบ **OpenAPI 3.1 contract** อัตโนมัติตลอด lifecycle; ถ้าไม่ใช่ → ข้ามเงียบ (ไม่ยัดเยียด)

ไม่ใช่ stage แยก และ **ไม่มี slash command** — เป็น capability ที่ stage เรียกใช้เองแบบ conditional (ต่างจาก utility skill ที่ user/model เรียกตรง)

## ทำงานยังไง
- **auto-detect (`api-doc.md` §2):** สัญญาณ = techstack เป็น HTTP service / route ในโค้ด / annotation (tsoa·FastAPI·springdoc) / task เป็น "API task" / endpoint เปลี่ยน — เจอ ≥1 ชัด = ใช่; คลุมเครือ → ถาม user (ห้ามเดา)
- **3 mode:** design-first (endpoint ใหม่ เขียน contract ก่อน) · code-first (API เดิม gen จากโค้ด) · hybrid (annotation + เติมมือ)
- **per-stage (`api-doc.md` §4):**
  | stage | ทำอะไร |
  |---|---|
  | DESIGN | ผลิต `docs/stages/<slug>/openapi.yaml`; `spec.md` ของ API task ชี้มาที่ contract (single source) |
  | VERIFY | ยืนยัน implementation จริง = contract (code-first regen→diff / ยิง request จริง) ใต้ runtime-security |
  | SHIP | promote/merge → `docs/techstack/<component>/openapi.yaml` (living API contract) |
- **adaptive = detect-in-playbook** (ไม่ใช่ description-trigger ของ skill) → ทำงานทุก harness (tool-agnostic)
- **reference ไม่ vendor:** ชี้ skill `openapi-spec-generation` (`wshobson/agents`) + เครื่องมือ (Spectral/Redocly/openapi-generator) แบบติดตั้งเอง — ไม่ก๊อปเข้า repo
- **secret hygiene:** scrub `openapi.yaml` ก่อน commit (placeholder url / dummy example / ไม่มี secret จริง)

## ขอบเขต / การตัดสินใจเชิงสถาปัตยกรรม
- **ฝัง playbook ไม่ vendor skill** — tool-agnostic + ลด supply-chain surface (เทียบทางเลือก slash command / vendor ที่ตัดทิ้งใน proposal)
- **gate ทุกข้อ conditional (N/A เมื่อไม่ใช่ REST API)** — backward compatible, topic ที่ไม่ใช่ backend ไม่ถูก block
- **logic ที่เดียว (`api-doc.md`)** — 3 stage ชี้กลับด้วย pointer + เลข section (canonical-copy, ไม่ duplicate)
- เป็น capability ตัวแรกที่ stage **เรียกแบบ conditional/auto-detect** → ตั้ง convention "stage-invoked capability" (`docs/rule.md` §1)

## ไฟล์ที่เกี่ยวข้อง
- capability: `src/.warnyin/workflow/api-doc.md`
- hook: `src/.warnyin/workflow/stages/{design,verify,ship}.md` (§6/process/gate ของแต่ละไฟล์)
- adapter: `src/.warnyin/workflow/roles/README.md` (§Skill เสริม) · `src/.warnyin/workflow/README.md` (file listing)
- artifact ปลายทาง: `docs/stages/<slug>/openapi.yaml` (ระหว่างงาน) → `docs/techstack/<component>/openapi.yaml` (ถาวร)
