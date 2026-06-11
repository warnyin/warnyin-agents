# Verify Report — fix-setup-dogfood

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`

| | |
|---|---|
| **Slug** | `fix-setup-dogfood` |
| **วันที่** | 2026-06-11 |
| **ผลรวม** | ✅ ผ่าน |
| **จำนวนรอบการแก้ไข (fix iterations)** | 0 รอบ (เขียวรอบแรก) |
| **จำนวนจุดที่แก้** | 0 จุด |

## 1. จุดประสงค์ที่ verify (จาก spec/tasks)
- setup:dogfood refresh CORE จริง (`--update`) + จับ false-green ด้วย `verifyInstalled` side-effect (ไม่เชื่อ exit 0)
- testable: export + main-guard; unit พิสูจน์ false-green guard

## 2. ผลการเทส
| # | Test case | ชนิด | ผล | หมายเหตุ |
|---|---|---|---|---|
| V1 | verifyInstalled behavior | functional (unit) | ✅ | 3 เคส: false (เปล่า) / true (ครบ) / **false (partial)** ผ่านหมด |
| V2 | --update 2 paths | structural | ✅ | npx `:51` `['--yes', PKG, '--update']` + node `:125` `[cli, '--update']` |
| V3 | wire verify success-detection | structural | ✅ | `:63` (npx) + `:126` (pack) `verifyInstalled(repoRoot)` |
| V4 | main-guard | structural | ✅ | `:175` `argv[1] && fileURLToPath===argv[1]` — import ไม่ trigger install |
| V5 | false-green guard | functional | ✅ | เคส partial→false พิสูจน์ "ไม่เชื่อ exit 0" ถูกแก้จริง |
| V6 | regression | functional | ✅ | `npm test` 69/69 (+3 ใหม่) · `lint:md` 107 · `verify:pack` 81 |

**Regression baseline:** spec delta = ไม่มี delta (dev-tooling) → ไม่มี feature-spec baseline. Regression = `npm test` 69/69 (assertion เดิม 66 ไม่พัง + 3 ใหม่) ✅

## 3. UX/UI verify — N/A

## 4. รายการแก้ไข
| รอบ | ปัญหาที่เจอ | วิธีแก้ | ไฟล์ที่แก้ |
|---|---|---|---|
| — | ไม่มี — เขียวรอบแรก | — | — |

## 5. ปัญหายาก/ซ้ำ → troubleshooting
- มี: `./troubleshooting.md` **TS-1** (setup:dogfood false-green) — บันทึกตอน BUILD; ยกขึ้น KB กลางตอน SHIP

## 6. หมายเหตุถึง user
- **defer:** executable integration (รัน `setup:dogfood` จริง → root CORE = release) = manual proof ตอน release ถัดไป — unit + structural ครอบ logic ครบ
- **learned-rule** (รอ SHIP): "dev-tooling spawn install ต้อง verify side-effect + ส่ง flag ตรงเจตนา"

## ✅ Gate → SHIP
- [x] เทสตามจุดประสงค์ครบ (unit behavior + structural)
- [x] FE: UX/UI — N/A
- [x] ทุกข้อที่ไม่ผ่านถูกแก้จนผ่าน — 0 fail (0 รอบแก้)
- [x] test.md + verify.md เขียนครบ
- [x] ปัญหายากบันทึก troubleshooting.md (TS-1)
