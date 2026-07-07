# Task — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `release-hygiene` |
| **Slice อ้างอิง** | `design.md` slice #6 |
| **Component** | `installer` (repo นี้เอง) |
| **Model tier** | `cheap` |
| **สถานะ** | `✅ build สำเร็จ` |

## 1. เป้าหมายของ task (vertical slice)

ปิด release hygiene ของ change ทั้งชุด `build-lean` — สรุปทุก user-facing change ลง `CHANGELOG.md` ตามรูปแบบเดิม + bump version + รัน gate สุดท้ายทั้งชุดบน build branch ที่ integrate ครบทุก slice แล้ว เพื่อยืนยันว่า release พร้อม publish

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- ต้องทำหลัง: **ทุก task อื่น** — `tasks/fast-track-receipt`, `tasks/build-stage-lean`, `tasks/verify-ship-lean`, `tasks/loop-tuning-extract`, `tasks/validator-receipt` (wave 3 ท้ายสุด — CHANGELOG ต้องสรุปจากผลจริงของทุก slice + gate `lint:md` ต้องเห็นไฟล์/pointer ครบหลัง integrate ตาม design §7)
- ปลดล็อกให้: — (task สุดท้ายของ topic; ปลดล็อก VERIFY/SHIP + `npm publish`)
- ส่ง output ต่อ: CHANGELOG entry + version ใหม่ + รายงานผล gate 4 ตัว (ให้ VERIFY ใช้เป็น baseline)

## 3. Sub-tasks

- [x] 1. **`CHANGELOG.md`** — _ผลลัพธ์: entry ใหม่ตามรูปแบบเดิม (Keep a Changelog, หัวข้อ `## [x.y.z] - YYYY-MM-DD` + `### Added`/`### Changed`)_ สรุป user-facing changes ของ change ทั้งชุด (อ่านจากผล diff จริงของ wave 1-2 บน build branch ไม่ใช่เดาจาก design):
  - fast-track = **code-first + receipt** — pre-flight สร้าง `receipt.md` ก่อนแตะโค้ด → main loop แก้เอง (ไม่เรียก build-wave/worktree) → เติมผลลง receipt → ship-lite + hard-floor scan (template ใหม่ `.warnyin/template/stages/receipt.md`)
  - **worktree เฉพาะ wave ที่ขนานจริง** — wave ≥2 task = worktree ต่อ task (เดิม); wave เดี่ยว = `isolate:false` shared tree บน build branch
  - **prompt ของ build agent lean** — เหลือ role card + 4 ไฟล์ task + techstack rule.md ของ component ที่แตะ (ตัด playbook/design/proposal/techstack แบบเหมา)
  - **caps ความยาวเอกสารตาม tier** (`triage.md §2D`) — fast receipt ≤40 บรรทัด · standard proposal ≤60 / design ≤120 · large judgment
  - **UX-detect exclusion precedence** — docs-only/config-only/tooling เช็คก่อน signals → ไม่ trigger wireframe
  - **`workflow/loop-tuning.md` ใหม่** (orchestrator-only) — ★ theory ย้ายออกจาก `build.md`/`verify.md` เหลือ pointer + report requirement
  - **validator fast-mode** — `validate-topic.mjs` รู้จัก topic ที่มี receipt filled (ข้าม C1-C4, แสดง `fast-track`) + mixed-state ⚠ + `next.md` รู้จัก receipt
- [x] 2. **`package.json`** — _ขึ้นกับ 1 (เลข version ต้องตรงหัว entry):_ bump → **`0.24.0`** (**minor** — มี behavior ใหม่ backward-compatible ไม่ breaking)
  - **★ precondition (dry-run พบ):** `0.22.0`/`0.23.0` ถูกใช้แล้วบน `origin/release/0.23.0` (publish npm แล้ว — main ยังค้างที่ 0.21.0 เฉพาะ CHANGELOG/version parity ส่วนเนื้อโค้ด learning-loop-tuning อยู่บน main แล้ว) → **ก่อน bump ต้อง merge `origin/release/0.23.0` เข้า build branch** เพื่อได้ CHANGELOG entry `[0.22.0]`/`[0.23.0]` แล้วค่อย bump `0.23.0` → `0.24.0`; entry ใหม่ของ sub-task 1 แทรก**เหนือ `[0.23.0]`** (ใต้ `[Unreleased]`)
- [x] 3. **รัน gate สุดท้ายทั้งชุด** บน build branch ที่ integrate ทุก slice ครบแล้ว — _ขึ้นกับ 1+2:_ `npm test` · `npm run verify:pack` · `npm run lint:md` (จุดนี้ pointer markdown → `../loop-tuning.md` จากทุกไฟล์ต้อง resolve แล้ว — dead-link = integration failure จริง ไม่ใช่ false-negative ข้าม wave อีกต่อไป) · `npm test 2>&1 | node src/scripts/check-test-count.mjs` (pass ≥ MIN_PASS=9, fail=0, pass=tests) — **รายงานผลทั้ง 4 gate** ในรายงาน build (ตัวเลข pass/tests + exit code)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

- `CHANGELOG.md` (root — tracked, ไม่ใช่ dogfood)
- `package.json` (root — tracked, field `version` เท่านั้น)

**ห้ามแตะ:** `src/**` (งานของ slice 1-5 — task นี้อ่านอย่างเดียวเพื่อสรุป/รัน gate), root dogfood (`.warnyin/`, `.claude/` — gitignored), `docs/**`; **ห้ามแก้ config/test เพื่อให้ gate ผ่าน** — gate แดง = รายงานตามจริง ไม่ใช่หน้าที่ task นี้แก้โค้ด slice อื่น

## 5. Acceptance criteria

- [x] CHANGELOG entry ครบทุก user-facing change (7 ข้อใน sub-task 1) — รูปแบบตรงไฟล์เดิม (heading + วันที่ + Added/Changed) และตรงกับ diff จริงบน build branch
- [x] `package.json` version = `0.24.0` ตรงกับหัว entry ใน CHANGELOG · CHANGELOG มี `[0.22.0]`/`[0.23.0]` จาก release branch ครบ (ไม่มีเลขซ้ำ/ข้าม)
- [x] gate 4 ตัวเขียวหมด: `npm test` (127/127 pass) · `npm run verify:pack` (93 files) · `npm run lint:md` (145 files, 78 links) · check-test-count ≥ 9 (pass=127, fail=0) — พร้อมรายงานผล
- [x] ผ่าน test ตาม `spec.md` (test-flow)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
