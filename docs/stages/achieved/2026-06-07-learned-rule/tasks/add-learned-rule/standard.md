# Standard — add-learned-rule

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การแก้ playbook / command / template เดิม — อิงสไตล์ §3 principle + §4 step + §6 gate ที่มีอยู่

## 1. Standard กลางที่ยึด
- **single source of truth** (CLAUDE.md) — wording canonical ที่ design §2 แล้ว reference; playbook = นิยามเต็ม, command + template ชี้กลับ ไม่ duplicate ความหมายต่าง
- **กระทัดรัด opinionated** (`docs/rule.md` §1) — ต่อยอด §3/§4/§6 เดิม ไม่สร้างกลไกขนาน ไม่บวม
- **tool-agnostic** (`docs/rule.md` §1) — mechanism เป็น playbook แก่น; command = adapter บางชี้กลับ
- **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้ `src/.warnyin/` + `src/.claude/commands/` เท่านั้น; ห้ามแตะ root dogfood (`.warnyin/`, `.claude/` ที่ root = gitignored)

## 2. Pattern การเขียนของ task นี้
- **principle (ship.md §3):** ขยาย principle 7 เดิม (ไม่เพิ่มข้อใหม่ถ้าเลี่ยงได้ — เป็นการขยายความ "เก็บ รอ SHIP" ที่มีอยู่) ใช้รูปแบบ bold-label เดียวกับข้ออื่น
- **process step (ship.md §4):** เสริมในรายการ step เดิม (step 1 collect, step 3 fold approval, step 5 promote) — ไม่ renumber ถ้าเลี่ยงได้ ใช้การเติมประโยค/sub-point
- **gate item (ship.md §6):** ต่อในรายการ `- [ ]` เดิม
- **command (ship.md):** mirror step ที่ตรงกับ playbook (step 3 + step 5) — รูปแบบ numbered list เดิม
- **template section:** หัวข้อ `## Learned rules` รูปแบบตาราง 4 คอลัมน์ — แทน/ขยาย §3 "note รอ SHIP ที่ตัดทิ้ง" เดิม (renumber section ใน template ได้ถ้าจำเป็น — template ไม่มี cross-ref ภายนอก)
- **ภาษาไทย** ตามสไตล์ repo; โทนสั้น actionable
- **idempotent ทางความหมาย:** ถ้ามี mechanism นี้อยู่แล้ว ไม่เพิ่มซ้ำ

## 3. Shared component / utility (อย่าเขียนซ้ำ)
- wording มาจาก `design.md` §2 canonical — ห้ามคิด wording ใหม่ต่อไฟล์ (กัน drift)
- ผูกกับกลไก "รอ SHIP" เดิม — learned-rule = superset (planned + emergent); note "รอ SHIP" ที่ tasks เป็น subset (planned)
- promote target reuse เดิม (`docs/rule.md` / `docs/techstack/<c>/rule.md`) — ไม่สร้างปลายทางใหม่

## 4. เพิ่มเติมเฉพาะ task
- learned-rule **≠ troubleshooting** — ระบุชัดในนิยาม (troubleshooting = incident/วิธีแก้; learned-rule = กฎ generalize ที่ *อ้าง* troubleshooting เป็น evidence ได้)
- evidence **บังคับ** ต้องเขียนให้ actionable: "ที่มา 1 บรรทัด + ลิงก์ artifact" — กัน rule ลอย
