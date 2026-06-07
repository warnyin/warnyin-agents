# Task — add-defensive-rules

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `add-defensive-rules` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | workflow core (payload `.md`) |
| **สถานะ** | `build เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
ทำให้ **2 defensive rule บังคับใช้ครบทุก enforce point** — R1 investigate-before-edit + R2 config-protection ปรากฏใน BUILD/VERIFY playbook §3 + checklist ของ developer.md/qa.md ด้วย wording สม่ำเสมอ (canonical) + note global bullet รอ SHIP

## 2. Dependency
- ต้องทำหลัง: — (task เดียว ไม่มี dependency)
- ปลดล็อกให้: —

## 3. Sub-tasks
- [x] 1. `stages/build.md` §3 — เพิ่ม 2 operating principle (R1 + R2 ฉบับเต็ม จาก spec §2)
- [x] 2. `stages/verify.md` §3 — เพิ่ม 2 operating principle (R2 โยง fix loop ข้อ 5)
- [x] 3. `roles/developer.md` — เพิ่ม 2 checklist line (เวอร์ชันสั้น dev)
- [x] 4. `roles/qa.md` — เพิ่ม 2 checklist line (เวอร์ชันสั้น qa)
- [x] 5. ตรวจ wording 4 จุดสอดคล้อง canonical (ไม่ขัด) — global bullet note ใน `rule.md` §2 แล้ว
- [x] 6. `npm test` + `npm run verify:pack`

## 4. ขอบเขตไฟล์ที่จะแตะ
- แก้: `src/.warnyin/workflow/stages/{build,verify}.md` + `src/.warnyin/workflow/roles/{developer,qa}.md`
- **ห้ามแตะ:** `docs/rule.md` (central — รอ SHIP), `cli.mjs`/installer, root dogfood, Gate checklist (D4)

## 5. Acceptance criteria
- [x] R1 + R2 ปรากฏใน build.md §3 + verify.md §3 (ฉบับเต็ม)
- [x] developer.md + qa.md มี checklist line ใหม่ (เวอร์ชันสั้น)
- [x] wording สอดคล้อง canonical design §2 ทุกจุด
- [x] global bullet note ใน rule.md §2 (รอ SHIP)
- [x] `npm test` 18/18 + `verify:pack` เขียว
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
