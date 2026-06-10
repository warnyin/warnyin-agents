# Task — stage-integration

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ — self-contained

| | |
|---|---|
| **Task** | `stage-integration` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (payload `src/.warnyin/workflow/` + CHANGELOG) |
| **Wave** | 2 (ทำหลัง `capability-core`) |
| **สถานะ** | `เสร็จ` (retrofit — implement แล้ว) |

## 1. เป้าหมายของ task (vertical slice)
เชื่อม capability `api-doc.md` เข้า lifecycle — hook บางๆ (pointer) เข้า 3 stage + adapter 2 ไฟล์ + CHANGELOG ทำให้ adaptive API-doc ทำงานครบ DESIGN→VERIFY→SHIP โดยไม่ duplicate logic

## 2. Dependency
- **ต้องทำหลัง: `tasks/capability-core` (wave 1)** — hook อ้าง **เลข section** ของ `api-doc.md` (`§2`/`§4`); ถ้า section เรียงต่างจาก design → อัปเดตเลขให้ตรง (กัน silent broken pointer)
- ปลดล็อกให้: — (task สุดท้าย)

## 3. Sub-tasks
- [x] 1. **design.md** — §6 (API task → ผลิต `openapi.yaml`, spec.md ชี้ contract) + output table row + gate item (conditional)
- [x] 2. **verify.md** — input (อ่าน `openapi.yaml`) + process §4 (contract validation + runtime-security) + gate item
- [x] 3. **ship.md** — process §5.2 (promote/merge → `docs/techstack/<component>/openapi.yaml`) + output row + gate item
- [x] 4. **adapter** — `roles/README.md` (แถว SA/Developer + เตือน third-party) + `workflow/README.md` (รายการไฟล์ `api-doc.md`)
- [x] 5. **CHANGELOG.md** — entry ใต้ `[Unreleased]` (user-facing change)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/.warnyin/workflow/stages/{design,verify,ship}.md`
- `src/.warnyin/workflow/roles/README.md` · `src/.warnyin/workflow/README.md`
- `CHANGELOG.md`
- **ห้ามแตะ:** `api-doc.md` (= task-1), `cli.mjs`/installer/test logic, `docs/` กลาง (รอ SHIP)

## 5. Acceptance criteria
- [x] ทั้ง 3 stage มี pointer `.warnyin/workflow/api-doc.md` **ในจุดที่ stage เรียกใช้จริง** (design §6+gate, verify §4+gate, ship process+gate)
- [x] gate item ใหม่ทุกข้อ **conditional (N/A เมื่อไม่ใช่ REST API)** — ไม่ block topic เดิม
- [x] **canonical-copy** — wording ของ hook **คัดมาจาก `api-doc.md`** ไม่แต่งใหม่ต่อไฟล์ (`docs/rule.md` §1)
- [x] **เลข section ที่อ้าง (`§2`/`§4`) มีอยู่จริง** ใน `api-doc.md` (section-pointer integrity — Tech Lead panel)
- [x] **CHANGELOG entry** ใต้ `[Unreleased]` ครบ (`docs/rule.md` §2 — บังคับทุก user-facing change)
- [x] `npm test` ยังเขียว 53 (ไม่แตะ test/installer logic)
- [x] ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
