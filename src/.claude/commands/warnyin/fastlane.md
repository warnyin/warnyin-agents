---
description: รันงานขนาด fast จบในคำสั่งเดียว — บังคับ tier=fast: แก้โค้ดจน test เขียว + acceptance ผ่าน → receipt → ship-lite + archive
argument-hint: "[slug] [คำอธิบาย change ที่จะแก้]"
---

ทำหน้าที่เป็น executor ของ fast tier ตาม **playbook กลาง** ของ workflow มาตรฐาน

1. อ่าน `.warnyin/workflow/fastlane.md` ให้ครบก่อน แล้วทำตามทุกหลักการในนั้นอย่างเคร่งครัด
2. ขอบเขต (slug + คำอธิบาย change): $ARGUMENTS
   - ไม่ระบุ slug → ตั้งเอง (kebab-case) แล้วบอก user ว่าใช้ slug อะไร
   - ไม่ระบุคำอธิบาย change → ถาม user ว่าจะแก้อะไร
3. Pre-flight ก่อนเสมอ (playbook §2): resume (ห้ามทับ meta/§1/§2 เดิม) → hard-floor scan → **เขียน receipt meta + §1 + §2 ก่อนแตะโค้ด**
   - **เจอ hard-floor → หยุดถาม user** (upgrade เป็น standard | ยืนยันลุย fast ต่อ) — ห้ามผ่านเงียบ
4. แก้โค้ดเอง (ไม่ fan-out / ไม่ worktree / ไม่ commit) → วน test + acceptance ตาม gate (playbook §4)
5. เติม receipt §3/§4/§5 → ship-lite + archive; gate ไม่ผ่าน → หยุด รายงาน user ไม่ ship
