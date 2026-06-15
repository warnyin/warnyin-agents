# Spec — embed-minimalism-principle

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`docs` / `payload` (playbook markdown — ไม่มี runtime code)

---

## 4. Data-flow
- agent ฝั่งผลิตอ่าน `roles/developer.md` → pointer → `minimalism.md` → ใช้ decision hierarchy ตอน generate
- session ฝั่งตรวจสวม `contexts/review.md` → over-engineering lens → `minimalism.md`
- canonical = `src/.warnyin/workflow/minimalism.md`; root dogfood = mirror ผ่าน `setup:dogfood`

## 5. User-flow
- contributor/agent เปิด `workflow/README.md` → เห็น `minimalism.md` ในรายการ → เข้าอ่าน principle ได้

## 6. Persona
- **build sub-agent** (ฝั่งผลิต): อยากรู้ "เขียนแค่ไหนพอ" → ได้ decision hierarchy
- **VERIFY/review session** (ฝั่งตรวจ): อยากจับ over-engineering → ได้ lens
- **ทุก downstream install**: ได้ principle ติดมากับ payload โดยไม่ตั้งค่า

## 7. Test-flow
> ยืนยันความถูกต้อง (เคสที่ต้องผ่าน + edge)

**ไฟล์แกน**
- [ ] มี `src/.warnyin/workflow/minimalism.md` ที่มีครบ: (a) guardrail "lazy not negligent" วาง**ก่อน** hierarchy, (b) decision hierarchy 6 ขั้น (YAGNI → stdlib → native → dep → one-liner → ขั้นต่ำ), (c) ตัวอย่าง before/after ≥1 เคส, (d) ขอบเขตกัน over-cut
- [ ] ไฟล์ token-lean — ความยาวไม่เกินสเกล `triage.md`/`api-doc.md` (อ้างอิงสายตา + เหตุผล)
- [ ] **tool-agnostic:** `grep -iE 'claude|opus|sonnet|haiku|gpt|gemini|copilot|cursor|ponytail|anthropic|openai' src/.warnyin/workflow/minimalism.md` → ไม่พบ (vocab generic เท่านั้น)

**Pointer (canonical-copy — ไม่ duplicate hierarchy)**
- [ ] `roles/developer.md` มี pointer ไป `../minimalism.md` (ใน Lens หรือ Checklist) — ชี้กลับ ไม่ copy 6 ขั้น
- [ ] `contexts/build.md` มี pointer ไป `../minimalism.md` (ใน Mindset/Do)
- [ ] `contexts/review.md` มี over-engineering lens + pointer ไป `../minimalism.md`
- [ ] `stages/build.md` §3 (operating principles) มี pointer บรรทัดสั้นไป `../minimalism.md`
- [ ] `stages/verify.md` §3 (operating principles) มี pointer บรรทัดสั้นไป `../minimalism.md` — **ไม่เพิ่ม gate item ใน §6**
- [ ] `workflow/README.md` ตารางโครงสร้าง list `minimalism.md` + 1 บรรทัดอธิบาย

**Gate / integrity**
- [ ] `node .warnyin/workflow/scripts/validate-topic.mjs ponytail-minimalism` → ไม่มี ✖
- [ ] `npm run lint:md` → เขียว (ทุก pointer relative resolve ได้ ทั้ง src และ root)
- [ ] `npm run verify:pack` → เขียว (minimalism.md ติด package)
- [ ] `npm test` → เขียว (ไม่ regress)
- [ ] หลัง `npm run setup:dogfood` → `.warnyin/workflow/minimalism.md` (root) ตรงกับ `src/.warnyin/workflow/minimalism.md`

**Edge / กันพลาด**
- [ ] ไม่เพิ่ม context ตัวที่ 4 ใน `contexts/` (minimalism ไม่ใช่ session posture)
- [ ] ไม่แก้ logic เดิมของไฟล์ที่แตะ — เพิ่ม pointer เท่านั้น (backward compatible)
- [ ] CHANGELOG.md มี entry (payload เปลี่ยน = user-facing)
