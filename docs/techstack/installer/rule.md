# Rule — installer

> rule เฉพาะ component installer · rule ระดับโปรเจกต์อยู่ `docs/rule.md`

## โค้ด installer (`src/bin/cli.mjs`)
- **zero-dependency** — `src/bin/cli.mjs` ใช้เฉพาะ built-in (`node:fs`, `node:path`, `node:url`); ห้ามเพิ่ม dependency
- **ESM** — `import.meta.url` หา `pkgRoot`; ห้าม `__dirname`/`require`
- **ห้าม copy พื้นที่ทำงานของผู้ใช้จาก repo ต้นทาง** — `docs/stages/` ต้อง generate scaffold เปล่าใน target (`ensureScaffold`) ไม่ใช่ `copyTree` จาก `pkgRoot` (กัน scaffold leak — `troubleshooting.md` #1)
- **ไม่เขียนทับงานจริง** — SCAFFOLD/seed/root docs ข้ามไฟล์ที่มีอยู่; `--update` เขียนทับเฉพาะ CORE
- **idempotent** — รันซ้ำต้องไม่พัง/ไม่ append ซ้ำ (CLAUDE.md/AGENTS.md มี marker `warnyin/workflow/stages/`)
- **legacy = เตือน ไม่ทำให้** — ตรวจโครงเก่าแล้วแนะนำคำสั่ง `git mv` ให้ user ทำเอง ไม่ย้ายงานจริงอัตโนมัติ
- **guard self-install = defensive no-op** — เก็บ guard `pkgRoot === target` ไว้ (zero-cost) แต่หลังย้าย source เข้า `src/` แล้ว `pkgRoot=src/` ไม่มีทาง === target (repo root/temp) → guard เป็น **no-op โดยตั้งใจ** (ยัง error เฉพาะ edge ที่ target===`src/` เอง) — comment ต้องตรงพฤติกรรมนี้ ห้ามลงทุน guard ใหม่
- **mirror layout `src/` = target paths** — โครงใน `src/` ต้องสะท้อน path ตอน install เป๊ะ (installer copy `src/<rel> → target/<rel>` ไม่มี mapping table); ฝืน invariant นี้ = ต้องเพิ่ม mapping → ขัดปรัชญากระทัดรัด

## packaging / publish
- **`package.json files` เป็น allowlist (granular)** — เพิ่ม path ต้องพิจารณา publish; **dotfolder nested ต้องระบุชัดทุกก้อน** (`src/.warnyin`, `src/.claude/commands`, `src/.claude/agents`) — npm ไม่รวม nested dotfolder อัตโนมัติ (บทเรียน 0.6.0 ขยายผล); งานจริง (`docs/`) + dev tooling (`src/tests`/`src/scripts`) ห้ามหลุด
- **pack-verify เป็น gate ก่อน publish + ต้อง testable** — แยก pure function `checkFiles(files)→errors[]` ออกจาก `npm pack` มี unit ป้อน file list ปลอมพิสูจน์ denylist จับได้ (กัน "gate ลวง" ที่เขียวเพราะ allowlist ปิด ไม่ใช่ denylist ทำงาน); assert payload ติดครบ (`src/.warnyin/workflow/` **และ** `src/.claude/commands/warnyin/`)
- **denylist ต้องครอบ dogfood ที่ root + tripwire** — bootstrap layout ทำให้ installed payload (`^.warnyin/`, `^.claude/`, root `CLAUDE.md`/`AGENTS.md`) เสี่ยงหลุดขึ้น package เอง → denylist ต้องจับ + tripwire (`settings.local.json`, `*.tgz`, `.env*`)

## dev tooling (`src/scripts/setup-*.mjs` — bootstrap/dogfood)
- **npm scripts (`setup:*`) ต้องเป็น node script cross-platform** — zero-dep/ESM ใน `src/scripts/`; ใช้ `os.tmpdir()`+`mkdtempSync` (ห้าม hardcode `/tmp`), `path.join`; spawn array args **ห้าม `shell:true`** ยกเว้นเรียก npx บน win32 (`.cmd`); ต้องมี fallback (npm pack→extract→node) หรือ exit ด้วย error ชัดเจน (ห้าม false-green)
- **`setup:dogfood` เตือน review payload diff ก่อนเปิด session** — payload ที่ install จาก `@latest` ถูก agent execute ต่อ = supply-chain surface (low risk เพราะ release ตัวเอง แต่ comment เตือนเป็น policy)
