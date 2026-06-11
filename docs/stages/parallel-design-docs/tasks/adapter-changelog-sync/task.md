# Task — adapter-changelog-sync

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `adapter-changelog-sync` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (Claude adapter `src/.claude/` + CHANGELOG) |
| **Model tier** | `cheap` _(sync pointer + changelog entry — mechanical, อ้าง behavior contract ที่ fix แล้ว)_ |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
sync 2 ไฟล์ peripheral ให้สะท้อนพฤติกรรมใหม่ตาม behavior contract `design.md §3`:
1. adapter `src/.claude/commands/warnyin/design.md` — ปรับ wording ให้ task-file fan-out เป็น **default สำหรับ standard/large** (เดิม line 21 = "สามารถ...ได้" optional)
2. `CHANGELOG.md` — เพิ่ม entry (user-facing behavior change ของ DESIGN stage) ให้ผู้ใช้ npm migrate ได้โดยไม่เดา

**end-to-end:** ผู้ใช้ที่อ่าน command/changelog เห็นพฤติกรรมใหม่ตรงกับ playbook

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: ไม่มี (wave 1 — **ขนานกับ T1** ผ่าน contract-first)
- ปลดล็อกให้: ไม่มี
- **decouple จาก T1:** อ้าง **behavior contract `design.md §3`** (พฤติกรรม) + อ้าง playbook ระดับ **"§4"** (ไม่ผูกเลข step ตายตัวที่ T1 อาจขยับ) → ไม่ต้องรอ text จริงของ T1; พิกัด/ความสอดคล้องพิสูจน์ที่ full-gate (lint-md + VERIFY)

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
- [ ] 1. **adapter** — `src/.claude/commands/warnyin/design.md` ข้อ 5: ปรับจาก "สามารถใช้ sub-agent fan-out...ได้" → ระบุว่า standard/large เป็น **default** fan-out หนึ่ง agent ต่อ task (หลังผ่าน Gate), fast=1 task ไม่ fan-out; ชี้ playbook "§4" ไม่ inline รายละเอียด (adapter บาง) _ผลลัพธ์:_ adapter ตรง contract
- [ ] 2. **CHANGELOG** — เพิ่ม entry ใต้ Unreleased/เวอร์ชันถัดไป (Keep a Changelog): "DESIGN stage — parallelize grounding + task-file fan-out (default standard/large) + narrative single-writer guardrail; backward-compatible (fallback ทุกจุด)"

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **แก้:** `src/.claude/commands/warnyin/design.md`, `CHANGELOG.md`
- **ไม่แตะ:** playbook `stages/design.md` (= T1), template, script

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] adapter สะท้อน task-fanout-default (standard/large) ตรง behavior contract `design.md §3` C2 — ยังเป็น adapter บาง (ชี้ playbook ไม่ duplicate รายละเอียด)
- [ ] CHANGELOG มี entry user-facing ตาม Keep a Changelog (rule.md §2)
- [ ] adapter ไม่อ้างเลข step ที่ T1 อาจขยับ (อ้างระดับ "§4" / ชื่อขั้น) — กัน dead-ref
- [ ] ไม่มีชื่อรุ่น/ผลิตภัณฑ์ (vocab generic)
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
