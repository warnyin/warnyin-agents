# Spec — add-defensive-rules

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`docs` / `content` — แก้ `.md` แก่นกลาง workflow (playbook + role card)

## 2. Canonical wording (ใช้ตรงนี้ทุกจุด — design.md §2)
- **R1 investigate-before-edit:** ก่อนแก้ไฟล์ที่มีอยู่ ต้องเข้าใจก่อน — ใครใช้/อ่านไฟล์นี้, schema/contract/สัญญาของมัน, เจตนาเดิม; แก้โดยไม่เข้าใจ = เดา (ไม่ชัด → ถาม user / อ่านโค้ดที่อ้างถึง ก่อนแก้)
- **R2 config-protection:** ห้ามแก้ config (linter/formatter/test threshold) หรือ disable rule "เพื่อให้ build/test ผ่าน" แทนแก้โค้ดจริง; config ผิดจริงแก้ได้ แต่ต้องมีเหตุผลชัด + note (ไม่ใช่เพื่อเลี่ยง finding)

## 3. จุดที่ต้องแก้ (design.md §4)
| ไฟล์ | ใส่อะไร |
|---|---|
| `src/.warnyin/workflow/stages/build.md` §3 | +2 operating principle (R1 + R2 ฉบับเต็ม) |
| `src/.warnyin/workflow/stages/verify.md` §3 | +2 operating principle (R1 + R2; R2 ย้ำ fix loop) |
| `src/.warnyin/workflow/roles/developer.md` | +2 checklist line (เวอร์ชันสั้น dev) |
| `src/.warnyin/workflow/roles/qa.md` | +2 checklist line (เวอร์ชันสั้น qa) |

## 4. Data-flow
ไม่มี runtime — AI อ่าน principle ตอนเริ่ม stage + ไล่ checklist ก่อนส่งงาน (2 enforce point)

## 5. Persona
AI หลัก/build sub-agent (BUILD) + strategy tester (VERIFY) — ได้กฎดัก 2 failure mode ตอน edit loop

## 6. Test-flow
- [ ] R1 + R2 ปรากฏใน `build.md` §3 + `verify.md` §3 (grep keyword "investigate"/"เข้าใจก่อน", "config")
- [ ] developer.md + qa.md มี checklist line ใหม่ครบ
- [ ] wording 4 จุดสอดคล้อง canonical §2 (ไม่ขัดกัน)
- [ ] global bullet ถูก note ใน `rule.md` §2 (รอ SHIP)
- [ ] `npm test` 18/18 + `npm run verify:pack` เขียว (ไม่กระทบ test เดิม)
