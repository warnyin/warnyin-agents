# Spec — feedback-playbook-command

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — ใส่เฉพาะหัวข้อที่เกี่ยวกับชนิดของ task

## 1. ชนิดของ task
`logic` / `docs-payload` (playbook + command adapter เป็น `.md` ที่ AI agent อ่านแล้วทำตาม — ไม่มีโค้ดรัน)
- ไม่ใช่ REST API → **ข้าม API SPEC** (`design.md §4`: ไม่ผลิต `openapi.yaml`)
- ไม่ใช่งาน UI → **ข้าม UX/UI SPEC**

## 4. Data-flow (`design.md §5`)
- ไม่มี DB/state persist — "data" คือโครง body ของ issue ต่อประเภท (กำหนดใน playbook)
- อินพุตจาก **user (+ seed arg `$ARGUMENTS`) เท่านั้น** → **ไม่ดึง session context อัตโนมัติ** (กัน path/secret leak ขึ้น public issue) → เรียบเรียง title+body markdown → ยิงผ่าน `gh` หรือ degrade เป็น prefilled URL → GitHub issue ที่ `warnyin/warnyin-agents`
- footer อัตโนมัติท้าย body ระบุว่าสร้างผ่าน `/warnyin:feedback:issue` — **ไม่ใส่ path/secret/ข้อมูลเครื่อง user** (`design.md §3`)

## 5. User-flow (`design.md §5`)
- user รัน `/warnyin:feedback:issue [seed]` → (ถ้ายังไม่ชัด) AI ถามประเภท (Bug/Feature/Improvement) → สัมภาษณ์สั้นเก็บ field ตามประเภท → AI เรียบเรียง title (มี prefix) + body markdown → **แสดง preview + ขอ confirm** → ยิง (gh) หรือ degrade (URL) → คืน link issue / URL ให้ user
- **confirm gate บังคับ (D5):** ห้ามยิงก่อน user ยืนยัน preview; user แก้ได้ก่อน confirm

## 6. Persona
- **ผู้ใช้ปลายทาง** ของ Warnyin Standard Workflow ที่อยากแจ้ง feedback (ปรับปรุง/ปัญหา/feature) กลับมาที่ทีมโดยไม่ต้องออกจาก flow
- **AI agent** ที่ทำตาม playbook (Claude/Codex/Antigravity — tool-agnostic) + maintainer ที่อ่าน issue/trace footer

## 7. Test-flow (acceptance `design.md §8` task 1 + scenario `design.md §9`)
> ไม่ยิง issue จริงตอน test (เลี่ยง side-effect public) — ยืนยัน gh command/URL string ประกอบถูก + โครง playbook ครบ

**โครงไฟล์ + adapter (structural):**
- [ ] ไฟล์ playbook + adapter มีจริงตาม path contract `§1.1`
- [ ] adapter frontmatter `description`/`argument-hint` ตรง `§1.1` เป๊ะ + ชี้ `.warnyin/workflow/feedback.md` + ใช้ `$ARGUMENTS`
- [ ] ไม่มี path/secret hardcode เกิน repo `warnyin/warnyin-agents`

**flow ครบใน playbook (scenario `design.md §9`):**
- [ ] **เลือกประเภท + เรียบเรียง** — 3 ประเภท + title prefix `[Bug]/[Feature]/[Improvement]` + body template ต่อประเภท (`§3`)
- [ ] **confirm ก่อนยิงเสมอ** — preview + รอ user ยืนยัน ไม่ยิงอัตโนมัติ (D5)
- [ ] **gh พร้อม → ยิงตรง** — `gh issue create --repo warnyin/warnyin-agents` + best-effort `--label` (label fail → retry ไม่มี label)
- [ ] **ไม่มี gh / ไม่ได้ login → fallback URL** — detect ladder gh→`gh auth status`→prefilled URL `issues/new?title=&body=&labels=` (urlencode) + แจ้งเหตุผลที่ degrade
- [ ] **ไม่ดึง session context เอง** — ใช้เฉพาะข้อมูลที่ user ให้ ไม่แปะ error/โค้ด/path จาก session เว้น user สั่งชัด

**tool-agnostic / no-duplicate:**
- [ ] playbook ภาษาไทย + callout "Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน" + ไม่ผูกชื่อรุ่น model
- [ ] adapter **ไม่ duplicate** flow/logic ของ playbook — มีแค่ frontmatter + ชี้กลับ playbook + ส่ง `$ARGUMENTS`
