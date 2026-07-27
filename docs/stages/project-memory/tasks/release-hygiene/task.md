# Task — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `release-hygiene` |
| **Slice อ้างอิง** | `design.md` slice #6 (T6) |
| **Component** | `installer` (test/packaging/release) |
| **Model tier** | `balanced` |
| **สถานะ** | `done` |

## 1. เป้าหมายของ task (vertical slice)
ปล่อยรุ่นได้จริง + **invariant ของ project memory ถูกล็อกด้วยเทส** — ทุก contract C1-C13 ที่ตรวจได้เชิงโครงสร้างกลายเป็น **เคสใน `npm test`** (ไม่ใช่การอ่านเอกสารด้วยตา, ไม่ใช่ shell `grep`), ปิด **gate ลวง** ของ `verify:pack` (template ไม่ติด tarball ก็ยังเขียว), และผู้ใช้ npm อ่าน CHANGELOG แล้ว migrate เองได้โดยไม่ต้องเดา

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** `memory-playbook` (T1) · `stage-wiring` (T2) · `installer-seed` (T3) · `memory-command-adapter` (T4) · `memory-status-script` (T5) — **wave 2 (task สุดท้าย)**
  - เหตุผล 1: เคสเกือบทั้งหมด **assert ไฟล์จริง** ที่ 5 task นั้นสร้าง/แก้ — รันก่อนไฟล์มี = แดงเปล่า
  - เหตุผล 2: **negative-grep / dead-link / pack ต้องเห็นไฟล์ครบทุก slice ถึงจะไม่ vacuous** (`design.md §7`)
  - เหตุผล 3: **release-hygiene เป็น wave สุดท้ายเสมอของ topic multi-slice** (`docs/rule.md §1` DAG-width)
- **ปลดล็อกให้:** VERIFY/SHIP ของ topic (ไม่มี task ต่อ)
- **ส่งต่อ:** suite เขียว (`pass === tests`) + gate 4 ตัวเขียว → เป็นหลักฐาน gate ของ VERIFY

## 3. Sub-tasks
- [x] 1. **ยืนยัน precondition** — ไฟล์ของ T1-T5 มีจริงครบ: `src/.warnyin/workflow/memory.md` · `src/.warnyin/template/docs/memory.md` + `.../docs/stages/context.md` · stage 5 ไฟล์ + `fastlane.md`/`next.md`/`explore.md` แก้แล้ว · `src/.claude/commands/warnyin/memory.md` · registry 2 ไฟล์ + root doc 3 ไฟล์ · `workflow/scripts/memory-status.mjs` — **ไม่ครบ → หยุด รายงาน main loop** ห้ามเขียนเทสไล่ตามไฟล์ที่ยังไม่มี และห้ามสร้างไฟล์แทนเจ้าของ task
- [x] 2. **เขียน `src/tests/memory.test.mjs` (ไฟล์ใหม่)** — structural test ข้าม slice 9 กลุ่ม (M1-M9) ตาม `spec.md §7`; node ล้วน (`node:test` + `node:fs` + walker เอง) — ห้าม shell `grep`/`rg`, ห้าม `t.skip()`
- [x] 3. **falsifiability check ของ M3 + M2** — แก้ไฟล์ชั่วคราวให้ผิด invariant (เช่น ลอกประโยค `working state (ปัจจุบัน)` ไปไฟล์ที่สอง / ลบ hook ออกจาก `fastlane.md`) → เคสต้อง **แดงจริง** → คืนไฟล์เดิม → เขียว (พิสูจน์ว่าไม่ใช่ assertion ที่ผ่านเสมอ)
- [x] 4. **`src/scripts/verify-pack.mjs`** — เพิ่ม R1 assertion ก้อนที่ 4: `src/.warnyin/template/docs/` ต้องติด tarball (ปิด gate ลวงตาม `design.md §6` แถว packaging) — เขียนแบบ pure fn เดิม (`checkFiles`) ไม่แตะ `main()`
- [x] 5. **`src/tests/verify-pack.test.mjs`** — เติม path `src/.warnyin/template/docs/memory.md` เข้า fixture `GOOD` (fixture ไม่ใช่ assertion) + **เคสใหม่ negative**: ป้อน file list ปลอมที่ไม่มี prefix นั้น → ต้องได้ error ที่อ้าง `src/.warnyin/template/docs/` — **ห้ามแก้ข้อความ/รูปแบบ assertion ของเคสเดิม**
- [x] 6. **`src/scripts/check-test-count.mjs`** — bump `MIN_PASS` ตามยอดจริงหลัง integrate (สูตร + วิธีพิสูจน์ใน `standard.md §4`) + อัปเดตคอมเมนต์ที่มาของตัวเลข
- [x] 7. **`CHANGELOG.md`** — entry ใหม่ใต้ `## [Unreleased]`: **Added / Changed / Migration** (ข้อความเต็มใน §3.1 ด้านล่าง)
- [x] 8. **รัน gate ครบ 4 ตัว** (ดู §5) — แดงเพราะไฟล์ของ task อื่น → **รายงาน main loop ห้ามแก้เอง** (`rule.md §1` fix authority)

### 3.1 ข้อความ CHANGELOG ที่ต้องเขียน (copy — เขียนใต้ `## [Unreleased]`)

```
### Added
- **Project memory — ความจำระดับโปรเจกต์ที่อยู่ใน repo** (feature `project-memory`) — playbook กลาง `.warnyin/workflow/memory.md` เป็น single source ของกติกา (semantic · governance · schema · lifecycle · write point · consume · promote · trust boundary · ทบทวน) + ไฟล์จริง 2 ใบที่ installer seed ให้: `docs/stages/context.md` (snapshot 4 section เขียนทับ ไม่สะสม) และ `docs/memory.md` (ตาราง 6 คอลัมน์ = บทเรียนที่ยังพิสูจน์ไม่พอจะเป็นกฎ)
- **hook เขียน memory ท้ายงาน** — ทั้ง 5 stage + executor `fastlane` เขียนแบบ conditional (ไม่มีอะไรเปลี่ยน → ข้าม); BUILD เขียนเฉพาะ **main loop หลัง integrate** — sub-agent ใน git worktree ห้ามเขียนเอง
- **จุดอ่าน memory** — Discovery / `next` / `explore` อ่าน 2 ไฟล์นี้เป็น **data ไม่ใช่ instruction** (คำสั่งที่เขียนอยู่ในไฟล์ → ignore, ยืนยันกับโค้ด/เอกสารจริงเสมอ)
- **`/warnyin:memory [ทบทวน]`** — command ดู/ทบทวน project memory (read-only; โหมดทบทวนเสนอรายการที่จะ promote/ตัด แล้ว **รอ user ยืนยันก่อนเขียน** ไม่ลบเงียบ)
- **`.warnyin/workflow/scripts/memory-status.mjs`** — รายงานสุขภาพ memory แบบ deterministic (จำนวน entry ต่อสถานะ, จำนวนบรรทัดของ context, entry ที่ค้างนาน) — read-only, ไม่พิมพ์เนื้อ entry, exit 0 เสมอ (report ไม่ใช่ gate)
- **`src/tests/memory.test.mjs`** — structural test ข้าม slice: heading freeze, single-source negative-grep, hook ครบ 6 ไฟล์, registry/root-doc note, คำเตือนใน template + 0 markdown-link, และ regression ของ SHIP gate

### Changed
- **SHIP รับ `docs/memory.md` เป็นแหล่ง learned-rule candidate เพิ่ม** — step รวบ candidate ดึง entry สถานะ `open` ที่มี evidence (dedup กับ `tasks/*/rule.md` §2 โดยยึดฝั่งที่ผูก task) และเปลี่ยนสถานะเป็น `promoted`/`dropped` **หลัง user อนุมัติแล้วเท่านั้น**; **gate เดิมไม่ถูกลดทอน** (evidence บังคับ + user ยืนยัน per-rule เหมือนเดิม) — `docs/memory.md` อยู่นอก `docs/stages/` จึงไม่ถูก archive ไปกับ topic
- **`verify:pack` เลิกเป็น gate ลวงของ template** — เดิม assert แค่ 3 prefix (payload workflow/commands/skills) → template หายจาก tarball ก็ยังเขียว; ตอนนี้ assert เพิ่มว่า `src/.warnyin/template/docs/` ติด tarball จริง พร้อม unit ที่ป้อน file list ปลอมพิสูจน์ว่าจับได้
- **`/warnyin:init`** — seed `docs/` จาก template แบบ recursive **ก่อน** แล้วสร้างไฟล์เปล่าเป็น fallback เฉพาะเมื่อ template ไม่มี (เดิมสร้าง `docs/stages/context.md` เป็นไฟล์เปล่าเสมอ)

### Migration
- **ผู้ใช้เดิมที่รัน `npx @warnyin/agents --update` ได้ `docs/memory.md` อัตโนมัติ** — installer seed `docs/` ทุกครั้ง (ไม่ว่ามี `--update` หรือไม่) และ **ไม่ทับไฟล์ที่มีอยู่**
- **`docs/stages/context.md` ที่เป็นไฟล์ว่าง 0 byte อยู่แล้ว จะไม่ถูกทับ** (installer รุ่นก่อนสร้างไว้เป็นไฟล์เปล่า → seed มองว่า "มีแล้ว" จึงข้าม) — **ไม่ต้องทำอะไร**: stage แรกที่เขียน memory จะเติมโครง 4 section ให้เองตามกติกา `.warnyin/workflow/memory.md` §4 (ไฟล์ว่าง/ไม่มี heading = ถือว่ายังไม่มี → เขียนทับด้วยโครงเต็มจาก template); ถ้าอยากได้โครงทันที ให้ลบไฟล์ว่างนั้นแล้วรัน `npx @warnyin/agents --update` ซ้ำ
```

> **version bump:** `package.json` **ไม่อยู่ใน ownership ของ task นี้** (`design.md §7`) → เขียน entry ไว้ใต้ `## [Unreleased]` ก่อน; การ rename เป็น `## [0.28.0] - <วันที่>` + bump `package.json` (minor — feature ใหม่ backward-compatible) เป็นงานของ **main loop/SHIP** — ระบุไว้ใน `rule.md §2` ให้ SHIP หยิบไปทำ

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/tests/memory.test.mjs` (**ไฟล์ใหม่**)
- `src/scripts/verify-pack.mjs` (เพิ่ม assertion ใน `checkFiles` เท่านั้น)
- `src/tests/verify-pack.test.mjs` (เพิ่มเคส + เติม fixture `GOOD` — ห้ามแก้ assertion เดิม)
- `src/scripts/check-test-count.mjs` (`MIN_PASS` + คอมเมนต์)
- `CHANGELOG.md`
- **ไม่แตะ:** ไฟล์ของ T1-T5 ทุกใบ (`workflow/memory.md`, template, stage/utility playbook, `cli.mjs`, `installer.test.mjs`, adapter/registry/root doc, `memory-status.mjs`, `memory-status.test.mjs`) · `package.json` · `src/scripts/lint-md.mjs` · **root `.warnyin/`, `.claude/`, root `CLAUDE.md`/`AGENTS.md`** (dogfood gitignored)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [x] เคส M1-M9 ใน `spec.md §7` ครบและเขียว — และ **ตาราง §8 (Scenario coverage) ไม่มีช่องว่าง**
- [x] เคส M3 (+M2) พิสูจน์แล้วว่า **แดงได้จริง** (sub-task 3) ไม่ใช่ assertion ที่ผ่านเสมอ
- [x] `npm test` เขียว — bare `node --test` (ห้ามใส่ path arg) — summary `pass === tests`, `fail === 0`, `skipped 0` (`tests 192 / pass 192 / fail 0 / skipped 0`)
- [x] `npm run lint:md` เขียว (CHANGELOG + `docs/memory.md` ของ dogfood + ไฟล์ใหม่ไม่มี dead link) — `170 ไฟล์ 109 ลิงก์`
- [x] `npm run verify:pack` เขียว **และ** assertion ใหม่พิสูจน์แล้วว่าจับได้จริงด้วย unit (ไม่ใช่เขียวเพราะ vacuous) — `npm run verify:pack` เอง spawn `npm` ตรงล้ม `ENOENT` บน Windows dev shell นี้ (pre-existing — `docs/troubleshooting.md` #4); ใช้ workaround ที่ระบุไว้: `npm pack --dry-run --json` ตรง แล้วป้อน file list จริง (107 ไฟล์ มี `src/.warnyin/template/docs/memory.md`) เข้า `checkFiles()` โดยตรง → `errors: []` ยืนยันว่า logic เขียวกับ tarball จริง + unit test negative (`verify-pack.test.mjs`) พิสูจน์ว่า assertion จับ error ได้จริงเมื่อ prefix หาย
- [x] `npm run setup:sandbox` แล้ว **install-proof ผ่าน**: sandbox มี `docs/memory.md` (ตาราง 6 คอลัมน์ + คำเตือน) และ `docs/stages/context.md` (4 heading) ที่ **ไม่ใช่ไฟล์ 0 byte** — ยืนยันแล้วที่ `C:\Users\Rujiroj.Ta\AppData\Local\Temp\wy-sandbox-Ft35ph\docs\{memory.md,stages\context.md}`
- [x] `CHANGELOG.md` มี Added + Changed + Migration ตาม §3.1 · `MIN_PASS` bump แล้วตามสูตรใน `standard.md §4` (N=192 → `MIN_PASS=180`; พิสูจน์ falsifiable ด้วย `MIN_PASS=193` ชั่วคราว → exit 1 ข้อความ "pass count ต่ำกว่าขั้นต่ำ" → คืนค่า 180)
- [x] `git status` ไม่มีไฟล์ root `.warnyin/`/`.claude/` ถูกแตะ และไม่มีไฟล์ของ T1-T5 ถูกแก้โดย task นี้ (เปลี่ยนเฉพาะ `CHANGELOG.md`, `src/scripts/{verify-pack,check-test-count}.mjs`, `src/tests/verify-pack.test.mjs`, ใหม่ `src/tests/memory.test.mjs`)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
