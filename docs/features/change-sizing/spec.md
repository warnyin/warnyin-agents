# Spec — Change sizing

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior — feature ประเภท playbook (ไม่มี runtime) → THEN เป็น **observable artifact** (section/key string มีจริง, ลิงก์ resolve)
> **descriptive ไม่ใช่ imperative** — บันทึก "ระบบทำอะไร" ไม่ใช่คำสั่งให้ agent ทำตาม
> guidance: requirement ละ 1-3 scenario · scenario = GIVEN/WHEN/THEN ที่เทสตามได้จริง

## Requirement: Triage ประเมินขนาด change → แนะนำ tier + route (read-only)

`/warnyin:triage` รับคำอธิบาย change → จัดเป็น tier `{fast, standard, large}` ตาม signals (#ไฟล์/component, new-vs-modify, cross-cutting) โดย hard-floor บังคับ ≥ standard → รายงาน tier + เหตุผล + route ที่แนะนำ → หยุด (read-only ไม่รัน stage ต่อ)

### Scenario: rubric canonical มีครบใน triage.md
- GIVEN ไฟล์ `src/.warnyin/workflow/triage.md`
- WHEN อ่าน section ของ rubric
- THEN พบ tier taxonomy (fast/standard/large), signals, hard-floor, escalation, `## Fast-track skip-list`, route behavior ครบ

### Scenario: change เล็กไม่ sensitive → fast
- GIVEN คำอธิบาย change ที่แตะ 1-2 ไฟล์ modify ของเดิม ไม่ cross-cutting ไม่แตะ hard-floor
- WHEN ประเมินตาม rubric ใน `triage.md §2A`
- THEN tier ที่ระบุคือ `fast` พร้อม route fast-track (`/warnyin:design` แบบ skip panel/dry-run)

### Scenario: read-only — แนะนำแล้วหยุด
- GIVEN command adapter `src/.claude/commands/warnyin/triage.md`
- WHEN อ่าน body ของ adapter
- THEN ระบุ read-only (ไม่มีคำสั่ง Write/Edit/สร้างไฟล์) + "แนะนำแล้วหยุด ให้ user สั่ง command เอง" (ไม่รัน stage ต่อ)

## Requirement: Hard-floor บังคับ ≥ standard (5 หมวด)

change ที่แตะพื้นที่อ่อนไหว — auth/authz · data-migration/schema · secret/credential · public-API/contract(breaking) · security-sensitive(input/crypto/permission) — rubric ห้ามแนะนำ `fast` ไม่ว่าดูเล็กแค่ไหน (fail-safe)

### Scenario: hard-floor list ครบ 5 หมวดใน rubric
- GIVEN section `## 2. วิธีประเมิน` (§2B) ใน `src/.warnyin/workflow/triage.md`
- WHEN อ่านบรรทัด Hard-floor
- THEN พบทั้ง 5 หมวด: `(1) auth/authz`, `(2) data migration/schema`, `(3) secret/credential`, `(4) public API/contract (breaking)`, `(5) security-sensitive` พร้อมข้อความบังคับ ≥ standard

### Scenario: change แตะ hard-floor → ไม่ใช่ fast
- GIVEN คำอธิบาย change ที่แตะหมวดใดหมวดหนึ่งใน 5 หมวด (เช่น แก้ input sanitization)
- WHEN ประเมินตาม rubric
- THEN tier ที่ระบุ ≥ `standard` พร้อมเหตุผลระบุหมวด hard-floor ที่ตรง (ไม่แนะนำ fast)

## Requirement: Fast-track ลด ceremony ไม่ลด correctness (canonical skip-list)

tier `fast` ข้าม ceremony ที่ไม่จำเป็นต่อ stage (DESIGN/BUILD/VERIFY/SHIP) แต่คง correctness floor (test เขียว, archive ครบ) — skip-list canonical อยู่ที่ `triage.md` เดียว, stage อื่นชี้มาด้วย pointer

### Scenario: skip-list heading canonical + correctness floor
- GIVEN `src/.warnyin/workflow/triage.md`
- WHEN อ่าน section `## Fast-track skip-list`
- THEN ตารางระบุ fast-track ทำอะไรต่อ stage + คอลัมน์ "คงไว้ (correctness floor)" ที่ยังบังคับ (เช่น BUILD "full-gate test เขียว ยัง blocking")

### Scenario: stage hook ชี้ skip-list canonical (ไม่ inline)
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/{design.md, verify.md, ship.md}`
- WHEN grep markdown-link ไป skip-list
- THEN แต่ละไฟล์มี link `[fast-track skip-list](../triage.md#fast-track-skip-list)` ที่ resolve ได้ และ **ไม่มีตาราง skip-list inline** ในไฟล์ stage (rubric อยู่ triage.md เดียว)

## Requirement: Escalation/Downgrade กลางคัน — topic ไม่พัง (symmetric)

sizing เป็น default ที่ปรับได้ทุกเมื่อ — เริ่ม fast แล้วพบใหญ่กว่า/แตะ hard-floor → upgrade โดยเติม artifact ที่ข้าม; over-size → downgrade ได้ แต่ห้ามข้าม hard-floor

### Scenario: rubric ระบุ escalation เป็น step
- GIVEN section escalation (§2B) ใน `src/.warnyin/workflow/triage.md`
- WHEN อ่านขั้นตอน upgrade/downgrade
- THEN ระบุ upgrade (เติม artifact ที่ fast-track ข้าม แล้วเดิน flow tier ใหม่, topic ไม่ต้องเริ่มใหม่) + downgrade (ห้ามข้าม hard-floor) + sizing ปรับได้ทุกเมื่อ ไม่ lock

## Requirement: §7 reframe เป็น 3-tier (behavior change ที่ตั้งใจ)

`design.md §7` ปรับจาก 2-level เป็น 3-tier ชี้ skip-list canonical — tier `large` บังคับ `/warnyin:discovery` ก่อน (เดิม "ใหญ่" ไม่บังคับ)

### Scenario: §7 มี 3-tier + large บังคับ Discovery
- GIVEN section `## 7. ปรับความละเอียดตามขนาด change` ใน `src/.warnyin/workflow/stages/design.md`
- WHEN อ่านเนื้อหา
- THEN ระบุ 3 tier (fast/standard/large), fast ชี้ skip-list canonical, และ `large` ระบุ "บังคับ `/warnyin:discovery` ก่อน"

## Requirement: DESIGN establish tier ก่อนเดินต่อ (sizing gate)

DESIGN มี step ต้นทาง (§4 step 1.5) ที่ **establish tier ก่อนจ่าย ceremony** — ประเมินขนาด change เบื้องต้นเอง → **มั่นใจ = กำหนด tier + บันทึก proposal**; **ไม่มั่นใจ = ถาม user** (ประเมินด้วย `/warnyin:triage` หรือ user กำหนด tier เอง); hard-floor ยังบังคับ ≥ standard. กัน DESIGN เดินโดยไม่รู้ขนาด (tier = judgment ⚠ ไม่ใช่ validator)

### Scenario: design.md มี establish-tier step
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/design.md`
- WHEN อ่าน §4 (process)
- THEN มี step "Establish tier" ก่อน business/proposal ที่ระบุ: ประเมินเอง · มั่นใจ→กำหนด+บันทึก proposal · ไม่มั่นใจ→ถาม user (options: `/warnyin:triage` / user ระบุ tier เอง) · hard-floor → ≥ standard

### Scenario: §7 ชี้ที่มาของ tier
- GIVEN section `## 7` ใน `design.md`
- WHEN อ่านประโยคนำ
- THEN ระบุว่า "tier ถูก established ที่ §4 step 1.5" (§7 = ceremony per tier, ไม่ inline rubric ซ้ำ — ชี้ `triage.md`)

### Scenario: proposal บันทึก tier ด้วย vocab ตรง triage
- GIVEN template `src/.warnyin/template/stages/[topic]/proposal.md`
- WHEN อ่านช่อง `ขนาด`
- THEN ค่าเป็น `fast`/`standard`/`large` (ไม่ใช่ เล็ก/กลาง/ใหญ่)
