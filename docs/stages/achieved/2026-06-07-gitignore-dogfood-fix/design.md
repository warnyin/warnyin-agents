# Design (How) — gitignore-dogfood-fix

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> Lens: SA · git/config fix, 1 coupled slice

## 1. ภาพรวมสถาปัตยกรรม
- **component:** repo meta (git tracking + `.gitignore`) — ไม่ใช่ installer code; ไม่แตะ `src/`, payload, playbook
- **แนวทางหลัก:** untrack root dogfood (path เจาะจง) + `.gitignore` root-anchored → ให้ git state ตรง rule §6 (dogfood gitignored); working tree ไม่หาย (dev/`setup:dogfood` ใช้ต่อ)
- **invariant:** `src/**` track ครบเหมือนเดิม (โดยเฉพาะ `src/.warnyin/`, `src/.claude/skills/`) · `npm test`/`verify:pack` เขียว · working tree dogfood คงอยู่

## 2. `.gitignore` ใหม่ (dogfood section — root-anchored)
> เพิ่ม section + **ลบ** บรรทัดเดิมที่ถูกครอบ (`.claude/skills/`, `.claude/settings.local.json`)
```gitignore
# === DOGFOOD layer (root) — gitignored ตาม rule §6; source = src/** ===
# ★ root-anchored (/) เพื่อไม่ให้ match src/.warnyin, src/.claude (source ที่ต้อง publish)
/.warnyin/
/.claude/
/CLAUDE.md
/AGENTS.md
```
- `/.claude/` ครอบ root `.claude/` ทั้งก้อน (commands/agents/skills/settings.local.json) — root `.claude/` เป็น dogfood 100% (source อยู่ `src/.claude/`)
- คงไว้: editor/dep section (`.idea/`, `node_modules/` ฯลฯ), `.agents/`, `skills-lock.json` (ไม่ใช่ dogfood layer — out of scope)

## 3. Vertical slices
> coupled — untrack + gitignore + verify ต้องไปด้วยกัน (untrack อย่างเดียวไม่ anchor = src เสี่ยง; anchor อย่างเดียวไม่ untrack = ยัง track อยู่) → **1 slice**

| # | Slice | ตัดผ่าน layer | → task |
|---|---|---|---|
| 1 | **git state ตรง rule §6** — root dogfood untracked + ignored (anchored) + src ปลอดภัย + dogfood ใช้งานได้ | git index · .gitignore · verify (fresh-clone) | `tasks/untrack-dogfood/` |

## 4. ลำดับ command (atomic — กัน src โดน)
```
1. git rm -r --cached .warnyin .claude CLAUDE.md AGENTS.md   # untrack 64 (path root — ไม่ใช่ src/)
   → ★ ยืนยันก่อน: git rm --dry-run ต้องไม่มี src/ ในรายการ
2. เขียน .gitignore ใหม่ (dogfood section anchored + ลบ .claude/skills, .claude/settings.local.json)
3. git add .gitignore  → commit (untrack + gitignore atomic ใน commit เดียว)
```
- **guard:** ก่อน rm จริง รัน `git rm -r --cached --dry-run ...` → grep ว่า **ไม่มี `src/`** ในผลลัพธ์ (ถ้ามี = หยุด)

## 5. Flow
- **dev ปัจจุบัน:** ไฟล์ working tree ไม่หาย → ใช้ root dogfood ต่อได้; `git status` สะอาดขึ้น (dogfood ไม่โผล่)
- **fresh clone:** clone → ได้ `src/**` ครบ (ไม่มี root dogfood) → `npm run setup:dogfood` → ได้ root `.warnyin/`/`.claude/`/`CLAUDE.md`/`AGENTS.md` จาก release 0.8.4

## 6. ผลกระทบต่อระบบเดิม
- **git index:** -64 ไฟล์ (root dogfood); **src/ ไม่กระทบ**
- **CONTRIBUTING/rule §6:** ของจริงมาตรงกับ doc แล้ว (ไม่ต้องแก้ doc — doc ถูกอยู่แล้ว ของจริงเพิ่งตามมา)
- **`.gitignore` line 20 เดิม (`.claude/skills/`)** ถูกแทนด้วย `/.claude/` → **consolidate** root `.claude/` เป็น entry เดียว (สะอาดขึ้น); *หมายเหตุ dry-run:* บรรทัดเดิมไม่ได้ leak src อยู่แล้ว (mid-slash anchored root) — นี่ไม่ใช่การปิด bug แต่เป็นการรวบให้ชัด
- **ความจำเป็นของ anchor `/`:** entry ใหม่ `/.warnyin/` + `/.claude/` (trailing-slash, ไม่มี separator กลาง) ถ้าไม่ anchor จะ match `src/.warnyin/`, `src/.claude/` ที่ทุก depth → **ต้อง anchor จริง** (พิสูจน์ใน dry-run)
- backward: ไม่มี breaking ต่อ npm payload (ไม่แตะ `files`/`src/`)

## 7. Dependency
```
untrack-dogfood   (task เดียว — coupled git/config slice)
```

## 8. Test strategy ระดับ design
- **untrack สำเร็จ:** `git ls-files '.warnyin/' '.claude/commands/warnyin' '.claude/agents' CLAUDE.md AGENTS.md` → 0
- **src ปลอดภัย (critical):** `git ls-files 'src/'` ครบเหมือน baseline (โดยเฉพาะ `src/.warnyin/`, `src/.claude/skills/` 3 ไฟล์)
- **anchoring ถูก:** `git check-ignore src/.claude/skills/explore/SKILL.md` → ไม่ match (exit 1); `git check-ignore .warnyin/workflow/stages/build.md` + `CLAUDE.md` → match
- **regression:** `npm test` 19/19 + `verify:pack` เขียว (ไม่แตะ payload)
- **VERIFY เด่น — fresh-clone simulation:** `git clone . <temp>` (หรือ `git archive`) → assert temp มี `src/**` ครบ + ไม่มี root dogfood + `src/.claude/skills/` ติด → (option) รัน setup:sandbox/dogfood พิสูจน์ regen
