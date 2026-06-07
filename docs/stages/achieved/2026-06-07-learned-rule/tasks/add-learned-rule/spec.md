# Spec — add-learned-rule

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`docs` / `content` — แก้ `.md` แก่นกลาง workflow (playbook SHIP) + adapter command + template

## 2. Canonical — learned-rule mechanism (ใช้ตรงนี้ทุกจุด — design.md §2)
- **นิยาม:** learned-rule = กฎถาวรที่ **generalize จากบทเรียน topic** (ไม่ใช่ incident) — superset ของ "รอ SHIP": **planned** (DESIGN) + **emergent** (BUILD/VERIFY)
- **capture sources:** planned = `tasks/*/rule.md` §2; emergent = สแกน `build.md`/`verify.md`/`troubleshooting.md`/diff/commit
- **entry:** `rule` (generalize ไม่ใช่ incident) · `evidence` (**บังคับ** concrete pointer + ลิงก์ artifact; ไม่มี = ไม่ promote) · `scope` (`component:<c>`→`docs/techstack/<c>/rule.md` / `project`→`docs/rule.md`) · `promote?` (user ยืนยัน per-rule)
- **principle 7 (1 บรรทัด):** "เก็บ rule ที่จะ promote ให้หมด — planned + emergent; ทุกตัวมี evidence(บังคับ)+scope+user ยืนยัน ก่อน promote; ไม่มี evidence ไม่ promote (สอด 'ห้ามเดา'); learned-rule = กฎ generalize ไม่ใช่ incident"

## 3. จุดที่ต้องแก้ (design.md §4)
| ไฟล์ | ใส่อะไร |
|---|---|
| `src/.warnyin/workflow/stages/ship.md` §3 principle 7 | ขยาย "เก็บ รอ SHIP" → planned+emergent + evidence+scope+user-confirm |
| `src/.warnyin/workflow/stages/ship.md` §4 step 1 | collect learned-rule candidate (planned `tasks` + emergent build/verify/troubleshooting) ตอนอ่าน topic |
| `src/.warnyin/workflow/stages/ship.md` §4 step 3 (+ process principle) | fold ตาราง learned-rule (rule+evidence+scope) เข้า AskUserQuestion approval — user ยืนยัน per-rule |
| `src/.warnyin/workflow/stages/ship.md` §4 step 5 | promote ตาม scope (component→techstack, project→docs/rule.md) |
| `src/.warnyin/workflow/stages/ship.md` §6 gate | +item learned-rules พิจารณาครบ (evidence+ยืนยัน+ตัดมีเหตุผล) |
| `src/.claude/commands/warnyin/ship.md` | step 3 (+collect emergent) + step 5 (fold learned-rule table) |
| `src/.warnyin/template/stages/[topic]/ship.md` §3 | แทน "note รอ SHIP ที่ตัดทิ้ง" → section "Learned rules" (rule\|evidence\|scope\|promote?) ครอบทั้ง promote+ตัด |

## 4. Data-flow
ไม่มี runtime — SHIP: อ่าน topic → รวบรวม learned-rule candidate (evidence+scope) → fold approval (user ยืนยัน per-rule) → promote เฉพาะที่ยืนยัน ตาม scope → บันทึก `achieved/ship.md` section Learned rules

## 5. Persona
ผู้ส่งมอบ (SHIP) — AI หลัก + user: จับบทเรียนของ topic เป็นกฎถาวรอย่างตั้งใจ (ไม่หล่นหาย) โดย user คุมว่าอะไรเป็น rule

## 6. Test-flow
- [ ] principle 7 ขยาย (planned+emergent+evidence+scope+confirm) ใน ship.md §3 (grep "emergent"/"evidence")
- [ ] §4 step 1/3/5 มี collect / fold approval / promote-by-scope
- [ ] §6 gate มี item learned-rules
- [ ] command ship.md step 3+5 mirror
- [ ] template `[topic]/ship.md` มี section "Learned rules" (4 คอลัมน์)
- [ ] wording ทุกจุดสอดคล้อง canonical §2 (playbook ↔ command ↔ template)
- [ ] global bullet note ใน `rule.md` §2 (รอ SHIP)
- [ ] `npm test` 18/18 + `npm run verify:pack` เขียว (template `src/.warnyin/template` ติด tarball)
