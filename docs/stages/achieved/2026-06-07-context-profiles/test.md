# Test Plan — context-profiles

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> guideline: `docs/techstack/installer/test.md` · QA lens: `.warnyin/workflow/roles/qa.md`

## 1. จุดประสงค์ที่ต้อง verify (จาก proposal/design)
topic นี้เป็น **docs/.md ล้วน** (ไม่มี service/FE) — เจตนา: AI เปิด playbook stage → เจอ callout → ไปอ่าน context card → สวม session posture ที่ถูก โดย context **ไม่ duplicate** stage/role และ ship ได้โดยไม่แตะ installer

## 2. วิธีเทส (ไม่มี runtime → static + executable install proof + behavioral read)
ไม่มี local service ให้รัน — verify ด้วย: (1) automated structural checks, (2) executable install proof ผ่าน `cli.mjs`, (3) behavioral read ในมุมผู้บริโภค (AI เริ่ม stage)

## 3. Test cases

| # | เคส | วิธี | ผ่านเมื่อ |
|---|---|---|---|
| T1 | **functional regression** | `npm test` | 18/18 pass, 0 fail (ไม่มี test เดิมพัง) |
| T1b | **package cleanliness** | `npm run verify:pack` | เขียว · contexts/*.md ติด payload · ไม่มี leak |
| T2 | **install behavior (executable proof)** | `npm run setup:sandbox` → ตรวจ target | `contexts/` (4 ไฟล์) + callout 5 playbook ลง target ผ่าน `cli.mjs`; root dogfood ไม่โดนแตะ |
| T3 | **dead-link สองทิศ** | scan link ใน `contexts/*.md` + callout path ใน `stages/*.md` | ทุกลิงก์ resolve เป็นไฟล์จริง (0 dead) |
| T4 | **mapping correctness** | เทียบ callout 5 playbook กับ design.md §4 | discovery→research · design→research+build · build→build · verify→review · ship→review |
| T5 | **โครง D2 (บาง ไม่ duplicate)** | นับ section ต่อ card | ทุก card มีครบ 4 section (Mindset/Do-Don't/Tool preference/ใช้คู่ stage) ไม่ copy stage checklist |
| T6 | **behavioral — สวม context ได้จริง** | อ่าน stage playbook → เดินตาม callout → context card | context ให้ posture actionable, ต่างจาก role (session vs task), ชี้กลับ playbook |
| T7 | **3-way consistency** | README mapping table ↔ callout จริง ↔ "ใช้คู่ stage ไหน" ของ card | 5 core mapping ตรงกันทั้ง 3 ทาง |

## 4. Regression / edge ที่ QA ต้องระวัง
- callout แทรกแล้วทำ test เดิม (เคส 5/6 assert string cli.mjs) พังไหม → T1
- contexts/ ไม่ติด tarball / allowlist พลาด → T1b, T2
- ลิงก์ relative ผิดระดับ (`../` count) → T3
- card ไหน duplicate checklist ของ stage (drift risk) → T5, T6
- mapping README/callout/card หลุดกัน (เหมือนบทเรียน cli↔CHANGELOG↔test ใน roadmap-sync-p0) → T7

## 5. env
local: `npm` + git + `tar` (มีครบ) · ไม่ต้องรัน service · ไม่แตะ network (sandbox ใช้ src/ ผ่าน setup:sandbox)
