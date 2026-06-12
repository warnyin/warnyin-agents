# Standard — feedback-registration

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` — เพิ่มเติมเฉพาะ task ได้

## 1. Standard กลางที่ยึด (จาก techstack)
> อ้างอิง `docs/techstack/installer/standard.md` — ข้อไหนเกี่ยวกับ task นี้
- ภาษา: ข้อความ user-facing/คอมเมนต์เป็น **ภาษาไทย** ตามสไตล์ repo (`docs/rule.md §2`)
- canonical layer: payload ที่ committed อยู่ `src/` เท่านั้น → `README.md` ของ payload ต้องแก้ที่ `src/.warnyin/workflow/README.md` (ไม่แก้ root dogfood ที่ gitignored)
- `CHANGELOG.md` ตาม Keep a Changelog ทุก user-facing change

## 2. Pattern การเขียนโค้ดของ task นี้ — แก้ registry แบบ minimal-diff
- **minimal-diff:** เติมบรรทัดใหม่เท่านั้น — **ห้ามจัดรูปใหม่/รื้อ format** บรรทัดที่มีอยู่ (ลด blast radius + ให้ review/diff อ่านง่าย)
- **รักษา alignment/รูปแบบเดิมของแต่ละไฟล์:**
  - `README.md` utility list block — บรรทัดใหม่ใช้ pattern เดียวกับเพื่อนร่วม block: `<file>.md` + ช่องว่าง + `#   capability/playbook: ...` โดยให้ **คอลัมน์คอมเมนต์ `#` ตรงแนวกับบรรทัด `api-doc.md`/บรรทัดอื่น** (เลียนแบบ spacing เดิมเป๊ะ ไม่เดาจำนวน space — นับจากบรรทัดข้างเคียง); วางบรรทัด FEEDBACK **ต่อจาก `api-doc.md`**
  - `CLAUDE.md` Slash commands — บรรทัดใหม่ใช้ pattern `` - `/warnyin:...` → <คำอธิบาย> (`.warnyin/workflow/<file>.md`) `` ตรงตามบรรทัดอื่นใน list; วางต่อท้าย list ตามเหมาะ (กลุ่ม stage/utility); **wording ดึงจาก Contract §1.1 ไม่แต่งใหม่**
  - `CHANGELOG.md` — entry ใหม่อยู่ใต้ `## [Unreleased]` › `### Added` (สร้างหมวด `### Added` ถ้ายังไม่มีใน Unreleased — ปัจจุบันมีแต่ `### Fixed`/`### Changed`), bullet `- **<หัวข้อสั้น>** — <รายละเอียด>` ตามสไตล์ entry เดิม
- **error handling:** ไม่มี runtime — แต่ถ้ารูปแบบไฟล์เดิมไม่ตรงที่คาด (เช่น utility block ย้ายตำแหน่ง) → **investigate ก่อนเติม** (ดู `rule.md §1`) ไม่เดาตำแหน่ง
- **การจัดการ state/data:** static text เท่านั้น — ไม่มี state; idempotent (รันซ้ำต้องไม่เพิ่มบรรทัดซ้ำ)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- **ไม่มีโค้ด** — เป็น doc edit ล้วน
- wording canonical อยู่ที่ `design.md §1.1 Contract` → copy ไม่แต่งใหม่ (canonical-copy convention, `docs/rule.md §1`)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
> pattern ใหม่ที่ task นี้แนะนำ — ถ้าควรเป็นมาตรฐานกลาง ให้ note ใน `rule.md`
- ไม่มี pattern ใหม่ — เป็น mechanical registration ตาม convention ที่มีอยู่แล้ว
