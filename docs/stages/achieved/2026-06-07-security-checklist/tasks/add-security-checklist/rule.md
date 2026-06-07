# Rule — add-security-checklist

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack/project)
- [ ] **single source of truth** (CLAUDE.md) — wording canonical เดียว (design §2) ทุกจุด reference; ไม่ duplicate ความหมาย
- [ ] **tool-agnostic** (`docs/rule.md` §1) — principle portable เป็นแก่น; Claude settings = adapter note ระบุชัด (ไม่ใช่ rule หลัก)
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/.warnyin/workflow/` + `src/.claude/commands/` เท่านั้น; ห้ามแตะ root dogfood
- [ ] **กระทัดรัด** (`docs/rule.md` §1) — เพิ่ม section/บรรทัดเท่าที่จำเป็น ไม่บวม role card / playbook
- [ ] **ห้ามแตะ docs/rule.md (central)** ตอน BUILD — global bullet note §2 รอ SHIP
- [ ] **investigate-before-edit** (`docs/rule.md` §1) — ก่อนแก้ `security.md`/`verify.md`/`install-skill.md` เข้าใจ section เดิม + จุดต่อที่ถูก (ไม่ทับ app-security/ไม่เพิ่ม step ใหม่ใน command)
- [ ] **ไม่ทำลายของเดิม** — `npm test` 18/18 เขียว + `verify:pack` เขียว (payload `install-skill.md` ติด tarball ถูกต้อง)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP — promote เข้า `docs/rule.md` §3)
- [ ] rule ที่เสนอ: **agent-runtime security baseline** (คู่ CI security baseline §3 เดิม) —
  - **secret isolation:** agent ไม่ควรเข้าถึง secret นอก scope งาน (`.env`, `~/.ssh`, credential/token) — least-privilege ระดับ filesystem
  - **no unnecessary egress:** payload/skill ที่ agent execute ต่อ จำกัด egress เท่าที่จำเป็น (sandbox)
  - **identity separation:** ไม่ใช้ credential ส่วนตัว/prod ใน session agent — แยก scoped identity
  - **supply-chain:** third-party skill/MCP/payload = prompt-injection surface → ตรวจก่อนติดตั้ง, global ไม่ vendor, จำกัดสิทธิ์
  - เหตุผล: §3 เดิมครอบแค่ **CI/pipeline** security; "การรัน AI agent ในเครื่อง" เป็น security baseline อีกมิติที่ยังไม่มี — payload ถูก agent execute ต่อ (`setup-dogfood` comment "supply-chain surface"); ควรอยู่ระดับ global (ไม่ผูก component) คู่ CI baseline
  - placement: ยืนยันตอน SHIP ว่าวางใน §3 (extend) หรือ sub-section ใหม่
