# Test — installer

> วิธีเทส component installer · guideline สำหรับ VERIFY ของ topic ที่แตะ installer
> test อยู่ `src/tests/` (SOURCE layer, dev-only — ไม่ publish)

## รันเทส
- **local:** `npm test` (= `node --test` **bare**, ไม่มี path arg) → recurse discover `src/tests/*.test.mjs` ทุก node 20/22/24
- **CI:** `.github/workflows/ci.yml` matrix node [20,22,24] รัน `npm test 2>&1 | node src/scripts/check-test-count.mjs` (pass-count gate) ทุก PR/push(main) + job `pack-verify` (`npm run verify:pack`) ที่ `needs: test`

## pass-count gate (anti-false-green — troubleshooting #3)
- CI ไม่เชื่อแค่ exit 0 — `check-test-count.mjs` parse summary ของ `node --test` แล้ว **fail ถ้า:** `fail!=0` หรือ `pass<MIN_PASS (9)` หรือ `pass!=tests` (มีเคส skip/cancel)
- กัน false-green แบบ #3 (เช่น `node --test <dir>` เปล่า exit 0 แต่ไม่มีเคสรัน) — acceptance = เห็น **pass count ≥ 9** ไม่ใช่แค่ exit 0 (BL-2)
- step CI ใช้ `set -o pipefail` (`shell: bash`) ให้ pipe ยัง fail ตาม node --test

## เคสที่ test suite ครอบ (58 เคส รวม — bare discovery เจอครบ)

### `src/tests/installer.test.mjs` — 14 เคส (black-box, spawn `src/bin/cli.mjs`)
1. ติดตั้งสด — โครงครบ (`.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`, `.claude/skills/update-codemaps/SKILL.md`, `docs/stages`, `docs/project.md`, `CLAUDE.md`, `AGENTS.md`)
2. idempotent — รัน 2 ครั้ง byte-equal + ไม่ append ซ้ำ (`stdout` มี "ข้าม")
3. `--update` ไม่ทับงานจริง — `docs/project.md`/`docs/stages/demo/` คงเดิม
4. `installRootDoc` append section + ไม่ append ซ้ำ (marker)
5. legacy 0.3–0.5.x → warn ที่ `stderr` (string ตรงจาก `cli.mjs`)
6. legacy ≤0.2.x → warn ที่ `stderr` (คนละ string จากเคส 5)
7. `seedDocs` ข้าม `[...]` (negative — ไม่มี path ใต้ `docs/` ขึ้นต้น `[`)
8. `--dry-run` ไม่เขียนไฟล์ (temp ยังว่าง)
9. **scaffold สร้างเปล่า ไม่ leak `docs/stages/<topic>`** — มี `context.md`+`achieved/.gitkeep` แต่ไม่มี topic ของ repo ต้นทาง
10. **context.md seed skeleton** — temp ว่าง → install → `docs/stages/context.md` non-empty + 4 header (โฟกัส/decision/parking-lot/เพิ่ง ship)
11. **context.md ไม่ทับ (install)** — มี context.md เดิม → install → byte-equal
12. **context.md ไม่ทับ (`--update`)** — เช่นเดียวกัน → `--update` → byte-equal
13. **`--dry-run` ไม่สร้าง context.md** — temp ว่าง → `--dry-run` → ไม่มีไฟล์จริง แต่ exit 0
14. **legacy context.md ว่างคง `""`** — context.md ว่าง (`''`) อยู่ก่อน → install → คง `''` (seed-if-absent ไม่ทับด้วย skeleton)

### `src/tests/verify-pack.test.mjs` — 10 เคส (unit, import `checkFiles` ตรง — BL-4 testable denylist)
1. payload ถูกต้อง → ไม่มี error (GOOD baseline รวม `src/.claude/skills/explore/SKILL.md`)
2. R2 denylist: `src/tests/` หลุด → จับได้ (กัน gate ลวง)
3. R2 denylist: `src/scripts/` หลุด → จับได้
4. R2 denylist: `docs/` + `.github/` หลุด → จับได้
5. denylist root dogfood: `.warnyin/`, `.claude/`, root `CLAUDE.md`/`AGENTS.md` → จับได้
6. tripwire: `settings.local.json` / `*.tgz` / `.env` → จับได้
7. R1 assertion: ขาด `src/.warnyin/workflow/` → คืน error
8. R1 assertion: ขาด `src/.claude/commands/warnyin/` → คืน error
9. allowlist: ไฟล์นอก allow (เช่น `src/.vscode/`) → จับได้ (skills อยู่ใน allow แล้ว → ใช้ subdir อื่นที่ยังนอก allow พิสูจน์ guard)
10. R1 assertion: ขาด `src/.claude/skills/` → คืน error (skills เป็น required payload)

### `src/tests/lint-md.test.mjs` — 7 เคส (unit, import `checkLinks` ตรง — BL-4 testable)
1. good link (exists→true) → `deepEqual([])`
2. dead link (exists→false) → error มี target
3. link ใน **inline-code** `` `[x](y)` `` → ข้าม (ไม่ error แม้ exists→false)
4. link ใน **fenced code** → ข้าม
5. `http(s)://` / `mailto:` / `#anchor` → ข้าม
6. `path#sec` (path exists) → ไม่ error (ตัด anchor ก่อนเช็ค path)
7. fake `exists` injectable → resolved path ถูกส่งเข้า (ไม่แตะ fs จริง)

### `src/tests/validate-topic.test.mjs` — 27 เคส (unit + behavior, structural validator)
- ครอบ CLI contract (status ไม่มี arg / validate `<slug>` / arg แปลก → exit code) + positive/negative ต่อเช็คใน temp fixture + dogfood self-validate (รายละเอียดดู §verify structural validator)

## verify-pack testable (BL-4)
- `checkFiles(files[]) → error[]` = pure function ใน `src/scripts/verify-pack.mjs`, `export` ออกมา → unit ป้อน file list ปลอม (มี `src/tests/` ฯลฯ) แล้ว assert จับได้ — พิสูจน์ว่า denylist **ทำงานจริง** ไม่ใช่เขียวเพราะ allowlist ปิดอยู่
- main-guard ใช้ `fileURLToPath(import.meta.url) === process.argv[1]` (ไม่ใช่ `import.meta.main` ที่ undefined บน node 20) → import จาก unit test ไม่ trigger `npm pack`

## lint-md dead-link gate (zero-dep — pattern เดียวกับ verify-pack)
- `checkLinks(docs, exists) → error[]` = pure function ใน `src/scripts/lint-md.mjs` (`docs=[{file,content}]`, `exists` injectable) + main-guard เดียวกัน — unit feed docs ปลอม + fake `exists` (ไม่แตะ fs จริง); `main()` walk `src/`+`docs/` (exclude `src/.warnyin/template/` + `docs/stages/achieved/`), validate markdown-link `[](path)` relative resolve
- **strip-code-before-link-match (L2 — ป้องกัน false-positive):** strip code-span ก่อน match link ด้วย **alternation pass เดียว** `/```[\s\S]*?```|`[^`\n]*`/g` — **ห้าม** sequential `.replace(fenced).replace(inline)` (พังเมื่อ `` ``` `` ฝังใน inline-code ของ meta-doc; ดู `troubleshooting.md` #12)
- **verify gate = executable ไม่ใช่แค่ unit:** (1) **positive** — inject dead-link ในไฟล์ scanned ชั่วคราว (`docs/_tmp.md`) → `npm run lint:md` ต้อง exit≠0 + ระบุไฟล์ → ลบ temp; (2) **negative** — meta-doc/code-span ไม่ flag; (3) **exclusion** — template/archived ที่มี dead-link จริงไม่ถูก scan
- skip: `http(s)://` / `mailto:` / `#anchor`-only; `path#sec` → validate path (ตัด anchor); ทำงานเฉพาะ markdown-link — **ไม่ validate backtick runtime-ref** ของ adapter (target-root path ไม่ใช่ repo-relative)

## หลักการเทส
- **black-box spawn จริง** (installer.test) — ห้าม import logic จาก `cli.mjs`; assert side-effect จริง
- assert `code===0` ก่อน + surface `stderr`; assert stream ให้ตรง; เทียบ byte ไม่ใช่ mtime
- cross-platform: `process.execPath`, `path.join`, `fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))` (ห้าม `.pathname` — Windows คืน `/D:/...` → MODULE_NOT_FOUND)
- cleanup `t.after()` ลงทะเบียนก่อน assert (ลบ temp แม้ fail)

## verify ระดับ topic (VERIFY stage)
- functional: `npm test` เขียวทั้ง suite (เห็น pass count ≥ 9)
- package cleanliness: `npm run verify:pack` (หรือ `npm pack --dry-run --json` → `checkFiles`) → `src/.warnyin/`/`src/.claude/` ติด + ไม่มี `src/tests`/`src/scripts`/`docs/`/`.github`/root dogfood รั่ว
- installer behavior: ติดตั้งจริงใน temp → ตรวจ target ได้เฉพาะ scaffold เปล่า (ไม่มี topic leak)
- CI เขียวจริงบน PR = ยืนยันบน Linux/node อื่น (ทำตอนเปิด PR/merge — outward)
- **dev Windows:** `verify-pack.mjs` รันตรงอาจ ENOENT (`troubleshooting.md` #4) → apply allowlist logic เองบน `npm pack --json` (ป้อนเข้า `checkFiles`)

## verify feature ที่เป็น payload `.md` ล้วน (contexts/, playbook, role card)
> change ที่เพิ่ม/แก้ `.md` ใต้ `src/.warnyin/workflow/` (ไม่มี runtime) — verify เชิงโครงสร้าง + executable install proof + consistency แทนการรัน service (บทเรียน topic `context-profiles`)
- **ship integrity:** `npm run verify:pack` → ไฟล์ `.md` ใหม่ติด tarball (allowlist `src/.warnyin` ครอบอยู่แล้ว ไม่ต้องแก้) · `npm test` เขียว (ไม่มี assertion เดิมพัง)
- **executable install proof:** `npm run setup:sandbox` → ตรวจ target ว่าไฟล์ใหม่ + การ wire (เช่น callout) ลงจริงผ่าน `cli.mjs`; root dogfood ไม่โดนแตะ — **ห้ามรัน `cli.mjs` ที่ cwd=repo root** (dogfood leak #6)
- **dead-link สองทิศ:** scan link ในไฟล์ใหม่ + ทุก path ที่ไฟล์อื่นอ้างถึงไฟล์ใหม่ → resolve เป็นไฟล์จริงครบ (0 dead)
- **3-way consistency:** ความรู้ชุดเดียวกระจายหลายที่ (เช่น `contexts/README.md` mapping ↔ callout ใน `stages/*` ↔ section "ใช้คู่ stage" ของ card) → ทั้งสามต้องตรงกัน (บทเรียนเดียวกับ cli↔CHANGELOG↔test ใน `cli-legacy-warning-fix`)
- **โครง conformance:** ไฟล์ประเภทเดียวกันโครงเดียวกัน (เช่น context card ทุกใบมี 4 section คงที่) + บาง ไม่ duplicate logic ของไฟล์ที่ชี้ไป

## verify spec/delta payload (L: topic `feature-spec-delta`)
> change ที่แตะ behavior spec (`docs/features/*/spec.md`), template spec, หรือกติกา Spec delta ใน playbook — ขยายจาก "payload `.md` ล้วน"
- **merge trace ด้วยมือ (executable proof ของกติกา merge):** sandbox copy ของ spec จริงใน temp → เดินกติกา ship §4 step 5.1 ครบทุกเคส: ADDED ต่อท้าย · MODIFIED แทนที่ (ไม่ duplicate) · MODIFIED rename `[เดิมชื่อ:]` (ชื่อเก่าหาย ไม่ทิ้งซาก) · REMOVED หาย · **key ไม่เจอ → STOP** (ไฟล์ไม่ถูกแตะ ไม่กลายเป็น ADDED แฝง) — assert ผลทุกเคส (ดู verify ของ topic `feature-spec-delta` T5)
- **sandbox negative (seedDocs-skip):** `npm run setup:sandbox` → target ต้องมี template `.warnyin/template/docs/features/[feature-name]/spec.md` แต่**ไม่มี** `docs/features/[feature-name]/` (seed ข้าม `[...]`)
- **accuracy ของ spec ที่สกัดจาก source:** ไล่ทุก Requirement/Scenario เทียบ source จริง — **โดย agent อิสระจากผู้เขียน** (self-check ไม่พอ — ดู `docs/rule.md` §5 ข้อ 4); THEN ทุกข้อต้องเป็น observable artifact
- **semantic consistency ของ canonical:** กติกา merge ใน playbook/template/command ต้องตรง canonical ของ design **คำต่อคำ** (grep key อย่างเดียวจับ "wording ขัดกัน" ไม่ได้)

## verify structural validator / zero-dep CLI tool (L: topic `validator-status`)
> change ที่เพิ่ม/แก้ payload script ที่มี runtime จริง (เช่น `validate-topic.mjs`) — เทสพฤติกรรมได้เต็ม (ต่างจาก payload `.md` ที่ verify เชิงโครงสร้าง)
- **behavior จริงตาม CLI contract:** รัน script ตรงทุกโหมด (status ไม่มี arg / validate มี `<slug>` / arg แปลก) — assert **output + exit code** ตรง contract (เช่น ✖→exit 1, ⚠-only/สะอาด→exit 0, slug ไม่ถูกต้อง→exit 2)
- **positive + negative ต่อเช็คใน temp fixture:** สร้าง topic/feature ปลอมใน `mktemp -d` ครบทุกเคส (เช่น task ขาดไฟล์→✖, ตารางไม่มี data row→✖, Requirement ไม่มี Scenario→✖, artifact ข้าม stage→⚠) แล้ว `(cd "$TMP" && node "$SCRIPT" ...)` assert — pure fn ก็ feed `Map` ปลอมไม่แตะ fs
- **dogfood self-validate:** validator รันกับ topic/feature จริงในrepo ได้ (เช็คโครงตัวเอง) — proof ว่าทำงานกับ data จริง ไม่ใช่แค่ fixture
- **security invariant (zero-dep read-only tool):** grep ยืนยัน **ไม่มี** `child_process`/network/`writeFile` — เฉพาะ `node:fs`(read)/`node:path`/`node:url`; output ไม่ echo เนื้อ artifact (กัน leak ลง log); path traversal guard (`../..`→exit 2)
- **zsh caveat:** ตัวแปร multi-word (`V="node script.mjs"; $V`) zsh ไม่ split — รัน node ตรงทีละคำสั่ง หรือใช้ array/function

## verify skill (Claude adapter) — payload `.md` + frontmatter (L2: topic `skill-format`)
> skill (`src/.claude/skills/<name>/SKILL.md`) = adapter บางชี้ playbook กลาง (เหมือน command) — ไม่มี service ให้รัน → verify เชิงโครงสร้าง + install proof + dead-link + consistency (ขยายจาก "payload `.md`")
- **executable install proof:** `npm run setup:sandbox` → target มี `.claude/skills/<name>/SKILL.md` ครบทุกตัว; root dogfood ไม่โดนแตะ — **ห้ามรัน `cli.mjs` ที่ cwd=repo root** (dogfood leak #6)
- **frontmatter parse (behavioral):** YAML frontmatter มี key ครบ (`name`/`description`/`when_to_use`/`allowed-tools`); `allowed-tools` เป็น **read-only set** (ไม่มี `Write`/`Edit`/`NotebookEdit`) = blast radius ปลอดภัยพอจะ auto-invoke; **ไม่มี `disable-model-invocation`** (ยืนยัน auto-invocable); body **ไม่พึ่ง `$ARGUMENTS`** (skill รับ context จาก request ไม่ใช่ arg-substitution)
- **dead-link skill → playbook:** path ใน body (`.warnyin/workflow/<x>.md`) resolve เป็นไฟล์จริงครบ (0 dead)
- **consistency skill ↔ command ↔ playbook:** skill กับ command ที่คู่กัน (เช่น `/update-codemaps` skill ↔ `/warnyin:update-codemaps` command) ต้องชี้ playbook **เดียวกัน** — กัน adapter 2 ตัวหลุดออกจากแก่นเดียวกัน
- **เจตนา command-only:** stage/irreversible command (build/ship/…) ต้อง **ไม่** ถูกแปลงเป็น skill auto-invoke — ตรวจ note ใน command + `git diff` ว่าไม่มี skill ของ stage เหล่านั้น

## เปิด allowlist entry ใหม่ใน verify-pack — ลำดับ atomic (L3: topic `skill-format`)
> เพิ่ม path เข้า `ALLOWED_PREFIX` (เช่นเปิด `src/.claude/skills/`) ทำให้ test guard เดิมที่ assert path นั้น "= leak" **แดงทันที** + อาจทำ R1 baseline แดง — ต้องแก้แบบ atomic ไม่ใช่ลบ assertion
- **leak-example case ต้องเปลี่ยน ไม่ใช่ลบ** (config-protection) — เคสที่พิสูจน์ "allowlist จับ leak" ต้องเปลี่ยนตัวอย่างไปเป็นพาธที่ **ยังนอก allow จริง** (เช่น `src/.vscode/`, `src/.idea/`) — ห้ามลบเคสทิ้ง (gate จะหลวมเงียบ)
- **เพิ่ม R1 required-assert** สำหรับ payload ใหม่ (`hasSkills` แบบ `hasWarnyin`/`hasClaude`, prefix กว้าง `src/.claude/skills/`) — กัน payload หล่นเงียบ (บทเรียน nested-dotfolder R1); **เพิ่มเคสใหม่** ไม่ rename เคสเดิม (คง coverage R1 ของ payload อื่น)
- **ลำดับ atomic กัน intermediate red:** เติม path ใหม่ใน **GOOD baseline ก่อน** เพิ่ม `hasX` assertion (ไม่งั้นเคส `deepEqual([])` ของ GOOD แดง) → จากนั้นเปิด `ALLOWED_PREFIX` + assertion → แก้ leak-example case ทีหลัง (พิสูจน์ตอน dry-run: B1/B2/B3)

## executable migration proof (เทสเอกสาร migration / CHANGELOG)
> เอกสาร migration (CHANGELOG "Migration guide") เป็น **คำสั่งที่ผู้ใช้รันจริง** — ต้องเทสแบบ executable ไม่ใช่อ่านเฉยๆ (บทเรียน `troubleshooting.md` #10)
- **วิธี:** ใน git repo จำลอง (temp) → สร้าง legacy layout (เช่น `warnyin/{workflow,template,installer,stages/<topic>}`) → **รันคำสั่งในเอกสารตามตัวอักษร** → assert: งานจริงอยู่ที่ `docs/stages/<topic>/` (ไม่หาย/ไม่ซ้อน `docs/stages/stages/`), ได้ `.warnyin/workflow`, รัน installer ซ้ำแล้ว **ไม่ warn legacy อีก**
- **ต้องเทส 2 ลำดับ:** (1) **migrate-ก่อน-install** (ลำดับแนะนำ) (2) **install-ก่อน-migrate** (สถานการณ์จริง — ผู้ใช้เห็น warning หลังรัน installer แล้ว `docs/stages/` ถูกสร้างไปก่อน) — คำสั่งต้องผ่านทั้งคู่
- **ต้องเทสทุกรุ่น legacy** ที่ `cli.mjs` ตรวจจับ (≤0.2.x, 0.3–0.5.x)
- **cross-platform / leak guard:** รันใน temp (`mktemp -d`) เท่านั้น — **ห้ามรัน `cli.mjs` ที่ cwd=repo root** (`troubleshooting.md` #6 dogfood leak); ใช้ `git mv <src>/* <dest>/` (ย้าย contents) — ไม่ใช่ `git mv <src> <dest>` (ซ้อน)
