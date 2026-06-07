# Task — untrack-dogfood

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Task** | `untrack-dogfood` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | repo meta (git index + `.gitignore`) |
| **สถานะ** | `เสร็จ` |

## 1. เป้าหมายของ task (vertical slice)
git state ตรง rule §6 — root dogfood untracked + ignored (anchored) โดย **`src/` ปลอดภัย** + dogfood working tree ใช้งานได้ + regression เขียว

## 2. Dependency
- ต้องทำหลัง: — (task เดียว coupled)
- ปลดล็อกให้: —

## 3. Sub-tasks (★ ลำดับ ATOMIC — guard ก่อน rm)
- [ ] 1. **guard:** `git rm -r --cached --dry-run .warnyin .claude CLAUDE.md AGENTS.md` → ตรวจผล **ไม่มี `src/`** ใด ๆ (มี = หยุด รายงาน path ผิด)
- [ ] 2. **untrack:** `git rm -r --cached .warnyin .claude CLAUDE.md AGENTS.md` (ลบ index, เก็บ working tree)
- [ ] 3. **`.gitignore`:** เพิ่ม dogfood section root-anchored (`/.warnyin/`, `/.claude/`, `/CLAUDE.md`, `/AGENTS.md`) + **ลบ** `.claude/skills/` และ `.claude/settings.local.json` เดิม (ถูก `/.claude/` ครอบ)
- [ ] 4. **self-verify ก่อน commit:** `git ls-files` dogfood = 0 · `git ls-files src/.claude/skills/` = 3 · `git check-ignore src/.claude/skills/explore/SKILL.md` ไม่ match · `git check-ignore .warnyin/workflow/stages/build.md` match · git status สะอาด
- [ ] 5. **commit atomic:** untrack + .gitignore ใน commit เดียว
- [ ] 6. **regression:** `npm test` 19/19 + `npm run verify:pack` เขียว

## 4. ขอบเขตไฟล์ที่จะแตะ
- **git index:** ลบ tracking ของ root `.warnyin/`, `.claude/`, `CLAUDE.md`, `AGENTS.md` (working tree คงอยู่)
- **แก้:** `.gitignore`
- **ห้ามแตะ:** `src/**` (โดยเฉพาะ `src/.warnyin/`, `src/.claude/`), payload, playbook กลาง, `package.json` `files`, working tree dogfood (แค่ untrack ไม่ลบไฟล์)

## 5. Acceptance criteria
- [ ] dogfood tracked = 0 (`.warnyin/`, root `.claude/`, CLAUDE.md, AGENTS.md)
- [ ] `src/` track ครบเหมือน baseline (รวม `src/.claude/skills/` 3, `src/.warnyin/`)
- [ ] `.gitignore` dogfood entries root-anchored; `git check-ignore` ยืนยัน src ไม่โดน + root โดน
- [ ] git status สะอาด; commit atomic
- [ ] `npm test` + `verify:pack` เขียว
- [ ] fresh-clone sim: temp มี `src/**` ครบ + ไม่มี root dogfood
- [ ] ทำตาม `rule.md` + `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
