# Task — embed-minimalism-principle

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `embed-minimalism-principle` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (payload `src/.warnyin/workflow/`) |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
> ส่งมอบ: minimalism principle "live" ใน workflow — มีไฟล์แกน + reachable จากทุก surface (ผลิต+ตรวจ) + registered + shipped + dogfood ตรง + gate เขียวครบ จบ end-to-end ในตัว

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: — (ไม่มี — เป็น task เดียวของ topic)
- ปลดล็อกให้: — (single node, depth 1 / width 1)
- เหตุผล single node: เนื้อหาแกน + pointer ต้องเขียน coherent โดย single-writer (อ้าง heading จริงในไฟล์แกน) — ดู `design.md §7`

## 3. Sub-tasks (ลำดับการทำ — เขียนแกนก่อน แล้วเดิน pointer แล้ว gate)
- [ ] 1. เขียนไฟล์แกน `src/.warnyin/workflow/minimalism.md` — _ผลลัพธ์:_ guardrail box (ก่อน) + hierarchy 6 ขั้น + before/after 1 เคส + ขอบเขตกัน over-cut · token-lean · generic vocab
- [ ] 2. เติม pointer ฝั่งผลิต — _ขึ้นกับ 1:_ `roles/developer.md` (Lens/Checklist) + `contexts/build.md` (Mindset/Do) + `stages/build.md` §3 (operating principle บรรทัดสั้น) → `../minimalism.md`
- [ ] 3. เติม pointer ฝั่งตรวจ — _ขึ้นกับ 1:_ `contexts/review.md` (over-engineering lens) + `stages/verify.md` §3 (operating principle บรรทัดสั้น, **ไม่แตะ §6 gate**) → `../minimalism.md`
- [ ] 4. register ใน `workflow/README.md` — _ขึ้นกับ 1:_ เพิ่ม `minimalism.md` ในตารางโครงสร้าง + 1 บรรทัดอธิบาย
- [ ] 5. CHANGELOG entry — เพิ่มใน `CHANGELOG.md` (payload เปลี่ยน)
- [ ] 6. mirror + gate — `npm run setup:dogfood` แล้วรัน `lint:md` / `verify:pack` / `npm test` / `validate-topic ponytail-minimalism` / tool-agnostic grep → เขียวครบ

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **สร้างใหม่:** `src/.warnyin/workflow/minimalism.md`
- **แก้ (เติม pointer เท่านั้น):** `src/.warnyin/workflow/roles/developer.md`, `src/.warnyin/workflow/contexts/build.md`, `src/.warnyin/workflow/contexts/review.md`, `src/.warnyin/workflow/stages/build.md`, `src/.warnyin/workflow/stages/verify.md`, `src/.warnyin/workflow/README.md`
- **แก้:** `CHANGELOG.md`
- **mirror (auto จาก setup:dogfood — ไม่แก้มือ):** `.warnyin/workflow/...` ที่ root
- **ห้ามแตะ:** `docs/rule.md`, `docs/features/*` (รอ SHIP), command/skill/script logic, contexts ตัวที่ 4

## 5. Acceptance criteria
- [ ] ครบทุกข้อใน `spec.md §7` (ไฟล์แกน + pointer 6 จุด + gate + edge)
- [ ] minimalism.md token-lean + tool-agnostic (grep ไม่พบชื่อรุ่น/tool/ponytail)
- [ ] ทุก pointer เป็น relative link resolve ได้ → `lint:md` เขียว
- [ ] `verify:pack` + `npm test` + `validate-topic` เขียว/ไม่มี ✖
- [ ] root dogfood = src (หลัง setup:dogfood)
- [ ] CHANGELOG มี entry
- [ ] ไม่แก้ logic เดิม (backward compatible) + ไม่เพิ่ม context ตัวที่ 4 + ไม่เพิ่ม gate item ใน verify §6
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
