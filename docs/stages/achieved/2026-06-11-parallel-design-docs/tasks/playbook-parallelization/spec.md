# Spec — playbook-parallelization

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้

## 1. ชนิดของ task
`docs` / `guidance` (แก้ playbook markdown — ไม่มี executable logic)

---

## 4. Data-flow
AI รัน `/warnyin:design` → อ่าน `design.md` playbook (§3 หลักการ + §4 process) → ทำ grounding / narrative / task-gen ตาม guidance ที่ parallelize แล้ว + fallback

## 5. User-flow
ไม่เปลี่ยน UX ของ `/warnyin:design` — ผู้ใช้สั่งเหมือนเดิม, "ภายใน" stage เร็วขึ้น

## 6. Persona
contributor/maintainer ของ workflow + ผู้ใช้ปลายทางที่รัน DESIGN stage (ทุก harness)

## 7. Test-flow
> ตรวจ semantic เทียบ behavior contract `design.md §3` — VERIFY ทำโดย agent อิสระจากผู้เขียน (rule.md §5)

- [ ] **T-struct:** `node .warnyin/workflow/scripts/validate-topic.mjs parallel-design-docs` ไม่มี ✖
- [ ] **T-link:** `node src/scripts/lint-md.mjs` ผ่าน — ทุก cross-ref/anchor ใน `design.md` ที่แก้ resolve (ไม่มี dead link)
- [ ] **T-C1:** §4 step 2 มี guidance parallel grounding (fan-out read-only ต่อโดเมน → summary+path/บรรทัด, main loop สังเคราะห์+ถาม user เอง — ไม่ delegate การตัดสิน scope) **+ fallback**
- [ ] **T-C2:** §4 step 9 + line 79 + §7 ระบุ task-file fan-out เป็น **default (standard/large)** หลังผ่าน Gate §8, "ไม่ต้อง worktree (task คนละโฟลเดอร์)", main loop review coherence, fast tier ไม่ fan-out **+ fallback**
- [ ] **T-C3:** §4 step 5 มี research-fan-out + **single-writer guardrail** (ห้ามแตก narrative ให้หลาย agent) **+ fallback**
- [ ] **T-core:** §3 มี principle แกน "Parallelize gathering, serialize judgment/narrative" — ขยายในที่เดิม (ผูก §3 ข้อ 2/7) ไม่ใช่ข้อขนานซ้ำ
- [ ] **T-floor:** Gate §8 เดิมไม่ถูกลด/ลบ; §3 ข้อ 2 (DAG-width) / ข้อ 7-8 (panel/dry-run) เดิมยังอยู่ครบ ไม่ขัดกัน
- [ ] **T-agnostic:** ไม่มีชื่อรุ่น/ผลิตภัณฑ์ใน wording ใหม่ (เช็คด้วยตา + grep ชื่อรุ่นทั่วไป) — ใช้ vocab generic
