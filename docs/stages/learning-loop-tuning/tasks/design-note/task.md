# Task — design-note

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained

| | |
|---|---|
| **Task** | `design-note` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | workflow-playbook (`src/.warnyin/workflow/`) |
| **Model tier** | `cheap` _(note สั้นจุดเดียว, mechanical)_ |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
เพิ่ม note "★ starting-artifact" (C4) เข้า `design.md` playbook — ให้ agent ตอนแตก task ตระหนักว่า decomposition + starting spec กำหนด solution ที่ BUILD เอื้อมถึง (เสริมวินัย DAG-width/vertical-slice เดิม)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: — (ไม่มี — C4 ไม่ cross-ref C1–C3)
- ปลดล็อกให้: — (independent กับ `loop-guidance` — คนละไฟล์ `design.md`)
- ส่ง output อะไรต่อ: —

## 3. Sub-tasks
- [ ] 1. copy C4 note เข้า `design.md` §3 item 3 (DAG-width toolkit) **หรือ** §4 step 7 (แตก tasks) — เลือกจุดที่กลมกลืน callout เดิม (`★`), สั้น — _ผลลัพธ์:_ note ปรากฏใกล้วินัย decomposition

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/.warnyin/workflow/stages/design.md` (§3 item 3 หรือ §4 step 7)
- **ห้ามแตะ root `.warnyin/`**

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] note "★ starting-artifact" ปรากฏใน `src/.warnyin/workflow/stages/design.md` ใกล้ §3 item 3 หรือ §4 step 7 (ไม่ใช่ §7)
- [ ] note อ้าง paper ว่า decomposition กำหนด solution ที่เอื้อมถึง + ระบุ "เสริมวินัยเดิม ไม่ใช่ knob ใหม่"
- [ ] กระชับ (minimalism) — ไม่เพิ่ม gate item / ไม่แตะ §8 gate
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical wording: `../../design.md §2.5` C4 — **copy ตามนี้**
