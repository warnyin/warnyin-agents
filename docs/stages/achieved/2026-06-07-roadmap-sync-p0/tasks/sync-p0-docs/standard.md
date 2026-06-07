# Standard — sync-p0-docs

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนเอกสารที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` §CHANGELOG + `docs/rule.md` §2

## 1. Standard กลางที่ยึด (จาก techstack)
> `docs/techstack/installer/standard.md` (§CHANGELOG) + `docs/rule.md` §2
- **Keep a Changelog** — กลุ่ม Added/Changed/Removed/Fixed + version + วันที่ (รูปแบบเดิมใน `CHANGELOG.md`)
- **ภาษาไทย** — คอมเมนต์/ข้อความผู้ใช้เป็นไทย ตามสไตล์ repo
- **CHANGELOG ทุก user-facing change** ให้ผู้ใช้ npm migrate เองได้โดยไม่ต้องเดา (`docs/rule.md` §2)

## 2. Pattern การเขียนเอกสารของ task นี้
- **โครงสร้าง:** Migration guide เป็น `## Migration guide` (top-level section ใน CHANGELOG, ใต้ intro ก่อน/หลัง `[Unreleased]` — วางที่อ่านง่าย, ไม่แทรกกลาง version history)
- **ตาราง migration:** คอลัมน์ `จากรุ่น | สิ่งที่เปลี่ยน | สิ่งที่ต้องทำ (git mv)` — 1 แถวต่อ 1 ช่วง legacy
- **codepoint fidelity:** copy string จาก `src/bin/cli.mjs` ตรง — en-dash `–` (U+2013) ใน `0.3–0.5.x`, `≤` (U+2264) ใน `≤0.2.x`; คำสั่ง `git mv` ตรงกับที่ installer แนะนำ
- **anchor:** GitHub slugify `## Migration guide` → `#migration-guide` (lowercase, space→dash) — README link ต้องใช้ slug นี้เป๊ะ
- **roadmap checkbox:** `- [x]` เฉพาะที่เสร็จจริง; ส่วนที่ปิดบางส่วนให้เขียนหมายเหตุชัด (ไม่ติ๊กลวง)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- legacy warning content มีอยู่แล้วใน `src/bin/cli.mjs` — **อ้าง/คัดลอก ไม่เขียน migration logic ใหม่**
- รูปแบบ CHANGELOG เดิม (intro + Keep a Changelog links ท้ายไฟล์) — คงไว้ ไม่รื้อ

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- migration table mirror legacy warning = pattern ที่ดี (เอกสาร sync กับโค้ดเตือน) → ถ้าจะเป็นมาตรฐานกลาง note ใน `rule.md` §2 (รอ SHIP)
