# Rule — installer-seed

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

## 1. Rule ที่ต้อง follow (จาก techstack + `docs/rule.md`)

### template ที่ถูก seed ลง `docs/`

- [ ] **★ ห้าม markdown-link ในไฟล์ template ทั้ง 2 ใบ** — `lint-md.mjs` มี `SCAN_ROOTS = ['src','docs']` และ EXCLUDE เฉพาะ `src/.warnyin/template/` + `docs/stages/achieved/` → **ต้นทางถูกยกเว้น แต่สำเนาที่ seed ลง `docs/` ของผู้ใช้ (และของ repo นี้ตอน dogfood) ถูกสแกน** → ลิงก์ที่ resolve ไม่ได้ = `npm run lint:md` **แดงถาวรโดยไม่มีใครแก้โค้ด** → path ทุกที่เป็น **inline-code (backtick)** (`design.md` §3.1 + C12)
- [ ] **★ template ระดับไฟล์ concrete ใต้ `template/docs/` ถูก seed ลง target โดยเจตนา** — `seedDocs` ข้ามเฉพาะ entry ที่ขึ้นต้น `[` (`[feature-name]`, `[component]`) ส่วนไฟล์/โฟลเดอร์ชื่อจริงจะลงเครื่องผู้ใช้ทุกครั้ง (seedDocs-skip invariant, `docs/techstack/installer/rule.md`) → 2 ใบนี้ **ตั้งใจให้ลง** จึงวางเป็นชื่อจริง (ไม่ใช่ `[...]`) และต้อง **ไม่มีข้อมูลจริงของ repo นี้** ปนไป
- [ ] **คำเตือน C12 คำต่อคำที่หัวไฟล์ทั้ง 2 ใบ** (canonical-copy — `docs/rule.md` §1) — T6 assert แบบ string-equality; แต่งใหม่ = แดง
- [ ] **แถวตัวอย่างในตารางต้องเป็น HTML comment** — parse contract ของ `memory-status.mjs` (T5) นับแถวที่คอลัมน์แรกเป็นตัวเลขล้วนเป็น entry จริง
- [ ] **ไฟล์ใต้ `src/` เป็น LF ล้วน** (บทเรียน CRLF — commit `0a2e7c4`)

### installer / เทส

- [ ] **investigate-before-edit** (`docs/rule.md` §1) — ก่อนแก้ `SCAFFOLD_FILES` ต้องอ่าน `main()`/`ensureScaffold()`/`seedDocs()` จนเข้าใจลำดับจริง (`spec.md` §4.1); ไม่ตรงกับ spec → **หยุด รายงาน ห้ามเดา**
- [ ] **test installer = black-box spawn** (`docs/rule.md` §5) — spawn `src/bin/cli.mjs` จริงใน temp dir ผ่าน `runCli`; **ห้าม import logic จาก `cli.mjs`** (มันรัน side-effect ตอน import) · **ห้าม refactor target เพื่อ testability**
- [ ] **assert `code===0` ก่อนเสมอ + surface `stderr`** (`ok(r,msg)`); spawn array args **ห้าม `shell:true`**
- [ ] **assertion เป็น target-side path** (`docs/stages/context.md`, `docs/memory.md`) ไม่ใช่ `src/...`
- [ ] **`path.join` ทุกที่** (cross-platform) — ห้าม string concat ด้วย `/`; `fileURLToPath(new URL(...))` ห้าม `.pathname` (Windows คืน `/D:/...`)
- [ ] **zero-dependency + ESM** — `devDependencies` ต้องว่างเสมอ; built-in `node:*` เท่านั้น
- [ ] **★ ห้าม `t.skip()` / conditional-skip เด็ดขาด** — `src/scripts/check-test-count.mjs` fail เมื่อ `pass !== tests`
- [ ] **★ ไม่ใส่ existence guard ในเคสใหม่** — template เป็นของ task นี้ (อยู่ worktree เดียวกัน) → guard จะทำให้เคส vacuous; guard แบบ `hasGlobalTemplate` ใช้เฉพาะไฟล์ที่ **task อื่น** เป็นเจ้าของ
- [ ] **★ เพิ่มเคสใหม่เท่านั้น — ห้ามแก้/ลบ assertion ของเคส 1-9 เดิม** (`config-protection`, `docs/rule.md` §1 + `test.md` §เปิด allowlist entry ใหม่); **เคส 9 ต้องยังเขียว** (ผ่านทาง `seedDocs()` แทน `ensureScaffold()`)
- [ ] **ห้ามแตะ `src/scripts/check-test-count.mjs`** — `MIN_PASS=46` เป็น **floor** ไม่ใช่ยอดจริง (suite ~149 เคส); gate ที่ทำงานจริงคือ `pass === tests` ซึ่งครอบเคสใหม่อัตโนมัติ
- [ ] **installer ไม่เขียนทับงานจริง** (`docs/techstack/installer/rule.md`) — SCAFFOLD/seed/root docs ข้ามไฟล์ที่มีอยู่; **ห้ามเพิ่ม logic "ไฟล์ว่าง → เขียนทับ" ใน `cli.mjs`** (แก้ที่ playbook C13 ของ T1)
- [ ] **installer สร้าง scaffold เอง ห้าม copy พื้นที่ทำงานจาก repo ต้นทาง** (`docs/rule.md` §4) — ไม่เปลี่ยน `ensureScaffold` เป็น `copyTree`
- [ ] **comment ต้องตรงพฤติกรรมจริง** (`docs/techstack/installer/rule.md` — เคส guard self-install) — คอมเมนต์ `SCAFFOLD_FILES` ที่ยังบอกว่าสร้าง `context.md` เอง = defect
- [ ] **mirror layout `src/` = target paths** — ห้ามเพิ่ม mapping/branch พิเศษให้ไฟล์ใหม่

### ขอบเขต / playbook

- [ ] **ห้ามแตะไฟล์ของ task อื่น** (`design.md` §7 file ownership) — `workflow/memory.md` + `workflow/README.md` (T1) · stage/utility playbook (T2) · installer templates + `AGENTS.md` (T4) · `memory-status.mjs` (T5) · CHANGELOG/`package.json`/`verify-pack` (T6)
- [ ] **ห้ามแตะ root `.warnyin/`, `.claude/`, root `CLAUDE.md`/`AGENTS.md`** (dogfood gitignored — `docs/rule.md` §6); แก้เฉพาะใต้ `src/`
- [ ] **ห้ามรัน `cli.mjs` ที่ `cwd = repo root`** (dogfood leak — `troubleshooting.md` #6) → ใช้ `makeTempProject` เสมอ; verify ที่ `src/` ที่เพิ่งแก้ ไม่ใช่ root dogfood ที่ stale
- [ ] **bare `node --test` ห้ามใส่ path arg** (`docs/rule.md` §5) — portable ข้าม node 20/22/24
- [ ] **payload `.md` เป็น pointer ไม่ inline กฎซ้ำ** (canonical-copy) — `init.md` + template อธิบายโครงของตัวเอง แต่ **ไม่ลอกกติกา memory** จาก playbook ของ T1 (ชี้ด้วย inline-code path พอ)
- [ ] **stage-invoked capability convention** (`docs/rule.md` §1) — gate item ที่เพิ่มใน `init.md` §5 ต้องเป็น **conditional/N-A** (template ไม่มี → ไฟล์เปล่ายอมรับได้ ไม่ block INIT)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

> ห้ามแก้ `docs/rule.md` / `docs/techstack/**/rule.md` / `docs/features/**` ตอน BUILD — note ไว้ก่อน

- [ ] **rule ที่เสนอ:** "**scaffold-vs-seed ownership invariant** — ไฟล์ใดที่มี template ใน `.warnyin/template/docs/` **ห้ามอยู่ใน `SCAFFOLD_FILES`**" — _เหตุผล:_ `main()` เรียก `ensureScaffold()` ก่อน `seedDocs()` และ seed skip-if-exists → ไฟล์เปล่าจาก scaffold บล็อก template **ตลอดกาล** โดยไม่มี error (false-green เงียบ; เคสจริงของ `docs/stages/context.md` รุ่นก่อน) — เป็น invariant ที่ตรวจได้ด้วยเทส structural
- [ ] **rule ที่เสนอ:** "**playbook bootstrap ต้อง seed-before-empty-fallback**" — _เหตุผล:_ `init.md` เดิมสร้างไฟล์เปล่าก่อน → ทำให้ seed ในขั้นถัดไปของตัวเอง skip → global user ได้ไฟล์ 0 byte ถาวร (คู่ทิศเดียวกับข้อบน แต่ที่ระดับ playbook)
- [ ] **rule ที่เสนอ:** "**template ที่ seed ลง `docs/` ต้อง 0 markdown-link**" — _เหตุผล:_ `lint-md` EXCLUDE เฉพาะ **ต้นทาง** (`src/.warnyin/template/`) ไม่ EXCLUDE **สำเนาปลายทาง** → ลิงก์ใน template = dead-link gate ของ **ทุกโปรเจกต์ที่ติดตั้ง** แดงโดยที่ผู้ใช้ไม่ได้ทำอะไรผิด (ขยายผลของ seedDocs-skip invariant ที่มีอยู่แล้ว)
- [ ] **แจ้ง SHIP / T6 (นอก scope BUILD):** ข้อความ `--help` ใน `cli.mjs` (~บรรทัด 50) และเอกสารที่เคลมว่า `--update` "ไม่แตะ `docs/`" **ไม่ตรงข้อเท็จจริง** — `ensureScaffold()`+`seedDocs()` รันทุกครั้ง (เพียงแต่ skip ไฟล์ที่มีอยู่) → ควรแก้ wording + ใส่ **migration note ใน CHANGELOG** ว่าผู้ใช้เดิมได้ `docs/memory.md` ทันที แต่ `docs/stages/context.md` ที่เป็นไฟล์ 0 byte จะถูกเติมโครงตอน stage ถัดไปเขียน memory (C13) ไม่ใช่ตอน install
