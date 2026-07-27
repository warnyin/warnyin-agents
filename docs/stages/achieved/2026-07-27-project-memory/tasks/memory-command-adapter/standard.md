# Standard — memory-command-adapter

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack)

> อ้างอิง `docs/techstack/installer/standard.md`

- **mirror layout `src/` = target path** — โครงใน `src/` สะท้อน path ตอน install เป๊ะ (ไม่มี mapping table) → สร้างไฟล์ที่ `src/.claude/commands/warnyin/memory.md` แล้วมันจะไปโผล่ที่ `.claude/commands/warnyin/memory.md` ของ target เอง
- **registry-target ของ root dogfood file = installer template** — slash-command list ที่ผู้ใช้ปลายทางเห็นอยู่ `src/.warnyin/installer/templates/{CLAUDE.md,codebuddy-rules.md}` (ใน `package.json files`) **ไม่ใช่** `CLAUDE.md` ที่ root (gitignored)
- **command namespace = โฟลเดอร์ `.claude/commands/warnyin/`** — `/warnyin:memory` ← `warnyin/memory.md` (flat ไม่ใช่ nested; nested `<group>/<action>.md` ใช้กับ `/warnyin:<group>:<action>` เท่านั้น เช่น `feedback/issue.md`) → **ไม่ต้อง mkdir ใหม่** (โฟลเดอร์มีอยู่แล้ว)
- **packaging ไม่ต้องแก้** — `copyTree` recursive + `verify-pack` prefix allowlist (`src/.warnyin/`, `src/.claude/commands/`) + `ALLOWED_FILE` มี `src/AGENTS.md` อยู่แล้ว → **ห้ามแตะ `package.json` / `verify-pack.mjs` / `cli.mjs` / `lint-md.mjs`**
- **CodeBuddy commands ใช้ shared source** — `cli.mjs` copy `.claude/commands/warnyin/*` เข้า `.codebuddy/plugins/warnyin/commands/warnyin/` ให้เอง → **ห้าม duplicate ไฟล์ command ไปวางในโฟลเดอร์ codebuddy**
- **root doc append-with-marker** — `CLAUDE.global.md` เป็น note-only ที่ถูก append เข้า `~/.claude/CLAUDE.md` ใต้ marker `<!-- warnyin:global-note -->`; เนื้อที่เพิ่มต้องอยู่ **ใต้ marker** (ไม่ใช่เหนือ) และ marker ห้ามถูกแตะ
- **CHANGELOG / version bump** เป็นของ `tasks/release-hygiene/` (wave 2) — task นี้ห้ามแตะ

## 2. Pattern การเขียนโค้ดของ task นี้

- **canonical-copy (สำคัญสุด):** ทุกข้อความที่เพิ่ม **copy คำต่อคำจาก `design.md §4`** (C6, C7) — ไม่ย่อ ไม่เกลา ไม่แปลง backtick/`**bold**`/วงเล็บ/ขีดกลาง; T6 diff แบบ string ตรงตัว (precedent `fastlane.test.mjs` D1-D3 ประกาศ canonical string เป็น `const` แล้ววนเช็คทุก consumer)
- **adapter บาง = orchestration ล้วน:** command บอกแค่ **อ่าน playbook ไหน · โหมดอะไร · ลำดับ · หยุดตรงไหน** — ห้ามลอก schema/closed-set/เกณฑ์ตัวเลข/lifecycle ของ memory ลงมา (เหมือน `triage.md`/`fastlane.md`/`next.md` ที่ไม่ลอกกฎของ playbook ตัวเอง)
- **โครงไฟล์ command:** frontmatter 2 field (`description`, `argument-hint`) → บรรทัดนำ 1 ประโยค (`ทำหน้าที่เป็น… ตาม **playbook กลาง** ของ workflow มาตรฐาน`) → รายการเลข 1-5 · **ข้อ 1 = "อ่าน `.warnyin/workflow/memory.md` ให้ครบก่อน แล้วทำตามทุกหลักการในนั้นอย่างเคร่งครัด"** (wording เดียวกับ command อื่นในชุด) · **ข้อสุดท้าย = ไม่รัน stage ต่อให้เอง เสนอ command แล้วหยุด**
- **safety wording ต้องอยู่ในบรรทัดของโหมดนั้น** (ไม่แยกไปท้ายไฟล์): โหมดดู → `read-only เด็ดขาด — ห้ามสร้าง/แก้/ลบไฟล์ใดๆ` · โหมดทบทวน → `รอ user ยืนยันก่อนเขียน` + `ห้ามลบเงียบ` — guard ที่ห่างจุดใช้งานถูกมองข้าม (บทเรียน panel Sec-B2 ของ topic นี้)
- **minimal diff:** ไฟล์เดิม 4 ไฟล์ = **แทรกอย่างเดียว ไม่แก้บรรทัดเดิมสักบรรทัด** ไม่ reflow ไม่จัด format ใหม่ ไม่แตะ whitespace รอบข้าง; แทรก section ให้มีบรรทัดว่างคั่นหัว-ท้ายตาม style เดิมของไฟล์
- **ลำดับในรายการ slash command:** วาง `/warnyin:memory` **ใต้ `/warnyin:next`** ทั้ง 2 registry (จัดกลุ่มกับ utility read-only ที่รายงานสถานะ) — ให้ลำดับตรงกันทั้งสองไฟล์
- **path เขียนเป็น inline-code เสมอ ห้าม markdown-link** — ปลายทางบางตัวยังไม่มีตอน build (`workflow/memory.md`, `scripts/memory-status.mjs`) และ `lint-md.mjs` สแกน `src/`; `CODE_RE` strip inline-code ก่อนเช็ค → ปลอดภัย
- **ภาษาไทย + tool-agnostic:** อ้าง path/command กลาง ไม่ผูกชื่อรุ่นหรือผลิตภัณฑ์ของ harness ใด (ยกเว้นชื่อไฟล์ adapter ที่เป็นข้อเท็จจริงของ path)
- **EOL:** ไฟล์ `.md` ใหม่เป็น **LF ล้วน ไม่มี BOM** (บทเรียน CRLF: commit `0a2e7c4`)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)

- **precedent ของ command adapter:** `src/.claude/commands/warnyin/{triage.md,fastlane.md,next.md}` — ลอก **โครง/น้ำเสียง** (ไม่ใช่เนื้อ) จาก 3 ไฟล์นี้
- **canonical ของกติกา memory:** `.warnyin/workflow/memory.md` (T1 เป็นเจ้าของ) — อ้างด้วย inline-code เท่านั้น
- **แหล่งตัวเลขสุขภาพ:** `.warnyin/workflow/scripts/memory-status.mjs` (T5) — เรียกแบบ conditional "รันไม่ได้ → ข้าม"
- **contract คำต่อคำ:** `docs/stages/project-memory/design.md §4` C6/C7 — **แหล่งเดียว** ห้ามแต่งใหม่ต่อไฟล์
- **gate ที่มีอยู่:** `src/scripts/lint-md.mjs` (link resolution) + `check-test-count.mjs` (`pass === tests`) + `verify-pack.mjs` — ใช้เช็ค **ห้ามแก้ตัว gate**

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)

> pattern ใหม่ที่ task นี้แนะนำ — ถ้าควรเป็นมาตรฐานกลาง ให้ note ใน `rule.md` (รอ SHIP อัปเดต standard กลาง)

- **two-mode utility command (read-default / write-on-confirm):** command เดียวที่มีทั้งโหมดอ่านและโหมดเขียน ให้ **default = read-only** และให้โหมดเขียนต้องระบุ arg ชัด + ยืนยันรายตัวก่อน side-effect — ผู้ใช้พิมพ์ command เปล่าแล้วต้องปลอดภัยเสมอ (ขยายผลของ `action-utility command = confirm ก่อน side-effect`)
- **contract-string ชนะ pattern ประจำไฟล์:** ไฟล์ registry ที่มี style ของตัวเอง (เช่น `codebuddy-rules.md` ตัด path ในวงเล็บออก) ต้อง **ยอมรับ contract string ตามเดิม** เมื่อ string นั้นถูก assert แบบ string-equality — กัน paraphrase ที่ทำให้ test แดงและเกิด drift
