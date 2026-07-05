# Spec — loop-guidance

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้

## 1. ชนิดของ task
`docs` (playbook markdown edit — ไม่มี runtime; THEN = observable artifact ในไฟล์)

---

## 4. Data-flow
canonical wording `design.md §2.5` (C1/C2/C3) → copy ไปวาง surface: build.md / verify.md / triage.md; pointer เชื่อม build/verify ↔ triage (ไม่ inline ซ้ำ)

## 6. Persona
agent (ทุก harness) ที่เดิน fix loop ใน BUILD full-gate / VERIFY — อ่าน guidance เพื่อเลือก horizon+batching ตาม tier

## 7. Test-flow (assert observable artifact ใน `src/` เท่านั้น — root dogfood stale)
- [ ] grep "★ loop tuning" เจอใน `src/.warnyin/workflow/stages/build.md` **และ** `verify.md` (2 ที่ = canonical-copy) — แต่ละที่มี: credit-horizon สั้น/ยาว, ⚠ update ถี่เกิน, batching, ⚠ ใหญ่≠ดีกว่า, guard "ไม่ลด correctness/test-floor"
- [ ] C1 อยู่ที่ anchor ถูก: build.md §3 item 8 (pointer) + §4 step 6 (บล็อกเต็ม); verify.md §3 item 5 + §4 step 5
- [ ] C3 report note (enum `per-finding | batched` + "เหตุผล 1 บรรทัด") อยู่ท้าย fix loop (build §4 step6 / verify §4 step5) — **ไม่ใช่** ใน gate checklist
- [ ] **backward-compat:** gate checklist `- [ ]` ใน build.md §7 + verify.md §6 — count + เนื้อหา item เท่าเดิม (diff เทียบ pre-change; ไม่มี item loop-tuning เพิ่ม)
- [ ] C2 table "Loop-tuning default per tier" (3 tier) เจอ **เฉพาะ** `src/.warnyin/workflow/triage.md` §2C (negative-grep: 0 ที่ใน build/verify); triage ไม่มี why-block (เก็บแค่ default + pointer)
- [ ] pointer ทุกตัวเป็น markdown link resolve ได้ (รัน `node .warnyin/workflow/scripts/lint-md.mjs` หรือ dead-link gate ที่มี — ไม่มี broken link)
- [ ] verify.md §1 fast-track hook มี 1 บรรทัดระบุ loop-tuning proxy = non-blocking ใน verify-lite
- [ ] regression: scenario เดิมของ `minimalism` spec ("full hierarchy block ปรากฏที่เดียว") ยังผ่าน (C1 ไม่กระทบ block ของ minimalism)
