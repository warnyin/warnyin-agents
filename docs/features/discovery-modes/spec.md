# Spec — Discovery modes

> พฤติกรรมปัจจุบันของ feature (living doc — SHIP merge delta จาก design.md ของ topic เข้าไฟล์นี้)
> เก็บเฉพาะ observable behavior — feature ประเภท playbook (ไม่มี runtime) → THEN เป็น **observable artifact** (section/key string มีจริง, ลิงก์ resolve)
> **descriptive ไม่ใช่ imperative** · requirement ละ 1-3 scenario · scenario = GIVEN/WHEN/THEN ที่เทสตามได้จริง

## Requirement: Discovery mode taxonomy (5 ค่า, canonical)

Discovery รองรับ mode 5 ค่า `{ไว, สมดุล, ละเอียด, โต้วาที, ไต่สวน}` คุมความเข้มของ stage โดยทั้งหมดยังสวม context-profile `research`; taxonomy + behavior อยู่ canonical ที่ `discovery.md §3.5` เดียว

### Scenario: taxonomy + behavior contract ครบใน playbook
- GIVEN ไฟล์ `src/.warnyin/workflow/stages/discovery.md`
- WHEN อ่าน section `## 3.5 Discovery modes (ความเข้มของ Discovery)`
- THEN พบ taxonomy 5 mode + behavior contract ต่อ mode (ground/การถาม/research/multi-agent) + observable proxy นับได้เทียบ baseline `สมดุล`

### Scenario: `สมดุล` = พฤติกรรม Discovery เดิม (baseline)
- GIVEN behavior contract `§3.5.3`
- WHEN อ่านคอลัมน์ `สมดุล`
- THEN ระบุ "= ปัจจุบัน/baseline" (สัมภาษณ์ทีละข้อ ครบกิ่งหลัก + research พอประมาณ)

## Requirement: 3 แกน orthogonal (mode ≠ tier ≠ context-profile)

mode (ความเข้ม Discovery, stage axis) เป็นแกนแยกจาก tier (`change-sizing`, ขนาด change) และ context-profile (session posture) — เลือก mode ใดไม่เปลี่ยน tier และไม่ข้าม hard-floor; เชื่อมกันแค่ผ่าน auto-suggest signal

### Scenario: 3-axis table อยู่ใน playbook
- GIVEN section `### 3.5.2` ใน `discovery.md`
- WHEN อ่านตารางเทียบแกน
- THEN พบ 3 แกน (mode/tier/context-profile) พร้อมระบุ "mode `ไว` ≠ tier `fast`" และ "เลือก mode ใดไม่เปลี่ยน tier/ไม่ข้าม hard-floor"

## Requirement: Auto-suggest mode (precedence deterministic)

เมื่อผู้ใช้ไม่ระบุ mode Discovery ประเมินบริบทแล้วแนะนำ mode + เหตุผล โดย user override ได้ (ไม่ auto-run); signal ขัดกันตัดด้วย precedence (hard-floor sensitivity → floor `สมดุล` ทับสุด)

### Scenario: precedence + fixture อยู่ใน playbook
- GIVEN section `### 3.5.4` ใน `discovery.md`
- WHEN อ่าน precedence + fixture table
- THEN พบลำดับ precedence (1=hard-floor floor `สมดุล` ทับสุด ... 5=ก้ำกึ่ง→`สมดุล`) + เคส fixture "เล็ก+ชัด แต่แตะ auth → `สมดุล`"

### Scenario: multi-match keyword → fall through auto-suggest
- GIVEN keyword/alias section `§3.5.4`
- WHEN อ่านกติกา multi-match
- THEN ระบุ keyword ขัดกัน/ไม่ match → fall through auto-suggest (ไม่ first-match เงียบ)

## Requirement: grill เป็น alias ของ ละเอียด (backward-compat)

คำสั่ง grill เดิมยังทำงาน โดย map เข้า mode `ละเอียด` — ไม่มี behavior grill เป็นแกนแยก

### Scenario: grill fold เข้า ละเอียด
- GIVEN `discovery.md`
- WHEN grep "ซักถามฉันหน่อย" / "grill"
- THEN ปรากฏเป็น keyword/alias ของ `ละเอียด` (§3.5.4) + note "ไม่มี behavior grill เป็นแกนแยก" — ไม่มี section grill mode แยกต่างหาก

## Requirement: โต้วาที — fan-out persona ครั้งเดียว ("Parallelize gathering, serialize judgment")

mode `โต้วาที` fan-out persona (read-only) มาเสนอ/แย้งแบบขนานครั้งเดียว แล้ว main loop สังเคราะห์เป็นข้อสรุป (judgment ไม่ delegate); มี cap + fallback

### Scenario: debate orchestration อยู่ใน playbook
- GIVEN section `### 3.5.5` ใน `discovery.md`
- WHEN อ่าน flow
- THEN ระบุ fan-out 3–4 persona (รวม skeptic ≥1, read-only artifact-level) → main loop สังเคราะห์ → cap ≤4 persona/≤2 รอบ → fallback degrade→`ละเอียด` + แจ้ง user

## Requirement: ไต่สวน — Blue/Red adversarial iterative (user-in-loop)

mode `ไต่สวน` เดิน Blue/Red 2 ทีมวนหลายรอบ: Blue ทำ discovery+research → Red fan-out role audit ครบ 5 มุม → grill user ทุก finding → Blue แก้ → วนจน converge; memory persist; explicit-only

### Scenario: ไต่สวน orchestration + memory artifact อยู่ใน playbook
- GIVEN section `### 3.5.7` ใน `discovery.md`
- WHEN อ่าน flow + memory table
- THEN ระบุ Blue (`blue-memory.md`) → Red fan-out role audit 5 มุม (จุดผิด/Must-Have/จุดเสี่ยง/ขัดแย้ง/Should-Have, เขียน `debate-round-NN.md`+`red-memory.md`) → grill user ทุก finding → Blue update → ถาม user ก่อนรอบใหม่ → converge เมื่อ 0 finding ใหม่/user หยุด; memory ที่ `docs/stages/<slug>/debate/`

### Scenario: ไต่สวน explicit-only
- GIVEN keyword section `§3.5.4`
- WHEN อ่านกติกา `ไต่สวน`
- THEN ระบุ explicit-only — auto-suggest ไม่แนะ `ไต่สวน` เอง (เข้าได้เมื่อ user พิมพ์ keyword ตรง)

### Scenario: fallback เมื่อ spawn ไม่ได้
- GIVEN fallback table `§3.5.7`
- WHEN อ่านเงื่อนไข trigger
- THEN spawn ไม่ได้/เครื่องไม่มี Agent tool → degrade เป็น `ละเอียด` + แจ้ง user (ไม่เงียบ)

## Requirement: command adapter map keyword → mode (ไม่ duplicate)

`/warnyin:discovery` map keyword (5 mode, ไทย/อังกฤษ) → mode แล้วชี้ playbook canonical สำหรับ behavior — ไม่ inline behavior/auto-suggest table

### Scenario: keyword map + ชี้ anchor, ไม่ duplicate
- GIVEN ไฟล์ `src/.claude/commands/warnyin/discovery.md`
- WHEN อ่าน body + grep behavior/auto-suggest table
- THEN พบ keyword map 5 mode + ชี้ section "Discovery modes (ความเข้มของ Discovery)" + multi-match/ไม่ระบุ→auto-suggest; **ไม่มี** behavior contract/auto-suggest table inline (อยู่ playbook เดียว)
