# Rule — feedback-playbook-command

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack + project)
- [ ] **command = adapter บาง ชี้ playbook กลาง ไม่ duplicate** (`docs/rule.md §1` tool-agnostic): logic/flow อยู่ `feedback.md` เดียว; `issue.md` แค่ frontmatter + ชี้กลับ + `$ARGUMENTS`
- [ ] **tool-agnostic — payload `.warnyin/` ทุก harness อ่านได้** (`docs/rule.md §1`): playbook ภาษาไทย generic; **ไม่ผูกชื่อรุ่น/ผลิตภัณฑ์ model** (แม้ในประโยคปฏิเสธ); callout "AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน"
- [ ] **canonical tracked = `src/` เท่านั้น** (`docs/rule.md §6` + `§1` src→root sync-gap): แก้/สร้างไฟล์ที่ `src/.warnyin/`+`src/.claude/` เท่านั้น — **ห้ามแตะ root `.warnyin/`/`.claude/` โดยตรง** (dogfood gitignored, ได้ตอน release sync)
- [ ] **ภาษาไทย** (`docs/rule.md §2`): ข้อความ playbook/command เป็นภาษาไทยตามสไตล์ repo (title/body issue = ตามภาษาที่ user สื่อสาร)
- [ ] **zero-dependency — ไม่เพิ่ม devDeps** (`docs/rule.md §2` + `docs/techstack/installer/rule.md`): payload เป็น `.md` ไม่มีโค้ดรัน; `gh` เป็น **external CLI ที่ผู้ใช้ติดตั้งเอง** ไม่ใช่ npm dependency
- [ ] **privacy / no secret leak** (`docs/rule.md §3.2` secret isolation): playbook กฎ "ไม่ดึง session context เองถ้า user ไม่สั่ง" + confirm gate ก่อนยิง public issue (D4/D5); footer ไม่ใส่ path/secret/ข้อมูลเครื่อง
- [ ] **ไม่เขียนทับงานเดิม / additive** (`docs/techstack/installer/rule.md`): สร้างไฟล์ใหม่ ไม่รื้อ namespace `/warnyin:*` เดิม → non-breaking (`design.md §6`)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/techstack/.../rule.md` ตอนนี้ — แค่ note ไว้ก่อน ถึง SHIP ค่อยพิจารณา
- [ ] rule ที่เสนอ: **"action-utility command ที่มี outward-facing side-effect (ยิง public issue/external) ต้องบังคับ preview + confirm ก่อน execute"** — เหตุผล: ต่างจาก read-only utility (explore/next/triage) ที่ไม่มี side-effect; feedback เป็น action แรกที่ยิงออกนอกเครื่อง (irreversible/public) → confirm gate ควรเป็น convention กลางถ้ามี action command อื่นในอนาคต (D5)
- [ ] rule ที่เสนอ: **"nested command namespace (`warnyin/<group>/<cmd>`) เป็น pattern จัดกลุ่ม command"** — เหตุผล: `feedback/issue` เป็น nested namespace แรก; ถ้าจะมีกลุ่มอื่น (เช่น `feedback/list`) ในอนาคต ควร note convention การจัด + ยืนยัน copyTree recursive รองรับ (ตอนนี้ `design.md §6` ยืนยันแล้ว)
