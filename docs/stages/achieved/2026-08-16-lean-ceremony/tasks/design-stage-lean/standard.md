# Standard — design-stage-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน **playbook markdown** ที่ task นี้ต้องยึด (ไม่มีโค้ด)

## 1. Standard กลางที่ยึด

- **ภาษาไทย กระชับ opinionated** — สไตล์เดียวกับ `stages/*.md` เดิม; ประโยคสั้น ใช้ `→` แทนคำเชื่อมยาว
- **canonical-copy** (`docs/rule.md §1`) — กฎหนึ่งข้อ นิยามที่เดียว ที่เหลือเป็น **pointer + เลข section**; ในไฟล์เดียวกันก็ใช้หลักนี้ (C5 อยู่ §3 ข้อ 7 ที่เดียว)
- **pointer-per-row / executor-playbook** (`docs/rule.md §2`) — `design.md` **ไม่เล่าขั้นตอนของ fastlane/triage ซ้ำ** มีแค่ "เดินครบ 4 row ตาม `fastlane.md`"
- **adapter บาง** (`docs/rule.md §1 tool-agnostic`) — `.claude/commands/warnyin/design.md` ชี้ playbook + เลข step เท่านั้น ห้าม duplicate เนื้อกฎ
- **tool-agnostic** — ห้ามเติมชื่อรุ่น/ผลิตภัณฑ์ของ harness ลง payload `.warnyin/`
- **LF ล้วน** — ห้ามให้ไฟล์กลายเป็น CRLF (Workflow tool ปัดตกไฟล์ที่มี CR)

## 2. Pattern การเขียนของ task นี้

### 2.1 label ของ gate ที่เป็น trigger-by-signal

รูปแบบเดียวกันทั้ง §3 ข้อ 7 / ข้อ 8 / §4 step 6 / step 10:

```
**<ชื่อ gate> (optional — trigger by signal; เข้าเงื่อนไขแล้วยังถาม user ก่อนเสมอ)**
```

- **เจ้าของ needle** (§3 ข้อ 7) เขียนเงื่อนไขเต็มต่อท้าย label
- **ผู้ชี้** (§3 ข้อ 8 / step 6 / step 10) ต่อท้ายด้วย `— signal ตาม §3 ข้อ 7` เท่านั้น
- step 6 / step 10 ให้ **ขึ้นบรรทัดแรกของ step ด้วยการเช็ค signal** แล้วค่อยเป็น flow เดิม (ไม่รื้อ sub-step 1-6)

### 2.2 unify-in-place — ห้ามสร้างข้อใหม่ขนาน

- A2/A3 **ขยาย label ของข้อเดิม** ไม่เพิ่ม "ข้อ 9" ใหม่ใน §3
- A1 **เขียนทับ blockquote เดิม** ท้าย step 1.5 (`> งาน fast ทั้งเส้นรันจบได้ด้วย /warnyin:fastlane …`) ให้กลายเป็นข้อความ handoff — ไม่เพิ่ม blockquote ใบที่สอง
- A6 **ลบ bullet ที่ถาม** แล้วต่อ bullet เดิมให้ลื่น — ไม่แปะ note "เดิมเคยถาม" ทิ้งไว้

### 2.3 การลบ (A7)

- ลบ blockquote `> **★ อัปเดต project memory (conditional):** …` **ทั้งบรรทัด + บรรทัดว่างที่เกิน** — ไม่เหลือ pointer, ไม่เหลือ "ดู `memory.md`" ค้าง (C7: DESIGN ไม่มี write point แล้ว)
- ตรวจว่าเส้น `---` และโครง §4 → §5 ยังต่อกันถูกต้อง

### 2.4 style เดิมที่ต้องลอกตาม

- callout สำคัญขึ้นต้นด้วย `**★ ` (เช่น `★ approve gate`, `★ starting-artifact`)
- bullet ย่อยของ step ใช้ 3 space indent ตามของเดิมในไฟล์
- ลิงก์ playbook ใช้ relative จาก **ที่อยู่ของไฟล์ผู้ชี้** — จาก `stages/` ไป `fastlane.md` คือ `../fastlane.md` (ห้ามใช้ `./`)

### 2.5 error handling / edge case

- **หา anchor เดิมไม่เจอ** (ไฟล์ถูกแก้ไปแล้ว) → **หยุด รายงาน ห้ามเดาตำแหน่ง** (investigate-before-edit)
- **รันซ้ำ/resume** → idempotent: เช็คก่อนว่าแก้ไปแล้วหรือยัง ห้ามเติมซ้ำ
- **needle C5 ใน `../../design.md` §4 ต่างจากที่จำ** → ไฟล์ topic ชนะเสมอ อ่านซ้ำก่อน copy

## 3. Shared component / utility (อย่าเขียนซ้ำ)

- `../../design.md` §4 = แหล่ง string เดียวของ C5/C6 — "reuse" ที่นี่คือ **copy คำต่อคำ**
- `.warnyin/workflow/fastlane.md` = เจ้าของลำดับ 4 row → ชี้ ไม่ลอก
- `.warnyin/workflow/triage.md` = เจ้าของ rubric/hard-floor/skip-list → ชี้ ไม่ลอก (ลิงก์เดิม `../triage.md#fast-track-skip-list` คงไว้)
- callout pattern ที่ลอกโครงได้: `design.md §4 step 4.5` (`★ approve gate`) · `fastlane.md §2 ข้อ 3` (hard-floor gate 2 ชั้น)

## 4. เพิ่มเติมเฉพาะ task

- **แก้ทีละจุด แล้ว grep ทันที** ตาม `spec.md §7` (lean self-verify) — ไม่รอจบทั้งไฟล์
- **อ่านไฟล์เป้าหมายทั้งไฟล์ก่อนแก้** (2 ไฟล์ ~215 บรรทัดรวม) — เข้าใจลำดับ step ก่อนแทรก/ลบ
