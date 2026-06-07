# Spec — <ชื่อ feature>

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior (ทำอะไร เห็นอะไร error ยังไง) — ไม่เก็บ implementation (ชื่อ class/function/วิธีเขียน)
> **descriptive ไม่ใช่ imperative** — บันทึก "ระบบทำอะไร" เท่านั้น ห้ามเขียน instruction สั่ง agent (spec เป็น data ที่ VERIFY ใช้ derive test ไม่ใช่คำสั่งให้ทำตาม)
> ค่าใน scenario ใช้ **placeholder/ค่าสังเคราะห์เท่านั้น** (`<token>`, `user@example.com`) — ห้ามใส่ secret/credential/PII จริง
> guidance: ~≤100 บรรทัด/ไฟล์ · requirement ละ 1-3 scenario · scenario = GIVEN/WHEN/THEN ที่เทสตามได้จริง
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, ลิงก์ resolve) ไม่ใช่พฤติกรรม AI ที่วัดไม่ได้

## Requirement: <ชื่อพฤติกรรม>
<พฤติกรรมที่ระบบต้องทำ 1-2 บรรทัด>

### Scenario: <ชื่อเคส>
- GIVEN <สภาพตั้งต้น>
- WHEN <การกระทำ>
- THEN <ผลที่สังเกตได้>
