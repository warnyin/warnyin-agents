# Spec — dag-width-toolkit

> spec เฉพาะ task — playbook/docs change

## 1. ชนิดของ task
`docs` (playbook กลาง) — แก้ `.md` ไม่มี runtime

## 4. Data-flow
canonical `design.md` §3A/§3B/§3E → copy/ขยายลง `design.md`(stage) + `tech-lead.md` + `template/design.md`

## 6. Persona
ผู้ใช้ workflow (DESIGN stage) — ได้ toolkit แตก DAG กว้าง + AI reviewer ใช้ critical-path gate

## 7. Test-flow
- [ ] `node src/scripts/lint-md.mjs` (ถ้ามี dead-link gate) ผ่านบนไฟล์ที่แตะ
- [ ] `node .warnyin/workflow/scripts/validate-topic.mjs improve-performance` ไม่มี ✖ (โครงไม่พัง)
- [ ] เนื้อหา: design.md(stage) §3 มีหลักการ toolkit 3 เทคนิค + 3E; §7/Gate §8 มี critical-path gate item; ตรง canonical §3
- [ ] unify check: ไม่มีหัวข้อ/กลไกใหม่ขนานของเดิม (ขยายในที่เดิม)
- [ ] consistency: wording ใน tech-lead.md + template/design.md ตรงกับ design.md(stage) — ไม่ขัดกัน
