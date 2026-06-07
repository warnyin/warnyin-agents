# Test Plan — defensive-rules

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> guideline: `docs/techstack/installer/test.md` (§verify feature ที่เป็น payload `.md` ล้วน) · QA lens: `roles/qa.md`

## 1. จุดประสงค์ที่ต้อง verify
docs/.md ล้วน (ไม่มี service) — เจตนา: 2 defensive rule (R1 investigate-before-edit, R2 config-protection) เป็น **enforce ของ "ห้ามเดา"** ปรากฏครบทุก enforce point (playbook §3 + role checklist) wording สม่ำเสมอ ไม่ขัด rule เดิม และ ship ได้

## 2. วิธีเทส
static structural + executable install proof + behavioral read (ไม่มี runtime)

## 3. Test cases
| # | เคส | วิธี | ผ่านเมื่อ |
|---|---|---|---|
| T1 | functional regression | `npm test` + `verify:pack` | 18/18 · 72 ไฟล์ (ไม่มี test เดิมพัง) |
| T2 | executable install proof | `setup:sandbox` → ตรวจ target | R1+R2 ลงครบ 4 ไฟล์ payload ผ่าน cli.mjs; root dogfood ไม่โดนแตะ |
| T3 | ครบทุก enforce point | grep R1/R2 ใน 4 ไฟล์ | build.md §3 + verify.md §3 + developer.md + qa.md มีครบ (ไม่ซ้ำ) |
| T4 | wording consistency | เทียบ 4 จุดกับ canonical design §2 | ตรงกัน ไม่ขัด (playbook ฉบับเต็ม, role ฉบับสั้น) |
| T5 | ไม่ขัด "ห้ามเดา" เดิม | ตรวจ framing | ทั้ง 2 rule ระบุ "enforce ของ ห้ามเดา" — ขยาย ไม่ขัด |
| T6 | numbering §3 ต่อเนื่อง | ตรวจลำดับ | build 10→11,12 · verify 9→10,11 (ไม่ทับเลขเดิม) |
| T7 | global note พร้อม SHIP | ตรวจ rule.md §2 | bullet ขยาย "ห้ามเดา" รอ promote |

## 4. Regression / edge ที่ QA ระวัง
- เพิ่ม principle แล้วทำ test เดิมพังไหม → T1 (installer test = black-box ไม่ assert playbook content)
- wording drift ระหว่าง 4 จุด → T4 (canonical เดียว)
- เลขข้อ §3 ชน/ข้าม → T6
- rule ใหม่ขัด/ซ้ำ "ห้ามเดา" → T5

## 5. env
local: npm + git + tar · ไม่ต้องรัน service
