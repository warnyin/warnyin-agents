# Spec — add-utility-skills

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`feature` (Claude adapter) + `code` (installer/packaging/test) — 1 coupled vertical slice

## 2. Skill format (canonical — design §2)
```
src/.claude/skills/<name>/SKILL.md
---
name: <name>
description: <สั้น actionable — อิง command description เดิม>
when_to_use: <trigger context — description-driven, ไม่มี event>
allowed-tools: <read-only>
---
ทำหน้าที่เป็น <role> ตาม playbook กลาง — อ่าน `.warnyin/workflow/<x>.md` แล้วทำตาม (ชี้ playbook ไม่ duplicate)
```
- 3 skill: `update-codemaps`→`codemap.md` · `explore`→`explore.md` · `next`→`next.md`
- auto-invocable (ไม่ใส่ `disable-model-invocation`); read-only allowed-tools
- update-codemaps `when_to_use`: "หลังเพิ่ม/ย้าย/ลบไฟล์ หรือเปลี่ยนโครงสร้าง → refresh docs/codemap/"
- ไม่พึ่ง `$ARGUMENTS` (skill รับ context จาก request)

## 3. จุดที่ต้องแก้ (design §4)
| ไฟล์ | ใส่อะไร |
|---|---|
| `src/.claude/skills/{update-codemaps,explore,next}/SKILL.md` (NEW) | frontmatter + body ชี้ playbook |
| `src/bin/cli.mjs` CORE (~บรรทัด 66-71) | +`path.join('.claude','skills')` |
| `package.json` `files` | +`"src/.claude/skills"` |
| `src/scripts/verify-pack.mjs` | ALLOWED_PREFIX +`'src/.claude/skills/'`; +`hasSkills` (R1, skills ต้องติด → error ถ้าขาด); แก้ comment บรรทัด 5 |
| `src/tests/verify-pack.test.mjs` | GOOD +`'src/.claude/skills/explore/SKILL.md'`; case 9 (บรรทัด 70) เขียนใหม่ — leak ตัวอย่างอื่น (เช่น `'src/.vscode/x.json'`); +เคส "R1: ขาด skills → error" |
| `src/tests/installer.test.mjs` | เคส "ติดตั้งสด โครงครบ" +assert `.claude/skills/update-codemaps/SKILL.md` exists |
| `src/.claude/commands/warnyin/{build,ship}.md` | +1 บรรทัดท้าย note (คงเป็น command, user-only โดยตั้งใจ — irreversible) |

## 4. Data-flow
install: cli CORE copyTree `.claude/skills` → target · package: `files` รวม skills → verify-pack allow+assert · runtime: model auto-invoke (description) → skill body → อ่าน playbook → ทำตาม

## 5. Persona
ผู้ใช้ Claude Code ปลายทาง — utility ปลอดภัย auto-invoke ลดแรงเสียดทาน; build/ship ยัง user-only

## 6. Test-flow
- [ ] `npm test` เขียวทั้ง suite (pass==tests ≥ MIN_PASS 9) — count ขึ้นจาก 18 (เพิ่มเคส)
- [ ] `npm run verify:pack` เขียว + `npm pack --dry-run --json` มี `src/.claude/skills/*/SKILL.md`
- [ ] `verify-pack.test.mjs` case 9 ใหม่ยังจับ leak ชนิดอื่น (allowlist ไม่เปิดกว้างเกิน); R1 hasSkills จับ skills หล่น
- [ ] `setup:sandbox` → target มี `.claude/skills/{update-codemaps,explore,next}/SKILL.md`; root dogfood ไม่โดนแตะ
- [ ] skill body ชี้ playbook path จริง (dead-link 0); command build/ship มี note
- [ ] ไม่แตะ `AGENTS.md`, playbook กลาง, `docs/rule.md` central
