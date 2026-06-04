---
description: รัน DESIGN stage — เสนอ change พร้อมผลิต proposal/design/tasks ครบในขั้นเดียว
argument-hint: "[slug ของ topic] [อธิบาย change สั้นๆ]"
---

ทำหน้าที่เป็น DESIGN architect ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `workflow/stages/design.md` ให้ครบก่อน แล้วทำตามทุกหลักการอย่างเคร่งครัด
   - **ห้ามเดาเอง** — ไม่ชัดให้ถามทีละข้อ + เสนอคำตอบที่แนะนำทุกข้อ
   - ออกแบบแบบ **vertical slice architecture**
   - **Gate ก่อนเขียนไฟล์ task** แล้วค่อยโยนให้ sub-agent
2. อ่าน Input ตามข้อ 2 ของ playbook — โดยเฉพาะ `docs/techstack/<component>/rule.md` และ `standard.md`
3. งาน: $ARGUMENTS
   - ระบุ slug → ใช้/สร้าง `warnyin-stages/<slug>/` (ถ้ามาจาก Discovery ใช้โฟลเดอร์เดิม)
   - ถ้าเป็นคำถาม/ยังไม่มั่นใจเรื่อง design → แนะนำ `/warnyin:discovery` ก่อน
4. ผลิต artifact โดยใช้ template ใน `warnyin-stages/[topic]/` เป็นโครง: `business.md` (ข้ามได้ถ้า change เล็ก), `proposal.md`, `design.md`, แล้วแตก `tasks/<task-name>/` แต่ละใบมี `spec.md` `standard.md` `rule.md` `task.md`
5. ตอน generate ไฟล์ task หลายใบ สามารถใช้ sub-agent (Task/Agent tool) fan-out หนึ่ง agent ต่อหนึ่ง task ได้ — **แต่ต้องผ่าน Gate (ข้อ 8 ของ playbook) ก่อน**
6. **Dry-run (ถาม user ก่อนเสมอ):** หลังเขียนไฟล์ task ครบ ใช้ AskUserQuestion ถามว่าต้องการ dry-run ทั้งหมดเพื่อหาจุดบกพร่องก่อนเข้า BUILD ไหม — ถ้า ok ทำตามข้อ 4.9 ของ playbook:
   - fan-out agent (Agent tool) **หนึ่งตัวต่อหนึ่ง task แบบขนาน, read-only** — อ่าน task ทั้ง 4 ไฟล์ + design/proposal + โค้ดจริงที่เกี่ยว เดิน implement ในหัว หา **blocker** (implement ตาม spec ไม่ได้ — ต้องแก้ก่อน BUILD) และ **defer** (ทำ/ตัดสินใจทีหลังได้ แต่ต้อง track)
   - task ที่พบ issue → เขียน `warnyin-stages/<slug>/tasks/<task>/issue.md` (ตาม template); รันครบทุก task → **สรุปผลรวม** ให้ user
   - **หาวิธีแก้ DESIGN ตาม issue โดยห้ามเดา ห้ามคิดขึ้นเอง** — ติดจริงๆ → สัมภาษณ์ user ทีละข้อ + เสนอคำตอบแนะนำทุกครั้ง; คำถามที่โค้ดตอบได้ → ไปอ่านโค้ดเอง
   - แก้แล้ว rerun dry-run เฉพาะ task ที่กระทบ วนจน **ไม่มี blocker ค้าง**
7. เมื่อพร้อม implement → บอกให้รัน `/warnyin:build`
