---
description: รัน VERIFY stage — strategy tester: เทสตามจุดประสงค์ใน local env (FE: e2e smoke + UXUI) แก้จนผ่าน
argument-hint: "[slug ของ topic]"
---

ทำหน้าที่เป็น strategy tester ตาม **playbook กลาง** ของ workflow มาตรฐาน

0. **★ เช็ค context window ก่อนเริ่ม:** ถ้า context ของ session ถูกใช้ไปเยอะหรือ**เกินครึ่ง** → เสนอ user ให้ `/compact` หรือ `/clear` ก่อนเสมอ แล้วค่อยรัน `/warnyin:verify <slug>` ใหม่ใน context ที่โล่ง (สถานะงานอยู่ในไฟล์ `docs/stages/<slug>/` ครบ) — อย่าเริ่มลูปเทส-แก้ทั้งที่ context ใกล้เต็ม
1. อ่าน `.warnyin/workflow/stages/verify.md` ให้ครบก่อน แล้วทำตามทุกหลักการอย่างเคร่งครัด
2. slug: $ARGUMENTS — ถ้าไม่ระบุให้ถามก่อน ว่าจะ verify topic ไหน
3. **เข้าใจจุดประสงค์ก่อนเทส:** อ่าน `tasks/*/spec.md` + `task.md`, `design.md`, `proposal.md` ทั้งหมดให้เข้าใจดี แล้วค่อยเทสตามเจตนาของ topic
   - **regression baseline:** อ่าน `docs/features/<name>/spec.md` ของ feature ที่ topic แตะด้วย (ดูจาก Spec delta ใน `design.md`) — scenario เดิม = regression case, scenario ใน delta = test case ใหม่ (รายละเอียดดู playbook §2/§3/§4 — ไม่ทำซ้ำที่นี่)
4. **guideline:** อ่าน `docs/techstack/<component>/test.md` ว่าเทสยังไง (เช่น FE: e2e smoke ผ่าน playwright-cli) — ไม่มีก็เสนอวิธีแล้วเขียนแผนเอง; ดู `docs/infra.md` สำหรับ local env
5. **เขียนแผนลง** `docs/stages/<slug>/test.md`
6. **เทสจริงใน local env:** รัน service ที่เกี่ยวข้อง (ใช้ skill `run`/`verify` ช่วย launch ได้) → รันเทสตามแผน; FE → e2e smoke + ตรวจ UX/UI
7. **ข้อไหนไม่ผ่าน → แก้ → rerun** วนจนผ่าน **นับจำนวนการแก้ไข**; เจอปัญหา → อ่าน `docs/troubleshooting.md` ก่อน, ปัญหายาก/ซ้ำที่แก้ได้ → บันทึก `docs/stages/<slug>/troubleshooting.md`
8. **ถ้านาน/วนหลายรอบเกินไป → ถาม user ทีละข้อ + เสนอคำตอบที่แนะนำ** (อย่าวนเงียบไม่จบ)
9. **เขียนสรุป** `docs/stages/<slug>/verify.md` (ผลเทส + รายการแก้ไข + จำนวนรอบ + ผล UXUI) → เสนอเข้า SHIP ด้วย `/warnyin:ship`

หมายเหตุ: ห้ามแตะไฟล์กลางใน `docs/` — `test.md` เขียนระดับ topic ก่อน รอ SHIP merge. เกณฑ์ปิดดู Gate ข้อ 6 ของ playbook
