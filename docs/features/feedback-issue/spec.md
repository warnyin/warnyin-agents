# Spec — Feedback issue

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior — feature ประเภท playbook (ไม่มี runtime) → THEN เป็น **observable artifact** (section/key string มีจริง, ลิงก์ resolve)
> **descriptive ไม่ใช่ imperative** — บันทึก "ระบบทำอะไร" ไม่ใช่คำสั่งให้ agent ทำตาม
> guidance: requirement ละ 1-3 scenario · scenario = GIVEN/WHEN/THEN ที่เทสตามได้จริง

## Requirement: เปิด GitHub issue ผ่าน command `/warnyin:feedback:issue`

ผู้ใช้รัน `/warnyin:feedback:issue` เพื่อเปิด issue ที่ `warnyin/warnyin-agents` ได้ 3 ประเภท (Bug/Feature/Improvement) — AI สัมภาษณ์สั้น เรียบเรียง title (มี prefix) + body ตาม template ของประเภท แล้วยิงด้วย gh หรือ fallback URL

### Scenario: command + playbook มีจริง (nested namespace)
- GIVEN ไฟล์ `src/.claude/commands/warnyin/feedback/issue.md` และ `src/.warnyin/workflow/feedback.md`
- WHEN อ่าน adapter
- THEN adapter มี frontmatter `description`+`argument-hint`, ใช้ `$ARGUMENTS`, ชี้ playbook `.warnyin/workflow/feedback.md` (adapter บางไม่ duplicate logic)

### Scenario: เลือกประเภทและจัดหมวดด้วย title prefix
- GIVEN user เรียก command (มี/ไม่มี seed argument)
- WHEN AI ถามประเภท (Bug/Feature/Improvement) และสัมภาษณ์สั้นตาม template ของประเภทนั้น
- THEN ได้ title ขึ้นต้นด้วย prefix `[Bug]`/`[Feature]`/`[Improvement]` + body markdown ตามโครงของประเภท; label `bug`/`enhancement` แบบ best-effort

## Requirement: Confirm gate บังคับก่อนยิง + privacy

playbook บังคับ preview + confirm ก่อนยิง issue เสมอ (outward-facing/public) และไม่ดึง session context อัตโนมัติ (กัน path/secret leak)

### Scenario: confirm ก่อนยิงเสมอ
- GIVEN AI เรียบเรียง title+body เสร็จ
- WHEN ก่อนยิง issue
- THEN `feedback.md §5` ระบุให้แสดง preview แล้วรอ user ยืนยันก่อน (ไม่ยิงอัตโนมัติ)

### Scenario: ไม่ดึง session context เอง
- GIVEN session มี error/โค้ด/path อยู่
- WHEN AI ประกอบ body
- THEN playbook ระบุใช้เฉพาะข้อมูลที่ user ให้ — ไม่แปะ context จาก session ลง issue เว้นแต่ user สั่งชัด

## Requirement: Detect ladder — gh ยิงตรง หรือ fallback URL

playbook กำหนดลำดับเลือก path ยิง issue: gh พร้อม → ยิงตรง; ไม่พร้อม → prefilled URL (urlencode)

### Scenario: gh พร้อม → ยิงตรง (best-effort label)
- GIVEN มี `gh` ใน PATH และ `gh auth status` ผ่าน
- WHEN user ยืนยัน preview
- THEN `feedback.md §4/§6` ระบุรัน `gh issue create --repo warnyin/warnyin-agents`; ใส่ `--label` best-effort — ถ้า label fail (permission) → retry ยิงใหม่โดยไม่มี `--label` แล้วแจ้ง maintainer จะ label ทีหลัง

### Scenario: ไม่มี gh / ไม่ได้ login → fallback URL
- GIVEN ไม่มี `gh` หรือ `gh auth status` ไม่ผ่าน
- WHEN user ยืนยัน preview
- THEN playbook ระบุสร้าง prefilled URL `https://github.com/warnyin/warnyin-agents/issues/new?title=&body=&labels=` (urlencode) ให้ user เปิด browser เอง พร้อมแจ้งเหตุผลที่ degrade
