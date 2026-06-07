# Task — add-example-walkthrough

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `add-example-walkthrough` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | เอกสาร repo (`docs/` + `README.md`) |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
ผู้ใช้ใหม่เปิด README → เจอ pointer → อ่าน `docs/example-walkthrough.md` ไล่ครบ 5 stage ของ `cli-legacy-warning-fix` → คลิกดู artifact จริงใน achieved/ — ส่งมอบ onboarding end-to-end (entry + content + ลิงก์ใช้ได้)

## 2. Dependency
- ต้องทำหลัง: — (task เดียว, docs-only coupled slice)
- ปลดล็อกให้: —

## 3. Sub-tasks
- [x] 1. อ่าน 13 ไฟล์ของ `docs/stages/achieved/2026-06-07-cli-legacy-warning-fix/` (discovery→ship + 1 task `fix-legacy-warning`) — _ผล:_ สรุป decision ต่อ stage (ไม่แต่งเอง — Discovery เป็น template เปล่าก็สะท้อนตามจริงว่า "ข้าม")
- [x] 2. เขียน `docs/example-walkthrough.md` — disclaimer + ตาราง 5 stage + narrative ราย stage (เน้น decision) + ลิงก์ artifact จริง + ปิดท้าย `/warnyin:discovery` _(ขึ้นกับ 1)_
- [x] 3. ลิงก์ playbook ใช้ `src/.warnyin/workflow/stages/<x>.md` (committed) — **ไม่ใช่** root `.warnyin/` (gitignored); ลิงก์ achieved ใช้ `stages/achieved/...` (relative จาก `docs/`)
- [x] 4. เพิ่ม section "ตัวอย่างจริง (worked example)" ใน `README.md` ชี้ `docs/example-walkthrough.md` (วางหลัง section คำสั่ง/เริ่มต้น ไม่รื้อของเดิม)
- [x] 5. self-verify: dead-link 0 (walkthrough 30 links + README 4 links resolve) + `npm test` 19/19 + `npm run verify:pack` 75 ไฟล์ เขียว (docs/ ไม่หลุดขึ้น payload)

## 4. ขอบเขตไฟล์ที่จะแตะ
- **สร้าง:** `docs/example-walkthrough.md`
- **แก้:** `README.md` (+1 section)
- **ห้ามแตะ:** `src/**`, playbook กลาง, `package.json` (`files`), achieved/ (read-only อ้างอิง), payload อื่น

## 5. Acceptance criteria
- [x] `docs/example-walkthrough.md` มีครบ 5 stage + 1 task + disclaimer + ลิงก์ artifact จริง
- [x] README มี section pointer (ไม่รื้อของเดิม — diff เพิ่ม 1 section หลัง "เริ่มใช้งาน")
- [x] **dead-link = 0** (achieved/ + playbook `src/.warnyin/` + README→walkthrough; verify 34 links resolve)
- [x] ไม่ duplicate ขั้นตอน playbook (ชี้กลับ 6 จุด, 0 gate-checkbox ลอก)
- [x] `npm test` (19/19) + `npm run verify:pack` (75 ไฟล์) เขียว (ไม่แตะ payload/code)
- [x] ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
