---
description: รัน SHIP stage — ส่งมอบ: promote ความรู้ของ topic ขึ้นเอกสารกลางใน docs/ + archive topic
argument-hint: "[slug ของ topic]"
---

ทำหน้าที่เป็นผู้ส่งมอบ (SHIP) ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `.warnyin/workflow/stages/ship.md` ให้ครบก่อน แล้วทำตามทุกหลักการอย่างเคร่งครัด
   **fast path:** tier `fast` → **ship-lite** ตาม hook ใน playbook (`stages/ship.md`) — ชี้ playbook ไม่ duplicate skip-list/lifecycle ที่นี่
2. slug: $ARGUMENTS — ถ้าไม่ระบุให้ถามก่อน ว่าจะ ship topic ไหน (ดูโฟลเดอร์ใน `docs/stages/`)
3. **อ่านทำความเข้าใจ topic + รวบรวม learned-rule candidate:** อ่าน `docs/stages/<slug>/` ทุกไฟล์ — topic นี้ทำอะไร ทำอย่างไร เกิดความรู้ใหม่อะไรบ้าง; เช็คว่า VERIFY ผ่าน Gate แล้ว (`build.md §4` มีผล verify สรุปผ่าน; **topic เก่า** ที่ทำตอนโครง artifact แยกไฟล์ → `verify.md` สรุปผลผ่าน นับได้เช่นกัน) — ถ้ายังไม่ผ่าน → หยุด แจ้ง user. ทำตาม playbook §4 step 1 — ถ้ารัน node ได้ validate `<slug>` ก่อน promote (มี ✖ ควรแก้ก่อน — รายการเช็คอยู่ใน script + playbook). รวบรวม learned-rule candidate เป็นตาราง (`rule + evidence + scope + promote?`): **planned** จาก `tasks/*/rule.md` §2 "รอ SHIP" + `standard.md` · **emergent** สแกนบทเรียนใน `build.md` §1-2 (pattern แก้ซ้ำ/integration) + §4 (ผล verify + รายการแก้)/`troubleshooting.md`/diff — `rule` ต้อง generalize (ไม่ใช่ incident), `evidence` บังคับ (pointer + ลิงก์ artifact; ไม่มี = ไม่ promote), `scope` = `component:<c>` หรือ `project`
4. **จำแนก feature:** feature ใหม่ หรือปรับปรุง feature เดิม (เทียบกับ `docs/features/` ที่มีอยู่)
5. **ขออนุมัติครั้งเดียว** — ใช้ AskUserQuestion สรุป promotion plan: feature ใหม่/ปรับปรุง, ไฟล์กลางที่จะอัปเดต + สาระที่จะใส่, ชื่อโฟลเดอร์ archive — **fold ตาราง learned-rule (rule + evidence + scope) เข้า approval เดียวกัน ให้ user ยืนยัน per-rule** (✅ promote / ✂️ ตัด + เหตุผล) → รอ go/no-go (อย่าแก้ไฟล์ใดก่อนได้ไฟเขียว)
6. **★ Archive ก่อน:** ย้ายทั้งโฟลเดอร์ `docs/stages/<slug>/` → `docs/stages/achieved/<YYYY-MM-DD>-<slug>/` (ใช้ `git mv`; วันที่ = วันที่ ship) แล้วอ่านเนื้อหาจาก path ใหม่ระหว่าง promote
7. **อัปเดตเอกสารกลาง** (กลั่นเข้าโครงสร้างไฟล์เดิม ไม่ copy ดิบ, ระวัง duplicate):
   - `docs/features/<feature-name>/` — ใหม่ → สร้าง (feature.md + business.md); เดิม → อัปเดต โดยใช้ business/proposal/design ของ topic — **และ merge `spec.md` ตาม Spec delta** ใน `design.md` §9 (ADDED ต่อท้าย · MODIFIED แทนที่ · REMOVED ลบ; **key ไม่เจอ → STOP ถาม user ห้าม merge เงียบ** — กติกาเต็มดู playbook §4 step 5)
   - `docs/techstack/<component>/{rule,standard}.md` — learned-rule ที่ยืนยันแล้ว scope `component:<c>` + note "รอ SHIP" (พิจารณาครบทุกข้อ: promote หรือตัดทิ้งพร้อมเหตุผล); learned-rule scope `project` → `docs/rule.md`
   - `docs/techstack/<component>/structure.md` + `test.md` — โครงสร้างที่เปลี่ยน (ดูโค้ดจริง) + merge แผนเทสจาก `build.md §3` ของ topic (topic เก่าที่มี `test.md` แยก → ใช้ไฟล์นั้น)
   - `docs/rule.md` — global rule ใหม่/ที่เปลี่ยน (เฉพาะกฎระดับโปรเจกต์)
   - `docs/troubleshooting.md` — merge entry จาก `troubleshooting.md` ของ topic
   - `docs/infra.md` + `docs/project.md` — เฉพาะถ้ามีข้อมูลเกี่ยวข้อง
   - `docs/codemap/` ทั้งหมด — อัปเดตให้ตรงโค้ดจริงปัจจุบัน ตาม `.warnyin/workflow/codemap.md` (= ขั้นตอนเดียวกับ `/warnyin:update-codemaps`)
8. **เขียนสรุป** `achieved/<YYYY-MM-DD>-<slug>/ship.md` (feature ใหม่/ปรับปรุง + ตารางเอกสารที่อัปเดต + note ที่ตัดทิ้งพร้อมเหตุผล) → รายงาน user ว่าส่งมอบครบ topic ปิดสมบูรณ์

หมายเหตุ:
- SHIP เป็นเรื่อง **เอกสาร + archive เท่านั้น** — ไม่ merge โค้ด (build branch → main จัดการเองนอก workflow)
- เนื้อหาที่ไม่แน่ใจว่าควร promote/วางไฟล์ไหน → ถามทีละข้อ + เสนอคำตอบที่แนะนำ อย่าเดา
- เกณฑ์ปิดดู Gate ข้อ 6 ของ playbook
- คงเป็น command (user-only) โดยตั้งใจ — SHIP เป็น stateful/irreversible (archive ด้วย git mv, promote เอกสารกลาง) ต้องให้ user สั่งชัด ไม่ทำเป็น skill auto-invoke
