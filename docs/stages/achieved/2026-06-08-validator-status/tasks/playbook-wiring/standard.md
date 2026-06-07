# Standard — playbook-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน `.md` แก่นกลาง + adapter ที่ task นี้ต้องยึด
> **อิงจาก** `docs/rule.md` §1 (tool-agnostic / adapter บาง / unify-in-place / canonical-copy) + precedent topic `feature-spec-delta` (task `stage-wiring`)

## 1. Standard กลางที่ยึด (จาก docs/rule.md)
- **single source of truth + canonical-copy** (`docs/rule.md` §1) — wording ของ wiring นิยามครั้งเดียวที่ design §4.5 ของ topic นี้; ทุกไฟล์ playbook ที่แก้ **copy จาก §4.5 เท่านั้น ห้ามแต่งใหม่ต่อไฟล์** (กัน wording เพี้ยนข้าม 3 playbook); คำสั่ง `node .warnyin/workflow/scripts/validate-topic.mjs [slug]` ต้องตรงรูป design §4.1
- **unify-in-place ไม่สร้างกลไกขนาน** (`docs/rule.md` §1) — ทุกจุดเป็นการ **ขยาย step/gate item/section เดิม** ให้ของเก่ากลายเป็น subset; **ห้ามเพิ่มข้อใหม่/sub-step ใหม่/section ใหม่** — โดยเฉพาะ design §8 = ต่อท้าย gate item เดิม (ไม่เพิ่ม item ใหม่) + ship §4 = ขยาย step 1 เดิม (ไม่เพิ่ม step) + next §2 = แทรก step pre-scan + คงตาราง heuristic เดิม
- **tool-agnostic + adapter บาง** (`docs/rule.md` §1) — mechanism เต็ม (รายการเช็ค C1–C5 + exit code) อยู่ใน **script เดียว** + playbook; command `.claude/commands/warnyin/*` = **adapter บาง ชี้กลับ playbook ไม่ duplicate** รายการเช็ค (mirror 1 บรรทัด/ไฟล์)
- **payload-guidance ต้อง generic** (`docs/rule.md` §1) — wording wiring เป็น **guidance** ("ถ้ารัน node ได้" / "ควรไม่มี ✖") ไม่ผูกชื่อ harness/รุ่น model; node เป็น runtime กลางของ payload (ไม่ใช่ harness-specific) — อ้างได้
- **CHANGELOG ทุก user-facing change** (`docs/rule.md` §2) — payload เปลี่ยน (script ใหม่ + wiring) → entry `[Unreleased]` ใน `CHANGELOG.md` (Keep a Changelog)
- **source/dogfood แยกชั้น** (`docs/rule.md` §6 / CLAUDE.md "พัฒนา repo นี้") — แก้เฉพาะ `src/.warnyin/`, `src/.claude/`, `CHANGELOG.md`; **ห้ามแตะ root dogfood** (`.warnyin/`, `.claude/` ที่ root) + docs/ กลาง

## 2. Pattern การเขียนของ task นี้
- **โครงสร้าง/naming:** คงหมายเลข section/step/gate item เดิมของแต่ละ playbook; แทรกข้อความใน list/gate ที่มีอยู่ — **ไม่ renumber, ไม่สร้าง section/step/item ใหม่**
  - **next.md:** step pre-scan แทรกเป็น **ข้อแรกของ §2 "วิธีหาสถานะ"** (ก่อนข้อ "หา topic ที่ active") — หรือเป็น step 0 — โดยตาราง heuristic ในข้อ 3 เดิม **คงไว้ครบ** เป็น fallback path
  - **design.md §8:** ต่อท้าย gate item เดิม `- [ ] ทุก task มี spec.md + standard.md + rule.md + task.md ครบ` ด้วย wording §2.2 (วงเล็บต่อท้ายในข้อเดิม — ไม่เพิ่ม checkbox ใหม่)
  - **ship.md §4 step 1:** ต่อท้าย step 1 เดิม (ลงท้ายด้วยการเช็ค VERIFY ผ่าน) ด้วย wording §2.3 (ต่อในย่อหน้า/ข้อเดิม — ไม่เพิ่ม step 1.x)
- **investigate-before-edit** (`docs/rule.md` §1) — ก่อนแก้แต่ละไฟล์ **อ่าน section ปัจจุบันให้เห็นถ้อยคำเดิม + จุดต่อที่ถูก** แล้วขยายตรงที่ design §3 ระบุ (ไม่ทับ logic เดิม); ยืนยันแก้ที่ `src/.warnyin/` + `src/.claude/` ไม่ใช่ root
- **node-guard เป็นเงื่อนไขนำทุกจุด** (panel Infra-S1) — ทุก wiring ขึ้นต้นด้วยเงื่อนไข "ถ้ารัน node ได้" เสมอ; กรณีรันไม่ได้ → fallback ของเดิม (next: ตาราง heuristic · design/ship: checklist/อ่านเองตามเดิม) — gate ห้ามค้างบนเครื่องไม่มี node
- **guidance ไม่ใช่ hard gate** (panel Infra-S1) — design §8 / ship step 1 ใช้คำว่า "ควรไม่มี ✖" / "ควรแก้ก่อน promote" (ไม่ใช่ "ต้อง") — structural pre-check ประกอบการตัดสิน ไม่ block อัตโนมัติ
- **ภาษา:** ไทยตามสไตล์ playbook เดิม; canonical key (`validate-topic.mjs`, `✖`, `⚠`, `ถ้ารัน node ได้`, `status`/`<slug>`) เขียนตรงตัวให้ grep จับได้

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **canonical source:** `docs/stages/validator-status/design.md` §4.5 (wording wiring) + §4.1 (CLI contract — คำสั่ง/exit code) + §3 (ตารางไฟล์แก้) + §9 scenario "wiring ครบ" (3 ไฟล์) — **copy wording จากที่นี่ (อย่าเรียบเรียงใหม่)**
- **script ที่ wiring อ้าง (จาก dependency `validator-script`):** `src/.warnyin/workflow/scripts/validate-topic.mjs` — อ้างถึงในคำสั่ง wiring เท่านั้น (ไฟล์นี้ task `validator-script` สร้าง — **ห้ามแก้ในใบนี้**)
- **precedent:** topic `feature-spec-delta` task `stage-wiring` (`docs/stages/achieved/2026-06-07-feature-spec-delta/tasks/stage-wiring/`) — pattern แก้ playbook+command+CHANGELOG, sub-task ระบุ § ต่อไฟล์, command mirror บาง 1 บรรทัด, consistency check 2 ชั้น (grep key + semantic เทียบ canonical คำต่อคำ)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- **consistency check ปิดงาน = 2 ชั้น:** (1) **grep `validate-topic.mjs`** พบครบ 3 playbook (`next.md` + `stages/design.md` + `stages/ship.md`) — ตรง design §9 scenario, (2) **semantic check** — เทียบ wording 3 จุดตรง §2.1/§2.2/§2.3 (design §4.5) **คำต่อคำ** + ยืนยัน node-guard "ถ้ารัน node ได้" ครบทุกจุด + ตาราง heuristic ใน next.md ไม่ถูกลบ (fallback ยังอยู่)
- **dependency ordering:** task นี้ **wave 2** — ต้องรันหลัง `validator-script` สร้าง script เสร็จ; ถ้ารัน wiring ก่อน script มี → คำสั่งใน playbook จะชี้ไฟล์ที่ยังไม่มี (แต่เป็น `.md` ไม่ break test/lint — ตรวจ dependency ใน BUILD orchestration ตามปกติ)
