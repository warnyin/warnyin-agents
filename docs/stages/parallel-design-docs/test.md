# Test plan — parallel-design-docs

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> ชนิด topic: **guidance/docs change** (ไม่มี runtime/service/FE) → verify = **semantic accuracy เทียบ behavior contract `design.md §3`** (rule §5: ตรวจโดย agent อิสระจากผู้เขียน)

## วิธีเทส (ไม่มี local service ให้รัน)
- guideline `docs/techstack/installer/test.md`: black-box spawn + structural gate (node script) — ใช้ส่วน structural/lint ได้
- ไม่มี executable logic ใหม่ → ไม่มี unit test ใหม่; correctness floor = mechanical gate + semantic review (อิสระ)
- **regression baseline:** Spec delta = "ไม่มี delta ต่อ `docs/features/`" → ไม่มี feature-spec scenario เดิมให้ regress; regression = **หลักการเดิมใน playbook (Gate §8, §3 ข้อ 2/7/8) ต้องไม่พัง**

## Test cases

### A. Mechanical gate (deterministic)
- [ ] **A1** `node src/.warnyin/workflow/scripts/validate-topic.mjs parallel-design-docs` → ไม่มี ✖
- [ ] **A2** `node src/scripts/lint-md.mjs` → ผ่าน (ทุก cross-ref/anchor ใน design.md/adapter ที่แก้ resolve, ไม่มี dead-link)
- [ ] **A3** `npm test` (node:test) → pass ครบ ไม่มี fail (regression ของ tooling เดิม)
- [ ] **A4** tool-agnostic grep — ไม่มีชื่อรุ่น/ผลิตภัณฑ์ใน wording ใหม่ของ design.md/adapter/CHANGELOG (rule §1 payload-guidance generic)
- [ ] **A5** ภาษา — ไม่มีคำต่างภาษาหลุด (เช่นเวียดนาม "có") ใน CHANGELOG/adapter (rule §2 ภาษาไทย)

### B. Semantic accuracy เทียบ contract §3 (ตรวจโดย agent อิสระ — rule §5)
- [ ] **B-C1** §4 step 2 มี parallel grounding (fan-out read-only ต่อโดเมน → summary+path; main loop สังเคราะห์+ตัดสิน scope+ถาม user เอง = ไม่ delegate judgment) **+ fallback**
- [ ] **B-C2** §4 step 9 + note ใต้ step 11 + §7 tier table: task-file fan-out = **default (standard/large)** หลังผ่าน Gate §8; "ไม่ต้อง worktree (task คนละโฟลเดอร์)"; main loop review coherence; fast tier = 1 task ไม่ fan-out; "fan-out ไม่ใช่ข้าม Gate" **+ fallback**
- [ ] **B-C3** §4 step 5 มี research-fan-out + **single-writer guardrail** (ห้ามแตก narrative ให้หลาย agent) **+ fallback**
- [ ] **B-core** §3 มี principle "Parallelize gathering, serialize judgment/narrative" — **ขยายในที่เดิม** (ผูกข้อ 2/7) ไม่ใช่กลไกใหม่ขนาน (rule unify-in-place)
- [ ] **B-floor** Gate §8 เดิมไม่ถูกลด; §3 ข้อ 2 (DAG-width) / ข้อ 7 (panel) / ข้อ 8 (dry-run) เดิมยังอยู่ครบ ไม่ขัดกับของใหม่
- [ ] **B-adapter** adapter §5 สะท้อน fan-out default (standard/large) + ยังเป็น adapter บาง (ชี้ playbook ไม่ duplicate, ไม่ผูกเลข step ที่ขยับได้); CHANGELOG entry ครอบพฤติกรรมจริงครบ (ไม่ misrepresent)

## Gate → SHIP
ทุก A + B ผ่าน · `test.md` + `verify.md` ครบ · troubleshooting บันทึกแล้ว (TS-1 จาก BUILD)
