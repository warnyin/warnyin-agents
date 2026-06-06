# Task — move-source-to-src

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ — รากฐานของ topic (ต้องเสร็จก่อนทุก task)

| | |
|---|---|
| **Task** | `move-source-to-src` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` |
| **สถานะ** | `✅ build เสร็จ` (merge ad2316e · 9/9 test · fresh install payload ตรง) |

## 1. เป้าหมายของ task (vertical slice)
ย้าย **source ของ warnyin ทั้งหมดเข้า `src/`** (git mv ตาม design §3) + ปรับ `src/bin/cli.mjs` (pkgRoot/guard comment) + แก้ `package.json` ขั้นต่ำ (`bin`→`src/bin/cli.mjs`) ให้ **installer ยัง copy `src/* → target/*` ถูก และ `node --test` ยังรัน 9 เคสเดิมเขียว** — slice verify ได้ end-to-end ในตัว (SA S3)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** — (ไม่มี — เป็น task แรกของ topic)
- **ปลดล็อกให้:** `tasks/packaging-config` (T2), `tasks/test-suite-relocation` (T3), `tasks/dogfood-bootstrap` (T4), `tasks/docs-sync` (T5) — ทุก task ขึ้นกับ path ใหม่ใต้ `src/`
- **ส่ง output ต่อ:** โครง `src/**` ที่ committed + `package.json` ที่ `bin` ชี้ `src/bin/cli.mjs` + `scripts.test` รันได้ → T2/T3 ต่อยอดบนโครงนี้
- ⚠ **`package.json` แชร์กับ T2/T4** — task นี้แก้แค่ `bin` (+ ยืนยัน `scripts.test`) เท่านั้น **อย่าแตะ** `files`/`scripts` อื่น (กัน merge collision · Tech Lead S4)

## 3. Sub-tasks (มีลำดับ)
- [ ] 1. **git mv source → `src/`** ตาม design §3 mapping: `bin/`, `tests/`, `scripts/`, `.warnyin/`, `.claude/commands/warnyin/`, `.claude/agents/`, `AGENTS.md` — _ผลลัพธ์:_ source อยู่ใต้ `src/` ทั้งหมด, git track การย้าย (ไม่ copy+delete)
- [ ] 2. **ยืนยัน `src/bin/cli.mjs` pkgRoot** — _ขึ้นกับ 1:_ ตรวจ `pkgRoot = resolve(dirname, '..')` resolve เป็น `src/` ถูก → CORE constant + installRootDoc src path + copyTree ทำงานได้โดยไม่แก้ logic
- [ ] 3. **แก้ comment guard** `pkgRoot===target` ใน `src/bin/cli.mjs` ให้ตรงพฤติกรรมใหม่ (no-op โดยตั้งใจ, เก็บ guard ไว้ defensive) — _ขึ้นกับ 2:_ **ห้ามแก้ logic guard / ห้ามเพิ่ม guard ใหม่**
- [ ] 4. **แก้ `package.json` ขั้นต่ำ** — `bin.warnyin-agents` → `src/bin/cli.mjs`; ยืนยัน `scripts.test` = `node --test` (bare) ยังรันได้ — _ขึ้นกับ 1:_ **ไม่แตะ** `files`/`scripts` อื่น
- [ ] 5. **รัน acceptance** — `node --test` จาก root → 9 เคสผ่าน; install สดจาก `src/bin/cli.mjs` ลง temp → payload ถูก (sub-task 6 ใน spec test-flow)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **ย้าย (git mv):** `bin/ tests/ scripts/ .warnyin/ .claude/commands/warnyin/ .claude/agents/ AGENTS.md` → ใต้ `src/`
- **แก้เนื้อหา:** `src/bin/cli.mjs` (comment guard เท่านั้น), `package.json` (`bin` เท่านั้น)
- **ห้ามแตะ:** root `CLAUDE.md` (→ T4), `package.json files`/`scripts` อื่น (→ T2/T4), `.gitignore` (→ T4), `src/scripts/verify-pack.mjs` allowlist (→ T2), test/harness (mirror รักษา relative path → ไม่ต้องแก้), `.github/workflows/ci.yml` (→ T2)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [x] source ทั้งหมดอยู่ใต้ `src/` ตาม mapping design §3 (root ไม่เหลือ `bin/ tests/ scripts/ .warnyin/ AGENTS.md` และ `.claude/{commands/warnyin,agents}`) — ✅ git mv (R100 rename ทั้งหมด), root `.warnyin/` หายจาก git
- [x] `node --test` จาก repo root (bare) เห็น **9 เคสเดิมผ่าน** (pass count 9 — ไม่ใช่แค่ exit 0) โดย **ไม่แก้ไฟล์ test** — ✅ tests 9/pass 9/fail 0
- [x] install สดจาก `src/bin/cli.mjs` ลง temp → payload (`.warnyin/`, `.claude/{commands/warnyin,agents}`, `CLAUDE.md`, `AGENTS.md`) มาจาก `src/.warnyin`/`src/.claude`/`src/AGENTS.md` ถูก — ✅ `diff -q` ยืนยัน identical กับ src/
- [x] `package.json bin.warnyin-agents` = `src/bin/cli.mjs`; `scripts.test` = `node --test`; `files`/`scripts` อื่นไม่ถูกแตะ — ✅ diff แตะแค่ `bin`
- [x] comment guard `pkgRoot===target` ตรงพฤติกรรมใหม่ (no-op โดยตั้งใจ) — logic guard ไม่เปลี่ยน, ไม่มี guard ใหม่ — ✅ แก้แค่ comment
- [x] ผ่าน test ตาม `spec.md` (test-flow)
- [x] ทำตาม `rule.md` และ `standard.md` (zero-dep, ESM, idempotent, ห้าม copy workspace, black-box test)

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Design ต้นทาง: `../../design.md` (§1, §2 slice1, §3, §4.1, §7, §9)
