# Ship Report — gitignore-dogfood-fix (untrack root dogfood)

> ส่งมอบ 2026-06-07 · archive ของ topic `gitignore-dogfood-fix` (emergent bugfix — bootstrap correctness)

## 1. feature: ไม่มี (bugfix)
git/config correctness — ไม่ใช่ workflow capability → ไม่สร้าง `docs/features/`; deliverable = git state ตรง rule §6 (untrack 64 + `.gitignore` anchored บน build branch)

## 2. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/troubleshooting.md` **#11** | root dogfood ถูก commit (tracked) ทั้งที่ rule §6 ว่า gitignored — root cause: runbook src-bootstrap step ตกหล่น (`.gitignore` ไม่มี dogfood + ไม่ untrack); วิธีแก้ (git rm --cached + anchored + fresh-clone sim); **บทเรียน anchoring** (mid-slash anchored root / trailing-slash match ทุก depth); ป้องกันซ้ำ (verify git ls-files หลัง migration) |
| `docs/rule.md` §6 | แก้ example anchoring ให้แม่น (trailing-slash match ทุก depth ต้อง `/`; mid-slash anchored แล้ว แต่ anchor explicit ยังดี) + เพิ่ม "ตรวจ `git check-ignore src/...`" |
| `docs/roadmap.md` | section "🐛 Core bug" +entry (root dogfood tracked → fixed) |
| `docs/infra.md` §Runbook | mark step 5 (`.gitignore` dogfood) **ตกหล่นจริง** ตอน src-bootstrap → ปิดโดย topic นี้; บทเรียน verify git state |

## 3. note "รอ SHIP" — พิจารณาครบ
- **ไม่มี rule ใหม่** — topic ทำให้ git state compliant กับ rule §6 เดิม (task rule.md §2 ระบุชัด) ✅
- **D3 (CI guard กัน leak ซ้ำ)** → **ไม่ทำ** (Q1): `.gitignore` ที่ถูกต้องเป็น guard ในตัว + zero-dep/กระทัดรัด; บันทึก prevention ใน troubleshooting #11 แทน
- **rule §6 accuracy** → **แก้** (Q2): example คลาด (mid-slash) ปรับให้ตรง git semantics

## 4. Learned-rule (dogfood #8)
| # | สิ่งที่ได้ | scope | ปลายทาง | ประเภท |
|---|---|---|---|---|
| — | ไม่มี **rule ใหม่** (compliant rule §6 เดิม) | — | — | — |
| L (emergent) | gitignore anchoring semantics + verify-git-state-after-migration | component | `troubleshooting.md` #11 + `rule.md` §6 (แก้ accuracy) | troubleshooting/lesson (ไม่ใช่กฎใหม่) |

## 5. troubleshooting
- เพิ่ม #11 (ดู §2) — promote จาก issue.md D1 (anchoring) + build/verify

## 6. โค้ด/deliverable (merge นอก workflow)
- branch `build/gitignore-dogfood-fix` (commit `d551f5d` untrack+gitignore · `20abb38` build · `d571bb3` verify) → merge `main`
- **docs-only ของกลาง** (SHIP) แยกจาก git-state change (build branch) — ไม่ bump version (ไม่กระทบ npm payload; `src/` + `files` ไม่แตะ)
- verify: fresh-clone sim (src 78 ไม่หาย) · regen round-trip (setup:dogfood → 0.8.4) · regression 19/19

## 7. ผลพลอยได้
- **drift หาย:** หลัง untrack + `setup:dogfood`, root dogfood = 0.8.4 ใหม่ (ไม่ใช่ 0.7.0 ค้างใน git)
- **runbook gap ปิด:** src-bootstrap step 5 ที่ตกหล่นถูกบันทึก + แก้

## 8. สถานะ
✅ topic ปิดสมบูรณ์ — bootstrap correctness แก้แล้ว; เหลือ P2 #11 (selective install, optional) + #12 (lint/format)
