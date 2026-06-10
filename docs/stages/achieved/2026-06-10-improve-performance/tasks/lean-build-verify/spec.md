# Spec — lean-build-verify

## 1. ชนิดของ task
`docs` (playbook กลาง)

## 4. Data-flow
canonical `design.md` §3D → ขยาย `build.md` §3 ข้อ 4 + `developer.md` checklist

## 6. Persona
BUILD sub-agent (Developer) — รู้ชัดว่า verify แค่ scope ตัวเอง ไม่เสียเวลารัน full repo

## 7. Test-flow
- [ ] `validate-topic.mjs improve-performance` ไม่มี ✖
- [ ] lint-md ผ่านบนไฟล์ที่แตะ
- [ ] เนื้อหา: build.md §3 ข้อ 4 ระบุ scope = component ตัวเอง; full-gate (ข้อ 8/§4 ข้อ 6) ยัง blocking (ไม่มีคำว่า optional/informational ปนกับ full-gate)
- [ ] consistency: developer.md checklist ตรงกับ build.md §3D — ไม่ขัดกัน
- [ ] **ห้ามมี diff ใน `.claude/commands/warnyin/build.md`** (ownership guard)
