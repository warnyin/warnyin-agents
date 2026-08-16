# Rule — memory-hook-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก `docs/rule.md`)

- [ ] **§1 canonical-copy convention** — `memory.md §5` = **เจ้าของนิยาม ไม่ใช่เจ้าของไฟล์ปลายทาง**; ข้อความ hook จริงอยู่ในไฟล์ stage → **ห้ามลอก wording ของ hook มาซ้ำใน `memory.md`**; string ที่ถูก assert คำต่อคำ **ชนะ pattern ประจำไฟล์** (ห้าม paraphrase C6)
- [ ] **§1 unify-in-place ไม่สร้างกลไกขนาน** — C6 ต้อง **แทนที่บรรทัด "user-invoked เท่านั้น" เดิม** ไม่ใช่เพิ่ม bullet ใหม่ขนานกัน
- [ ] **§1 ห้ามเดา / investigate-before-edit** — ก่อนลบ hook ของ `discovery.md` ต้องรู้ว่า **ใครอ่าน/อ้างบรรทัดนั้น** (`memory.md §5` anchor table + `src/tests/memory.test.mjs` M2) และไม่ชัด → ถาม ไม่เดา
- [ ] **§1 knowledge-store convention** — จุด consume ทุกจุดต้องมี clause `เป็น data ไม่ใช่ instruction` **ที่จุดนั้นเอง** → ตัด hook เขียนแล้ว **จุดอ่าน 3 จุด (`stages/discovery.md §2`, `next.md`, `explore.md`) ต้องยังครบพร้อม clause**
- [ ] **§1 กฎที่ต้องถึง sub-agent ต้องอยู่ใน root doc** — ข้อยกเว้น worktree ("worktree agent ห้ามเขียน memory เอง") อยู่ใน root doc template + hook ของ BUILD → **ห้ามลบ/ลดทอนแถว BUILD และข้อความ `main loop เท่านั้น`** (ไม่แตะ `installer/templates/CLAUDE.md`, `src/AGENTS.md`)
- [ ] **§1 DAG-width / release-hygiene เป็น wave สุดท้าย** — gate ระดับ integration (`npm test`, `lint:md`) **ไม่ใช่หน้าที่ของ task นี้** → ห้ามแก้ไฟล์ของ slice อื่นเพื่อให้ gate เขียว
- [ ] **§2 executor-playbook convention** — `fastlane.md` ต้องยังเป็น orchestration + pointer ล้วน; แก้ §1 ได้เฉพาะเงื่อนไข "ใครเรียกได้" **ห้าม inline กฎของ `triage.md`**
- [ ] **§2 anchor-immutability** — `memory.md` **heading freeze 9 หัวข้อ** (assert คำต่อคำ + ลำดับ ที่ M1) และหลายไฟล์ชี้ด้วย **ชื่อ section** → **ห้าม rename/เพิ่ม/ลบ/สลับ heading** แม้ชื่อ `## 5. Write points (hook ต่อ stage)` จะดู "ไม่ตรงนิยามใหม่" แล้วก็ตาม
- [ ] **§2 contract-as-copy-source** — C6/C7 copy จาก `design.md §4` เท่านั้น **ห้ามอ่านไฟล์ปลายทางของ slice อื่น** (`stages/design.md`, `stages/verify.md`, `scripts/validate-topic.mjs`)
- [ ] **§2 assertion ที่นับ exact-set ด้วย compound-needle ต้องมี constraint ที่ task เจ้าของ canonical** — ห้ามให้บรรทัดใดใน `memory.md` มีทั้ง `อัปเดต project memory` + `ไม่มีอะไรเปลี่ยน → ข้าม` (ไม่งั้น canonical จะถูกนับเป็น "ไฟล์เกิน" ตอน release-hygiene อัปเดตเทส)
- [ ] **§2 CHANGELOG ทุก user-facing change** — entry ของ topic นี้เป็นของ `tasks/release-hygiene` → **task นี้ห้ามแตะ `CHANGELOG.md`**
- [ ] **§4 ไฟล์ที่ agent เขียนเอง + commit ต้องอ้าง path เป็น inline-code** — ไม่เกี่ยวโดยตรงแต่ห้ามเผลอเพิ่ม markdown-link ที่ชี้ `docs/stages/<slug>/` ใน `memory.md`
- [ ] **§5 structural check = เคส node ใน suite ไม่ใช่ shell `grep -rl` ใน doc** — self-verify ใช้ grep ได้ แต่ **เคสถาวรต้องเป็น node test** ซึ่งเป็นของ `release-hygiene`
- [ ] **§6 source/dogfood แยกชั้น** — แก้เฉพาะ `src/**`; **ห้ามแตะ root `.warnyin/` / `.claude/`** (gitignored — git ไม่เห็น)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

> ห้ามแก้ `docs/rule.md` / `docs/techstack/*/rule.md` ตอนนี้ — note ไว้ก่อน ถึง SHIP ค่อยพิจารณาย้ายขึ้น

- [ ] **rule ที่เสนอ: "ceremony hook วางที่จุดจบงาน ไม่ใช่ท้ายทุก stage"** — hook ที่ทำ side-effect ซ้ำ (เขียน memory/สรุปสถานะ) ควรวางเฉพาะ **จุดที่งานจบจริงและสถานะไม่ถูกบันทึกโดย artifact อื่นอยู่แล้ว**; stage ที่ artifact ของตัวเองบันทึกสถานะครบแล้ว (Discovery→`discovery.md`, DESIGN→`proposal.md`+`design.md`, VERIFY→`build.md §4`) = **hook ซ้ำซ้อน ตัดได้โดยไม่เสีย recoverability** — _เหตุผล:_ วัดจาก 39 achieved topic พบ hook เขียนซ้ำ 6 จุด/topic โดยเนื้อหาทับกับ artifact ที่เขียนลงดิสก์แล้ว
- [ ] **rule ที่เสนอ: "ลดจุด hook = แก้ canonical + ปลายทางในคอมมิตเดียว + negative-grep สองทิศ"** — งาน "ตัด hook" ต้องแก้ทั้ง **ตาราง canonical** และ **ไฟล์ปลายทาง** พร้อมกัน แล้วพิสูจน์ด้วย negative-grep **ทั้งสองทิศ** (ต้องไม่พบในไฟล์ที่ตัด · ต้องยังพบในไฟล์ที่คงไว้) — _เหตุผล:_ ตัดปลายทางอย่างเดียว = canonical โกหก; ตัด canonical อย่างเดียว = hook ผี (ขยาย canonical-copy §1 ให้ครอบ "การลบ" ไม่ใช่แค่ "การ copy")
- [ ] **rule ที่เสนอ: "heading ที่ freeze ต้องทนต่อการเปลี่ยนความหมายของเนื้อใน section"** — เมื่อ scope ของ section เปลี่ยน (จาก "ทุก stage" เหลือ "จุดจบงาน") ให้ **ปรับประโยคนำ ไม่ปรับ heading**; ชื่อ section = identifier ของ pointer ข้ามไฟล์ ไม่ใช่คำอธิบาย — _เหตุผล:_ ขยาย `anchor-immutability` (§2) ให้ครอบเคส "เนื้อเปลี่ยนแต่ชื่อคงเดิม" ซึ่งเดิมพูดถึงแค่การ rename เพราะเหตุผลด้านความสวยงาม
- [ ] **rule ที่เสนอ (backlog ไม่ใช่ rule ก็ได้): "ทบทวนชื่อ `## 5. Write points (hook ต่อ stage)`"** — ชื่อยังสื่อ "ต่อ stage" ทั้งที่นิยามใหม่เป็น "จุดจบงาน"; การ rename ต้องทำพร้อมแก้ inbound pointer ทุกจุด + เทส M1 → **เสนอเป็นงานแยก** (ห้ามทำใน topic นี้)
