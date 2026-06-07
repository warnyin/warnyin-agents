# Spec — Utility skills

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior (ทำอะไร เห็นอะไร error ยังไง) — ไม่เก็บ implementation (ชื่อ class/function/วิธีเขียน)
> **descriptive ไม่ใช่ imperative** — บันทึก "ระบบทำอะไร" เท่านั้น ห้ามเขียน instruction สั่ง agent (spec เป็น data ที่ VERIFY ใช้ derive test ไม่ใช่คำสั่งให้ทำตาม)
> ค่าใน scenario ใช้ **placeholder/ค่าสังเคราะห์เท่านั้น** (`<token>`, `user@example.com`) — ห้ามใส่ secret/credential/PII จริง
> guidance: ~≤100 บรรทัด/ไฟล์ · requirement ละ 1-3 scenario · scenario = GIVEN/WHEN/THEN ที่เทสตามได้จริง
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, ลิงก์ resolve) ไม่ใช่พฤติกรรม AI ที่วัดไม่ได้

## Requirement: มีสาม utility skill

มี skill 3 ตัวในไดเรกทอรี `skills/` ของ Claude adapter — `update-codemaps`, `explore`, `next` (เฉพาะ utility read-only ปลอดภัย opinionated)

### Scenario: ครบสาม SKILL.md
- GIVEN ไดเรกทอรี `src/.claude/skills/`
- WHEN ดูโฟลเดอร์ที่มีไฟล์ `SKILL.md`
- THEN มีโฟลเดอร์ `update-codemaps/`, `explore/`, `next/` แต่ละอันมีไฟล์ `SKILL.md`

## Requirement: frontmatter มีสี่ key หลัก

ทุก SKILL.md มี frontmatter YAML ที่ระบุ `name`, `description`, `when_to_use`, `allowed-tools`

### Scenario: สี่ key ครบในแต่ละ skill
- GIVEN frontmatter ของ `src/.claude/skills/explore/SKILL.md`
- WHEN อ่าน key ระดับบนใน YAML block
- THEN มี key `name`, `description`, `when_to_use`, `allowed-tools` ครบทั้งสี่

### Scenario: name ตรงชื่อโฟลเดอร์
- GIVEN frontmatter ของ `src/.claude/skills/next/SKILL.md`
- WHEN อ่านค่า key `name`
- THEN ค่าเป็น `next` ตรงกับชื่อโฟลเดอร์ที่บรรจุไฟล์ (kebab-case)

## Requirement: allowed-tools เป็นชุด read-only

`allowed-tools` ของทุก skill จำกัดเฉพาะเครื่องมืออ่าน/ค้นหา ไม่มี Edit/Write (คุม blast radius ของ auto-invocation)

### Scenario: ไม่มี Edit หรือ Write
- GIVEN ค่า `allowed-tools` ของ `src/.claude/skills/update-codemaps/SKILL.md`
- WHEN อ่านรายชื่อ tool ในบรรทัดนั้น
- THEN ปรากฏ `Read`, `Grep`, `Glob` และ `Bash` เฉพาะ subcommand อ่าน (`find`, `ls`, `grep`) โดยไม่มี `Edit` หรือ `Write`

## Requirement: body ชี้ playbook กลางไม่ duplicate

body ของแต่ละ skill เป็น adapter บาง ชี้ให้ไปอ่าน playbook กลางใน `.warnyin/workflow/` แทนการ copy ขั้นตอน

### Scenario: body ของ explore ชี้ playbook
- GIVEN body (ใต้ frontmatter) ของ `src/.claude/skills/explore/SKILL.md`
- WHEN อ่านข้อความที่อ้าง playbook
- THEN มีข้อความสั่งให้อ่าน `.warnyin/workflow/explore.md` และระบุว่า "ชี้ playbook ไม่ duplicate"

## Requirement: auto-invocable ไม่ปิด model invocation

skill ทั้งสามเป็น auto-invocable (description-driven) เพราะไม่ตั้ง key ปิดการเรียกจาก model

### Scenario: ไม่มี disable-model-invocation
- GIVEN frontmatter ของ skill ใดก็ได้ใน `src/.claude/skills/`
- WHEN ค้นหา key `disable-model-invocation`
- THEN ไม่พบ key นี้ในไฟล์ (default = model auto-invoke ได้ เพราะ read-only ปลอดภัย)
