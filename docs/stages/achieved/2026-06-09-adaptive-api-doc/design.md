# Design (How) — Adaptive API documentation (OpenAPI 3.1)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบด้วย lens `.warnyin/workflow/roles/sa.md` — change ประเภท **docs/playbook** (ไม่มี runtime layer UI/API/data) → "slice" = stage ของ lifecycle ที่ capability ตัดผ่าน

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` (payload `src/.warnyin/workflow/`) — เป็น change ระดับ playbook กลาง ไม่แตะ `src/bin/cli.mjs`
- **แนวทางหลัก:** capability doc กลาง **หนึ่งไฟล์** (`api-doc.md`) เป็น single source ของ detect-logic + modes + per-stage behavior; แต่ละ stage playbook **ชี้กลับ** (pointer บาง) ไม่ duplicate — pattern เดียวกับ `explore.md`/`next.md`/`codemap.md` (capability doc) และ skill-adapter convention
- **adaptive = detect-in-playbook:** stage ตรวจ signal เองทุก topic (ไม่ใช่ description-trigger ของ skill) → ทำงานได้ทุก harness (Claude/Codex/Antigravity)

## 2. Vertical slices
> change docs/playbook — "layer" ที่ slice ตัดผ่าน = stage ของ workflow (DESIGN/VERIFY/SHIP) + adapter
> capability core เป็นสมองร่วม (ตัดทุก stage) → 1 task; integration เชื่อม core เข้า lifecycle → 1 task

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน | → task |
|---|---|---|---|
| 1 | **capability core** — `api-doc.md`: นิยาม auto-detect, 3 mode, per-stage behavior, tooling (reference), artifact location | นิยามกลาง (ใช้ทั้ง 3 stage) | `tasks/capability-core/` |
| 2 | **stage integration** — hook `design.md`/`verify.md`/`ship.md` + adapter `roles/README.md`/`workflow/README.md` + CHANGELOG | DESIGN · VERIFY · SHIP · docs adapter | `tasks/stage-integration/` |

## 3. Data model / schema
- ไม่มี runtime entity. **artifact ใหม่:**
  - ระหว่างงาน: `docs/stages/<slug>/openapi.yaml` (OpenAPI 3.1) — optional เฉพาะ topic ที่แตะ REST API
  - ถาวร (หลัง SHIP): `docs/techstack/<component>/openapi.yaml` (living API contract — merge ตาม delta)

## 4. Interface / contract
- **capability ↔ stage:** stage playbook อ้าง `.warnyin/workflow/api-doc.md` เป็น pointer — เรียกใช้ §2 (detect), §4 (per-stage behavior)
- **OpenAPI 3.1:** มาตรฐานกลาง — `info`/`servers`/`paths`/`components.{schemas,securitySchemes}`, `$ref` reuse, `examples`, error+status+auth ครบ
- **reference ไม่ vendor:** ชี้ skill `openapi-spec-generation` (`wshobson/agents`) + เครื่องมือ (Spectral/Redocly/openapi-generator) แบบติดตั้งเอง — ไม่ก๊อปเข้า repo

## 5. Flow
- **detect-flow:** เริ่ม stage → ตรวจ signal (`api-doc.md` §2: techstack/route/annotation/API task/endpoint change) → ใช่ = เข้าโหมด API-doc · ไม่ใช่ = ข้ามเงียบ · คลุมเครือ = ถาม user (ห้ามเดา)
- **lifecycle-flow:** DESIGN ผลิต `openapi.yaml` (design-first/code-first/hybrid) → BUILD implement ตาม contract → VERIFY ยืนยันโค้ดจริงตรง contract (regen+diff หรือยิง request จริง) → SHIP promote/merge เข้า `docs/techstack/<component>/openapi.yaml`

## 6. ผลกระทบต่อระบบเดิม
- เพิ่ม gate item ใหม่ใน 3 stage — **ทุกข้อ conditional (N/A เมื่อไม่ใช่ REST API)** → topic ที่ไม่ใช่ backend ไม่ถูก block (backward compatible)
- `design.md` §6 "API task → API SPEC" เดิม → **ขยายในที่เดิม** (unify-in-place): spec.md ของ API task ชี้มาที่ `openapi.yaml` ไม่เขียน schema ซ้ำ — ไม่สร้างกลไกขนาน
- ไม่แตะ installer/test/packaging logic → `npm test` (53) ต้องยังเขียว

## 7. Dependency ระหว่าง slice/task
```
wave 1: capability-core ──▶ wave 2: stage-integration
```
> **hard dependency (2 wave แยกชัด — ห้าม parallel):** task-2 (hook) อ้าง **เลข section ของ `api-doc.md`** (`§2` detect, `§4` per-stage) ที่ task-1 สร้าง → BUILD ต้องจัด task-1 เป็น wave 1 ให้เสร็จก่อน task-2 (wave 2); ถ้า task-1 จัดเรียง section ต่างจากที่ design ร่าง → ต้องอัปเดตเลขใน hook ของ task-2 ให้ตรง (กัน silent broken pointer)

## 8. Test strategy ระดับ design
- VERIFY เป็น **docs/playbook feature** → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, pointer resolve) ไม่ใช่พฤติกรรม AI ที่วัดไม่ได้ (ตาม `utility-skills/spec.md` convention)
- ยืนยัน: (1) `api-doc.md` มีครบทุก section, (2) แต่ละ stage มี pointer ไป `api-doc.md` **ในจุดที่ stage เรียกใช้จริง** (design §6/gate, verify §4/gate, ship process/gate) ไม่ใช่ comment ลอย, (3) gate item เป็น conditional (N/A เมื่อไม่ใช่ REST API), (4) tool-agnostic (ไม่มี model-tier ฝังเป็น guidance — ยกเว้น header callout), (5) reference ไม่ vendor (ไม่มีโฟลเดอร์ `openapi-spec-generation` ใน `src/.claude/skills/`), (6) unify-in-place (design.md §6 ชี้ spec.md → openapi.yaml), (7) `npm test` ยังเขียว 53
- **★ section-pointer integrity (Tech Lead #3):** VERIFY ต้องเช็คว่า **เลข section ที่ hook อ้าง** (`api-doc.md §2`/`§4`) **มีอยู่จริง** ใน `api-doc.md` — กัน silent broken pointer ตอน reorganize
- **ขอบเขต — ไม่ verify runtime behavior:** logic contract-validation (code-first regen→diff, ยิง request จริง) เป็น behavior ที่ trigger ใน **โปรเจกต์ปลายทาง** ไม่ใช่ใน topic นี้ (no runtime) → รอบ VERIFY ของ topic นี้ตรวจเฉพาะว่า **คำสั่งถูก wire ใน payload** ที่ `src/.warnyin/...`; feature spec `docs/features/api-doc/spec.md` **ยังไม่มี** (SHIP สร้างจาก ADDED) → ไม่ assert path นั้นในรอบ VERIFY

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> feature ใหม่ `api-doc` — ยังไม่มี `docs/features/api-doc/spec.md` → SHIP สร้างใหม่จาก ADDED ทั้งก้อน (feature naming ยืนยันตอน SHIP)
> ค่าใน scenario เป็น observable artifact (path/section/string) ตาม convention ของ feature ประเภท playbook

### ADDED

#### Requirement: capability doc กลางของ API-doc (→ feature: api-doc)
มีไฟล์ playbook กลาง `src/.warnyin/workflow/api-doc.md` ที่เป็น single source ของ adaptive API documentation

##### Scenario: ไฟล์ capability มีอยู่ + ครอบ section หลัก
- GIVEN ไดเรกทอรี `src/.warnyin/workflow/`
- WHEN เปิด `api-doc.md`
- THEN มีไฟล์นี้ และมี section "Auto-detect", "เลือกโหมด" (design-first/code-first/hybrid), "บทบาทต่อ stage" (DESIGN/VERIFY/SHIP)

#### Requirement: auto-detect แบบ adaptive (→ feature: api-doc)
capability ระบุสัญญาณตรวจว่า topic แตะ backend/REST API ไหม และระบุชัดว่าไม่ใช่ → ข้าม

##### Scenario: §Auto-detect มีสัญญาณ + ทางออกเมื่อไม่ใช่
- GIVEN section "Auto-detect" ใน `api-doc.md`
- WHEN อ่านเนื้อหา
- THEN ระบุสัญญาณ (เช่น techstack เป็น HTTP service, route ในโค้ด, annotation, API task, endpoint change) และระบุว่า "ไม่ใช่ REST API → ข้าม"

#### Requirement: stage hook ชี้ capability ไม่ duplicate (→ feature: api-doc)
playbook `design.md`/`verify.md`/`ship.md` แต่ละไฟล์มี pointer ไป `.warnyin/workflow/api-doc.md` แทนการ copy logic

##### Scenario: สาม stage มี pointer ไป api-doc
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/{design,verify,ship}.md`
- WHEN ค้นข้อความที่อ้าง `api-doc.md`
- THEN ทั้งสามไฟล์มีสตริง `.warnyin/workflow/api-doc.md` อย่างน้อยไฟล์ละหนึ่งครั้ง

#### Requirement: gate item เป็น conditional (N/A เมื่อไม่ใช่ REST API) (→ feature: api-doc)
gate ของ 3 stage มีข้อ API contract ที่ระบุว่าใช้เฉพาะ topic ที่แตะ REST API

##### Scenario: gate item ระบุเงื่อนไข
- GIVEN section Gate ของ `design.md`/`verify.md`/`ship.md`
- WHEN อ่านข้อ gate ที่เกี่ยวกับ API contract/openapi
- THEN ข้อความระบุเงื่อนไข "ถ้าแตะ REST API" หรือ "N/A" สำหรับ topic ที่ไม่ใช่ backend

#### Requirement: reference ไม่ vendor (→ feature: api-doc)
อ้างอิง skill ภายนอก + เครื่องมือแบบติดตั้งเอง โดยไม่ก๊อป SKILL.md/template เข้า repo

##### Scenario: roles README มีแถว reference + ไม่มี vendored skill
- GIVEN `src/.warnyin/workflow/roles/README.md` section "Skill เสริม"
- WHEN อ่านตาราง + ตรวจไดเรกทอรี `src/.claude/skills/`
- THEN มีแถว `openapi-spec-generation` ที่ชี้ที่มา `wshobson/agents` และไดเรกทอรี `src/.claude/skills/` **ไม่มี** โฟลเดอร์ `openapi-spec-generation`

#### Requirement: tool-agnostic — ไม่ผูก model-tier ของ harness (→ feature: api-doc)
`api-doc.md` ไม่ฝัง guidance ที่อ้างชื่อรุ่น/tier ของ AI model เจาะจง (payload-guidance generic ตาม `docs/rule.md` §1.9); header callout ที่ระบุชื่อ harness product (Claude Code/Codex/Antigravity) เป็น convention เดียวกับทุก stage playbook ไม่นับเป็นการผูก

##### Scenario: ไม่มีชื่อ model-tier ฝังเป็น guidance
- GIVEN เนื้อหา `src/.warnyin/workflow/api-doc.md` ไม่รวมบรรทัด header callout "AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน ..."
- WHEN ค้นชื่อ model-tier/รุ่นที่ใช้เป็นคำสั่ง/guidance (เช่น Opus, Sonnet, GPT-4, Gemini-Pro)
- THEN ไม่พบ — guidance ใช้ vocab generic หรือมาตรฐาน domain (tooling เช่น Spectral/FastAPI/tsoa อนุญาต เพราะไม่ใช่ harness model)

#### Requirement: spec.md ของ API task ชี้ openapi.yaml ไม่เขียน schema ซ้ำ — unify-in-place (→ feature: api-doc)
`design.md` §6 (API task → API SPEC) ถูกขยาย **ในที่เดิม** ให้ spec.md ชี้มาที่ `openapi.yaml` เป็น single source ไม่สร้างกลไกขนาน

##### Scenario: design.md §6 มีคำสั่ง single-source
- GIVEN section "6. spec.md — กำหนด spec ตามชนิดของ task" ใน `src/.warnyin/workflow/stages/design.md`
- WHEN อ่านข้อ "API task"
- THEN มีถ้อยคำสั่งให้ผลิต `openapi.yaml` และให้ `spec.md` "ชี้มาที่ openapi.yaml" โดยไม่เขียน schema ซ้ำ

---

## 10. Design review (panel 2026-06-09)

fan-out reviewer 5 role ขนาน (read-only) รีวิว proposal+design เทียบ implementation จริง — **ไม่มี blocker จากทุก role**; รับ suggestion ที่มีค่า/low-risk เข้า design+implementation, ที่เหลือ track/defer

| Role | ผล | Suggestion ที่รับ → ทำที่ไหน |
|---|---|---|
| **SA** | ✅ no blocker | component resolution (หลาย/ยังไม่มี → ถาม) → `api-doc.md` §6; เพิ่ม scenario unify-in-place → §9 |
| **Tech Lead** | ✅ no blocker | 2-wave hard dependency → §7; section-pointer integrity → §8; canonical-copy + CHANGELOG acceptance → `tasks/stage-integration/task.md` |
| **QA** | ✅ no blocker | แก้ scenario tool-agnostic กัน false-fail (exclude header) → §9; เพิ่ม scenario single-source → §9; ระบุขอบเขต no-runtime-verify → §8 |
| **Security** | ✅ no blocker | secret hygiene scrub `openapi.yaml` → `api-doc.md` §5; runtime-security/egress note → `api-doc.md` §4 VERIFY; เตือน third-party ก่อนติดตั้ง → `roles/README.md` |
| **Infra** | ✅ no blocker | optional tooling = ของปลายทาง คง zero-dep → **defer ไป SHIP** (แก้ `docs/infra.md` ตอน promote — DESIGN ห้ามแตะ docs/ กลาง) |

**ยืนยัน:** `api-doc.md` ติด tarball (`src/.warnyin/` allowlist) + `--update` ส่งถึงผู้ใช้ (CORE copyTree) — Infra ตรวจ `cli.mjs`/`verify-pack.mjs` แล้ว; reference ไม่ vendor (ไม่มี vendored skill ใน `src/.claude/skills/`) — SA/Security/QA ยืนยันตรงกัน
