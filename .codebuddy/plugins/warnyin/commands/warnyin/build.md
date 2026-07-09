---
description: รัน BUILD stage — fan-out sub-agent ต่อ task ตาม dependency (Workflow + worktree) แล้ว integrate
argument-hint: "[slug ของ topic]"
---

ทำหน้าที่เป็น BUILD orchestrator ตาม **playbook กลาง** ของ workflow มาตรฐาน

> **★ fast-track:** ถ้า topic เป็น tier `fast` → ไม่ fan-out/ไม่ fork worktree — main loop code-first ตาม playbook hook (ดูรายละเอียดที่ `.warnyin/workflow/stages/build.md §1`)

0. **★ เช็ค context window ก่อนเริ่ม:** ถ้า context ของ session ถูกใช้ไปเยอะหรือ**เกินครึ่ง** → เสนอ user ให้ `/compact` หรือ `/clear` ก่อนเสมอ แล้วค่อยรัน `/warnyin:build <slug>` ใหม่ใน context ที่โล่ง (สถานะงานอยู่ในไฟล์ `docs/stages/<slug>/` ครบ) — อย่าเริ่ม fan-out ทั้งที่ context ใกล้เต็ม
1. อ่าน `.warnyin/workflow/stages/build.md` ให้ครบก่อน แล้วทำตามทุกหลักการอย่างเคร่งครัด
2. slug: $ARGUMENTS — ถ้าไม่ระบุให้ถามก่อน ว่าจะ build topic ไหน (ดูโฟลเดอร์ใน `docs/stages/`)
3. **อ่าน task ทั้งหมด** ใน `docs/stages/<slug>/tasks/*/task.md` + `design.md` → ดึง dependency → สร้าง DAG → จัด **wave** ด้วย topological order · อ่าน field **`Model tier`** ของแต่ละ task ด้วย (generic `{cheap, balanced, deepest}`; ไม่มี = `balanced`) เพื่อใช้ map ตอนส่งเข้า build-wave (step 6)
4. **Pre-check:** target เป็น git repo ไหม (จำเป็นสำหรับ worktree isolation) — ถ้าไม่ใช่ → fallback sequential shared-tree (`isolate:false`) และแจ้ง user. สร้าง build branch ใหม่ก่อนเริ่ม
5. **ขออนุมัติครั้งเดียว** — ใช้ AskUserQuestion แสดง execution plan: แต่ละ wave มี task อะไร, อันไหน parallel, isolation mode, build branch → รอ go/no-go (อย่าเริ่มก่อนได้ไฟเขียว)
6. **เดินทีละ wave** (หลังอนุมัติ):
   - **map tier→รุ่นจริง (Claude adapter):** สำหรับแต่ละ task ใน wave นี้ → อ่าน `Model tier` generic จาก `task.md` แล้ว map เป็นชื่อรุ่นจริงของ harness นี้: `cheap → claude-haiku-4-5` · `balanced → claude-sonnet-4-6` · `deepest → claude-opus-4-8` (ไม่ระบุ tier = `balanced`) — orchestrator เป็นคน map (payload `build-wave` คง generic ไม่ผูกชื่อรุ่น)
   - **isolation ต่อ wave:** wave ≥2 task → `isolate:true` + `baseRef`; wave เดี่ยว → `isolate:false` + **checkout build branch ก่อนเรียก Workflow** (กัน commit ตกลง main)
   - เรียก **Workflow** ด้วย `{ scriptPath: ".warnyin/workflow/scripts/build-wave.mjs", args: { slug, tasks: [{ name: "<task ใน wave นี้>", model: "<ชื่อรุ่นจริงที่ map ได้>" }, ...], isolate, baseRef: "<ชื่อ build branch ที่สร้าง step 4>" } }` — `tasks` ส่งเป็น `{name, model}[]` (build-wave รับทั้ง `string[]` เดิมและ `{name, model?}[]`; `model` เป็น pass-through เข้า `agent()` ตรงๆ) · `baseRef` = build branch จริง (worktree fork จาก main → agent merge build branch เองก่อนทำงาน เพื่อเห็น `docs/stages/<slug>/` + output ของ wave ก่อนหน้า)
   - เมื่อ workflow คืนผล: ถ้า `isolate` → **integrate ด้วย `git checkout <result.branch> -- <ไฟล์ source ที่ task แก้>`** (checkout เฉพาะไฟล์ source ที่ scoped — เลี่ยง topic-docs copy ที่ agent merge เข้า worktree + ปลอด KB#11 tracked-deletion), แก้ conflict ถ้ามี; ถ้า shared-tree → review + commit ให้ · `task.md` status/checklist → main loop อัปเดตที่ main working dir ตอน integrate (E1 — agent แก้จาก worktree ไม่ได้ถ้า gitignored)
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
