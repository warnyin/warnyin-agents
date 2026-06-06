# Issue (dry-run) — dogfood-bootstrap

> ผล DESIGN dry-run 2026-06-06 (read-only — ไม่แก้ไฟล์/โค้ด) · trace implement ในหัวจาก task 4 ไฟล์ + design §3/§4.5/§9 BL-3 + โค้ดจริง (`bin/cli.mjs`, `.gitignore`, root `CLAUDE.md`, template docs, `package.json`)

## สรุป: 1 BLOCKER (✅ RESOLVED) · 4 DEFER

> **✅ BK-1 RESOLVED (user decision 2026-06-06):** publish **0.6.0 (main ปัจจุบัน, `.warnyin/` layout, scaffold-leak/dotfolder fixed)** ขึ้น npm **ก่อน** เป็น dogfood baseline → `setup:dogfood` `npx @latest` = 0.6.0 (.warnyin layout) ทำงานตาม design · topic นี้กลายเป็น **0.7.0** · ดูรายละเอียด resolution ท้าย BK-1

---

## Blocker

### BK-1 — `@warnyin/agents@latest` บน npm = **0.5.2** (โครงเก่า) ไม่ใช่ 0.6.0 ★ HARD BLOCKER
ทั้ง task ออกแบบบนสมมุติฐานว่า `npx @warnyin/agents@latest` ดึง payload **0.6.0** (`.warnyin/` layout + seedDocs project/infra + `.claude/agents` + ensureScaffold `docs/stages/achieved/.gitkeep`). **แต่ที่ publish จริงบน npm คือ 0.5.2** (`npm view @warnyin/agents version` = `0.5.2`, `dist-tags.latest = 0.5.2`). repo local อยู่ที่ 0.6.0 แต่ยังไม่เคย publish (proposal §6 ระบุ "ไม่ publish เวอร์ชันใหม่ใน topic นี้").

**ผลจริงเมื่อ `setup:dogfood` รัน `npx @warnyin/agents@latest` (= 0.5.2) ที่ repo root** (ตรวจจาก `git show 5ec77a5:bin/cli.mjs`):
- **CORE ของ 0.5.2 = OLD layout** → copyTree วาง root: `warnyin/workflow/`, `warnyin/template/`, `.claude/commands/warnyin/`, `.claude/agents/` (ไม่ใช่ `.warnyin/` — เป็น `warnyin/` ไม่มีจุด)
- **`.gitignore` ของ task ครอบไม่ครบ:** patterns ที่ task เพิ่มคือ `/.warnyin/`, `/.claude/commands/warnyin/`, `/.claude/agents/`, `/CLAUDE.md`, `/AGENTS.md`. → `.claude/commands/warnyin/`+`.claude/agents/` ถูก ignore ✓ แต่ **`warnyin/` (ไม่มีจุด, root) ไม่ตรง pattern ไหนเลย → โผล่ใน `git status` + เปื้อน repo** (ยังชนกับ `docs/stages/achieved/2026-06-06-installer-test-ci/...` ไม่, แต่เป็น untracked tree ใหญ่ที่ไม่ถูกคุม)
- **SCAFFOLD ของ 0.5.2 = `copyTree('warnyin/stages')`** (พฤติกรรม leak เก่า ก่อน fix `e3c0074`) → วาง `warnyin/stages/...` ที่ root เพิ่ม (ก็ไม่ถูก ignore เช่นกัน)
- **seedDocs ของ 0.5.2** อ่านจาก `warnyin/template/docs/` (ไม่ใช่ `.warnyin/...`) — seed `docs/project.md`,`docs/infra.md`,`docs/rule.md`,`docs/troubleshooting.md`,`docs/codemap/index.md`. repo มี rule/troubleshooting/codemap แล้ว → skip; project.md/infra.md ที่ task สร้าง → skip ✓ (ส่วนนี้ BL-3 ปิดได้สำหรับ 2 ไฟล์นี้)
- **ensureScaffold ไม่มีใน 0.5.2** → `docs/stages/achieved/.gitkeep` ที่ task สร้างไว้กัน collision = **ไม่จำเป็นกับ 0.5.2** (แต่ repo มีอยู่แล้ว ไม่เสียหาย); แต่ถ้า publish 0.6.0 จริงค่อยจำเป็น
- **installRootDoc('CLAUDE.md', warnyin/installer/templates/CLAUDE.md)** — root `CLAUDE.md` ถูก ignore ด้วย `/CLAUDE.md` ✓ marker idempotent `warnyin/workflow/stages/` มีใน template 0.5.2 → append ทำงาน แต่ root CLAUDE.md จะมีเนื้อ **โครงเก่า** (ชี้ `warnyin/workflow/stages/` ไม่ใช่ `.warnyin/...`) → workflow ที่ dogfood ใช้เป็น 0.5.2 ไม่ใช่ v-next layout

**สรุปผลกระทบ:** acceptance criteria ข้อ 1 (`root มี .warnyin/, .claude/commands/warnyin/, .claude/agents/`) **FAIL** — จะได้ `warnyin/` (ไม่มีจุด) แทน `.warnyin/`; และ `git status` **ไม่สะอาด** (มี untracked `warnyin/` + `warnyin/stages/` ที่ไม่อยู่ใน `.gitignore`).

**ต้องให้ user ตัดสินก่อน BUILD — ตัวเลือก:**
1. **publish 0.6.0 ขึ้น npm ก่อน** แล้วค่อย `setup:dogfood` (ขัด proposal §6 "ไม่ publish ใน topic นี้" — ต้อง user ยืนยัน). หมายเหตุ: 0.6.0 ปัจจุบันยังไม่ผ่าน T1/T2 (bin ยังชี้ `bin/cli.mjs` ไม่ใช่ `src/bin/...`) — ลำดับ publish ต้องคิดร่วม transition
2. **pin เวอร์ชันให้ชัด** ใน `setup-dogfood.mjs` เป็นเวอร์ชันที่ publish จริงแล้วและมี `.warnyin/` layout — แต่ ณ ตอนนี้ **ไม่มี** เวอร์ชันบน npm ที่เป็น `.warnyin/` layout เลย (0.5.2 = ตัวล่าสุดและยังเป็น `warnyin/` เก่า)
3. **เลื่อน T4 verify** จนกว่าจะมี release `.warnyin/` layout — implement script ได้แต่ acceptance "root มี `.warnyin/`" + "git สะอาด" ทดสอบจริงไม่ผ่านจนกว่ามี release ที่ตรงโครง
4. **เพิ่ม `.gitignore` ให้ครอบ `/warnyin/` (ไม่มีจุด) ด้วย** เป็น safety net เผื่อ release transition — แต่ไม่แก้ปัญหา "dogfood ได้ layout เก่า"

> นี่เป็น hard blocker เพราะ trace กับ release จริง (0.5.2) แล้ว acceptance ข้อ 1 + git-clean **พิสูจน์แล้วว่า FAIL**; design BL-3 พิสูจน์ collision บนสมมุติฐาน "release = 0.6.0 layout" ซึ่งไม่ตรงความจริง

### ✅ Resolution (user เลือก option 1)
- **publish 0.6.0 ปัจจุบัน (main, ก่อน restructure) ขึ้น npm ก่อน** — 0.6.0 มี `.warnyin/` layout + scaffold-leak fix (`e3c0074`) + dotfolder fix แล้ว → เป็น dogfood baseline ที่ถูกต้อง · publish **0.6.0 as-is** (root layout, `bin/cli.mjs`) — การ restructure (→0.7.0) ย้าย **source** ไป `src/` เท่านั้น **ไม่เปลี่ยนสิ่งที่ installer วางลง target** (target ยังได้ `.warnyin/` เหมือนเดิม) → publish 0.6.0 อิสระจาก T1/T2
- **ลำดับ:** publish 0.6.0 (pre-BUILD step, นอก workflow เหมือน merge/publish) → BUILD restructure เป็น 0.7.0 → `setup:dogfood` `npx @warnyin/agents@latest` ได้ 0.6.0 → verify T4 end-to-end ได้จริง
- **`@latest` floor = 0.6.0:** ทุกเวอร์ชัน ≥0.6.0 installer วาง `.warnyin/` layout เสมอ (0.7.0 ที่ restructure แล้วก็ยังวาง `.warnyin/` ลง target) → `@latest` ปลอดภัย ไม่ต้อง pin
- **proposal §6 ("ไม่ publish ใน topic นี้")** → อัปเดต: publish 0.6.0 baseline เป็น prerequisite ที่ user อนุมัติแล้ว (เป็นการ publish เวอร์ชันที่มีอยู่ ไม่ใช่ publish ผลของ topic — ผล 0.7.0 ค่อย publish ภายหลังตามปกติ)
- safety-net `/warnyin/` (no-dot) ใน .gitignore: **ไม่จำเป็น** เพราะ ≥0.6.0 ไม่วาง layout เก่าแล้ว (optional, ข้ามได้)
- **สถานะ:** ✅ ปิด — ไม่มี blocker ค้าง เข้า BUILD ได้ (มี prerequisite: publish 0.6.0 ก่อน verify T4)

---

## Defer (ไม่ขวาง BUILD ของ script logic — จัดการตอนเขียน/T-ท้าย/SHIP)

### DF-1 — CHANGELOG + version bump (rule §2 / design §5.3 ข้อ 8)
task.md ไม่ list CHANGELOG ใน sub-tasks/acceptance ตรง ๆ — rule.md §1 ระบุ "ทำตอน T-สุดท้าย/SHIP". `setup:*` + restructure = user-facing → ต้องมี entry. **Defer ได้** (ทำรวมตอน BUILD ท้าย/SHIP) แต่ต้อง track ว่าใครทำ (ไม่ใช่ scope script ของ T4 โดยตรง).

### DF-2 — template docs ของ release อาจมีไฟล์ใหม่ที่ repo ยังไม่มี (collision เพิ่ม)
ประเมินจาก template ปัจจุบัน (`.warnyin/template/docs/`) เป็น proxy: non-bracket = `project.md`,`infra.md`,`rule.md`,`troubleshooting.md`,`codemap/index.md` — repo มีครบยกเว้น project/infra (task สร้าง) → skip หมด. **แต่ release จริงที่ npx ดึง (0.5.2) มี template docs ชุดเดียวกันพอดี** (ตรวจ `git ls-tree 5ec77a5` = 5 ไฟล์เดียวกัน) → ไม่มีไฟล์ใหม่เกิน. **Defer-monitor:** ถ้าอนาคต release เพิ่ม non-bracket doc ใหม่ (เช่น `docs/security.md`) จะ seed เปื้อนเพิ่ม → ตอนนั้นต้องสร้าง repo doc กันเพิ่ม. ปัจจุบัน **ไม่เปื้อนเกิน** (อิง 0.5.2).

### DF-3 — `.gitignore` root-anchored ไม่ไป match `src/` (source ปลอดภัย) — ยืนยันถูก ✓ (ไม่ใช่ issue)
trace แล้ว: leading `/` = anchor ที่ root repo → `/.claude/agents/` ignore แค่ `<root>/.claude/agents/` ไม่ match `src/.claude/agents/`. source ใน `src/` ยัง tracked. **ไม่มี issue** ข้อนี้ (เป็น defer-note ว่า BUILD ต้อง assert `git status --porcelain src/.claude/` ว่าง/tracked หลัง setup เพื่อปิดความเสี่ยงนี้จริง).

### DF-4 — shared `package.json` กับ T2 (`scripts` vs `files`/`bin`)
task.md §2 ระบุชัด: T4 **ต้องหลัง T2, ห้าม parallel** (Tech Lead S4); T4 แตะแค่ `scripts.setup:*`, T2 แตะ `files`/`bin`/`scripts.verify:pack`. dependency ระบุชัดแล้ว → ไม่มี merge conflict ถ้า BUILD เคารพลำดับ sequential. **Defer = แค่ต้องบังคับ build order** (build-wave ต้องไม่ schedule T2/T4 wave เดียวกัน). ไม่ใช่ blocker เชิง design.

---

## ประเด็นที่ trace แล้วผ่าน (ไม่เป็น issue)

- **#1 guard `pkgRoot===target`:** npx → pkgRoot = npm cache dir ≠ repo root → ผ่าน guard ✓; setup:sandbox → pkgRoot = `src/` (จาก `src/bin/cli.mjs`), target = `os.tmpdir()/wy-sandbox-*` ≠ src → ผ่าน ✓
- **#4 git mv CLAUDE.md→CONTRIBUTING.md ownership:** T1 task.md sub-task 1 git mv list **ไม่รวม** CLAUDE.md + ระบุ "ห้ามแตะ root CLAUDE.md (→ T4)" → **ไม่มี ownership conflict**; T4 เป็นเจ้าของ mv (task.md §2/§3.2 จัดการ "ตรวจสถานะก่อน, อย่า mv ซ้ำ" ถูกต้อง)
- **#5 setup-dogfood append idempotent:** marker append ของ task = `content.includes('CONTRIBUTING.md')`; marker ของ installRootDoc (release) = `warnyin/workflow/stages/` → **คนละ marker, ไม่ชน** → append pointer "CONTRIBUTING" idempotent ถูก (รันซ้ำ: รอบ 2 includes('CONTRIBUTING.md') = true → skip ✓)
- **#6 setup-sandbox spawn `node src/bin/cli.mjs`:** array args + ไม่ shell + `process.execPath` + `path.join` → cross-platform ✓; guard ผ่าน (ดู #1)
- **#8 ดู DF-4** (dependency ระบุชัด)
