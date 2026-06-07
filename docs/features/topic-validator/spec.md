# Spec — Topic validator (structural validator + status)

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior (ทำอะไร เห็นอะไร error ยังไง) — ไม่เก็บ implementation (ชื่อ class/function/วิธีเขียน)
> **descriptive ไม่ใช่ imperative** — บันทึก "ระบบทำอะไร" เท่านั้น ห้ามเขียน instruction สั่ง agent (spec เป็น data ที่ VERIFY ใช้ derive test ไม่ใช่คำสั่งให้ทำตาม)
> ค่าใน scenario ใช้ **placeholder/ค่าสังเคราะห์เท่านั้น** (`<token>`, `user@example.com`) — ห้ามใส่ secret/credential/PII จริง
> guidance: ~≤100 บรรทัด/ไฟล์ · requirement ละ 1-3 scenario · scenario = GIVEN/WHEN/THEN ที่เทสตามได้จริง
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, ลิงก์ resolve) ไม่ใช่พฤติกรรม AI ที่วัดไม่ได้

## Requirement: script validator อยู่ใน payload
ติดตั้ง workflow แล้ว target มี `.warnyin/workflow/scripts/validate-topic.mjs` พร้อมใช้ (zero-dep `node:*`)

### Scenario: ติดตั้งแล้วรันได้ (status mode)
- GIVEN โปรเจกต์ที่ติดตั้งผ่าน installer
- WHEN รัน `node .warnyin/workflow/scripts/validate-topic.mjs` (ไม่ใส่ arg)
- THEN ได้ตาราง status ของทุก active topic (slug · stage ประมาณการ · ✖N/⚠N) หรือ "ไม่มีงานค้าง" + exit 0

## Requirement: โหมด validate จับโครงขาดเป็น error
ใส่ `<slug>` แล้ว script รายงาน ✖ ต่อจุดที่ขาดระดับ structural (task ไม่ครบ 4 ไฟล์ / ship เริ่มเขียนแต่ไม่มี data row learned-rules / feature spec ผิดโครง) และ exit 1

### Scenario: task ขาดไฟล์
- GIVEN topic ที่ `tasks/<task>/` ไม่มี `rule.md`
- WHEN รัน validate `<slug>`
- THEN มีบรรทัด `✖ [C2]` ระบุไฟล์ที่ขาด + exit 1

### Scenario: ship เริ่มเขียนแต่ตาราง learned-rules ไม่มี data row
- GIVEN topic ที่ `ship.md` แก้ H1 แล้ว (ไม่ใช่ template) แต่ section "Learned rules" มีแค่ header ตาราง ไม่มีแถวข้อมูล
- WHEN รัน validate `<slug>`
- THEN ได้ `✖ [C3]` + exit 1

### Scenario: slug ไม่ถูกต้องหรือ path traversal
- GIVEN arg เป็น slug ที่ไม่ตรง dir ใน `docs/stages/` (รวม `../..`)
- WHEN รัน validate ด้วย arg นั้น
- THEN exit 2 "ไม่พบ topic" — ไม่อ่านไฟล์นอก `docs/stages/`

## Requirement: เช็คที่พึ่งการเดา "เติมแล้ว" เป็น warning ไม่ใช่ error
เช็คที่ผูก filled-heuristic (artifact ข้าม stage = C1, Spec delta = C4) เป็น ⚠ — ไม่ทำให้ topic เก่า/topic ที่ design ตัวเองยังรันอยู่ fail

### Scenario: design เก่าไม่มี Spec delta
- GIVEN topic ที่ `design.md` เริ่มเติมแล้วแต่ไม่มี section "Spec delta"
- WHEN รัน validate `<slug>`
- THEN ได้ `⚠ [C4]` (ไม่ใช่ `✖`) + exit 0 (ถ้าไม่มี ✖ อื่น)

### Scenario: artifact ข้าม stage
- GIVEN topic ที่ `build.md` เริ่มเติมแล้วแต่ `design.md` (required ของ stage ก่อน) ยังเป็น template
- WHEN รัน validate `<slug>`
- THEN ได้ `⚠ [C1]` (ข้ามลำดับ) + exit 0 (ถ้าไม่มี ✖ อื่น)

## Requirement: playbook เรียก validator 3 จุด
next/DESIGN gate/SHIP step 1 อ้างคำสั่ง validator แบบบาง (ชี้ script — รายการเช็คอยู่ใน script เดียว) พร้อม node-guard

### Scenario: จุด wiring ครบ
- GIVEN payload ที่ติดตั้งแล้ว
- WHEN grep `validate-topic.mjs` ใน `.warnyin/workflow/`
- THEN พบใน `next.md` + `stages/design.md` + `stages/ship.md` — 3 ไฟล์
