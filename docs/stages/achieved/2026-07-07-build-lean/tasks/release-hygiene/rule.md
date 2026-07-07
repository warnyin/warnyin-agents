# Rule — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)

- [ ] **release hygiene** — `CONTRIBUTING.md` (บรรทัด ~37) + `docs/rule.md` §"CHANGELOG ทุก user-facing change": ทุก user-facing change ต้องมี entry ใน `CHANGELOG.md` (Keep a Changelog) + bump version — ให้ผู้ใช้ npm migrate เองได้โดยไม่ต้องเดา
- [ ] **source/dogfood แยกชั้นเด็ดขาด** — `docs/rule.md` §6 (บรรทัด 79): canonical tracked = `src/**` + ไฟล์ root ที่ tracked (`CHANGELOG.md`, `package.json` — task นี้แตะได้); root dogfood (`.warnyin/`, `.claude/`, `CLAUDE.md`, `AGENTS.md`) gitignored **ห้ามแตะ/ห้าม commit** — sync src→root เกิดหลัง release ผ่าน `setup:dogfood` เท่านั้น
- [ ] **config-protection** — ห้ามแก้ config/test/threshold (เช่น MIN_PASS) เพื่อให้ gate ผ่าน; gate แดง = รายงาน slice ต้นเหตุตามจริง
- [ ] **acceptance = pass count** — `docs/rule.md` §5: gate test ต้อง assert pass count ผ่าน `check-test-count.mjs` (≥9, fail=0, pass=tests) ไม่เชื่อ exit 0 เปล่าๆ
- [ ] **investigate-before-edit** — อ่าน diff จริงของ slice 1-5 ก่อนเขียน entry; ห้ามเดา/ลอก design

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

> ห้ามแก้ `docs/techstack/.../rule.md` ตอนนี้ — แค่ note ไว้ก่อน ถึง SHIP ค่อยพิจารณาย้ายขึ้นไป

- [ ] rule ที่เสนอ: **release-hygiene task เป็น wave สุดท้ายเสมอของ topic multi-slice** (CHANGELOG สรุปจาก diff จริง + gate integration-level เช่น `lint:md` ต้องรันหลัง integrate ครบ) — เหตุผล: กัน false-negative จาก pointer ข้าม slice (evidence: design build-lean §6/§7 — dead-link gate ต้องเห็นไฟล์จริงบน build branch ก่อน) และกัน CHANGELOG เขียนก่อนรู้ผลจริง
