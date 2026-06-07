# Build Report — gitignore-dogfood-fix (untrack root dogfood)

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`

## 1. ภาพรวม
- **Slug:** `gitignore-dogfood-fix` · **Build branch:** `build/gitignore-dogfood-fix` (จาก `main`)
- **Mode:** main-loop เอง (git-index surgery — ต้องคุม guard ทุกขั้น; ปลอดภัยกว่า fan-out)
- **DAG / wave:** 1 wave · 1 task `untrack-dogfood`
- **ผล:** ✅ ผ่าน — full gate เขียวรอบเดียว (0 รอบแก้)

## 2. ผลต่อ task
| Task | สถานะ | สรุป |
|---|---|---|
| `untrack-dogfood` | ✅ passed | untrack root dogfood 64 ไฟล์ (git rm -r --cached) + `.gitignore` root-anchored; src 78 ครบ, dogfood tracked=0 |

## 3. ไฟล์ที่แก้
- **git index:** −64 (root `.warnyin/` 47 + root `.claude/` 15 + `CLAUDE.md` + `AGENTS.md`) — **working tree คงอยู่**
- **`.gitignore`:** +dogfood section root-anchored (`/.warnyin/`, `/.claude/`, `/CLAUDE.md`, `/AGENTS.md`); ลบ `.claude/skills/` + `.claude/settings.local.json` เดิม (ถูก `/.claude/` ครอบ)

## 4. ลำดับ atomic + guard (ทำจริง)
1. **guard:** `git rm --cached --dry-run` → **64 ไฟล์ · src/ = 0** ✅ (ไม่โดน src)
2. เขียน `.gitignore` ใหม่ก่อน
3. `git rm -r --cached .warnyin .claude CLAUDE.md AGENTS.md` → 64 ไฟล์, src/=0
4. self-verify (ผ่านครบ — §5)
5. commit atomic `d551f5d` (untrack + .gitignore + DESIGN artifacts)

## 5. Full gate (main loop) — ผ่านครบ
- ✅ **dogfood tracked = 0** (`git ls-files '.warnyin/' '.claude/commands/warnyin' '.claude/agents' CLAUDE.md AGENTS.md`)
- ✅ **src ปลอดภัย:** `git ls-files src/` = **78** (baseline); `src/.claude/skills/` = 3; `src/.warnyin/` = 52
- ✅ **anchoring:** `git check-ignore src/.claude/skills/explore/SKILL.md` → ไม่ match; root `.warnyin/`+`CLAUDE.md`+`AGENTS.md` → match
- ✅ **working tree dogfood คงอยู่** (--cached ไม่ลบ; build.md/agents/CLAUDE.md/AGENTS.md ยังบนดิสก์)
- ✅ **git status สะอาด** (dogfood ignored ไม่โผล่ untracked)
- ✅ **regression:** `npm test` 19/19 · `npm run verify:pack` 75 ไฟล์ · `npm pack` ยังรวม src skills 3 (payload ไม่กระทบ)

## 6. Integration notes
- ของจริงตรงกับ doc แล้ว (rule §6 + CONTRIBUTING ถูกอยู่แล้ว — git state เพิ่งตามมา)
- **D1 (dry-run แก้):** "latent skills-leak" ไม่มีจริง — `.claude/skills/` (mid-slash) anchored root อยู่แล้ว; การรวบเป็น `/.claude/` = consolidate; entry ที่ต้อง anchor จริง = `/.warnyin/`+`/.claude/` (trailing-slash)
- ไม่มี troubleshooting entry (0 ปัญหา — guard กันไว้)
- D2 (version marker)/D3 (CI guard) = defer → VERIFY/SHIP

## 7. Gate (build.md §7) — ผ่านครบ
- [x] task implement + commit เข้า build branch
- [x] task passed — ไม่มี failed
- [x] ไม่มี conflict
- [x] Full build/verify ผ่าน (git state + regression)
- [x] test suite เขียว (19/19)
- [x] build.md สรุปครบ
- [x] ไม่แตะ rule/standard กลาง (ไม่มี rule ใหม่ — compliant rule §6 เดิม)

→ พร้อมเข้า **VERIFY** (fresh-clone simulation เป็นจุดชี้ขาด)
