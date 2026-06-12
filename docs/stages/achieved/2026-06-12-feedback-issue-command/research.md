# Research — command `/warnyin:feedback:issue`

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> ที่เก็บ "ข้อมูลที่ค้นมา + หลักฐาน" สนับสนุนการตัดสินใจใน `discovery.md`

| | |
|---|---|
| **Slug** | `feedback-issue-command` |
| **วันที่** | `2026-06-12` |

---

## 1. คำถามวิจัย (research questions)
- [x] RQ1: slash command ใน repo นี้วางโครงสร้าง/รูปแบบยังไง + nested namespace ทำได้ไหม
- [x] RQ2: repo `warnyin/warnyin-agents` มี issue template / labels อะไรให้ใช้บ้าง
- [x] RQ3: ผู้ใช้ปลายทาง (non-collaborator) เปิด issue + ใส่ label ได้แค่ไหน
- [x] RQ4: กลไกยิง issue — `gh` มีในเครื่องไหม + fallback เปิด issue ทางอื่นได้อย่างไร

## 2. วิธี & แหล่งข้อมูล
- [x] อ่านโค้ด/เอกสารในโปรเจกต์ (code inspection): `.claude/commands/warnyin/*`, `.github/`, git remote
- [x] ค้น GitHub จริง: `gh label list --repo warnyin/warnyin-agents`
- [x] prior art: pattern command เดิม (explore/triage) + GitHub issue permission model

## 3. Findings (ผลการค้นต่อคำถาม)

### RQ1: โครงสร้าง slash command + nested namespace
- **พบว่า:** command อยู่ที่ `.claude/commands/warnyin/<name>.md` (namespace ชั้นเดียว `warnyin:`) มีคู่ source ที่ `src/.claude/commands/warnyin/<name>.md`. รูปแบบไฟล์: frontmatter (`description`, `argument-hint`) + เนื้อความสั่งให้ AI "ทำหน้าที่เป็น X ตาม playbook กลาง" + ชี้ไป `.warnyin/workflow/...` + ใช้ `$ARGUMENTS`
- **หลักฐาน:** `.claude/commands/warnyin/explore.md` (frontmatter + ชี้ `.warnyin/workflow/explore.md`), `triage.md` (ชี้ `.warnyin/workflow/triage.md`); ทั้ง 11 ไฟล์ตรงกันใน root และ `src/`
- **สรุป/นัย:** `/warnyin:feedback:issue` = nested namespace → วางที่ `.claude/commands/warnyin/feedback/issue.md` (Claude Code map โฟลเดอร์ย่อยเป็น `:` ในชื่อ command). ต้องทำคู่ใน `src/` ด้วย. DESIGN ตัดสินว่าจะมี playbook กลางใน `.warnyin/workflow/` หรือ standalone

### RQ2: issue template / labels ของ repo
- **พบว่า:** repo **ไม่มี** `.github/ISSUE_TEMPLATE` (มีแค่ `.github/workflows/ci.yml`). มี default labels พร้อมใช้: `bug` (Something isn't working), `enhancement` (New feature or request), `documentation`, `question`, `duplicate`, `help wanted`, `good first issue`, `invalid`, `wontfix`
- **หลักฐาน:** `find .github -type f` → `ci.yml` เดียว; `gh label list --repo warnyin/warnyin-agents` → 9 default labels
- **สรุป/นัย:** map 3 ประเภท → Bug=`bug`, Feature=`enhancement`, Improvement=`enhancement`(+prefix แยก). template body อยู่ในตัว command (ไม่มีของ repo ให้ยึด)

### RQ3: permission ของ non-collaborator
- **พบว่า:** GitHub — ใครก็เปิด issue ใน public repo ได้ แต่ **เฉพาะคนมี triage/write permission ถึงจะ assign label/assignee/milestone ได้**. non-collaborator ที่ใส่ `--label` ผ่าน `gh` → ได้ error; ผ่าน URL `?labels=` → GitHub ignore เงียบ
- **หลักฐาน:** GitHub issue permission model (prior art); สอดคล้องกับ scope ที่ repo เป็น product ของทีม warnyin ส่วนผู้ใช้ปลายทางเป็นบุคคลภายนอก
- **สรุป/นัย:** **ห้ามพึ่ง label เป็นตัวจัดหมวดหลัก** → ใช้ **title prefix** `[Bug]/[Feature]/[Improvement]` (ใช้ได้ทุกคน) + ใส่ label แบบ best-effort (สำเร็จก็ดี ไม่สำเร็จก็ปล่อย maintainer label ทีหลัง)

### RQ4: กลไกยิง + fallback
- **พบว่า:** `gh` v2.83.2 มีในเครื่อง dev นี้ → `gh issue create --repo warnyin/warnyin-agents --title ... --body ... [--label ...]` ใช้ได้. แต่ผู้ใช้ปลายทางไม่การันตีว่ามี gh/login. fallback = prefilled URL `https://github.com/warnyin/warnyin-agents/issues/new?title=<enc>&body=<enc>&labels=<enc>` เปิด browser แล้ว user กด submit เอง (ใช้ GitHub web auth — ไม่พึ่ง gh)
- **หลักฐาน:** `which gh` → `/opt/homebrew/bin/gh`; GitHub รองรับ query param `title`/`body`/`labels` บน `issues/new`
- **สรุป/นัย:** flow = detect `gh` + `gh auth status` → ถ้าพร้อม ยิงตรง; ไม่พร้อม → สร้าง URL (urlencode) ให้ user. ต้องเช็ค auth ไม่ใช่แค่ binary exist

## 4. Code inspection (สิ่งที่ตอบได้จากโค้ดเอง โดยไม่ต้องถาม user)
| ไฟล์ / ส่วนของโค้ด | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `.claude/commands/warnyin/explore.md` | frontmatter `description`+`argument-hint`, ชี้ playbook, `$ARGUMENTS` | template โครง command ใหม่ |
| `.claude/commands/warnyin/` (11 ไฟล์) | namespace ชั้นเดียว ยังไม่มี nested | `feedback/` เป็นโฟลเดอร์ย่อยใหม่ครั้งแรก |
| `src/.claude/commands/warnyin/` | mirror ของ root ครบ 11 ไฟล์ | ต้องเพิ่มคู่ source ด้วย (2-layer) |
| `.github/` | มีแค่ `ci.yml` ไม่มี ISSUE_TEMPLATE | template body อยู่ในตัว command |
| git remote `origin` | `https://github.com/warnyin/warnyin-agents.git` | ตรงกับ repo เป้าหมายที่ user ระบุ |
| `docs/stages/.../tasks/*/issue.md` (เดิม) | เป็น task spec ภายใน workflow | คนละความหมายกับ GitHub issue — ชื่อ `feedback:issue` ไม่ชนกัน |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก | ข้อดี | ข้อเสีย | เหมาะกับเคสนี้? |
|---|---|---|---|
| gh CLI เดียว | ยิงตรง ครบ field | พังถ้าไม่มี gh/ไม่ login (ผู้ใช้ปลายทางจำนวนมาก) | ✗ ไม่ robust |
| URL เดียว | ไม่พึ่ง gh เลย | ต้องสลับ browser ทุกครั้ง แม้คนมี gh | ✗ ฝืดเกิน |
| **gh + fallback URL** | ครอบคลุมทั้งสองกลุ่ม degrade นุ่ม | logic เยอะขึ้นนิด (detect+fallback) | ✓ **เลือก** |
| label เป็นตัวจัดหมวด | dashboard กรองง่าย | non-collaborator ใส่ไม่ได้ → fail | ✗ |
| **title prefix + best-effort label** | ทุกคนใช้ได้ + ได้ label เมื่อมีสิทธิ์ | prefix รก title นิดหน่อย | ✓ **เลือก** |

## 6. ความเสี่ยง / unknown ที่ยังเหลือ
- พฤติกรรม Claude Code กับ nested command namespace (`warnyin/feedback/issue.md` → `/warnyin:feedback:issue`) — ยึดตาม convention ของ Claude Code; DESIGN/VERIFY ควรทดสอบว่า command ติดจริง
- installer/packaging (`src/bin/cli.mjs`) copy โฟลเดอร์ย่อยใน `.claude/commands/` ครบไหม — verify-pack ต้องครอบคลุม (ความเสี่ยงระดับ BUILD/VERIFY)

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำจาก research:**
  - วาง command เป็น nested namespace `warnyin/feedback/issue.md` (root + `src/`)
  - repo hardcode `warnyin/warnyin-agents`; จัดหมวดด้วย title prefix + best-effort label
  - กลไก: detect `gh` + `gh auth status` → ยิงตรง / fallback prefilled URL (urlencode)
  - บังคับ preview + confirm ก่อนยิง; ไม่ดึง session context เองถ้า user ไม่สั่ง
- **การตัดสินใจที่ป้อนกลับเข้า `discovery.md`:** D1–D5 ใน Decision Log (ปิดครบ)
