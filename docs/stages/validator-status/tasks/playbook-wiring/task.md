# Task — playbook-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `playbook-wiring` |
| **Slice อ้างอิง** | `design.md` slice #2 (workflow เรียกใช้จริง 3 จุด) |
| **Component** | workflow core (playbook next/design/ship) + adapter command + CHANGELOG |
| **Wave** | 2 (ต้องทำหลัง `validator-script` — อ้าง CLI contract §4.1 + ชื่อ script ที่มีจริง) |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
wire `validate-topic.mjs` เข้า workflow **3 จุด** (next pre-scan / DESIGN gate / SHIP step 1) ด้วย wording node-guard จาก **design §4.5 verbatim** + **command mirror บาง** (ชี้ playbook ไม่ duplicate) + **CHANGELOG** — แก้ **~7 ไฟล์** (3 playbook + 3 command + CHANGELOG) ตาม design §3 โดยทุกจุดเป็น **unify-in-place** (ขยาย step/gate/section เดิม ไม่เพิ่มกลไกขนาน) และ **node-guard ครบทุกจุด** (Infra-S1 — gate ไม่ค้างบนเครื่องไม่มี node). **ไม่มีโค้ด/test ใหม่** — script + unit เป็นของ task `validator-script`.

## 2. Dependency
- **ต้องทำหลัง:** `tasks/validator-script` (wave 1) — wiring อ้าง **CLI contract §4.1** (คำสั่ง/exit code) + ชื่อ script `src/.warnyin/workflow/scripts/validate-topic.mjs` ที่ task นั้นสร้าง (อ้างถึงเฉยๆ ไม่แก้ไฟล์นั้น)
- **ขนานกับ:** — (wave 2 มี task เดียว)
- **ส่ง output ต่อ:** วงจร wiring 3 จุด → VERIFY ของ topic ใช้ self-validate + consistency check (grep `validate-topic.mjs` ครบ 3 playbook ตรง design §9)

## 3. Sub-tasks (ระบุ § ต่อไฟล์ ตาม design §3 — copy wording จาก design §4.5)
- [ ] 1. `src/.warnyin/workflow/next.md` — **§2 แทรก step pre-scan** (ข้อแรกของ "วิธีหาสถานะ" / step 0): รัน script โหมด status เป็น structural pre-scan **ถ้ารัน node ได้** แล้วอ่าน semantic ต่อ — wording = spec §2.1 verbatim; **ตาราง heuristic เดิม (§2 ข้อ 3) คงไว้ครบ** เป็น fallback _(spec §2.1 / design §4.5)_
- [ ] 2. `src/.warnyin/workflow/stages/design.md` — **§8 ต่อท้าย gate item เดิม** `ทุก task มี spec.md + standard.md + rule.md + task.md ครบ` ด้วย spec §2.2 verbatim (วงเล็บต่อท้ายในข้อเดิม — ไม่เพิ่ม checkbox ใหม่; guidance ไม่ใช่ hard gate) _(spec §2.2 / design §4.5)_
- [ ] 3. `src/.warnyin/workflow/stages/ship.md` — **§4 ต่อท้าย step 1 เดิม** (อ่านทำความเข้าใจ + เช็ค VERIFY ผ่าน) ด้วย spec §2.3 verbatim — มี ✖ ควรแก้ก่อน promote (ต่อในข้อเดิม ไม่เพิ่ม step) _(spec §2.3 / design §4.5)_
- [ ] 4. `src/.claude/commands/warnyin/next.md` — mirror **บาง 1 บรรทัด** ชี้ playbook step pre-scan (status mode ก่อนอ่าน semantic) — ไม่ duplicate รายการเช็ค
- [ ] 5. `src/.claude/commands/warnyin/design.md` — mirror **บาง 1 บรรทัด** ชี้ playbook §8 (validate `<slug>` ควรไม่มี ✖) — ไม่ duplicate
- [ ] 6. `src/.claude/commands/warnyin/ship.md` — mirror **บาง 1 บรรทัด** ชี้ playbook §4 step 1 (validate `<slug>` ก่อน promote) — ไม่ duplicate
- [ ] 7. `CHANGELOG.md` — entry `[Unreleased]` (payload + script ใหม่ + wiring 3 จุด — user-facing, ตาม `docs/rule.md` §2)
- [ ] 8. **consistency check** — grep `validate-topic.mjs` พบครบ **3 playbook** (`next.md` + `stages/design.md` + `stages/ship.md` — ตรง design §9 scenario "wiring ครบ") + **เทียบ wording 3 จุดตรง spec §2.1/§2.2/§2.3 (design §4.5) คำต่อคำ** + ยืนยัน **node-guard "ถ้ารัน node ได้" ครบทุกจุด** + ตาราง heuristic ใน next.md ไม่ถูกลบ (fallback ยังอยู่)
- [ ] 9. `npm test` + `npm run lint:md` + `npm run verify:pack` เขียว

## 4. ขอบเขตไฟล์ที่จะแตะ (~7 ไฟล์)
- **แก้:** `src/.warnyin/workflow/next.md` · `src/.warnyin/workflow/stages/{design,ship}.md` · `src/.claude/commands/warnyin/{next,design,ship}.md` · `CHANGELOG.md`
- **ห้ามแตะ:** `src/.warnyin/workflow/scripts/validate-topic.mjs` + `src/tests/validate-topic.test.mjs` (ของ task `validator-script`) · `src/bin/cli.mjs` · `src/scripts/verify-pack.mjs` · docs/ กลาง (`docs/rule.md`/`docs/techstack/`/`docs/features/`) · `src/.warnyin/workflow/stages/verify.md` + `build.md` (ไม่เกี่ยว) · root dogfood (`.warnyin/`, `.claude/` ที่ root)

## 5. Acceptance criteria
- [ ] ทุกไฟล์แก้ตรงพิกัด § ตาม design §3 (~7 ไฟล์); **ไม่ renumber/ไม่สร้างกลไกขนาน** (unify-in-place)
- [ ] wording 3 จุด wiring ตรง design §4.5 canonical (copy ไม่แต่งใหม่ — spec §2.1/§2.2/§2.3 คำต่อคำ); คำสั่งตรงรูป design §4.1
- [ ] **node-guard ครบทุกจุด** "ถ้ารัน node ได้" (Infra-S1); design §8 / ship step 1 = **guidance ("ควรไม่มี ✖") ไม่ใช่ hard gate**; **next.md คง fallback ตาราง heuristic เดิม**
- [ ] **design §8 = ต่อท้าย gate item เดิม** (ไม่เพิ่ม checkbox) + **ship §4 = ขยาย step 1 เดิม** (ไม่เพิ่ม step) + **next §2 = แทรก step pre-scan** (ตาราง heuristic เดิมยังอยู่)
- [ ] grep `validate-topic.mjs` พบครบ 3 playbook (next.md + stages/design.md + stages/ship.md — ตรง design §9)
- [ ] command mirror ×3 ไม่ duplicate รายการเช็ค (1 บรรทัด/ไฟล์ ชี้ playbook — รายการเช็คเต็มอยู่ใน script + playbook)
- [ ] CHANGELOG `[Unreleased]` มี entry payload change (script + wiring)
- [ ] consistency check ผ่าน (grep key 3 ไฟล์ + semantic เทียบ design §4.5 คำต่อคำ + node-guard ครบ)
- [ ] `npm test` + `npm run lint:md` + `npm run verify:pack` เขียว
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical source: `../../design.md` §3 (ตารางไฟล์แก้) + §4.1 (CLI contract) + §4.5 (wording wiring — node-guard) + §9 (scenario "wiring ครบ") + Design review (Infra-S1)
