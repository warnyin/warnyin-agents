# Standard — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack)

- `CONTRIBUTING.md` §release flow (บรรทัด ~67-70): ลำดับ = test เขียว + verify:pack ผ่าน → bump version + CHANGELOG entry → publish (CI gate matrix node 20/22/24)
- `docs/rule.md` §5: acceptance = **pass count ไม่ใช่แค่ exit 0** — gate test ต้อง pipe ผ่าน `check-test-count.mjs`; `node --test` แบบ bare ห้ามใส่ path arg

## 2. Pattern การเขียนของ task นี้

- **รูปแบบ CHANGELOG ตามไฟล์เดิมเป๊ะ** ([Keep a Changelog](https://keepachangelog.com/en/1.1.0/)):
  - heading `## [0.24.0] - YYYY-MM-DD` วางใต้ `## [Unreleased]` (entry ใหม่อยู่บนสุดของรายการ version)
  - จัดกลุ่ม `### Added` / `### Changed` (/`### Fixed` ถ้ามี) — ของใหม่ (receipt template, loop-tuning.md, validator fast-mode) เข้า Added; ปรับพฤติกรรมเดิม (worktree policy, prompt lean, caps, UX-detect) เข้า Changed
  - หนึ่ง bullet ต่อหนึ่งประเด็น: ขึ้นต้น **ตัวหนาสรุป change** ตามด้วย — คำอธิบาย; ระบุ feature ที่กระทบ (เช่น `feature change-sizing / build-orchestration`), path ไฟล์เป็น backtick, ปิดท้ายด้วย note backward-compat + "payload ติดมากับ `--update` รอบถัดไป" ตาม convention entry เดิม
- **ภาษา:** ไทยเป็นหลัก ปนศัพท์เทคนิคอังกฤษ (fast-track, worktree, receipt) — ตามน้ำเสียง entry 0.9.x-0.21.0 ทุกตัว
- **semver:** minor bump (`0.23.0` → `0.24.0` — หลัง merge `origin/release/0.23.0`; 0.22.0/0.23.0 ถูก publish แล้ว) — behavior ใหม่ + backward compatible = minor ตาม convention history (breaking/layout change เท่านั้นที่เคยมี migration note)
- **`package.json`:** แก้เฉพาะ field `version` — ไม่จัด format ใหม่ ไม่แตะ field อื่น

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)

- gate scripts มีครบแล้ว — ใช้ npm scripts เดิม: `npm test` · `npm run verify:pack` · `npm run lint:md` · `src/scripts/check-test-count.mjs` (MIN_PASS=9) — ห้ามเขียน gate script ใหม่

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)

- entry ต้องสรุปจาก **diff จริงบน build branch** (`git diff main...HEAD -- src/`) ไม่ลอกจาก design.md ตรงๆ — กัน misrepresent เมื่อ implementation จริงต่างจาก design (ดู `docs/rule.md` §5 "verify เอกสาร narrative = accuracy เทียบ source")
