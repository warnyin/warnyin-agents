# Standard — spec-template

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน template `.md` ใน payload — อิงสไตล์ `feature.md`/`business.md` เดิมในโฟลเดอร์เดียวกัน

## 1. Standard กลางที่ยึด
- **single source of truth** (CLAUDE.md) — โครง/wording ของ template = canonical ที่ design §4.1 เท่านั้น; copy ตรง ห้ามคิด format ใหม่ (กัน drift ข้าม task)
- **tool-agnostic** (`docs/rule.md` §1) — เป็น `.md` ล้วน ทุก harness อ่านได้; ไม่ผูก tool/runtime
- **กระทัดรัด opinionated** (`docs/rule.md` §1) — lean format, guidance ไม่ enforce (~≤100 บรรทัด เป็น guidance แบบ codemap)
- **mirror layout `src/` = target paths** (`docs/techstack/installer/rule.md`) — วางที่ `src/.warnyin/template/docs/features/[feature-name]/spec.md` เพื่อ install ไป `docs/features/<name>/spec.md` ตรง path (installer copy `src/<rel> → target/<rel>` ไม่มี mapping)

## 2. Pattern การเขียนของ task นี้
- **header blockquote สไตล์เดียวกับ `feature.md`/`business.md`** — H1 `# Spec — <ชื่อ feature>` ตามด้วย blockquote note (ภาษาไทย) บอกว่าเป็น living doc + guidance; เลียนโทน "template — copy ทั้งโฟลเดอร์ ... · SHIP เป็นคนสร้าง/อัปเดต" ที่มีอยู่
- **placeholder ใช้ `<...>`** ตามสไตล์ template เดิม (`<ชื่อ feature>`, `<token>`, `user@example.com`) — ค่าสังเคราะห์เท่านั้น
- **โครง section ตรง §4.1 เป๊ะ** — `## Requirement:` / `### Scenario:` / bullet `GIVEN`/`WHEN`/`THEN`; ไม่เพิ่ม/ตัด heading
- **ภาษาไทย** ตามสไตล์ repo; โทนสั้น actionable

## 3. Shared component / utility (อย่าเขียนซ้ำ)
- wording มาจาก `design.md` §4.1 canonical — ห้ามแต่งใหม่
- สไตล์ header/comment reuse จาก `feature.md`/`business.md` ในโฟลเดอร์ `[feature-name]/` เดิม (อ่านก่อนเขียน ให้โทนตรงกัน)
- ไม่สร้างปลายทาง/โฟลเดอร์ใหม่ — เพิ่มไฟล์ใน `[feature-name]/` ที่มีอยู่แล้ว

## 4. เพิ่มเติมเฉพาะ task
- header ต้องอธิบาย invariant ของ format (descriptive ไม่ใช่ imperative · placeholder ห้าม secret) **ในตัว template เอง** — เพราะ template เป็นสิ่งที่ผู้ใช้เห็นตอนเขียน spec จริง (guidance ติดไปกับไฟล์ ไม่ใช่อยู่แค่ playbook)
- ไม่ใส่ตัวอย่าง requirement จริง — เป็น skeleton placeholder (`<...>`) ให้ผู้ใช้เติม (dogfood spec จริงอยู่ที่ task `dogfood-specs`)
