# Task — add-utility-skills

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `add-utility-skills` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | Claude adapter (skills) + installer + packaging + test |
| **สถานะ** | `build ผ่าน` (npm test 19/19, verify:pack เขียว, skills ติด tarball, sandbox install proof ผ่าน) |

## 1. เป้าหมายของ task (vertical slice)
ทำให้ **3 safe utility skill ship ครบสาย end-to-end** — authored (`.claude/skills`) → installed (`cli.mjs` CORE) → packaged (`package.json` allowlist + `verify-pack.mjs`) → tested (installer + verify-pack test) + note build/ship คงเป็น command + global skill-adapter convention รอ SHIP

## 2. Dependency
- ต้องทำหลัง: — (task เดียว — coupled vertical slice ผ่านทุก layer)
- ปลดล็อกให้: —

## 3. Sub-tasks (★ ลำดับ ATOMIC — กัน intermediate แดง, จาก dry-run B1/B2/B3)
- [x] 1. NEW `src/.claude/skills/{update-codemaps,explore,next}/SKILL.md` — frontmatter (name/description/when_to_use/allowed-tools read-only) + body ชี้ playbook `.warnyin/workflow/{codemap,explore,next}.md`
- [x] 2. `package.json` `files` — +`"src/.claude/skills"`
- [x] 3. `src/bin/cli.mjs` CORE — +`path.join('.claude','skills')`
- [x] 4. `src/tests/verify-pack.test.mjs` **(ก่อน hasSkills)** — เพิ่ม `'src/.claude/skills/explore/SKILL.md'` ใน GOOD baseline (กัน deepEqual([]) แดง — B2)
- [x] 5. `src/scripts/verify-pack.mjs` — ALLOWED_PREFIX +`'src/.claude/skills/'`; `hasSkills` ใช้ **prefix กว้าง** `files.some(p=>p.startsWith('src/.claude/skills/'))` (ตรง GOOD — B3); แก้ comment บรรทัด 5
- [x] 6. `src/tests/verify-pack.test.mjs` — case 9 (บรรทัด 70) เขียนใหม่ leak=`'src/.vscode/x.json'` (ยังนอก allowlist — B1, ห้ามลบ assertion); **+เคส R1 ใหม่** "ขาด skills → error" (count 9→10, ไม่ rename case 9 — G2)
- [x] 7. `src/tests/installer.test.mjs` — assert `.claude/skills/update-codemaps/SKILL.md` ลงในเคส "ติดตั้งสด โครงครบ" (G1)
- [x] 8. `src/.claude/commands/warnyin/{build,ship}.md` — +note คงเป็น command (user-only โดยตั้งใจ)
- [x] 9. global skill-adapter convention note ใน `rule.md` §2 (รอ SHIP) — มีอยู่แล้วใน rule.md §2
- [x] 10. `npm test` (pass==tests=19 ≥9) + `npm run verify:pack` + `npm pack --dry-run --json` (skills ติด)

## 4. ขอบเขตไฟล์ที่จะแตะ
- แก้: `src/.claude/skills/*` (NEW), `src/bin/cli.mjs`, `package.json`, `src/scripts/verify-pack.mjs`, `src/tests/{verify-pack,installer}.test.mjs`, `src/.claude/commands/warnyin/{build,ship}.md`
- **ห้ามแตะ:** playbook กลาง `.warnyin/workflow/*` (skill ชี้กลับ), `AGENTS.md`, `docs/rule.md` central (รอ SHIP), root dogfood, command เดิมอื่น (พฤติกรรมไม่เปลี่ยน)

## 5. Acceptance criteria
- [x] 3 skill SKILL.md มี frontmatter auto-invocable + body ชี้ playbook (ไม่ duplicate)
- [x] `cli.mjs` CORE มี `.claude/skills`; `setup:sandbox` → target มี skills ครบ 3; root dogfood ไม่โดนแตะ
- [x] `package.json files` + `verify-pack.mjs` allow skills; `hasSkills` assert ทำงาน
- [x] `verify-pack.test.mjs` case 9 ใหม่ยังจับ leak อื่น (src/.vscode/); เคส R1 ขาด skills ทำงาน; GOOD ผ่าน
- [x] `installer.test.mjs` assert skills ลง
- [x] build/ship command มี note; `AGENTS.md`/playbook กลางไม่แตะ
- [x] global skill-adapter note ใน rule.md §2 (รอ SHIP)
- [x] `npm test` เขียว (pass==tests=19 ≥9) + `verify:pack` เขียว + skills ติด tarball
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
