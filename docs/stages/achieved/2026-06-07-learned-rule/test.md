# Test Plan — learned-rule

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> ชนิด: payload `.md` ล้วน (playbook + command + template) — verify เชิงโครงสร้าง + executable install proof + consistency (guideline `docs/techstack/installer/test.md` §"payload `.md` ล้วน")

## วิธีเทส
local: `npm test`, `npm run verify:pack`, `npm run setup:sandbox` (install src/ → temp ผ่าน cli.mjs) — **ห้ามรัน cli.mjs ที่ cwd=repo root** (dogfood leak #6)

## เคสเทส
| # | เคส | วิธี | คาดหวัง |
|---|---|---|---|
| T1 | functional regression | `npm test` + `verify:pack` | 18/18 + 72 ไฟล์ |
| T2 | executable install proof | `setup:sandbox` → grep target | mechanism ลงครบ 3 surface (ship.md playbook + command + template) ผ่าน cli.mjs; **root dogfood ไม่โดนแตะ** |
| T3 | ครบทุก surface | grep playbook §3/§4/§6 + command + template | collect + fold approval + promote-by-scope + gate + section Learned rules |
| T4 | 3-way consistency | grep "evidence" 3 จุด | playbook ↔ command ↔ template มี evidence(บังคับ) ตรง canonical §2 |
| T5 | unify (ไม่บวม/ไม่ขนาน) | นับ principle §3 + gate §6 | §3 = 7 principle (ข้อ 7 ขยายในที่เดิม ไม่เพิ่มข้อ 8) · gate = 8 items เท่า main (item 3 แก้ในที่เดิม) |
| T6 | learned-rule ≠ troubleshooting | grep นิยาม | "learned-rule = กฎ generalize ไม่ใช่ incident" ปรากฏใน playbook |
| T7 | dead-link / scope target | resolve `docs/rule.md`, `docs/techstack/` | promote target ที่ scope ชี้ → มีจริง |
| T8 | global note พร้อม SHIP | อ่าน rule.md §2 | bullet "continuous-learning discipline" รอ promote → docs/rule.md §1 |

## local env
ไม่มี service — doc/payload ล้วน; executable proof ใช้ setup:sandbox (temp dir, ไม่แตะ root)
