---
description: รัน BUILD stage — fan-out sub-agent ต่อ task ตาม dependency (Workflow + worktree) แล้ว integrate
argument-hint: "[slug ของ topic]"
---

ทำหน้าที่เป็น BUILD orchestrator ตาม **playbook กลาง** ของ workflow มาตรฐาน

0. **★ เช็ค context window ก่อนเริ่ม:** ถ้า context ของ session ถูกใช้ไปเยอะหรือ**เกินครึ่ง** → เสนอ user ให้ `/compact` หรือ `/clear` ก่อนเสมอ แล้วค่อยรัน `/warnyin:build <slug>` ใหม่ใน context ที่โล่ง (สถานะงานอยู่ในไฟล์ `docs/stages/<slug>/` ครบ) — อย่าเริ่ม fan-out ทั้งที่ context ใกล้เต็ม
1. อ่าน `.warnyin/workflow/stages/build.md` ให้ครบก่อน แล้วทำตามทุกหลักการอย่างเคร่งครัด
2. slug: $ARGUMENTS — ถ้าไม่ระบุให้ถามก่อน ว่าจะ build topic ไหน (ดูโฟลเดอร์ใน `docs/stages/`)
3. **อ่าน task ทั้งหมด** ใน `docs/stages/<slug>/tasks/*/task.md` + `design.md` → ดึง dependency → สร้าง DAG → จัด **wave** ด้วย topological order
4. **Pre-check:** target เป็น git repo ไหม (จำเป็นสำหรับ worktree isolation) — ถ้าไม่ใช่ → fallback sequential shared-tree (`isolate:false`) และแจ้ง user. สร้าง build branch ใหม่ก่อนเริ่ม
5. **ขออนุมัติครั้งเดียว** — ใช้ AskUserQuestion แสดง execution plan: แต่ละ wave มี task อะไร, อันไหน parallel, isolation mode, build branch → รอ go/no-go (อย่าเริ่มก่อนได้ไฟเขียว)
6. **เดินทีละ wave** (หลังอนุมัติ):
   - เรียก **Workflow** ด้วย `{ scriptPath: ".warnyin/workflow/scripts/build-wave.mjs", args: { slug, tasks: [<task ใน wave นี้>], isolate } }`
   - เมื่อ workflow คืนผล: ถ้า `isolate` → **merge** branch ที่แต่ละ agent รายงาน (`result.branch`) เข้า build branch ทีละอัน, แก้ conflict ถ้ามี; ถ้า shared-tree → review + commit ให้
   - ถ้ามี task `failed` หรือ `skipped` → **หยุด** รายงาน user ก่อนไป wave ถัดไป
   - **รวม troubleshooting:** ดึงฟิลด์ `troubleshooting` จากผลของทุก agent ในรอบนี้ → เขียนรวมลง `docs/stages/<slug>/troubleshooting.md` (main loop เขียนเอง กันไฟล์ชนกันใน worktree)
7. **★ Full build & test gate (หลัง merge ทุก wave):** บน build branch ที่ integrate แล้ว รัน build ทั้งหมด + test suite ทั้งหมด (รวม unit test) ของทุก component ที่กระทบ
   - **เจอ error → อ่าน `docs/troubleshooting.md` ก่อน** เผื่อเคยแก้แล้ว
   - มี build error / test แดง → **แก้จนเขียวหมด (loop)**: วิเคราะห์ error, แก้ (จะ delegate fix ให้ sub-agent ทีละจุดก็ได้), rerun build/test ใหม่ ทำซ้ำจนผ่าน
   - ปัญหา **ยาก/เจอซ้ำ** ที่แก้สำเร็จในรอบนี้ → บันทึกลง `docs/stages/<slug>/troubleshooting.md`
   - ห้ามปิด BUILD ถ้ายังแดง; ถ้าวนหลายรอบยังไม่ผ่าน → หยุด รายงาน user พร้อม error log
8. **ปิดงาน:** เขียน `docs/stages/<slug>/build.md` (ผลต่อ task + ผล full build/test + integration notes), อัปเดตสถานะใน `task.md` แต่ละใบ → เสนอเข้า VERIFY ด้วย `/warnyin:verify`

หมายเหตุ:
- ห้ามแก้ rule/standard กลางใน `docs/` (rule ใหม่ที่เสนอถูก note ไว้ใน `tasks/<task>/rule.md` รอ SHIP)
- ปัญหายาก/ซ้ำที่แก้ได้ → `docs/stages/<slug>/troubleshooting.md` (SHIP จะยกขึ้น `docs/troubleshooting.md`)
- เกณฑ์ปิด BUILD ดู Gate ข้อ 7 ของ playbook
- คงเป็น command (user-only) โดยตั้งใจ — BUILD เป็น stateful/irreversible (สร้าง branch, fan-out, แก้ไฟล์) ต้องให้ user สั่งชัด ไม่ทำเป็น skill auto-invoke
