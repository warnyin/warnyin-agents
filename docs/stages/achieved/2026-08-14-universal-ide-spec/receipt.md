# Receipt — universal-ide-spec

> Fast-tier receipt · template: `src/.warnyin/template/stages/receipt.md`
> ข้าม DESIGN/BUILD/VERIFY/SHIP full ceremony · code-first path (`triage.md` fast-track skip-list)

## §1 Meta
- **tier:** `fast`
- **date:** 2026-08-14
- **slug:** `universal-ide-spec`
- **scope:** แปลง `docs/features/universal-ide/spec.md` จากตาราง `R1-R9` + section "Scenarios (test-flow)" แยก → รูปแบบ `## Requirement:` + `### Scenario:` (per canonical contract ของ `validate-topic.mjs C5`)
- **derived from:** backlog #5 (validate-topic C5 ✖)
- **hard-floor check:** ผ่าน (no auth/migration/secret/public-API/security-sensitive touch)

## §2 Acceptance (สิ่งที่ส่งมอบ)
1. ✅ `docs/features/universal-ide/spec.md` แปลงเป็น 9 Requirement blocks (R1-R9 เดิม → 9 sections แยก)
2. ✅ แต่ละ Requirement มี ≥1 Scenario (รวม 12 Scenarios) — ครอบเดิม T1-project-basic · T1-idempotent · T1-existing-clinerules · T1-update · T1-dry-run · T1-global + เพิ่ม split Cursor/Windsurf/Copilot/Cline/Gemini scenarios
3. ✅ ทุก Scenario มี GIVEN + WHEN + THEN ครบ (C5 enforce)
4. ✅ Side fix: `docs/features/installer-version-stamp/spec.md` Scenarios "Windows dev" + "mac/linux" ขาด WHEN → เพิ่ม WHEN clause (จับตอน cross-cutting validate)
5. ✅ `validate-topic.mjs C5` pass ทุก feature (17 features ทั้งหมด)
6. ✅ Template paths section คงไว้ (informational, ไม่กระทบ C5)

## §3 Test result
- `validate-topic.mjs` (cross-cutting feature spec check): ✓ pass ทุก 17 features
- `npm run lint:md`: ✓ pass (132 ไฟล์, 110 ลิงก์)
- ไม่รัน `npm test` (pure doc change — no code change → test suite ไม่กระทบ)

## §4 Verify (executable proof)
- `node .warnyin/workflow/scripts/validate-topic.mjs` → ก่อนแก้ ✖ 2 issues (universal-ide C5 fail + installer-version-stamp WHEN missing) · หลังแก้ ✓ pass
- `node -e "...checkFeatureSpec(...)"` เรียกตรงทุก `docs/features/*/spec.md` → 0 issues

## §5 Learned-rule (promote candidates)

ไม่มี learned-rule ใหม่ — เป็น mechanical format conversion ตาม contract เดิม (`validate-topic.mjs C5` design §4 step 6)

## §6 Archive
- `docs/features/universal-ide/spec.md` (modified in-place — ไม่ archive เพราะเป็น living feature spec ไม่ใช่ topic artifact)
- `docs/stages/achieved/2026-08-14-universal-ide-spec/receipt.md` (this file)

## §7 Backlog impact
- **#5** (universal-ide spec format) → `dropped` (ทำเสร็จ 2026-08-14)
