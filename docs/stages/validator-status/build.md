# Build Report — Structural validator + status script

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`
> รายงานผลการ implement ต่อ task + การ integrate

| | |
|---|---|
| **Slug** | `validator-status` |
| **Build branch** | `build/validator-status` |
| **Isolation** | `worktree` |
| **วันที่** | `2026-06-08` |
| **ผลรวม** | ผ่าน 2 / ล้ม 0 / ทั้งหมด 2 task |

## 1. Execution plan (waves ตาม dependency)
```
wave 1: validator-script    (script + unit/executable test)
wave 2: playbook-wiring      (next/design/ship + command mirror + CHANGELOG — อ้าง CLI contract)
```
(wave 0: commit topic docs ลง build branch ก่อน fan-out — ตาม learned-rule E1)

## 2. ผลต่อ task
| Wave | Task | สถานะ | Test/Lint | ไฟล์ที่แก้ | Branch | หมายเหตุ |
|---|---|---|---|---|---|---|
| 1 | validator-script | ✅ passed | test 53/53 · lint:md · verify:pack เขียว | `src/.warnyin/workflow/scripts/validate-topic.mjs` (ใหม่ 18kB) · `src/tests/validate-topic.test.mjs` (ใหม่) | worktree-wf_8ae12721-ae1-1 | self-validate ทำงานจริง (stage=DESIGN, C3 ข้ามเพราะ ship template — B4 ไม่ false-fail); path traversal → exit 2; แก้ TS-1 (test fixture) ระหว่าง build |
| 2 | playbook-wiring | ✅ passed | test 53/53 · lint:md (85 ไฟล์) · verify:pack (77 ไฟล์) | `next.md` · `stages/{design,ship}.md` · command `{next,design,ship}.md` · `CHANGELOG.md` | worktree-wf_915d4f8e-2b6-1 | wiring 3 จุด + node-guard ครบ; unify-in-place (next step 0 ไม่ renumber); mirror บาง; ไม่มี rule ใหม่ |

## 3. Integration notes
- merge แบบ **checkout เฉพาะไฟล์ scoped** จาก worktree branch (เลี่ยง topic-docs copy ที่ agent ลากเข้า worktree) — wave 1: 2 source file · wave 2: 7 wiring file; ไม่มี conflict
- worktree fork จาก main ทั้งสอง wave → agent merge build branch เข้า worktree เอง (TS-2 = instance ของ KB#14; E1 rule ครอบ)
- task.md status + checklist อัปเดตที่ main working dir (gitignored topic dir แก้จาก worktree ไม่ได้)

## 3.5 Full build & test gate (หลัง integrate ทุก wave)
| Component | Build | Unit test | Test อื่น | รอบที่แก้ |
|---|---|---|---|---|
| installer + payload (repo เดียว) | ✅ (zero-build) | ✅ `npm test` 53/53 pass 0 fail (26→53, +27 จาก validator) | ✅ `lint:md` 85 ไฟล์ 44 ลิงก์ · ✅ `verify:pack` 77 ไฟล์ (validate-topic.mjs ติด tarball) | 0 (เขียวรอบแรกหลัง integrate) |

- regression check: `node src/.warnyin/workflow/scripts/validate-topic.mjs validator-status` → exit 0 (validator ยังทำงานบน integrated tree)
- node-guard ครบ 3 จุด wiring (grep "ถ้ารัน node ได้" = 1/ไฟล์ × 3)

## 4. ปัญหา/ค้าง
- ไม่มี task ล้ม/ค้าง
- defer จาก DESIGN (validator-script issue.md): 3 implementation nuance (C5 section-boundary, H2 anchor, copy spawn-harness) — จัดการครบใน implement แล้ว

## 5. Rule/standard ใหม่ที่ note ไว้ (รอ SHIP)
- `tasks/validator-script/rule.md` §2: "structural validator เช็คเฉพาะโครง ✖ ต้องไม่พึ่ง filled-detection (existence/structure); heuristic ที่เดา 'เติมแล้ว' เป็น ⚠ เท่านั้น" — evidence: design review B1 + §4.2 · scope `project`
- emergent (TS-1): "negative test fixture ของ keyword-heuristic ต้องเลี่ยง trigger phrase ในข้อความ filler" — candidate learned-rule (component:installer/testing)
- `tasks/playbook-wiring/rule.md`: ไม่มี rule ใหม่ (convention เดิม — canonical-copy promote แล้วจาก feature-spec-delta)

## 6. ปัญหายาก/ซ้ำที่เจอ
> บันทึกละเอียดที่ `./troubleshooting.md`
- TS-1: negative fixture match keyword ตัวเอง (ยกขึ้น KB กลางตอน SHIP)
- TS-2: worktree fork จาก main (instance ของ KB#14 — ไม่ promote ซ้ำ)

## ✅ Gate → VERIFY (ดู `.warnyin/workflow/stages/build.md` ข้อ 7)
- [x] ทุก task implement + merge เข้า build branch แล้ว (2/2)
- [x] ทุก task `passed` ไม่มี `failed` ค้าง
- [x] ไม่มี merge conflict ค้าง
- [x] Full build ของทุก component ผ่าน (zero-build)
- [x] test suite ทั้งหมดเขียว (53/53 + lint:md + verify:pack)
- [x] build.md สรุปครบทุก task + ผล full build/test
- [x] ไม่แตะ rule/standard กลางใน docs/ (rule ใหม่ note ใน tasks/*/rule.md รอ SHIP)
