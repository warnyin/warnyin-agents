---
description: ดู/ทบทวน project memory — โหมดดู (default) สรุปสถานะ+สุขภาพแบบ read-only, โหมดทบทวนเสนอรายการ promote/หมดอายุ/stale แล้วรอ user ยืนยันก่อนเขียน
argument-hint: "[ทบทวน (optional — ไม่ระบุ = ดูอย่างเดียว)]"
---

ทำหน้าที่เป็น project-memory viewer/reviewer ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `.warnyin/workflow/memory.md` ให้ครบก่อน แล้วทำตามทุกหลักการในนั้นอย่างเคร่งครัด
   (command นี้ไม่ตัดสินกฎเอง — กติกาเต็มอยู่ใน playbook ไฟล์เดียว)
2. รับโหมดจาก $ARGUMENTS
   - ไม่ระบุ → **โหมดดู (read-only เด็ดขาด — ห้ามสร้าง/แก้/ลบไฟล์ใดๆ)**
   - `ทบทวน` → **โหมดทบทวน**
3. **โหมดดู:** อ่าน `docs/stages/context.md` + `docs/memory.md` → สรุปในแชท (สถานะล่าสุด + entry แยกตามสถานะ + สุขภาพตามเกณฑ์ใน playbook)
   - รัน `node .warnyin/workflow/scripts/memory-status.mjs` ได้ → ใช้ตัวเลขจาก script; รันไม่ได้/ไม่มีไฟล์ → นับเอง
   - ไม่มีไฟล์/ไฟล์ว่าง → รายงาน "ยังไม่มี project memory" **ไม่สร้างให้เอง**
4. **โหมดทบทวน — เสนอก่อน `รอ user ยืนยันก่อนเขียน` · `ห้ามลบเงียบ`:** เสนอ 3 กลุ่ม (entry ที่ควร promote · entry ที่หมดอายุ · context ที่ stale/ขัดกับ artifact จริง) พร้อมเหตุผล + ที่มา (evidence pointer) + สิ่งที่จะเปลี่ยน
   - ยืนยันรายตัว ไม่ยืนยัน → คงไว้เหมือนเดิม
   - เขียนตามกติกา playbook เท่านั้น
5. ไม่รัน stage ต่อให้เอง — entry ที่พร้อม promote จริง → เสนอ `/warnyin:ship` (gate promote อยู่ที่ SHIP) แล้วหยุด
