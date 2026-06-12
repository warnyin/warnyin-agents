# Issue — installer-version-stamp

> Output ของ DESIGN dry-run · playbook: `.warnyin/workflow/stages/design.md` (ข้อ 4.10)
> ผลสแกนหา defer/blocker ของ task นี้ก่อนเข้า BUILD

## 1. สรุป
- ผลสแกน: blocker **0** ข้อ · defer **4** ข้อ
- สถานะรวม: ☑ แก้ครบ ไม่มี blocker ค้าง (พร้อมเข้า BUILD)
- ยืนยัน insertion point จริง: `cli.mjs:274` (global) / `cli.mjs:280` (project) — แทรก `writeVersionStamp()` หลัง `copyTree` CORE; `target`/`DRY`/`stats`/`pkgRoot` in-scope ทั้ง 2 branch ✓

## 2. รายการ issue
| # | ประเภท | จุดที่พบ | รายละเอียด | แนวทางแก้ / ข้อสรุป | สถานะ |
|---|---|---|---|---|---|
| 1 | defer | `writeVersionStamp` (standard.md §2) | **`stats[...]++` + `console.log` ต้องอยู่นอก `if (!DRY)`** (รันเสมอเพื่อ log ตอน dry-run); `mkdirSync`+`writeFileSync` อยู่ใน `if (!DRY)` — BUILD พลาดง่ายถ้าเอา log เข้า DRY block | code template ใน standard.md §2 เขียนถูกแล้ว — BUILD ทำตามตรง; เคส (b) dry-run assert `existsSync===false` ปลอดภัย | resolved (guidance ใน standard) |
| 2 | defer | `mkdirSync(dirname,{recursive})` | ตอน install จริง `.warnyin/` ถูกสร้างโดย copyTree ก่อนแล้ว → mkdir อาจดูซ้ำซ้อน | คงไว้ (robust cross-platform + กัน CORE ผิดปกติ) — ไม่ใช่ dead code | resolved |
| 3 | defer | acceptance pass-count (task.md §5 / spec §7) | baseline จริงของ `installer.test.mjs` = **17 เคส** (ไม่ใช่ 9); floor `≥9` หลวมกว่าจริง | ไม่กระทบ correctness — floor เป็น minimum; เพิ่ม 4 เคส → 21; track ว่าหลัง build pass-count ควร ≥ 21 | resolved (track) |
| 4 | defer | spec เคส (c) `--update` ซ้ำ | `--update` บน temp เปล่าทำได้เลย (copyTree overwrite:true) ไม่ต้อง seed install ก่อน | ระบุชัด: ไม่ต้อง pre-install — รัน `['--project','--update']` 2 รอบตรงๆ | resolved |

## 3. ผลการแก้ไข
ไม่มี blocker → ไม่ต้องแก้ design/task. DEFER ทั้ง 4 เป็น implementation guidance ที่ standard.md §2 (code template) ครอบแล้ว — BUILD agent ทำตามได้ตรง. จุดเดียวที่ต้องระวังเป็นพิเศษ: **D1 (log/stats นอก `if(!DRY)`)**.
