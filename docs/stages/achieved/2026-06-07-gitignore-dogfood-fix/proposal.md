# Proposal — gitignore-dogfood-fix (untrack root dogfood + anchor .gitignore)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Slug** | `gitignore-dogfood-fix` |
| **ประเภท** | `bugfix` (git/config — bootstrap correctness) |
| **ขนาด** | `เล็ก-กลาง` |
| **วันที่** | 2026-06-07 |
| **มาจาก Discovery?** | `./discovery.md` (Q1/Q2 ปิด) |

## 1. สรุป change (what)
**untrack root dogfood 64 ไฟล์** (`.warnyin/` 47 + root `.claude/` 15 + `CLAUDE.md` + `AGENTS.md`) ด้วย `git rm -r --cached` + **เขียน `.gitignore` ใหม่ให้ dogfood entries root-anchored** (`/.warnyin/`, `/.claude/`, `/CLAUDE.md`, `/AGENTS.md`) — แก้ให้ตรง rule §6 (dogfood gitignored ห้าม commit); **ไม่แตะ `src/`, ไม่ rewrite history**
> หมายเหตุ (จาก dry-run): entry ใหม่ **`/.warnyin/` + `/.claude/`** ต้อง anchor `/` จริง เพราะ trailing-slash ไม่มี separator กลาง → ถ้าไม่ anchor จะ match `src/.warnyin/`, `src/.claude/` (source หาย); ส่วนบรรทัดเดิม `.claude/skills/` **ไม่ได้ leak** (มี separator กลาง → git anchor root อยู่แล้ว) — การรวบเป็น `/.claude/` เป็นเรื่อง consolidate ให้สะอาด ไม่ใช่ปิด bug

## 2. ทำไม (why)
- **ปัญหา:** root dogfood ถูก commit (snapshot 0.7.0 **drift** จาก src v-next) ขัด rule §6 + CONTRIBUTING; `.gitignore` **ไม่มี dogfood entries เลย** จึงไม่เคย ignore → 64 ไฟล์ค้างใน git; ของจริง (committed) ขัดกับ doc (rule §6 บอก gitignored)
- **ผลถ้าไม่ทำ:** playbook/skill ใหม่ที่เพิ่มใน `src/` ถูก dogfood เก่าใน git บดบัง/สับสน (มี 2 ชุด drift กัน); ขัดเป้าหมาย project "2-layer แยกขาด"
- **หมายเหตุความเสี่ยง (แก้จาก dry-run):** เดิมเข้าใจว่ามี "ระเบิดเวลา src skill หลุด" จาก `.claude/skills/` ไม่ anchored — **พิสูจน์แล้วว่าไม่จริง** (mid-slash pattern anchored to root โดย git default; `git check-ignore src/.claude/skills/...` = ไม่ match). ความเร่งด่วนจึงต่ำกว่าที่ประเมินแรก แต่ bug "dogfood tracked + drift" ยัง valid และควรแก้

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. untrack-only + gitignore anchored | แก้ตรง rule §6, ปลอดภัย, dev ใช้ต่อได้ | history ยังมี snapshot เก่า (ไม่กระทบ) | ✅ |
| B. + rewrite history | history สะอาด | force-push + ทุกคน re-clone + อันตราย (ไม่มี secret) | — (Q2) |
| C. keep CLAUDE.md/AGENTS.md tracked | fresh clone มี instruction | ขัด rule §6 + ต้องแก้ rule/CONTRIBUTING | — (Q1) |

- **เหตุผล A:** rule §6 + CONTRIBUTING นิยาม intended state ไว้แล้ว (gitignored); untrack-only พอ — working tree ไม่หาย dev ใช้ต่อได้, fresh clone ใช้ `setup:dogfood`

## 4. Scope
**In scope**
- `git rm -r --cached .warnyin .claude CLAUDE.md AGENTS.md` (64 ไฟล์ root — path เจาะจง ไม่แตะ `src/`)
- `.gitignore` ใหม่: dogfood section root-anchored (`/.warnyin/`, `/.claude/`, `/CLAUDE.md`, `/AGENTS.md`); ลบบรรทัด `.claude/skills/` + `.claude/settings.local.json` เดิม (ถูก `/.claude/` ครอบ)
- ยืนยัน `setup:dogfood` regen ได้ + fresh-clone simulation

**Out of scope**
- rewrite git history (Q2)
- เก็บ CLAUDE.md/AGENTS.md tracked (Q1)
- แตะ `src/`, payload, playbook กลาง, npm `files`
- แก้ entry `.gitignore` อื่นที่ไม่เกี่ยว dogfood (`build/`, `.vscode/`, `.agents/`, `skills-lock.json`) — คงเดิม (ทบทวนแล้ว low-risk)

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบเดิมที่กระทบ:** git tracking ของ root dogfood (หายจาก index แต่ working tree คงอยู่); fresh-clone flow (ต้อง setup:dogfood — มีใน CONTRIBUTING แล้ว); **ไม่กระทบ src/build/test/payload**
- **ความเสี่ยง + ลด (สำคัญ):**
  - **`git rm --cached` เผลอโดน `src/`** → *ลด:* path เจาะจง (`.warnyin` ไม่ใช่ `src/.warnyin`); VERIFY assert `git ls-files src/` ครบ
  - **`.gitignore` ไม่ anchored ทำ src หาย** → *ลด:* ทุก dogfood entry นำด้วย `/`; VERIFY `git check-ignore src/.claude/skills/...` = ไม่ match
  - **dev ปัจจุบันงง (dogfood หาย?)** → *ลด:* working tree ไม่ลบ (แค่ --cached); git status สะอาดขึ้น

## 6. ลิงก์
- Design: `./design.md` · Tasks: `./tasks/` · Discovery: `./discovery.md` · Research: `./research.md`
