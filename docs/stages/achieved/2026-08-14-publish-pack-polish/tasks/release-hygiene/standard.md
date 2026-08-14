# Standard — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack)
> อ้างอิง `docs/techstack/installer/standard.md` — ข้อไหนเกี่ยวกับ task นี้
- **CHANGELOG** (`docs/techstack/installer/standard.md`): Keep a Changelog format — `## [version]` + วันที่ + กลุ่ม Added/Changed/Removed/Fixed
- **SemVer**: 0.29.1 = patch (fix/improvement ไม่ breaking/feature ใหม่)
- **pass-count gate** (`docs/techstack/installer/standard.md` + `docs/techstack/installer/test.md`): `check-test-count.mjs` parse summary ของ `node --test` → fail ถ้า `pass < MIN_PASS` (anti-false-green)

## 2. Pattern การเขียนโค้ดของ task นี้
- **โครงสร้าง/naming:**
  - `package.json` field `version` (semver string) — ไม่แตะ field อื่น
  - `src/scripts/check-test-count.mjs` const `MIN_PASS` (number) — ค่าตามสูตร
  - `CHANGELOG.md` section: `## [0.29.1] - YYYY-MM-DD` + `### Migration` (ล่างสุดของ section) + entry groups (Fixed จาก slice B + Migration จาก slice C)
  - `docs/infra.md` section: `## Runbook — \`verify:pack\` gate failure` (มี existing sections เป็นบรรทัดบน)
- **error handling:** ไม่มี (metadata/gate เท่านั้น)
- **การจัดการ state/data:**
  - **อ่าน MIN_PASS ปัจจับันจากไฟล์ก่อน bump** (config-protection — rule §1) — pattern: `grep -n MIN_PASS src/scripts/check-test-count.mjs`
  - **คำนวณ MIN_PASS ใหม่จาก pass count จริงหลัง integrate** (ไม่ derive จากตัวเลขที่คาด) — pattern: `npm test | tee /tmp/test-summary.txt` + grep pass count
  - **CHANGELOG ordering** (TL #5): Slice B entries ก่อน → Slice C Migration ท้ายสุด (Migration มักอยู่ล่างสุดของ section)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **`check-test-count.mjs`**: existing — อ่าน summary + assert pass ≥ MIN_PASS + `pass === tests`
- **`MIN_PASS` formula** (existing comment `check-test-count.mjs:8`): `floor((N - 5) / 10) × 10` (headroom 5 + snap ลงหลักสิบ)
- **`lint:md`** (`src/scripts/lint-md.mjs`): dead-link gate — exclude `src/.warnyin/template/` + `docs/stages/achieved/` (rule §1)
- **`verify-pack.mjs`**: gate ก่อน publish — pure `checkFiles(files)` + slice A EOL check
- **`docs/infra.md`** template (existing): มี sections "วิธีรัน local" + "Env vars สำคัญ" → เพิ่ม Runbook section ต่อท้าย
- **`CHANGELOG.md` template** (existing): มี Migration guide section บนสุด (สำหรับ legacy upgrade) → เพิ่ม section `## [0.29.1]` ระหว่าง Migration guide กับ `[0.29.0]`

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
> pattern ใหม่ที่ task นี้แนะนำ — ถ้าควรเป็นมาตรฐานกลาง ให้ note ใน `rule.md` (รอ SHIP อัปเดต standard กลาง)
- **release-hygiene gate = executable verify** — ทุก release ต้อง run full-gate (test + lint:md + verify:pack) + log pass count เพื่อ bump MIN_PASS แบบ evidence-based (ไม่ derive จากคาด)
- **Migration section executable proof** (rule §5) — CHANGELOG migration note ทุก section ต้องผ่าน sandbox test (คำสั่งทำงานจริง) — ไม่ใช่แค่เขียนตามจำ
- **runbook section ใน infra docs** — gate ใหม่ทุกครั้งควรมี runbook section อธิบาย error category + วิธีแก้ — note ใน rule.md
- **CI windows-latest ad-hoc verify** — ถ้า maintainer ไม่มี Windows dev, gate ที่ต้อง manual verify บน Windows → CI workflow ad-hoc บน `windows-latest` (Infra suggestion #4) — note ใน rule.md