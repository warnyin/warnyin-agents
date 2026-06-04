---
description: รัน SHIP stage — ส่งมอบ: promote ความรู้ของ topic ขึ้นเอกสารกลางใน docs/ + archive topic
argument-hint: "[slug ของ topic]"
---

ทำหน้าที่เป็นผู้ส่งมอบ (SHIP) ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `workflow/stages/ship.md` ให้ครบก่อน แล้วทำตามทุกหลักการอย่างเคร่งครัด
2. slug: $ARGUMENTS — ถ้าไม่ระบุให้ถามก่อน ว่าจะ ship topic ไหน (ดูโฟลเดอร์ใน `warnyin-stages/`)
3. **อ่านทำความเข้าใจ topic:** อ่าน `warnyin-stages/<slug>/` ทุกไฟล์ (รวม `tasks/*/rule.md` section "รอ SHIP" + `standard.md`) — topic นี้ทำอะไร ทำอย่างไร เกิดความรู้ใหม่อะไรบ้าง; เช็คว่า VERIFY ผ่าน Gate แล้ว (`verify.md` สรุปผลผ่าน) — ถ้ายังไม่ผ่าน → หยุด แจ้ง user
4. **จำแนก feature:** feature ใหม่ หรือปรับปรุง feature เดิม (เทียบกับ `docs/features/` ที่มีอยู่)
5. **ขออนุมัติครั้งเดียว** — ใช้ AskUserQuestion สรุป promotion plan: feature ใหม่/ปรับปรุง, ไฟล์กลางที่จะอัปเดต + สาระที่จะใส่, ชื่อโฟลเดอร์ archive → รอ go/no-go (อย่าแก้ไฟล์ใดก่อนได้ไฟเขียว)
6. **★ Archive ก่อน:** ย้ายทั้งโฟลเดอร์ `warnyin-stages/<slug>/` → `warnyin-stages/achieved/<YYYY-MM-DD>-<slug>/` (ใช้ `git mv`; วันที่ = วันที่ ship) แล้วอ่านเนื้อหาจาก path ใหม่ระหว่าง promote
7. **อัปเดตเอกสารกลาง** (กลั่นเข้าโครงสร้างไฟล์เดิม ไม่ copy ดิบ, ระวัง duplicate):
   - `docs/features/<feature-name>/` — ใหม่ → สร้าง (feature.md + business.md); เดิม → อัปเดต โดยใช้ business/proposal/design ของ topic
   - `docs/techstack/<component>/{rule,standard}.md` — จาก note "รอ SHIP" (พิจารณาครบทุกข้อ: promote หรือตัดทิ้งพร้อมเหตุผล)
   - `docs/techstack/<component>/structure.md` + `test.md` — โครงสร้างที่เปลี่ยน (ดูโค้ดจริง) + merge แผนเทสจาก `test.md` ของ topic
   - `docs/rule.md` — global rule ใหม่/ที่เปลี่ยน (เฉพาะกฎระดับโปรเจกต์)
   - `docs/troubleshooting.md` — merge entry จาก `troubleshooting.md` ของ topic
   - `docs/infra.md` + `docs/project.md` — เฉพาะถ้ามีข้อมูลเกี่ยวข้อง
   - `docs/codemap/` ทั้งหมด — อัปเดตให้ตรงโค้ดจริงปัจจุบัน (อย่างน้อยทุกส่วนที่ change กระทบ)
8. **เขียนสรุป** `achieved/<YYYY-MM-DD>-<slug>/ship.md` (feature ใหม่/ปรับปรุง + ตารางเอกสารที่อัปเดต + note ที่ตัดทิ้งพร้อมเหตุผล) → รายงาน user ว่าส่งมอบครบ topic ปิดสมบูรณ์

หมายเหตุ:
- SHIP เป็นเรื่อง **เอกสาร + archive เท่านั้น** — ไม่ merge โค้ด (build branch → main จัดการเองนอก workflow)
- เนื้อหาที่ไม่แน่ใจว่าควร promote/วางไฟล์ไหน → ถามทีละข้อ + เสนอคำตอบที่แนะนำ อย่าเดา
- เกณฑ์ปิดดู Gate ข้อ 6 ของ playbook
