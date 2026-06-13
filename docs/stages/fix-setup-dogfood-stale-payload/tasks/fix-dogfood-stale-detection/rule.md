# Rule — fix-dogfood-stale-detection

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack + docs/rule.md)
- [ ] **verify side-effect ไม่เชื่อ exit 0 + ส่ง flag ตรงเจตนา** (`techstack/installer/rule.md` §dev tooling) — fix นี้ enforce: ดึง payload ใหม่จริง + verify version identity ไม่ false-success
- [ ] **LR1 — verify เทียบ "ค่า version" ไม่ใช่แค่ existence** — `checkTarballVersion` (source) + `verifyInstalled` stamp (install) เทียบค่า; pin-exact primary + prefer-online เสริม (ส่งทั้ง npx + pack path)
- [ ] **LR2 — transition-safe active ตั้งแต่ release ที่ 2** — stamp ขาด + expected≥0.17.0 → false (active); <0.17.0 → true (transition); fix นี้ **implement LR2** ที่เดิม note แต่ยังไม่ทำ
- [ ] **zero-dependency** — `devDependencies` ว่าง; `semverGte` เขียนเอง (ไม่เพิ่ม dep)
- [ ] **cross-platform** — `path.join`/`os.tmpdir`; spawn array args ห้าม `shell:true` ยกเว้น npx win32 (คงเดิม)
- [ ] **config-protection** — ห้ามแก้ test/config "เพื่อให้ผ่าน"; แก้ root cause (3 ชั้น) จริง
- [ ] **ภาษาไทย** comment/log

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] rule ที่เสนอ: **LR2 implemented — verifyInstalled active เริ่ม 0.17.0** — อัปเดต evidence ของ LR2 ใน `techstack/installer/rule.md` §dev tooling ว่า "active ตั้งแต่ release ที่ 2 = expected≥0.17.0 (implemented topic `fix-setup-dogfood-stale-payload`)"; + บทเรียน "**dev-tooling fallback path ต้อง symmetric กับ primary path**" (installViaPack ขาด prefer-online ที่ installViaNpx มี → stale; cache-bust/verify ต้องครบทุก path) — เหตุผล: false-success regression รอบ 3 มาจาก fallback path ที่ไม่ได้ guard เท่า primary
