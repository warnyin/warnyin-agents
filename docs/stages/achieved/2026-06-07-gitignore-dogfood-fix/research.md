# Research — gitignore-dogfood-fix

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `gitignore-dogfood-fix` |
| **วันที่** | 2026-06-07 |

---

## 1. คำถามวิจัย
- [x] RQ1: root dogfood ถูก track จริงไหม + กี่ไฟล์ + อะไรบ้าง?
- [x] RQ2: intended state คืออะไร (doc บอกว่าควรเป็นยังไง)?
- [x] RQ3: drift ระหว่าง root dogfood กับ src จริงไหม?
- [x] RQ4: `.gitignore` ปัจจุบันมีปัญหา anchoring ไหม?
- [x] RQ5: untrack แล้ว fresh clone / dev ยังใช้งานได้ไหม (`setup:dogfood` regen ได้)?

## 2. วิธี & แหล่งข้อมูล
- [x] `git ls-files` / `git check-ignore` (สถานะ track จริง)
- [x] `diff -rq` root vs src (drift)
- [x] อ่าน `.gitignore`, `CONTRIBUTING.md`, `docs/rule.md` §6, `src/scripts/setup-dogfood.mjs`

## 3. Findings

### RQ1: root dogfood ถูก track — **64 ไฟล์**
- `git ls-files '.warnyin/'` → **47** (27 `.warnyin/template` + 20 `.warnyin/workflow`)
- `.claude/commands/warnyin` → **10** · `.claude/agents` → **5** · `.claude/skills` → 0 (ignored แล้ว)
- `CLAUDE.md` + `AGENTS.md` → tracked ทั้งคู่
- **หลักฐาน:** `git ls-files` (check 2026-06-07)

### RQ2: intended state = **gitignored, ห้าม commit** (ชัด 100%)
- `docs/rule.md` §6: "root `.warnyin/`/`.claude/{commands/warnyin,agents}`/`CLAUDE.md`/`AGENTS.md` เป็น dogfood ที่ install จาก release และ **gitignored — ห้าม commit**"
- `CONTRIBUTING.md` §17 + §21-27: dogfood gitignored + "clone ใหม่ → `npm run setup:dogfood`"
- **นัย:** สถานะปัจจุบัน = **bug** (ของจริงขัด doc) ไม่ใช่ design ทางเลือก

### RQ3: drift จริง — root = 0.7.0 เก่า
- `diff -rq .warnyin/workflow src/.warnyin/workflow`: `contexts/` มีแค่ src; `stages/{build,design,discovery,ship,verify}.md` + `roles/{developer,qa,security}.md` ต่างหมด
- **นัย:** repo มี playbook 2 ชุด drift กันใน git — สับสน + ขัด single-source

### RQ4: `.gitignore` ปัญหาหลัก = **ไม่มี dogfood entries เลย**
- มีแค่ `.idea/`/`.vscode/`/`settings.local.json`/`.claude/skills/`/`.agents/`/`*.tgz`/`node_modules` — **ไม่มี** `.warnyin/`, `.claude/commands/`, `.claude/agents/`, `CLAUDE.md`, `AGENTS.md` → จึงไม่เคย ignore → 64 ไฟล์ค้าง track
- **หลักฐาน:** `cat .gitignore`
- **⚠️ แก้จาก dry-run:** เดิมระบุว่า `.claude/skills/` (line 20) ไม่ anchored → leak `src/.claude/skills/` — **ผิด**. `git check-ignore src/.claude/skills/explore/SKILL.md` → **exit 1 (ไม่ match)**. git: pattern มี separator **กลาง** = anchored to repo root อยู่แล้ว. ดังนั้น **ไม่มี latent skills-leak**; entry ใหม่ที่ต้อง anchor จริงคือ `/.warnyin/` + `/.claude/` (trailing-slash, ไม่มี separator กลาง → ถ้าไม่ `/` จะ match `src/` ที่ทุก depth)

### RQ5: untrack แล้วใช้งานได้ — `setup:dogfood` regen ได้
- `git rm --cached` ไม่ลบ working tree → dev ปัจจุบันใช้ root dogfood ต่อได้ทันที
- `src/scripts/setup-dogfood.mjs` ติดตั้ง `@warnyin/agents@latest` (0.8.4) ลง root → fresh clone regen ได้ (CONTRIBUTING §21-27 บอกขั้นตอนไว้แล้ว)
- **นัย:** untrack ปลอดภัย ไม่กระทบ workflow การพัฒนา

## 4. Code inspection
| ไฟล์ / คำสั่ง | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `git ls-files .warnyin/ .claude/` | 64 ไฟล์ dogfood tracked | `git rm -r --cached` (เฉพาะ path root ไม่ใช่ src) |
| `.gitignore` | ขาด dogfood + `.claude/skills/` ไม่ anchored | rewrite root-anchored |
| `docs/rule.md` §6 + `CONTRIBUTING.md` | intended = gitignored | ไม่ต้องถาม intended (ชัด) |
| `src/scripts/setup-dogfood.mjs` | regen root จาก @latest | fresh clone กู้ได้ |
| `diff root vs src` | drift (0.7.0 vs v-next) | ยิ่งต้อง untrack กัน 2 ชุด |

## 5. ทางเลือก & เปรียบเทียบ
| ประเด็น | ทางเลือก | เลือก | เหตุผล |
|---|---|---|---|
| history | untrack-only vs rewrite | **untrack-only** | rewrite อันตราย (force-push) + overkill (ไม่มี secret) |
| CLAUDE/AGENTS | untrack vs keep | **untrack** | สอด rule §6 + CONTRIBUTING; fresh clone ใช้ setup:dogfood |

## 6. ความเสี่ยง / unknown
- **เสี่ยงสุด:** `git rm --cached` เผลอโดน `src/` → *ลด:* ระบุ path root เจาะจง (`.warnyin/` ไม่ใช่ `src/.warnyin/`) + `.gitignore` root-anchored (`/`) + VERIFY fresh-clone simulation (src ครบ, skills ไม่ ignored)
- `.gitignore` entries อื่นที่ไม่ anchored (`build/`, `.vscode/`) — ผลน้อย แต่ทบทวนได้

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำ:** intended state มีใน doc แล้ว → DESIGN ตรงได้ (decision น้อย); 1 task: `git rm -r --cached` 64 ไฟล์ + rewrite `.gitignore` root-anchored (รวมแก้ `.claude/skills/` → `/.claude/skills/`) + ยืนยัน setup:dogfood; VERIFY = fresh-clone sim
- **ป้อนกลับ discovery:** Q1 untrack CLAUDE/AGENTS · Q2 untrack-only
