# Standard — dogfood-specs

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน spec ที่ task นี้ต้องยึด — **format canonical = design.md §4.1 (copy ห้ามแต่งใหม่)**

## 1. Standard กลางที่ยึด
- **format canonical: `docs/stages/feature-spec-delta/design.md` §4.1** — header guidance block 5 บรรทัด + `## Requirement:` + `### Scenario:` (GIVEN/WHEN/THEN) — task นี้ผลิตไฟล์ **ตามรูปแบบเดียวกับ template** ที่ `spec-template` สร้าง (`src/.warnyin/template/docs/features/[feature-name]/spec.md`)
- `docs/rule.md` §5 — **verify เอกสาร narrative = accuracy เทียบ source** (spec เล่าพฤติกรรมจาก source อื่น → เสี่ยง misrepresent → ทุก claim ต้องตรง source)

## 2. Pattern การเขียน spec ของ task นี้
- **โครง/naming:** หัวข้อ requirement = ชื่อพฤติกรรมสั้น (เป็น key ของ delta merge — design §4.1); ใช้ภาษาไทย/อังกฤษผสมได้ ไม่บังคับ RFC 2119
- **descriptive ไม่ใช่ imperative** — เขียน "ระบบมี X / ไฟล์ Y มี section Z" ไม่ใช่ "ให้ทำ X / agent ต้อง..." (spec เป็น data ที่ VERIFY ใช้ derive test ไม่ใช่คำสั่ง)
- **THEN = observable artifact** — feature ทั้งสองเป็น `.md` ไม่มี runtime → THEN ต้องชี้สิ่งที่ตรวจได้: ไฟล์มีจริง / section/heading มีจริง / callout มีจริง / key string (เช่น `Context profile`, `allowed-tools`) มีจริง / ลิงก์ resolve — **ห้าม** "AI เข้าใจ posture" / "model ตัดสินใจถูก" (วัดไม่ได้)
- **placeholder เท่านั้น** — ค่าใน scenario ใช้ `<token>`, `user@example.com`, ชื่อ synthetic; ห้าม secret/credential/PII จริง
- **สกัดจาก source จริงเท่านั้น** — อ่านไฟล์ source (spec.md §3) แล้วยกพฤติกรรมที่ "มีอยู่จริง" มาเขียน ไม่เติมพฤติกรรมที่ source ไม่มี (ห้ามเดา — `docs/rule.md` §1)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- header guidance block + structure: copy จาก template `spec-template` (`src/.warnyin/template/docs/features/[feature-name]/spec.md`) — task นี้เป็น **instance จริง** ของ template เดียวกัน ไม่นิยาม format ใหม่
- ตัวอย่างไฟล์ spec ในโครง warnyin อื่น (เช่น task `spec.md` นี้เอง) ใช้เทียบสไตล์ blockquote/heading ได้

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- ขนาด: 3-5 requirement/ไฟล์ · requirement ละ 1-3 scenario · ~≤100 บรรทัด — **กระทัดรัด: ไม่ไล่เก็บทุกรายละเอียดของ feature** เลือกเฉพาะพฤติกรรมแกนที่ตรวจได้ชัด
- ถ้าเจอ pattern การเขียน spec ที่ควรเป็นมาตรฐานกลาง → note ใน `rule.md` §2 (รอ SHIP) ไม่แก้ standard กลางตอนนี้
