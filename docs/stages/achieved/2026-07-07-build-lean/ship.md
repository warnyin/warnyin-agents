# Ship report — build-lean

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> วันที่ ship: 2026-07-08 (archive โฟลเดอร์ใช้ชื่อ `2026-07-07-build-lean` ตามที่อนุมัติ) · โค้ดอยู่ branch `build/build-lean` (merge → main จัดการนอก workflow)

## 1. Topic นี้ส่งมอบอะไร

ceremony ของ workflow สเกลตาม tier ใน 6 slice: fast tier = pre-flight receipt + code-first (ไม่ fan-out) · worktree เฉพาะ wave ที่ขนานจริง · build-agent prompt lean (มี test คุ้ม contract) · caps ขนาดเอกสารต่อ tier (`§2D`) · UX-detect exclusion precedence · loop-tuning theory ย้ายเป็น single-source (`workflow/loop-tuning.md`) — release 0.24.0 (CHANGELOG + bump ใน topic นี้เอง)

## 2. Feature ที่ปรับปรุง/สร้าง

| feature | ประเภท | สิ่งที่ merge |
|---|---|---|
| `change-sizing` | ปรับปรุง | spec: route fast ใหม่ (MODIFIED) + skip-list requirement เวอร์ชัน receipt lifecycle + caps §2D (MODIFIED) |
| `learning-loop-tuning` | ปรับปรุง | spec: theory single-source (MODIFIED×2) · feature.md: ตำแหน่ง why → `loop-tuning.md` + ไฟล์ที่เกี่ยวข้อง |
| `topic-validator` | ปรับปรุง | spec: ADDED requirement fast-track ผ่าน receipt (fast/mixed/เดิม 3 scenario) |
| `uxui-wireframe` | ปรับปรุง | spec: exclusion precedence + scenario docs-only (MODIFIED — ใช้ key จริง `UX wireframe ใน DESIGN` ตาม design note read-modify-verify) |
| `build-orchestration` | สร้าง `spec.md` | จาก ADDED×3: worktree เฉพาะ wave ขนาน · prompt lean · fast tier ไม่ผ่าน build-wave |

## 3. เอกสารกลางที่อัปเดต

| ไฟล์ | สาระ |
|---|---|
| `docs/rule.md` | R3: loop-tuning convention ข้อ (3) → single-file canonical · R4: release-hygiene = wave สุดท้าย (ต่อท้าย DAG-width) · R5: mode inference fail-safe → full checks (ขยาย #21) · R7: merge ข้ามสาย → rerun canonical grep (ต่อท้าย canonical-copy) |
| `docs/techstack/installer/rule.md` | R1: prompt ของ workflow script ต้องมี test คุ้ม contract · R2: template ระดับ stage ที่ห้ามติด whole-folder copy → นอก `[topic]/` |
| `docs/techstack/installer/test.md` | section ใหม่ "verify tier-lean playbook + receipt payload" (canonical diff คำต่อคำ · negative-grep single-source · merge-then-recheck · gate-count investigate · receipt contract · prompt lean) |
| `docs/techstack/installer/structure.md` | ไฟล์ใหม่ `workflow/loop-tuning.md` + `template/stages/receipt.md` |
| `docs/troubleshooting.md` | #26 (self-install guard เมื่อรัน test จาก src/) · #27 (adapter link depth) · #28 (merge ทับ block ที่ refactor) · facet ใน #16 (inject module-level vars เป็น parameter) |
| `docs/codemap/index.md` + `architecture.md` | build-wave (prompt lean + isolate per wave) · validate-topic (fast-mode) · triage (caps + route receipt) · `loop-tuning.md` แทน anchor เดิม · +`backlog.md` (มากับ 0.23.0) · fast-track flow ใน architecture |

## 4. Learned rules — ผลพิจารณา (user ยืนยันแล้ว)

| # | rule | ผล |
|---|---|---|
| R1 | prompt workflow script ต้องมี test คุ้ม contract | ✅ → installer/rule.md |
| R2 | template stage ห้ามติด whole-folder copy → นอก `[topic]/` | ✅ → installer/rule.md |
| R3 | loop-tuning convention ข้อ (3) → single-file canonical | ✅ → docs/rule.md (แก้ข้อเดิม) |
| R4 | release-hygiene task = wave สุดท้ายเสมอ | ✅ → docs/rule.md (ต่อ DAG-width) |
| R5 | validator mode inference fail-safe → full checks | ✅ → docs/rule.md (ขยาย #21) |
| R6 | stage hook = MODIFY in-place | ✂️ ตัด — unify-in-place (`docs/rule.md` §1) ครอบอยู่แล้ว (task เสนอแบบมีเงื่อนไขนี้เอง) |
| R7 | merge ข้ามสาย → rerun canonical/single-source grep | ✅ → docs/rule.md (ต่อ canonical-copy) |
| R8 | adapter md link นับ depth 3 ชั้น | ✂️ ตัด — incident-level, KB #27 ครอบพอ |

## 5. หมายเหตุ

- **Spec delta merge:** MODIFIED key ทุกตัว match requirement จริง ยกเว้น `uxui-wireframe` ที่ design ระบุล่วงหน้าให้ใช้ key จริง (`UX wireframe ใน DESIGN`) ด้วย read-modify-verify — ไม่มีเคส STOP
- **สิ่งที่ยังไม่ทำ (defer ตาม design):** เพิ่ม mention fast-track ใน `AGENTS.md` — backlog (adapter บางชี้ playbook อยู่แล้ว)
- **npm publish:** version 0.24.0 พร้อมบน build branch — publish + `setup:dogfood` sync root เป็นขั้นตอน release นอก workflow
