# Task — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `release-hygiene` |
| **Slice อ้างอิง** | `design.md` slice C |
| **Component** | `installer` |
| **Model tier** | `balanced` |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
Finalize 0.29.1 release: bump version + MIN_PASS + finalize CHANGELOG (วันที่ + Migration section) + เขียน `docs/infra.md` runbook + full-gate integration (npm test + lint:md + verify:pack)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: `tasks/verify-pack-hardening` + `tasks/cli-help-wording` (integrate ครบ)
- ปลดล็อกให้: `topics/publish-pack-polish` → BUILD → VERIFY → SHIP
- ส่ง output อะไรต่อให้ task ถัดไป:
  - bumped `package.json` version 0.29.1
  - bumped `MIN_PASS` ใน check-test-count.mjs
  - finalized CHANGELOG 0.29.1 (วันที่ + entries ของ Slice B + Migration section)
  - เพิ่ม runbook ใน docs/infra.md
  - full-gate ผ่านทั้งหมด

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
> sub-task ต้องเชื่อมต่อกัน — ระบุลำดับ/สิ่งที่ส่งต่อกัน

- [ ] 1. **อ่าน MIN_PASS ปัจจับัน + pass count ก่อน bump** — `grep MIN_PASS src/scripts/check-test-count.mjs` → 180 (ยอดเก่า) · `npm test 2>&1 | node src/scripts/check-test-count.mjs` (verify ผ่าน) + จด pass count = N — _ผลลัพธ์: baseline evidence_
- [ ] 2. **bump `package.json` version** — `0.29.0` → `0.29.1` (SemVer patch — fix/improvement) — _ขึ้นกับ 1: ไม่, independent_
- [ ] 3. **bump `MIN_PASS` ใน `src/scripts/check-test-count.mjs`** — สูตร `floor((N - 5) / 10) × 10` จาก comment บรรทัด 8 (N = pass count จากข้อ 1 — ถ้า slice A = +4, slice B = +1 → N = 192 + 5 = 197 → MIN_PASS = 190) — _ขึ้นกับ 1: ใช่ (N evidence)_
- [ ] 4. **เติมวันที่หลัง `## [0.29.1]` ใน `CHANGELOG.md`** — format `- YYYY-MM-DD` (วันที่ release จริง) — _ขึ้นกับ 2: version bump ต้องตรงกัน_
- [ ] 5. **เขียน `### Migration` section ใน `CHANGELOG.md`** (ล่างสุดของ 0.29.1) — text ที่ lock ใน design.md §Impact (commit/stash warning + threshold 2026-07-14 + renormalize command) — _ขึ้นกับ 4: ต้อง finalize ก่อน_
- [ ] 6. **เขียน `## Runbook — verify:pack gate failure` ใน `docs/infra.md`** — error categories ทั้งหมด (denylist/allowlist/eol/path/R1/R2/tripwire/stamp) + วิธีแก้แต่ละแบบ — _ขึ้นกับไม่, independent_
- [ ] 7. **full-gate integration** — `npm test 2>&1 | node src/scripts/check-test-count.mjs` (verify pass ≥ MIN_PASS ใหม่) + `npm run lint:md` (dead-link clean) + `npm run verify:pack` (EOL check ผ่าน) — _ขึ้นกับ 1-6: ทุกอย่าง_
- [ ] 8. **Migration executable proof** (rule §5 verify เอกสาร narrative) — sandbox + intentional CRLF + renormalize + `npm run verify:pack` ผ่าน — _ขึ้นกับ 7: gate ผ่าน_
- [ ] 9. **(optional) Windows CI ad-hoc verify** — ถ้าไม่มี Windows dev → trigger `windows-latest` workflow ad-hoc (Infra suggestion #4) — _ขึ้นกับ 7: gate ผ่าน_

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- ไฟล์/โมดูล:
  - `package.json` (version field only — ไม่แตะ field อื่น)
  - `src/scripts/check-test-count.mjs` (`MIN_PASS` const)
  - `CHANGELOG.md` (เติมวันที่ + Migration section — ไม่แก้ entries ของ Slice B)
  - `docs/infra.md` (เพิ่ม Runbook section)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] `package.json` `version` = `"0.29.1"` (SemVer patch)
- [ ] `MIN_PASS` bumped ตามสูตร + comment ระบุที่มา (เช่น `MIN_PASS = 190 — slice A (+4 verify-pack) + slice B (+1 installer) → N=197; headroom 5; snap ลงหลักสิบ`)
- [ ] `CHANGELOG.md` `## [0.29.1]` มีวันที่ + entries `Fixed` ของ Slice B ครบ + `Migration` section ที่ล่างสุด ตาม text ที่ lock ใน design.md §Impact (commit/stash warning + threshold 2026-07-14 + renormalize command)
- [ ] `docs/infra.md` มี `## Runbook — \`verify:pack\` gate failure` section + error categories ครบ + วิธีแก้
- [ ] **ก่อน bump MIN_PASS**: อ่านค่าปัจจุบันจากไฟล์ (config-protection)
- [ ] `npm test 2>&1 | node src/scripts/check-test-count.mjs` → exit 0 + pass ≥ MIN_PASS ใหม่
- [ ] `npm run lint:md` → exit 0 (link ทุก link resolve)
- [ ] `npm run verify:pack` → exit 0 (EOL check ผ่าน)
- [ ] Migration executable proof: sandbox test + intentional CRLF + renormalize + verify:pack ผ่าน
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`
- [ ] **RED proof**: revert version bump → CHANGELOG/version mismatch; restore → เขียว

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`