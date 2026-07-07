---
description: รัน DESIGN stage — เสนอ change พร้อมผลิต proposal/design/tasks ครบในขั้นเดียว
argument-hint: "[slug ของ topic] [อธิบาย change สั้นๆ]"
---

ทำหน้าที่เป็น DESIGN architect ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `.warnyin/workflow/stages/design.md` ให้ครบก่อน แล้วทำตามทุกหลักการอย่างเคร่งครัด
   - **ห้ามเดาเอง** — ไม่ชัดให้ถามทีละข้อ + เสนอคำตอบที่แนะนำทุกข้อ
   - ออกแบบแบบ **vertical slice architecture**
   - **Gate ก่อนเขียนไฟล์ task** แล้วค่อยโยนให้ sub-agent
2. อ่าน Input ตามข้อ 2 ของ playbook — โดยเฉพาะ `docs/techstack/<component>/rule.md` และ `standard.md`
3. งาน: $ARGUMENTS
   - ระบุ slug → ใช้/สร้าง `docs/stages/<slug>/` (ถ้ามาจาก Discovery ใช้โฟลเดอร์เดิม)
   - ถ้าเป็นคำถาม/ยังไม่มั่นใจเรื่อง design → แนะนำ `/warnyin:discovery` ก่อน
4. ผลิต artifact โดยใช้ template ใน `.warnyin/template/stages/[topic]/` เป็นโครง: `business.md` (ข้ามได้ถ้า change เล็ก), `proposal.md`, `design.md` (lens `.warnyin/workflow/roles/sa.md`), แล้วแตก `tasks/<task-name>/` (lens `.warnyin/workflow/roles/tech-lead.md`) แต่ละใบมี `spec.md` `standard.md` `rule.md` `task.md`
   - **Model tier ต่อ task:** ตอนแตก task ระบุ field `Model tier` ใน `task.md` (generic `{cheap, balanced, deepest}`; ไม่ระบุ = `balanced`) — mechanical/scaffold/config → `cheap` · implement ตาม spec ปกติ → `balanced` · logic หนัก/security/algorithm/ไม่เคยทำ → `deepest` (BUILD orchestrator map tier→รุ่นจริงตอน fan-out — ดู `contexts/README.md` §"Model tier")
   - **Spec delta:** `design.md` ต้องครอบ section "9. Spec delta" — เทียบ `docs/features/<name>/spec.md` ปัจจุบัน (input ข้อ 6) แล้วเขียน ADDED/MODIFIED/REMOVED หรือ "ไม่มี delta" (กติกาเต็ม + gate ดู playbook §2/§4/§8 — ไม่ทำซ้ำที่นี่)
   - **Gate ดู playbook §8** — ถ้ารัน node ได้ validate `<slug>` ควรไม่มี ✖ (รายการเช็คอยู่ใน script + playbook ไม่ทำซ้ำที่นี่)
   - **Review panel (ถาม user ก่อน):** หลัง `design.md` เสร็จ ก่อนแตก task — ใช้ AskUserQuestion ถามว่าจะให้ panel รีวิวไหม ถ้า ok → fan-out subagent `warnyin-sa`, `warnyin-tech-lead`, `warnyin-qa`, `warnyin-security`, `warnyin-infra` (Agent tool, ขนาน, read-only) รีวิว proposal+design → รวมความเห็น สรุปให้ user → แก้ blocker ให้ครบ (ห้ามเดา) → บันทึก section "Design review" ท้าย `design.md`
5. ตอน generate ไฟล์ task หลายใบ: **standard/large tier** → fan-out **default** หนึ่ง read-only agent ต่อหนึ่ง task ขนาน (หลังผ่าน Gate §8 ของ playbook); **fast tier** → ใช้ fast path/pre-flight (playbook §4 step 1.5) ไม่สร้าง task folder ไม่ fan-out — ดู [fast-track skip-list](../../.warnyin/workflow/triage.md#fast-track-skip-list) + playbook §7
   - **fast-track path:** copy template `.warnyin/template/stages/receipt.md` → เติม meta (hard-floor row) + §1 + §2 **ก่อนแตะโค้ด** → logic อยู่ playbook กลาง (`stages/design.md` fast path + `triage.md` skip-list) — adapter ชี้ ไม่ duplicate ขั้นตอน
6. **Dry-run (ถาม user ก่อนเสมอ):** หลังเขียนไฟล์ task ครบ ใช้ AskUserQuestion ถามว่าต้องการ dry-run ทั้งหมดเพื่อหาจุดบกพร่องก่อนเข้า BUILD ไหม — ถ้า ok ทำตามข้อ 4.9 ของ playbook:
   - fan-out agent (Agent tool) **หนึ่งตัวต่อหนึ่ง task แบบขนาน, read-only** — อ่าน task ทั้ง 4 ไฟล์ + design/proposal + โค้ดจริงที่เกี่ยว เดิน implement ในหัว หา **blocker** (implement ตาม spec ไม่ได้ — ต้องแก้ก่อน BUILD) และ **defer** (ทำ/ตัดสินใจทีหลังได้ แต่ต้อง track)
   - task ที่พบ issue → เขียน `docs/stages/<slug>/tasks/<task>/issue.md` (ตาม template); รันครบทุก task → **สรุปผลรวม** ให้ user
   - **หาวิธีแก้ DESIGN ตาม issue โดยห้ามเดา ห้ามคิดขึ้นเอง** — ติดจริงๆ → สัมภาษณ์ user ทีละข้อ + เสนอคำตอบแนะนำทุกครั้ง; คำถามที่โค้ดตอบได้ → ไปอ่านโค้ดเอง
   - แก้แล้ว rerun dry-run เฉพาะ task ที่กระทบ วนจน **ไม่มี blocker ค้าง**
7. เมื่อพร้อม implement → บอกให้รัน `/warnyin:build`
