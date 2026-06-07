# Rule — stage-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก docs/rule.md §1/§2)
- [ ] **unify-in-place ไม่สร้างกลไกขนาน** (`docs/rule.md` §1) — ทุกจุด **ขยาย principle/step/gate/section เดิม** ให้ของเก่าเป็น subset; **ห้ามเพิ่มข้อ/sub-step ใหม่** — โดยเฉพาะ **ship §4 step 5.1 (ขยายของเดิม ไม่เพิ่ม sub-step)** + **verify §3 (ขยาย principle 1 เดิม ไม่เพิ่ม principle)** (จุดบังคับจาก panel B2)
- [ ] **tool-agnostic + adapter บาง** (`docs/rule.md` §1) — mechanism เต็มอยู่ playbook กลาง; command ×3 = adapter บาง **ชี้กลับ playbook ไม่ duplicate logic**
- [ ] **canonical wording เดียว** (CLAUDE.md / `docs/rule.md` §1 single source of truth) — copy จาก design §4.2–§4.4 **เท่านั้น ห้ามแต่งใหม่ต่อไฟล์**; กติกา merge ต้องครบ: read-modify-verify + key ไม่เจอ → STOP + rename `[เดิมชื่อ:]` + stale delta re-check + union baseline (panel B4)
- [ ] **CHANGELOG ทุก user-facing change** (`docs/rule.md` §2) — entry `[Unreleased]` (payload change)
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้เฉพาะ `src/.warnyin/` + `src/.claude/` + `CHANGELOG.md`; **ห้ามแตะ root dogfood** (`.warnyin/`, `.claude/` ที่ root) + `src/bin/cli.mjs` + `src/tests/` + docs/ กลาง + template feature `spec.md` (ของ task `spec-template`)
- [ ] **investigate-before-edit** (`docs/rule.md` §1) — อ่าน section ปัจจุบันของแต่ละไฟล์ก่อนแก้ + ยืนยันแก้ template ที่ `src/.warnyin/template/` ไม่ใช่ root
- [ ] **ไม่ทำลายของเดิม** — `npm test` (19) + `npm run lint:md` + `npm run verify:pack` เขียว (backward compatible: feature ไม่มี spec → วิธีเดิม; topic ไม่มี §9 delta → SHIP ทำแบบเดิม)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP — promote เข้า `docs/rule.md` §1)
- [ ] rule ที่เสนอ: **spec/delta canonical wording ต้อง copy จาก design** —
  - wording ของ spec format + Spec delta + กติกา merge ต้อง **copy จาก design ของ topic ที่นิยาม (design §4) ไม่แต่งใหม่ต่อไฟล์** เมื่อ wiring ลงหลาย playbook/command/template
  - **evidence:** `design.md` §4 (canonical "ทุก task copy จากที่นี่ ห้ามแต่งใหม่") + Design review B2 (พิกัด §3 normalize กัน task แก้ผิดที่/สร้างกลไกขนาน)
  - **scope:** `project` (`docs/rule.md` §1 — คู่ "tool-agnostic / single source of truth"; ป้องกัน wording drift ข้ามไฟล์ payload ทุก topic ที่ wiring หลายจุด)
