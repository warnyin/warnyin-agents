# Spec — cli-global-mode

> feature ประเภท CLI (runtime จริง) → test-flow = behavior + side-effect ที่ assert ได้ (black-box spawn)

## persona
ผู้ใช้ที่รัน `npx @warnyin/agents --global` (ติดตั้งครั้งเดียวใช้ทุกโปรเจกต์) · contributor ที่รัน test

## data-flow
flag/TTY/answer → `resolveMode()` → mode → branch target (cwd|homedir) → copyTree CORE + (project: scaffold/seed/rootDoc | global: skip + `installGlobalNote`)

## user-flow
`npx @warnyin/agents [--global|--project]` → ไม่ระบุ+TTY → prompt → เลือก → ติดตั้ง; non-TTY/flag → ตรงไป mode นั้น

## test-flow (task-scope — black-box spawn + unit)
1. **unit `resolveMode()`** (export): `{globalFlag:true,projectFlag:true}`→throw · `{globalFlag:true}`→'global' · `{projectFlag:true}`→'project' · `{isTTY:false}`→'project' · `{isTTY:true,answer:'2'}`→'global' · `{isTTY:true,answer:''}`→'project'
2. **global install** (env `{HOME:tmp,USERPROFILE:tmp}`): รัน `--global` → assert `tmp/.warnyin/workflow/` + `tmp/.claude/commands/warnyin/` + `tmp/.claude/CLAUDE.md` (มี `<!-- warnyin:global-note -->`); **assert ไม่มี** `cwd/docs/stages/` (skip scaffold); side-effect อยู่ tmp ไม่ใช่ homedir จริง
3. **ไม่ทำลายไฟล์ user:** tmp/.claude/agents/my.md + tmp/.claude/CLAUDE.md (เนื้อ user) อยู่ก่อน → `--global` → ทั้งสองยังอยู่; CLAUDE.md = user content + note ต่อท้าย
4. **idempotent:** `--global` 2 ครั้ง → CLAUDE.md มี marker เดียว (note ไม่ซ้ำ)
5. **`--global --update`:** หลัง install → rerun → `~/.warnyin/` byte-equal/overwrite ok, note ไม่ซ้ำ
6. **`--global --project`** → `code !== 0` + stderr ระบุ conflict
7. **non-TTY default project:** spawn (non-TTY) ไม่ส่ง flag + `{timeout:N, input:''}` → `code===0`, ลง cwd, `signal !== 'SIGTERM'` (ไม่ค้าง)
8. **homedir guard:** mock homedir=root/'' → `--global` → `code !== 0` (ไม่เขียน root)
9. **regression:** เคสเดิม 1-9 (`installer.test.mjs`) เขียว assertion เดิม

## observable
- global → ไฟล์ลง homedir(temp) ครบ + note+marker; project(default/non-TTY) เหมือนเดิม; ไม่ค้าง non-TTY; ไม่ทำลายงาน user
