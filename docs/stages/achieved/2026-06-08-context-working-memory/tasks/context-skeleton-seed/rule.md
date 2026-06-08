# Rule — context-skeleton-seed

> rule ที่ task นี้ต้อง focus/follow + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack/installer + docs/rule.md)
- [ ] **zero-dependency** — ใช้เฉพาะ built-in `node:*` (test = `node:test`); `devDependencies` ต้องว่าง
- [ ] **ESM** — `import`/`export`, `import.meta.url` ไม่ใช่ `__dirname`/`require`
- [ ] **ภาษาไทย** ในคอมเมนต์/ข้อความผู้ใช้ ตามสไตล์ `cli.mjs`
- [ ] **cross-platform** — `path.join`, ไม่ hardcode `/`; spawn array args ห้าม `shell:true`
- [ ] **installer สร้าง scaffold เอง — ห้าม copy พื้นที่ทำงานจาก repo ต้นทาง** (installer rule §4) — seed ต้องอ่านจาก `.warnyin/template/` (scaffold material ที่ ship) **ไม่ใช่** `docs/stages/` ของ repo ต้นทาง → กัน scaffold-leak
- [ ] **seed-if-absent (ห้ามทับงาน user)** — context.md เป็น working-notes ของ user; ต้องอยู่ใน `ensureScaffold` path (skip-if-exists) **ห้ามใส่ใน `CORE`** ที่ `--update` overwrite
- [ ] **CHANGELOG ทุก user-facing change** — scaffold เปลี่ยนพฤติกรรม → ต้องมี entry (Keep a Changelog)
- [ ] **zero-dep lint/test-gate** — test เป็น `node:test` black-box; ผ่าน `check-test-count` (ห้ามลด MIN_PASS เพื่อให้ผ่าน — config-protection)
- [ ] **investigate-before-edit** — ก่อนแก้ `ensureScaffold`/`SCAFFOLD_FILES` เข้าใจ caller + พฤติกรรม DRY/stats เดิมก่อน

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP)
- [ ] rule ที่เสนอ: *"scaffold file ที่เป็น user working-doc (เช่น context.md) ต้อง seed จาก template + seed-if-absent เสมอ — ห้ามอยู่ใน CORE/overwrite"* — เหตุผล: กันทับงาน user ตอน `--update`; generalize จาก task นี้ (scope `component:installer`) — **evidence รอจาก build/verify**
