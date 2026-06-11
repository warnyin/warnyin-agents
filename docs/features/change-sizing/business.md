# Business — Change sizing

> ความรู้ถาวรระดับ feature · promote จาก topic `change-sizing-router` (Discovery 2026-06-10, ผ่าน gate)

## 1. เป้าหมายเชิงธุรกิจ (what & why)
- **what:** ประเมินขนาด change ตั้งแต่ต้น แล้วจ่าย ceremony ให้พอดีขนาด — งานเล็กไวขึ้น (fast-track), งานใหญ่บังคับ Discovery
- **why:** workflow เส้นทางเดียว ceremony เท่ากันหมด → typo/bugfix จ่าย overhead เกิน (เดินครบ 4 stateful command + panel/dry-run); งานใหญ่ก็ไม่มี trigger บังคับ Discovery → คน skip ความระวังเองแบบ ad-hoc
- **ผูก `docs/project.md`:** ตรง "กระทัดรัด opinionated" + ลด overhead ให้ workflow คล่องขึ้น; ต่อยอด `build-orchestration` (0.11.0) — sizing เป็น **ต้นน้ำ** ป้อน model tier + DAG width

## 2. Persona / ใครได้ประโยชน์
- **contributor/AI ที่จะลงมือทำ change** — ได้คำแนะนำว่างานนี้ใหญ่แค่ไหน ควรเดิน path ไหน ก่อนจ่าย ceremony
- **คุณค่า:** งานเล็กเสร็จไวขึ้น (ข้าม ceremony ที่ไม่จำเป็น) โดยยังปลอดภัย (hard-floor + test floor); งานใหญ่ไม่หลุด Discovery

## 3. Success metric (วัดผลได้)
- triage rubric (3-tier + signals + hard-floor) มีจริงใน playbook · `validate-topic`/`lint:md` ผ่าน
- fast-track skip-list ต่อ stage documented · **fast ข้าม ceremony ≥3 รายการ** เทียบ standard (observable, deterministic)
- hard-floor: เคส sensitive (5 หมวด) → rubric บังคับ ≥ standard ทุกเคส (พิสูจน์ด้วยตัวอย่าง)
- empirical: bugfix 1 เคสเดิน fast-track → #stage-artifact น้อยกว่า standard (wall-clock = informational, non-deterministic)

## 4. ขอบเขตเชิงธุรกิจ / ข้อจำกัด
- **in scope:** `/warnyin:triage` (read-only assess+route) · sizing rubric (3-tier + hard-floor) · fast-track spec (reframe §7 + skip-list 4 stage) · escalation guidance · triage↔next ชัด
- **out of scope:** decompose L/XL อัตโนมัติ (large แค่ route → Discovery) · 2 มิติ size×type · `/warnyin:quick` one-shot · auto-execution
- **ข้อจำกัด:** payload `.md` + 1 command — zero-dep, tool-agnostic (command = adapter บางชี้ playbook); triage = judgment heuristic (⚠ ไม่ใช่ ✖)

## 5. ความเสี่ยง & การคุม
- **mis-size** → escalation ถูก+ง่าย (hard-floor + escalate-anytime symmetric)
- **command proliferation** → triage เป็น surface ใหม่เดียว, execution reuse command เดิม
- **fast ลด correctness** → gate floor (test เขียว) + hard-floor พื้นที่อ่อนไหวคงไว้
