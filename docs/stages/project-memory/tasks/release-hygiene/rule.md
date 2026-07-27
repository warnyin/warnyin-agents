# Rule — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack + `docs/rule.md`)

**ขอบเขต / อำนาจแก้ไข**
- [ ] **★ fix authority — ห้ามแก้ข้ามเจ้าของไฟล์** (`docs/rule.md §1` build-orchestration + `loop-tuning.md`): gate ของ task นี้แดงเพราะไฟล์ของ T1-T5 (เช่น hook หายจาก `fastlane.md`, template ไม่มีคำเตือน, registry ไม่ครบ) → **หยุด + รายงาน main loop เข้า fix loop** พร้อมระบุ (ไฟล์ · invariant ที่ผิด · เคสที่แดง · เจ้าของ task) — **ห้ามแก้ไฟล์ของ task อื่นเอง** และห้ามลดเคสให้ผ่าน
- [ ] **file ownership disjoint** (`design.md §7`) — task นี้แตะได้เฉพาะ `src/tests/memory.test.mjs` · `src/scripts/verify-pack.mjs` · `src/tests/verify-pack.test.mjs` · `src/scripts/check-test-count.mjs` · `CHANGELOG.md`
- [ ] **`package.json` ไม่อยู่ใน ownership** — ห้าม bump version เอง; เขียน CHANGELOG ใต้ `## [Unreleased]` แล้วส่งต่อให้ main loop/SHIP
- [ ] **ห้ามแตะ root `.warnyin/`, `.claude/`, root `CLAUDE.md`/`AGENTS.md`** (dogfood gitignored — `docs/rule.md §6`) — แก้เฉพาะใต้ `src/` + `CHANGELOG.md`; ก่อนแก้ไฟล์ registry/root doc ใด ๆ เช็ค `git check-ignore <file>` เสมอ

**คุณภาพของเทส (anti-false-green)**
- [ ] **★ structural single-source / anchor check = เคส node ใน suite ไม่ใช่ shell `grep -rl`** (`docs/rule.md §5 ★`) — อ่านไฟล์ด้วย `node:fs` + walker เขียนเอง แล้ว assert; **ห้าม `spawnSync('grep'|'rg')`** (Windows dev รันไม่ได้ + ไม่เป็นส่วนหนึ่งของ `npm test` → regression หลุดเงียบ)
- [ ] **ห้าม `t.skip()` / conditional-skip** — `check-test-count.mjs` fail เมื่อ `pass !== tests`; เคสที่รันไม่ได้บาง platform ให้ `console.log(...) ; return` ในเคส (ยังนับเป็น pass)
- [ ] **assertion ต้อง falsifiable** — เคสนับจำนวน (M2 = 6 ไฟล์, M6b = 0 ลิงก์, M8 = 12 gate, M9b = 1 บรรทัด) ต้อง assert **ตัวเลขเป๊ะ** ไม่ใช่ `>= 1` / boolean; ordering ต้องเช็ค `index >= 0` ก่อนเทียบ (กัน `-1 < n` ผ่านเงียบ)
- [ ] **พิสูจน์ว่าแดงได้จริงก่อนปิด task** — ทำ invariant ให้ผิดชั่วคราว (M3/M2) → เห็นแดง → คืนไฟล์เดิม (`spec.md §7 G5`)
- [ ] **config-protection** (`docs/rule.md §1`) — ห้ามลด bar เพื่อให้เขียว: ห้ามแก้/ลบ assertion เดิมใน `verify-pack.test.mjs`, ห้ามลด `MIN_PASS`, ห้าม exclude ไฟล์ออกจาก gate, ห้ามเพิ่ม path เข้า `EXCLUDE_PREFIX` ของ `lint-md.mjs` — **เพิ่มเคสใหม่เท่านั้น**
- [ ] **investigate-before-edit** — เทสแดง → หา root cause ที่ payload ก่อน ห้ามแก้เทสให้ผ่าน; ก่อนแก้ `verify-pack.mjs` ต้องเข้าใจ contract ของ `checkFiles` (pure fn ที่ unit import ตรง — main-guard กัน `npm pack` ทำงานตอน import)
- [ ] **self-collision ของ negative-grep** (`docs/rule.md §5` negative fixture) — walker ของ M3 ต้องเก็บเฉพาะ **`.md`** (ตัว `memory.test.mjs` เป็น `.mjs` จึงไม่ถูกนับเป็น hit ของ needle ที่ตัวเองประกาศ); ถ้าวันไหนต้องขยาย walker ให้ครอบนามสกุลอื่น **ต้องกันไฟล์เทสเองออกก่อน** ไม่งั้น M3 แดงถาวรจาก const ในตัวมันเอง

**วิศวกรรมพื้นฐาน**
- [ ] **zero-dependency** — built-in `node:*` เท่านั้น (`devDependencies` ต้องว่างเสมอ — `docs/rule.md §2`)
- [ ] **ESM** — `import`/`export`, `import.meta.url` ห้าม `__dirname`/`require`
- [ ] **LF ล้วนสำหรับ `.mjs` ใต้ `src/`** — `src/tests/eol.test.mjs` บังคับ (บทเรียน CRLF: commit `0a2e7c4`)
- [ ] **pure fn + main-guard** — ส่วนที่เพิ่มใน `verify-pack.mjs` ต้องอยู่ใน `checkFiles(files) → errors[]` (testable โดยไม่เรียก `npm pack`) ห้ามย้าย logic เข้า `main()` (`docs/techstack/installer/rule.md §packaging`)
- [ ] **`package.json files` เป็น allowlist granular** — ไม่ต้องเพิ่ม path ใหม่ (`src/.warnyin` ครอบ `template/docs/` แล้ว) แต่ **gate ต้อง assert ว่ามันติดจริง** ไม่ใช่เชื่อว่าติด
- [ ] **ห้ามใส่ path/glob arg ให้ `node --test`** — bare `node --test` (auto-discover) เท่านั้น
- [ ] **ภาษาไทยในคอมเมนต์/ข้อความ** ตามสไตล์ repo; assertion message ต้องระบุ **ไฟล์ + สิ่งที่คาด + สิ่งที่เจอ**
- [ ] **CHANGELOG ทุก user-facing change** (`docs/rule.md §2`) — Keep a Changelog (Added/Changed) + **migration note** ที่ผู้ใช้ทำตามได้เองโดยไม่ต้องเดา
- [ ] **release-hygiene = wave สุดท้ายเสมอ** (`docs/rule.md §1` DAG-width) — ห้ามเริ่มก่อน T1-T5 integrate ครบ (จะได้ gate ที่ vacuous)
- [ ] **เอกสาร/CHANGELOG ที่เพิ่ม ต้องไม่มี dead link** — `lint:md` สแกน `src/` + `docs/` (EXCLUDE แค่ `src/.warnyin/template/` + `docs/stages/achieved/`); path ที่อ้างในเอกสารให้เขียนเป็น inline-code เว้นแต่ตั้งใจให้เป็นลิงก์ที่ resolve จริง

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` / `docs/techstack/**/rule.md` / `docs/features/**` ตอน BUILD — note ไว้ก่อน

- [ ] **rule ที่เสนอ (project):** "**existence-gate ต้อง assert ทุกก้อนของ payload ที่ผู้ใช้ต้องได้ ไม่ใช่แค่ก้อนที่เคยพัง**" — _เหตุผล:_ `verify-pack.mjs` assert แค่ 3 prefix (`workflow/`, `commands/warnyin/`, `skills/`) ที่เคยหลุดใน 0.6.0 → `src/.warnyin/template/` หายจาก tarball ได้โดย gate ยังเขียว (ผู้ใช้ได้ scaffold เปล่า) = **gate ลวง**; หลัก "pack-verify ต้อง testable" มีอยู่แล้วแต่ไม่ครอบ "ครบทุกก้อน" — evidence: topic `project-memory` design §6 (แถว packaging) + เคส P1
- [ ] **rule ที่เสนอ (project):** "**เอกสาร/template ที่ agent เขียนแล้ว commit ต้องบังคับ inline-code ห้าม markdown-link เมื่อไฟล์นั้นอยู่ใน SCAN_ROOTS ของ dead-link gate**" — _เหตุผล:_ ไฟล์ที่ agent เติมเนื้อหาเองตลอดอายุโปรเจกต์ (`docs/memory.md`) ถ้าเขียนลิงก์ชี้ `docs/stages/<slug>/` แล้ว SHIP `git mv` topic เข้า `achieved/` → `lint:md` **แดงถาวรโดยไม่มีใครแก้โค้ด**; `CODE_RE` strip inline-code ก่อน match → backtick ปลอดภัย 100% — evidence: `design.md §3.1` + เคส M6b
- [ ] **rule ที่เสนอ (component: installer/test):** "**MIN_PASS ต้อง bump พร้อม topic ที่เพิ่มเคส และคอมเมนต์ต้องระบุที่มาของตัวเลข**" — _เหตุผล:_ ค่าเดิม 46 ตกยุค (ยอดจริง 151) → gate หลวมจนตรวจไม่เจอกรณีไฟล์เทสหาย/ไม่ถูก discover (`pass === tests` ยังเขียวได้ถ้าเทสหายทั้งไฟล์) — evidence: baseline วัดจริง `pass 151 / tests 151` ก่อน integrate topic นี้
- [ ] **แจ้ง SHIP (นอก scope BUILD):**
  - **bump `package.json` `0.27.1` → `0.28.0`** (minor — feature ใหม่ backward-compatible) + เปลี่ยนหัวข้อ `## [Unreleased]` ใน `CHANGELOG.md` เป็น `## [0.28.0] - <วันที่ ship>` — `package.json` ไม่อยู่ใน ownership ของ task นี้
  - **`docs/infra.md`** — บันทึกว่า `npm run setup:dogfood` หลัง release จะ seed `docs/memory.md` เข้า working tree ของ repo นี้ (tracked) และไฟล์นั้นอยู่ใต้ข้อบังคับ C12 (ห้าม secret/absolute path/PII)
  - **`docs/features/project-memory/`** — สร้าง/อัปเดตตาม Spec delta ADDED/MODIFIED ใน `design.md §9`
