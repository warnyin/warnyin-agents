# Task — installer-seed

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `installer-seed` |
| **Slice อ้างอิง** | `design.md` slice #3 |
| **Component** | `installer` |
| **Model tier** | `balanced` |
| **สถานะ** | `build เสร็จ — เขียวจริง (npm test 154 pass / 0 fail, lint:md ผ่าน, verify:pack ผ่าน — ตรวจแบบ manual ตาม troubleshooting.md #4 เพราะ Windows dev env มี execFileSync ENOENT)` |

## 1. เป้าหมายของ task (vertical slice)

**ผู้ใช้ใหม่ได้ไฟล์ memory ที่มีโครง ไม่ใช่ไฟล์เปล่า — end-to-end จากต้นทางถึงสิ่งที่ผู้ใช้ได้จริง**
สร้าง **template 2 ใบ** → installer `seedDocs()` วางลง target → ติดตั้งด้วย `npx @warnyin/agents` แล้วได้ `docs/stages/context.md` (4 section) + `docs/memory.md` (ตาราง 6 คอลัมน์ + legend closed-set); global mode (installer ข้าม scaffold/seed) ได้ผลเดียวกันผ่าน `/warnyin:init` step 0; ทั้งหมดถูกล็อกด้วยเคสใน `npm test`

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- **wave 1 — อิสระเต็มตัว ไม่พึ่ง task อื่นทั้งตอนเขียนและตอน runtime**
  slice นี้ครบในตัว (**template → seed → test**) หลังย้าย ownership ของ template 2 ใบมาที่ T3 — decouple จาก T1 เหลือแค่ **contract ใน `design.md`** (schema §3.1/§3.2 + คำเตือน C12 §4) ซึ่งอยู่ใน design แล้ว → **ห้ามอ่าน/แตะ `workflow/memory.md` ของ T1**
- **ไม่ต้องมี existence guard ในเทสอีกแล้ว** — template อยู่ใน worktree เดียวกับเทส → `runCli()` ได้ไฟล์จริงเสมอ (`design.md` §8 แถว installer) → **assert ตรง ๆ ได้เลย ห้ามใส่ `hasMemoryTemplate`**
- **เคส 9 เดิมยังเขียว** — หลังถอด `context.md` ออกจาก `SCAFFOLD_FILES` ไฟล์มาจาก `seedDocs()` แทน; template เป็นของ task นี้ → `existsSync` ยังจริง → **ห้ามแก้ assertion เคส 9**
- **ปลดล็อกให้:** T6 (`release-hygiene`) — structural test ข้าม slice (C12 + 0 markdown-link ของ template 2 ใบ) + pack assert + CHANGELOG
- **ส่งต่อ:** template 2 ใบที่ T5 (`memory-status.mjs`) และ T6 ใช้เป็นข้อมูลอ้างอิงโครง (ผ่าน design contract — ไม่ใช่ read-dependency)

## 3. Sub-tasks

> ลำดับสำคัญ: **สร้าง template ก่อน** แล้วค่อยแก้ `cli.mjs` — ไม่งั้น `runCli()` ระหว่างทดสอบจะไม่มีไฟล์ให้ seed

- [x] 1. **`src/.warnyin/template/docs/stages/context.md` (ไฟล์ใหม่)** — 4 section ตาม `spec.md` §3.1 + คำเตือน C12 ที่หัวไฟล์ **คำต่อคำ** · **0 markdown-link** (สร้างโฟลเดอร์ `template/docs/stages/` ด้วย)
- [x] 2. **`src/.warnyin/template/docs/memory.md` (ไฟล์ใหม่)** — ตาราง 6 คอลัมน์ + legend closed-set + pointer เป็น inline-code ตาม `spec.md` §3.2 + คำเตือน C12 **คำต่อคำ** · **0 markdown-link** · แถวตัวอย่าง (ถ้าใส่) เป็น **HTML comment**
- [x] 3. **investigate-before-edit (ยืนยันกับโค้ดจริงก่อนแก้ `cli.mjs`)** — อ่าน `SCAFFOLD_FILES` (~บรรทัด 96-100), `ensureScaffold()`, `seedDocs()` (~140-180), `main()` project/global branch (~395-440) → ยืนยัน 3 ข้อ: (ก) `main()` เรียก `ensureScaffold()` **ก่อน** `seedDocs()` · (ข) `seedDocs` skip ไฟล์ที่ `existsSync` · (ค) global branch **ข้าม** ทั้งคู่ — **ยืนยันแล้ว ตรงกับ `spec.md` §4.1 ทั้ง 3 ข้อ** (`ensureScaffold()` บรรทัด 425 ก่อน `seedDocs()` บรรทัด 426, skip-if-exists บรรทัด 167-170, global branch comment "ข้าม scaffold/seedDocs (ยกให้ /warnyin:init)" บรรทัด 408)
- [x] 4. **`src/bin/cli.mjs`** — ถอด `path.join('docs','stages','context.md')` ออกจาก `SCAFFOLD_FILES` (เหลือ `achieved/.gitkeep` ใบเดียว) + **แก้คอมเมนต์ให้ตรงพฤติกรรมใหม่** (ระบุว่า `context.md` มาจาก `seedDocs` แล้ว, scaffold เหลือเฉพาะโฟลเดอร์ archive เปล่า) — _ขึ้นกับ 1-3_
- [x] 5. **`src/.warnyin/workflow/init.md` step 0** — เปลี่ยนลำดับเป็น **seed จาก `<template>/docs/` (ทุกชั้น) ก่อน → สร้างไฟล์เปล่าเป็น fallback เฉพาะเมื่อ template ไม่มี**; ระบุชัดว่า seed loop **recursive เข้าโฟลเดอร์ย่อย** (ข้าม entry ที่ขึ้นต้น `[` ทุกชั้น, ไม่ทับไฟล์ที่มีอยู่); ครอบ `docs/stages/context.md` + `docs/memory.md`
- [x] 6. **`init.md` §4 output table + §5 gate** — ระบุ 2 ไฟล์ใหม่ให้ชัด (seed ที่ step 0 ไม่ใช่ไฟล์ที่ INIT วิเคราะห์แล้วเติมเนื้อ) + gate เป็น **conditional/N-A** (template ไม่มี → ไฟล์เปล่ายอมรับได้) — _ขึ้นกับ 5_
- [x] 7. **`src/tests/installer.test.mjs`** — **เพิ่มเคสใหม่ 3 เคส** (M1/M2/R1 ใน `spec.md` §7) ใต้ section comment ใหม่ · **ห้ามแก้/ลบ assertion ของเคส 1-9 เดิม** · **ห้าม `t.skip()`** · **ไม่มี guard** — _ขึ้นกับ 1,2,4_
- [x] 8. **รัน gate ครบ** (§5) + ตรวจว่า `pass === tests`

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

- `src/.warnyin/template/docs/stages/context.md` **(ใหม่)**
- `src/.warnyin/template/docs/memory.md` **(ใหม่)**
- `src/bin/cli.mjs` (เฉพาะ `SCAFFOLD_FILES` + คอมเมนต์ที่เกี่ยวข้อง)
- `src/.warnyin/workflow/init.md` (step 0 · §4 · §5)
- `src/tests/installer.test.mjs` (**เพิ่มเคสเท่านั้น**)
- **ไม่แตะ:** `src/.warnyin/workflow/memory.md` + `workflow/README.md` (T1) · `workflow/{stages/*,next,explore,fastlane}.md` (T2) · `src/.warnyin/installer/templates/**` + `src/AGENTS.md` (T4) · `workflow/scripts/memory-status.mjs` (T5) · `src/scripts/check-test-count.mjs` (`MIN_PASS=46` เป็น **floor** — เพิ่มเคสไม่ต้อง bump) · `src/scripts/verify-pack.mjs` · `CHANGELOG.md`/`package.json` (T6) · **root `.warnyin/`, `.claude/`, root `CLAUDE.md`/`AGENTS.md`** (dogfood gitignored — `docs/rule.md` §6)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)

- [x] **`design.md` §9 MODIFIED — Scenario "init สร้าง workspace เมื่อไม่มี":** `init.md` มี step สร้าง scaffold + seed `docs/` (template local→global, ข้าม `[...]`, **recursive เข้าโฟลเดอร์ย่อย**, ไม่ทับของเดิม) **ก่อน** วิเคราะห์โปรเจกต์
- [x] **`design.md` §9 MODIFIED — Scenario "context.md ได้โครงจาก template ไม่ใช่ไฟล์เปล่า":** step 0 ระบุลำดับ **seed จาก template ก่อน** และสร้างไฟล์เปล่าเป็น **fallback เฉพาะเมื่อ template ไม่มี**
- [x] template 2 ใบมีอยู่จริง + ตรง contract `spec.md` §3 (4 section / ตาราง 6 คอลัมน์ + legend) + **คำเตือน C12 คำต่อคำ** + **0 markdown-link** (T6 assert string-equality + นับลิงก์)
- [x] เคส M1/M2/R1 ใน `spec.md` §7 เขียวครบ — **ไม่มี `t.skip()` และไม่มี existence guard**
- [x] `SCAFFOLD_FILES` เหลือ `docs/stages/achieved/.gitkeep` ใบเดียว + คอมเมนต์ตรงพฤติกรรมจริง
- [x] `npm test` เขียว (**bare `node --test` ห้ามใส่ path arg**) + summary `pass === tests`(154), `fail === 0`
- [x] เคส 1-9 เดิมไม่ถูกแก้ assertion (ยืนยันด้วย `git diff src/tests/installer.test.mjs` = เพิ่มบรรทัดล้วนในช่วงเคสเดิม) — โดยเฉพาะ **เคส 9 ต้องยังเขียว**
- [x] `npm run lint:md` เขียว (168 ไฟล์ 92 ลิงก์) · `npm run verify:pack` — **execFileSync('npm',...) ENOENT บน Windows dev (troubleshooting.md #4, pre-existing ไม่เกี่ยวกับ task นี้)** → ตรวจแบบ manual แทน: `npm pack --dry-run --json` + import `checkFiles()` จาก `verify-pack.mjs` มา apply เอง → ผ่าน (104 ไฟล์, ทั้ง `src/.warnyin/template/docs/memory.md` และ `src/.warnyin/template/docs/stages/context.md` ติด tarball ผ่าน allowlist เดิม, 0 error) — unit gate ของ `verify-pack.test.mjs` เขียวปกติใน `npm test` ทุก platform
- [x] `git status` ไม่มีไฟล์ root `.warnyin/`/`.claude/` ถูกแตะ
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
