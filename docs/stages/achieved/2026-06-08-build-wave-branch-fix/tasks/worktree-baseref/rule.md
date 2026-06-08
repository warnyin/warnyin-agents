# Rule — worktree-baseref

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก docs/rule.md §1/§2/§6)
- [ ] **unify-in-place ไม่สร้างกลไกขนาน** (`docs/rule.md` §1) — ทุกจุด **ขยาย arg/step/principle เดิม**: build-wave เพิ่ม 1 const + แทรก step `0.` (**ไม่ renumber** 1-9) · build.md ขยาย step 6 args + integrate note เดิม · stages/build.md ขยาย §3 principle 3 + §4 step 5 เดิม — **ห้ามเพิ่ม principle/step/section ใหม่**
- [ ] **canonical-copy convention** (`docs/rule.md` §1) — copy contract จาก **design §4 เท่านั้น ห้ามแต่งใหม่ต่อไฟล์**; git merge contract §4.2 ฝัง **verbatim** ใน prompt (คำต่อคำ); args ตรง §4.1, orchestrator arg ตรง §4.3, integrate note ตรง §4.4
- [ ] **★ hard-stop กัน improvise (panel B2)** — prompt ต้องมี: หลัง merge สำเร็จแต่ `docs/stages/<slug>/tasks/<task>/task.md` **ไม่ปรากฏ** → **STOP รายงาน failed ทันที ห้าม improvise/git reset เอง** (กัน KB#14 วนรอย); **ห้ามตัดทอนข้อนี้**
- [ ] **abort-on-conflict** (Infra-S2) — merge ต้องเป็น `git merge <baseRef> --no-edit || (git merge --abort; <failed>)` — กันค้าง MERGE state ทำ step commit ท้ายพัง; **ห้ามละ `|| (git merge --abort`**
- [ ] **retry transient lock + บันทึก notes** (Infra-S1/S5) — lock error ชั่วคราว (`index.lock`/`packed-refs`) → retry 1 ครั้งก่อน failed; บันทึกผล merge ลง `notes` (เช่น "merged <baseRef>: fast-forward to <sha>")
- [ ] **`isolate && baseRef` guard + backward compat** (design §4.1/§6) — แทรก step 0 **เฉพาะเมื่อ `isolate && baseRef`**; `!baseRef` (caller เก่าไม่ส่ง) → ไม่แทรก = พฤติกรรมเดิม; `baseRef` optional
- [ ] **step 0 ก่อน step 1** (SA-S2 ordering) — step `0.` git merge ต้องอยู่ **ก่อน** step `1. อ่านให้ครบ` (agent ต้อง sync ก่อนอ่าน task) — ใช้ `"0."` ไม่ renumber
- [ ] **KB#11 — checkout เฉพาะ scoped src files** (`docs/rule.md` §6 / design §3.1) — integrate note ระบุ `git checkout <branch> -- <scoped src files>` (scope `src/` ล้วน ไม่แตะ dogfood ที่ root) → ปลอด tracked-deletion (lesson: merge เข้า branch ที่ track dogfood ต่างจาก main = ลบ working tree dogfood)
- [ ] **zero-dependency + ESM** (`docs/rule.md` §2) — `build-wave.mjs` ไม่เพิ่ม dep/import ใหม่ (แก้เป็น string + arg parse ล้วน); คง `import`/`export` + `args`/`agent`/`parallel` ที่ harness inject
- [ ] **CHANGELOG ทุก user-facing change** (`docs/rule.md` §2) — entry `[Unreleased]` (payload reliability fix)
- [ ] **source/dogfood แยกชั้น** (`docs/rule.md` §6) — แก้เฉพาะ `src/.warnyin/` + `src/.claude/` + `CHANGELOG.md`; **ห้ามแตะ root dogfood** + `cli.mjs` + `verify-pack.mjs` + `validate-topic.mjs` + `src/tests/` + docs/ กลาง + `stages/{verify,design,ship,discovery}.md`
- [ ] **investigate-before-edit** (`docs/rule.md` §1) — อ่าน arg parse / `prompt()` / build.md step 6 / build.md §3·§4 ของเดิมก่อนแก้ + ยืนยันแก้ที่ `src/` ไม่ใช่ root
- [ ] **ไม่ทำลายของเดิม** — `npm test` 53/53 + `npm run lint:md` + `npm run verify:pack` เขียว (backward compatible: `!baseRef` → พฤติกรรมเดิม)

## 2. เสนอเพิ่ม rule ใหม่ (รอ SHIP)
- **ไม่มี rule ใหม่** — task นี้เป็น **reliability fix ตาม convention เดิมล้วน** (unify-in-place + canonical-copy ที่ `docs/rule.md` §1 มีครบ); rule **build-orchestration: commit topic docs ก่อน fan-out** (E1 — worktree branch จาก build branch, main loop อัปเดต task.md ตอน integrate) ก็ถูก promote เข้า `docs/rule.md` §1 แล้วจาก topic `feature-spec-delta`/`validator-status` — ใบนี้ **ทำให้ rule นั้นทำงานจริง** (เติมกลไก sync) ไม่ใช่เสนอใหม่
  - หมายเหตุ: ถ้า **BUILD/VERIFY พบ nuance** (เช่น เคส merge 3-way จริง, transient lock pattern ใหม่, dogfood เผยพฤติกรรมที่ต้อง generalize) → ค่อยจับเป็น learned-rule ตอน SHIP ตามกลไก `ship.md` §3-§6 (ไม่ pre-declare ที่นี่)
