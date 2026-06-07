# Spec — add-example-walkthrough

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`docs` (worked-example narrative + README pointer) — ไม่มี code/payload

## 2. โครง `docs/example-walkthrough.md` (NEW)
1. **หัว + disclaimer:** เป็น snapshot ของ topic `cli-legacy-warning-fix` ณ 2026-06-07 · workflow อาจเปลี่ยน → ดู `.warnyin/workflow/stages/` เป็น source ปัจจุบัน · artifact ดูบน GitHub repo
2. **ตารางไล่ 5 stage:** คอลัมน์ `Stage · ตัดสิน/ทำอะไร (decision) · gate ที่ผ่าน · artifact (ลิงก์)`
3. **ราย stage (Discovery→DESIGN→BUILD→VERIFY→SHIP):** 2–4 บรรทัด narrative เน้น **เหตุผลการตัดสินใจ** + ลิงก์ไฟล์จริง
4. **ปิดท้าย:** "อยากเริ่มเอง → `/warnyin:discovery <topic>`" + ลิงก์ achieved อื่น (เป็น example เพิ่ม)

## 3. README section (เพิ่ม)
- หัวข้อ "ตัวอย่างจริง (worked example)" — 2–3 บรรทัด + ลิงก์ relative `docs/example-walkthrough.md`; วางหลัง section คำสั่ง/เริ่มต้น (จุดที่ผู้ใช้ใหม่อ่าน) ไม่แก้/ลบของเดิม

## 4. Data-flow
author อ่าน 13 ไฟล์ของ `docs/stages/achieved/2026-06-07-cli-legacy-warning-fix/` → กลั่น decision ต่อ stage → เขียน walkthrough (ลิงก์กลับ ไม่ copy) → เพิ่ม README pointer

## 5. User-flow
ผู้ใช้ใหม่เปิด repo (GitHub) → README "worked example" → `docs/example-walkthrough.md` → ไล่ 5 stage → คลิก artifact จริงใน achieved/

## 6. Persona
ผู้ใช้ใหม่/contributor ที่เพิ่งติดตั้ง — อยากเห็น "output ที่ทำดีแล้ว" หน้าตาเป็นยังไง ก่อนเริ่ม topic ของตัวเอง

## 7. Test-flow (VERIFY)
- [ ] **dead-link = 0:** ทุกลิงก์ใน walkthrough (→ achieved/ 5 stage + 1 task + `.warnyin/workflow/stages/*.md`) + README→walkthrough resolve เป็นไฟล์จริง
- [ ] **โครงครบ 5 stage:** มีหัวข้อ/ลิงก์ครบ discovery·design·build·verify·ship + 1 task + disclaimer
- [ ] **ไม่ duplicate:** grep ว่า walkthrough ไม่ copy ขั้นตอน playbook (ชี้กลับ ไม่เขียนซ้ำ checklist stage)
- [ ] **ไม่ regression:** `npm run verify:pack` + `npm test` เขียว (ยืนยันไม่แตะ payload); README marker/structure เดิมไม่พัง
- [ ] edge: ลิงก์ relative ถูกจากตำแหน่งไฟล์ (`docs/example-walkthrough.md` → `docs/stages/achieved/...` = `stages/achieved/...`)
