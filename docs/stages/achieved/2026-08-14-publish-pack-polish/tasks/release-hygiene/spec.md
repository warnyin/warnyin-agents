# Spec — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`infra` (release metadata + repo-level gate) + `docs` (CHANGELOG finalize + docs/infra.md runbook) — ไม่ใช่ API/UX

---

## 2. API SPEC
N/A — repo-level gate

## 3. UX/UI SPEC
N/A — ไม่มี UI surface

## 4. Data-flow
```
หลัง integrate Slice A + Slice B (ผ่าน main loop)
  ├─ npm test | node src/scripts/check-test-count.mjs (full suite)
  ├─ อ่าน MIN_PASS ปัจจุบันจาก src/scripts/check-test-count.mjs
  ├─ อ่าน pass count จริง → N → คำนวณ MIN_PASS = floor((N - 5) / 10) × 10
  ├─ เขียน MIN_PASS ใหม่ใน check-test-count.mjs
  ├─ bump package.json version: 0.29.0 → 0.29.1
  ├─ เติมวันที่หลัง ## [0.29.1] ใน CHANGELOG.md
  ├─ เขียน Migration section (text ที่ lock ใน design §Impact)
  ├─ เขียน runbook section ใน docs/infra.md
  ├─ npm run lint:md (dead-link gate)
  └─ npm run verify:pack (pack gate — ต้องผ่าน EOL check ของ slice A)
```

## 5. User-flow
- **maintainer** รัน release: ดู `npm test` pass count + bump version + finalize CHANGELOG + run gates
- **contributor คนใหม่** เจอ `verify:pack` fail → ดู runbook ใน `docs/infra.md` → รู้วิธีแก้ตาม error category
- **user ที่อัปเกรด 0.27.x → 0.29.1** (checkout เก่าก่อน `.gitattributes`) → ดู CHANGELOG Migration section → รัน renormalize command

## 6. Persona
- **maintainer** — release flow (commit + tag + publish)
- **contributor ใหม่** — debug gate fail (ครั้งแรกที่เจอ EOL/path error category ใหม่)
- **user ที่อัปเกรด** — dev ที่ checkout เก่าก่อน 0.27.1 (2026-07-14) ที่ยังไม่ renormalize

## 7. Test-flow
> ทดสอบ/ยืนยันความถูกต้องยังไง (เคสที่ต้องผ่าน, edge case)

### Version bump
- [ ] `package.json` field `version` = `"0.29.1"`
- [ ] `git diff` ของ `package.json` มีแค่ version line เปลี่ยน (ไม่กระทบ field อื่น)

### MIN_PASS bump (config-protection)
- [ ] **self-check ก่อน**: อ่าน `MIN_PASS` ปัจจุบันจาก `src/scripts/check-test-count.mjs` (ตอนนี้ = 180) — verify ด้วย `grep` source
- [ ] รัน `npm test 2>&1 | node src/scripts/check-test-count.mjs` (ก่อน bump) → assert ผ่าน + จด pass count
- [ ] bump `MIN_PASS` ใน `src/scripts/check-test-count.mjs` ตามสูตร `floor((N - 5) / 10) × 10` (สูตรเดิมจาก comment บรรทัด 8)
- [ ] รัน `npm test 2>&1 | node src/scripts/check-test-count.mjs` (หลัง bump) → assert ผ่าน
- [ ] RED proof: revert MIN_PASS ไปเดิม (180) → assert ถ้า pass count ต่ำกว่า 180 = gate แดง

### CHANGELOG finalize
- [ ] Slice C **ไม่สร้าง/ย้าย entry ของ Slice B** (TL blocker #2) — entry `### Fixed` ของ cli-help-wording ต้องคงอยู่ (สร้างโดย Slice B)
- [ ] เติมวันที่ format `- YYYY-MM-DD` หลัง `## [0.29.1]`
- [ ] เขียน `### Migration` section ตาม text ที่ lock ใน design §Impact (commit/stash warning + threshold 2026-07-14 + renormalize command)

### docs/infra.md runbook
- [ ] เพิ่ม section `## Runbook — `verify:pack` gate failure`
- [ ] ระบุ error categories ทั้งหมด: denylist/allowlist/eol/path/R1/R2/tripwire/stamp
- [ ] แต่ละ category: อาการ + วิธีแก้ (เช่น `eol:` → renormalize; `path: absolute` → ตรวจ `npm pack --json` ว่ามี absolute path ไหม)
- [ ] lint:md ผ่าน (link ต้อง resolve ไม่ dead)

### Full-gate integration (rule §1 release-hygiene)
- [ ] `npm test 2>&1 | node src/scripts/check-test-count.mjs` → exit 0 + pass ≥ MIN_PASS ใหม่
- [ ] `npm run lint:md` → exit 0 (no dead link)
- [ ] `npm run verify:pack` → exit 0 (EOL check ผ่าน — slice A ทำงาน)
- [ ] **Migration executable proof** (rule §5 verify เอกสาร narrative): sandbox + intentional CRLF + renormalize + `npm run verify:pack` ผ่าน
- [ ] **Windows manual verify** (Infra #4): document ใน CHANGELOG / docs/infra.md ว่า maintainer Windows dev ควรรัน `npm run verify:pack` ใน clean checkout ก่อน release flag — ถ้าไม่มี Windows dev → GitHub Actions `windows-latest` ad-hoc

### RED proof (falsifiability)
- [ ] revert version bump → CHANGELOG/check-test-count/package.json mismatch → verify CI fail
- [ ] revert Migration section → docs/infra.md link broken → lint:md fail
- [ ] restore → เขียว