# Spec — fastlane-test-release

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task

## 1. ชนิดของ task
`logic` (test) + release hygiene — ไม่มี API/UI/data-flow ใหม่ (payload `.md` ล้วน; task นี้เขียน **test ที่พิสูจน์ payload** + CHANGELOG + version)

## 4. Data-flow
`src/.warnyin/workflow/*.md` + `src/.claude/commands/warnyin/*.md` (ผลของ task 1+2)
→ อ่านด้วย `node:fs` (`readdirSync`/`readFileSync`) ใน test **หรือ** spawn `src/bin/cli.mjs` ลง `mkdtemp`
→ assert เป็น error/pass ของ `node --test` → `check-test-count.mjs` (`pass===tests`, `fail===0`)

## 6. Persona
maintainer/CI — ต้องพิสูจน์ได้ว่า `/warnyin:fastlane` **ติดตั้งจริง** + กฎ **ไม่ drift 2 ที่** โดยไม่ต้องอ่านเอกสารด้วยตา

## 7. Test-flow
> เขียนที่ `src/tests/installer.test.mjs` (reuse harness `makeTempProject`/`runCli`/`ok`) — เคส structural/canonical ที่ไม่ต้อง spawn cli จะแยกไป `src/tests/fastlane.test.mjs` ก็ได้ (bare `node --test` discover เอง)
> **ทุกเคสเป็น node ล้วน cross-platform** (`node:test` + `node:fs`) — ห้ามเรียก shell `grep`/`rg`, ห้าม `t.skip()`

**A. install proof (black-box spawn)**
- [ ] A1 — temp project เปล่า → `runCli(tmp)` → `ok(r)` + มี `.warnyin/workflow/fastlane.md` (target-side path ไม่มี prefix `src/`)
- [ ] A2 — temp project เดียวกัน → มี `.claude/commands/warnyin/fastlane.md`

**B. canonical falsifiable (negative-grep ด้วย `node:fs` — ตัวจับ drift ที่ full-gate มองไม่เห็น)**
- [ ] B1 — `readdirSync('src/.warnyin/workflow', {recursive:true})` → ไฟล์ `.md` ที่มีประโยค `` pre-flight: สร้าง `receipt.md` จาก template `` ต้องมี **1 ไฟล์เท่านั้น** และเป็น `triage.md` (assert ทั้ง `length===1` และชื่อไฟล์ — กัน false-green ถ้า string เพี้ยน)
- [ ] B2 — `fastlane.md` ต้อง **ไม่มี** รายชื่อ 5 หมวด hard-floor แบบเต็ม (assert ว่าไม่ปรากฏ token ครบทั้งชุด `auth/authz` · `data-migration` · `secret` · `public-API` · `security-sensitive` ในไฟล์เดียว — ชี้ `triage.md` แทน)
- [ ] B3 — `fastlane.md` ต้อง **ไม่มี** คู่คำ `config-protection` **และ** `investigate-before-edit` พร้อมกัน (prose-duplication ของ BUILD floor → ต้องเป็น pointer)

**C. anchor structural (`lint-md` ตัด anchor ทิ้ง → เช็คเอง)**
- [ ] C1 — สแกนทุก `.md` ใต้ `src/.warnyin/workflow/` หา link `](...triage.md#fast-track-skip-list)` → ต้องมี heading ใน `triage.md` ที่ slugify แล้วได้ `fast-track-skip-list` (คือ `## Fast-track skip-list`) — heading หาย/ถูกเปลี่ยน → เคสนี้แดง

**D. consistency (contract C4 — คำต่อคำ)**
- [ ] D1 — string C4 (`รันงานขนาด fast จบในคำสั่งเดียว — บังคับ tier=fast: แก้โค้ดจน test เขียว + acceptance ผ่าน → receipt → ship-lite + archive`) ปรากฏใน frontmatter `description:` ของ `src/.claude/commands/warnyin/fastlane.md`
- [ ] D2 — string เดียวกัน (คำต่อคำ) ปรากฏใน registry ครบ 3 ไฟล์: `src/.warnyin/workflow/README.md` · `src/.warnyin/installer/templates/CLAUDE.md` · `src/.warnyin/installer/templates/codebuddy-rules.md` — declare string **ครั้งเดียว** เป็น const แล้ววนเช็ค (กัน copy เพี้ยนในตัว test เอง)

**E. ordering proxy (acceptance ประกาศก่อนแก้ — กัน goalpost moving)**
- [ ] E1 — ใน `fastlane.md` : index ของบรรทัด step "เขียน receipt … §1 + §2" **< ** index ของบรรทัด step "แก้โค้ด" (หา index ด้วย `content.split('\n').findIndex(...)`; ถ้าหาไม่เจอบรรทัดใดบรรทัดหนึ่ง → fail ไม่ใช่ pass เงียบ)

**F. regression**
- [ ] F1 — `src/.warnyin/workflow/stages/{design,build,verify,ship}.md` ครบ 4/4 ยังมี link `[fast-track skip-list](../triage.md#fast-track-skip-list)`
- [ ] F2 — 4 ไฟล์เดียวกัน **ไม่มีตาราง skip-list inline** (ไม่ปรากฏ header row ของตาราง skip-list ใน stage ไฟล์)
- [ ] F3 — adapter `src/.claude/commands/warnyin/triage.md` ยัง read-only: มีคำว่า `แนะนำแล้วหยุด` + **0 write-intent** (ไม่มีคำสั่งเขียน/สร้างไฟล์)
- [ ] F4 — `readdirSync('src/.claude/skills')` **ไม่มี** entry ชื่อ `fastlane` (เจตนา command-only — stateful/irreversible ห้าม auto-invoke)
- [ ] F5 — full suite: `pass === tests`, `fail === 0` (ตรวจโดย `check-test-count.mjs` ใน CI; local ดูจาก summary ของ `npm test`)

**G. release hygiene (ไม่ใช่ test — verify ด้วย gate)**
- [ ] G1 — `CHANGELOG.md` มี entry version ใหม่ (Keep a Changelog): **Added** `/warnyin:fastlane` · **Changed** hard-floor รับ explicit user override
- [ ] G2 — `package.json` version bump minor `0.26.0` → `0.27.0` (test version-stamp เดิมอ่าน version สดจาก `package.json` → ต้องยังเขียว ไม่ hardcode)
- [ ] G3 — `npm test` + `npm run lint:md` + `npm run verify:pack` เขียวทั้งหมด
