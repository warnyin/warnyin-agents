# Build Report — เร่งความเร็ว BUILD stage (improve-performance)

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`
> รายงานผลการ implement ต่อ task + การ integrate

| | |
|---|---|
| **Slug** | `improve-performance` |
| **Build branch** | `build/improve-performance` |
| **Isolation** | wave 1 = `worktree` (partial) → recover ด้วย cherry-pick + `shared-tree` |
| **วันที่** | `2026-06-10` |
| **ผลรวม** | ผ่าน 4 / ล้ม 0 / ทั้งหมด 4 task |

## 1. Execution plan (waves ตาม dependency)
```
wave 1 (parallel 3): dag-width-toolkit · build-wave-model-arg · lean-build-verify
wave 2 (1):          model-routing-docs  (ขึ้นกับ build-wave-model-arg — chain แท้ code→doc)
```
critical-path depth = 2 (dogfood DAG-width toolkit เอง) · wave 1 ขนาน 3 task = ตอบ success criteria "≥1 wave ขนาน >1"

## 2. ผลต่อ task
| Wave | Task | สถานะ | Test/Lint | ไฟล์ที่แก้ | Commit | หมายเหตุ |
|---|---|---|---|---|---|---|
| 1 | dag-width-toolkit | ✅ passed | lint-md ✓ · validate-topic ✓ · node --test ✓ | `stages/design.md`, `roles/tech-lead.md`, `template/[topic]/design.md` | `e54adc0` | worktree fork base ผิดสาย → cherry-pick commit เดี่ยว (สะอาด, owned files เท่านั้น) |
| 1 | build-wave-model-arg | ✅ passed (รอบ 2) | node --test 58/58 + runtime e2e proof | `scripts/build-wave.mjs`, `tests/build-wave.test.mjs` | `d669372` | รอบ 1 failed (worktree ว่าง) → re-run shared-tree สำเร็จ |
| 1 | lean-build-verify | ✅ passed | validate-topic ✓ · lint-md ✓ · node --test ✓ | `stages/build.md`, `roles/developer.md` | `3d671bb` | agent self-merge build branch → cherry-pick commit เดี่ยว |
| 2 | model-routing-docs | ✅ passed | validate-topic ✓ · lint-md ✓ · npm test 58/58 · verify:pack ✓ | `contexts/README.md`, `contexts/build.md`, `template/[task-name]/task.md`, `src/.claude/commands/warnyin/build.md`+`design.md` | `897050c` | regression context-profiles ✓ (balanced+ ไม่ถูกแตะ) |

## 3. Integration notes
- **wave 1 worktree fail → recovery:** worktree isolation รอบแรก fork จาก base คนละสาย (release 0.10.0/adaptive-api-doc) ไม่ใช่ `build/improve-performance` + root `.warnyin/` ถูก gitignore → agent 1/3 เจอ worktree ว่าง (failed อย่างซื่อสัตย์ ไม่เดา), อีก 2 ตัวรอด**เพราะ improvise** (reach เข้า shared checkout / self-merge) = non-deterministic
- **วิธี integrate:** 2 task ที่ผ่าน → `git cherry-pick` **commit เดี่ยว** ของ agent (เอาแค่ diff ไฟล์ที่ own ไม่ลาก divergence ของ base) → เข้าสะอาดไม่มี conflict; task ที่ fail + wave 2 → re-run `shared-tree` (agent ทำใน working tree จริง เห็นไฟล์ครบ) → main loop commit ให้
- **file-ownership disjoint จริง** — ทุก task แตะคนละไฟล์ ไม่มี conflict ระหว่าง task (พิสูจน์ toolkit slicing ด้วยตัวเอง)

## 3.5 Full build & test gate (หลัง integrate ทุก wave)
> รันบน build branch ที่ integrate แล้ว — เขียวหมดก่อนปิด BUILD

| Gate | ผล |
|---|---|
| `npm test` (node --test, full suite) | ✅ **58 pass / 0 fail / 0 skipped** |
| `validate-topic.mjs improve-performance` | ✅ โครงครบ (structural) ไม่มี ✖ |
| `npm run lint:md` | ✅ 99 ไฟล์ 44 ลิงก์ |
| `npm run verify:pack` | ✅ 77 ไฟล์ (publish allowlist) |
| regression `context-profiles` | ✅ `balanced+` review ไม่ถูกแตะ · 4-section cards ครบ · ไม่มีชื่อรุ่นรั่วเข้า payload |

- ไม่มี error ตอนรวม — gate เขียวรอบเดียว ไม่ต้อง loop แก้

## 4. ปัญหา/ค้าง (ถ้ามี)
- ไม่มี task ค้าง — ครบ 4/4 passed
- **★ infra finding (ไม่บล็อก BUILD แต่ต้องแก้):** root dogfood `.warnyin/workflow/scripts/build-wave.mjs` **stale กว่า src** (ขาด `baseRef` step-0 sync ที่ src มีแล้ว) → การเรียก script จาก root path รัน logic เก่า ทำให้ worktree ไม่ sync build branch — เป็น **sync gap ของ release ก่อนหน้า** ไม่ใช่ของ task นี้ (ดู troubleshooting.md). แก้ถาวร = SHIP release sync src→root

## 5. Rule/standard ใหม่ที่ note ไว้ (รอ SHIP)
> รวบรวมจาก `tasks/<task>/rule.md` — รอ SHIP อัปเดตไฟล์กลางใน `docs/`
- **critical-path depth** เป็น metric ที่ DESIGN ต้องวัด (dag-width-toolkit) → `docs/rule.md`
- **tier→model mapping ที่ adapter เท่านั้น** (payload คง generic) (model-routing-docs) → `docs/rule.md` §2
- feature `build-orchestration` (toolkit/critical-path gate/verify-scope) — SHIP อาจตั้ง feature spec formal (defer ตาม design §9)

## 6. ปัญหายาก/ซ้ำที่เจอ
> บันทึกละเอียดที่ `./troubleshooting.md` (SHIP ยกขึ้น `docs/troubleshooting.md`)
- ดู `./troubleshooting.md` — 3 entry (worktree base/gitignore sync, AsyncFunction runtime proof, stale root command)

## ✅ Gate → VERIFY (ดู `.warnyin/workflow/stages/build.md` ข้อ 7)
- [x] ทุก task implement + merge เข้า build branch แล้ว (4/4)
- [x] ทุก task `passed` (test/build เขียว) ไม่มี `failed` ค้าง
- [x] ไม่มี merge conflict ค้าง (cherry-pick + shared-tree สะอาด)
- [x] Full build ของทุก component ผ่าน (ไม่มี build error)
- [x] test suite ทั้งหมด (รวม unit test) เขียวหมดบน build branch (58/58)
- [x] build.md สรุปครบทุก task + ผล full build/test
- [x] ไม่แตะ rule/standard กลางใน docs/ (rule ใหม่ note รอ SHIP)
