# Task — cli-global-mode

> หน่วยที่โยนให้ sub-agent ทำใน BUILD · ชี้ canonical `design.md` §3/§4 (ไม่ลอก)

| | |
|---|---|
| **Task** | `cli-global-mode` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (`cli.mjs` + test) |
| **Model tier** | `deepest` (async refactor + data-loss-sensitive global write + cross-platform homedir + harness env + test ครบ) |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
เพิ่ม **global mode** ใน `src/bin/cli.mjs`: flag `--global`/`--project` + `resolveMode()` (pure-fn) + TTY prompt + branch target → `os.homedir()` (skip scaffold/seed) + `installGlobalNote()` (note-only, marker) + echo paths + homedir guard — พร้อม **ขยาย test harness** + เคส global/regression ใน `installer.test.mjs`

## 2. Dependency
- **ต้องทำหลัง:** — (wave 1; อ่าน `design.md` §3A/§3B/§3E/§4 เป็น input)
- **ปลดล็อกให้:** — (contract-first: T2 owns เนื้อ note, T3 owns init; T1 ไม่พึ่ง runtime ทั้งคู่)
- **ส่ง output:** cli.mjs ที่มี global mode + test เขียว

## 3. Sub-tasks
- [ ] 1. **`resolveMode({globalFlag, projectFlag, isTTY, answer})` pure-fn** (export ได้ unit-test) ตาม §3A — conflict→throw, global/project flag, non-TTY→project, TTY+answer
- [ ] 2. parse `--global`/`--project` ใน args Set; conflict → error exit 1
- [ ] 3. **prompt เฉพาะ TTY** (`process.stdin.isTTY && process.stdout.isTTY`) ด้วย `node:readline/promises` — ถาม [1]project(default)/[2]global; `rl.close()` เสมอ; ห่อ async เฉพาะ path นี้ (non-TTY/flag ไม่แตะ readline)
- [ ] 4. **branch target ตาม mode** (§3B): project=cwd (เดิม); global → `target=os.homedir()` + **homedir guard** (falsy/`===root` → error exit 1) + `copyTree(CORE,{overwrite:UPDATE})` (first-install=skip ของเดิม) + **skip `ensureScaffold`/`seedDocs`** + echo target paths
- [ ] 5. **`installGlobalNote()`** helper ใหม่ (§3E): อ่าน `installer/templates/CLAUDE.global.md` → เขียน `~/.claude/CLAUDE.md` append-with-marker `<!-- warnyin:global-note -->` (ไม่มี→สร้าง, มี user content→append ถ้ายังไม่มี marker, มี marker→skip); เคารพ `DRY`; **★ defensive skip ถ้า template ไม่มี** (`if(!fs.existsSync(src)) return` — pattern copyTree/seedDocs; เคส note-marker = full-gate หลัง merge T2 — dry-run defer-A)
- [ ] 6. global ข้าม `installRootDoc('AGENTS.md')` (DQ3 limitation)
- [ ] 7. update `--help` text (เพิ่ม `--global`/`--project`)
- [ ] 8. **ขยาย harness `runCli(cwd, args, env)`** ใน `installer.test.mjs` — spawn ด้วย `env` (เคสเดิมไม่ส่ง = พฤติกรรมเดิม)
- [ ] 9. **เคส test ใหม่** (override `{HOME:tmp, USERPROFILE:tmp}` + assert side-effect ที่ tmp): global install ครบ · note+marker · ไม่ทำลายไฟล์ user · idempotent 2 ครั้ง · `--global --update` · `--global --project` error · non-TTY default project (`{timeout}`) · homedir guard · unit `resolveMode()` ทุกแขนง — **เคสเดิม 1-9 ไม่แก้ assertion**

## 4. ขอบเขตไฟล์ที่จะแตะ (★ disjoint — ห้ามแตะนอกนี้)
- `src/bin/cli.mjs`, `src/tests/installer.test.mjs`
- ❌ **ห้ามแตะ** `installer/templates/*` (T2 — รวม `CLAUDE.global.md` ที่ T2 สร้าง), `workflow/init.md` (T3), `src/AGENTS.md` (T2)
- ★ **contract:** `installGlobalNote()` อ่าน `installer/templates/CLAUDE.global.md` (T2 สร้าง) — task-scope อาจยังไม่มีไฟล์ใน worktree → **โค้ดอ้าง path ได้ (ตกลงใน design §4)**; integration พิสูจน์ที่ full-gate

## 5. Acceptance criteria
- [ ] `resolveMode()` pure-fn + unit ครอบทุกแขนง (conflict/flags/non-TTY/answer)
- [ ] project mode (default + non-TTY) พฤติกรรมเดิมเป๊ะ — เคส 1-9 เดิมเขียว (ไม่แก้ assertion)
- [ ] global: target=homedir, first-install `overwrite:false` (ไม่ทับไฟล์ user), skip scaffold, `~/.claude/CLAUDE.md` note+marker (append-safe), echo paths, homedir guard
- [ ] non-TTY → project ไม่ค้าง (test มี `{timeout}`); `--global --project` → exit≠0
- [ ] zero-dep (`node:readline/promises`,`node:os` built-in), ESM, `path.join`, cross-platform; `rl.close()` ครบ
- [ ] `node --test` เขียวทั้ง suite (global + regression) · ทำตาม `rule.md`+`standard.md`

## 6. อ้างอิง
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical: `../../design.md` §3A (mode), §3B (target), §3E (global note), §4 (contract), §8 (test)
- โค้ดเดิม: `src/bin/cli.mjs` (installRootDoc/copyTree/ensureScaffold/seedDocs), `src/tests/installer.test.mjs` (runCli/makeTempProject)
