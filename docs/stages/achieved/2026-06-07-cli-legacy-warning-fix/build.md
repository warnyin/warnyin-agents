# Build Report — cli-legacy-warning-fix

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`

| | |
|---|---|
| **Slug** | `cli-legacy-warning-fix` |
| **Build branch** | `build/cli-legacy-warning-fix` (จาก `main`) |
| **Isolation** | `shared-tree` (task เดียว) |
| **วันที่** | 2026-06-07 |
| **ผลรวม** | ผ่าน 1 / ล้ม 0 / ทั้งหมด 1 task |

## 1. Execution plan (waves ตาม dependency)
```
wave 1: fix-legacy-warning   (task เดียว — sub A→B→C)
```

## 2. ผลต่อ task
| Wave | Task | สถานะ | Test/Lint | ไฟล์ที่แก้ | หมายเหตุ |
|---|---|---|---|---|---|
| 1 | fix-legacy-warning | ✅ passed | npm test 18/18 + migration proof 2 รุ่น | `src/bin/cli.mjs`, `src/tests/installer.test.mjs` | shared-tree |

**Sub-task:**
- **A** ✅ `cli.mjs` — `legacyV2` (≤0.2.x) + `legacyV5` (0.3–0.5.x) คำสั่ง robust: `mkdir -p docs/stages && git mv .../* docs/stages/` + `rm -rf` core เก่า; header codepoint เดิม
- **B** ✅ `installer.test.mjs` — เคส 5 → `git mv warnyin/stages/* docs/stages/`; เคส 6 → `git mv warnyin-stages/* docs/stages/`
- **C** ✅ re-verify ผ่านครบ

## 3. Integration notes
- shared-tree — ไม่มี worktree merge / conflict

## 3.5 Full build & test gate
| Component | Build | Unit test | Migration proof | รอบที่แก้ |
|---|---|---|---|---|
| installer | N/A (zero-dep) | ✅ 18/18 (`npm test`) | ✅ 2 รุ่น (install-after) | 0 (ผ่านรอบแรก) |

**verify รายละเอียด:**
- ✅ `npm test` 18/18 pass, fail 0 (เคส 5/6 ใช้ string ใหม่)
- ✅ cli spawn จริง → warning ออกคำสั่ง robust (`git mv warnyin/stages/* docs/stages/` + `rm -rf warnyin`)
- ✅ executable migration proof (install-AFTER): 0.3–0.5.x ✓ · ≤0.2.x ✓ — งานจริงไม่หาย, ไม่ซ้อน `docs/stages/stages/`, ไม่ warn ซ้ำ
- ✅ `git diff main` แตะเฉพาะ `src/bin/cli.mjs` + `src/tests/installer.test.mjs`

## 4. ปัญหา/ค้าง
- ไม่มี — ผ่านรอบแรก

## 5. Rule/standard ใหม่ที่ note ไว้ (รอ SHIP)
- ไม่มี rule ใหม่ — task นี้ทำให้ cli compliant กับ rule ที่ promote ไปแล้ว (topic `roadmap-sync-p0`: เอกสาร↔cli sync + executable-verified); **ปิด defer item P0 #3**

## 6. ปัญหายาก/ซ้ำที่เจอ
- ไม่มี — แก้ string ตรงไปตรงมา (คำสั่ง verify แล้วใน topic ก่อน)

## ✅ Gate → VERIFY
- [x] ทุก task implement + merge เข้า build branch (1/1)
- [x] ทุก task `passed` ไม่มี `failed`
- [x] ไม่มี merge conflict (shared-tree)
- [x] Full build ผ่าน — N/A (zero-dep)
- [x] test suite เขียว — 18/18
- [x] build.md สรุปครบ
- [x] ไม่แตะ rule/standard กลางใน docs/
