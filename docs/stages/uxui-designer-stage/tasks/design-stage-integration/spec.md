# Spec — design-stage-integration (T3)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`logic / docs` (แก้ payload markdown playbook — ไม่ใช่ API/UI/data runtime)
- ไม่มี API SPEC / UX SPEC / data-flow runtime → **ข้าม §2, §3, §4** ของ template นี้
- งานคือ **wiring capability เข้า flow ของ playbook DESIGN** (stage-invoked capability convention) — สิ่งที่ตรวจคือ "playbook ที่แก้แล้วเดิน flow ครบ + wording ตรง canonical + link สะอาด"

---

## 5. User-flow (ลำดับที่ AI เดินตาม playbook หลัง T3 wiring)
> capability flow ที่ step 4.5 + detect + gate เปิดใช้ (อ้าง design.md §5)

```
proposal.md เสร็จ (§4 step 4)
   │
   ▼
[detect §"UX wireframe — detect"]  change มี UI surface?
   │                                    │
  ไม่ ─────────────────────────────────▶ ข้าม step 4.5 ทั้งหมด + gate §8 = N/A (flow เดิมไม่เปลี่ยน)
   │ ใช่ (ก้ำกึ่ง → ถาม user)
   ▼
step 4.5: ถาม user ทำ wireframe ไหม → fan-out warnyin-ux (read-only generator)
   │ (fan-out ไม่ได้ → fallback: AI หลักสวม lens roles/ux.md)
   ▼
main loop เขียน wireframe.md → ★ approve gate ★ (วน rerun จนพอใจ)
   ▼
design.md §5 (UI layer) อ้าง wireframe ที่ approve → §4 step 5 ต่อ → แตก task
   ▼
gate §8: gate item UX wireframe = require (wireframe.md ครบ + user ยืนยัน)
```
- **panel (§4 step 6 / §3 ข้อ 7):** UX = generator (step 4.5) ไม่ใช่ reviewer ที่ 6 ของ panel

## 6. Persona
> AI agent (ทุก harness) ที่เดิน DESIGN playbook — อ่าน playbook กลางชุดเดียวกัน; T3 ทำให้ทุกเครื่อง invoke capability ได้ (tool-agnostic, มี fallback)

---

## 7. Test-flow (จะยืนยันความถูกต้องยังไง)
> **★ แยก 2 verify-method** (design §8 + panel B2) — `lint-md.mjs` ครอบแค่ markdown-link, ที่เหลือตรวจ structural+อิสระ

### A. verify-method 1 — markdown-link path (อัตโนมัติ ผ่าน `lint-md.mjs`)
`lint-md.mjs` validate **เฉพาะ markdown-link `[](path)` ที่เป็น path** — ข้าม `#anchor`, backtick inline-ref, prose "step 4.5", cross-section pointer
- [ ] รัน `node src/scripts/lint-md.mjs` → เขียว (ไม่มี dead-link) — markdown-link ใน `design.md`/`README.md` ที่ T3 แตะ (เช่น link ไป `roles/ux.md`) resolve ครบ
- [ ] **เฉพาะ markdown-link** เท่านั้นที่ gate นี้ enforce — anchor/backtick/prose ไม่อยู่ในขอบเขต lint-md (อย่าคาดหวังว่ามันจับ)

### B. verify-method 2 — anchor / canonical wording (structural + ตรวจอิสระจากผู้เขียน)
> ไม่พึ่ง lint-md (rule.md §5 ข้อ 4 + canonical-copy) — ตรวจโครง + เทียบ §10 คำต่อคำโดย agent ที่ไม่ใช่ผู้เขียน
- [ ] **step 4.5 อยู่ถูกตำแหน่ง** — แทรกระหว่าง §4 step 4 (proposal) กับ step 5 (design.md how); precedent step 1.5 มีจริงในไฟล์
- [ ] **detect block** "UX wireframe — detect" อยู่ใต้ step 4.5 + มีประโยค "ไม่เข้าเงื่อนไข → ข้าม UX step ทั้งหมด" ชัด
- [ ] **panel note anchor ถูก** — note อยู่ที่ **§4 step 6 (Review panel) + §3 ข้อ 7** — **ไม่ใช่ §4.6/§7** (grep ยืนยัน note ไม่ไปโผล่ §7 "3-tier ceremony")
- [ ] **role lens** — §3 ข้อ 6 เป็น **ประโยคที่ขยายต่อ** จาก SA+Tech Lead เดิม (ไม่ใช่ bullet/list ใหม่)
- [ ] **gate item** อยู่ใน **§8** ติด API-contract gate item
- [ ] **canonical wording diff ว่าง** — เทียบ step 4.5 ↔ §10B, detect ↔ §10A, panel note ↔ §10D, role lens ↔ §10C, gate ↔ §10E **คำต่อคำ** (semantic-consistency, ห้ามแต่งใหม่)

### C. gate item conditional — ทดสอบ 2 ขั้ว (empirical demo, pattern change-sizing)
- [ ] **positive (FE):** สมมติ change แตะ FE/component → detect = ใช่ → gate item **require** `wireframe.md` ครบ (user flow + ASCII + states) + user ยืนยัน → ถ้าขาด = ไม่ผ่าน gate
- [ ] **negative (backend-only):** สมมติ change backend/CLI/library ล้วน → detect = ไม่ใช่ → gate item รายงาน **N/A ไม่ block** (backward compatible — รวม repo `warnyin-agents` เองที่ไม่มี FE)

### D. full-gate (ยืนยันไม่มี regression)
- [ ] `node src/scripts/*` (test suite + verify-pack + lint-md) **เขียวทั้งหมด** — zero-dep, payload ครบ, dead-link สะอาด, ไม่มี test assert จำนวน/รายชื่อ agent แตก (Infra ยืนยันจาก ground truth)
- [ ] **fallback instruction** ใน step 4.5 มีจริง (structural) — "fan-out ไม่ได้ → AI หลักสวม lens `roles/ux.md`" (tool-agnostic invariant)
