# Design (How) — command `/warnyin:feedback:issue`

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture**

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` (techstack เดียวของ repo) — payload คือ `.md` playbook + command adapter (ไม่มีโค้ดรัน; AI agent อ่านแล้วทำตาม)
- **แนวทางหลัก:** ตาม pattern utility ของ repo (explore/triage/next) — **playbook กลาง 1 ไฟล์** (`.warnyin/workflow/feedback.md`) เป็น single source of truth ของ flow; **command adapter บาง** (`.claude/commands/warnyin/feedback/issue.md`) ชี้กลับ playbook + ส่ง `$ARGUMENTS`; ลงทะเบียนใน registry docs
- **canonical layer:** แก้ที่ `src/` เท่านั้น (root `.warnyin/`+`.claude/` เป็น dogfood gitignored — ได้ตอน release sync); `CLAUDE.md`/`CHANGELOG.md` ที่ root เป็นไฟล์ repo committed
- **ภาษา:** ข้อความ playbook/command เป็นภาษาไทยตามสไตล์ repo (`docs/rule.md` §2); title/body ของ issue ที่ยิงขึ้น GitHub = ตามภาษาที่ user สื่อสาร (default ตามที่ user พิมพ์)

### 1.1 Contract (★ ล็อกที่นี่ — task อ้างได้โดยไม่ต้องพึ่ง runtime ของอีก task → ขนานได้ §7)
| สิ่งที่ล็อก | ค่า canonical |
|---|---|
| command id | `/warnyin:feedback:issue` |
| ไฟล์ command adapter | `src/.claude/commands/warnyin/feedback/issue.md` |
| ไฟล์ playbook กลาง | `src/.warnyin/workflow/feedback.md` |
| frontmatter `description` | `เปิด GitHub issue ที่ warnyin/warnyin-agents — แจ้งปรับปรุง/ปัญหา/feature ใหม่ (gh + fallback URL)` |
| frontmatter `argument-hint` | `"[ประเภท หรือ ข้อความ feedback สั้นๆ]"` |
| repo เป้าหมาย (hardcode) | `warnyin/warnyin-agents` |
| title prefix ต่อประเภท | Bug→`[Bug]` · Feature→`[Feature]` · Improvement→`[Improvement]` |
| label best-effort ต่อประเภท | Bug→`bug` · Feature→`enhancement` · Improvement→`enhancement` |
| บรรทัด registry (CLAUDE.md) | `` - `/warnyin:feedback:issue` → เปิด GitHub issue แจ้ง feedback ที่ warnyin/warnyin-agents (`.warnyin/workflow/feedback.md`) `` |

## 2. Vertical slices
> หนึ่ง slice = หนึ่งหน่วยคุณค่า end-to-end

| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | → task |
|---|---|---|---|
| 1 | **capability ใช้งานได้จริง** — เรียก `/warnyin:feedback:issue` แล้วได้ flow เปิด issue ครบ (playbook logic + command entrypoint) | command adapter (entry) · playbook (flow/logic) · "test" = acceptance ใน task | `tasks/feedback-playbook-command/` |
| 2 | **ค้นพบได้ + สอดคล้อง** — command โผล่ใน registry ทุกจุด + CHANGELOG บอกผู้ใช้ npm | docs registry (README payload · CLAUDE.md dogfood · CHANGELOG) | `tasks/feedback-registration/` |

> slice 1 = หัวใจ (capability ทำงาน end-to-end ตั้งแต่ entrypoint → ยิง issue); slice 2 = discoverability/compliance ตัดผ่าน docs layer. ทั้งสอง decouple ผ่าน **Contract §1.1** (slice 2 อ้างชื่อ/path/description จาก contract — ไม่ต้องรอ slice 1 เขียนเสร็จ)

## 3. Data model / schema
- ไม่มี DB/schema — payload เป็น `.md`. "data" คือโครง body ของ issue ต่อประเภท (กำหนดใน playbook):
  - **Bug:** สรุปปัญหา · ขั้นตอน reproduce · ผลที่คาด vs ที่เกิดจริง · เวอร์ชัน/สภาพแวดล้อม (workflow version, OS, node) · หมายเหตุเพิ่มเติม
  - **Feature:** ปัญหา/ความต้องการ · ข้อเสนอ (อยากได้อะไร) · คุณค่า/ใครได้ประโยชน์ · ทางเลือกที่เคยลอง
  - **Improvement:** จุดที่อยากปรับ · เหตุผล/ปัญหาปัจจุบัน · ผลที่คาดหลังปรับ
- footer อัตโนมัติ (โปร่งใส + ช่วย maintainer trace): บรรทัดท้าย body ระบุว่าสร้างผ่าน `/warnyin:feedback:issue` — **ไม่ใส่ path/secret/ข้อมูลเครื่อง user**

## 4. Interface / contract
- ดู **§1.1 Contract** (single source). ไม่มี REST API → ไม่ผลิต `openapi.yaml` (api-doc detect = N/A)
- **คำสั่ง gh ที่ใช้ (path สำเร็จ):**
  `gh issue create --repo warnyin/warnyin-agents --title "<prefix> <สรุป>" --body "<body>" [--label <label>]`
- **fallback URL (path degrade):**
  `https://github.com/warnyin/warnyin-agents/issues/new?title=<urlenc>&body=<urlenc>&labels=<urlenc>`
- **detect ladder (playbook กำหนดให้ AI เดินตามลำดับ):**
  1. `gh` ใน PATH ไหม → ไม่มี → fallback URL (+ แจ้งเหตุผล)
  2. `gh auth status` ผ่านไหม → ไม่ผ่าน → fallback URL (+ แจ้งเหตุผล)
  3. พร้อม → `gh issue create` (best-effort `--label`; ถ้า label fail เพราะ permission → retry ยิงใหม่โดยไม่มี `--label` แล้วแจ้งว่า maintainer จะ label ทีหลัง)

## 5. Flow
- **user-flow:** user รัน `/warnyin:feedback:issue [seed]` → (ถ้ายังไม่ชัด) AI ถามประเภท (Bug/Feature/Improvement) → สัมภาษณ์สั้นเก็บ field ตามประเภท (§3) → AI เรียบเรียง title (มี prefix) + body markdown → **แสดง preview + ขอ confirm** → ยิง (gh) หรือ degrade (URL) → คืน link issue / URL ให้ user
- **data-flow:** อินพุตจาก user (+ seed arg) เท่านั้น → ไม่ดึง session context อัตโนมัติ (กัน leak) → body → gh/URL → GitHub
- **confirm gate (บังคับ — D5):** ห้ามยิงก่อน user ยืนยัน preview; user แก้ได้ก่อน confirm

## 6. ผลกระทบต่อระบบเดิม
- **nested namespace แรก** ใน `.claude/commands/warnyin/` (เดิม flat) — `cli.mjs copyTree` recursive (บรรทัด 107-113) + `mkdirSync recursive` รองรับอยู่แล้ว → packaging ไม่ต้องแก้
- `verify-pack.mjs` เช็คแค่ prefix `src/.claude/commands/warnyin/` มีไฟล์ → ผ่านอยู่แล้ว (ไม่ regress)
- namespace `/warnyin:*` ไม่เปลี่ยน (เพิ่มเฉย ๆ) → non-breaking
- `AGENTS.md` ไม่ enumerate command (ชี้ playbook กลาง) → ไม่ต้องแก้ (verify เช็คยืนยัน)

## 7. Dependency ระหว่าง slice/task
```
(design §1.1 Contract ── ล็อก ──> ทั้งสอง task อ้าง contract)
task: feedback-playbook-command   (wave 1)
task: feedback-registration       (wave 1)   ‖ ขนาน
```
- **critical-path depth (longest chain):** 1 (ทั้งสอง task อยู่ wave เดียว)
- **max wave width:** 2 (ขนานได้)
- **เหตุผล decouple:** ใช้ **contract-first** (§3 ข้อ 2 ของ playbook) — `feedback-registration` ต้องการแค่ **ชื่อ command + path playbook + description** ซึ่งล็อกใน §1.1 แล้ว ไม่ต้องรอ runtime/เนื้อหาจริงของ playbook → 2 task เขียนไฟล์คนละชุด (task1: สร้างไฟล์ใหม่ใน `src/.warnyin/` + `src/.claude/`; task2: modify `README.md`+`CLAUDE.md`+`CHANGELOG.md`) ไม่ชนไฟล์กัน; integration (command ติดจริง + ชื่อตรง registry) พิสูจน์ที่ VERIFY full-gate

## 8. Test strategy ระดับ design
- **task 1 acceptance:** ไฟล์ playbook + adapter มีจริง; adapter มี frontmatter ตรง §1.1 + ชี้ `.warnyin/workflow/feedback.md`; playbook ครอบ flow ครบ (3 ประเภท + prefix + detect ladder gh→auth→URL + confirm gate + ไม่ดึง session context); ไม่มี path/secret hardcode เกิน repo เป้าหมาย
- **task 2 acceptance:** 3 registry ตรง contract §1.1 (README payload, CLAUDE.md, CHANGELOG entry รูปแบบ Keep a Changelog)
- **integration (VERIFY):** เปิด Claude Code แล้ว `/warnyin:feedback:issue` โหลดได้ (frontmatter ถูก) + dry-run flow ในหัว/หรือทดสอบ fallback URL ประกอบถูก (urlencode); ไม่ยิง issue จริงตอน verify (เลี่ยง side-effect public) — ยืนยัน gh command/URL string ประกอบถูกพอ
- เครื่องมือ test: ไม่มี unit code ใหม่ (payload เป็น `.md`); `verify-pack` + `validate-topic` เป็น structural gate

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
> feature `feedback-issue` **ยังไม่มี** folder/spec เดิม (`docs/features/` ไม่มี `feedback-issue/`) → ไม่มี baseline → delta = ADDED ทั้งหมด (SHIP จะสร้าง `docs/features/feedback-issue/` ตอน promote)

### ADDED
#### Requirement: เปิด GitHub issue ผ่าน command (→ feature: feedback-issue)
ผู้ใช้รัน `/warnyin:feedback:issue` เพื่อเปิด issue ที่ `warnyin/warnyin-agents` ได้ 3 ประเภท

- **Scenario: เลือกประเภทและเรียบเรียง**
  - กำหนดว่า user เรียก command (มี/ไม่มี seed argument)
  - เมื่อ AI ถามประเภท (Bug/Feature/Improvement) และสัมภาษณ์สั้นตาม template ของประเภทนั้น
  - ดังนั้น ได้ title ที่ขึ้นต้นด้วย prefix `[Bug]/[Feature]/[Improvement]` + body markdown ตามโครงของประเภท

- **Scenario: confirm ก่อนยิงเสมอ**
  - กำหนดว่า AI เรียบเรียง title+body เสร็จ
  - เมื่อ แสดง preview ให้ user
  - ดังนั้น ต้องรอ user ยืนยันก่อน จึงยิง issue (ไม่ยิงอัตโนมัติ)

- **Scenario: gh พร้อม → ยิงตรง**
  - กำหนดว่า มี `gh` ใน PATH และ `gh auth status` ผ่าน
  - เมื่อ user ยืนยัน
  - ดังนั้น รัน `gh issue create --repo warnyin/warnyin-agents` แล้วคืน URL ของ issue; ใส่ `--label` แบบ best-effort (label fail → ยิงใหม่ไม่มี label)

- **Scenario: ไม่มี gh / ไม่ได้ login → fallback URL**
  - กำหนดว่า ไม่มี `gh` หรือ `gh auth status` ไม่ผ่าน
  - เมื่อ user ยืนยัน
  - ดังนั้น สร้าง prefilled URL `issues/new?title=&body=&labels=` (urlencode) ให้ user เปิด browser เอง พร้อมแจ้งเหตุผลที่ degrade

- **Scenario: ไม่ดึง session context เอง**
  - กำหนดว่า session มี error/โค้ด/path อยู่
  - เมื่อ AI เรียบเรียง body
  - ดังนั้น ใช้เฉพาะข้อมูลที่ user ให้ — ไม่แปะ context จาก session ลง issue เว้นแต่ user สั่งชัด

### MODIFIED
- ไม่มี

### REMOVED
- ไม่มี

## 10. Design review / dry-run
- **Review panel:** ข้าม (user decision 2026-06-12) — design standard scope ชัด ไม่แตะ hard-floor
- **Dry-run:** ข้าม (user decision 2026-06-12) — topic เล็ก (2 task), contract §1.1 ล็อกแล้ว, ไม่มี logic ซับซ้อน
- **Gate §8:** ผ่านครบ — validator structural เขียว, coherence ข้าม task ตรวจแล้ว (อ้าง Contract §1.1 ตรงกัน, file-ownership disjoint, DAG depth 1/width 2)
