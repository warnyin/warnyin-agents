# Rule — installer

> rule เฉพาะ component installer · rule ระดับโปรเจกต์อยู่ `docs/rule.md`

## โค้ด installer (`src/bin/cli.mjs`)
- **zero-dependency** — `src/bin/cli.mjs` ใช้เฉพาะ built-in (`node:fs`, `node:path`, `node:url`); ห้ามเพิ่ม dependency
- **ESM** — `import.meta.url` หา `pkgRoot`; ห้าม `__dirname`/`require`
- **ห้าม copy พื้นที่ทำงานของผู้ใช้จาก repo ต้นทาง** — `docs/stages/` ต้อง generate scaffold เปล่าใน target (`ensureScaffold`) ไม่ใช่ `copyTree` จาก `pkgRoot` (กัน scaffold leak — `troubleshooting.md` #1)
- **ไม่เขียนทับงานจริง** — SCAFFOLD/seed/root docs ข้ามไฟล์ที่มีอยู่; `--update` เขียนทับเฉพาะ CORE
  - **scaffold ที่เป็น user working-doc ต้อง seed-from-template + seed-if-absent** (enforce ของ "ไม่เขียนทับงานจริง") — ไฟล์ scaffold ที่ผู้ใช้เป็นเจ้าของและต้องมี **เนื้อหาเริ่มต้น** (เช่น `docs/stages/context.md` working-memory) ต้อง seed content จาก `.warnyin/template/` ผ่าน `ensureScaffold` path (skip-if-exists) — **ห้ามอยู่ใน `CORE`** ที่ `--update` overwrite (จะทับ working-notes ของ user) และ **ห้าม hardcode เป็นไฟล์เปล่า** (`writeFileSync(dest,'')`) เมื่อไฟล์ต้องมี content — evidence: topic `context-working-memory` (`ensureScaffold` seed context.md จาก template + test 11/12/14 no-overwrite install/update/legacy-empty)
- **idempotent** — รันซ้ำต้องไม่พัง/ไม่ append ซ้ำ (CLAUDE.md/AGENTS.md มี marker `warnyin/workflow/stages/`)
- **legacy = เตือน ไม่ทำให้** — ตรวจโครงเก่าแล้วแนะนำคำสั่ง `git mv` ให้ user ทำเอง ไม่ย้ายงานจริงอัตโนมัติ
- **guard self-install = defensive no-op** — เก็บ guard `pkgRoot === target` ไว้ (zero-cost) แต่หลังย้าย source เข้า `src/` แล้ว `pkgRoot=src/` ไม่มีทาง === target (repo root/temp) → guard เป็น **no-op โดยตั้งใจ** (ยัง error เฉพาะ edge ที่ target===`src/` เอง) — comment ต้องตรงพฤติกรรมนี้ ห้ามลงทุน guard ใหม่
- **mirror layout `src/` = target paths** — โครงใน `src/` ต้องสะท้อน path ตอน install เป๊ะ (installer copy `src/<rel> → target/<rel>` ไม่มี mapping table); ฝืน invariant นี้ = ต้องเพิ่ม mapping → ขัดปรัชญากระทัดรัด
- **template ระดับ feature/หน่วยผู้ใช้ ต้องอยู่ใต้โฟลเดอร์ `[...]` เสมอ** (seedDocs-skip invariant) — `seedDocs` ข้าม entry ที่ขึ้นต้น `[` เท่านั้น (`cli.mjs` seedDocs); วาง template ชื่อ concrete ใต้ `template/docs/` = seed leak ลง target จริง — evidence: topic `feature-spec-delta` (spec.md template ใต้ `[feature-name]/` + verify T2 negative: target ไม่มี `docs/features/` หลัง install)

## packaging / publish
- **`package.json files` เป็น allowlist (granular)** — เพิ่ม path ต้องพิจารณา publish; **dotfolder nested ต้องระบุชัดทุกก้อน** (`src/.warnyin`, `src/.claude/commands`, `src/.claude/agents`) — npm ไม่รวม nested dotfolder อัตโนมัติ (บทเรียน 0.6.0 ขยายผล); งานจริง (`docs/`) + dev tooling (`src/tests`/`src/scripts`) ห้ามหลุด
- **pack-verify เป็น gate ก่อน publish + ต้อง testable** — แยก pure function `checkFiles(files)→errors[]` ออกจาก `npm pack` มี unit ป้อน file list ปลอมพิสูจน์ denylist จับได้ (กัน "gate ลวง" ที่เขียวเพราะ allowlist ปิด ไม่ใช่ denylist ทำงาน); assert payload ติดครบ (`src/.warnyin/workflow/` **และ** `src/.claude/commands/warnyin/`)
- **denylist ต้องครอบ dogfood ที่ root + tripwire** — bootstrap layout ทำให้ installed payload (`^.warnyin/`, `^.claude/`, root `CLAUDE.md`/`AGENTS.md`) เสี่ยงหลุดขึ้น package เอง → denylist ต้องจับ + tripwire (`settings.local.json`, `*.tgz`, `.env*`)

## dev tooling (`src/scripts/setup-*.mjs` — bootstrap/dogfood)
- **npm scripts (`setup:*`) ต้องเป็น node script cross-platform** — zero-dep/ESM ใน `src/scripts/`; ใช้ `os.tmpdir()`+`mkdtempSync` (ห้าม hardcode `/tmp`), `path.join`; spawn array args **ห้าม `shell:true`** ยกเว้นเรียก npx บน win32 (`.cmd`); ต้องมี fallback (npm pack→extract→node) หรือ exit ด้วย error ชัดเจน (ห้าม false-green)
- **`setup:dogfood` เตือน review payload diff ก่อนเปิด session** — payload ที่ install จาก `@latest` ถูก agent execute ต่อ = supply-chain surface (low risk เพราะ release ตัวเอง แต่ comment เตือนเป็น policy)

## เอกสาร migration / CHANGELOG
- **migration guide ต้อง executable-verified — ไม่ mirror legacy warning ของ `cli.mjs` แบบดิบ** — รุ่น/อาการ/codepoint (en-dash `–` U+2013, `≤` U+2264) ให้ตรง cli ได้ แต่ **คำสั่งที่ผู้ใช้รันต้องทน edge จริง** โดยเฉพาะ dir ที่ installer สร้างไว้ (`docs/stages/`): ใช้ `git mv <src>/* docs/stages/` (ย้าย contents) + `rm -rf <core เก่า>` — ไม่ใช่ `git mv <src> docs/stages` ที่ซ้อนเป็น `docs/stages/stages/` (บทเรียน `troubleshooting.md` #10)
- **ถ้า `cli.mjs` legacy warning มี edge → เอกสารทำให้ถูกก่อน แล้ว defer แก้ cli ให้ตรง** (track ใน `docs/roadmap.md`) — ห้ามปล่อยเอกสารผิดตาม cli; เอกสารเป็น source ที่ผู้ใช้ทำตามจริง
- **verify ด้วย executable migration proof เสมอ** ก่อนปิดงานที่แตะ migration guide (ดู `docs/techstack/installer/test.md` §executable migration proof)
