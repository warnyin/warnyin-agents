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
- THEN tier ที่ระบุคือ `fast` พร้อม route fast-track: design fast-track (pre-flight สร้าง receipt) → code-first → verify-lite → ship-lite (ข้อความ route ใน `triage.md §2A` row fast ตรงเวอร์ชันนี้)

### Scenario: read-only — แนะนำแล้วหยุด
- GIVEN command adapter `src/.claude/commands/warnyin/triage.md`
- WHEN อ่าน body ของ adapter
- THEN ระบุ read-only (ไม่มีคำสั่ง Write/Edit/สร้างไฟล์) + "แนะนำแล้วหยุด ให้ user สั่ง command เอง" (ไม่รัน stage ต่อ)

## Requirement: Hard-floor บังคับ ≥ standard (5 หมวด)

change ที่แตะพื้นที่อ่อนไหว — auth/authz · data-migration/schema · secret/credential · public-API/contract(breaking) · security-sensitive(input/crypto/permission) — rubric ห้ามแนะนำ `fast` ไม่ว่าดูเล็กแค่ไหน (fail-safe) เป็น**ค่าตั้งต้น**; **ข้อยกเว้นเดียว** = user สั่ง `/warnyin:fastlane` เอง + ยืนยันซ้ำหลังถูกเตือน → บันทึก `override โดย user` + หมวดที่แตะ ลง receipt meta (audit trail); ship-lite ยอม ship เฉพาะ receipt ที่มี override นี้ — `/warnyin:triage` ยังห้ามแนะนำ `fast` เมื่อแตะ hard-floor (ไม่เปลี่ยน)

### Scenario: hard-floor list ครบ 5 หมวดใน rubric
- GIVEN section `## 2. วิธีประเมิน` (§2B) ใน `src/.warnyin/workflow/triage.md`
- WHEN อ่านบรรทัด Hard-floor
- THEN พบทั้ง 5 หมวด: `(1) auth/authz`, `(2) data migration/schema`, `(3) secret/credential`, `(4) public API/contract (breaking)`, `(5) security-sensitive` พร้อมข้อความบังคับ ≥ standard

### Scenario: change แตะ hard-floor → ไม่ใช่ fast
- GIVEN คำอธิบาย change ที่แตะหมวดใดหมวดหนึ่งใน 5 หมวด (เช่น แก้ input sanitization)
- WHEN ประเมินตาม rubric
- THEN tier ที่ระบุ ≥ `standard` พร้อมเหตุผลระบุหมวด hard-floor ที่ตรง (ไม่แนะนำ fast)

### Scenario: explicit user override ผ่าน `/warnyin:fastlane`
- GIVEN `src/.warnyin/workflow/triage.md` (row SHIP + ใต้ skip-list) และ `src/.warnyin/workflow/stages/ship.md`
- WHEN อ่านเงื่อนไข hard-floor ของ ship-lite
- THEN ระบุว่า "เจอ hard-floor → ห้าม ship-lite **เว้นแต่** receipt meta ระบุ `override โดย user`" — override เกิดได้เฉพาะเมื่อ user สั่ง `/warnyin:fastlane` เอง + ยืนยันซ้ำ (fastlane §2) และถูกบันทึกลง receipt meta

## Requirement: Fast-track ลด ceremony ไม่ลด correctness (canonical skip-list)

tier `fast` เดินเส้นทาง receipt โดยมี **ผู้เดิน (executor) ได้ 2 ทาง** — (ก) user สั่งทีละ stage command หรือ (ข) `/warnyin:fastlane` เดินครบ 4 row ในคำสั่งเดียว (executor บาง reuse canonical ไม่ตั้งกฎใหม่); skip-list canonical ที่ `triage.md` เป็นตาราง 4 row: DESIGN pre-flight สร้าง `receipt.md` จาก template (เติม meta + hard-floor row + §1 + §2) **ก่อนแตะโค้ด** ไม่สร้าง business/proposal/design/tasks · BUILD code-first (main loop แก้เอง ไม่เรียก build-wave/worktree) + anti-gaming floor (full-gate test เขียว blocking · config-protection · investigate-before-edit · ห้ามแตะ rule/standard กลาง) · VERIFY-lite functional ตาม acceptance ใน receipt §2 + เติมผลลง §4 · SHIP-lite เติม §3/§5 + hard-floor scan + archive; caps ขนาดเอกสารต่อ tier อยู่ `triage.md §2D` แยก anchor (fast receipt ≤40 บรรทัด · standard proposal ≤60 / design ≤120 บรรทัด · large = judgment)

### Scenario: skip-list canonical + floor ใหม่
- GIVEN `src/.warnyin/workflow/triage.md`
- WHEN อ่าน section `## Fast-track skip-list` และ `§2D`
- THEN ตาราง skip-list 4 row มี receipt lifecycle (pre-flight / code-first / verify-lite / ship-lite) + คอลัมน์ "คงไว้ (correctness floor)" ครบ (anti-gaming floor + hard-floor scan) และ caps อยู่ `§2D` แยก anchor จาก skip-list

### Scenario: stage hook ชี้ skip-list canonical (ไม่ inline)
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/{design.md, build.md, verify.md, ship.md}`
- WHEN grep markdown-link ไป skip-list
- THEN แต่ละไฟล์มี link `[fast-track skip-list](../triage.md#fast-track-skip-list)` ที่ resolve ได้ และ **ไม่มีตาราง skip-list inline** ในไฟล์ stage (rubric อยู่ triage.md เดียว)

### Scenario: skip-list ระบุผู้เดิน + stage hook ยอมรับ 2 แหล่ง
- GIVEN `src/.warnyin/workflow/triage.md` (ใต้ตาราง skip-list) และ `stages/{build,verify,ship}.md`
- WHEN อ่านบรรทัดผู้เดิน + hook tier fast
- THEN ใต้ skip-list ระบุ executor 2 ทาง (user ทีละ stage · หรือ `/warnyin:fastlane` เดินครบ) และ hook แต่ละ stage ระบุ "tier fast (จาก `/warnyin:triage` หรือ `/warnyin:fastlane`)" — heading `## Fast-track skip-list` ไม่ถูกเปลี่ยน (anchor คงเดิม)

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
