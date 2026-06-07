# Build Report — examples (worked-example walkthrough)

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`

## 1. ภาพรวม
- **Slug:** `examples` · **Build branch:** `build/examples` (จาก `main`)
- **Isolation:** shared-tree (`isolate:false`) — 1 task docs-only
- **DAG / wave:** 1 wave · 1 task `add-example-walkthrough`
- **ผล:** ✅ ผ่าน — full gate เขียวรอบเดียว (0 รอบแก้)

## 2. ผลต่อ task
| Task | สถานะ | สรุป |
|---|---|---|
| `add-example-walkthrough` | ✅ passed | `docs/example-walkthrough.md` (narrative 5 stage ของ cli-legacy-warning-fix + disclaimer + ลิงก์ artifact จริง) + README section "ตัวอย่างจริง (worked example)" |

## 3. ไฟล์ที่แก้ (2)
- **NEW** `docs/example-walkthrough.md` (61 บรรทัด) — disclaimer (snapshot + ชี้ `src/.warnyin/workflow/stages/`) + ตาราง 5 stage (decision/gate/artifact) + narrative ราย stage (เน้นเหตุผล) + ปิดท้าย `/warnyin:discovery`
- **แก้** `README.md` — +section "ตัวอย่างจริง (worked example)" ชี้ walkthrough (ไม่รื้อของเดิม)

## 4. Full build & test gate (main loop)
- ✅ **dead-link: 0/34** (ทุกลิงก์ใน walkthrough → achieved/ + `src/.warnyin/workflow/stages/` + README→walkthrough resolve จริง — เช็คด้วย node `existsSync`)
- ✅ `npm test`: tests 19 / pass 19 / fail 0 (regression — docs ไม่กระทบ)
- ✅ `npm run verify:pack`: เขียว 75 ไฟล์
- ✅ payload ไม่โดนแตะ (git status = เฉพาะ `docs/` + `README.md`)
- ✅ ไม่ duplicate: walkthrough ชี้ playbook 7 จุด (ชี้กลับ ไม่ copy ขั้นตอน); 5 stage ครบ

## 5. Integration notes
- **ลิงก์ playbook ชี้ `src/.warnyin/...`** (committed source) ไม่ใช่ root `.warnyin/` (dogfood gitignored) — ตรงตาม standard §4 (กัน dead-link บน GitHub)
- ลิงก์ achieved ใช้ relative `stages/achieved/...` (จาก `docs/`)
- global **worked-example convention** note อยู่ใน `tasks/add-example-walkthrough/rule.md` §2 → รอ SHIP
- ไม่มี troubleshooting entry (0 ปัญหา)

## 6. Gate (build.md §7) — ผ่านครบ
- [x] task implement + integrate เข้า build branch
- [x] task passed — ไม่มี failed ค้าง
- [x] ไม่มี merge conflict (shared-tree)
- [x] Full build ผ่าน (docs-only — dead-link + verify-pack)
- [x] test suite เขียว (19/19, regression clean)
- [x] `build.md` สรุปครบ
- [x] ไม่แตะ rule/standard กลาง (worked-example rule note รอ SHIP)

→ พร้อมเข้า **VERIFY**
