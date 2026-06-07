# Standard — add-example-walkthrough

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern: เอกสาร repo (docs/ + README) สไตล์เดิม

## 1. Standard กลางที่ยึด
- **tool-agnostic / ไม่ duplicate** (`docs/rule.md` §1) — walkthrough = adapter เอกสารบาง **ชี้ playbook/achieved** ไม่ copy ขั้นตอน (เหมือน command/skill ชี้ playbook)
- **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แตะแค่ `docs/` + root `README.md` (committed); **ห้ามแตะ `src/`**, playbook กลาง, npm payload
- **`docs/` ไม่ ship** (`docs/techstack/installer/structure.md`) — ไม่เพิ่ม `docs/` เข้า `package.json files`; README ติด tarball อยู่แล้ว (แก้ section ได้)
- **ภาษาไทย** (`docs/rule.md` §2) — narrative ภาษาไทยตามสไตล์ `docs/*` เดิม

## 2. Pattern การเขียนของ task นี้
- **markdown โครงเดียวกับ docs เดิม:** หัว `#` + blockquote บริบท + ตาราง/หัวข้อ `##`
- **ลิงก์ relative:** จาก `docs/example-walkthrough.md` → achieved = `stages/achieved/2026-06-07-cli-legacy-warning-fix/<file>`; → playbook = `../.warnyin/workflow/stages/<x>.md` **(หมายเหตุ: `.warnyin/` ที่ root เป็น dogfood gitignored — บน GitHub ใช้ลิงก์ source `src/.warnyin/workflow/stages/<x>.md` แทน เพื่อ resolve จริงใน repo)**
- **README:** ต่อ section ใหม่ ไม่รื้อโครงเดิม; ลิงก์ relative `docs/example-walkthrough.md`
- **disclaimer:** กล่อง blockquote ชัดบนสุด — snapshot date + pointer source

## 3. Shared component / utility (อย่าเขียนซ้ำ)
- เนื้อหา stage reuse achieved/ (ลิงก์ ไม่ copy) — เหมือน command ชี้ playbook
- ไม่สร้าง tooling/test ใหม่ — VERIFY ใช้ grep/dead-link manual + `npm test`/`verify:pack` เดิม

## 4. เพิ่มเติมเฉพาะ task
- **ลิงก์ playbook ต้องชี้ source ที่ commit จริง** — root `.warnyin/` gitignored (ไม่อยู่บน GitHub) → ใช้ `src/.warnyin/workflow/stages/<x>.md` ให้ resolve บน repo; ส่วน achieved อยู่ใต้ `docs/` (commit) ลิงก์ตรงได้
- ถ้า pattern "worked-example doc" ควรเป็นมาตรฐานกลาง → note ใน `rule.md` §2 (รอ SHIP)
