# Rule — fastlane-playbook

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก `docs/rule.md` + `docs/techstack/installer/rule.md`)

- [ ] **canonical-copy convention** (`docs/rule.md:18`) — wording ชุดเดียวที่กระจายหลายไฟล์ ต้อง **copy จาก canonical ที่ `design.md §4` — ห้ามแต่งใหม่**: heading 5 อัน (C3), `description` (C4), `argument-hint` (C5) ต้องตรงคำต่อคำ
- [ ] **★ ห้ามลอกกฎซ้ำ (enforce ของ canonical-copy + single source of truth)** — `fastlane.md` **ห้ามเล่ากฎซ้ำไม่ว่าตารางหรือ prose**: §3 = **pointer-per-row** (ชี้ row ของ fast-track skip-list ใน `triage.md` + section ของ stage playbook) · §4 gate **อ้าง gate เดิม ไม่ลอกเงื่อนไข** · ห้ามมีรายชื่อ 5 หมวด hard-floor แบบเต็ม · ห้ามมีคู่คำ `config-protection` + `investigate-before-edit`
- [ ] **unify-in-place ไม่สร้างกลไกขนาน** (`docs/rule.md:17`) — fastlane เป็น **ผู้เดิน** ของ fast tier เดิม ไม่ใช่ policy engine ที่ 2; ห้ามนิยาม rubric/caps/skip-list ของตัวเอง
- [ ] **tool-agnostic + payload-guidance ต้อง generic** (`docs/rule.md:8-9`) — payload `.md` ห้ามอ้าง **ชื่อรุ่น/ผลิตภัณฑ์ AI** (แม้ในประโยคปฏิเสธ); ใช้ vocab generic (`deepest`/`balanced`/`cheap`)
- [ ] **adapter บาง ชี้ playbook กลาง ไม่ duplicate** (`docs/rule.md:8,10`) — command adapter = "อ่าน playbook แล้วทำตาม" + map `$ARGUMENTS`
- [ ] **stateful/irreversible = command (user-only)** (`docs/rule.md:10,29`) — fastlane เขียนไฟล์ + archive → **ห้ามทำเป็น skill auto-invoke**; ห้ามสร้างอะไรใน `src/.claude/skills/`
- [ ] **★ ห้ามแตะ root dogfood** (`docs/rule.md:79` + installer `rule.md` registry-target) — `.warnyin/`, `.claude/`, root `CLAUDE.md`/`AGENTS.md` เป็น **gitignored dogfood** → แก้แล้วงานหาย; **แก้เฉพาะใต้ `src/`** (เช็ค `git check-ignore <file>` ก่อนเสมอถ้าไม่แน่ใจ)
- [ ] **mirror layout `src/` = target paths** (installer `rule.md`) — วางไฟล์ผิด path = ไม่ถูกติดตั้ง (ไม่มี mapping table)
- [ ] **ภาษาไทย** (`docs/rule.md:41`) — เอกสาร/ข้อความผู้ใช้ทั้งหมดเป็นภาษาไทย
- [ ] **ห้ามเดา** (`docs/rule.md:11`) — contract ไม่ชัด → ถาม ไม่แต่งเอง (contract C1-C18 คือสัญญา)
- [ ] **minimalism / lazy not negligent** (`docs/rule.md:31`) — เขียนน้อยที่สุด แต่ **ห้ามตัด**: acceptance ก่อนแก้, hard-floor gate, test-floor

> _(zero-dependency ไม่เกี่ยวกับ task นี้ — payload เป็น `.md` ล้วน ไม่มีโค้ด/dep)_

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง — **BUILD ห้ามแตะ rule/spec กลาง**)

- [ ] **แก้ `docs/rule.md:26`** (change-sizing convention ข้อ 2) — ปัจจุบันระบุ hard-floor 5 หมวด **"บังคับ ≥ standard เสมอ"** → ต้องแก้ให้รับ **explicit user override**: default ยังบังคับ ≥ standard และ `/warnyin:triage` ยังห้ามแนะนำ fast — **ข้อยกเว้นเดียว:** user สั่ง `/warnyin:fastlane` เอง + ยืนยันซ้ำเมื่อถูกเตือน → บันทึก `override โดย user` + หมวดที่แตะ ลง receipt meta (audit trail); ship-lite ยอม ship เฉพาะ receipt ที่มี override นี้
  — _เหตุผล:_ พฤติกรรมใหม่ (C9/C16) ขัดคำว่า "เสมอ" ในข้อเดิม → ปล่อยไว้ = rule กลางขัดกับ payload จริง
- [ ] **แก้ `docs/features/change-sizing/feature.md:29` + `business.md:22`** — เลิกระบุ **"ไม่เพิ่ม one-shot / auto-execution"** เป็น out-of-scope
  — _เหตุผล:_ `/warnyin:fastlane` = one-shot executor จริง; decision เดิมกลับแล้ว (ตอนนั้น fast tier ยังไม่มี guard — วันนี้มี hard-floor + escalation symmetric + validator fast-mode) → เอกสาร feature ต้องตรงพฤติกรรม ไม่ขัดกันเอง
- [ ] **executor-playbook convention (ถ้าใช้ซ้ำได้)** — playbook ที่เดินกฎของ playbook อื่น end-to-end ต้องเป็น orchestration ล้วน (ลำดับ + gate + escalation) + **pointer-per-row** ไปเจ้าของกฎ ห้าม inline เนื้อกฎ
  — _เหตุผล:_ กัน policy drift 2 ที่ (เสี่ยง 2 ของ `proposal.md §5`); พิสูจน์ด้วย negative-grep ได้จริง
