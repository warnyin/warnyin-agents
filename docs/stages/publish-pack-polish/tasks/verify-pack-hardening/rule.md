# Rule — verify-pack-hardening

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)
> ดึงจาก `docs/techstack/installer/rule.md` และ `docs/rule.md` — เฉพาะข้อที่เกี่ยวกับ task นี้
- [x] **zero-dependency** (`rule.md §2`) — ใช้เฉพาะ built-in `node:*`
- [x] **ESM** (`rule.md §2`) — `import.meta.url`, `fileURLToPath`; ห้าม `__dirname`/`require`
- [x] **npm scripts (dev tooling) ต้อง cross-platform** (`rule.md §2`) — array args ไม่ `shell:true`; `os.tmpdir()`/`path.join` ไม่ hardcode path
- [x] **★ EOL guard ระดับ tarball** (`rule.md §4 KB #30`) — installer normalize EOL ตอนเขียน + gate ครอบไฟล์ text ทุกนามสกุลใต้ `src/` (ตอนนี้เพิ่มใน `checkEol` ของ verify-pack)
- [x] **pack-verify เป็น gate ก่อน publish + ต้อง testable** (`docs/techstack/installer/rule.md` §packaging) — pure fn + unit ป้อน file list ปลอม
- [x] **★ `MIN_PASS` bump ต้อง verify baseline จากไฟล์ก่อน** (`rule.md §1 config-protection`) — Slice C อ่าน MIN_PASS ปัจจุบันจาก `src/scripts/check-test-count.mjs` ก่อน bump
- [x] **★ inject realpath เพื่อ testability** (`docs/techstack/installer/rule.md` §cli.mjs) — pattern `isEntrypoint(argv1, metaUrl, realpath = fs.realpathSync)`; task นี้ใช้ pattern เดียวกัน: `readTextEntries(files, opts = {})` injectable `readFile`/`root`
- [x] **denylist ต้องครอบ tripwire** (`docs/techstack/installer/rule.md` §packaging) — `settings.local.json`, `*.tgz`, `.env*`
- [x] **★ agent เขียน path เป็น inline-code ไม่ใช่ markdown-link** (`rule.md §4`) — `docs/memory.md` style; commit context ของ task นี้ไม่มีลิงก์ไป topic

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)
> ห้ามแก้ `docs/techstack/.../rule.md` ตอนนี้ — แค่ note ไว้ก่อน ถึง SHIP ค่อยพิจารณาย้ายขึ้นไป
- [ ] **error category prefix convention** — error string ทุก category ควรมี prefix (`eol:` / `path:` / `denylist:` / `allowlist:`) เพื่อ (1) test assert ได้ด้วย grep prefix (2) maintainer อ่านง่ายรู้หมวดทันที — เหตุผล: เดิม verify-pack error ไม่มี prefix (rule §2 ของ error handling ใน installer); รอบนี้เพิ่ม `eol:` + `path:` แล้ว ควรระบุเป็น convention
- [ ] **Buffer-level byte check ก่อน UTF-8 decode สำหรับ byte-pattern scanning** — `buf.includes(0x0D)` เร็วกว่า + กัน false-positive จาก multi-byte codepoint ที่มี 0x0D เป็น byte หนึ่ง — เหตุผล: pattern เดียวกันใช้ได้กับ scanner อื่น (BOM/control char/etc.)
- [ ] **size cap pattern สำหรับ I/O bulk scan** — `opts.maxBytes` (default 5 MB) + warn ไม่ error — เหตุผล: กัน DoS + false-positive จากไฟล์ที่มี byte pattern legitimately
- [ ] **importable constant pattern ระหว่าง bin + scripts** — TEXT_EXT export จาก `cli.mjs` + import ใน `verify-pack.mjs` (zero-dep, no circular import เพราะ `cli.mjs` ไม่ import จาก `verify-pack.mjs`) — เหตุผล: DRY ระหว่าง layers ที่ share config; pattern ใช้ซ้ำได้กับ constant อื่น