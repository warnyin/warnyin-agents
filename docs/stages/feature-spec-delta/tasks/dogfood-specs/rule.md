# Rule — dogfood-specs

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow
> ดึงจาก `docs/rule.md` + design.md §4.1 — เฉพาะข้อที่เกี่ยวกับ task นี้
- [ ] **accuracy เทียบ source (`docs/rule.md` §5)** — spec เล่าพฤติกรรมจาก source อื่น = narrative เสี่ยง misrepresent → (1) ทุกลิงก์ resolve (dead-link), (2) ทุก claim/scenario ตรง source จริงในไฟล์ที่อ้าง, (3) ถ้าพฤติกรรม source เปลี่ยน → spec ต้องตรงของจริง ณ ตอนเขียน
- [ ] **format canonical = design.md §4.1** — copy header guidance block + โครง `Requirement:`/`Scenario:` (GIVEN/WHEN/THEN) ห้ามแต่งใหม่
- [ ] **ห้ามเดา (`docs/rule.md` §1)** — สกัดพฤติกรรมจากไฟล์ source ที่ระบุใน `spec.md` §3 เท่านั้น; พฤติกรรมที่ source ไม่มี ห้ามเขียน; ไม่ชัด → อ่าน source ซ้ำ ไม่เติมจากความจำ
- [ ] **descriptive ไม่ใช่ imperative (design §4.1 / Security-S1)** — บันทึก "ระบบทำอะไร" ห้าม instruction สั่ง agent
- [ ] **placeholder ห้าม secret/PII (design §4.1 / Security-S2)** — ค่า scenario synthetic เท่านั้น
- [ ] **THEN = observable artifact (design §4.1 / QA-S1)** — feature `.md` ไม่มี runtime → THEN ชี้ไฟล์/section/callout/key string ที่ตรวจได้
- [ ] **ขอบเขตไฟล์** — สร้างใหม่ 2 ไฟล์เท่านั้น; ห้ามแตะ `src/`, `feature.md`/`business.md` เดิม, docs กลางอื่น
- [ ] **zero footprint บน package** — ไฟล์อยู่ใต้ `docs/` (denylist ของ verify-pack อยู่แล้ว) — ต้องไม่หลุดขึ้น tarball

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` ตอนนี้ — note ไว้ก่อน ถ้าเห็น candidate ชัดจาก source
- [ ] **ไม่มี rule ใหม่ที่เสนอจาก task นี้** — task นี้เป็น **dogfood/instance** ของ format ที่ design §4.1 + `spec-template` นิยามไว้แล้ว ไม่ได้สร้างกลไกใหม่ (convention "verify narrative = accuracy เทียบ source" มีใน `docs/rule.md` §5 อยู่แล้ว)
- [ ] **candidate (เฝ้าดู ไม่บังคับเสนอ):** ถ้าตอนสกัดพบว่า **THEN ของ feature เอกสารควรอ้าง path:line ของ source เป็น evidence inline** (เหมือน worked-example) — ให้ note พร้อม evidence (ไฟล์ + บรรทัดที่เจอ) ส่งเข้า learned-rule ตอน SHIP; **ห้าม promote เองในรอบ build** (continuous-learning discipline — `docs/rule.md` §1: learned-rule ต้อง user ยืนยันก่อน)
