# Spec — ship-maintenance-wiring

> spec เฉพาะของ task นี้ — playbook/docs change

## 1. ชนิดของ task
`docs/playbook` (แก่น `.warnyin/workflow/` — tool-agnostic markdown)

## 4. Data-flow
- **producer:** `ship.md` process §4 (ขั้น archive) → เขียน `docs/stages/context.md`:
  - append แถวใน "เพิ่ง ship": `| <YYYY-MM-DD> | <slug> | <ไฮไลต์ 1 บรรทัด> |`
  - prune ให้เหลือ **N=5** แถวล่าสุด
  - อัปเดต "โฟกัส/ธีมปัจจุบัน" ถ้าธีมงานขยับ
  - section/ไฟล์ไม่มี → สร้างจาก canonical (`design.md` §3)
- **consumers (read-only, มีอยู่แล้ว):** `discovery.md` §2.5, `explore.md`, `next.md` — อ่าน working-notes เพื่อ orient

## 5. User-flow
- ผู้ใช้ ship topic เสร็จ → context.md มี trace ไฮไลต์ล่าสุด → รอบงานถัดไป เปิด `/warnyin:next` (status, derived) + อ่าน context.md (โฟกัส/decision/parking-lot) → เข้าใจบริบทครบ

## 6. Persona
- AI agent + ผู้ใช้ ที่กลับมาทำงานข้าม session/topic — ต้อง orient เร็วโดยไม่รื้อ folder เอง

## 7. Test-flow (playbook = markdown → ยืนยันเชิงโครง + dogfood)
- [ ] อ่าน `ship.md` — มีขั้น maintenance context.md ใน process §4 + gate item ที่ตรวจได้
- [ ] `next.md` — ยังมีหลักการ "Read-only เด็ดขาด รวมถึง context.md" (ไม่ถูกลบ/ขัด) แต่ wording อธิบาย working-notes
- [ ] grep หา "status"/"stage ปัจจุบัน" ที่อาจชวนให้จด topic-status ลง context.md → ต้องไม่มี (กัน unify-in-place ขัด)
- [ ] consistency: ทุกไฟล์ที่พูดถึง context.md ชี้ canonical เดียว ไม่มีนิยามขัดกัน
- [ ] (VERIFY) dogfood: รัน SHIP จริงกับ topic นี้ → `docs/stages/context.md` ได้แถว "เพิ่ง ship" จริง
