# Spec — untrack-dogfood

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. ชนิดของ task
`config` / `infra` (git tracking + `.gitignore`) — ไม่มี runtime code

## 2. สิ่งที่ต้องทำ
1. **untrack root dogfood** — `git rm -r --cached .warnyin .claude CLAUDE.md AGENTS.md` (64 ไฟล์: `.warnyin/` 47 + root `.claude/` 15 + 2 root doc)
2. **`.gitignore` ใหม่** — เพิ่ม dogfood section **root-anchored**; ลบบรรทัดเดิมที่ถูกครอบ
3. commit untrack + gitignore **ใน commit เดียว** (atomic)

## 3. `.gitignore` dogfood section (เพิ่ม)
```gitignore
# === DOGFOOD layer (root) — gitignored ตาม rule §6; source = src/** ===
# ★ root-anchored (/) เพื่อไม่ให้ match src/.warnyin, src/.claude (source ที่ต้อง publish)
/.warnyin/
/.claude/
/CLAUDE.md
/AGENTS.md
```
- **ลบ** บรรทัดเดิม `.claude/skills/` + `.claude/settings.local.json` (ถูก `/.claude/` ครอบ)
- **คงไว้:** OS/editor, deps/build, `.agents/`, `skills-lock.json` (ไม่ใช่ dogfood layer)

## 4. Data-flow
git index: -64 dogfood (path root) → working tree คงอยู่ → `.gitignore` ignore → git status สะอาด; src/ ไม่กระทบ

## 5. Persona
maintainer/contributor — repo state ตรง rule §6 (2-layer แยกขาด); fresh clone ใช้ `setup:dogfood`

## 6. Test-flow
- [ ] **guard ก่อน rm:** `git rm -r --cached --dry-run .warnyin .claude CLAUDE.md AGENTS.md` → ผลลัพธ์ **ไม่มี `src/`** (ถ้ามี = หยุด ห้าม rm)
- [ ] **untracked:** `git ls-files '.warnyin/' '.claude/commands/warnyin' '.claude/agents' CLAUDE.md AGENTS.md` → **0**
- [ ] **src ปลอดภัย (critical):** `git ls-files 'src/' | wc -l` = baseline เดิม; `git ls-files 'src/.claude/skills/'` = 3; `git ls-files 'src/.warnyin/'` ครบ
- [ ] **anchoring:** `git check-ignore src/.claude/skills/explore/SKILL.md` → exit 1 (ไม่ match); `git check-ignore .warnyin/workflow/stages/build.md CLAUDE.md AGENTS.md` → match (exit 0)
- [ ] **git status สะอาด** (dogfood ไม่โผล่ untracked)
- [ ] **regression:** `npm test` 19/19 + `npm run verify:pack` เขียว
- [ ] **fresh-clone sim:** `git clone . <temp>` → temp มี `src/**` ครบ (รวม `src/.claude/skills/`) + ไม่มี root `.warnyin/`/`.claude/`/`CLAUDE.md`/`AGENTS.md`
