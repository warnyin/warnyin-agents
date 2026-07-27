# Task — memory-command-adapter

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `memory-command-adapter` |
| **Slice อ้างอิง** | `design.md` slice #4 |
| **Component** | `adapters` (`src/.claude/commands/` + `src/.warnyin/installer/templates/` + `src/AGENTS.md`) |
| **Model tier** | `balanced` |
| **สถานะ** | `build เสร็จ — เขียวจริง` |

## 1. เป้าหมายของ task (vertical slice)

ทำให้ **user สั่ง/ดู project memory ได้** และ **harness ไม่แยกความจำเป็นสองแหล่ง**:

1. สร้าง command adapter ใหม่ `/warnyin:memory` — **adapter บาง ชี้ playbook `.warnyin/workflow/memory.md` ไม่ลอกกติกา**
2. ลงทะเบียน command ใน slash-command list ที่ผู้ใช้ปลายทางเห็น (2 ไฟล์)
3. ใส่ note `## Project memory` ใน root doc 3 ชุด — บอกทุก harness ว่า "ถ้ามี memory store ของตัวเอง ให้เขียนลง 2 ไฟล์ใน repo แทน"

> **ห้ามอ่าน/ห้ามรอไฟล์ของ task อื่น** (`workflow/memory.md` ของ T1, `scripts/memory-status.mjs` ของ T5 ยังไม่มีตอนทำ task นี้) — ทุกข้อความที่ต้องเขียนอยู่ใน `design.md §4` (C6, C7) แล้ว **คำต่อคำ**; การอ้างถึงไฟล์ของ task อื่นเป็น **inline-code pointer** ไม่ใช่ dependency ตอน build

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- ต้องทำหลัง: **ไม่มี** — wave 1 (ขนานกับ T1/T2/T3/T5; file-ownership disjoint — ไม่มีไฟล์ทับกันเลย)
- ปลดล็อกให้: `tasks/release-hygiene/` (T6) — เจ้าของ `src/tests/memory.test.mjs` ที่ assert C6/C7 แบบ **string-equality**
- ส่ง output อะไรต่อให้ task ถัดไป: ไฟล์ command ใหม่ 1 ไฟล์ + ไฟล์เดิม 4 ไฟล์ที่ถูก wire แล้ว → T6 เขียน test ทับ

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)

- [x] 1. สร้าง `src/.claude/commands/warnyin/memory.md` (ไฟล์ใหม่) — frontmatter (`description` + `argument-hint`) + body ชี้ `.warnyin/workflow/memory.md` — _ผลลัพธ์:_ command มีอยู่จริง 2 โหมด (ดู / ทบทวน)
- [x] 2. `src/.warnyin/installer/templates/CLAUDE.md` — เพิ่ม **registry line C7 คำต่อคำ** ในรายการ slash commands — _ขึ้นกับ 1 (ชื่อ command ต้องตรงไฟล์ที่สร้าง)_
- [x] 3. `src/.warnyin/installer/templates/codebuddy-rules.md` — เพิ่ม **registry line C7 คำต่อคำ** (บรรทัดเดียวกับข้อ 2 เป๊ะ) — _ขึ้นกับ 1_
- [x] 4. `src/.warnyin/installer/templates/CLAUDE.md` — เพิ่ม section **`## Project memory` (C6 คำต่อคำ)**
- [x] 5. `src/.warnyin/installer/templates/CLAUDE.global.md` — เพิ่ม section **`## Project memory` (C6 คำต่อคำ)** ใต้ marker เดิม
- [x] 6. `src/AGENTS.md` — เพิ่ม section **`## Project memory` (C6 คำต่อคำ)** — **ห้ามใส่ registry line** (ไฟล์นี้ไม่มี slash-command list ตรวจแล้วทั้งไฟล์)
- [x] 7. เช็คปิดท้าย: `git status` ไม่มี path ที่ **ไม่ใช่** 5 ไฟล์ใน §4 · ไม่มีโฟลเดอร์ใหม่ใน `src/.claude/skills/` · `node src/scripts/lint-md.mjs` ผ่าน (ทุก path ที่เพิ่มเป็น inline-code ไม่ใช่ markdown-link)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

> **★ ห้ามแตะ root `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.warnyin/`** — เป็น **dogfood install ที่ gitignored** (ยืนยันแล้ว: `git check-ignore CLAUDE.md AGENTS.md .claude/…` = ignored ทั้งหมด; `src/AGENTS.md` = **not ignored** → เป็น source ที่ถูกต้อง) แก้ที่ root แล้ว **งานหาย ไม่ติด commit** · แก้เฉพาะใต้ `src/` · ไม่มั่นใจให้รัน `git check-ignore <file>` ก่อน

| # | ไฟล์ (prefix `src/`) | ตำแหน่ง (ณ วันเขียน) | ทำอะไร |
|---|---|---|---|
| 1 | `src/.claude/commands/warnyin/memory.md` | **ไฟล์ใหม่** | command adapter บาง — เนื้อตาม `spec.md §3` (frontmatter + โครง body 5 ข้อ) · **ไม่ inline กติกาของ memory** |
| 2 | `src/.warnyin/installer/templates/CLAUDE.md` | **หลังบรรทัด 17** (ใต้ `/warnyin:next` ในรายการ `## Slash commands`) | เพิ่ม 1 บรรทัด = **C7 คำต่อคำ** |
| 3 | `src/.warnyin/installer/templates/CLAUDE.md` | **หลังบรรทัด 25** (จบรายการ slash commands) ก่อนบรรทัด 27 `## รองรับหลาย AI / IDE` | เพิ่ม section **C6 คำต่อคำ** (เว้นบรรทัดว่างคั่นหัว-ท้าย) |
| 4 | `src/.warnyin/installer/templates/codebuddy-rules.md` | **หลังบรรทัด 25** (ใต้ `/warnyin:next`) | เพิ่ม 1 บรรทัด = **C7 คำต่อคำ** — **บรรทัดเดียวกับข้อ 2 ทุกตัวอักษร** |
| 5 | `src/.warnyin/installer/templates/CLAUDE.global.md` | **ท้ายไฟล์ (หลังบรรทัด 5)** — ยังอยู่ใต้ marker `<!-- warnyin:global-note -->` | เพิ่ม section **C6 คำต่อคำ** · **ห้ามแตะ/ห้ามย้าย marker บรรทัด 1** (idempotent guard ของ `installGlobalNote()`) |
| 6 | `src/AGENTS.md` | **หลังบรรทัด 48** (จบ section `## รัน Discovery`) ก่อนบรรทัด 50 `## การ resolve playbook (local-first → global)` | เพิ่ม section **C6 คำต่อคำ** · **ห้ามใส่ registry line** |

> **บรรทัดเป็น "จุดอ้างอิง" ไม่ใช่ "กฎเหล็ก"** — เลขไม่ตรง (ไฟล์ถูกแก้ระหว่างทาง) ให้หาจาก **ข้อความเดิม** ที่ระบุในคอลัมน์ตำแหน่งแล้วแทรกตรงนั้น (investigate-before-edit) ห้ามแทรกตามเลขบรรทัดมั่ว

### ⚠ กับดักที่ต้องระวัง (อ่านก่อนแก้)

1. **`codebuddy-rules.md` ต้องมี path ในวงเล็บด้วย** — pattern เดิมของไฟล์นี้ตัด `(.warnyin/workflow/*.md)` ออก **แต่ C7 เป็น contract ที่ T6 assert string-equality ทั้ง 2 ไฟล์** → **copy C7 ทั้งบรรทัดรวมวงเล็บ ห้าม "จัดให้เข้า pattern"**
2. **`src/AGENTS.md` ห้ามมี `/warnyin:memory`** — ตรวจแล้วไฟล์นี้ไม่มี slash-command list; ใส่เข้าไป = สร้าง registry ที่ 3 ที่ไม่มีใครดูแล
3. **ห้ามสร้างอะไรใน `src/.claude/skills/`** — `/warnyin:memory` **เขียนไฟล์ได้ = stateful → ต้องเป็น command (user-invoked) เท่านั้น** (`docs/rule.md §1` skill-adapter convention); T6 มีเคส negative ตรวจว่าไม่มีโฟลเดอร์ `skills/memory/`
4. **ไม่ต้องแตะ packaging** — `cli.mjs copyTree` recursive + `verify-pack` prefix `src/.claude/commands/warnyin/` ครอบไฟล์ใหม่แล้ว; CodeBuddy commands copy จาก `.claude/commands/warnyin/` (shared source) → command ใหม่ไปโผล่เองทั้ง 2 harness — **ห้ามแก้ `package.json` / `verify-pack.mjs` / `cli.mjs`**

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)

> อ้าง Scenario ใน `design.md §9` (Requirement "มี command ดูและทบทวน memory" + "root doc บอก harness ให้เขียน memory ลง repo")

- [x] **`command adapter มีอยู่และชี้ playbook`** — `src/.claude/commands/warnyin/memory.md` มี `description` ใน frontmatter และ body สั่งให้อ่าน `.warnyin/workflow/memory.md`
- [x] **`โหมดทบทวนไม่ลบเงียบ`** — body ส่วนโหมดทบทวนระบุว่าเสนอรายการที่จะตัด/บีบแล้ว **รอ user ยืนยันก่อนเขียน** (มีวลี `รอ user ยืนยันก่อนเขียน` + `ห้ามลบเงียบ`)
- [x] **`ปรากฏใน registry ทั้งสองไฟล์`** — บรรทัด C7 **คำต่อคำ** ใน `installer/templates/CLAUDE.md` และ `installer/templates/codebuddy-rules.md`
- [x] **`ไม่ถูกทำเป็น skill auto-invocable`** — `src/.claude/skills/` ไม่มีโฟลเดอร์ `memory/` (และไม่มี `SKILL.md` ใหม่ใดๆ)
- [x] **`note ปรากฏครบสามไฟล์`** — `## Project memory` (C6 คำต่อคำ) ใน `installer/templates/CLAUDE.md`, `installer/templates/CLAUDE.global.md`, `src/AGENTS.md` และแต่ละที่อ้าง `docs/stages/context.md` กับ `docs/memory.md`
- [x] **`note มีข้อยกเว้น worktree`** — `installer/templates/CLAUDE.md` section `## Project memory` มีข้อความ `sub-agent ที่ทำงานใน git worktree ของ BUILD: ห้ามเขียน memory เอง`
- [x] **canonical-copy** — command adapter **ไม่ inline กติกาของ memory** (schema/เกณฑ์/lifecycle) มีแค่ pointer; C6/C7 ไม่ถูก paraphrase แม้ตัวอักษรเดียว
- [x] ไม่มีไฟล์นอก 5 ไฟล์ใน §4 ถูกแก้ (`git status` สะอาดจาก root `CLAUDE.md`/`AGENTS.md`/`.claude/`/`.warnyin/`)
- [x] `node src/scripts/lint-md.mjs` ผ่าน · test suite เดิมเขียว (`pass === tests`)
- [x] ผ่าน test ตาม `spec.md` (test-flow)
- [x] ทำตาม `rule.md` และ `standard.md`

## 7. Build log (เติมตอน build)

- `git status --porcelain` → เจอเฉพาะ 5 path ที่คาดไว้ (4 modified + 1 new): `src/.warnyin/installer/templates/{CLAUDE.md,CLAUDE.global.md,codebuddy-rules.md}`, `src/AGENTS.md`, `src/.claude/commands/warnyin/memory.md`
- `node src/scripts/lint-md.mjs` → `✓ lint-md ผ่าน: 169 ไฟล์ 92 ลิงก์`
- `npm test` → `pass 151 / tests 151 / fail 0`
- `npm run verify:pack` → ล้มด้วย `spawnSync npm ENOENT` (Windows-only quirk ที่ document ไว้แล้วใน `docs/troubleshooting.md` #4) — แทนด้วย `npm pack --dry-run --json` ตรงตามที่ troubleshooting.md แนะนำ → ยืนยันไฟล์ทั้ง 5 อยู่ใน tarball list จริง (รวม `src/.claude/commands/warnyin/memory.md`)
- ยืนยัน C6/C7 string-equality ด้วย node script เทียบ substring จาก `design.md §4` กับเนื้อไฟล์ปลายทางทั้งหมด → ตรงทุกไฟล์
- ยืนยัน negative: ไม่มี `gotcha`/เกณฑ์ตัวเลข/`working state (ปัจจุบัน)` รั่วเข้า command adapter, `src/AGENTS.md` ไม่มีสตริง `/warnyin:memory`, ไม่มีโฟลเดอร์ `src/.claude/skills/memory/`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- **Contract คำต่อคำ (แหล่งเดียว):** `../../design.md` §4 — **C6** (adapter note) + **C7** (registry line)
