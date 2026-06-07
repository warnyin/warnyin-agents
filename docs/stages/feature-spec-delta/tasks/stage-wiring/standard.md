# Standard — stage-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน `.md` แก่นกลาง + adapter ที่ task นี้ต้องยึด
> **อิงจาก** `docs/rule.md` §1 (tool-agnostic / adapter บาง / unify-in-place) + precedent topic `learned-rule`

## 1. Standard กลางที่ยึด (จาก docs/rule.md)
- **single source of truth + canonical wording เดียว** — wording ของ Spec delta / กติกา merge นิยามครั้งเดียวที่ design §4 ของ topic นี้; ทุกไฟล์ที่แก้ **copy จาก §4 เท่านั้น ห้ามแต่งใหม่ต่อไฟล์** (กัน wording เพี้ยนข้าม 3 playbook + 3 command + 2 template)
- **unify-in-place ไม่สร้างกลไกขนาน** (`docs/rule.md` §1) — ทุกจุดเป็นการ **ขยาย principle/step/gate/section เดิม** ให้ของเก่ากลายเป็น subset; **ห้ามเพิ่มข้อใหม่/sub-step ใหม่** (โดยเฉพาะ ship §4 step 5.1 + verify §3 principle 1)
- **tool-agnostic + adapter บาง** (`docs/rule.md` §1) — mechanism เต็มอยู่ใน playbook กลาง (`src/.warnyin/workflow/stages/`); command `.claude/commands/warnyin/*` = **adapter บาง ชี้กลับ playbook ไม่ duplicate logic** (กติกา merge เต็มห้ามอยู่ใน command)
- **CHANGELOG ทุก user-facing change** (`docs/rule.md` §2) — payload เปลี่ยน → entry `[Unreleased]` ใน `CHANGELOG.md` (Keep a Changelog)
- **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้เฉพาะ `src/.warnyin/`, `src/.claude/`, `CHANGELOG.md`; **ห้ามแตะ root dogfood** (`.warnyin/`, `.claude/` ที่ root) + docs/ กลาง

## 2. Pattern การเขียนของ task นี้
- **โครงสร้าง/naming:** คงหมายเลข section/step/principle เดิมของแต่ละ playbook; แทรกข้อความใน list/ตาราง/gate ที่มีอยู่ — ไม่ renumber, ไม่สร้าง section ใหม่ (ยกเว้น template design.md ที่ design §3 สั่งให้ +section "9. Spec delta" ตรงตัว)
- **investigate-before-edit** (`docs/rule.md` §1) — ก่อนแก้แต่ละไฟล์ อ่าน section ปัจจุบันให้เห็นถ้อยคำเดิม + จุดต่อที่ถูก แล้วขยายตรงที่ design §3 ระบุ (ไม่ทับ logic เดิม)
- **ภาษา:** ไทยตามสไตล์ playbook เดิม; canonical key (`Spec delta`, `Requirement:`, `ADDED`/`MODIFIED`/`REMOVED`, `GIVEN`/`WHEN`/`THEN`, `[เดิมชื่อ:]`) เขียนตรงตัวให้ grep จับได้

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **canonical source:** `docs/stages/feature-spec-delta/design.md` §4.1–§4.4 + §3 — copy wording จากที่นี่ (อย่าเรียบเรียงใหม่)
- **template task path (จาก dependency `spec-template`):** `src/.warnyin/template/docs/features/[feature-name]/spec.md` — อ้างถึงใน wording merge "feature ใหม่ → สร้าง spec.md จาก template `[feature-name]/spec.md`" (ไฟล์นี้ task `spec-template` สร้าง — ห้ามแก้ในใบนี้)
- **precedent:** topic `learned-rule` (`docs/stages/achieved/2026-06-07-learned-rule/`) — pattern แก้ playbook+command+template ใบเดียว, sub-task ระบุ § ต่อไฟล์, command mirror บาง

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- consistency check ปิดงาน = 2 ชั้น: (1) **grep canonical key** ครบทุกไฟล์ที่แก้, (2) **semantic check** — เทียบกติกา merge ใน 3 playbook (design/verify/ship) ตรง design §4.3 **คำต่อคำ** (grep จับ key หาย แต่จับ wording ขัดกันไม่ได้ — ต้องอ่านเทียบเอง)
