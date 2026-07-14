# Spec — Fastlane

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> feature ประเภท playbook (ไม่มี runtime) → THEN เป็น observable artifact (ไฟล์/section/key string มีจริง, ลิงก์ resolve)

## Requirement: รันงาน fast จบในคำสั่งเดียวด้วย `/warnyin:fastlane`

executor ของ fast tier — บังคับ `tier=fast` โดยข้าม triage แล้วเดิน skip-list ครบ 4 row ในคำสั่งเดียว; กฎทั้งหมด reuse canonical ของ `triage.md` (executor ไม่ตั้งกฎใหม่ ไม่ว่าเป็นตารางหรือ prose)

### Scenario: surface มีจริง + adapter บาง
- GIVEN `src/.claude/commands/warnyin/fastlane.md` และ `src/.warnyin/workflow/fastlane.md`
- WHEN อ่าน adapter
- THEN มี frontmatter `description` + `argument-hint`, ใช้ `$ARGUMENTS`, ชี้ playbook ด้วย inline-code (ไม่ใช่ markdown-link — กัน dead link) และไม่ duplicate ตาราง rubric/skip-list

### Scenario: executor ไม่ตั้งกฎซ้ำ (canonical เดียว)
- GIVEN `src/.warnyin/workflow/`
- WHEN สแกนหาประโยค ``pre-flight: สร้าง `receipt.md` จาก template``
- THEN เจอใน `triage.md` ไฟล์เดียว — `fastlane.md` มีแต่ markdown-link ไป `[fast-track skip-list](triage.md#fast-track-skip-list)` ที่ resolve ได้ทั้ง path และ anchor

### Scenario: discoverable ใน 3 registry
- GIVEN โปรเจกต์ที่ติดตั้ง payload แล้ว
- WHEN อ่าน `CLAUDE.md` (slash-command list), `codebuddy-rules.md` และ `.warnyin/workflow/README.md` (capability tree)
- THEN command-list ทั้งสองมี description คำต่อคำ `รันงานขนาด fast จบในคำสั่งเดียว — บังคับ tier=fast: แก้โค้ดจน test เขียว + acceptance ผ่าน → receipt → ship-lite + archive` และ capability tree มี entry `fastlane.md # capability: FASTLANE`

## Requirement: Pre-flight บังคับก่อนแตะโค้ด — hard-floor gate + acceptance

ก่อนแก้โค้ดบรรทัดแรก fastlane ต้องสแกน hard-floor 5 หมวดและเขียน `receipt.md` (meta + §1 + §2) เสมอ — เจอ hard-floor → หยุดถาม user (upgrade / ยืนยันลุยต่อ); ยืนยัน → บันทึก `override โดย user` ใน meta แล้วไปต่อ (ship-lite ปลายทางยอมรับเฉพาะ receipt ที่มี override นี้)

### Scenario: acceptance ถูกประกาศก่อนแก้ (กัน goalpost moving)
- GIVEN `fastlane.md` §2 และ §3
- WHEN เทียบลำดับ step
- THEN step "เขียน receipt meta + §1 + §2" อยู่**ก่อน** step "แก้โค้ด" และ resume ระบุห้ามเขียนทับ §1/§2 เดิม

### Scenario: hard-floor → ถาม ไม่ผ่านเงียบ
- GIVEN `fastlane.md` §2
- WHEN อ่าน branch hard-floor
- THEN มีครบ 3 องค์ประกอบ: คำเตือนระบุหมวดที่แตะ · ตัวเลือก `upgrade` vs `ยืนยันลุยต่อ` (หยุดรอ user) · การบันทึก `override โดย user` ลง receipt meta — และไม่มีทางที่จะไปต่อโดยไม่ถาม

## Requirement: Gate ปิดงาน = test เขียว + acceptance ผ่าน + cap รอบแก้

วนแก้จน full test เขียว **และ** acceptance ทุกข้อใน receipt §2 ผ่าน จึง ship-lite ได้; แก้ได้สูงสุด 3 รอบ ครบแล้วยังแดง → หยุด รายงาน user (ไม่ ship); โปรเจกต์ที่ไม่มี test suite → ห้ามเคลม "เขียว" ต้องบันทึก `ไม่มี test suite` ใน §4 + เสนอเพิ่ม test; ห้ามลด bar ด้วยการแก้ config/disable test (config-protection ของ BUILD คงอยู่)

### Scenario: ยังไม่เขียว → ห้าม ship
- GIVEN `fastlane.md` §4
- WHEN อ่าน gate
- THEN มี "full test เขียว" + "acceptance §2 ผ่านครบ" + "receipt ครบ §1-§5 และ ≤40 บรรทัด" + เงื่อนไขหยุดที่นับได้ ("3 รอบ") + สาขา "ไม่มี test suite"
