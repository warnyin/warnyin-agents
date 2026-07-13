# Rule — fastlane-wiring

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)
> ดึงจาก `docs/techstack/installer/rule.md` และ `docs/rule.md` — เฉพาะข้อที่เกี่ยวกับ task นี้

- [ ] **★ ห้ามแตะ root `.warnyin/`, `.claude/`, `CLAUDE.md`, `AGENTS.md`** (C18) — เป็น **dogfood install ที่ gitignored (not tracked)** แก้ไปแล้ว**งานหาย ไม่ติด commit**; canonical ที่ ship จริงอยู่ `src/.warnyin/installer/templates/CLAUDE.md` — ก่อนแก้ registry/slash-command list **เช็ค `git check-ignore <file>` เสมอ** (`docs/techstack/installer/rule.md` §packaging "registry-target ของ root dogfood file" · `docs/rule.md:79` · `docs/troubleshooting.md` #18/#22 · TS-1 ของ topic `feedback-issue-command`)
- [ ] **แก้เฉพาะใต้ `src/`** — mirror layout `src/` = target path (installer copy `src/<rel> → target/<rel>` ไม่มี mapping) → ไม่ต้องแตะ packaging
- [ ] **`package.json files` เป็น allowlist** — task นี้ไม่เพิ่มไฟล์ใหม่ → **ห้ามแก้ allowlist / `verify-pack.mjs`**; งานจริง (`docs/`) + dev tooling ห้ามหลุดขึ้น package
- [ ] **investigate-before-edit** — เลขบรรทัดใน `task.md §4` เป็นจุดอ้างอิง ณ วันเขียน; ถ้าไม่ตรง ให้ค้นจาก **ข้อความเดิม** ก่อนแก้ ห้ามแก้ตามเลขบรรทัดมั่ว
- [ ] **ห้ามลด bar ของ gate** — ห้ามแก้ config/test/lint gate (`lint-md.mjs`, `check-test-count.mjs`, MIN_PASS) เพื่อให้เขียว (config-protection ของ BUILD)
- [ ] **BUILD ห้ามแตะ rule/standard/docs กลาง** — `docs/rule.md`, `docs/features/**`, `docs/techstack/**` ห้ามแก้ใน stage นี้ (note ไว้ §2 รอ SHIP)
- [ ] **single source of truth** — ห้าม duplicate logic ของ workflow; แก้พฤติกรรมต้องแก้ที่ playbook กลาง ไม่ลอกกฎกระจายหลายไฟล์
- [ ] **markdown-link ต้อง resolve ได้** (lint-md gate) + **heading/anchor ที่มีคนอ้าง ห้ามเปลี่ยน** (`#fast-track-skip-list` = inbound 5 ไฟล์)
- [ ] **canonical-copy** — wording จาก `design.md §4` (C12-C17) ต้อง**คำต่อคำ** (test diff แบบ string-equality) ห้าม paraphrase

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` / `docs/techstack/*/rule.md` / `docs/features/**` ตอนนี้ — แค่ note ไว้ก่อน ถึง SHIP ค่อยพิจารณาย้ายขึ้นไป

- [ ] **★ `docs/rule.md:26` (hard-floor "บังคับ ≥ standard เสมอ") ต้องอัปเดตตอน SHIP** — พฤติกรรมใหม่ (C9/C16) ผ่อน 1 ระดับ: ยังบังคับ ≥ standard เป็น**ค่าตั้งต้น** และ `/warnyin:triage` ยัง**ห้ามแนะนำ** fast เมื่อแตะ hard-floor (ไม่เปลี่ยน) **แต่มีข้อยกเว้นเดียว** = user สั่ง `/warnyin:fastlane` เอง + ยืนยันซ้ำหลังถูกเตือน → บันทึก `override โดย user` ลง receipt meta → ship-lite ยอม ship เฉพาะ receipt ที่มี override นี้ — เหตุผล: ปล่อยไว้เอกสารกลางจะขัดกับ playbook ที่ ship จริง
- [ ] **★ `docs/features/change-sizing/feature.md:29` + `business.md:22` ต้องอัปเดตตอน SHIP** — เดิมระบุ "ไม่เพิ่ม one-shot / auto-execution (เสี่ยง mis-size)" ซึ่ง change นี้**กลับ decision เดิม** (mitigation: hard-floor gate ก่อนแตะโค้ด + escalate กลางทาง + audit trail ใน receipt) — พร้อม Spec delta 2 ข้อ (ADDED `fastlane` · MODIFIED skip-list executor + hard-floor override) ตาม `design.md §9`
- [ ] rule ที่เสนอ: **anchor-immutability** — heading ที่มี inbound link ≥2 ไฟล์ ถือเป็น public API ของ playbook เปลี่ยนได้เฉพาะเมื่อแก้ inbound ทุกจุดพร้อมกัน — เหตุผล: `#fast-track-skip-list` ถูกอ้าง 5 ไฟล์ และ `lint-md` **ตัด anchor ทิ้ง** (ไม่จับ dead anchor) → เปลี่ยน heading = พังเงียบ
- [ ] rule ที่เสนอ: **contract-as-copy-source** — task ที่ต้องเขียน wording ซึ่งถูก assert ด้วย string-equality ให้ยกข้อความไว้ใน `design.md §4` แล้ว copy คำต่อคำ (ไม่ต้องอ่านไฟล์ปลายทางของ task อื่น) — เหตุผล: ตัด read-dependency ทำให้ task ขนานกันได้จริงใน wave เดียว
