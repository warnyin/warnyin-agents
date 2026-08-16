# Spec — upgrade-path-test

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> เทส **upgrade path** ของ installer (black-box) + **mutant harness** — ไฟล์เดียว: `src/tests/installer-upgrade.test.mjs`
> **canonical ที่เทสต้อง assert = `design.md §4` contract C1–C15** (ห้ามอ่านโค้ดของ slice `prune` มาเขียน expected)

## 1. ชนิดของ task
`test` (black-box integration + mutation testing) — ไม่มี production code ในขอบเขต

---

## 2. API SPEC
ไม่เกี่ยว — surface ที่เทสคือ CLI (`node <cli> [--update|--global|--dry-run|--no-prune]`) + side-effect บนไฟล์ระบบ + stdout/stderr + exit code

## 3. UX/UI SPEC
ไม่เกี่ยว (ยกเว้น **รูปแบบ output ที่ assert** ตาม C15: `  − <path>` U+2212 · `  ⚠ <path> [<reason>]` · `จะลบ:` · `สรุป: สร้างใหม่ N · อัปเดต N · ข้าม (มีอยู่แล้ว) N · ลบ N`)

## 4. Data-flow (fixture pipeline — บังคับ)

```
repo/src/  ──copyDir──▶  <pkgOld>/src/          + <pkgOld>/package.json {version:'0.29.9'}
                              └─ เติม 2 ไฟล์ที่ถูกยุบกลับ:
                                 src/.warnyin/template/stages/[topic]/test.md
                                 src/.warnyin/template/stages/[topic]/verify.md
        ──spawn <pkgOld>/src/bin/cli.mjs──▶  <target>   (install ของ "รุ่นเก่า" 100% ของจริง)
        ──เติมของผู้ใช้/แต่ง manifest ตามเคส──▶
        ──runCli(<target>, ['--update'])──▶  cli จริงใน repo (payload ใหม่ = ของจริง 100%)
        ──assert side-effect──▶ ไฟล์หาย/อยู่ · stdout · exit code · manifest
```

**ข้อบังคับของ fixture (จาก panel — ละเมิดไม่ได้):**
- **ห้าม mini-payload ที่ผู้เขียนเทสแต่งขึ้นเป็นเคสหลัก** — pkg เก่าต้องเป็น **copy `src/` ทั้งก้อน** (KB #32 ยกระดับ: fixture ที่แต่งเองพิสูจน์ได้แค่ว่าโค้ดตรงกับจินตนาการของผู้เขียน)
- payload ใหม่ต้องมาจาก **`cliPath` ของ repo** เท่านั้น (ยกเว้นเคส mutant ที่ใช้ cli กลายพันธุ์โดยเจตนา)
- `<pkgOld>/package.json` version ต้อง **< `0.30.1`** (ใช้ `0.29.9`) เพื่อให้ `.warnyin-version` stamp เข้าเงื่อนไข C14
- **fixture A** = หลัง install เก่า **ลบ `.warnyin/.warnyin-manifest`** (จำลอง install ≤`0.29.x` ที่ยังไม่มี manifest) → บังคับเส้น **known-stale** (C14)
- **fixture B** = **คง manifest** ที่ pkg เก่าเขียนไว้ → บังคับเส้น **hash** (C7)
- ห้ามแก้ `.warnyin-version` ให้เป็นรุ่นใหม่ในเคส fixture A (จะปิด C14 เงียบ ⇒ เทสเขียวโดยไม่ทดสอบอะไร)

## 5. User-flow
ผู้ใช้ที่ติดตั้ง warnyin ไว้ตั้งแต่ ≤`0.29.x` → รัน `npx @warnyin/agents --update` → คาดว่าได้ payload รุ่นใหม่ **สะอาด** (ไม่มีไฟล์ตกรุ่นค้าง) โดยงานของตัวเอง (`docs/`, agent/skill ที่ติดตั้งเอง) **ไม่หายแม้แต่ไฟล์เดียว**

## 6. Persona
- **ผู้ใช้ warnyin ที่อัปเกรดข้ามรุ่น** — คนที่บั๊กนี้ทำร้าย และคนที่จะเสียหายที่สุดถ้า prune ลบผิด
- **maintainer** — ต้องการ regression net ที่จับ "prune ตาย/prune ลบเกิน" ได้ทุก release

## 7. Test-flow

### 7.1 Harness ที่ต้องมีในไฟล์ (helper ภายใน — ห้าม import จาก `installer.test.mjs`)
| helper | หน้าที่ |
|---|---|
| `makeTempProject(t)` | mkdtemp + `t.after(rm)` — copy pattern จาก `installer.test.mjs:25-29` |
| `runCli(cwd, args, env)` | spawn `cliPath` ของ repo (array args, ห้าม `shell:true`) — `installer.test.mjs:31-39` |
| `globalEnv(home)` | `{...process.env, HOME: home, USERPROFILE: home}` — **ทั้งคู่** (`installer.test.mjs:49-51`) |
| `listFiles(dir)` | เก็บ path ทุกไฟล์ (relative) ใช้ diff ก่อน/หลัง — `installer.test.mjs:59-66` |
| `ok(r, msg)` | assert `code===0` + surface stderr/stdout |
| `copyDir(src, dest)` | recursive copy `src/` → `<pkgOld>/src` (zero-dep: `readdirSync withFileTypes` + `mkdirSync recursive`) |
| `makeOldPkg(t)` | `copyDir` + เขียน `package.json {version:'0.29.9'}` + เติม 2 ไฟล์ known-stale → คืน path ของ pkg |
| `installOld(pkgOld, target, args)` | spawn `<pkgOld>/src/bin/cli.mjs` (ห้ามใช้ `cliPath`) |
| `fixtureA(t)` / `fixtureB(t)` | ประกอบ target ตาม §4 แล้วคืน `{target, pkgOld}` |
| `manifestPath(target)` | `path.join(target,'.warnyin','.warnyin-manifest')` |
| `writeManifest(target, lines)` | เขียน manifest ปลอมตามเคส (LF, header 1 บรรทัด) |
| `sha256OfFile(abs)` | `createHash('sha256')` บนเนื้อไฟล์ (LF อยู่แล้วหลังติดตั้ง) — ใช้แต่ง entry ที่ hash **ตรง** |
| `mutantRun(t, {find, replace, prepare, args})` | ดู §7.3 |

### 7.2 เคส black-box (U1–U20)

| # | เคส | Setup | Expected |
|---|---|---|---|
| **U1** | known-stale ถูกลบ (fixture A) | fixture A | `[topic]/test.md` + `verify.md` **หายทั้งคู่** · stdout มีบรรทัด `  − ` ระบุทั้ง 2 path (POSIX form) · สรุปมี `ลบ 2` · exit 0 |
| **U2** | เส้น hash ถูกลบ (fixture B) | fixture B (คง manifest) | เหมือน U1 แต่ผ่าน C7 · ยืนยันว่า **ไม่ได้พึ่ง known-stale** โดย assert เพิ่มว่าไฟล์ปกติอื่นยังครบ |
| **U3** | ของผู้ใช้รอดทุกไฟล์ | fixture B + เพิ่ม `.claude/agents/my-agent.md`, `.claude/skills/playwright-cli/SKILL.md`, `docs/stages/demo/x.md`, แก้ `docs/project.md`, สร้าง **dir ว่างของผู้ใช้** `.warnyin/workflow/user-empty/` | ไฟล์ผู้ใช้อยู่ครบ + เนื้อ `docs/project.md` ไม่เปลี่ยน + **dir ว่างยังอยู่** (C10) · **diff `listFiles` ก่อน/หลัง: ไฟล์ที่หาย = เฉพาะ 2 known-stale** (ไม่ assert รายตัวอย่างเดียว) |
| **U4** | hash mismatch ไม่ถูกลบเงียบ | fixture B + append ข้อความลง `[topic]/test.md` | `test.md` **ยังอยู่** · stdout มี `⚠` + `[hash:mismatch]` + path นั้น · `verify.md` ถูกลบ · สรุป `ลบ 1` (พิสูจน์ว่ารอบเดียวกัน prune ทำงานจริง ไม่ใช่ตายทั้งเฟส) |
| **U5** | manifest ปลอมชี้นอกขอบเขต/ไฟล์ผู้ใช้ | fixture B + เขียน manifest เองที่มี entry: `..`-segment (`.warnyin/workflow/../../outside/victim.md`) · absolute (`<outsideDir>/abs.md`) · backslash (`.warnyin\workflow\bs.md`) · control char (`.warnyin/workflow/victim.md`) · root คล้ายกัน (`.warnyin/workflow-evil/x.md`) · นอก allowlist (`.claude/agents/my-agent.md`) · นอก prunableRoots (`docs/project.md`) — สร้างไฟล์เหยื่อจริงทุกตัว | **ไม่มีไฟล์เหยื่อหายแม้แต่ตัวเดียว** · exit 0 · ทุก reason ที่พิมพ์ต้องอยู่ใน **เซตปิด C15** (assert ด้วย `Set` ของ reason ที่ copy คำต่อคำจาก C15) · มี reason อย่างน้อย `path:dot-segment`, `path:absolute`, `path:backslash`, `path:control-char`, `scope:outside-root`, `scope:not-allowlisted` |
| **U6** | symlink **ancestor** | fixture B + `<outsideDir>/victim.md` + `symlinkSync(<outsideDir>, <target>/.warnyin/template/linked, 'dir')` + manifest entry `.warnyin/template/linked/victim.md` (hash ตรง) | `victim.md` **ยังอยู่** · reason `prune:not-contained` · **ไฟล์ตกรุ่นปกติในรันเดียวกันยังถูกลบ** · Windows สร้าง symlink ไม่ได้ → `console.error(...) + return` (**ห้าม `t.skip`**) |
| **U7** | symlink **leaf** | fixture B + ไฟล์ payload ตกรุ่น 1 ตัวถูกแทนด้วย symlink ชี้ `<outsideDir>/leaf-victim.md` + manifest entry ชี้ path นั้น | ทั้ง **symlink และปลายทางยังอยู่** · reason `prune:symlink` · guard เดียวกับ U6 เรื่อง Windows |
| **U8** | `--global` ครึ่งที่ต้องรอด | temp HOME (`makeTempProject` อีกใบ) + `globalEnv(home)` · install เก่าแบบ `--global` · เพิ่ม `~/.claude/agents/my.md` + `~/.claude/skills/mine/SKILL.md` | ไฟล์ทั้งสอง **ยังอยู่** (C11: global ไม่มี dir แชร์ใน `prunableRoots`) · **assert side-effect อยู่ใน temp**: `existsSync(path.join(home,'.warnyin','workflow'))` เป็นจริง และ **path ทุกตัวที่ assert ขึ้นต้นด้วย `home`** (กัน false-pass เมื่อ override ไม่ติด) |
| **U9** | `--global` ครึ่งที่ต้องลบ | ต่อจาก U8 (setup เดียวกัน คนละเคส) — มี stale ใต้ `~/.warnyin/template/stages/[topic]/{test,verify}.md` | ไฟล์ใต้ `.warnyin/template` **หาย** · สรุปมี `ลบ 2` · exit 0 |
| **U10** | blast cap boundary — 50 | fixture B + ทำให้มีไฟล์ตกรุ่นที่ผ่าน guard ครบ **50 ตัว** (วางไฟล์ใต้ `.warnyin/workflow/legacy-*/` + manifest entry hash ตรง; ไฟล์เหล่านี้ไม่มีใน payload ใหม่) | ลบครบ **50** · ไม่มี `[prune:blast-cap]` · สรุป `ลบ 50` |
| **U11** | blast cap boundary — 51 | เหมือน U10 แต่ **51 ตัว** | **ไม่มีไฟล์ใดหายเลย** (assert ครบทั้ง 51) · stdout มี `[prune:blast-cap]` + จำนวน · exit 0 |
| **U12** | `--dry-run` ยกเว้น cap | state 51 ตัวของ U11 + `--update --dry-run` | stdout มีหัวข้อ `จะลบ:` + บรรทัด `  − ` **ครบ 51** · ไม่มีไฟล์ใดหาย · exit 0 |
| **U13** | `--no-prune` แล้วรอบหน้ายังเห็น stale (C13) | fixture B → `--update --no-prune` → ตรวจ → `--update` | รอบแรก: ไม่มีไฟล์หาย + ไม่มีบรรทัด `−` · **manifest หลังรอบแรกยังมี entry ของ 2 ไฟล์ตกรุ่นพร้อม hash เดิม** (assert บรรทัดตรง ๆ) · รอบสอง: ถูกลบครบ + `ลบ 2` |
| **U14** | `--dry-run` ไม่แตะ manifest | fixture B + อ่าน manifest เก็บ buffer → `--update --dry-run` | manifest **byte-equal** กับก่อนรัน · ไฟล์ payload ครบเท่าเดิม (`listFiles` เท่ากัน) |
| **U15** | **T1 payloadNew semantics** | temp เปล่า → install ด้วย **cli จริง** → `--update` ทันที | `listFiles` ก่อน/หลัง **เท่ากันทุกตัว** (sort แล้วเทียบ) · **ไม่มีบรรทัด `−` เลย** · สรุปมี `ลบ 0` — เคสนี้จับ "payloadNew ผิด ⇒ ลบไฟล์ของตัวเอง" ซึ่งเป็น failure mode ที่แพงที่สุด |
| **U16** | idempotent หลัง prune | fixture B → `--update` (ลบ 2) → `--update` อีกครั้ง | รอบสอง: `ลบ 0` · `listFiles` เท่ากับหลังรอบแรก · manifest **byte-equal** กับหลังรอบแรก |
| **U17** | manifest เสีย (บรรทัดใช้ไม่ได้) | fixture B + เขียน manifest ที่มี: บรรทัดขยะไม่มี separator · `sha256` ไม่ใช่ hex64 · **duplicate path 2 บรรทัด** (hash ต่างกัน) ของไฟล์ payload ที่ยังใช้อยู่ | exit 0 · ไฟล์ payload ที่ใช้อยู่ **ครบ** (duplicate → ทิ้งทั้งคู่ = fail-closed C1) · มี `⚠` · **manifest ถูกเขียนทับเป็นรูปแบบถูกต้อง** — assert ว่าทุกบรรทัดที่ไม่ใช่ `#`/ว่าง match `/^[0-9a-f]{64} {2}\S/` |
| **U18** | manifest เกินเพดาน | 2 sub-assert ในเคสเดียว: (ก) manifest > **1 MB** (pad ด้วยบรรทัด comment) · (ข) manifest > **5000 entry** | ทั้งสองกรณี: exit 0 · ไม่มีไฟล์ payload หาย · มี `⚠` · manifest ถูกเขียนทับใหม่ |
| **U19** | EACCES ระหว่างลบ | fixture B (POSIX) — `chmod 0o500` บน dir ที่มีไฟล์ตกรุ่น 1 ตัว, อีกตัวอยู่ dir ปกติ · `t.after` **restore 0o700 ก่อน rm** | stdout มี `⚠` + `[prune:io]` · ไฟล์ใน dir ปกติ **ถูกลบสำเร็จ** · exit 0 · **guard:** `process.platform==='win32'` หรือ `process.getuid?.()===0` → `console.error(...) + return` (ห้าม `t.skip`) |
| **U20** | install สดไม่ลบอะไร + manifest ถูกสร้าง | temp เปล่า → install ด้วย cli จริง (ไม่มี `--update`) | ไม่มีบรรทัด `−` · สรุปมี `ลบ 0` · มี `.warnyin/.warnyin-manifest` · ทุกบรรทัด entry match `/^[0-9a-f]{64} {2}\S/` · **ไม่มี entry ที่ขึ้นต้น `docs/`** และไม่มี entry ของตัว manifest เอง (C13 ขอบเขต) |

### 7.3 Mutant harness (M1–M12) — **เคสถาวรใน suite ไม่ใช่ manual proof**

**เหตุผล:** โค้ดปัจจุบันไม่มีการลบเลย ⇒ เคส negative ("ไฟล์ยังอยู่": U3/U5/U6/U7/U8/U11) **เขียวตั้งแต่แรก** ⇒ ประโยค "แดงกับโค้ดก่อนแก้" ใช้ไม่ได้กับครึ่งหนึ่งของ suite · mutant harness คือสิ่งเดียวที่พิสูจน์ว่า assertion เหล่านั้น **ไม่กำพร้า**

**ขั้นตอนของ `mutantRun(t, {find, replace, prepare, args})` (ลำดับบังคับ):**
1. `pkg = makeTempProject(t)` → `copyDir(repoSrc, <pkg>/src)` + `package.json` version = version ของ repo (payload = ของจริง)
2. `const original = readFileSync(cliPath,'utf8')` · `const mutated = original.replace(find, replace)`
3. **`assert.notEqual(mutated, original, 'mutation ไม่ติด — anchor เปลี่ยนไปแล้ว ให้ sync find/replace กับ cli.mjs ปัจจุบัน (KB #33)')`** — **fail-loud ก่อนเสมอ; ห้าม `if (…) return` / ห้ามเงียบ**
4. เขียน `mutated` ทับ `<pkg>/src/bin/cli.mjs`
5. `prepare(target)` ประกอบ state ของเคส negative ที่คู่กัน (ใช้ helper ตัวเดียวกับเคส U นั้น — **ห้ามแต่ง state ใหม่**)
6. spawn `<pkg>/src/bin/cli.mjs` ด้วย `args` (default `['--update']`)
7. **assert ว่าเหยื่อ "หายไปจริง"** (`existsSync === false`) — ถ้ายังอยู่ = assertion ของเคส negative กำพร้า ⇒ เทสต้องแดง

**Mutation matrix (guard → mutation → เคสที่ต้องพลิกเป็นแดง):**

| # | guard | intent ของ mutation (neutralize) | anchor ที่ใช้ (`find`) | state ที่ใช้ | เหยื่อที่ต้องหาย |
|---|---|---|---|---|---|
| **M1** | C4 (1) backslash | ปิดการ reject path ที่มี `\` | นิพจน์ที่ตรวจ `\\` ใน rel → แทนด้วยค่าที่ทำให้ผ่านเสมอ | state ของ U5 | ไฟล์ชื่อ `.warnyin\workflow\bs.md` (Windows: กลายเป็น path ซ้อน — assert ตัวที่มีจริงบน platform นั้น) |
| **M2** | C4 (2) dot-segment | ปิดการ reject segment `..`/`.` | เงื่อนไขที่ตรวจ segment `..` | state ของ U5 | `<outsideDir>/victim.md` |
| **M3** | C4 (3) absolute/drive | ปิดการ reject path absolute หรือ `:` ใน segment แรก | เงื่อนไขที่ตรวจ `startsWith('/')` / `:` | state ของ U5 | `<outsideDir>/abs.md` |
| **M4** | C4 (4) control char | ปิดการ reject `\x00–\x1f\x7f` | regex control char | state ของ U5 | `.warnyin/workflow/victim.md` (Windows: `console.error + return`) |
| **M5** | C4 (5) segment-wise root | เปลี่ยนการเทียบ root เป็น `startsWith(root)` เปล่า (ตัด `+ '/'`) | เงื่อนไข `rel === root \|\| rel.startsWith(root + '/')` | state ของ U5 | `.warnyin/workflow-evil/x.md` |
| **M6** | C5 scope allowlist | ปิด allowlist ของ dir ที่แชร์ | เงื่อนไข allowlist `warnyin-*` / รายชื่อ skill dir | state ของ U3 (+ manifest entry hash ตรงของไฟล์ผู้ใช้) | `.claude/agents/my-agent.md` และ `.claude/skills/playwright-cli/SKILL.md` |
| **M7** | C7 hash gate | ปิดการเทียบ hash (ถือว่าตรงเสมอ) | เงื่อนไขเปรียบเทียบ sha256 บนดิสก์ ↔ manifest | state ของ U4 | `[topic]/test.md` ที่ถูกแก้เนื้อ |
| **M8** | C8 ancestor containment | ปิด realpath containment | เงื่อนไข `path.relative(root, parent)` | state ของ U6 | `<outsideDir>/victim.md` |
| **M9** | C8 leaf (`lstat` regular file) | ปิดการเช็คว่าเป็น regular file | เงื่อนไข `isFile()`/`isSymbolicLink()` ก่อน `unlink` | state ของ U7 | ตัว symlink (`existsSync(lstat) === false`) |
| **M10** | C9 blast cap | ยกเพดานจาก 50 เป็นค่าสูงมาก | ค่าคงที่ `50` ในจุดตัดสิน cap | state ของ U11 (51 ไฟล์) | ไฟล์ทั้ง 51 (assert อย่างน้อย 51 ตัวหายครบ) |
| **M11** | C10 empty-dir snapshot | ปิดเงื่อนไข "ต้องไม่ว่างมาก่อนเริ่ม prune" | เงื่อนไข snapshot dir ว่างก่อน prune | state ของ U3 | `.warnyin/workflow/user-empty/` (dir หาย) |
| **M12** | C13 manifest union | ให้ `writeManifest` เขียนเฉพาะ `payloadNew` (ตัด `∪ manifestOld∩onDisk`) | นิพจน์ union ใน `writeManifest` | state ของ U13 (`--no-prune` แล้ว `--update`) | **★ inverse polarity:** เหยื่อคือ **ไฟล์ตกรุ่นที่รอบสอง "ต้องถูกลบ" แต่กลับยังอยู่** ⇒ assert `existsSync === true` พร้อมข้อความอธิบายว่านี่คือขั้วกลับของ M อื่น |

**กติกาของ matrix:**
- ทุกแถวต้องผ่านขั้นตอน 3 (`assert.notEqual`) — **ไม่มีข้อยกเว้น**; anchor ที่ match ไม่ได้ = แดงพร้อมข้อความสั่งให้ไป sync ไม่ใช่เงียบผ่าน
- `find` ควรผูกกับ **สตริง canonical ที่เสถียร** (reason string ของ C15 · ค่าคงที่ `50` · ชื่อ helper ตาม C1/C13) มากกว่าผูกกับ whitespace/รูปแบบโค้ด
- ห้าม mutate ไฟล์ใน repo — mutation เกิดใน temp เท่านั้น (คนละกลไกกับ RED proof แบบแก้ไฟล์จริง; KB #33 ข้อ restore ไม่เกี่ยวเพราะไม่แตะ repo)

### 7.4 กติกาข้ามแพลตฟอร์ม / gate
- **ห้าม `t.skip` ทุกกรณี** — `check-test-count.mjs` fail เมื่อ `pass !== tests`; เคสที่ทำไม่ได้บน platform → `console.error('  ⚠ ข้าม… — platform ไม่รองรับ; CI ubuntu ครอบ') ; return` (pattern `installer.test.mjs:596-607`)
- ทุก path ประกอบด้วย `path.join`; assert ข้อความ stdout ใช้ **POSIX form** ตาม C15
- `cliPath` ต้องมาจาก `fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))` — **ห้าม `.pathname`**
- ห้าม `import` logic จาก `cli.mjs` ในไฟล์นี้ (black-box ล้วน)
