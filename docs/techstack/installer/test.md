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

## เคสที่ test suite ครอบ (รวม suite 85 เคส — bare discovery เจอครบ; หลักด้านล่าง)

### `src/tests/installer.test.mjs` — 21 เคส (black-box, spawn `src/bin/cli.mjs`; 9 ฐาน + 8 global + 4 version stamp)
1. ติดตั้งสด — โครงครบ (`.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`, `.claude/skills/update-codemaps/SKILL.md`, `docs/stages`, `docs/project.md`, `CLAUDE.md`, `AGENTS.md`)
2. idempotent — รัน 2 ครั้ง byte-equal + ไม่ append ซ้ำ (`stdout` มี "ข้าม")
3. `--update` ไม่ทับงานจริง — `docs/project.md`/`docs/stages/demo/` คงเดิม
4. `installRootDoc` append section + ไม่ append ซ้ำ (marker)
5. legacy 0.3–0.5.x → warn ที่ `stderr` (string ตรงจาก `cli.mjs`)
6. legacy ≤0.2.x → warn ที่ `stderr` (คนละ string จากเคส 5)
7. `seedDocs` ข้าม `[...]` (negative — ไม่มี path ใต้ `docs/` ขึ้นต้น `[`)
8. `--dry-run` ไม่เขียนไฟล์ (temp ยังว่าง)
9. **scaffold สร้างเปล่า ไม่ leak `docs/stages/<topic>`** — มี `context.md`+`achieved/.gitkeep` แต่ไม่มี topic ของ repo ต้นทาง
10–17. global mode (8 เคส — ดู feature `global-install`)
18–21. **version stamp** (a) project install → `.warnyin/.warnyin-version` = pkg version จริง + match semver · (b) `--dry-run` → ไม่เขียน stamp · (c) `--update` ซ้ำ → byte-equal (idempotent, ไม่ assert stdout "ข้าม") · (d) global → `home/.warnyin/.warnyin-version` ตรงเวอร์ชัน — **อ่าน pkg version สดจาก `package.json` ไม่ hardcode** (กัน tautology)

### `src/tests/verify-pack.test.mjs` — 11 เคส (unit, import `checkFiles` ตรง — BL-4 testable denylist)
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
11. **stamp-deny:** `checkFiles(['.warnyin/.warnyin-version'])` (root) → คืน error (gate จับ stamp ที่หลุดขึ้น tarball — install-time artifact ไม่ควรอยู่ใน package)

### `src/tests/setup-dogfood.test.mjs` — 14 เคส (unit, import ตรง — BL-4 testable; truth table + drift-guard)
1–3. ฐาน (backward compat): `verifyInstalled(tmp)` ไม่มี expected → marker-only (เคส empty→false, ครบ→true, partial→false)
4. **drift→false (แก่น):** stamp `0.1.0` + `verifyInstalled(root,'9.9.9')` → false + warn drift (mirror partial→false; ตัวจับ false-green รอบ 2)
5. match: stamp=expected → true · 6. transition: stamp ขาด → true · 7. degrade: expected `null`/`''` → true
8. **CRLF:** stamp `"<ver>\r\n"` + expected `"<ver>"` → true (Windows-safe)
9–11. `parseNpmViewVersion`: noise `"npm warn x\n<ver>\n"`→`<ver>` · empty→null · ไม่ใช่ semver→null
12. `readStamp` whitespace-only → null · 13–14. **wire-proof (structural):** source มี `verifyInstalled(repoRoot, expected)` ทั้ง `installViaNpx` + `installViaPack`

### `src/tests/lint-md.test.mjs` — 7 เคส (unit, import `checkLinks` ตรง — BL-4 testable)
1. good link (exists→true) → `deepEqual([])`
2. dead link (exists→false) → error มี target
3. link ใน **inline-code** `` `[x](y)` `` → ข้าม (ไม่ error แม้ exists→false)
4. link ใน **fenced code** → ข้าม
5. `http(s)://` / `mailto:` / `#anchor` → ข้าม
6. `path#sec` (path exists) → ไม่ error (ตัด anchor ก่อนเช็ค path)
7. fake `exists` injectable → resolved path ถูกส่งเข้า (ไม่แตะ fs จริง)

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

## verify payload workflow script (agent-driven, harness-wrapped) (L: topic `build-wave-branch-fix`)
> script ใน `.warnyin/workflow/scripts/` ที่มี `export const meta` + ใช้ globals harness inject (`args`/`agent`/`parallel`/`log`/`phase`) เช่น `build-wave.mjs` — ต่างจาก dev-tooling `src/scripts/*.mjs` (standalone) — verify ต่างกัน
- **อย่าใช้ `node --check` standalone เป็น gate** — fail ด้วย `Illegal return statement`/`Unexpected token export` เพราะ top-level return + export ที่ valid เฉพาะตอน harness wrap (ดู `docs/troubleshooting.md` #16); ก่อนแก้ก็ fail = ไม่ใช่ regression
- **runtime proof แทน:** สกัดฟังก์ชันที่แก้ (เช่น `prompt()`) → รันใน sandbox ด้วย `new Function(body)` inject globals → assert **behavior + ordering ที่ runtime** (เช่น step ที่ `splice`/`unshift` แทรกอยู่ก่อน step อื่นจริง — แข็งกว่า grep source line เพราะลำดับ runtime ต่างจาก source); + syntax สะอาดด้วย module-parse หลัง neutralize top-level return
- **gate จริงที่เชื่อถือได้:** `npm test` + `npm run verify:pack` (script ยังติด tarball ผ่าน allowlist `src/.warnyin/`) — ไม่พึ่ง `node --check`
- **git-mechanics ใน prompt (เช่น `git merge`):** พิสูจน์ assumption ใน **git sandbox จริง** (`mktemp -d` + `git init` + จำลอง branch graph) ไม่ใช่อ้างในเอกสาร — เช่น fast-forward เมื่อ main เป็น ancestor ของ build branch

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

## verify version-stamp / drift-aware install (L: topic `setup-dogfood-version-check`)
> feature ที่ installer เขียน artifact (version stamp) แล้ว dev-tooling verify ด้วย artifact นั้น — verify behavioral ผ่าน cli/verifyInstalled จริง (มากกว่า unit)
- **stamp install proof (executable):** `npm run setup:sandbox` (spawn `cli.mjs` จริง) → `<sandbox>/.warnyin/.warnyin-version` = `package.json` version จริง; global mode → `cli.mjs --global` (override **ทั้ง `HOME`+`USERPROFILE`**=temp) → `<home>/.warnyin/.warnyin-version`; `--dry-run` → ไม่มีไฟล์ stamp
- **drift-guard behavioral (ต้องมีคู่ true/false — กัน return คงที่):** สร้าง temp root + CORE markers + stamp ปลอม → `verifyInstalled(root, expected)` ครบ truth table: stamp `<old>` + expected `<new>`→**false** + warn drift (mirror partial→false) · stamp=expected→true · stamp ขาด→true(transition) · expected falsy→true(degrade) · CRLF stamp→true. **drift-test ต้องใช้ expected ที่ต่างจาก stamp ชัด** (ห้าม derive จาก stamp เดียวกัน = tautology)
- **external-version parse (pure fn ไม่ spawn):** `parseNpmViewVersion(stdout)` ป้อน stdout ปลอม (noise ปน/empty/ไม่ใช่ semver) — unit ตรงไม่ต้อง network; `resolveExpectedVersion` จริง (network) = smoke เสริม (`npm view` → semver)
- **wire-proof (structural):** assert source `setup-dogfood.mjs` ส่ง `expected` เข้า `verifyInstalled` ทั้ง `installViaNpx` + `installViaPack` (กัน drift ตายเงียบบน pack/Windows)
- **packaging:** stamp = install-time artifact → `checkFiles(['.warnyin/.warnyin-version'])` คืน error + `npm pack --dry-run --json` ยืนยัน stamp ไม่อยู่ใน file list (Windows: `verify:pack` ENOENT = KB#4 → ใช้ unit gate + `npm pack` แทน)
- **★ transition snapshot (self-referential verify):** integration end-to-end (`setup:dogfood` จริงจับ drift) = **defer รอ publish ≥2 release ที่มี stamp**; VERIFY พิสูจน์ *logic ถูก* (drift→false ใน temp) + **บันทึก snapshot จริง** ว่า ณ ตอน verify registry `@latest` มี stamp หรือยัง — ห้ามเคลมจับ drift end-to-end ได้ก่อนถึงรอบที่ artifact มีจริงบน registry

## executable migration proof (เทสเอกสาร migration / CHANGELOG)
> เอกสาร migration (CHANGELOG "Migration guide") เป็น **คำสั่งที่ผู้ใช้รันจริง** — ต้องเทสแบบ executable ไม่ใช่อ่านเฉยๆ (บทเรียน `troubleshooting.md` #10)
- **วิธี:** ใน git repo จำลอง (temp) → สร้าง legacy layout (เช่น `warnyin/{workflow,template,installer,stages/<topic>}`) → **รันคำสั่งในเอกสารตามตัวอักษร** → assert: งานจริงอยู่ที่ `docs/stages/<topic>/` (ไม่หาย/ไม่ซ้อน `docs/stages/stages/`), ได้ `.warnyin/workflow`, รัน installer ซ้ำแล้ว **ไม่ warn legacy อีก**
- **ต้องเทส 2 ลำดับ:** (1) **migrate-ก่อน-install** (ลำดับแนะนำ) (2) **install-ก่อน-migrate** (สถานการณ์จริง — ผู้ใช้เห็น warning หลังรัน installer แล้ว `docs/stages/` ถูกสร้างไปก่อน) — คำสั่งต้องผ่านทั้งคู่
- **ต้องเทสทุกรุ่น legacy** ที่ `cli.mjs` ตรวจจับ (≤0.2.x, 0.3–0.5.x)
- **cross-platform / leak guard:** รันใน temp (`mktemp -d`) เท่านั้น — **ห้ามรัน `cli.mjs` ที่ cwd=repo root** (`troubleshooting.md` #6 dogfood leak); ใช้ `git mv <src>/* <dest>/` (ย้าย contents) — ไม่ใช่ `git mv <src> <dest>` (ซ้อน)

## verify build-orchestration / DAG-width change (L: topic `improve-performance`)
> change ที่แตะ DESIGN/BUILD orchestration (toolkit, critical-path gate, model routing, lean verify) — ขยายจาก "payload `.md`" + "payload workflow script"
- **model-routing runtime proof (`build-wave.mjs`):** สกัด pure helper `normalizeTasks`/`buildOpts` ด้วย `new Function` (inject `RESULT_SCHEMA` stub) → assert: `string[]` เดิม→opts ไม่มี key `model` (backward compat) · `{name,model}`→`opts.model` = pass-through ตรงตัว (ไม่ map/hardcode) · `{name}`→ไม่มี key `model` · shared-tree→ไม่มี `isolation`/`model` key; รันทั้ง body ด้วย `AsyncFunction` (top-level await — `troubleshooting.md` #16)
- **payload generic boundary:** grep ชื่อรุ่นจริงของ harness ใน payload (`src/.warnyin/workflow/contexts/`, `template/`, `build-wave.mjs`) → **ต้องว่าง**; ชื่อรุ่นปรากฏเฉพาะ adapter (`src/.claude/commands/warnyin/build.md`) — กัน tier→model map รั่วเข้า payload (`docs/rule.md` §1)
- **empirical DAG-width proof (structural/observable — gate ตัดสิน, wall-clock = informational):** redesign DAG ของ achieved topic จริง (เช่น `scaffold-foundation`) ด้วย toolkit ใหม่ใน **sandbox doc** (อ่าน example read-only — ห้ามแก้ `example/`) → assert **DAG ใหม่มี ≥1 wave ที่ task >1** (เทียบ baseline chain depth) + decouple มี **หลักฐานจริง** (มี contract artifact เช่น `openapi.yaml`/stub type รองรับ — ไม่ใช่สมมุติ); 2nd data point = DAG ของ topic ที่กำลัง build เอง
- **critical-path gate = judgment ไม่ใช่ validator:** ยืนยัน gate item อยู่ใน `design.md` Gate §8 (judgment) + template §7 (ช่อง depth/width) — **ไม่** เพิ่ม mechanical check ใน `validate-topic.mjs` (gate นี้ reviewer ตีความ)
- **full-gate ยัง blocking:** grep `build.md` ยืนยัน lean self-verify (§3 ข้อ 4 scope component) **ไม่** ลด full-gate (§3 ข้อ 8 / §4 ข้อ 6) เป็น optional/informational

## verify change-sizing / judgment-rubric capability (L: topic `change-sizing-router`)
> change ที่เพิ่ม **judgment router** (rubric ตัดสิน tier/route จากคำอธิบาย ไม่มี runtime ให้รัน — เช่น `triage.md`) — capability เป็น "AI อ่าน rubric แล้วตัดสิน" → verify ด้วย **empirical observable demo** (รัน rubric กับเคสตัวอย่าง) + structural + consistency; **gate ตัดสิน = structural/observable, wall-clock = informational** (เหมือน empirical DAG-width)
- **empirical demo รัน rubric กับเคส (observable ไม่ใช่ AI-judgment ลอย):** ป้อนคำอธิบาย change ตัวอย่าง → assert tier+route ที่ rubric ให้ตรงเจตนา: (1) **fast** — งานเล็ก modify 1-2 ไฟล์ ไม่ sensitive → tier `fast` + route fast-track; (2) **hard-floor ครบทุกหมวด** — เดิน **≥1 เคสต่อหมวด** (5 หมวด) → ทุกเคสต้อง ≥ standard (observable: รายงานไม่มี tier fast); (3) **escalation** — วัดที่ artifact ปลายทางครบ (ไม่ใช่ที่ AI ตัดสิน)
- **deterministic ceremony-count (fast ลด ceremony):** นับ #stage-artifact: standard (N) vs fast (M) → assert **M < N และ fast ข้ามครบ ≥3** จาก {`business.md`, review panel, dry-run, multi-task} — mirror pattern empirical DAG-width "≥1 wave>1" (นับได้ ไม่ขึ้นกับ wall-clock)
- **read-only executable:** command adapter (`triage.md`) **0 write-intent** (grep ไม่พบ Write/Edit/สร้างไฟล์) + body ระบุ "แนะนำแล้วหยุด" → รันแล้ว `git status` สะอาด
- **canonical-copy + anchor (consistency):** rubric wording ใน playbook ตรง `design.md §3` **คำต่อคำ** (diff = ว่าง — grep key อย่างเดียวจับ wording ขัดไม่ได้); **anchor resolve = ตรวจด้วยตา/structural** — heading `## Fast-track skip-list` slug ตรง link `../triage.md#fast-track-skip-list` (`lint-md` strip anchor ไม่ validate ว่า anchor resolve — ดู `lint-md.test.mjs` #6); pointer hook ทุก stage (design §7/verify/ship) ชี้ canonical **ไม่ inline rubric** (grep 0 table)
- **install proof (เหมือน payload `.md`):** `setup:sandbox` → target มี `triage.md` playbook + command + `/warnyin:triage` ใน CLAUDE.md list + README capability; root dogfood ไม่โดนแตะ

## verify installer global mode / homedir write (L: topic `global-install`)
> change ที่ทำให้ installer เขียน **นอกโปรเจกต์ (`~/`)** — verify ด้วย black-box spawn + **HOME/USERPROFILE override → temp** (กัน side-effect เขียน homedir จริงของ dev/CI) + empirical executable proof
- **harness ขยาย `runCli(cwd, args, env)`** — spawn ด้วย `env` merge; เคส global ส่ง `{...process.env, HOME: tmp, USERPROFILE: tmp}` (**ทั้งคู่** — POSIX อ่าน HOME, Windows อ่าน USERPROFILE); **assert side-effect อยู่ที่ `tmp`** (path ขึ้นต้นด้วย tmp) ไม่ใช่ homedir จริง — กัน false-pass ถ้า override ไม่ติด. เคสเดิมไม่ส่ง `env` → inherit เดิม (backward compat)
- **empirical executable (รันจริง temp HOME):** (1) `--global` → `~/.warnyin/workflow/` + `~/.claude/commands/warnyin/` + `~/.claude/CLAUDE.md` (marker `<!-- warnyin:global-note -->`) + **skip scaffold** (ไม่มี `docs/stages/` ใน HOME); (2) **ไม่ทำลายไฟล์ user** — temp HOME มี `~/.claude/agents/<x>.md`+`CLAUDE.md` (เนื้อ user) อยู่ก่อน → `--global` first-install → ไฟล์ user คงอยู่ + CLAUDE.md append ไม่ทับ; (3) **idempotent** — รัน 2 ครั้ง → marker เดียว; (4) **homedir guard** — `HOME=/ --global` → exit ≠ 0
- **non-TTY CI-safe (กัน CI hang):** spawn no-flag (`spawnSync` = non-TTY) + **`{timeout: N, input: ''}`** → assert exit 0 + `signal !== 'SIGTERM'` (ไม่ค้าง) + ลง cwd (project) — ถ้า isTTY-guard พลาด readline จะค้างถาวร = test hang ไม่ใช่ fail ที่อ่านได้ จึงต้องมี timeout
- **pure-fn `resolveMode()` unit** — `{globalFlag,projectFlag}`→throw · `{globalFlag}`→'global' · `{isTTY:false}`→'project' · `{isTTY:true,answer:'2'}`→'global' — unit ได้โดยไม่ spawn TTY (logic แยกจาก readline); **export ของ pure-fn ใน cli.mjs ใช้ main-guard** (`path.resolve(process.argv[1])===cli`) → import จาก test ไม่ trigger main()
- **pass-count gate:** เคส global **ห้าม conditional-skip** (CI linux → HOME override deterministic) — เพิ่มเคสใหม่เท่านั้น (`pass===tests` ยังจริง, `MIN_PASS` floor ไม่ต้อง bump); regression เคสเดิม 1-9 ไม่แก้ assertion (atomic)
- **CLAUDE.global.md note-only** ติด tarball ผ่าน allowlist `src/.warnyin` เดิม (ไม่ต้องแก้ packaging); path ใน root doc เป็น **inline-code (backtick) ไม่ใช่ markdown-link** (กัน `lint:md` dead-link — `installer/templates/` ถูก scan ไม่อยู่ใน EXCLUDE)

## verify Discovery modes / playbook behavior-dial (L: topic `discovery-mode-selector`)
> change ที่เพิ่ม **behavior mode** ใน playbook (`discovery.md §3.5` — taxonomy + auto-suggest + multi-agent orchestration) — payload `.md` ที่ AI follow ไม่มี runtime → verify **observable proxy + structural + install proof** (ขยายจาก "payload `.md`" + "judgment-rubric")
- **observable proxy ต่อ mode (นับได้ เทียบ baseline `สมดุล`):** assert proxy ที่ falsifiable — `ไว`=ถาม≤K+skip branch≥1; `ละเอียด`=เดินครบทุกกิ่ง+grill turn≥1; `โต้วาที`=Agent-call≥3(persona)+entry "สังเคราะห์จาก debate"+cap≤4/≤2; `ไต่สวน`=มี `debate/{blue,red-memory,debate-round-NN}.md`≥1+Red fan-out role audit 5 มุม+grill ทุก finding+ถาม user ก่อนรอบ+converge — **ไม่ใช่ AI-judgment ลอย** (mirror change-sizing deterministic count)
- **auto-suggest fixture (deterministic precedence):** เดินเคส fixture (`§3.5.4`) → assert mode ตรงตาราง โดยเฉพาะ **signal ขัดกัน** "เล็ก+ชัด แต่แตะ auth → `สมดุล`" (precedence 1 hard-floor ทับ precedence 4); multi-match keyword → fall through auto-suggest (ไม่ first-match เงียบ)
- **3-way anchor consistency:** section anchor "Discovery modes (ความเข้มของ Discovery)" ตรงกัน playbook (heading) ↔ command ↔ README (grep count) — pattern canonical-copy/anchor เดียวกับ change-sizing
- **no-duplicate (แยก alias vs behavior):** command/README **มี** keyword-alias map ได้ (ชอบ) แต่ **ห้ามมี** behavior contract/auto-suggest table ซ้ำ (grep behavior/Observable/Precedence table = 0) — กัน false-green ของ "grep ชื่อ mode"
- **grill regression (fold ที่ไฟล์เดิม):** grep ยืนยันไม่เหลือ section grill แยก (fold เป็น alias `ละเอียด`); keyword "ซักถามฉันหน่อย"/"grill me" → `ละเอียด` ยังทำงาน (backward-compat)
- **multi-agent fallback = structural (ไม่ spawn จริง):** verify อ่าน playbook เห็น fallback instruction + เงื่อนไข trigger ชัด (spawn ไม่ได้/เครื่องไม่มี Agent tool/skeptic หาย) + observable signal เมื่อ degrade (แจ้ง user) — **full spawn-real proof = optional/defer ถ้า token จำกัด** (debate/ไต่สวน เป็น Agent-tool call ใน playbook ไม่ใช่ Workflow script → ไม่มี runtime ให้ inject; พิสูจน์ตอนใช้จริงรอบแรก)
- **install proof + dogfood note:** `setup:sandbox` → target มี `§3.5` + command mode + README; **verify ที่ `src/` (ที่เพิ่งแก้) ไม่ใช่ root dogfood stale** (กัน false-green) — root regen ตอน release
- **generic boundary:** grep playbook ไม่ผูกชื่อรุ่น model (persona/tier vocab generic) — multi-agent ระบุ role generic ไม่ vendor

## verify dev-tooling install script (setup-*.mjs) (L: topic `fix-setup-dogfood`)
> dev-tooling ที่ spawn external install (`setup-dogfood.mjs`: npx/npm pack) — verify ด้วย **unit (pure-fn) + structural + false-green guard** (ไม่ต้อง spawn install จริงทุกครั้ง — เหมือน BL-4 testable)
- **unit `verifyInstalled(root)` (export + main-guard):** temp dir → 3 เคส falsifiable: เปล่า→`false` · CORE ครบ (`.warnyin/workflow/stages/discovery.md` + `.claude/commands/warnyin`)→`true` · **partial (ขาด `.claude/commands/warnyin`)→`false`** (เคส partial = false-green guard, พิสูจน์ "ไม่เชื่อ exit 0" ทำงาน); import จาก test ไม่ trigger install (main-guard `argv[1]===fileURLToPath`)
- **structural:** grep `--update` ส่งทั้ง npx + node paths · `verifyInstalled(repoRoot)` wire success-detection ทั้ง 2 path (`status===0 && !shimMissing && verifyInstalled`) · main-guard มีจริง
- **regression:** `npm test` ทั้ง suite เขียว (`check-test-count`: `pass===tests`, `pass≥9` — เพิ่มเคสใหม่ไม่ลด count); `lint:md` (CHANGELOG)
- **executable integration = defer:** รัน `npm run setup:dogfood` จริง → root CORE = release version (spawn npx/npm + network) — manual proof ตอน release ถัดไป; unit + structural ครอบ logic แล้ว

## verify action-utility command (outward side-effect) (L: topic `feedback-issue-command`)
> command ที่มี **side-effect ออกนอกเครื่อง** (เปิด GitHub issue ฯลฯ) — payload `.md` + nested adapter — verify เชิงโครงสร้าง + install proof + observable behavior **โดยไม่ trigger side-effect จริง** (ไม่ยิง issue ขึ้น public; เลี่ยง irreversible)
- **install proof:** `npm run setup:sandbox` → target มี nested command (`.claude/commands/warnyin/<group>/<action>.md`) + playbook (`.warnyin/workflow/<x>.md`) + registry (slash-command list ใน CLAUDE.md จาก **installer template** + README capability); root dogfood ไม่โดนแตะ
- **frontmatter + pointer:** adapter มี `description`+`argument-hint` + ใช้ `$ARGUMENTS` + ชี้ playbook กลาง (บางไม่ duplicate) + confirm-gate note ใน body
- **observable behavior (playbook flow — grep keyword):** flow ครอบครบ — branch ของ flow (เช่น 3 ประเภท + title prefix), detect ladder (gh exist→`gh auth status`→fallback URL), confirm gate, privacy (no-session-pull), best-effort label retry — pattern observable-proxy เดียวกับ Discovery modes
- **command-only intent:** `ls src/.claude/skills/ | grep <name>` = ว่าง (action-utility = command user-only ไม่ auto-invoke — เหมือน "เจตนา command-only" ของ stage command)
- **consistency:** contract (command id/path/description/prefix) ตรง adapter ↔ registry (CLAUDE template/README/CHANGELOG) คำต่อคำ
- **regression additive:** command/utility เดิมใน list ครบ (ไม่ถูกลบ)
- **no real side-effect proof:** ตรวจ gh command/fallback URL ประกอบถูกเชิงโครงสร้าง (urlencode) — ไม่รันยิงจริง (confirm gate กันตอนใช้จริง)
