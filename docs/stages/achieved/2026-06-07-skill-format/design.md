# Design (How) — skill-format

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> Lens: SA (`.warnyin/workflow/roles/sa.md`) · แตก task ด้วย Tech Lead lens

## 1. ภาพรวมสถาปัตยกรรม
- **component:** Claude adapter (`src/.claude/`) + installer (`src/bin/cli.mjs`) + packaging (`package.json`, `src/scripts/verify-pack.mjs`) + tests (`src/tests/`) — **playbook กลาง (`.warnyin/workflow/`) ไม่แตะ** (skill ชี้กลับ)
- **แนวทางหลัก:** เพิ่ม skills เป็น **adapter Claude-specific บาง** ที่ชี้ playbook เดิม + เปิด pipeline (installer→packaging→test) ให้ skills ติดไปด้วยอย่างปลอดภัย; ไม่ plugin (non-breaking), ไม่แตะ Codex adapter
- **invariant ที่ต้องคง:** zero-dep · verify-pack เป็น gate (leak guard ต้องยังแข็ง) · command เดิมไม่เปลี่ยน · `pass==tests ≥ MIN_PASS`

## 2. Skill format spec (canonical — ทุก skill ใช้โครงนี้)
```
src/.claude/skills/<name>/SKILL.md
---
name: <name>                         # = ชื่อ folder (kebab) — display label
description: <สั้น actionable>        # ใช้ตัดสิน auto-invoke (จาก command description เดิม)
when_to_use: <trigger context>       # เมื่อไหร่ model ควรเรียก (description-driven; ไม่มี event)
allowed-tools: <read-only set>       # explore/next = Read Grep Glob (+Bash read-only); codemap = +Bash(find/ls/grep)
---
ทำหน้าที่เป็น <role> ตาม playbook กลาง — อ่าน `.warnyin/workflow/<x>.md` แล้วทำตามทุกขั้น (ชี้ playbook ไม่ duplicate)
```
- **3 skill + playbook ปลายทาง:** `update-codemaps`→`.warnyin/workflow/codemap.md` · `explore`→`.warnyin/workflow/explore.md` · `next`→`.warnyin/workflow/next.md`
- **auto-invocable:** ไม่ใส่ `disable-model-invocation` (default = model เรียกได้) — ปลอดภัยเพราะ read-only
- **`when_to_use` ของ update-codemaps:** "หลังเพิ่ม/ย้าย/ลบไฟล์ หรือเปลี่ยนโครงสร้างโปรเจกต์ → refresh `docs/codemap/`" (= ตีความ "auto-invoke เมื่อโครงเปลี่ยน" แบบ description-driven)
- **ไม่พึ่ง `$ARGUMENTS`:** skill ได้ context จาก request ตอน auto-invoke; body เขียนให้ทำงานได้โดยไม่ต้องมี arg syntax ของ slash command (explore/next รับหัวข้อจาก conversation)

## 3. Vertical slices
> change coupled — skills ต้อง **author + install + package + test** พร้อมกันถึงจะ green (เพิ่ม skill แต่ verify-pack reject = แดง) → **1 vertical slice** "3 skill ship end-to-end ผ่านทุก layer"

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **3 safe skill ship ครบสาย** — authored (.claude/skills) → installed (cli CORE) → packaged (allowlist+verify-pack) → tested (installer+pack) + command/ship note | adapter · installer · packaging · test · (global note) | `tasks/add-utility-skills/` |

## 4. Interface / contract — จุดเกาะ (mapping)
| จุดเกาะ | ไฟล์ | ใส่อะไร |
|---|---|---|
| skill files (NEW) | `src/.claude/skills/{update-codemaps,explore,next}/SKILL.md` | frontmatter (§2) + body ชี้ playbook |
| installer | `src/bin/cli.mjs` CORE (บรรทัด ~66) | +`path.join('.claude','skills')` (copyTree recursive อยู่แล้ว; `--update` overwrite) |
| packaging allowlist | `package.json` `files` | +`"src/.claude/skills"` (granular — nested dotfolder ต้องระบุ) |
| packaging guard | `src/scripts/verify-pack.mjs` | ALLOWED_PREFIX +`'src/.claude/skills/'`; +`hasSkills` assertion (R1 — skills ต้องติด); แก้ comment (ไม่ใช่ "กัน skills หลุด" แล้ว) |
| guard test | `src/tests/verify-pack.test.mjs` | GOOD +`'src/.claude/skills/explore/SKILL.md'`; case 9 เขียนใหม่ (leak ตัวอย่างอื่น เช่น `src/.vscode/x.json` หรือ `src/.idea/x`); +เคส R1 "ขาด skills → error" |
| installer test | `src/tests/installer.test.mjs` | เคส "ติดตั้งสด โครงครบ" +assert `.claude/skills/update-codemaps/SKILL.md` ลง; idempotent/update ครอบ |
| command note | `src/.claude/commands/warnyin/{build,ship}.md` | +1 บรรทัดท้าย: "คงเป็น command (user-only) โดยตั้งใจ — irreversible ต้อง user สั่งชัด ไม่ auto-invoke" |
| global (รอ SHIP) | note `tasks/.../rule.md` §2 → `docs/rule.md` | skill-adapter convention: skill = Claude adapter บาง ชี้ playbook, **เฉพาะ read-only safe** ทำ auto-invoke; irreversible คงเป็น command |

## 5. Flow
- **install:** `npx @warnyin/agents` → cli CORE copyTree `.claude/skills` → target ได้ `.claude/skills/<name>/SKILL.md` → Claude Code เห็น `/<name>` auto-invocable
- **package:** `npm pack` → `files` รวม `src/.claude/skills` → `verify-pack` allow + assert hasSkills → เขียว
- **runtime (Claude):** user request ตรง description → model auto-invoke skill → skill body พา agent อ่าน playbook กลาง → ทำตาม (เหมือน command path)

## 6. ผลกระทบต่อระบบเดิม
- **backward compat:** เพิ่ม path/ไฟล์ ไม่ลบ/แก้ command เดิม; ผู้ใช้รุ่นเก่ารับ skills ตอน `--update` (CORE overwrite); 3 skill เป็น entry เพิ่ม (`/update-codemaps`) ไม่ชนกับ `/warnyin:update-codemaps` (คนละ name)
- **leak guard:** เปิด `src/.claude/skills/` ใน allowlist → guard เดิมที่กัน skills leak หาย → **ชดเชย:** denylist (root dogfood/tooling) + tripwire + allowlist อื่นยังแข็ง; case 9 ใหม่พิสูจน์ allowlist ยังจับ leak ชนิดอื่น; +hasSkills assert กัน skills หล่นเงียบ (บทเรียน nested-dotfolder R1)
- **test count:** +เคส (R1 ขาด skills) + แก้ case 9 → verify-pack 9→10; installer คงจำนวน (เพิ่ม assert ในเคสเดิม) → รวม ~19; `pass==tests` ≥ MIN_PASS(9) ผ่าน
- **namespace ผสม** (3 skill ไม่มี `warnyin:`) — ยอมรับ (non-breaking); stage command คง `/warnyin:*`

## 7. Dependency ระหว่าง slice/task
```
add-utility-skills   (task เดียว — coupled vertical slice ผ่านทุก layer)
```

## 8. Test strategy ระดับ design
- **functional:** `npm test` เขียวทั้ง suite (pass==tests ≥9); `npm run verify:pack` เขียว + skills ติด tarball (`npm pack --dry-run --json` มี skills path)
- **executable install proof:** `npm run setup:sandbox` → target มี `.claude/skills/{update-codemaps,explore,next}/SKILL.md`; root dogfood ไม่โดนแตะ
- **guard ยังแข็ง (unit):** verify-pack test case 9 ใหม่ ยังจับ leak ชนิดอื่น (พิสูจน์ allowlist ไม่ได้เปิดกว้างเกิน); R1 hasSkills จับ skills หล่น
- **consistency:** skill description ↔ command description เดิม (สื่อตรงกัน); skill body ชี้ playbook ตรง path จริง (dead-link check)
- **VERIFY (ภายหลัง):** behavioral — frontmatter ถูกformat, body ไม่ duplicate playbook, build/ship note ชัด, namespace trade-off เข้าใจได้

## 9. หมายเหตุการตัดสินใจ (ไม่ block)
- **1 task** — coupled vertical slice (เพิ่ม skill โดยไม่เปิด allowlist/verify-pack = แดงทันที); แยก task = intermediate แดง; 1 agent ทำครบสายสม่ำเสมอ (shared-tree commit ครั้งเดียว)
- **`hasSkills` เป็น required assertion** — สอดบทเรียน R1 (nested dotfolder ต้องติด); ทำให้ skills ไม่หล่นเงียบในอนาคต
- **skill body ไม่ใช้ `$ARGUMENTS`** — uncertain ว่า skill รองรับ arg syntax แบบ command; เขียนให้ไม่พึ่ง (ปลอดภัยกว่า) — ยืนยัน behavioral ตอน VERIFY
- root dogfood copy: ข้าม (รอ release — precedent #5-#8)
- global rule placement = `docs/rule.md` (skill-adapter convention) — §1 หรือ §ใหม่; ยืนยันตอน SHIP
