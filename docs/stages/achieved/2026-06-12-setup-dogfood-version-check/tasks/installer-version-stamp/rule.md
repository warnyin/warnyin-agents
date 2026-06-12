# Rule — installer-version-stamp

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack + docs/rule.md)
- [ ] **zero-dependency** (`docs/rule.md §2`) — ใช้เฉพาะ `node:*` (fs/path/url); ห้ามเพิ่ม devDeps
- [ ] **ESM** — `import`/`export`, `import.meta.url` ไม่ใช่ `__dirname`/`require`
- [ ] **ภาษาไทย** ในคอมเมนต์/ข้อความผู้ใช้ (ตามสไตล์ `cli.mjs`)
- [ ] **cross-platform** (`docs/rule.md §2`) — `path.join`, ห้าม hardcode `/`; ไม่มี shell oneliner
- [ ] **CHANGELOG ทุก user-facing change** (`docs/rule.md §2`) — version stamp = ไฟล์ใหม่ที่ผู้ใช้ install เห็น → ต้องมี entry Added ระบุ path
- [ ] **installer สร้าง scaffold เอง — ห้าม copy พื้นที่ทำงานจาก repo ต้นทาง** (`docs/rule.md §4`) — stamp generate จาก `package.json` version ไม่ copy ไฟล์จาก src tree
- [ ] **`package.json files` เป็น allowlist granular** (`docs/rule.md §4`) — stamp เป็น install-time artifact ที่ target ไม่อยู่ใน `src/` → ไม่ขึ้น tarball (ไม่ต้องเพิ่ม path ใน `files`)
- [ ] **pack-verify testable** (`docs/rule.md §4`) — เพิ่มเคส unit พิสูจน์ denylist จับ stamp ที่ root (กัน gate ลวง) ไม่ใช่แค่รัน verify:pack เห็นผ่าน
- [ ] **test installer = black-box spawn** (`docs/rule.md §5`) — ห้าม import logic จาก `cli.mjs`; assert side-effect จริง; assert pass count ไม่ใช่แค่ exit 0
- [ ] **investigate-before-edit** (`docs/rule.md §1`) — เข้าใจ `main()` 2 branch (project/global) + ลำดับ copyTree→stamp→note/scaffold ก่อนแทรก call

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md`/`docs/techstack/.../rule.md` ตอนนี้ — แค่ note ไว้ก่อน
- [ ] **rule ที่เสนอ:** "payload ที่ต้อง verify ความสด/sync ต้องมี **version identity** (stamp ที่ installer เขียน) — verify เทียบ **ค่า version** ไม่ใช่แค่ existence ของ marker" — **เหตุผล:** marker-existence (TS-1) จับ 'ไม่ install' ได้ แต่จับ 'install เวอร์ชันเก่า' (false-green รอบ 2 / issue #3) ไม่ได้; generalize เป็นกฎ install-verification ของ component installer (คู่กับ "dev-tooling ต้อง verify side-effect ไม่เชื่อ exit 0" จาก topic `fix-setup-dogfood`)
