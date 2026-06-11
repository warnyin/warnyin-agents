# Design (How) — global-install

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** · lens `sa.md`
> ★ §3 = canonical definitions ที่ทุก slice อ่านเป็น input (contract-first — มีก่อน BUILD)

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` (`src/bin/cli.mjs` + payload templates + playbook) — แก้ที่ `src/` แล้ว release sync
- **แนวทาง:** เพิ่ม **mode** ให้ installer (project=default | global=opt-in) — global ใช้ **mirror-layout เดิม** แค่เปลี่ยน target จาก `cwd` → `os.homedir()` (DQ1: `~/.warnyin/` + `~/.claude/` คง invariant `src/<rel>→target/<rel>`); resolve playbook ผ่าน **convention canonical ใน CLAUDE.md/AGENTS.md** (DQ2 — adapter ไม่ต้องแก้); workspace ยกให้ `/warnyin:init` (D5)
- **dogfood:** topic นี้ = standard, แตก **3 slice file-ownership disjoint** → ขนาน wave เดียว (contract-first decouple ผ่าน §3)

## 2. Vertical slices
> หนึ่ง slice = หน่วยคุณค่า end-to-end · จัดแบบ **file-ownership disjoint** (parallel ปลอด conflict)

| # | Task | ส่งมอบคุณค่า | ไฟล์ที่เป็นเจ้าของ (disjoint) | Model tier | wave |
|---|---|---|---|---|---|
| 1 | **cli-global-mode** | แกน — flag/prompt(pure-fn) + branch target → homedir + skip scaffold + `installGlobalNote()` (note-only, marker) + harness env-override + test | `src/bin/cli.mjs`, `src/tests/installer.test.mjs` | `deepest` | 1 |
| 2 | **resolution-convention** | กฎ local-first→global + workspace-guard: note ใน per-project CLAUDE.md/AGENTS.md + **template note-only `CLAUDE.global.md`** (T1 เขียนลง `~/.claude/CLAUDE.md`) | `src/.warnyin/installer/templates/CLAUDE.md`, `src/.warnyin/installer/templates/CLAUDE.global.md` (ใหม่), `src/AGENTS.md` | `balanced` | 1 |
| 3 | **init-workspace** | `/warnyin:init` สร้าง scaffold + seed docs/ (อ่าน template local→global) ให้ global mode มี workspace | `src/.warnyin/workflow/init.md` | `balanced` | 1 |

> **disjoint ตรวจแล้ว:** T1→cli.mjs+test · T2→templates/{CLAUDE.md,CLAUDE.global.md}+AGENTS.md · T3→workflow/init.md — ไม่ทับกัน
> **ทำไมขนานได้ (contract-first, toolkit §3 ข้อ1):** ทุก task อ้าง **contract = §3 ของ design นี้** (mode logic, global path, resolution wording, init responsibility) ที่ตกลงก่อน BUILD — ไม่พึ่ง runtime ของกันและกัน. T1 เขียน `installRootDoc('CLAUDE.md')` ชี้ path template เดิม (T2 แก้เนื้อใน); integration พิสูจน์ที่ full-gate (install จริง → ตรวจ ~/.claude/CLAUDE.md มี note). critical-path depth=1, wave width=3

## 3. Canonical definitions (★ slice อ่านเป็น input)

### 3A. Mode resolution (cli.mjs — เลือก project/global) → T1
- **★ pure function `resolveMode({ globalFlag, projectFlag, isTTY, answer })` → `'project'|'global'`** (Infra-S3) — แยก logic ออกจาก readline เพื่อ **unit test ได้** โดยไม่ต้อง spawn TTY:
```
resolveMode:
  globalFlag && projectFlag → throw (conflict → cli แปลงเป็น error exit 1)
  globalFlag                → 'global'
  projectFlag               → 'project'
  !isTTY                    → 'project'        (CI-safe default — npx/pipe ไม่ค้าง)
  isTTY (มี answer จาก prompt) → answer==='2'/'global' ? 'global' : 'project'  (ค่าว่าง/อื่น → project)
```
- `isTTY = process.stdin.isTTY && process.stdout.isTTY` (ตรวจ **ทั้งคู่** — Infra-S2: stdin TTY แต่ stdout pipe → ยัง non-TTY กัน prompt ไป pipe ที่ไม่มีคนตอบ)
- prompt (เฉพาะ path TTY): `node:readline/promises` (zero-dep, stable node ≥17 → ครอบ matrix 20/22/24) — ถาม "ติดตั้งแบบไหน? [1] โปรเจกต์นี้ (default) [2] global (~/)"; **ต้อง `rl.close()`** ไม่งั้น process ค้าง
- main flow เดิม sync → ห่อ async **เฉพาะ path TTY**; non-TTY/flag ระบุ → ไม่แตะ readline (ไม่ค้าง/ไม่ช้าลง)
- **global → echo target paths ก่อนเขียน** (Security-S1 transparency): print `~/.warnyin/`, `~/.claude/commands/warnyin/`, `~/.claude/CLAUDE.md` ที่จะเขียน (blast นอกโปรเจกต์ ควร observable)

### 3B. Target ต่อ mode (cli.mjs) → T1
| mode | CORE target (copyTree) | scaffold/seed | root doc |
|---|---|---|---|
| **project** (เดิม) | `cwd` | `ensureScaffold()` + `seedDocs()` ที่ `cwd` | `installRootDoc` → `cwd/CLAUDE.md` + `cwd/AGENTS.md` |
| **global** | `os.homedir()` (→ `~/.warnyin/{workflow,template}`, `~/.claude/{commands/warnyin,agents,skills}`) | **ข้าม** (ยกให้ `/warnyin:init` — D5) | **`installGlobalNote()`** → `~/.claude/CLAUDE.md` (note-only block, §3E); **ข้าม AGENTS.md global** (DQ3 limitation) |
- **★ overwrite semantics ชัด (Security-B1):** global ใช้ `copyTree(CORE, {overwrite: UPDATE})` — **first-install (`UPDATE=false`) = skip ของเดิม** (ไม่ทับไฟล์ user ที่ชื่อชนใน `~/.claude/{agents,skills}/`); **เขียนทับเฉพาะ `--global --update`** (เจตนา user). พฤติกรรมเดียวกับ per-project — แต่ blast surface ต่าง (homedir) จึงต้อง state + test "ไม่ทำลายไฟล์ user" (§8)
- **★ global copy CORE รวม `.warnyin/template`** (SA-S1) → ได้ `~/.warnyin/template/docs/` → **T3 (init) อ่าน template global fallback ได้** (contract T1→T3, §4)
- **★ homedir guard (Infra-S1):** ถ้า `os.homedir()` falsy หรือ `=== path.parse(homedir).root` (เช่น `/`, `C:\` — CI/container ไม่มี passwd) → **error exit 1** ("หา homedir ไม่ได้ ใช้ `--project`") แทนเขียนลง filesystem root
- guard `pkgRoot===target` ยังปลอดภัย (homedir ≠ `src/`); `os.homedir()` cross-platform (Windows `%USERPROFILE%`, POSIX `$HOME`→`getpwuid`); ทุก path `path.join`

### 3C. Resolution convention (canonical wording) → T2
> ความรู้ที่ agent ต้องรู้ — อยู่ในเอกสารที่โหลดเข้า context เสมอ ไม่ทำซ้ำในทุก adapter
- **resolution:** เมื่อ adapter/เอกสารอ้าง path `.warnyin/workflow/...` (หรือ `.warnyin/template/...`) → หาในโปรเจกต์ **`./.warnyin/` ก่อน**, ไม่มี → **`~/.warnyin/` (global install)**
- **workspace guard (safety net D5):** ถ้าโปรเจกต์ยังไม่มี `docs/stages/` (เช่น global mode + โปรเจกต์ใหม่) → **รัน `/warnyin:init` ก่อน** (init สร้าง workspace ให้)
- **T2 เขียน wording นี้ลง 3 ที่ (tool-agnostic, เนื้อเดียวกัน):**
  1. `installer/templates/CLAUDE.md` (per-project Claude root doc — append เมื่อ install project mode)
  2. `src/AGENTS.md` (Codex/Antigravity — per-project; **global ของ Codex = limitation DQ3/SA-S2**: AGENTS.md change ได้ผลเฉพาะ per-project path)
  3. **`installer/templates/CLAUDE.global.md` (ใหม่ — note-only):** เนื้อ = resolution + workspace-guard เท่านั้น (ไม่มี slash-command list/กฎหลักของ project template) + **บรรทัด marker `<!-- warnyin:global-note -->`** (ให้ T1 `installGlobalNote()` เช็ค idempotent — §3E). T1 เขียนไฟล์นี้ลง `~/.claude/CLAUDE.md`

### 3E. Global root-doc helper (note-only, append-safe) → T1 (เนื้อจาก T2 §3C #3)
> **แก้ SA-B1/TL-B1:** `~/.claude/CLAUDE.md` = personal global memory ของ user — **ห้ามเขียนทับทั้งไฟล์ / ห้าม append project-template เต็ม**
- **`installGlobalNote()`** (helper ใหม่ใน cli.mjs, แยกจาก `installRootDoc`):
  - อ่าน template `installer/templates/CLAUDE.global.md` (note-only block + marker `<!-- warnyin:global-note -->`)
  - dest = `~/.claude/CLAUDE.md`: ไม่มี → สร้างด้วย note block; **มีอยู่ (user content) → append note block ต่อท้าย เฉพาะถ้ายังไม่มี marker** (idempotent); มี marker แล้ว → skip (รัน `--global` ซ้ำไม่ append ซ้ำ — TL-S1/Security-S3)
  - **marker เฉพาะของ note** (`<!-- warnyin:global-note -->`) ไม่ใช่ marker เดิม `warnyin/workflow/stages/` (note-only ไม่มี string นั้น) — marker = **shared contract** ระหว่าง T1 (เช็ค) ↔ T2 (ใส่ใน template); pin ที่นี่
  - เคารพ `DRY` flag (ไม่เขียนจริง + log) เหมือน helper อื่น
  - **★ defensive skip (dry-run T1 defer-A):** ถ้า template `CLAUDE.global.md` ไม่มี (worktree T1 เดี่ยวก่อน merge T2) → `if (!fs.existsSync(src)) { log+return }` (pattern เดียวกับ `copyTree`/`seedDocs` cli.mjs:84,132) — ให้ worktree เดี่ยวรัน test เขียว (regression 1-9 + unit `resolveMode` + global copyTree/skip-scaffold); เคส **note-marker พิสูจน์ที่ full-gate** หลัง merge T2

### 3D. Init workspace bootstrap (init.md playbook) → T3
- `/warnyin:init` เพิ่มความรับผิดชอบ **ก่อน** ขั้นวิเคราะห์ docs/: ถ้ายังไม่มี → สร้าง **scaffold** (`docs/stages/context.md` + `docs/stages/achieved/.gitkeep` เปล่า) + **seed** `docs/` จาก template (`.warnyin/template/docs/**`, ข้าม `[...]`, ไม่ทับไฟล์ที่มี) โดยอ่าน template แบบ **local-first → global** (§3C)
- idempotent (มีแล้วข้าม) — เหมือนพฤติกรรม `ensureScaffold`/`seedDocs` ของ installer แต่ทำโดย agent ใน init
- per-project install เดิม (installer scaffold ให้แล้ว) → init เห็นว่ามีอยู่ → ข้าม (ไม่ซ้ำ)

## 4. Interface / contract (ระหว่าง task)
- **canonical = design §3** — ทุก task อ่านก่อนลงมือ (มีก่อน BUILD → wave 1 ไม่ depend output กัน)
- **contract T1↔T2 (shared = marker + template path):** T1 `installGlobalNote()` อ่าน `installer/templates/CLAUDE.global.md` แล้วเขียน `~/.claude/CLAUDE.md` แบบ append-with-marker; **marker `<!-- warnyin:global-note -->` = shared contract** (T2 ใส่ในไฟล์, T1 เช็ค) — pin ใน §3C#3/§3E. T1 owns logic, T2 owns เนื้อ note (**ห้าม T1 inline เนื้อ**); per-project CLAUDE.md/AGENTS.md note T2 owns เช่นกัน. integration = full-gate (install global จริง → `~/.claude/CLAUDE.md` มี marker+note). **T2 ต้องคง marker string เดิม `warnyin/workflow/stages/` ใน CLAUDE.md per-project** (Security-S3 — idempotent ของ `installRootDoc` per-project พึ่ง string นี้)
- **contract T1↔T3 (global template):** global mode T1 `copyTree(CORE)` รวม `.warnyin/template` → `~/.warnyin/template/docs/` มีจริง → T3 (init) อ่าน template แบบ local→global ได้ (§3D); + T1 ข้าม scaffold/seed → T3 รับช่วงสร้าง workspace. contract = "init สร้าง workspace ถ้าไม่มี + อ่าน template local→global" (§3D) — ตกลงใน design, ไม่พึ่ง runtime
- **contract harness (T1 internal):** ขยาย `runCli(cwd, args, env)` (เดิม 2 arg) — merge `{...process.env, HOME: tmp, USERPROFILE: tmp}` สำหรับเคส global; เคสเดิม (ไม่ส่ง env) พฤติกรรมเดิม (QA-B1/Infra-B1)

## 5. Flow
- **global install:** `npx @warnyin/agents --global` → copyTree CORE→`~/` → เขียน `~/.claude/CLAUDE.md` (resolution note) → จบ (ไม่ scaffold) → user เปิด Claude Code โปรเจกต์ไหนก็ได้ → `/warnyin:*` ใช้ได้ (จาก `~/.claude/commands/`) → agent อ่าน resolution จาก `~/.claude/CLAUDE.md` → หา playbook local→global
- **ใช้ครั้งแรกในโปรเจกต์ใหม่ (global):** `/warnyin:init` → สร้าง workspace (scaffold+seed) + วิเคราะห์ docs/ → เริ่ม flow ปกติ
- **per-project (default):** เหมือนเดิมทุกอย่าง (ไม่กระทบ)

## 6. ผลกระทบต่อระบบเดิม
- **backward compatible:** project mode = default พฤติกรรมเดิมเป๊ะ (ไม่ส่ง flag + non-TTY → project); flag/prompt เป็น additive; เคสเทสเดิม 1-9 **ไม่แก้ assertion เพิ่มเคสใหม่เท่านั้น** (QA-S3 atomic)
- **จุดระวัง:** main flow async (prompt) เฉพาะ TTY-path · `os.homedir()` Windows/CI-minimal (มี guard §3B) · idempotent `~/.claude/CLAUDE.md` (marker `<!-- warnyin:global-note -->` §3E) · test spawn จริง override HOME+USERPROFILE→temp (กันเขียน homedir จริง)
- **★ security trade-off (Security-S2 — บันทึกเจตนา):** global = payload (`~/.claude/`, `~/.warnyin/`) อยู่ **นอก git ของทุกโปรเจกต์** → ไม่ถูก review ใน PR; per-project (default) = vendored+committed = **auditable** (เหตุผล security ที่ per-project ยังเป็น default นอกเหนือจาก reproducibility). payload global ถูก agent execute ทุก session ทุก repo — blast surface กว้างกว่า; opt-in + echo paths (§3A) ให้ตระหนัก
- **★ failure-mode partial write (SA-S3):** copyTree global ล้มกลางทาง → recovery = รัน `--global` ซ้ำ (idempotent byte-equal skip — cli.mjs copyTree) ; เขียนใน `~/.claude/` ที่ปนกับ config user → first-install `overwrite:false` กันทับของเดิม

## 7. Dependency ระหว่าง task (DAG)
```
        [canonical = design §3 — มีก่อน BUILD]
                       │ (ทุก task อ่านเป็น input)
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  cli-global-    resolution-    init-workspace     ◀── wave 1: ขนาน 3 (file-ownership disjoint)
  mode (T1)      convention(T2) (T3)
        └──────────────┴──────────────┘
                       ▼
   full-gate (node --test รวมเคส global · install global จริงใน temp → ตรวจ ~/.warnyin+~/.claude+CLAUDE.md note · lint:md · validate-topic · src↔root sync)
```
- **critical-path depth = 1 · max wave width = 3** — ไม่มี chain (contract-first decouple ทั้งหมดผ่าน §3)

## 8. Test strategy ระดับ design
- **★ harness:** ขยาย `runCli(cwd, args, env)` → spawn ด้วย `env` merge; เคส global merge `{...process.env, HOME: tmp, USERPROFILE: tmp}` (**ทั้งคู่** — POSIX อ่าน HOME, Windows อ่าน USERPROFILE) + **guard ใน test: assert side-effect อยู่ที่ `tmp` ไม่ใช่ homedir จริง** (กัน false-pass ถ้า override ไม่ติด — QA-B1/Infra-B1)
- **★ pass-count (QA-B2):** เคส global **รันได้ทุก matrix ไม่ skip** (CI = linux node 20/22/24 → HOME override deterministic); เพิ่มเคสใหม่เท่านั้น (pass เพิ่ม, `pass===tests` ยังจริง, `MIN_PASS≥9` ไม่ต้อง bump เพราะ floor); **ห้าม conditional-skip** (จะทำ gate แดง) — ถ้า platform ใด override ไม่ได้ = แก้ harness ไม่ใช่ skip
- **task-scope (lean self-verify):**
  - T1 → `node --test`: **unit `resolveMode()` (pure-fn)** ครอบทุกแขนง (flag/conflict/non-TTY/answer — Infra-S3) + black-box global cases (override HOME+USERPROFILE) + regression project 1-9 (assertion เดิมไม่แก้)
  - T2 → grep resolution+workspace-guard ใน CLAUDE.md+AGENTS.md+CLAUDE.global.md (wording ตรงกัน) + CLAUDE.global.md มี marker `<!-- warnyin:global-note -->` + CLAUDE.md per-project **ยังมี marker เดิม `warnyin/workflow/stages/`**
  - T3 → init.md มี workspace-bootstrap step (scaffold+seed) + อ่าน template local→global
- **full-gate:** `node --test` เขียว (global + regression) · install global จริง temp (`HOME=tmp USERPROFILE=tmp ... --global`) → `~/.warnyin/{workflow,template}` + `~/.claude/{commands/warnyin,agents,skills}` + `~/.claude/CLAUDE.md` มี note+marker · `lint:md` 0 · `validate-topic` ไม่มี ✖ · `verify:pack` (payload เดิมไม่กระทบ; **CLAUDE.global.md อยู่ใต้ `src/.warnyin/` allowlist** — ติด tarball)
- **empirical (VERIFY — gate = observable):**
  - **(1) global install executable:** temp HOME+USERPROFILE → `--global` → ไฟล์ลง `~/.warnyin`+`~/.claude` ครบ + `~/.claude/CLAUDE.md` note+marker
  - **(2) non-TTY CI-safe:** no-flag ผ่าน spawn (non-TTY) + **`{timeout}`** (QA-S1/Infra-S4 — กัน hang ถ้า isTTY-guard พลาด) → ไม่ถูก kill + ติดตั้ง project (observable)
  - **(3) ★ ไม่ทำลายไฟล์ user (Security-B1):** temp HOME มี `~/.claude/agents/my.md` + `~/.claude/CLAUDE.md` (เนื้อ user) อยู่ก่อน → `--global` (first-install) → ไฟล์ user **ไม่หาย/ไม่ถูกแตะ**; CLAUDE.md = append note ต่อท้าย ไม่ทับ
  - **(4) ★ global idempotent + `--global --update`:** รัน `--global` 2 ครั้ง → ไม่ append note ซ้ำ (marker) ; `--global --update` → playbook `~/.warnyin/` byte-equal/overwrite, note ไม่ซ้ำ
  - **(5) local override:** โปรเจกต์มี `./.warnyin/` + global ติด → resolution note สั่ง local-first (ตรวจ wording — structural)
  - **(6) backward compat:** project mode (default) — regression 1-9 เขียว
  - **(7) homedir guard:** `os.homedir()` = root/falsy → error exit 1 (ไม่เขียน filesystem root — Infra-S1)
  - **(8) Claude Code โหลด `~/.claude/{commands,CLAUDE.md}`** — **สมมติฐาน RQ2** → install จริง + เปิด session (manual)

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> feature `global-install` = **ใหม่** (ยังไม่มี `docs/features/global-install/`) → ทั้งหมด **ADDED**; สร้าง feature.md+business.md+spec.md ตอน SHIP. ไม่แตะ spec ของ feature อื่น

### ADDED → feature ใหม่: `global-install`
#### Requirement: ติดตั้งแบบ global ใช้ได้ทุกโปรเจกต์ (opt-in)
- **พฤติกรรม:** `npx @warnyin/agents --global` ติดตั้ง adapter → `~/.claude/{commands/warnyin,skills,agents}` + playbook → `~/.warnyin/{workflow,template}`; per-project (ไม่ส่ง flag / non-TTY) ยังเป็น default
- **Scenario: --global ติดตั้งลง homedir**
  - GIVEN รัน `npx @warnyin/agents --global` (HOME ชี้ temp)
  - WHEN installer เสร็จ
  - THEN มี `~/.warnyin/workflow/` + `~/.claude/commands/warnyin/` + `~/.claude/CLAUDE.md` (resolution note); **ไม่สร้าง** `docs/stages/` ที่ cwd
- **Scenario: ไม่ส่ง flag + non-TTY → project (CI-safe)**
  - GIVEN รัน installer ผ่าน pipe/non-TTY ไม่ส่ง flag
  - WHEN installer รัน
  - THEN ไม่ค้างรอ input + ติดตั้งแบบ project (ลง cwd) เหมือนพฤติกรรมเดิม
- **Scenario: --global + --project พร้อมกัน → error**
  - GIVEN รัน `npx @warnyin/agents --global --project`
  - THEN exit ≠ 0 + ข้อความว่า flag ขัดแย้ง
- **Scenario: global ไม่ทำลายไฟล์ user ที่มีอยู่ใน homedir**
  - GIVEN HOME(temp) มี `~/.claude/agents/my.md` + `~/.claude/CLAUDE.md` (เนื้อ user) อยู่ก่อน WHEN รัน `--global` (first-install)
  - THEN ไฟล์ user ทั้งสอง **ยังอยู่ ไม่ถูกแตะ/หาย**; `~/.claude/CLAUDE.md` = note ถูก append ต่อท้าย (ไม่ overwrite)
- **Scenario: รัน --global ซ้ำ → idempotent (ไม่ append note ซ้ำ)**
  - GIVEN รัน `--global` แล้วครั้งหนึ่ง WHEN รัน `--global` อีกครั้ง
  - THEN `~/.claude/CLAUDE.md` มี note block เดียว (marker `<!-- warnyin:global-note -->` กัน append ซ้ำ)

#### Requirement: resolve playbook local-first → global fallback
- **พฤติกรรม:** เอกสารกลาง (CLAUDE.md/AGENTS.md) ระบุ convention: path `.warnyin/...` หา `./.warnyin/` ก่อน ไม่มี → `~/.warnyin/`
- **Scenario: convention มีใน root doc**
  - GIVEN ไฟล์ template `src/.warnyin/installer/templates/CLAUDE.md` และ `src/AGENTS.md`
  - WHEN grep ข้อความ resolution
  - THEN พบกฎ local-first (`./.warnyin/`) → global fallback (`~/.warnyin/`) + workspace-guard (`docs/stages/` ไม่มี → `/warnyin:init`) ทั้งสองไฟล์ wording ตรงกัน

#### Requirement: /warnyin:init รับผิดชอบ workspace bootstrap
- **พฤติกรรม:** `/warnyin:init` สร้าง scaffold (`docs/stages/context.md` + `achieved/.gitkeep`) + seed `docs/` ถ้ายังไม่มี (idempotent) — ทำให้ global mode (installer ไม่ scaffold) มี workspace
- **Scenario: init สร้าง workspace เมื่อไม่มี**
  - GIVEN playbook `src/.warnyin/workflow/init.md`
  - WHEN อ่านขั้นตอน
  - THEN มี step สร้าง scaffold + seed docs/ (อ่าน template local→global, ข้าม `[...]`, ไม่ทับของเดิม) ก่อนวิเคราะห์โปรเจกต์

> **behavior change ที่ตั้งใจ:** project mode = default ไม่เปลี่ยน (backward compat); global เป็น opt-in
> **limitation (DQ3):** Codex/Antigravity global root doc ไม่รองรับรอบนี้ — per-project ยังใช้ได้เต็ม (บันทึกใน feature.md ตอน SHIP)

## 10. Design review
**Panel:** SA + Tech Lead + QA + Security + Infra (fan-out ขนาน read-only, 2026-06-11)

**Blocker → แก้ครบ:**
| # | จาก | blocker | แก้ |
|---|---|---|---|
| 1 | SA-B1 + TL-B1 | `installRootDoc` เขียน **ทั้ง template** ลง `~/.claude/CLAUDE.md` (personal global memory) ไม่ใช่ note-only — ขัด §3B เอง | **helper ใหม่ `installGlobalNote()`** (§3E) + **template note-only `CLAUDE.global.md`** (T2) + marker เฉพาะ `<!-- warnyin:global-note -->` append-safe |
| 2 | Security-B1 | `~/.claude/{agents,skills}/` ไม่มี namespace → overwrite ทับงาน user | **first-install `overwrite:false`** (skip ของเดิม), ทับเฉพาะ `--global --update` (§3B) + test "ไม่ทำลายไฟล์ user" (§8 empirical 3) |
| 3 | QA-B1 + Infra-B1 | harness `runCli` ไม่ส่ง `env` → เทส global เขียน homedir จริงของ CI/dev | ขยาย `runCli(cwd,args,env)` override **HOME+USERPROFILE→temp** + assert side-effect ที่ temp (§4 contract + §8) |
| 4 | QA-B2 | pass-count gate (`pass===tests`) แดงถ้าเคส global skip | เคส global **ไม่ skip ทุก matrix** (CI linux → HOME override deterministic); เพิ่มเคสใหม่เท่านั้น (§8) |

**Suggestion → รับ (fold เข้า design):**
| # | จาก | รับเป็น |
|---|---|---|
| SA-S1 | hidden dep T1→T3 ผ่าน `~/.warnyin/template` | §3B explicit (global copy template ครบ) + §4 contract T1↔T3 |
| SA-S3 | failure-mode partial write | §6 (recovery = rerun idempotent) |
| TL-S1/Sec-S3 | marker ของ note ต้อง shared contract | §3E/§4 (marker pin + T2 คง marker เดิมใน per-project CLAUDE.md) |
| Sec-S1 | transparency เขียน `~/` | §3A (global echo target paths) |
| Sec-S2 | supply-chain: global payload นอก git | §6 (เหตุผล security ที่ per-project = default) |
| Inf-S1 | homedir falsy/root (CI-minimal) | §3B (guard → error exit) |
| Inf-S2 | non-TTY ตรวจ stdin+stdout | §3A (`&&` ทั้งคู่) |
| Inf-S3 | mode logic เป็น pure-fn unit-testable | §3A (`resolveMode()`) |
| QA-S1/Inf-S4 | non-TTY test ต้องมี `{timeout}` กัน hang | §8 empirical (2) |
| QA-S3 | regression: เคส 1-9 ไม่แก้ assertion | §6 (atomic — เพิ่มเคสใหม่เท่านั้น) |
| Inf (SHIP) | `docs/infra.md` env var (HOME/USERPROFILE) | note รอ SHIP |

**ผ่านมุม panel:** mirror-layout คงอยู่ (target=homedir, zero mapping) · DAG depth1/width3 contract-first decouple จริง (file-ownership disjoint) · zero-dep (`readline/promises`/`os.homedir` built-in, node 20 ok) · secret-isolation/path-traversal/CI baseline ผ่าน · model tier เหมาะสม

**ไม่มี blocker ค้าง — พร้อมแตก task**
