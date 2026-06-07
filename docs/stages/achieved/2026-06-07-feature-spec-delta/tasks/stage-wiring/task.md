# Task — stage-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `stage-wiring` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | workflow core (playbook design/verify/ship) + stage template + adapter command + CHANGELOG |
| **สถานะ** | `build เสร็จ ✅ (test 26/26 + lint:md + verify:pack เขียว)` |

## 1. เป้าหมายของ task (vertical slice)
wiring วงจร Spec delta ครบ 3 stage — DESIGN เขียน delta ได้ / VERIFY ใช้ baseline ได้ / SHIP merge ได้ ทันทีที่ติดตั้ง — โดยแก้ **10 ไฟล์** (3 playbook + 2 stage template + workflow README 1 บรรทัด + 3 command mirror + CHANGELOG) ตาม design §3 ด้วย **canonical wording copy จาก design §4.2–§4.4 เท่านั้น** และทุกจุดเป็น **unify-in-place** (ขยายของเดิม ไม่เพิ่มกลไกขนาน)

## 2. Dependency
- **ต้องทำหลัง:** `tasks/spec-template` — wording merge อ้าง path template `src/.warnyin/template/docs/features/[feature-name]/spec.md` ที่ task นั้นสร้าง (อ้างถึงเฉยๆ ไม่แก้ไฟล์นั้น)
- **ขนานกับ:** `tasks/dogfood-specs` ได้ (ไม่ชนไฟล์ — dogfood แตะ `docs/features/`, ใบนี้แตะ `src/` + CHANGELOG)
- **ส่ง output ต่อ:** วงจร 3 stage ที่ wiring แล้ว → VERIFY ของ topic นี้ใช้ merge-trace + consistency check

## 3. Sub-tasks (ระบุ § ต่อไฟล์ ตาม design §3 — copy wording จาก design §4)
- [x] 1. `src/.warnyin/workflow/stages/design.md` — **§2 input** +ข้ออ่าน `docs/features/<name>/spec.md` ของ feature ที่ change แตะ · **§4 step 5** ขยายของเดิม: design.md ครอบ Spec delta ด้วย · **§5 ตาราง design.md** +คำ Spec delta · **§8 gate** +item "Spec delta ครบ หรือระบุ 'ไม่มี delta'" _(spec §2.3 / design §4.4)_
- [x] 2. `src/.warnyin/workflow/stages/verify.md` — **§2 input** +ข้อ feature spec = regression baseline (ดูจาก Spec delta ใน design.md) · **§3 ขยาย principle 1 เดิม** (+"และพฤติกรรมเดิมจาก feature spec — scenario เดิม = regression case, delta = test case ใหม่") **ไม่เพิ่ม principle ใหม่** · **§4 step 1-2** อ่าน baseline + วางแผนเทสจากทั้งคู่ · **§6 gate** +item regression ตาม baseline ของ feature ที่แตะ _(spec §2.3 / design §4.4)_
- [x] 3. `src/.warnyin/workflow/stages/ship.md` — **§3 ขยาย principle 5 เดิม** (delta: พฤติกรรมจริงต่างจาก delta → อัปเดต delta ก่อน merge) · **§4 ขยาย step 5.1 เดิม** (`docs/features/` จาก "feature.md + business.md" → + `spec.md` merge ตามกติกา) **ไม่เพิ่ม sub-step ใหม่** · **§5 ตาราง output** +spec.md · **§6 gate** +item delta merge แล้ว/MODIFIED-REMOVED match จริง (key ไม่เจอ→STOP) _(spec §2.2 / design §4.3)_
- [x] 4. `src/.warnyin/template/stages/[topic]/design.md` — **+section "9. Spec delta"** (verbatim design §4.2 / spec §2.1 รวม `[เดิมชื่อ:]`) ต่อท้ายหลัง §8
- [x] 5. `src/.warnyin/template/stages/[topic]/ship.md` — **§2 ตาราง** +แถว `docs/features/<feature-name>/spec.md` (merge delta จาก design.md)
- [x] 6. `src/.warnyin/workflow/README.md` — **บรรทัด ~59** note 1 บรรทัด: `features/[feature-name]/` มี `spec.md` (living behavior spec)
- [x] 7. `src/.claude/commands/warnyin/design.md` — mirror บาง ชี้ playbook §2/§4/§8 (Spec delta) — ไม่ duplicate logic
- [x] 8. `src/.claude/commands/warnyin/verify.md` — mirror บาง ชี้ playbook §2/§3/§4 (regression baseline จาก feature spec) — ไม่ duplicate
- [x] 9. `src/.claude/commands/warnyin/ship.md` — mirror บาง ชี้ playbook §4 step 5 (merge delta + key ไม่เจอ→STOP) — ไม่ duplicate
- [x] 10. `CHANGELOG.md` — entry `[Unreleased]` (payload change — user-facing, ตาม `docs/rule.md` §2)
- [x] 11. **consistency check** — grep canonical key (`Spec delta`, `Requirement:`, `ADDED`/`MODIFIED`/`REMOVED`, `GIVEN`/`WHEN`/`THEN`) ครบทุกไฟล์ที่แก้ + **เทียบ semantic กติกา merge ใน 3 playbook ตรง design §4.3 คำต่อคำ** (read-modify-verify + key ไม่เจอ→STOP + rename `[เดิมชื่อ:]` + stale delta re-check + union baseline)
- [x] 12. `npm test` (19) + `npm run lint:md` + `npm run verify:pack` เขียว — *ผลจริง: suite โตเป็น 26 เคส ผ่านครบ*

## 4. ขอบเขตไฟล์ที่จะแตะ (10 ไฟล์)
- **แก้:** `src/.warnyin/workflow/stages/{design,verify,ship}.md` · `src/.warnyin/template/stages/[topic]/{design,ship}.md` · `src/.warnyin/workflow/README.md` · `src/.claude/commands/warnyin/{design,verify,ship}.md` · `CHANGELOG.md`
- **ห้ามแตะ:** `src/bin/cli.mjs` · `src/tests/` · docs/ กลาง (`docs/rule.md`/`docs/techstack/`/`docs/features/`) · template feature `spec.md` (`src/.warnyin/template/docs/features/[feature-name]/spec.md` — ของ task `spec-template`) · root dogfood (`.warnyin/`, `.claude/` ที่ root)

## 5. Acceptance criteria
- [x] ทุกไฟล์แก้ตรงพิกัด § ตาม design §3 (10 ไฟล์); ไม่ renumber/ไม่สร้างกลไกขนาน
- [x] wording ทุกจุดตรง design §4 canonical (copy ไม่แต่งใหม่)
- [x] **ship §4 step 5.1 = ขยายของเดิม ไม่มี sub-step ใหม่** + **verify §3 = ขยาย principle 1 เดิม ไม่เพิ่ม principle** (panel B2)
- [x] กติกา merge ครบ: read-modify-verify + key ไม่เจอ→STOP + rename `[เดิมชื่อ:]` + stale delta re-check + union baseline (panel B4)
- [x] gate item ใหม่ปรากฏใน design §8 / verify §6 / ship §6 ของ playbook
- [x] command mirror ×3 ไม่ duplicate logic (ชี้ playbook — กติกา merge เต็มอยู่ playbook เท่านั้น)
- [x] CHANGELOG `[Unreleased]` มี entry payload change
- [x] consistency check ผ่าน (grep key + semantic เทียบ design §4.3 คำต่อคำ)
- [x] `npm test` (19) + `npm run lint:md` + `npm run verify:pack` เขียว
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical source: `../../design.md` §3 (ตารางไฟล์แก้) + §4.2–§4.4 (wording) + Design review (B2/B4)
