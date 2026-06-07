# Test Plan — examples (worked-example walkthrough)

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> guideline: ไม่มี `docs/techstack/` สำหรับ "เอกสาร repo" → ใช้รูปแบบ verify เอกสาร (dead-link + accuracy + UX + regression)

## 1. จุดประสงค์ที่ต้อง verify
worked example ช่วยผู้ใช้ใหม่เข้าใจ "output ที่ทำดีแล้ว" ของ workflow — ต้อง (1) ลิงก์ใช้ได้จริง, (2) **เล่าตรงกับ achieved จริง** (ไม่ misrepresent), (3) อ่านเข้าใจ flow (UX เอกสาร), (4) ไม่ทำ payload/test เดิมพัง

## 2. วิธีเทส (เอกสาร — ไม่มี service)
local grep/node resolve + เทียบเนื้อหากับ achieved artifacts จริง; regression ด้วย `npm test`/`verify:pack`

## 3. Test cases
| # | เคส | วิธี | คาดหวัง |
|---|---|---|---|
| V1 | dead-link | node `existsSync` ทุกลิงก์ walkthrough + README | 0 dead |
| V2 | **accuracy** — claim ตรง achieved | เทียบ 5 claim หลักกับ achieved build/verify/proposal/ship/discovery | ตรงทุก claim |
| V3 | snapshot honesty | walkthrough รายงาน 18/18 (ประวัติ) ไม่ใช่ 19/19 (ปัจจุบัน) | ซื่อตรงต่อ snapshot |
| V4 | โครงครบ | 5 stage + 1 task + disclaimer | ครบ |
| V5 | ไม่ duplicate playbook | grep ชี้กลับ ไม่ลอก checklist | ชี้กลับ ≥5 จุด, 0 lift |
| V6 | UX เอกสาร (QA lens) | อ่านไล่ลำดับ: disclaimer เด่น, ตารางภาพรวม→รายละเอียด, decision สื่อ, pointer ชัด | flow ชัด เข้าใจได้ |
| V7 | regression | `npm test` + `verify:pack` + git status | 19/19 เขียว, payload ไม่แตะ |
| V8 | ลิงก์ playbook ชี้ source | ตรวจ walkthrough ใช้ `src/.warnyin/` ไม่ใช่ root `.warnyin/` | ชี้ committed source |

## 4. Env
- local: macOS + node; ไม่มี service ภายนอก; ไม่มี FE (เอกสาร markdown)

## 5. หมายเหตุ (merge เข้า techstack ตอน SHIP)
- เพิ่ม pattern verify **เอกสาร worked-example**: dead-link + **accuracy เทียบ source** (จุดเสี่ยงเฉพาะของ doc ที่เล่าเรื่อง — อาจ misrepresent) + snapshot honesty + UX flow — อาจตั้ง `docs/techstack/docs/` หรือ note ใน rule (ยืนยัน SHIP)
