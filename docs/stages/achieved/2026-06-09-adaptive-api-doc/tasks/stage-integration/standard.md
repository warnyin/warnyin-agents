# Standard — stage-integration

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern ของ hook + adapter

## 1. Standard กลางที่ยึด (จาก techstack)
- pattern hook ที่มีอยู่: stage playbook ชี้ context profile / role / capability ด้วย **pointer บรรทัดเดียว** (เช่น `design.md` ชี้ `roles/sa.md`, `verify.md` §26 ชี้ `roles/security.md`) — เลียนแบบรูปแบบนี้
- **mirror layout `src/` = target** (`docs/techstack/installer/rule.md`) — แก้ที่ `src/.warnyin/` เท่านั้น

## 2. Pattern การเขียนของ task นี้
- **thin pointer:** แต่ละ hook เป็นประโยค/bullet สั้นที่ชี้ `.warnyin/workflow/api-doc.md` (+ เลข section) — **ไม่ copy logic** ของ detect/mode มา
- **★ canonical-copy:** wording ของ hook ที่ซ้ำหลายไฟล์ **คัดจาก `api-doc.md` (canonical) ห้ามแต่งใหม่ต่อไฟล์** (`docs/rule.md` §1 canonical-copy convention)
- **unify-in-place:** ขยายข้อ/section เดิม (design.md §6 "API task", verify fix loop, ship techstack promote) — **ไม่เพิ่มกลไกขนาน** (`docs/rule.md` §1)
- **gate conditional:** ทุก gate item ใหม่ต้องมีถ้อยคำ "ถ้าแตะ REST API" / "N/A" — backward compatible

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `api-doc.md` (task-1) = แหล่ง wording + เลข section ที่ pointer ชี้
- โครง gate/output table เดิมของแต่ละ stage — แทรกแถว/ข้อ ไม่ rewrite

## 4. เพิ่มเติมเฉพาะ task
- CHANGELOG ใช้รูปแบบ Keep a Changelog ใต้ `[Unreleased]` → `### Added` (ตาม entry เดิมในไฟล์)
