# Spec — Global install

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior · feature ผสม CLI (runtime) + payload `.md` → THEN = side-effect ที่ assert ได้ / artifact มีจริง
> **descriptive ไม่ใช่ imperative** · ค่าใน scenario ใช้ placeholder

## Requirement: ติดตั้งแบบ global ใช้ได้ทุกโปรเจกต์ (opt-in)

`npx @warnyin/agents --global` ติดตั้ง adapter → `~/.claude/{commands/warnyin,agents,skills}` + playbook → `~/.warnyin/{workflow,template}`; per-project (ไม่ส่ง flag / non-TTY) ยังเป็น default

### Scenario: --global ติดตั้งลง homedir
- GIVEN รัน `npx @warnyin/agents --global` (HOME ชี้ temp)
- WHEN installer เสร็จ
- THEN มี `~/.warnyin/workflow/` + `~/.claude/commands/warnyin/` + `~/.claude/CLAUDE.md` (มี marker `<!-- warnyin:global-note -->`); **ไม่สร้าง** `docs/stages/` ที่ cwd (skip scaffold)

### Scenario: ไม่ส่ง flag + non-TTY → project (CI-safe)
- GIVEN รัน installer ผ่าน pipe/non-TTY ไม่ส่ง flag
- WHEN installer รัน
- THEN ไม่ค้างรอ input + ติดตั้งแบบ project (ลง cwd) เหมือนพฤติกรรมเดิม (exit 0)

### Scenario: --global + --project พร้อมกัน → error
- GIVEN รัน `npx @warnyin/agents --global --project`
- WHEN installer parse flags (resolveMode)
- THEN exit ≠ 0 + ข้อความว่า flag ขัดแย้ง

### Scenario: global ไม่ทำลายไฟล์ user ที่มีอยู่ใน homedir
- GIVEN HOME(temp) มี `~/.claude/agents/<name>.md` + `~/.claude/CLAUDE.md` (เนื้อ user) อยู่ก่อน WHEN รัน `--global` (first-install)
- THEN ไฟล์ user ทั้งสองยังอยู่ ไม่ถูกแตะ; `~/.claude/CLAUDE.md` = note ถูก append ต่อท้าย (ไม่ overwrite)

### Scenario: รัน --global ซ้ำ → idempotent
- GIVEN รัน `--global` แล้วครั้งหนึ่ง WHEN รัน `--global` อีกครั้ง
- THEN `~/.claude/CLAUDE.md` มี note block เดียว (marker กัน append ซ้ำ)

### Scenario: homedir หาไม่ได้ / เป็น root → error (ไม่เขียน filesystem root)
- GIVEN `os.homedir()` คืน falsy หรือ filesystem root (เช่น `/`, `C:\`)
- WHEN รัน `--global`
- THEN exit ≠ 0 + ข้อความแนะนำใช้ `--project`

## Requirement: resolve playbook local-first → global fallback

เอกสารกลาง (CLAUDE.md/AGENTS.md/CLAUDE.global.md) ระบุ convention: path `.warnyin/...` หา `./.warnyin/` ก่อน ไม่มี → `~/.warnyin/`

### Scenario: convention มีใน root doc
- GIVEN ไฟล์ `src/.warnyin/installer/templates/CLAUDE.md`, `src/AGENTS.md`, `src/.warnyin/installer/templates/CLAUDE.global.md`
- WHEN grep ข้อความ resolution
- THEN พบกฎ local-first (`./.warnyin/`) → global fallback (`~/.warnyin/`) + workspace-guard (`docs/stages/` ไม่มี → `/warnyin:init`); `CLAUDE.global.md` = note-only + marker `<!-- warnyin:global-note -->`

### Scenario: marker idempotent ของ per-project CLAUDE.md คงอยู่
- GIVEN `src/.warnyin/installer/templates/CLAUDE.md`
- WHEN grep marker เดิม
- THEN ยังพบ `warnyin/workflow/stages/` (idempotent ของ `installRootDoc` per-project ไม่พัง)

## Requirement: /warnyin:init รับผิดชอบ workspace bootstrap

`/warnyin:init` สร้าง scaffold (`docs/stages/context.md` + `achieved/.gitkeep`) + seed `docs/` ถ้ายังไม่มี (idempotent) — ทำให้ global mode (installer ไม่ scaffold) มี workspace

### Scenario: init สร้าง workspace เมื่อไม่มี
- GIVEN playbook `src/.warnyin/workflow/init.md`
- WHEN อ่านขั้นตอน
- THEN มี step สร้าง scaffold + seed docs/ (อ่าน template local→global, ข้าม `[...]`, ไม่ทับของเดิม) ก่อนวิเคราะห์โปรเจกต์
