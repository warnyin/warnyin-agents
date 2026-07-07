# Spec — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — ใส่เฉพาะหัวข้อที่เกี่ยวข้อง

## 1. ชนิดของ task

`docs/config` — CHANGELOG entry (markdown) + version bump (`package.json`) + รัน release gate; **ไม่มีโค้ดใหม่**

## 2. Data-flow

- diff จริงของ slice 1-5 บน build branch (integrate ครบ) → สกัด user-facing changes → entry ใหม่ใน `CHANGELOG.md` (section `## [0.24.0] - <วันที่>` ใต้ `## [Unreleased]` เหนือ `## [0.23.0]` (★ ต้อง merge `origin/release/0.23.0` เข้า build branch ก่อน — ดู task.md sub-task 2))
- convention จาก history ของ `CHANGELOG.md` (feature release = minor bump ทุกครั้ง เช่น 0.20.0→0.21.0) → `package.json` field `version`
- ผล gate 4 ตัว → รายงาน build (VERIFY ใช้เป็น baseline)

## 3. Test-flow

รันจาก repo root บน build branch ที่ integrate ทุก slice ครบแล้ว (design §6: `lint:md` เป็น gate ระดับ integration — task นี้คือจุดที่มันต้องเขียวจริง):

- [ ] **gate 1 — test:** `npm test` → exit 0, ไม่มี fail (รวม test ใหม่ของ slice 1/2/5: installer.test +1 assertion, build-wave prompt tests, validate-topic fast/mixed)
- [ ] **gate 2 — pack:** `npm run verify:pack` → ผ่าน (payload ใหม่ `src/.warnyin/workflow/loop-tuning.md` + `src/.warnyin/template/stages/receipt.md` อยู่ใต้ prefix ที่ allow อยู่แล้ว — ไม่ต้องแก้ allowlist)
- [ ] **gate 3 — dead-link:** `npm run lint:md` → ผ่าน; โดยเฉพาะ pointer `../loop-tuning.md` ใน `triage.md §2C` / `build.md §4` / `verify.md §4` ต้อง resolve (ไฟล์มีจริงจาก slice 4)
- [ ] **gate 4 — pass-count:** `npm test 2>&1 | node src/scripts/check-test-count.mjs` → `pass ≥ 9`, `fail = 0`, `pass = tests`
- [ ] **CHANGELOG ครบ:** grep entry `[0.24.0]` เจอทั้ง 7 ประเด็น (receipt/code-first · worktree wave เดี่ยว · prompt lean · caps §2D · UX-detect exclusion · loop-tuning.md · validator fast-mode) — เทียบกับ diff จริง ไม่มี change ที่ user เห็นแล้วตกหล่น และไม่มี claim ที่ diff ไม่รองรับ
- [ ] **version ตรงกัน:** `package.json` version = `0.24.0` = เลขหัว entry ใน CHANGELOG
- [ ] **scope:** `git status` — ไฟล์ที่ task นี้เปลี่ยนมีแค่ `CHANGELOG.md` + `package.json`

## 4. Edge case

- **gate แดง:** สาเหตุอยู่ในโค้ดของ slice อื่น → **รายงานตามจริง + ระบุ slice ต้นเหตุ** ห้ามแก้ `src/**`/config/test เพื่อบังให้เขียว (config-protection)
- **entry เดิมใน `[Unreleased]`:** ถ้ามีเนื้อหาค้าง — คงไว้ตามเดิม ไม่ merge เข้า 0.24.0 เว้นแต่เป็นของ change ชุดนี้
- ลิงก์ compare ท้ายไฟล์ CHANGELOG ค้างที่ 0.9.1 มานานแล้ว (convention เลิกอัปเดตตั้งแต่ 0.10.0) — **ไม่ต้องเพิ่ม** ลิงก์ 0.24.0 (ตามพฤติกรรมไฟล์เดิม)
