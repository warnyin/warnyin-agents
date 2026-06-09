# Spec — capability-core

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะ task นี้ — task ประเภท **docs/playbook** (ไม่มี runtime layer → ไม่มี API/UX SPEC)

## 1. ชนิดของ task
`docs/playbook` (capability doc กลาง)

## 4. Data-flow
- ไฟล์ `api-doc.md` ถูก **อ้างโดย** stage playbook (design/verify/ship) ผ่าน pointer + เลข section — เป็น single source ที่ logic ไหลออกไป ไม่ไหลกลับ (stage ไม่เขียน logic เอง)

## 6. Persona
- **AI ทุก harness** (Claude/Codex/Antigravity) ที่เดิน DESIGN/VERIFY/SHIP — อ่าน capability นี้เพื่อรู้ว่าเมื่อไหร่/อย่างไรต้องทำ API contract
- **ผู้พัฒนา v-next** ที่ดูแล payload

## 7. Test-flow (observable artifact — VERIFY เทสตามนี้)
> THEN ต้องเป็น artifact จริง (ไฟล์/section/string มีจริง) ไม่ใช่พฤติกรรม AI ที่วัดไม่ได้

- [ ] **ไฟล์มีอยู่ + section ครบ** — `src/.warnyin/workflow/api-doc.md` มี section "Auto-detect", "เลือกโหมด", "บทบาทต่อ stage"
- [ ] **Auto-detect ครบ** — §2 ระบุสัญญาณ (techstack HTTP / route / annotation / API task / endpoint change) **และ** ทางออก "ไม่ใช่ REST API → ข้าม"
- [ ] **3 mode** — §3 มี design-first / code-first / hybrid
- [ ] **per-stage** — §4 ครอบ DESIGN (ผลิต) / VERIFY (validate) / SHIP (promote)
- [ ] **tool-agnostic** — ค้น model-tier name (Opus/Sonnet/GPT-4/Gemini-Pro) ที่ฝังเป็น guidance (ไม่รวมบรรทัด header callout) → ไม่พบ
- [ ] **reference ไม่ vendor** — §5 ชี้ skill `openapi-spec-generation` (`wshobson/agents`) เป็น pointer; ไดเรกทอรี `src/.claude/skills/` ไม่มีโฟลเดอร์ `openapi-spec-generation`
- [ ] **secret hygiene** — §5 มีข้อสั่ง scrub `openapi.yaml` (placeholder url / dummy example / ไม่มี secret จริง)
- [ ] **edge: `<component>` resolution** — §6 ระบุ "หลาย component / ยังไม่มี → ถาม user" (ห้ามเดา)
