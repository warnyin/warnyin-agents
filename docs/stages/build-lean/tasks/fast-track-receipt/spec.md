# Spec — fast-track-receipt

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — ใส่เฉพาะหัวข้อที่เกี่ยวข้อง

## 1. ชนิดของ task

`docs/config` (playbook + template markdown) + `test` (assertion ใหม่ใน installer.test)

## 2. Data-flow

- design `§4.1` (canonical wording) → copy คำต่อคำ → `triage.md` section Fast-track skip-list
- design `§3` (receipt schema) → `src/.warnyin/template/stages/receipt.md` → installer copy ไป target `.warnyin/template/stages/receipt.md` (mirror layout — ไม่ต้องแก้ `cli.mjs`, `copyTree` recursive ครอบอยู่แล้ว)
- `stages/design.md` fast path + command adapter → ชี้กลับ `triage.md` skip-list ด้วย pointer (ไม่ inline)

## 3. Test-flow

รันจาก repo root:

- [ ] **installer test เขียว:** `node --test` (bare — auto-discover ตาม `docs/rule.md §5` ห้ามใส่ path arg) → เคส installer เดิมทั้งหมด + assertion ใหม่ `.warnyin/template/stages/receipt.md` ผ่าน; pass count ไม่ต่ำกว่า MIN_PASS=9
- [ ] **skip-list ตรง design คำต่อคำ:** grep แถวเด่นของตารางใหม่ใน `src/.warnyin/workflow/triage.md` เช่น `pre-flight: สร้าง` + `code-first — main loop แก้โค้ดเอง` + `สแกน diff เทียบ hard-floor 5 หมวด` → เจอครบ และ diff เทียบ design `§4.1` = ตรงทุก row
- [ ] **route §2A:** grep `"design fast-track (pre-flight สร้าง receipt) → code-first → verify-lite → ship-lite"` เจอใน row fast
- [ ] **caps §2D:** grep `§2D` / heading caps ใน `triage.md` → มี `≤ 40 บรรทัด`, `≤ 60`, `≤ 120` และเป็น section/anchor แยกจาก skip-list
- [ ] **§2C pointer:** บรรทัด why ใต้ตาราง §2C มี md link `loop-tuning.md`; grep `build.md §4 ข้อ 6` ใน `triage.md` → ต้องไม่เจอแล้ว
- [ ] **negative — ตาราง default ไม่รั่ว:** grep แถวตาราง §2C (เช่น `สั้น — แก้ทีละ finding`) → เจอเฉพาะ `triage.md` ไฟล์เดียว ไม่โผล่ `stages/design.md` / `receipt.md` / ไฟล์อื่นใน `src/`
- [ ] **UX detect precedence:** ใน `src/.warnyin/workflow/stages/design.md` — exclusion (docs-only/config-only/tooling) อยู่**ก่อน** signals + มีข้อความระดับ "เจอ exclusion → จบทันที ไม่ประเมิน signals"; Gate §8 ข้อ wireframe ยัง conditional/N-A
- [ ] **template cap:** `wc -l src/.warnyin/template/stages/receipt.md` ≤ 40 และ path อยู่นอก `[topic]/`
- [ ] **scope:** `git status` — ไฟล์ที่เปลี่ยนอยู่ใต้ `src/**` เท่านั้น (5 ไฟล์ตาม task.md §4)

**หมายเหตุ lint:md:** pointer `loop-tuning.md` ใน §2C จะ dead-link จนกว่า task `loop-tuning-extract` (wave เดียวกัน) merge — `lint:md` เป็น gate ระดับ **integration หลัง merge ทั้ง wave**; lint แดงจาก pointer นี้ **ไม่ใช่ failure ของ task นี้**

## 4. Edge case

- installer.test assertion ต้องเป็น **target-side path** (`.warnyin/template/stages/receipt.md`) ไม่ใช่ `src/.warnyin/...`
- ห้ามแก้ assertion เคสเดิม (1-17, a-d, isEntrypoint) — เพิ่มอย่างเดียว
