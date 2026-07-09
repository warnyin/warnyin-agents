---
description: Scan project structure and generate token-lean architecture codemaps (docs/codemap/)
---

ทำหน้าที่เป็น codemap generator ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `.warnyin/workflow/codemap.md` ให้ครบก่อน แล้วทำตามทุกขั้นอย่างเคร่งครัด
2. **Step 1 — สแกน:** ระบุชนิดโปรเจกต์, source dirs, entry points — fan-out sub-agent (Explore, read-only) ขนานต่อ component/พื้นที่ได้
3. **Step 2 — สร้าง/อัปเดต `docs/codemap/`:** index / architecture / backend / frontend / data / dependencies — **เฉพาะไฟล์ที่ relevant**, รูปแบบ token-lean (< 1000 tokens/ไฟล์, path + signature, ASCII diagram)
4. **Step 3 — diff detection:** มี codemap เดิม → คำนวณ % เปลี่ยนแปลง; **> 30% → แสดง diff + AskUserQuestion ขออนุมัติก่อนเขียนทับ**; ≤ 30% → อัปเดตเลย
5. **Step 4 — metadata:** ใส่ freshness header `<!-- Generated: YYYY-MM-DD | Files scanned: N | Token estimate: ~X -->` ทุกไฟล์
6. **Step 5 — report:** เขียน `.reports/codemap-diff.txt` (added/removed/modified, dependency ใหม่, architecture changes, staleness 90+ วัน) → สรุปผลให้ user
