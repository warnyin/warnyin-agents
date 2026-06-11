# Rule — discovery-playbook-modes

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)
- [ ] **canonical single-source / no-duplicate** (`docs/rule.md §1` + pattern `change-sizing`/`triage.md`): taxonomy + behavior + auto-suggest + debate อยู่ playbook `discovery.md` เดียว — ที่อื่นชี้มา
- [ ] **debate ผ่าน Agent tool ใน playbook ไม่ใช่ Workflow script** (`docs/techstack/installer/rule.md` §build orchestration — เลี่ยงข้อห้าม top-level `export`)
- [ ] **additive / backward-compat** (`docs/techstack/installer/rule.md`: ไม่เขียนทับงานเดิม, idempotent): เพิ่ม section ไม่รื้อโครงเดิม; flow Discovery เดิม + grill keyword ยังทำงาน
- [ ] **no secret in committed artifact** (`docs/rule.md` security): decision-log จาก debate = ข้อสรุป ไม่ paste raw value/credential
- [ ] **payload generic ไม่ผูกชื่อรุ่น model** (`docs/rule.md §1`): debate ระบุ persona/tier generic ไม่ระบุชื่อรุ่นจริง
- [ ] **เครื่องอื่นอ่าน playbook กลางเดียวกัน** — wording ต้องใช้ได้ทั้ง Claude/Codex/Antigravity (fallback degrade เมื่อไม่มี Agent tool)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
- [ ] rule ที่เสนอ: **"stage-intensity mode = แกนใต้ context-profile, orthogonal กับ tier"** — เหตุผล: เป็น pattern ใหม่ (mode คุมความเข้ม stage เดียว) ที่อาจ generalize ให้ stage อื่นในอนาคต; SHIP พิจารณา promote เป็น feature `discovery-modes` + note ความสัมพันธ์ 3 แกนใน `docs/rule.md`
- [ ] rule ที่เสนอ: **"multi-agent debate = Parallelize gathering, serialize judgment + fallback degrade"** — เหตุผล: ถ้าใช้ซ้ำในที่อื่น ควรเป็น rule กลาง (ตอนนี้อ้าง build-orchestration ได้)
