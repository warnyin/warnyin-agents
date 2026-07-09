# Design (How) — Support Universal IDE

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture** — แต่ละ slice ตัดผ่านทุก layer ทำงาน end-to-end

## 1. ภาพรวมสถาปัตยกรรม

- **component หลัก:** `installer` (`src/bin/cli.mjs`) + `installer/templates/` + `verify-pack` (`src/scripts/verify-pack.mjs`) + test (`src/tests/installer.test.mjs`)
- **แนวทางหลัก:** เพิ่ม adapter file template สำหรับแต่ละ IDE ลงใน `src/.warnyin/installer/templates/` แล้วแก้ `cli.mjs` ให้เรียก helper ที่เหมาะสม (copyTree หรือ installRootDoc) ต่อ adapter ใน project mode และ global mode

### IDE adapter matrix

| IDE | file path (project install) | file path (global install) | install strategy |
|---|---|---|---|
| Cursor | `.cursor/rules/warnyin.mdc` | `~/.cursor/rules/warnyin.mdc` | `copyTree` (core dir) |
| Windsurf | `.windsurf/rules/warnyin.md` | `~/.windsurf/rules/warnyin.md` | `copyTree` (core dir) |
| Copilot Chat | `.github/copilot-instructions.md` | `~/.github/copilot-instructions.md` | `installRootDoc` (append-with-marker, กันทับงาน user) |
| Cline / Roo Code | `.clinerules` | `~/.clinerules` | `installRootDoc` (append-with-marker) |
| Gemini CLI | `GEMINI.md` | `~/GEMINI.md` | `installRootDoc` (append-with-marker) |

**เหตุผลเลือก strategy:**
- `copyTree` — ใช้กับ file ที่อยู่ใน subfolder เฉพาะของ IDE (`.cursor/rules/`, `.windsurf/rules/`) ที่ user ไม่น่ามีก่อน + overwrite ได้เมื่อ `--update`
- `installRootDoc` — ใช้กับ file top-level หรือที่ user อาจมีเนื้อหาของตัวเองอยู่ก่อน (`.clinerules`, `.github/copilot-instructions.md`, `GEMINI.md`) → append section แบบ idempotent (marker) กันเขียนทับงาน user

### เนื้อหา adapter file

ทุก adapter มีเนื้อหาเดียวกัน: **pointer บาง** ชี้กลับ playbook กลาง `.warnyin/workflow/` (สอด tool-agnostic rule) — ไม่ copy เนื้อหา playbook ลงซ้ำ (single source of truth)

Template เนื้อหา (เหมือนกันทุก IDE, ปรับ heading เล็กน้อยตาม format ของ IDE):
```
# Warnyin Standard Workflow

โปรเจกต์นี้ใช้ Warnyin Standard Workflow — เดินงานผ่าน 5 stage:
`Discovery (optional) ▶ DESIGN ▶ BUILD ▶ VERIFY ▶ SHIP`

## กฎหลัก
- playbook อยู่ที่ `.warnyin/workflow/stages/` — ทำตามก่อนเริ่มงานใน stage
- output ของงานจริงเก็บใน `docs/stages/<slug>/`
- ความรู้ถาวรระดับโปรเจกต์อยู่ใน `docs/`

## อ้างอิง
- ภาพรวม: `.warnyin/workflow/README.md`
- เริ่มต้นโปรเจกต์: `.warnyin/workflow/init.md` (หรือ /warnyin:init ถ้าใช้ Claude Code)
```

**หมายเหตุ Cursor `.mdc`:** Cursor รองรับ Markdown + frontmatter YAML; ใช้ `.mdc` extension พร้อม frontmatter `alwaysApply: true` เพื่อให้ rule โหลดทุก session

## 2. Vertical slices

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | Template adapter file ครบทุก IDE พร้อม install | template files + installer logic + test | `tasks/add-ide-adapters/` |
| 2 | verify-pack gate รู้จัก path ใหม่ + test ครบ | verify-pack script + unit test | `tasks/update-verify-pack/` |
| 3 | CHANGELOG + version bump + docs update | CHANGELOG + CLAUDE.md template + AGENTS.md | `tasks/release-hygiene/` |

## 3. Data model / schema

ไม่มี data model ใหม่ — change เป็นระดับ file เพิ่มใน `src/.warnyin/installer/templates/` และ logic ใน `cli.mjs`

**ไฟล์ใหม่ใน package:**
```
src/.warnyin/installer/templates/
  CLAUDE.md            (มีอยู่แล้ว)
  CLAUDE.global.md     (มีอยู่แล้ว)
  cursor-rules.mdc     → ติดตั้งเป็น .cursor/rules/warnyin.mdc
  windsurf-rules.md    → ติดตั้งเป็น .windsurf/rules/warnyin.md
  copilot-instructions.md  → ติดตั้งเป็น .github/copilot-instructions.md
  clinerules           → ติดตั้งเป็น .clinerules
  GEMINI.md            → ติดตั้งเป็น GEMINI.md
```

**ไม่มี migration** — backward compat 100% (ไม่แก้ไฟล์เดิมของ user ที่มีอยู่แล้ว เว้นแต่ append)

## 4. Interface / contract

### `cli.mjs` ส่วนที่แก้

**`CORE` array (เพิ่ม directory ใหม่):**
```js
const CORE = [
  path.join('.warnyin', 'workflow'),
  path.join('.warnyin', 'template'),
  path.join('.claude', 'commands', 'warnyin'),
  path.join('.claude', 'agents'),
  path.join('.claude', 'skills'),
  path.join('.cursor', 'rules'),     // ★ ใหม่
  path.join('.windsurf', 'rules'),   // ★ ใหม่
]
```

**helper ใหม่ `installAdapterDoc(name, srcFilename, marker)`:**
```js
/** ติดตั้ง adapter doc สำหรับ IDE — pattern เดียวกับ installRootDoc แต่ src อยู่ใน installer/templates/ */
function installAdapterDoc(destRel, srcFilename, marker) { ... }
```

**project mode — เพิ่มใน `main()`:**
```js
// project mode section ใหม่
installAdapterDoc('.github/copilot-instructions.md', 'copilot-instructions.md', '<!-- warnyin:copilot -->')
installAdapterDoc('.clinerules', 'clinerules', '<!-- warnyin:cline -->')
installAdapterDoc('GEMINI.md', 'GEMINI.md', '<!-- warnyin:gemini -->')
// Cursor + Windsurf ผ่าน copyTree(CORE) อยู่แล้ว
```

**global mode — เพิ่มใน `main()`:**
```js
// global mode section ใหม่ (เหมือน project แต่ target = home)
installAdapterDoc('.github/copilot-instructions.md', 'copilot-instructions.md', '<!-- warnyin:copilot -->')
installAdapterDoc('.clinerules', 'clinerules', '<!-- warnyin:cline -->')
installAdapterDoc('GEMINI.md', 'GEMINI.md', '<!-- warnyin:gemini -->')
```

### `verify-pack.mjs` ส่วนที่แก้

เพิ่มใน `ALLOWED_PREFIX`:
```js
'src/.warnyin/installer/templates/cursor-rules.mdc',
'src/.warnyin/installer/templates/windsurf-rules.md',
'src/.warnyin/installer/templates/copilot-instructions.md',
'src/.warnyin/installer/templates/clinerules',
'src/.warnyin/installer/templates/GEMINI.md',
```

หรือ generalize เป็น prefix: `'src/.warnyin/installer/templates/'` (ครอบทุกไฟล์ใน templates)

## 5. Flow

**data-flow (install):**
```
npx @warnyin/agents
  → main() resolve mode
  → copyTree(CORE)  ← Cursor/Windsurf rules folder
  → installRootDoc(CLAUDE.md, AGENTS.md)
  → installAdapterDoc(copilot-instructions, clinerules, GEMINI.md)  ★ ใหม่
  → ensureScaffold() + seedDocs()
  → log summary
```

**user-flow:**
1. user รัน `npx @warnyin/agents` (หรือ `--global`)
2. installer copy/append adapter ทุกตัวพร้อมกัน (ไม่ถาม, ไม่ต้อง detect)
3. user เปิด IDE ใดก็ได้ → IDE อ่าน instruction file ของตัวเอง → ชี้กลับ `.warnyin/workflow/`
4. `--update` เขียนทับ Cursor/Windsurf (copyTree); append-once สำหรับ Copilot/Cline/Gemini (marker กัน duplicate)

## 6. ผลกระทบต่อระบบเดิม

- `CORE` array ขยาย — `copyTree` loop อยู่แล้ว ไม่ต้องแก้ logic
- `installRootDoc` ใช้อยู่แล้ว สำหรับ CLAUDE.md/AGENTS.md — `installAdapterDoc` เป็น helper ใหม่ที่ mirror pattern เดิม (ลด duplicate)
- verify-pack ต้องอัปเดต `ALLOWED_PREFIX` — ถ้าไม่อัปเดต gate จะหักตอน CI publish
- test count เพิ่ม → ต้องอัปเดต `MIN_PASS` ใน `check-test-count.mjs` (ถ้ามี hardcode)

## 7. Dependency ระหว่าง slice/task

```
task-add-ide-adapters ──▶ task-update-verify-pack ──▶ task-release-hygiene
```

- **critical-path depth:** 3 (chain เส้นตรง)
- **max wave width:** 1 ต่อ wave
- **เหตุผลที่ serialize:**
  - T1 → T2: verify-pack ต้องรู้ path จริงที่ T1 เพิ่มเข้า package ก่อนจึงอัปเดต ALLOWED_PREFIX ได้ (foundation dependency — ไม่สามารถ contract-first decouple ได้เพราะ path ถูกกำหนดใน T1)
  - T2 → T3: release-hygiene (CHANGELOG/bump) ต้องรันหลัง T1+T2 ผ่าน full-gate ก่อน — pattern "release-hygiene task เป็น wave สุดท้าย" (docs/rule.md §1 DAG-width)
  - chain 3 ใบนี้สั้น แต่ละใบเบา (ไม่ทำ DAG-width toolkit เพิ่มเพราะ dependency เป็น chain แท้ทั้ง 3)

## 8. Test strategy ระดับ design

- **black-box spawn test (T1):** รัน `cli.mjs --project` ใน temp dir แล้ว assert ไฟล์ adapter ครบ + content มี marker ถูก + `--update` เขียนทับ Cursor/Windsurf + append-once สำหรับ Copilot/Cline/Gemini
- **global mode test (T1):** รัน `cli.mjs --global` ใน temp home dir แล้ว assert adapter ติดที่ `~/.cursor/rules/`, `~/.github/`, ฯลฯ
- **verify-pack unit test (T2):** feed path ใหม่เข้า `checkFiles()` pure fn แล้ว assert ไม่ error
- **negative test (T2):** feed path template ที่ไม่ควรติด (docs/, src/tests/) ยังจับได้

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)

ไม่มี feature spec สำหรับ installer ใน `docs/features/` — ไม่มี delta ที่ต้อง merge กับ spec file เดิม

(change นี้ขยาย behavior ของ installer: เพิ่ม adapter install ใหม่ ซึ่งยังไม่มี spec.md ของ feature installer → ไม่มี delta)
