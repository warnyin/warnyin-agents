# Task — wire-playbooks

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้

| | |
|---|---|
| **Task** | `wire-playbooks` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (payload `.md` แก่นกลาง) |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
ทำให้ **playbook นำทางสู่ posture ที่ถูก** — แทรก callout `Context profile` ใน 5 stage playbook ชี้ context ที่เข้าคู่ + เพิ่ม `contexts/` ใน structure tree ของ workflow README → เปิด stage ไหนก็รู้ว่าต้องสวมโหมดอะไร

## 2. Dependency
- ต้องทำหลัง: `tasks/author-contexts` (callout ชี้ไฟล์ `contexts/<name>.md` ที่ task นั้นสร้าง — กันลิงก์ตาย)
- ปลดล็อกให้: — (slice สุดท้าย)
- รับ input จาก author-contexts: ชื่อ 3 context + mapping context↔stage (design.md §4)

## 3. Sub-tasks
- [ ] 1. แทรก callout ใน `discovery.md` → `research` — _ใต้ blockquote title_
- [ ] 2. แทรก callout ใน `design.md` → `research` + `build` (1 บรรทัดกล่าว 2 ตัว)
- [ ] 3. แทรก callout ใน `build.md` → `build`
- [ ] 4. แทรก callout ใน `verify.md` → `review`
- [ ] 5. แทรก callout ใน `ship.md` → `review`
- [ ] 6. เพิ่มบรรทัด `contexts/` ใน structure tree `workflow/README.md` (ข้าง `roles/`)
- [ ] 7. `npm test` + ตรวจไม่มีลิงก์ตาย (ทุก callout ชี้ไฟล์ที่มีจริง)

## 4. ขอบเขตไฟล์ที่จะแตะ
- แก้: `src/.warnyin/workflow/stages/{discovery,design,build,verify,ship}.md` (เพิ่ม 1 callout/ไฟล์)
- แก้: `src/.warnyin/workflow/README.md` (1 บรรทัดใน tree)
- **ห้ามแตะ:** `contexts/*` (งานของ author-contexts), `cli.mjs`/`package.json`, root dogfood, outer-layout ของ README

## 5. Acceptance criteria
- [ ] 5 playbook มี callout ครบ ชี้ context ตรง mapping (design.md §4); `design.md` ชี้ 2 ตัว
- [ ] `workflow/README.md` tree มี `contexts/`
- [ ] ไม่มีลิงก์ตาย — ทุก `contexts/<name>.md` ที่อ้างมีจริง
- [ ] `npm test` เขียว (18/18)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
