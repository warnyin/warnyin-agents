# Task — establish-tier-step

> ชี้ canonical `design.md` §3/§4/§8 (ไม่ลอก)

| | |
|---|---|
| **Task** | `establish-tier-step` |
| **Slice อ้างอิง** | `design.md` slice #1 (เดียว) |
| **Component** | `installer` (playbook + template) |
| **Model tier** | `cheap` (wording-guidance, modify ของเดิม mechanical) |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task
เพิ่ม **establish-tier step** ใน DESIGN playbook + ปรับ vocab ช่อง `ขนาด` ใน proposal template ให้ตรง tier — ทำให้ DESIGN ประเมินขนาดก่อนเดินเสมอ (มั่นใจ→กำหนด, ไม่มั่นใจ→ถาม user)

## 2. Dependency
- ต้องทำหลัง: — · ส่ง output: design.md + proposal template ที่มี tier-gate

## 3. Sub-tasks
- [ ] 1. `src/.warnyin/workflow/stages/design.md §4` — แทรก **step "1.5 Establish tier"** ก่อน business.md/proposal (ตาม design §3): (a) ประเมิน tier เบื้องต้นเองจาก signals+hard-floor (ชี้ `triage.md` ไม่ลอก rubric), (b) **มั่นใจ→กำหนด+บันทึก proposal ขนาด**, (c) **ไม่มั่นใจ/ก้ำกึ่ง→ถาม user (AskUserQuestion) options: ประเมินด้วย `/warnyin:triage` ก่อน / user กำหนด tier เอง**, (d) hard-floor บังคับ ≥ standard เสมอ
- [ ] 2. `design.md §7` — เพิ่มประโยคนำชี้ว่า "tier ถูก established ที่ §4 step 1.5" (§7 = ceremony per tier, step 1.5 = how established — ไม่ duplicate)
- [ ] 3. `src/.warnyin/template/stages/[topic]/proposal.md` — ช่อง `ขนาด` เปลี่ยน `เล็ก/กลาง/ใหญ่` → `fast/standard/large` + comment "(จาก triage หรือ ประเมินใน DESIGN step 1.5)"

## 4. ขอบเขตไฟล์ (★ disjoint)
- `src/.warnyin/workflow/stages/design.md`, `src/.warnyin/template/stages/[topic]/proposal.md`
- ❌ ห้ามแตะ `triage.md` (rubric canonical — ชี้ pointer พอ), design command adapter (logic อยู่ playbook)

## 5. Acceptance criteria
- [ ] design.md §4 มี step establish-tier ครบ 4 จุด: ประเมินเอง · มั่นใจ→กำหนด · ไม่มั่นใจ→ถาม options (triage / user ระบุ) · hard-floor บังคับ
- [ ] §7 มีประโยคชี้ §4 step 1.5 (ไม่ inline rubric ซ้ำ — ชี้ `triage.md` เป็น canonical)
- [ ] proposal template `ขนาด` = `fast/standard/large` (ไม่ใช่ เล็ก/กลาง/ใหญ่)
- [ ] **unify-in-place** — แทรกในโครง §4/§7 เดิม ไม่สร้าง section ขนาน; tier ยังเป็น judgment (⚠ ไม่ใช่ validator ✖)
- [ ] `lint:md` own-file ผ่าน · `node --test` ไม่ regression · ทำตาม `rule.md`+`standard.md`

## 6. อ้างอิง
- Canonical: `../../design.md` §3 (พฤติกรรม), §4 (proposal vocab), §8 (spec delta)
- ของเดิม: `src/.warnyin/workflow/stages/design.md` §4/§7, `src/.warnyin/workflow/triage.md` (rubric — ชี้ pointer)
