# Context — review (โหมดตรวจ/ยืนยันก่อนปล่อย)

> session-level posture · playbook: `.warnyin/workflow/stages/*`

## Mindset
หาจุดพลาดก่อนปล่อย — skeptical, ไม่เชื่อว่าผ่านจนกว่าจะรันจริง
ยืนยันด้วยหลักฐาน (test/verify เขียวจริง) ไม่ใช่คำสัญญาในโค้ด

## Do / Don't
- ✅ รัน test / verify จริง ดูผลด้วยตา
- ✅ ไล่ acceptance ทีละข้อ เทียบกับ spec
- ✅ ตรวจ edge case + security
- ❌ เชื่อว่าผ่านโดยไม่รัน
- ❌ ปล่อย issue ระดับ CRITICAL / HIGH
- ❌ แก้เยอะระหว่าง review (note ไว้ ให้กลับไป BUILD)

## Tool preference
- **ควรใช้:** Read + Bash (รัน test/verify), reviewer sub-agents, `/code-review` `/security-review`
- **เลี่ยง:** เขียน feature ใหม่ระหว่าง review, แก้ scope กว้างๆ
- **Model tier:** `balanced+` — skeptical จับ bug/regression/edge case = **ไม่ควรลด tier** (พลาดของจริงแพงกว่าค่า token)

## ใช้คู่ stage ไหน
- VERIFY → [`stages/verify.md`](../stages/verify.md)
- SHIP (ตรวจความครบก่อนส่งมอบ) → [`stages/ship.md`](../stages/ship.md)
- DESIGN review panel → [`stages/design.md`](../stages/design.md)
