# Task — add-learned-rule

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `add-learned-rule` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | workflow core (playbook SHIP) + adapter command + template |
| **สถานะ** | `build เสร็จ — passed (npm test 18/18 + verify:pack เขียว)` |

## 1. เป้าหมายของ task (vertical slice)
ทำให้ **learned-rule capture ปรากฏครบทุกจุด** — playbook `ship.md` (นิยาม §3 + process §4 step 1/3/5 + gate §6) + command `ship.md` (mirror step 3/5) + template `[topic]/ship.md` (section "Learned rules") ด้วย wording สม่ำเสมอ (canonical design §2) + note global bullet continuous-learning รอ SHIP

## 2. Dependency
- ต้องทำหลัง: — (task เดียว ไม่มี dependency)
- ปลดล็อกให้: —

## 3. Sub-tasks
- [x] 1. `stages/ship.md` §3 principle 7 — ขยาย "เก็บ รอ SHIP" → planned+emergent + evidence(บังคับ)+scope+user-confirm (canonical §2)
- [x] 2. `stages/ship.md` §4 — step 1 collect learned-rule candidate (planned+emergent), step 3 fold ตารางเข้า approval (ยืนยัน per-rule), step 5 promote ตาม scope
- [x] 3. `stages/ship.md` §6 gate — +item learned-rules พิจารณาครบ (evidence+ยืนยัน+ตัดมีเหตุผล)
- [x] 4. `.claude/commands/warnyin/ship.md` — mirror step 3 (collect emergent) + step 5 (fold learned-rule table)
- [x] 5. `template/stages/[topic]/ship.md` §3 — แทน "note รอ SHIP ตัดทิ้ง" → section "Learned rules" (rule\|evidence\|scope\|promote?)
- [x] 6. ตรวจ wording 3 จุดสอดคล้อง canonical §2 — global bullet note ใน `rule.md` §2 (มีอยู่แล้ว ไม่แตะ)
- [x] 7. `npm test` (18/18) + `npm run verify:pack` (72 ไฟล์ ผ่าน)

## 4. ขอบเขตไฟล์ที่จะแตะ
- แก้: `src/.warnyin/workflow/stages/ship.md` + `src/.claude/commands/warnyin/ship.md` + `src/.warnyin/template/stages/[topic]/ship.md`
- **ห้ามแตะ:** `docs/rule.md` (central — รอ SHIP), `cli.mjs`/installer, **root dogfood** (`.warnyin/`/`.claude/` ที่ root), promote target เดิม (reuse)

## 5. Acceptance criteria
- [x] principle 7 ขยาย (planned+emergent+evidence+scope+confirm) ใน ship.md §3
- [x] §4 step 1/3/5 มี collect / fold approval / promote-by-scope
- [x] §6 gate มี item learned-rules
- [x] command ship.md step 3+5 mirror playbook
- [x] template `[topic]/ship.md` มี section "Learned rules" (4 คอลัมน์)
- [x] wording สอดคล้อง canonical design §2 ทุกจุด (playbook ↔ command ↔ template)
- [x] global bullet continuous-learning note ใน rule.md §2 (รอ SHIP — มีอยู่แล้ว ไม่แตะ)
- [x] แก้ template ที่ `src/.warnyin/template/` (ไม่ใช่ root)
- [x] `npm test` 18/18 + `verify:pack` เขียว
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
