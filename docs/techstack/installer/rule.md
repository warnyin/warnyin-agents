# Rule — installer

> rule เฉพาะ component installer · rule ระดับโปรเจกต์อยู่ `docs/rule.md`

- **zero-dependency** — `bin/cli.mjs` ใช้เฉพาะ built-in (`node:fs`, `node:path`, `node:url`); ห้ามเพิ่ม dependency
- **ESM** — `import.meta.url` หา `pkgRoot`; ห้าม `__dirname`/`require`
- **ห้าม copy พื้นที่ทำงานของผู้ใช้จาก repo ต้นทาง** — `docs/stages/` ต้อง generate scaffold เปล่าใน target (`ensureScaffold`) ไม่ใช่ `copyTree` จาก `pkgRoot` (กัน scaffold leak — `troubleshooting.md` #1)
- **ไม่เขียนทับงานจริง** — SCAFFOLD/seed/root docs ข้ามไฟล์ที่มีอยู่; `--update` เขียนทับเฉพาะ CORE
- **idempotent** — รันซ้ำต้องไม่พัง/ไม่ append ซ้ำ (CLAUDE.md/AGENTS.md มี marker `warnyin/workflow/stages/`)
- **legacy = เตือน ไม่ทำให้** — ตรวจโครงเก่าแล้วแนะนำคำสั่ง `git mv` ให้ user ทำเอง ไม่ย้ายงานจริงอัตโนมัติ
- **`package.json files` เป็น allowlist** — เพิ่ม path ต้องพิจารณา publish; dotfolder ระบุชัด; งานจริง (`docs/`) ห้ามหลุด
- **guard self-install** — ถ้า `pkgRoot === target` ต้อง error (กันรันในตัว repo เอง)
