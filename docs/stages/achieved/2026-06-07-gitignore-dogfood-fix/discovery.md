# Discovery — gitignore-dogfood-fix

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `gitignore-dogfood-fix` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-07 |
| **ผู้ร่วมตัดสินใจ** | maintainer |
| **เริ่มจาก** | `docs/rule.md` §6 (2-layer bootstrap) + `docs/project.md` (zero-dep self-hosting) |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> แก้ **bug bootstrap:** root dogfood (64 ไฟล์) ถูก commit ขัด rule §6 (ควร gitignored) + drift จาก src + `.gitignore` **ไม่มี dogfood entries** → **untrack + เขียน `.gitignore` ใหม่ root-anchored** (anchor `/` จำเป็นสำหรับ `/.warnyin/`+`/.claude/` กัน match src; ดู issue.md D1)

## 2. Problem & Why now
- **ปัญหา:** rule §6 + CONTRIBUTING บอก root dogfood = gitignored ห้าม commit แต่ git **track 64 ไฟล์** (snapshot 0.7.0 เก่า **drift** จาก src v-next); `.gitignore` **ไม่มี dogfood entries เลย** จึงไม่เคย ignore
- **ทำไมตอนนี้:** ค้นพบจากการ check หลัง P2 #10; เป็น **foundational** (git state ขัด rule §6 + 2 ชุด playbook drift) ควรแก้ก่อน P2 ที่เหลือ
- **หมายเหตุ (แก้จาก dry-run):** เดิมเข้าใจว่ามี "ระเบิดเวลา src skill หลุด" จาก `.claude/skills/` ไม่ anchored — **พิสูจน์แล้วไม่จริง** (mid-slash anchored root); ความเร่งด่วนลดลงแต่ bug หลัก (tracked+drift) ยัง valid (ดู `tasks/untrack-dogfood/issue.md` D1)
- **ผูก project.md:** เป้าหมาย "publish payload ติดครบ ไม่หลุด" + "2-layer แยกขาด" — bug นี้ทำลายทั้งสอง

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- `git rm -r --cached` root dogfood 64 ไฟล์: `.warnyin/` (47), `.claude/commands/warnyin` (10), `.claude/agents` (5), `CLAUDE.md`, `AGENTS.md` — **เฉพาะ path root ไม่แตะ `src/`**
- เขียน `.gitignore` ใหม่ให้ dogfood **root-anchored** (`/.warnyin/`, `/.claude/commands/`, `/.claude/agents/`, `/CLAUDE.md`, `/AGENTS.md`) + แก้ `.claude/skills/` → `/.claude/skills/`
- ยืนยัน `setup:dogfood` ยัง regen root ได้ (0.8.4)

**Out of scope (จะไม่ทำในรอบนี้)**
- **rewrite git history** (Q2 — untrack ไปข้างหน้าพอ ไม่มี secret)
- เก็บ CLAUDE.md/AGENTS.md ไว้ track (Q1 — untrack ตาม rule §6)
- แก้ entry `.gitignore` อื่นที่ไม่ใช่ dogfood (`build/` ฯลฯ) นอกจากทบทวนเล็กน้อย
- แตะ `src/`, payload, playbook กลาง, npm `files`

## 4. Decision Log
| # | ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| 1 | intended state | gitignored vs committed | gitignored | **gitignored** | rule §6 + CONTRIBUTING บอกชัด — ไม่ใช่ทางเลือก, เป็นการแก้ให้ตรง doc |
| 2 | CLAUDE.md/AGENTS.md | untrack vs keep | untrack | **untrack** (Q1) | สอด rule §6; fresh clone ใช้ setup:dogfood (CONTRIBUTING บอกแล้ว) |
| 3 | git history | untrack-only vs rewrite | untrack-only | **untrack-only** (Q2) | rewrite อันตราย (force-push) + overkill (ไม่มี secret) |
| 4 | `.claude/skills/` anchoring | แก้รวม vs แยก | แก้รวมในนี้ | **แก้รวม** | root cause เดียวกัน (anchoring) — แก้ทีเดียว |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** working tree หลัง `git rm --cached` ยังมีไฟล์ → dev ใช้ต่อได้; `setup:dogfood` (0.8.4) ทำงาน
- **ข้อจำกัด:** ห้ามแตะ `src/` (source publish); `.gitignore` ต้อง root-anchored ทุก dogfood entry (กัน match src)

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- `git ls-files '.warnyin/' '.claude/commands/warnyin' '.claude/agents' CLAUDE.md AGENTS.md` → **0 ไฟล์** (untracked หมด)
- `git ls-files 'src/'` → **ครบเหมือนเดิม** (src ไม่หาย — โดยเฉพาะ `src/.warnyin/`, `src/.claude/skills/`)
- `git check-ignore src/.claude/skills/x/SKILL.md` → **ไม่ match** (anchored แล้ว); `git check-ignore .warnyin/workflow/x.md` → match (root ignored)
- `git status` สะอาด (dogfood ไม่โผล่เป็น untracked รก)
- `npm test` + `verify:pack` เขียว; `setup:dogfood` regen root ได้
- fresh-clone simulation: clone → src ครบ → `setup:dogfood` → dogfood กลับมา

## 7. Feature ideas / วิธีแก้ (ส่งต่อ DESIGN)
- 1 task: untrack + gitignore-rewrite + verify; เป็น git/config งานเดียว coupled
- VERIFY เด่น: **fresh-clone simulation ใน temp** (พิสูจน์ src ไม่หาย + skills ไม่ ignored + dogfood regen) — สำคัญสุดเพราะเสี่ยงโดน src

## 8. Open questions
- (ไม่มี — Q1/Q2 ปิด, intended state มีใน doc)

## 9. ความเสี่ยงหลัก
- **`git rm --cached` โดน src/** → ลด: path root เจาะจง + `.gitignore` root-anchored + fresh-clone VERIFY
- **`.gitignore` ไม่ anchored ทำ src หาย** (บทเรียน rule §6) → ลด: ทุก dogfood entry นำด้วย `/` + `git check-ignore` ยืนยัน src รอด

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- เอกสาร: `docs/rule.md` §6, `CONTRIBUTING.md`, `src/scripts/setup-dogfood.mjs`, `.gitignore`

---

## ✅ Gate → DESIGN
- [x] Problem / why-now ชัด ผูก rule §6 + project.md
- [x] Scope in/out ชัด (untrack 64 + gitignore rewrite; ไม่ rewrite history, ไม่แตะ src)
- [x] Decision log ปิดครบ (Q1/Q2 + intended state จาก doc) ไม่มี open question
- [x] success criteria วัดได้ (ls-files 0 + src ครบ + check-ignore + fresh-clone sim)
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน (รอ)
