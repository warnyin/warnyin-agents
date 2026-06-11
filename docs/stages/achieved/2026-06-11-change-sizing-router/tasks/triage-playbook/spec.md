# Spec — triage-playbook

> spec เฉพาะ task · feature ประเภท playbook `.md` (ไม่มี runtime) → THEN เป็น **observable artifact** (section/key string มีจริง, ลิงก์ resolve)

## persona
contributor/AI ที่จะรัน `/warnyin:triage` เพื่อประเมินขนาด change ก่อนเลือก path

## data-flow
input = คำอธิบาย change ของ user (+ inspect โค้ดที่อ้างถึง) → ประเมินตาม rubric → output = รายงาน tier+route ในแชท (ไม่เขียนไฟล์)

## test-flow (task-scope — structural + consistency)
1. **ไฟล์มีจริง:** `src/.warnyin/workflow/triage.md` มีอยู่
2. **โครงครบ:** มี section tier taxonomy (fast/standard/large), signals, hard-floor, escalation, fast-track skip-list, route behavior
3. **hard-floor 5 หมวด:** grep พบ auth/authz · data-migration/schema · secret/credential · public-API/contract · security-sensitive ครบ
4. **skip-list anchor:** heading = `## Fast-track skip-list` (อังกฤษ → slug `fast-track-skip-list` ตรง link T3; lint strip anchor ไม่จับ ตั้งไทย = silent dead-link)
5. **read-only:** มีข้อความระบุ "ไม่สร้าง/แก้ไฟล์" + "แนะนำแล้วหยุด" (เหมือน `next.md` §4)
6. **ต่างจาก next:** มีข้อความระบุ triage = request by size, next = topic by stage
7. **canonical-copy:** wording ตรง `design.md` §3 คำต่อคำ (consistency check)
8. **generic:** grep ไม่พบชื่อรุ่น/ผลิตภัณฑ์ harness ใน triage.md
9. **lint:md** own-file ผ่าน (markdown-link ในไฟล์นี้ resolve; cross-file ไป command/§7 = full-gate)

## observable (scenario อ้าง design §9 — realize โดย task นี้)
- change เล็กไม่ sensitive → rubric ให้ tier `fast` (มี route fast-track)
- change แตะ hard-floor หมวดใดหมวดหนึ่ง → rubric บังคับ ≥ standard
- escalation: เริ่ม fast → แตะ hard-floor → เติม artifact ที่ข้าม
