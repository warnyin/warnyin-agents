# Build — adaptive-api-doc

> บันทึก BUILD · playbook: `.warnyin/workflow/stages/build.md`

## หมายเหตุ: retrofit (ไม่มี BUILD run แยก)
topic นี้ implement ลง `src/` **ก่อน** ทำให้เข้า workflow (แก้ playbook ตรงเพื่อตอบคำถาม user เรื่องนำ skill `openapi-spec-generation` มาใช้) — DESIGN/VERIFY ทำย้อนหลังเพื่อ formalize ตาม `CONTRIBUTING.md` §"เปลี่ยนพฤติกรรม stage ต้อง user ยืนยัน"

ดังนั้น **ไม่มี build sub-agent fan-out** — code มีอยู่จริงและผ่าน `npm test` 53/53 ก่อนเริ่ม DESIGN; validator ⚠ [C1] (VERIFY เริ่มแต่ build.md ยัง template) เป็นผลของลำดับ retrofit นี้ ไม่ใช่ความผิดพลาด

## สิ่งที่ build จริง (2 task ตาม design)
- **capability-core:** `src/.warnyin/workflow/api-doc.md` (สร้างใหม่)
- **stage-integration:** hook `stages/{design,verify,ship}.md` + `roles/README.md` + `workflow/README.md` + `CHANGELOG.md`

ผลตรวจสอบความถูกต้องอยู่ใน `verify.md` (12/12 ผ่าน, 0 รอบแก้) + Design review panel ใน `design.md` §10 (blocker 0 ทุก role)
