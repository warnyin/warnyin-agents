# Build Report — skill-format (add 3 safe utility skills)

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`

## 1. ภาพรวม
- **Slug:** `skill-format` · **Build branch:** `build/skill-format` (จาก `main`)
- **Isolation:** shared-tree (`isolate:false`) — 1 task, ไม่มี parallel conflict
- **DAG / wave:** 1 wave · 1 task `add-utility-skills` (coupled vertical slice ผ่านทุก layer)
- **ผล:** ✅ ผ่าน — full build+test gate เขียวรอบเดียว (0 รอบแก้)

## 2. ผลต่อ task

| Task | สถานะ | สรุป |
|---|---|---|
| `add-utility-skills` | ✅ passed | 3 safe utility skill (update-codemaps/explore/next) auto-invocable ครบสาย: authored → installed → packaged → tested; build/ship คงเป็น command user-only + note |

ลำดับ **ATOMIC** §3 (10 sub-task) เดินตามเป๊ะ — กัน intermediate red ได้จริง (เพิ่ม skill path ใน GOOD baseline **ก่อน** เพิ่ม `hasSkills` assertion → B2 ปิด)

## 3. ไฟล์ที่แก้ (11)
**Skills (NEW):**
- `src/.claude/skills/update-codemaps/SKILL.md` — ชี้ `.warnyin/workflow/codemap.md`
- `src/.claude/skills/explore/SKILL.md` — ชี้ `.warnyin/workflow/explore.md`
- `src/.claude/skills/next/SKILL.md` — ชี้ `.warnyin/workflow/next.md`

**Installer / packaging:**
- `src/bin/cli.mjs` — CORE +`path.join('.claude','skills')`
- `package.json` — `files` +`"src/.claude/skills"`
- `src/scripts/verify-pack.mjs` — ALLOWED_PREFIX +`'src/.claude/skills/'`; +`hasSkills` R1 assert; แก้ comment

**Tests:**
- `src/tests/verify-pack.test.mjs` — GOOD +skill path; case 9 เขียนใหม่ leak=`src/.vscode/x.json` (config-protection คง assertion); +เคส R1 "ขาด skills → error"
- `src/tests/installer.test.mjs` — assert `.claude/skills/update-codemaps/SKILL.md` ลง

**Command note:**
- `src/.claude/commands/warnyin/{build,ship}.md` — +note คงเป็น command (user-only โดยตั้งใจ — irreversible/stateful)

## 4. Full build & test gate (main loop)
- ✅ `npm test`: **tests 19, pass 19, fail 0** (ขึ้นจาก 18; pass==tests ≥ MIN_PASS 9)
- ✅ `npm run verify:pack`: เขียว (75 ไฟล์)
- ✅ `npm pack --dry-run`: skills ติด tarball ครบ 3 (`explore/next/update-codemaps SKILL.md`)
- ✅ `setup:sandbox`: target มี `.claude/skills/{update-codemaps,explore,next}/SKILL.md`; root dogfood ไม่โดนแตะ
- ✅ ไม่แตะ: `AGENTS.md`, playbook กลาง `.warnyin/workflow/`, `docs/rule.md` central

## 5. Integration notes
- global **skill-adapter convention** note อยู่ใน `tasks/add-utility-skills/rule.md` §2 → **รอ SHIP** promote เข้า `docs/rule.md` (ยังไม่แตะ central)
- ไม่มี troubleshooting entry (ไม่มีปัญหายาก/ซ้ำ — ลำดับ atomic จาก dry-run กันไว้หมด)

## 6. Gate (build.md §7) — ผ่านครบ
- [x] task implement + integrate เข้า build branch
- [x] task รายงาน passed — ไม่มี failed ค้าง
- [x] ไม่มี merge conflict (shared-tree)
- [x] Full build ผ่าน — ไม่มี build error
- [x] test suite เขียวทั้งหมด (19/19)
- [x] `build.md` สรุปครบ
- [x] ไม่แตะ rule/standard กลาง (rule ใหม่ note รอ SHIP)

→ พร้อมเข้า **VERIFY** ด้วย `/warnyin:verify skill-format`
