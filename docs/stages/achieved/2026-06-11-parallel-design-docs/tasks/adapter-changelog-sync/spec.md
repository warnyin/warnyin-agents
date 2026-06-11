# Spec — adapter-changelog-sync

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้

## 1. ชนิดของ task
`docs` (adapter command + CHANGELOG — ไม่มี executable logic)

---

## 4. Data-flow
ผู้ใช้/AI เปิด `/warnyin:design` (adapter) หรืออ่าน `CHANGELOG.md` → เห็นพฤติกรรม task-fanout-default ตรงกับ playbook

## 6. Persona
ผู้ใช้ปลายทาง (อ่าน changelog ตอน `npx @warnyin/agents --update`) + AI ที่อ่าน adapter ก่อนรัน DESIGN

## 7. Test-flow
- [ ] **T-adapter:** `src/.claude/commands/warnyin/design.md` ระบุ task-file fan-out เป็น **default (standard/large)** หลังผ่าน Gate — ตรง behavior contract `design.md §3` C2; ยังเป็น adapter บาง (ชี้ playbook ไม่ duplicate)
- [ ] **T-changelog:** `CHANGELOG.md` มี entry ใหม่ตาม Keep a Changelog format (หมวด Changed/Added) อธิบาย DESIGN parallelization + ระบุ backward-compatible
- [ ] **T-link:** `node src/scripts/lint-md.mjs` ผ่าน — adapter ไม่มี dead-ref (ไม่อ้างเลข step ที่ไม่มีจริง)
- [ ] **T-agnostic:** ไม่มีชื่อรุ่น/ผลิตภัณฑ์ใน wording ใหม่
