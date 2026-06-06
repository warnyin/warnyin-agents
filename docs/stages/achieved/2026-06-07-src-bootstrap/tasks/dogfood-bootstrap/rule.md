# Rule — dogfood-bootstrap

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง follow + rule ใหม่ที่เสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack installer + docs/rule.md)
- [ ] **zero-dependency** (`docs/rule.md` §2, installer rule) — setup scripts ใช้เฉพาะ built-in `node:*`; `devDependencies` ยังว่าง
- [ ] **ESM** (`docs/rule.md` §2) — `import`/`export`, `import.meta.url` (`fileURLToPath`) ไม่ใช่ `__dirname`/`require`
- [ ] **idempotent** (installer rule) — `setup:dogfood` รันซ้ำต้องไม่ append pointer ซ้อน (marker check ก่อน append — เทียบ `installRootDoc`)
- [ ] **cross-platform** (`docs/techstack/installer/standard.md`) — `path.join` ทุกที่, `os.tmpdir()` ไม่ hardcode `/tmp`, spawn array args ห้าม `shell:true` (ยกเว้น npx win32)
- [ ] **ข้อความผู้ใช้/คอมเมนต์ภาษาไทย** (`docs/rule.md` §2)
- [ ] **CHANGELOG ทุก user-facing change** (`docs/rule.md` §2) — task นี้เพิ่ม `setup:dogfood`/`setup:sandbox` (เปลี่ยน dev workflow + restructure user-facing) + bump version → **ต้องมี entry ใน `CHANGELOG.md`** (ทำตอน T-สุดท้าย/SHIP ตาม transition §5.3 ข้อ 8)
- [ ] **`package.json files` = allowlist** (installer rule) — `src/scripts/` **ห้ามหลุด** publish (dev-only) → ยืนยันด้วย verify-pack denylist (T2 คุม)
- [ ] **ไม่เขียนทับงานจริง** (installer rule) — `setup:dogfood` ต้องไม่เปื้อน committed `docs/` → กันด้วยการสร้าง project.md/infra.md/achieved/.gitkeep เป็น repo doc จริง (BL-3)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/rule.md` / `docs/techstack/installer/rule.md` ตอนนี้ — แค่ note ไว้
- [ ] rule ที่เสนอ: **"npm scripts ต้องเป็น node script cross-platform"** — เหตุผล: dev tooling ใหม่ (`setup:*`) ต้องรันได้ทุก OS; ห้าม shell oneliner ที่ผูก POSIX (`/tmp`, `&&` แบบ bash) — ควรเป็น `node src/scripts/*.mjs` ที่ใช้ `os.tmpdir()`/`path.join` (Infra S2)
- [ ] rule ที่เสนอ: **".gitignore pattern ของ installed dogfood ต้อง root-anchored (`/` นำหน้า)"** — เหตุผล: bootstrap layout ทำให้ชื่อ dotfolder ซ้ำกันระหว่าง `src/.claude/...` (source) กับ root `.claude/...` (dogfood) — pattern ลอย ๆ จะลบ source จาก git (SA S2/Infra S4)
- [ ] rule ที่เสนอ: **"setup:dogfood เตือน review payload diff ก่อนเปิด session"** — เหตุผล: payload ที่ install จาก `@latest` ถูก agent execute ต่อ = supply-chain surface (low risk เพราะ release ตัวเอง แต่ควร comment เตือนเป็น policy — Security S1)
