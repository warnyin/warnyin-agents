# Verify Report — examples (worked-example walkthrough)

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`

## 1. ผลรวม
✅ **ผ่านทั้งหมด — จำนวนการแก้ไข: 0 รอบ**

## 2. ผลต่อ test case
| # | เคส | ผล |
|---|---|---|
| V1 | dead-link | ✅ **0 dead** จาก 34 ลิงก์ (walkthrough 30 + README 4) — node `existsSync` |
| V2 | accuracy vs achieved | ✅ ตรงทุก claim: BUILD 18/18 0 รอบ · VERIFY 0 รอบ · DESIGN เลือก A ปัด B · SHIP ปิด defer P0 #3 + ไม่มี rule ใหม่ · Discovery template เปล่า |
| V3 | snapshot honesty | ✅ รายงาน **18/18 (ประวัติ)** ไม่ใช่ 19/19 ปัจจุบัน — ซื่อตรงต่อ snapshot ของ topic |
| V4 | โครงครบ | ✅ 5 stage (Discovery/DESIGN/BUILD/VERIFY/SHIP) + 1 task `fix-legacy-warning` + disclaimer |
| V5 | ไม่ duplicate playbook | ✅ ชี้กลับ playbook 7 จุด, 0 gate-checkbox ลอก |
| V6 | UX เอกสาร (QA lens) | ✅ disclaimer เด่นบนสุด → ตารางภาพรวม 5 stage → รายละเอียดราย stage เน้น decision → ปิดท้าย `/warnyin:discovery`; ไล่ลำดับชัด อ่านเข้าใจ flow |
| V7 | regression | ✅ `npm test` 19/19 · `verify:pack` 75 ไฟล์ · git status = เฉพาะ `docs/` + `README.md` (payload ไม่แตะ) |
| V8 | ลิงก์ playbook ชี้ source | ✅ ใช้ `src/.warnyin/workflow/stages/` (committed) ไม่ใช่ root `.warnyin/` (dogfood gitignored) — resolve บน GitHub ได้ |

## 3. UX/UI
เอกสาร markdown (ไม่มี FE app) — verify เชิง **readability/flow**: ผ่าน (โครงไล่ภาพรวม→รายละเอียด, decision สื่อชัด, disclaimer ป้องกันเข้าใจผิด, pointer ออกใช้ได้). ไม่มี layout/state ของหน้าจอให้ตรวจ

## 4. รายการแก้ไข
- ไม่มี (0 รอบ) — ไม่มี troubleshooting entry ใหม่

## 5. ข้อสังเกต (ไม่ block — บันทึกให้ SHIP/ภายหลังพิจารณา)
- **DESIGN doc คลาดเล็กน้อย:** task.md/standard เขียน "13 ไฟล์ achieved" จริงมี 14 (10 stage + 4 task) — **ไม่กระทบ deliverable** (walkthrough ไม่ได้อ้างตัวเลขนี้); ปล่อยได้ (จะถูก archive)
- **นอก scope topic นี้:** agent สังเกตว่า root `.warnyin/` ดูเหมือนยัง tracked ใน git (ควร gitignored ตาม `docs/rule.md` §6) — **แยกเรื่อง** ควรเช็คเป็น topic/งานต่างหาก ไม่แก้ในนี้

## 6. Gate (verify.md §6) — ผ่านครบ
- [x] เทสตามจุดประสงค์ topic ครบ (dead-link + accuracy + completeness + UX)
- [x] FE UX/UI — N/A (เอกสาร; readability ผ่าน)
- [x] ทุกข้อ verify ผ่าน (0 ข้อต้องแก้)
- [x] `test.md` + `verify.md` เขียนครบ (จำนวนการแก้ไข = 0)
- [x] ปัญหายาก/ซ้ำ — ไม่มี

→ พร้อมเข้า **SHIP** ด้วย `/warnyin:ship examples`
