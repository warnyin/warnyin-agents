# Spec — playbook-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> wire `validate-topic.mjs` เข้า workflow 3 จุด (next pre-scan / DESIGN gate / SHIP step 1) + command mirror บาง + CHANGELOG — โดย **copy canonical wording จาก design §4.5 เท่านั้น ห้ามแต่งใหม่**

## 1. ชนิดของ task
`docs` / `content` — แก้ `.md` แก่นกลาง workflow (playbook next/design/ship) + adapter command + CHANGELOG; **ทุกจุด unify-in-place** (ขยาย step/gate/section เดิม ไม่เพิ่มกลไกขนาน — `docs/rule.md` §1) + **mirror ชี้ playbook ไม่ duplicate รายการเช็ค** (adapter บาง — `docs/rule.md` §1).
**ไม่มี runtime/โค้ดใหม่** — script `validate-topic.mjs` + test เป็นของ task `validator-script` (wave 1); ใบนี้แค่ wire เข้าจุดเรียกใช้.

---

## 2. Canonical wording (copy จาก design §4.5 — ใช้ตรงนี้ทุกจุด ห้ามแต่งใหม่)

> source of truth = `docs/stages/validator-status/design.md` §4.5 (wording wiring — node-guard ทุกจุด · Infra-S1) + §4.1 (CLI contract ที่ wording อ้าง: คำสั่ง/exit code)
> ใต้นี้คือ wording ที่ต้อง **ฝังตรงคำ (verbatim)** — ถ้าต่างจาก design §4.5 ให้ยึด design §4.5 เป็นหลัก

### 2.1 next.md step pre-scan (= design §4.5 next.md verbatim)
> ถ้ารัน node ได้ → รัน `node .warnyin/workflow/scripts/validate-topic.mjs` (โหมด status) เป็น structural pre-scan ก่อน แล้วค่อยอ่านเชิง semantic เฉพาะจุดที่ต้องตัดสิน — เครื่องที่รันไม่ได้ ใช้ตาราง heuristic ด้านล่างเหมือนเดิม

### 2.2 design.md §8 gate item (= design §4.5 design.md §8 verbatim — ต่อท้าย gate item เดิม "ทุก task มี 4 ไฟล์ครบ")
> (ถ้ารัน node ได้: `node .warnyin/workflow/scripts/validate-topic.mjs <slug>` ควรไม่มี ✖ — เช็คโครง ไม่แทนการอ่าน semantic)

### 2.3 ship.md §4 step 1 (= design §4.5 ship.md §4 step 1 verbatim — ต่อท้าย step 1 เดิม)
> ถ้ารัน node ได้ → รัน `node .warnyin/workflow/scripts/validate-topic.mjs <slug>` — มี ✖ ควรแก้ก่อน promote (script เช็คโครง; ความถูกของเนื้อหายังเป็นหน้าที่ผู้ ship)

### 2.4 CLI contract ที่ wording อ้าง (= design §4.1 — อ้างถึง ไม่แก้ script)
- โหมด **status** (ไม่ใส่ arg): `node .warnyin/workflow/scripts/validate-topic.mjs` → ตารางทุก active topic; exit `0` เสมอ (รายงาน ไม่ใช่ gate)
- โหมด **validate** (ใส่ `<slug>`): `node .warnyin/workflow/scripts/validate-topic.mjs <slug>` → `✖`/`⚠` ละเอียด; exit `1` เมื่อมี ✖ · `0` เมื่อมีแค่ ⚠/สะอาด · `2` slug ไม่ถูกต้อง/ไม่พบ topic

### 2.5 จุดบังคับจาก panel (Infra-S1 · node-guard)
- **ทุกจุด wiring** ต้องมี node-guard "ถ้ารัน node ได้" (เหมือน next step 0) — gate ไม่ค้างบนเครื่องที่ไม่มี node
- **design §8 / ship step 1 = guidance** ("ควรไม่มี ✖") **ไม่ใช่ hard gate** — ผู้ทำงานตัดสินใจต่อ; structural pre-check ไม่แทน semantic review
- **next.md คง fallback** ตาราง heuristic เดิม (เครื่องที่รัน script ไม่ได้ → ใช้ตารางตามเดิม)

---

## 3. จุดที่ต้องแก้ (file | content) — ตาม design §3 ตารางไฟล์แก้

> พิกัด § ต่อไฟล์มาจาก design §3 (unify-in-place — "ขยายของเดิม"); **ทุกจุด node-guard + mirror ชี้ playbook ไม่ duplicate**

| ไฟล์ | จุดแก้ (copy wording จาก §2 ข้างบน / design §4.5) |
|---|---|
| `src/.warnyin/workflow/next.md` | **§2 เพิ่ม step pre-scan** (เป็นข้อแรกของขั้นตอนหาสถานะ): รัน script โหมด status เป็น structural pre-scan **ถ้ารัน node ได้** แล้วใช้ model ตัดสิน semantic ต่อ — **ตาราง heuristic เดิม (§2 ข้อ 3) คงไว้เป็น fallback** (เครื่องที่รัน script ไม่ได้); wording = §2.1 verbatim |
| `src/.warnyin/workflow/stages/design.md` | **§8 ขยาย gate item เดิม** "ทุก task มี `spec.md` + `standard.md` + `rule.md` + `task.md` ครบ" → ต่อท้ายด้วย §2.2 verbatim (guidance, ไม่ใช่ hard gate) |
| `src/.warnyin/workflow/stages/ship.md` | **§4 ขยาย step 1 เดิม** (อ่านทำความเข้าใจ + เช็ค VERIFY ผ่าน) → ต่อท้ายด้วย §2.3 verbatim — โครงขาด (✖) ควรแก้ก่อน promote (guidance) |
| `src/.claude/commands/warnyin/next.md` | mirror **บาง** — 1 บรรทัด ชี้ playbook step pre-scan (status mode ก่อนอ่าน semantic) ไม่ duplicate รายการเช็ค |
| `src/.claude/commands/warnyin/design.md` | mirror **บาง** — 1 บรรทัด ชี้ playbook §8 (validate `<slug>` ควรไม่มี ✖) ไม่ duplicate |
| `src/.claude/commands/warnyin/ship.md` | mirror **บาง** — 1 บรรทัด ชี้ playbook §4 step 1 (validate `<slug>` ก่อน promote) ไม่ duplicate |
| `CHANGELOG.md` | entry `[Unreleased]` (payload + script ใหม่ — user-facing) ตาม `docs/rule.md` §2 |

**ห้ามแตะ:** `src/.warnyin/workflow/scripts/validate-topic.mjs` + `src/tests/validate-topic.test.mjs` (ของ task `validator-script`) · `src/bin/cli.mjs` · `src/scripts/verify-pack.mjs` · docs/ กลาง (`docs/rule.md`/`docs/techstack/`/`docs/features/`) · `src/.warnyin/workflow/stages/verify.md` + `build.md` (ไม่เกี่ยว — gate ของ stage นั้นเป็นเรื่อง test ไม่ใช่โครงเอกสาร) · root dogfood (`.warnyin/`, `.claude/` ที่ root)

---

## 4. Data-flow
ไม่มี runtime ในใบนี้ — wiring เอกสาร: จุดเรียก (next/DESIGN/SHIP) → `node validate-topic.mjs [slug]` (script ของ wave 1) → exit code/รายงาน → AI/ผู้ใช้อ่านประกอบการตัดสิน semantic ต่อ (script เช็คโครง, model เช็คเนื้อหา)

## 5. User-flow
- **next:** user รัน `/warnyin:next` → AI รัน status pre-scan ก่อน (ถ้า node ได้) แล้วรายงานเหมือนเดิม; เครื่องไม่มี node → fallback ตาราง heuristic เดิม (พฤติกรรมเดิมไม่หาย)
- **DESIGN gate / SHIP step 1:** AI รัน validate `<slug>` ประกอบ checklist เดิม — ✖ เป็น guidance ให้แก้ ไม่ block อัตโนมัติ; **ไม่มีรอบถามเพิ่ม**

## 6. Persona
AI ทุก harness ที่เดิน workflow (next/DESIGN/SHIP) ตาม playbook กลาง + ผู้ใช้ปลายทางที่ `--update` รับพฤติกรรมใหม่ (script + wiring) อัตโนมัติ

## 7. Test-flow
- [ ] **next.md** — มี step pre-scan ชี้ status mode + node-guard "ถ้ารัน node ได้" + ตาราง heuristic เดิมยังอยู่ (grep `validate-topic.mjs` + ตรวจ fallback ไม่หาย)
- [ ] **stages/design.md** — §8 gate item เดิม "ทุก task มี ... ครบ" มี §2.2 ต่อท้าย + node-guard (grep `validate-topic.mjs` ใน §8)
- [ ] **stages/ship.md** — §4 step 1 มี §2.3 ต่อท้าย + node-guard (grep `validate-topic.mjs` ใน §4 step 1)
- [ ] **consistency check** — grep `validate-topic.mjs` พบใน 3 playbook: `next.md` + `stages/design.md` + `stages/ship.md` (ตรง design §9 scenario "wiring ครบ" + §4.1 CLI contract) · wording ทั้ง 3 จุดตรง §2.1/§2.2/§2.3 canonical (design §4.5) คำต่อคำ · node-guard "ถ้ารัน node ได้" ครบทุกจุด
- [ ] **command mirror ×3** — `next/design/ship.md` มี 1 บรรทัดชี้ playbook ไม่ duplicate รายการเช็ค (รายการเช็คเต็มอยู่ใน script + playbook เท่านั้น)
- [ ] **CHANGELOG** — มี entry `[Unreleased]` ครอบ payload change (script ใหม่ + wiring 3 จุด)
- [ ] `npm test` + `npm run lint:md` + `npm run verify:pack` เขียว (backward compatible: เครื่องไม่มี node → playbook คง fallback เดิม)
