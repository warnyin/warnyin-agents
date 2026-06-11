# Build Report — global-install (Hybrid global install mode)

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`

| | |
|---|---|
| **Slug** | `global-install` |
| **Build branch** | `build/global-install` |
| **Isolation** | `worktree` (git worktree ต่อ task + baseRef sync) |
| **วันที่** | 2026-06-11 |
| **ผลรวม** | ผ่าน **3** / ล้ม **0** / ทั้งหมด **3** task |

## 1. Execution plan (waves ตาม dependency)
```
wave 1 (parallel ×3): cli-global-mode, resolution-convention, init-workspace
```
- critical-path depth = **1** · max wave width = **3** — file-ownership disjoint + contract-first (ทุก task อ้าง design §3 ที่มีก่อน BUILD). ไม่มี wave 2

## 2. ผลต่อ task
| Wave | Task | สถานะ | Test/Lint | ไฟล์ที่แก้ | Model | Branch |
|---|---|---|---|---|---|---|
| 1 | cli-global-mode | ✅ passed | installer.test 17/17 (9 regression + 8 ใหม่) · lint:md ✓ | `src/bin/cli.mjs`, `src/tests/installer.test.mjs` | opus-4-8 (deepest) | `worktree-…-1` |
| 1 | resolution-convention | ✅ passed | lint:md ✓ · installer.test 9/9 regression | `installer/templates/CLAUDE.md`, `CLAUDE.global.md`(ใหม่), `src/AGENTS.md` | sonnet-4-6 (balanced) | `worktree-…-2` |
| 1 | init-workspace | ✅ passed | lint:md ✓ · structural test-flow ผ่าน | `src/.warnyin/workflow/init.md` | sonnet-4-6 (balanced) | `worktree-…-3` |

- **baseRef sync เกิดจริง:** ทุก agent รายงาน merge `build/global-install` fast-forward (`f59a894→2e53f90`) ก่อนทำงาน → hard-stop ผ่าน (task.md ปรากฏ)

## 3. Integration notes
- integrate ด้วย **`git checkout <branch> -- <scoped src files>`** (ไม่ merge ทั้ง branch — เลี่ยง topic-docs copy + ปลอด KB#11) — 6 ไฟล์ source, **ไม่มี conflict** (file-ownership disjoint ตาม design §2)
- contract T1↔T2 (defer-A) ทำงานจริง: T1 `installGlobalNote()` defensive-skip ตอน worktree เดี่ยว → หลัง merge T2 (`CLAUDE.global.md` มีจริง) เขียน note+marker ลง `~/.claude/CLAUDE.md` ได้ — พิสูจน์ที่ full-gate
- `task.md` status → main loop อัปเดตเป็น `เสร็จ` ตอน integrate (agent แก้จาก worktree ไม่ได้ — E1)

## 3.5 Full build & test gate (หลัง integrate)
| Check | ผล |
|---|---|
| `node --test` (ทั้ง repo) | ✅ **66/66** (เพิ่ม 8 เคส global, ไม่มี regression) |
| `lint:md` | ✅ 100 ไฟล์ / 48 ลิงก์ |
| `validate-topic global-install` | ✅ ไม่มี ✖ |
| pack inclusion (`npm pack --dry-run`) | ✅ ไฟล์ใหม่ 5 ตัวติด tarball (รวม `CLAUDE.global.md` ผ่าน allowlist `src/.warnyin` เดิม), 81 ไฟล์ |
| **global install proof (temp HOME)** | ✅ `HOME=tmp ... --global` → `~/.warnyin/workflow/` + `~/.claude/commands/warnyin/` + `~/.claude/CLAUDE.md` มี marker `warnyin:global-note` + resolution note + **skip scaffold** (ไม่สร้าง `docs/stages/` ใน HOME) |
| `verify:pack` (script) | ⏭️ ENOENT บน Windows = env #4 (pre-existing) → พิสูจน์ intent ด้วย `npm pack --dry-run` แทน |

- **error ที่เจอตอน orchestrate + วิธีแก้:** Workflow loader พังด้วย `Unexpected keyword 'export'` (build-wave.mjs 0.12.0 มี top-level `export function`) → แก้ด้วย temp copy ที่ตัด `export` (คง `export const meta`). ดู `troubleshooting.md` TS-1

## 4. ปัญหา/ค้าง
- ไม่มี task ล้ม · ไม่มี gate ค้าง
- **defer → VERIFY:** empirical (global install end-to-end · ไม่ทำลายไฟล์ user · non-TTY CI-safe · local override wording · homedir guard · Claude Code โหลด `~/.claude/{commands,CLAUDE.md}` = RQ2 manual) · homedir falsy `''` best-effort (defer-B)
- **defer → SHIP:** feature `global-install` (feature.md+business.md+spec.md) · `docs/infra.md` env var (HOME/USERPROFILE) · learned-rules · src↔root sync (release)

## 5. Rule/standard ใหม่ที่ note ไว้ (รอ SHIP)
- **installer global mode safety** (`tasks/cli-global-mode/rule.md §2`): เขียน homedir ต้อง opt-in + first-install no-overwrite + note-only append (ไม่แตะ personal config) + echo blast paths
- **(จาก TS-1) build-wave.mjs ห้าม top-level `export function`** — harness wrap ยอมรับเฉพาะ `export const meta`; pure-fn ให้ test สกัดด้วย module-parse/`new Function` แทน import ตรง

## 6. ปัญหายาก/ซ้ำที่เจอ
- ดู `./troubleshooting.md` — TS-1 (export-function Workflow loader, ใหม่) · TS-2 (verify:pack Windows = ซ้ำ #4)

## ✅ Gate → VERIFY (build.md ข้อ 7)
- [x] ทุก task implement + integrate เข้า build branch (3/3)
- [x] ทุก task `passed` ไม่มี `failed` ค้าง
- [x] ไม่มี merge conflict ค้าง
- [x] Full build ของทุก component ผ่าน (pack inclusion + global install proof)
- [x] test suite ทั้งหมดเขียว (66/66 + lint:md + validate-topic)
- [x] build.md สรุปครบ
- [x] ไม่แตะ rule/standard กลางใน docs/ (rule ใหม่ note รอ SHIP)
