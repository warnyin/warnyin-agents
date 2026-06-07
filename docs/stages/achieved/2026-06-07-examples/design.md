# Design (How) — examples (worked-example walkthrough)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> Lens: SA (`.warnyin/workflow/roles/sa.md`) · docs-only, vertical slice เดียว

## 1. ภาพรวมสถาปัตยกรรม
- **component:** เอกสาร repo (`docs/` + `README.md`) — **ไม่ใช่** installer code; ไม่แตะ `src/`, playbook กลาง, npm payload
- **แนวทางหลัก:** **surface** topic จริง `cli-legacy-warning-fix` ผ่าน narrative doc + README pointer; ลิงก์ไป artifact ใน `docs/stages/achieved/` (single source — ไม่ copy)
- **invariant ที่ต้องคง:** `docs/` ไม่อยู่ใน npm `files` (ไม่ ship) · README ยังติด tarball (เพิ่ม section ไม่กระทบ verify-pack) · ไม่ duplicate เนื้อหา achieved · ไม่ re-describe playbook (ชี้กลับ)

## 2. Vertical slices
> docs-only — coupled เป็น slice เดียว: walkthrough + README pointer ต้องไปด้วยกันถึงจะส่งมอบคุณค่า (มี doc แต่ไม่มีจุด onboard = ไม่มีใครเจอ; มี pointer แต่ไม่มี doc = ลิงก์พัง)

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **ผู้ใช้ใหม่เปิด README → เจอ pointer → อ่าน walkthrough 5 stage → คลิกดู artifact จริง** | content (walkthrough) · entry (README) · verify (dead-link) | `tasks/add-example-walkthrough/` |

## 3. Data model / schema
- ไม่มี (docs-only) — โครง `example-walkthrough.md`:
  1. หัว + **disclaimer** (snapshot ณ 2026-06-07 · ดู `.warnyin/workflow/stages/` เป็น source ปัจจุบัน)
  2. ตารางไล่ 5 stage: `stage · ตัดสิน/ทำอะไร · gate ที่ผ่าน · ลิงก์ artifact`
  3. ราย stage: 2–4 บรรทัด narrative (เน้น **reasoning/decision** ไม่ใช่ลิสต์ไฟล์ดิบ) + ลิงก์ไฟล์จริง
  4. ปิดท้าย: "อยากเริ่มเอง → `/warnyin:discovery`" + ลิงก์ achieved อื่นเป็น example เพิ่มเติม

## 4. Interface / contract
- **ลิงก์ออกจาก walkthrough:** relative path ไป `docs/stages/achieved/2026-06-07-cli-legacy-warning-fix/<file>` + `.warnyin/workflow/stages/<stage>.md` — ต้อง resolve จริง (dead-link 0)
- **ลิงก์เข้า walkthrough:** README section ใหม่ → `docs/example-walkthrough.md` (relative)
- **โทน narrative:** ภาษาไทยสไตล์ docs เดิม; ชี้ playbook ไม่ duplicate ขั้นตอน

## 5. Flow
- **author:** เขียน `docs/example-walkthrough.md` (อ่าน 13 ไฟล์ของ cli-legacy-warning-fix → กลั่น decision ต่อ stage) → เพิ่ม README section
- **runtime (ผู้ใช้):** เปิด repo บน GitHub → README "worked example" → walkthrough → คลิก artifact จริงใน achieved/

## 6. ผลกระทบต่อระบบเดิม
- **README:** เพิ่ม 1 section (วางหลัง section "เริ่มต้น/คำสั่ง" — จุดที่ผู้ใช้ใหม่อ่าน); ไม่ลบ/แก้ของเดิม → backward compatible; README ติด npm `files` (ผู้ใช้ npm เห็น section นี้ด้วย — ลิงก์ relative ไป `docs/` ใช้ได้บน GitHub, ผู้ใช้ที่ install จะไม่มี `docs/` แต่ลิงก์ชี้ GitHub repo ได้ → **disclaimer/pointer ระบุว่าดูบน repo**)
- **verify-pack/test:** ไม่แตะ payload/code → เขียวเหมือนเดิม (sanity check)
- **achieved topic:** read-only อ้างอิงเท่านั้น — ไม่แก้

## 7. Dependency ระหว่าง slice/task
```
add-example-walkthrough   (task เดียว — docs-only coupled slice)
```

## 8. Test strategy ระดับ design
- **dead-link:** ทุกลิงก์ใน walkthrough (→ achieved/ 5 stage + playbook) + README→walkthrough resolve จริง = 0 dead
- **โครงครบ:** walkthrough มีครบ 5 stage (discovery/design/build/verify/ship) + 1 task + disclaimer
- **ไม่ duplicate:** walkthrough ชี้ playbook/achieved ไม่ copy ขั้นตอน playbook มาเขียนซ้ำ (grep spot-check)
- **ไม่ regression:** `npm run verify:pack` + `npm test` เขียว (ยืนยันไม่แตะ payload); README section ใหม่ไม่ทำ marker/structure เดิมพัง
- **VERIFY (ภายหลัง):** behavioral — ผู้ใช้ใหม่อ่านแล้วเข้าใจ flow จริง (review เชิง UX ของเอกสาร: ไล่ลำดับชัด, decision สื่อ, pointer ใช้ได้)
