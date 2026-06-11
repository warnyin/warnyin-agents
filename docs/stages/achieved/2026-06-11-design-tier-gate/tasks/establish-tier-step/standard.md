# Standard — establish-tier-step

> pattern payload `.md` — อิง `docs/techstack/installer/standard.md` + `docs/rule.md §1`

## เขียน playbook / template
- **unify-in-place** (`docs/rule.md §1`) — แทรก step ในโครง §4 เดิม + ประโยคใน §7; ไม่สร้าง section ขนาน
- **canonical-copy / ไม่ duplicate** — rubric (signals/hard-floor/tier) อยู่ `triage.md` เดียว; design.md **ชี้ pointer** ไม่ลอกตาราง (เหมือน §7 fast-track skip-list ที่ชี้ `../triage.md`)
- **tier = judgment ⚠ ไม่ใช่ validator ✖** (`docs/rule.md §1` change-sizing + structural-validator) — step เป็น guidance ให้ AI ประเมิน ไม่ใช่ mechanical check ใน `validate-topic.mjs`
- **กระทัดรัด opinionated** — step สั้น ตรงประเด็น ไม่บวม playbook
- **tool-agnostic** — wording generic ทุก harness ทำตามได้ (AskUserQuestion = กลไก Claude; เครื่องอื่นถาม user ด้วยวิธีของตัว — เขียนเป็น "ถาม user เป็น options")
- **mirror layout** — แก้ที่ `src/.warnyin/` (sync root ตอน release)

## รูปแบบ step ที่เพิ่ม (แนวทาง §4 step 1.5)
```markdown
1.5 **Establish tier (ก่อนจ่าย ceremony):** ประเมินขนาด change เบื้องต้นตาม rubric (`triage.md` §2 — signals + hard-floor)
   - **มั่นใจ** → กำหนด tier + บันทึก `proposal.md` ช่อง `ขนาด`
   - **ไม่มั่นใจ/ก้ำกึ่ง** → ถาม user (options): (ก) ประเมินด้วย `/warnyin:triage` ก่อน · (ข) user กำหนด tier เองถ้ารู้  [ก้ำกึ่ง default = ปัดขึ้น standard]
   - **hard-floor** (auth/migration/secret/public-API/security-sensitive) → ≥ standard เสมอ
   - tier → drive ceremony ตาม §7
```
