# Standard — playbook-wiring

## reuse pattern (ห้ามประดิษฐ์ใหม่)
- **hook แบบ `api-doc.md`** — capability ที่แตะหลาย stage ใช้ **pointer สั้น + เลข section** ชี้กลับ canonical ไม่ duplicate logic (เทียบวิธี api-doc.md เสียบ hook DESIGN/VERIFY/SHIP); fast-track hook ใน verify.md/ship.md = pointer 1-2 บรรทัด ชี้ `triage.md#fast-track-skip-list`
- **§7 reframe = ขยายในที่เดิม** (unify-in-place) — แก้ section "7. ปรับความละเอียดตามขนาด change" เดิม (บรรทัด ~106-109) ให้เป็น 3-tier ไม่เพิ่ม section ใหม่
- **README tree comment** — รูปแบบเดียวกับบรรทัด `next.md`/`api-doc.md` (บรรทัด ~42-44): `<file>  #  capability/playbook: <ชื่อ> — <สรุปสั้น>`

## canonical-copy / pointer-only
- **ห้าม inline ตาราง skip-list/rubric** ในทุกไฟล์ที่แตะ — เขียน **markdown-link** ชี้ `triage.md` เท่านั้น (design §4, รูบริคเต็มอยู่ T1 เดียว)
- markdown-link ต้อง relative resolve ได้จริง (เช่น จาก `stages/verify.md` → `../triage.md#...`)

## correctness floor (ห้ามลด)
- hook fast-track **ห้าม** ทำให้ full-gate ของ BUILD / test-floor / archive ของ standard/large หลวม — ระบุชัดว่า lite = ข้าม ceremony ไม่ใช่ข้าม correctness (panel QA-S5)
