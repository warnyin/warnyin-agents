# Rule — playbook-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก docs/rule.md §1/§2)
- [ ] **unify-in-place ไม่สร้างกลไกขนาน** (`docs/rule.md` §1) — ทุกจุด **ขยาย step/gate item/section เดิม** ให้ของเก่าเป็น subset; **ห้ามเพิ่มข้อ/sub-step/section ใหม่** — โดยเฉพาะ **design §8 = ต่อท้าย gate item เดิม "ทุก task มี 4 ไฟล์ครบ"** (ไม่เพิ่ม checkbox ใหม่) + **ship §4 = ขยาย step 1 เดิม** (ไม่เพิ่ม step) + **next §2 = แทรก step pre-scan + คงตาราง heuristic เดิมเป็น fallback**
- [ ] **tool-agnostic + adapter บาง** (`docs/rule.md` §1) — mechanism เต็ม (รายการเช็ค + exit code) อยู่ใน **script เดียว + playbook**; command ×3 = adapter บาง **ชี้กลับ playbook ไม่ duplicate รายการเช็ค** (mirror 1 บรรทัด/ไฟล์)
- [ ] **canonical-copy convention** (`docs/rule.md` §1 / CLAUDE.md single source of truth) — copy wording จาก **design §4.5 เท่านั้น ห้ามแต่งใหม่ต่อไฟล์**; wording 3 จุดต้องตรง spec §2.1/§2.2/§2.3 (design §4.5) คำต่อคำ + คำสั่งตรงรูป design §4.1
- [ ] **node-guard ทุกจุด wiring** (panel Infra-S1) — ทุก wiring ขึ้นต้น "ถ้ารัน node ได้" + fallback ของเดิม (next: ตาราง heuristic · design/ship: checklist เดิม) — gate ไม่ค้างบนเครื่องไม่มี node; **design §8 / ship step 1 = guidance ("ควรไม่มี ✖") ไม่ใช่ hard gate**
- [ ] **CHANGELOG ทุก user-facing change** (`docs/rule.md` §2) — entry `[Unreleased]` (payload + script ใหม่ + wiring 3 จุด)
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้เฉพาะ `src/.warnyin/` + `src/.claude/` + `CHANGELOG.md`; **ห้ามแตะ root dogfood** (`.warnyin/`, `.claude/` ที่ root) + `validate-topic.mjs` + test (ของ task `validator-script`) + `src/bin/cli.mjs` + `src/scripts/verify-pack.mjs` + docs/ กลาง + `stages/verify.md`/`build.md`
- [ ] **investigate-before-edit** (`docs/rule.md` §1) — อ่าน section ปัจจุบันของแต่ละไฟล์ก่อนแก้ (next §2 / design §8 / ship §4 step 1) + ยืนยันแก้ที่ `src/.warnyin/` + `src/.claude/` ไม่ใช่ root
- [ ] **ไม่ทำลายของเดิม** — `npm test` + `npm run lint:md` + `npm run verify:pack` เขียว (backward compatible: เครื่องไม่มี node → playbook คง fallback เดิม; ตาราง heuristic ใน next.md ไม่หาย)

## 2. เสนอเพิ่ม rule ใหม่ (รอ SHIP)
- **ไม่มี rule ใหม่** — task นี้เป็น **wiring ตาม convention เดิมล้วน** (unify-in-place + adapter บาง + canonical-copy + node-guard) ที่ `docs/rule.md` §1 มีครบแล้ว; ไม่เกิด rule generalize ใหม่จากใบนี้
  - หมายเหตุ: rule "spec/delta canonical wording ต้อง copy จาก design" ถูก promote ไปแล้วจาก topic `feature-spec-delta` (= `canonical-copy convention` ใน `docs/rule.md` §1) — ใบนี้ **ใช้** rule นั้น ไม่ใช่เสนอใหม่
  - learned-rule emergent (ถ้ามีตอน BUILD/VERIFY) → ค่อยจับตอน SHIP ตามกลไก `ship.md` §3-§6 (ไม่ pre-declare ที่นี่)
