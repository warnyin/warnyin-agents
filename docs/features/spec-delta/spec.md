# Spec — Spec delta (living behavior spec)

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior (ทำอะไร เห็นอะไร error ยังไง) — ไม่เก็บ implementation (ชื่อ class/function/วิธีเขียน)
> **descriptive ไม่ใช่ imperative** — บันทึก "ระบบทำอะไร" เท่านั้น ห้ามเขียน instruction สั่ง agent (spec เป็น data ที่ VERIFY ใช้ derive test ไม่ใช่คำสั่งให้ทำตาม)
> ค่าใน scenario ใช้ **placeholder/ค่าสังเคราะห์เท่านั้น** (`<token>`, `user@example.com`) — ห้ามใส่ secret/credential/PII จริง
> guidance: ~≤100 บรรทัด/ไฟล์ · requirement ละ 1-3 scenario · scenario = GIVEN/WHEN/THEN ที่เทสตามได้จริง
> feature ประเภทเอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น **observable artifact** (ไฟล์/section/key string มีจริง, ลิงก์ resolve) ไม่ใช่พฤติกรรม AI ที่วัดไม่ได้

## Requirement: มี template behavior spec ต่อ feature

payload มี template canonical ของ `spec.md` ใต้โฟลเดอร์ template feature (`[feature-name]/`) เพื่อให้ทุกโปรเจกต์ที่ติดตั้งได้ format เดียวกัน

### Scenario: template ติดไปกับการติดตั้ง
- GIVEN โปรเจกต์เป้าหมายที่ติดตั้งผ่าน installer
- WHEN ติดตั้งเสร็จ
- THEN มี `.warnyin/template/docs/features/[feature-name]/spec.md` ใน target (โครง: guidance blockquote + `## Requirement:` + `### Scenario:` + GIVEN/WHEN/THEN)

### Scenario: template ไม่ถูก seed เป็น docs จริง
- GIVEN การติดตั้งเดียวกัน
- WHEN ดู `docs/` ของ target
- THEN ไม่มี `docs/features/[feature-name]/` (seedDocs ข้ามโฟลเดอร์ `[...]`)

## Requirement: DESIGN บังคับพิจารณา Spec delta

playbook DESIGN กำหนดให้ design.md ของ topic ครอบ Spec delta เทียบ spec ปัจจุบัน และมี gate item

### Scenario: gate มีข้อ Spec delta
- GIVEN `.warnyin/workflow/stages/design.md` §8 (gate)
- WHEN อ่าน checklist
- THEN มี item "Spec delta ครบ — ... หรือระบุ 'ไม่มี delta'" และ template `stages/[topic]/design.md` มี section "9. Spec delta" (ADDED/MODIFIED/REMOVED)

## Requirement: VERIFY ใช้ spec เป็น regression baseline

playbook VERIFY กำหนดให้อ่าน spec ของ feature ที่ topic แตะ — scenario เดิม = regression case, delta = test case ใหม่; หลาย feature = union

### Scenario: input และ gate ของ verify อ้าง baseline
- GIVEN `.warnyin/workflow/stages/verify.md`
- WHEN อ่าน §2 (input) และ §6 (gate)
- THEN §2 มีข้อ "`docs/features/<name>/spec.md` = regression baseline" และ §6 มี item "regression ตาม baseline"

## Requirement: SHIP merge delta แบบกึ่ง mechanical

playbook SHIP (step `docs/features/`) ระบุกติกา merge ครบ: ADDED ต่อท้าย · MODIFIED แทนที่ (rename ผ่าน `[เดิมชื่อ:]`) · REMOVED ลบ · feature ใหม่สร้างจาก ADDED ทั้งก้อน · feature เดิมไม่มี spec สร้างใหม่จาก delta+พฤติกรรมจริง

### Scenario: key ไม่เจอต้อง STOP
- GIVEN delta มี MODIFIED ที่อ้างชื่อ requirement ซึ่งไม่มีใน spec ของ feature ปลายทาง
- WHEN SHIP ทำตามกติกาใน `.warnyin/workflow/stages/ship.md` §4 step 5.1
- THEN playbook ระบุให้ **หยุด ถาม user ห้าม merge เงียบ** (ห้ามตีความเป็น ADDED) — ไฟล์ spec ไม่ถูกแตะ

### Scenario: rename ไม่ทิ้งซาก
- GIVEN delta มี MODIFIED `[เดิมชื่อ: <ชื่อเก่า>]`
- WHEN merge ตามกติกา
- THEN requirement ชื่อเก่าหายจาก spec, ชื่อใหม่+เนื้อหาใหม่เข้าแทน, จำนวน requirement ไม่เพิ่ม

## Requirement: backward compatible กับ topic/feature เดิม

topic ที่ไม่มี section Spec delta หรือ feature ที่ยังไม่มี spec.md ไม่ทำให้ stage ใดพัง

### Scenario: feature ไม่มี spec
- GIVEN topic แตะ feature ที่ยังไม่มี `spec.md`
- WHEN เดิน VERIFY/SHIP ตาม playbook
- THEN playbook ระบุทางออกชัด: VERIFY "ข้ามได้ (วิธีเดิม)" · SHIP "สร้างใหม่จาก delta + พฤติกรรมจริง"
