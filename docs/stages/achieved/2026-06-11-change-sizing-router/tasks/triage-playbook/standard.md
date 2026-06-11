# Standard — triage-playbook

> pattern โค้ด/เอกสาร + shared component ที่ต้อง reuse (ห้ามเขียนซ้ำ)

## reuse pattern (ห้ามประดิษฐ์ใหม่)
- **โครงไฟล์ = `src/.warnyin/workflow/next.md`** (utility router read-only) — ลอกโครง: §1 คืออะไร/ใช้เมื่อไหร่ · §2 วิธีประเมิน (สแกน/ตัดสิน) · §3 รูปแบบรายงาน (ตอบในแชท) · §4 หลักการ (read-only เด็ดขาด, สรุปจาก evidence, แนะนำแล้วหยุด)
- **header เหมือน playbook กลางอื่น:** บรรทัดบนสุด `# TRIAGE — ...` + blockquote "Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน"
- ภาษาไทย ตามสไตล์ playbook เดิม

## canonical-copy (สำคัญสุด)
- เนื้อ rubric (tier/signals/hard-floor/skip-list/route) = **copy จาก `design.md` §3A-§3D คำต่อคำ** — ห้ามแต่งใหม่/เพิ่มความเห็น (rule `canonical-copy`)
- กระชับ opinionated — ไม่ใส่หมวดเกินที่ design กำหนด (ไม่บานเป็น catalog)

## section anchor (กัน dead-link ของ task อื่น)
- section fast-track skip-list ต้องมี heading `##` ที่ stable (เช่น `## Fast-track skip-list`) เพราะ T2/T3 จะทำ markdown-link `[..](../triage.md#fast-track-skip-list)` มา — ตั้งชื่อ heading ให้ slug ตรง

## tool-agnostic
- ไม่ผูกชื่อรุ่น/tool ของ harness ใด (payload generic — `docs/rule.md §1` payload-guidance); model tier ใช้ vocab generic ถ้าอ้าง
