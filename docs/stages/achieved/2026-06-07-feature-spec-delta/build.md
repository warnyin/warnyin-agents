# Build Report — Feature behavior spec + delta discipline

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`
> รายงานผลการ implement ต่อ task + การ integrate

| | |
|---|---|
| **Slug** | `feature-spec-delta` |
| **Build branch** | `build/feature-spec-delta` |
| **Isolation** | `worktree` |
| **วันที่** | `2026-06-07` |
| **ผลรวม** | ผ่าน 3 / ล้ม 0 / ทั้งหมด 3 task |

## 1. Execution plan (waves ตาม dependency)
```
wave 1:            spec-template
wave 2 (parallel): stage-wiring ∥ dogfood-specs   (ไม่ชนไฟล์ — ยืนยันจาก dry-run)
```
(wave 0: ลบ placeholder `tasks/[task-name]/` + commit topic docs ลง build branch ก่อน fan-out)

## 2. ผลต่อ task
| Wave | Task | สถานะ | Test/Lint | ไฟล์ที่แก้ | Branch | หมายเหตุ |
|---|---|---|---|---|---|---|
| 1 | spec-template | ✅ passed | test 26/26 · lint:md · verify:pack เขียว | `src/.warnyin/template/docs/features/[feature-name]/spec.md` (ใหม่ 16 บรรทัด) | worktree-wf_8a43b733-a72-1 | header 6 key ตรง design §4.1; ใต้ `[feature-name]/` กัน seed leak |
| 2 | stage-wiring | ✅ passed | test 26/26 · lint:md · verify:pack เขียว + structural invariants (verify §3 ยัง 11 principle, ship §4 step5 ยัง 6 sub-step) | 10 ไฟล์: 3 playbook + 2 stage template + workflow README + 3 command mirror + CHANGELOG | worktree-wf_7730c873-bf5-1 | unify-in-place ทุกจุด; กติกา merge เต็มอยู่ ship playbook เท่านั้น (mirror บาง) |
| 2 | dogfood-specs | ✅ passed | lint:md · verify:pack (docs/ ใน denylist — ไม่หลุด tarball) · test 26/26 | `docs/features/{context-profiles,utility-skills}/spec.md` (68/58 บรรทัด) | worktree-wf_7730c873-bf5-2 | accuracy grep เทียบ source ครบ; path อ้างเป็น backtick ตาม issue #2 |

## 3. Integration notes
- merge ตามลำดับ: wave 1 fast-forward (`47c3060`) → wave 2 merge 2 branch ด้วย ort strategy (`97f1784`, `583e491`) — **ไม่มี conflict ทั้ง 3 merge**
- หมายเหตุ worktree: agent wave 1 พบว่า worktree branch จาก `main` (ไม่มี topic docs) → `git reset --hard build/feature-spec-delta` เอง; agent wave 2 ทั้งคู่อ่าน task ผ่าน absolute path ของ main checkout และอัปเดต `task.md` ใน worktree ไม่ได้ → main loop อัปเดตให้ตอน integrate (ดู TS-1 ใน `./troubleshooting.md`)

## 3.5 Full build & test gate (หลัง integrate ทุก wave)
| Component | Build | Unit test | Test อื่น | รอบที่แก้ |
|---|---|---|---|---|
| installer + payload (repo เดียว) | ✅ (zero-build — เป็น .md/script ล้วน) | ✅ `npm test` 26/26 pass 0 fail | ✅ `npm run lint:md` 87 ไฟล์ 44 ลิงก์ · ✅ `npm run verify:pack` 76 ไฟล์ | 0 (เขียวรอบแรก) |

- error ที่เจอตอนรวม + วิธีแก้: ไม่มี — เขียวรอบแรกทุก gate

## 4. ปัญหา/ค้าง (ถ้ามี)
- ไม่มี task ล้ม/ค้าง
- defer จาก DESIGN ที่ยัง track: CHANGELOG compare link `[Unreleased]` ยัง pin `v0.7.0...HEAD` (หนี้เดิม — แก้ตอน release รอบหน้า, ดู `tasks/stage-wiring/issue.md` #1)

## 5. Rule/standard ใหม่ที่ note ไว้ (รอ SHIP)
> รวบรวมจาก `tasks/<task>/rule.md` §2 — รอ SHIP อัปเดตไฟล์กลางใน `docs/`
- `tasks/spec-template/rule.md`: "template ระดับ feature ต้องอยู่ใต้โฟลเดอร์ `[...]` เสมอ (seedDocs skip invariant)" — evidence: Infra-S1 + `cli.mjs:133-134` · scope `component:installer`
- `tasks/stage-wiring/rule.md`: "spec/delta canonical wording ต้อง copy จาก design ของ topic ที่นิยาม ไม่แต่งใหม่ต่อไฟล์" — evidence: design §4 + review B2 · scope `project`
- `tasks/dogfood-specs/rule.md`: candidate เฝ้าดู "THEN อ้าง path:line ของ source เป็น evidence inline" — รอดูตอน SHIP
- emergent จาก BUILD (TS-1): "commit topic docs ลง build branch ก่อน fan-out + worktree ควร branch จาก build branch" — candidate learned-rule ตอน SHIP

## 6. ปัญหายาก/ซ้ำที่เจอ
> บันทึกละเอียดที่ `./troubleshooting.md` (SHIP ยกขึ้น `docs/troubleshooting.md`)
- TS-1: build agent ใน worktree แก้ไฟล์ topic working dir ไม่ได้ด้วย Edit tool (เจอ 2/2 task ใน wave 2)

## ✅ Gate → VERIFY (ดู `.warnyin/workflow/stages/build.md` ข้อ 7)
- [x] ทุก task implement + merge เข้า build branch แล้ว (3/3)
- [x] ทุก task `passed` (test/build เขียว) ไม่มี `failed` ค้าง
- [x] ไม่มี merge conflict ค้าง (3 merge สะอาด)
- [x] Full build ของทุก component ผ่าน (zero-build — ไม่มี build error)
- [x] test suite ทั้งหมดเขียวหมดบน build branch (26/26 + lint:md + verify:pack)
- [x] build.md สรุปครบทุก task + ผล full build/test
- [x] ไม่แตะ rule/standard กลางใน docs/ (rule ใหม่ note ใน tasks/*/rule.md รอ SHIP — `docs/features/*/spec.md` เป็น output ของ task ไม่ใช่ rule/standard กลาง)
