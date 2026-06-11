# Task — playbook-wiring

> ชี้ canonical `design.md` §3C/§4 (ไม่ลอก rubric — เขียน pointer)

| | |
|---|---|
| **Task** | `playbook-wiring` |
| **Slice อ้างอิง** | `design.md` slice #3 |
| **Component** | `installer` (playbook กลาง) |
| **Model tier** | `balanced` (reframe §7 + hook 2 stage + register — ระวัง regression ตาราง/wording) |
| **สถานะ** | `build เสร็จ — เขียว (own-file)` |

## 1. เป้าหมายของ task (vertical slice)
เชื่อม triage เข้า lifecycle: reframe `design.md §7` (2-level → 3-tier ชี้ skip-list canonical) + เพิ่ม **fast-track hook** ใน `verify.md` + `ship.md` + register capability ใน workflow `README.md` — ทำให้ fast-track ครบ 4 stage (panel SA-B1)

## 2. Dependency
- **ต้องทำหลัง:** — (wave 1; อ่าน `design.md` §3C/§4 เป็น input — contract = "มีไฟล์ triage.md ถือ skip-list" ตกลงใน design แล้ว)
- **ปลดล็อกให้:** —
- **ส่ง output:** playbook 4 stage + README รู้จัก triage/3-tier/fast-track

## 3. Sub-tasks
- [x] 1. `stages/design.md §7` "ปรับความละเอียดตามขนาด change" — reframe **2-level → 3-tier (fast/standard/large)**: ระบุ fast = ชี้ **markdown-link** ไป `[fast-track skip-list](../triage.md#fast-track-skip-list)` ; large = บังคับ Discovery — **ไม่ inline ตาราง skip-list** (pointer เท่านั้น, design §4)
- [x] 2. `stages/verify.md` — เพิ่ม **pointer hook สั้น** (ใต้ §1): "ถ้า topic เป็น tier `fast` → verify-lite ตาม `[fast-track skip-list](../triage.md#fast-track-skip-list)` — functional + test เขียว, ข้าม empirical/panel ที่ไม่เกี่ยว; correctness floor (test เขียว) คงไว้"
- [x] 3. `stages/ship.md` — เพิ่ม **pointer hook สั้น** (ใต้ §1): "tier `fast` → ship-lite ตาม `[fast-track skip-list](../triage.md#fast-track-skip-list)` — promote เฉพาะที่มี (อาจไม่มี learned-rule), archive ครบ"
- [x] 4. `workflow/README.md` — เพิ่มบรรทัดใน tree comment (ใต้ `next.md`): `triage.md  #  capability: TRIAGE — ประเมินขนาด change → tier + route (read-only)`

## 4. ขอบเขตไฟล์ที่จะแตะ (★ disjoint)
- `src/.warnyin/workflow/stages/design.md`, `src/.warnyin/workflow/stages/verify.md`, `src/.warnyin/workflow/stages/ship.md`, `src/.warnyin/workflow/README.md`
- ❌ **ห้ามแตะ** `triage.md` (T1), `command/`, `installer/templates/CLAUDE.md` (T2), `stages/build.md`/`discovery.md` (ไม่อยู่ scope — fast-track BUILD = ผ่าน model tier/1-task ที่ DESIGN ตั้ง ไม่ต้อง hook build.md)

## 5. Acceptance criteria
- [x] `design.md §7` เป็น 3-tier + markdown-link ไป skip-list (ไม่ inline ตาราง)
- [x] `verify.md` + `ship.md` มี fast-track pointer hook (markdown-link resolve หลัง T1 merge) — fast-track ครบ 4 stage (DESIGN §7 + BUILD via tier + VERIFY/SHIP hook)
- [x] hook ไม่ทำ gate มาตรฐานของ standard/large หลวม (correctness floor ระบุชัดในทุก hook — panel QA-S5)
- [x] `README.md` มี triage ใน capability tree
- [x] **unify-in-place** — ขยาย §7 เดิม/แทรก pointer ใต้ §1 ของ verify/ship ไม่สร้าง section ขนาน; ไม่ duplicate rubric (grep ยืนยัน 0 inline skip-list table)
- [x] ผ่าน test ตาม `spec.md` (own-file: §7 reframe + 2 hook + README + correctness floor + unify; cross-file dead-link→triage.md = full-gate หลัง T1 merge) · ทำตาม `rule.md` + `standard.md` · `node --test` 58/58 เขียว

## 6. อ้างอิง
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical: `../../design.md` §3C (skip-list), §4 (pointer = markdown link), §2 (ownership), §9 (§7 behavior change note)
