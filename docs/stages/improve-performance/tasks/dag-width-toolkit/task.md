# Task — dag-width-toolkit

> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ · ชี้ canonical `design.md` §3 (ไม่ลอก)

| | |
|---|---|
| **Task** | `dag-width-toolkit` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (playbook กลาง) |
| **Model tier** | `deepest` (แก้ playbook แกน + reconcile philosophy = งานคิดหนัก) |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
ฝัง **DAG-width toolkit + critical-path gate + task-lean** ลง DESIGN playbook → DESIGN แตก DAG กว้างได้เอง (end-to-end: หลักการ + checklist + template + gate)

## 2. Dependency
- **ต้องทำหลัง:** — (wave 1, ไม่มี dependency; อ่าน `design.md` §3A/§3B/§3E เป็น input)
- **ปลดล็อกให้:** —
- **ส่ง output:** DESIGN playbook ที่มี toolkit — empirical proof (VERIFY) จะใช้ตอน redesign scaffold

## 3. Sub-tasks
- [ ] 1. `design.md` §3 — เพิ่มหลักการ **toolkit ลด serialization (3A)** + **task-lean (3E)** แบบ unify-in-place (ขยายหลักการ vertical-slice/แตก task เดิม — คงนิยาม slice เดิม, toolkit เป็น optional)
- [ ] 2. **critical-path gate (3B)** — _ขึ้นกับ 1:_ ★ playbook `design.md` **ไม่มี §7 dependency** (§7=ปรับความละเอียดตามขนาด) → ลงที่ **Gate §8** (เพิ่ม checklist item) + **§4 step 7** (แตก tasks: เพิ่มขั้นวาด DAG/วัด depth) + **§3 ข้อ 3** (dependency principle); ส่วนฟอร์ม DAG+depth อยู่ใน sub-task 4 (template §7)
- [ ] 3. `roles/tech-lead.md` checklist — ขยายข้อเดิม "parallel ได้จริง" + "spec ครบในตัว" → เพิ่ม DAG-not-too-deep + task กระชับ (3B/3E) — copy wording จาก design §3
- [ ] 4. `template/stages/[topic]/design.md` §7 — เพิ่มช่องระบุ critical-path depth + max wave width ในฟอร์ม dependency

## 4. ขอบเขตไฟล์ที่จะแตะ (★ disjoint — ห้ามแตะนอกนี้)
- `src/.warnyin/workflow/stages/design.md`
- `src/.warnyin/workflow/roles/tech-lead.md`
- `src/.warnyin/template/stages/[topic]/design.md`
- ❌ **ห้ามแตะ** `build.md`, `build-wave.mjs`, `contexts/`, `command/`, `template/.../task.md` (เจ้าของ task อื่น)

## 5. Acceptance criteria
- [ ] toolkit 3A (3 เทคนิค) + 3B (critical-path gate) + 3E (task-lean) อยู่ใน design.md ครบ ตรง canonical §3
- [ ] unify-in-place — ขยายหลักการ/gate เดิม ไม่เพิ่มกลไกขนาน (rule `unify-in-place`)
- [ ] tech-lead.md + template/design.md สอดคล้อง (wording copy จาก design §3 — `canonical-copy`)
- [ ] ผ่าน test ตาม `spec.md` (lint-md + validate-topic)
- [ ] ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิง
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical: `../../design.md` §3A/§3B/§3E, §2 (ownership), §10 (panel)
