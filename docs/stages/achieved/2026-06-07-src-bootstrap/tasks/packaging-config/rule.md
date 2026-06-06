# Rule — packaging-config

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง follow + ที่เสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack/project)
> ดึงจาก `docs/rule.md` §4 (packaging) + `docs/techstack/installer/rule.md` — เฉพาะที่เกี่ยวกับ task นี้
- [ ] **`package.json files` เป็น allowlist** — เพิ่ม path ต้องคิดว่า publish ไปด้วยไหม; **dotfolder ต้องระบุชัด** (npm ไม่รวม nested dotfolder อัตโนมัติ — บทเรียน 0.6.0 → `src/.warnyin`, `src/.claude/commands`, `src/.claude/agents`) (`docs/rule.md` §4, installer rule)
- [ ] **pack-verify เป็น gate ก่อน publish** — assert payload ติดครบ (`src/.warnyin/workflow/` **และ** `src/.claude/commands/warnyin/`) **และ** ไม่มีงานจริง/tooling รั่ว (`docs/`, `src/tests/`, `src/scripts/`, `.github/`) (`docs/rule.md` §4)
- [ ] **installer สร้าง scaffold เอง — ห้าม copy พื้นที่ทำงาน** → `docs/` ห้ามหลุด tarball (denylist ต้องครอบ)
- [ ] **zero-dependency + ESM** — verify-pack ใช้แค่ `node:*` built-in; spawn array args ห้าม `shell:true` (`docs/rule.md` §2/§5)
- [ ] **CI security baseline ยัง compliant** — แก้ ci.yml job pack-verify ห้ามแตะ `permissions: contents: read`, ห้ามเพิ่ม `secrets.*`/`pull_request_target`/`npm ci`, action ยัง SHA-pin (`docs/rule.md` §3)
- [ ] **CHANGELOG ทุก user-facing change** — เปลี่ยน `files`/`bin path` = user-facing → ต้องมี entry (note ไว้; bump จริง T1/SHIP) (`docs/rule.md` §2)
- [ ] **ขอบเขต `package.json`:** task นี้แตะเฉพาะ `files`, `bin` (คงค่าจาก T1), `scripts.verify:pack` — **ห้ามแตะ `scripts.setup:*`** (เป็นของ T4; shared file ห้าม parallel — design §7)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md`/`docs/techstack/.../rule.md` ตอนนี้ — note ไว้ก่อน
- [ ] rule ที่เสนอ: **pack-verify ต้อง testable** — แยก pure function `checkFiles(files)→errors[]` ออกจาก `npm pack` + มี unit ป้อน list ปลอมพิสูจน์ denylist จับได้ — เหตุผล: กัน "gate ลวง" (เขียวเพราะ allowlist ปิด ไม่ใช่ denylist ทำงาน) (BL-4)
- [ ] rule ที่เสนอ: **denylist ต้องครอบ dogfood ที่ root** (`^.warnyin/`, `^.claude/`, root `CLAUDE.md`/`AGENTS.md`) + tripwire (`settings.local.json`, `*.tgz`, `.env*`) — เหตุผล: topic src-bootstrap สร้างความเสี่ยง installed payload หลุดขึ้น package เอง (SA B1 / Security S4)
