# Task — add-model-tier

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `add-model-tier` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | workflow core payload (`src/.warnyin/workflow/contexts/`) |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
guidance model-tier ครบ — 3 context มี Model tier ใน Tool preference (generic) + README legend → harness/ผู้ใช้รู้ว่า posture ไหนใช้ tier ไหน (คุม token/cost) portable

## 2. Dependency
- ต้องทำหลัง: — (task เดียว, payload `.md` coupled)
- ปลดล็อกให้: —

## 3. Sub-tasks
- [ ] 1. `contexts/research.md` → Tool preference: +Model tier = `deepest reasoning`
- [ ] 2. `contexts/build.md` → Tool preference: +Model tier = `balanced` + worker note (→`cheap`)
- [ ] 3. `contexts/review.md` → Tool preference: +Model tier = `balanced+` (ไม่ลด)
- [ ] 4. `contexts/README.md` → item 3 mention model-tier + section legend (ตาราง context↔tier + note tool-agnostic)
- [ ] 5. self-verify: grep ไม่เจอชื่อรุ่น · `lint:md`/`npm test`/`verify:pack` เขียว · (ถ้าได้) `setup:sandbox` ตรวจ target

## 4. ขอบเขตไฟล์ที่จะแตะ
- **แก้:** `src/.warnyin/workflow/contexts/{research,build,review,README}.md`
- **ห้ามแตะ:** 5 stage playbook, installer/test, root dogfood, `docs/rule.md` central (รอ SHIP), payload อื่น

## 5. Acceptance criteria
- [ ] 3 context มี Model tier (generic vocab) ใน Tool preference
- [ ] README legend + item 3 อัปเดต
- [ ] grep payload contexts ไม่เจอ Opus/Sonnet/Haiku/claude- (tool-agnostic)
- [ ] ไม่ duplicate (ชี้กลับ posture); โครง card ยัง 4-section
- [ ] `lint:md` 0 dead + `npm test` + `verify:pack` เขียว
- [ ] ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
