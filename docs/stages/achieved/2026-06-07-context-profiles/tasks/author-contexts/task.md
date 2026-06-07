# Task — author-contexts

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้

| | |
|---|---|
| **Task** | `author-contexts` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (payload `.md` แก่นกลาง) |
| **สถานะ** | `build เสร็จ ✓` |

## 1. เป้าหมายของ task (vertical slice)
สร้าง context vocabulary ที่ **ใช้ได้จริงทันที** — 3 context card (`research`/`build`/`review`) + `README.md` ใน `src/.warnyin/workflow/contexts/` ที่ AI/user เปิดอ่านแล้วสวม session posture ได้ (manual) และ ship ติด payload โดยไม่แตะ installer

## 2. Dependency
- ต้องทำหลัง: — (เริ่มได้เลย — เป็น slice แรก)
- ปลดล็อกให้: `tasks/wire-playbooks` (playbook จะชี้มาที่ไฟล์ที่ task นี้สร้าง)
- ส่ง output ต่อ: path + ชื่อ 3 context (`research`/`build`/`review`) + mapping context↔stage (design.md §4) ให้ wire-playbooks ใช้เขียน callout

## 3. Sub-tasks
- [x] 1. สร้างโฟลเดอร์ `src/.warnyin/workflow/contexts/` — _ผลลัพธ์: dir ใหม่ใต้ workflow_
- [x] 2. เขียน `research.md` ตามโครง spec §3 + สาระ §4 — _ขึ้นกับ 1_
- [x] 3. เขียน `build.md` ตามโครง + สาระ — _ขึ้นกับ 1_
- [x] 4. เขียน `review.md` ตามโครง + สาระ — _ขึ้นกับ 1_
- [x] 5. เขียน `README.md` (context vs role + ตาราง context↔stage + วิธี activate + โครง card ทุกใบ) — _ขึ้นกับ 2–4 (อ้างชื่อ 3 card)_
- [x] 6. `npm run verify:pack` + `npm test` — _ยืนยัน ship ได้ + ไม่กระทบเดิม_

## 4. ขอบเขตไฟล์ที่จะแตะ
- สร้างใหม่: `src/.warnyin/workflow/contexts/{research,build,review,README}.md`
- **ห้ามแตะ:** `cli.mjs`, `package.json`, `verify-pack.mjs`, root `.warnyin/` (dogfood), `stages/*` (เป็นงานของ wire-playbooks)

## 5. Acceptance criteria
- [x] 4 ไฟล์ครบ โครงตรง spec §3, บาง ไม่ duplicate stage checklist
- [x] README อธิบาย context(session) vs role(task) + ตาราง mapping ตรง design.md §4
- [x] `npm run verify:pack` เขียว (contexts ติด tarball)
- [x] ผ่าน test ตาม `spec.md` (test-flow)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
