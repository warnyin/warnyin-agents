# Spec — memory-command-adapter

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task

`adapter` / `docs` — ไฟล์ `.md` ล้วน (command adapter + registry + root-doc note) **ไม่มี runtime/โค้ดใหม่** (zero-dep คงเดิม)
ไม่มี API / data model ใหม่ → ข้าม §2

---

## 3. Command surface spec (แทน UX/UI — surface ที่ user เห็น)

### 3.1 `src/.claude/commands/warnyin/memory.md` — frontmatter

| field | ค่า |
|---|---|
| `description` | ขึ้นต้นด้วย **`ดู/ทบทวน project memory`** (วลีเดียวกับ C7 — กัน wording drift ระหว่าง command กับ registry) แล้วต่อด้วยพฤติกรรมสองโหมด รวมวลี **`รอ user ยืนยันก่อนเขียน`** |
| `argument-hint` | `"[ทบทวน (optional — ไม่ระบุ = ดูอย่างเดียว)]"` |

> รูปแบบ frontmatter ตาม precedent `triage.md` / `fastlane.md` / `next.md` (มีแค่ 2 field นี้ — **ไม่ใส่ `allowed-tools`**, ให้เหมือน command อื่นใน namespace)

### 3.2 body — โครง 5 ข้อ (orchestration ล้วน ไม่ inline กติกา)

| ข้อ | ต้องมีอะไร |
|---|---|
| 1 | **สั่งอ่าน `.warnyin/workflow/memory.md` ให้ครบก่อน** แล้วทำตามอย่างเคร่งครัด + ระบุว่า command นี้ไม่ตัดสินกฎเอง (กติกาเต็มอยู่ playbook ไฟล์เดียว) |
| 2 | รับโหมดจาก `$ARGUMENTS` — ไม่ระบุ → **โหมดดู (read-only เด็ดขาด — ห้ามสร้าง/แก้/ลบไฟล์ใดๆ)** · `ทบทวน` → **โหมดทบทวน** |
| 3 | **โหมดดู:** อ่าน `docs/stages/context.md` + `docs/memory.md` → สรุปในแชท (สถานะล่าสุด + entry แยกตามสถานะ + สุขภาพ **ตามเกณฑ์ใน playbook**) · รัน `node .warnyin/workflow/scripts/memory-status.mjs` ได้ → ใช้ตัวเลขจาก script; รันไม่ได้/ไม่มีไฟล์ → นับเอง · ไม่มีไฟล์/ไฟล์ว่าง → รายงาน "ยังไม่มี project memory" **ไม่สร้างให้เอง** |
| 4 | **โหมดทบทวน — เสนอก่อน `รอ user ยืนยันก่อนเขียน` · `ห้ามลบเงียบ`:** เสนอ 3 กลุ่ม (entry ที่ควร promote · entry ที่หมดอายุ · context ที่ stale/ขัดกับ artifact จริง) พร้อม **เหตุผล + ที่มา (evidence pointer) + สิ่งที่จะเปลี่ยน** · ยืนยันรายตัว ไม่ยืนยัน → คงไว้เหมือนเดิม · เขียนตามกติกา playbook เท่านั้น |
| 5 | **ไม่รัน stage ต่อให้เอง** — entry ที่พร้อม promote จริง → เสนอ `/warnyin:ship` (gate promote อยู่ที่ SHIP) แล้วหยุด |

> **path ทุกตัวในไฟล์นี้เขียนเป็น inline-code (backtick) ห้าม markdown-link** — ไฟล์ปลายทางบางตัวยังไม่มีตอน build (T1/T5) และ `lint-md.mjs` สแกน `src/`

### 3.3 ตำแหน่งที่ note/registry ไปโผล่ฝั่ง user (ไม่ต้องแก้อะไรเพิ่ม)

- `installer/templates/CLAUDE.md` → `<target>/CLAUDE.md` (Claude Code)
- `installer/templates/codebuddy-rules.md` → `<target>/.codebuddy/plugins/warnyin/rules/warnyin_rules.md` (CodeBuddy)
- `installer/templates/CLAUDE.global.md` → append-with-marker ที่ `~/.claude/CLAUDE.md` (global mode, note-only)
- `src/AGENTS.md` → `<target>/AGENTS.md` (Codex / Antigravity / เครื่องมือที่อ่าน root instruction file)
- `src/.claude/commands/warnyin/memory.md` → `<target>/.claude/commands/warnyin/memory.md` **และ** `.codebuddy/plugins/warnyin/commands/warnyin/memory.md` (installer copy จาก shared source — อัตโนมัติ)

## 4. Data-flow

- **command → playbook:** `/warnyin:memory` อ่าน `.warnyin/workflow/memory.md` (canonical) → กติกาไหลมาทางเดียว **ไม่มีสำเนากฎในตัว command**
- **command → ไฟล์ memory:** โหมดดู = อ่านอย่างเดียว · โหมดทบทวน = อ่าน → **เสนอ → user ยืนยัน → เขียน** (`context.md` เขียนทับ snapshot · `docs/memory.md` เปลี่ยนสถานะ ไม่ลบแถวทิ้ง)
- **command → script (optional):** `memory-status.mjs` (T5) เป็นแหล่งตัวเลขแบบ deterministic — ไม่มี/รันไม่ได้ → degrade ไปนับเอง (ไม่ block)
- **root doc → harness:** note C6 ถูก auto-load ทุก agent (รวม **sub-agent ที่ถูก fan-out ใน BUILD** ที่ prompt ไม่ได้สั่งอ่าน playbook กลาง) → ข้อยกเว้น worktree ถึงตัวจริง

## 5. User-flow

```
/warnyin:memory            → เห็น memory 2 ไฟล์ + สุขภาพ (read-only — ไม่มีไฟล์ไหนถูกแตะ)
/warnyin:memory ทบทวน      → เห็นรายการที่ควร promote / หมดอายุ / stale + เหตุผล
                           → ยืนยันรายตัว → เขียนเฉพาะที่ยืนยัน (ไม่ยืนยัน = คงเดิม)
```

1. user ติดตั้ง/อัปเดต → เห็น `/warnyin:memory` ใน slash-command list ของ `CLAUDE.md` และ rules ของ CodeBuddy (C7)
2. harness ที่มี memory store ของตัวเอง อ่าน note `## Project memory` ใน root doc → เขียนลง 2 ไฟล์ใน repo แทน (C6)
3. sub-agent ที่ทำงานใน worktree ของ BUILD อ่าน note เดียวกัน → **ไม่เขียน memory เอง** รอ main loop ตอน integrate (C6)

## 6. Persona

- **user/maintainer** ที่อยากรู้ว่า agent จำอะไรไว้บ้าง และอยากสั่งทบทวนโดยไม่กลัวของหาย
- **AI agent ทุกเจ้า** ที่อ่าน root doc ชุดเดียวกัน (tool-agnostic) — รวม sub-agent ที่ถูก fan-out

## 7. Test-flow

> ทดสอบด้วย **node ล้วน (cross-platform)** — ห้ามใช้ shell `grep`; test จริงเขียนใน `tasks/release-hygiene/` (`src/tests/memory.test.mjs`) แต่ task นี้ต้องทำให้ผ่านได้ทั้งหมด

**Positive (สิ่งที่ต้องเจอ)**

- [ ] `src/.claude/commands/warnyin/memory.md` มีอยู่จริง · frontmatter มี `description:` · body มีสตริง `.warnyin/workflow/memory.md` _(Scenario: command adapter มีอยู่และชี้ playbook)_
- [ ] body มีวลี `รอ user ยืนยันก่อนเขียน` **และ** `ห้ามลบเงียบ` ในส่วนโหมดทบทวน _(Scenario: โหมดทบทวนไม่ลบเงียบ)_
- [ ] บรรทัด C7 ปรากฏ **คำต่อคำ** ทั้งใน `installer/templates/CLAUDE.md` และ `installer/templates/codebuddy-rules.md` (รวมวงเล็บ path) _(Scenario: ปรากฏใน registry ทั้งสองไฟล์)_
- [ ] `## Project memory` + เนื้อ C6 ปรากฏ **คำต่อคำ** ใน 3 ไฟล์: `installer/templates/CLAUDE.md`, `installer/templates/CLAUDE.global.md`, `src/AGENTS.md` และแต่ละที่มี `docs/stages/context.md` + `docs/memory.md` _(Scenario: note ปรากฏครบสามไฟล์)_
- [ ] `installer/templates/CLAUDE.md` มีข้อความ `sub-agent ที่ทำงานใน git worktree ของ BUILD: ห้ามเขียน memory เอง` _(Scenario: note มีข้อยกเว้น worktree)_

**Negative (สิ่งที่ต้องไม่เจอ)**

- [ ] `src/.claude/skills/` **ไม่มี** โฟลเดอร์ `memory/` และไม่มี `SKILL.md` ใหม่ _(Scenario: ไม่ถูกทำเป็น skill auto-invocable)_
- [ ] `src/AGENTS.md` **ไม่มี** สตริง `/warnyin:memory` (ไฟล์นี้รับเฉพาะ note ไม่ใช่ registry)
- [ ] command adapter **ไม่ inline กติกาของ memory** — ไม่มี schema/closed-set (`gotcha`, `promoted`, `dropped`), ไม่มีตัวเลขเกณฑ์ (60 บรรทัด / 30 entry / 90 วัน), ไม่มีสตริงเส้นแบ่ง `working state (ปัจจุบัน)` (ต้องอยู่ใน `workflow/memory.md` ไฟล์เดียว)
- [ ] ไม่มี markdown-link ใหม่ในไฟล์ที่แก้ทั้ง 5 (path ทั้งหมดเป็น inline-code)

**Regression (สิ่งที่ห้ามพัง)**

- [ ] `installer/templates/CLAUDE.md` ยังมี marker `warnyin/workflow/stages/` และรายการ slash command เดิมครบทุกบรรทัด (ไม่ถูกจัดเรียง/ตัด)
- [ ] `installer/templates/CLAUDE.global.md` บรรทัดแรกยังเป็น `<!-- warnyin:global-note -->` และ section `## การ resolve playbook (local-first → global)` เดิมยังอยู่
- [ ] `src/AGENTS.md` heading เดิมครบ + หมายเหตุท้ายไฟล์ (global root doc ของ Codex/Antigravity) ยังอยู่ที่เดิม
- [ ] `codebuddy-rules.md` frontmatter (`description`/`alwaysApply`/`enabled`) + tag `<system_reminder>` ไม่ถูกแตะ
- [ ] ไม่มีไฟล์นอก `src/` ถูกแก้ (`git status` สะอาดจาก root `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.warnyin/`)
- [ ] `npm run lint:md` ผ่าน · test suite เดิมเขียวทั้งหมด (`pass === tests`) · `npm run verify:pack` ยังผ่าน (ไฟล์ command ใหม่ติด tarball โดยไม่ต้องแก้ allowlist)
