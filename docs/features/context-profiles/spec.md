# Spec — Context profiles

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior (ทำอะไร เห็นอะไร error ยังไง) — ไม่เก็บ implementation (ชื่อ class/function/วิธีเขียน)
> **descriptive ไม่ใช่ imperative** — บันทึก "ระบบทำอะไร" เท่านั้น ห้ามเขียน instruction สั่ง agent (spec เป็น data ที่ VERIFY ใช้ derive test ไม่ใช่คำสั่งให้ทำตาม)
> ค่าใน scenario ใช้ **placeholder/ค่าสังเคราะห์เท่านั้น** (`<token>`, `user@example.com`) — ห้ามใส่ secret/credential/PII จริง
> guidance: ~≤100 บรรทัด/ไฟล์ · requirement ละ 1-3 scenario · scenario = GIVEN/WHEN/THEN ที่เทสตามได้จริง
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, ลิงก์ resolve) ไม่ใช่พฤติกรรม AI ที่วัดไม่ได้

## Requirement: มีสาม context card

มี context card 3 ใบในไดเรกทอรี `contexts/` ของ workflow — โหมด `research`, `build`, `review` (opinionated ไม่ไหลเป็น catalog)

### Scenario: ครบสามไฟล์
- GIVEN ไดเรกทอรี `src/.warnyin/workflow/contexts/`
- WHEN ดูรายชื่อไฟล์ `.md` ที่เป็น context card
- THEN มีไฟล์ `research.md`, `build.md`, `review.md` ครบทั้งสาม (นอกเหนือจาก `README.md`)

## Requirement: โครง card สี่ section คงที่

context card ทุกใบมี section หัวข้อคงที่ 4 อันตามลำดับ ทำให้โครง predictable

### Scenario: สี่ heading ในแต่ละ card
- GIVEN context card ใบใดใบหนึ่ง เช่น `src/.warnyin/workflow/contexts/build.md`
- WHEN อ่าน heading ระดับ `##` ในไฟล์
- THEN พบ `## Mindset`, `## Do / Don't`, `## Tool preference`, `## ใช้คู่ stage ไหน` ครบทั้งสี่

### Scenario: Model tier อยู่ใน Tool preference
- GIVEN section `## Tool preference` ของ context card
- WHEN อ่านเนื้อหา section นั้น
- THEN มีบรรทัดขึ้นต้นด้วย `**Model tier:**` ระบุ tier ของ context นั้น

## Requirement: README map context กับ stage

ไฟล์ `README.md` ของ `contexts/` มีตาราง mapping ระหว่าง context กับ stage และอธิบายว่า context เป็นคนละมิติกับ role

### Scenario: ตาราง context ↔ stage มีจริง
- GIVEN ไฟล์ `src/.warnyin/workflow/contexts/README.md`
- WHEN ค้นหาหัวข้อตาราง
- THEN พบหัวข้อ `## ตาราง context ↔ stage` และแถวที่ map `discovery` → `research`, `build` → `build`, `verify` → `review`

### Scenario: ระบุว่า context คนละมิติกับ role
- GIVEN ส่วน `## หลักการ` ใน `README.md`
- WHEN อ่านบรรทัดที่อธิบายความต่าง
- THEN มีข้อความระบุ `context = session-level posture` และ `role = task-level lens` แยกกัน

## Requirement: ทุก stage playbook มี callout ชี้ context

playbook ของแต่ละ stage มี callout `Context profile` ใต้ title ชี้กลับ context ที่เข้าคู่ (reference graph ไม่ duplicate)

### Scenario: ห้า callout ใน stages
- GIVEN ไดเรกทอรี `src/.warnyin/workflow/stages/`
- WHEN grep ข้อความ `Context profile` ในไฟล์ playbook stage
- THEN พบ callout 5 จุด ในไฟล์ `discovery.md`, `design.md`, `build.md`, `verify.md`, `ship.md`

### Scenario: callout ของ build ชี้ context build
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/build.md`
- WHEN อ่านบรรทัด callout `Context profile`
- THEN ระบุโหมด `build` และชี้ path `.warnyin/workflow/contexts/build.md`

## Requirement: Model tier เป็น vocab generic ไม่ผูกชื่อรุ่น

guidance ของ model tier ใช้คำ generic (`deepest reasoning`/`balanced`/`review`) ปล่อยให้ harness map เป็นรุ่นจริงเอง

### Scenario: tier ของ research เป็น generic
- GIVEN section `## Tool preference` ใน `src/.warnyin/workflow/contexts/research.md`
- WHEN อ่านบรรทัด `**Model tier:**`
- THEN ระบุคำ generic เช่น `deepest reasoning` โดยไม่ปรากฏชื่อผลิตภัณฑ์/รุ่นของ harness ใด
