# Task — lean-build-verify

> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ · ชี้ canonical `design.md` §3D (ไม่ลอก)

| | |
|---|---|
| **Task** | `lean-build-verify` |
| **Slice อ้างอิง** | `design.md` slice #3 |
| **Component** | `installer` (playbook กลาง) |
| **Model tier** | `balanced` (ขยาย wording playbook ตาม canonical — ตรงไปตรงมา) |
| **สถานะ** | `build เสร็จ ✓ (เขียว)` |

## 1. เป้าหมายของ task (vertical slice)
ทำให้ **task self-verify = scope ตัวเอง** ชัดเจนใน BUILD playbook → agent ไม่รัน full cross-component build/test ซ้ำ (เลื่อนไป full-gate) → ลดเวลาต่อ agent

## 2. Dependency
- **ต้องทำหลัง:** — (wave 1; อ่าน `design.md` §3D เป็น input)
- **ปลดล็อกให้:** —
- **ส่ง output:** BUILD playbook ที่ verify-scope ชัด

## 3. Sub-tasks
- [x] 1. `build.md` §3 **ข้อ 4** (self-verify เดิม) — ขยายให้ชัด: **build/lint = scope component ตัวเอง** ไม่ใช่ทั้ง repo; cross-component → full-gate (§3 ข้อ 8 + §4 ข้อ 6 เดิม)
- [x] 2. `build.md` — ย้ำ **full-gate (§3 ข้อ 8 / §4 ข้อ 6) คงเป็น blocking gate** (กัน bar ลดเงียบ — panel QA-S4) — _ขึ้นกับ 1_
- [x] 3. `roles/developer.md` checklist — เพิ่มข้อ "test-flow ใน spec = task-scope self-verify; integration cover ที่ full-gate" (copy จาก design §3D)

## 4. ขอบเขตไฟล์ที่จะแตะ (★ disjoint)
- `src/.warnyin/workflow/stages/build.md`
- `src/.warnyin/workflow/roles/developer.md`
- ❌ **ห้ามแตะ** `.claude/commands/warnyin/build.md` (★ panel TL-B1 — เจ้าของคือ model-routing-docs), `design.md`, `build-wave.mjs`, `contexts/`

## 5. Acceptance criteria
- [x] build.md §3 ข้อ 4 ระบุ verify-scope = component ตัวเอง ชัด ตรง canonical §3D
- [x] full-gate (§3 ข้อ 8 / §4 ข้อ 6) ยังเป็น blocking — ไม่ถูกลดเป็น informational (ย้ำ "blocking gate — ห้ามลด bar" ทั้งสองจุด)
- [x] developer.md checklist สอดคล้อง (copy จาก design §3D)
- [x] unify-in-place — ขยายข้อ 4 เดิม ไม่เพิ่มหลักการขนาน
- [x] ผ่าน test ตาม `spec.md` · ทำตาม `rule.md` + `standard.md` (validate-topic ✓ · lint:md ✓ 103 ไฟล์ · node --test 53/53 ✓ · ownership guard: ไม่มี diff ใน command/build.md ✓)

## 6. อ้างอิง
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical: `../../design.md` §3D, §2 (★ ห้ามแตะ command)
