# Spec — upgrade-path-test

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> เทส **upgrade path** ของ installer (black-box ล้วน) — ไฟล์เดียว: `src/tests/installer-upgrade.test.mjs`
> **canonical ที่เทสต้อง assert = `design.md §4` contract C1–C16** (ห้ามอ่านโค้ดของ slice `prune` มาเขียน expected)
> **mutant harness / mutation matrix ไม่อยู่ใน task นี้แล้ว** — ย้ายไป `tasks/mutant-harness/` (wave 2) ตาม `design.md §2` slice 2b

## 1. ชนิดของ task
`test` (black-box integration) — ไม่มี production code ในขอบเขต

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
        ──fixture A: ลบ manifest (ถ้ามี)        ──▶ บังคับเส้น known-stale (C14)
        ──fixture B: writeSyntheticManifest()   ──▶ บังคับเส้น hash (C7)
        ──เติมของผู้ใช้/แต่ง manifest ตามเคส──▶
        ──runCli(<target>, ['--update'])──▶  cli จริงใน repo (payload ใหม่ = ของจริง 100%)
        ──assert side-effect──▶ ไฟล์หาย/อยู่ · stdout · exit code · manifest
```

**ข้อบังคับของ fixture (จาก panel — ละเมิดไม่ได้):**
- **ห้าม mini-payload ที่ผู้เขียนเทสแต่งขึ้นเป็นเคสหลัก** — pkg เก่าต้องเป็น **copy `src/` ทั้งก้อน** (KB #32 ยกระดับ: fixture ที่แต่งเองพิสูจน์ได้แค่ว่าโค้ดตรงกับจินตนาการของผู้เขียน)
- payload ใหม่ต้องมาจาก **`cliPath` ของ repo** เท่านั้น
- `<pkgOld>/package.json` version ต้อง **< `0.30.1`** (ใช้ `0.29.9`) เพื่อให้ `.warnyin-version` stamp เข้าเงื่อนไข C14
- **fixture A** = หลัง install เก่า **ลบ `.warnyin/.warnyin-manifest`** (`rmSync {force:true}` — ป้องกันไว้เผื่อ pkgOld ในอนาคตเขียน manifest ได้) → บังคับเส้น **known-stale** (C14)
- **★ fixture B** = หลัง install เก่า **เรียก `writeSyntheticManifest(target)` เขียน manifest เองด้วย sha256 ที่คำนวณจากไฟล์จริงบนดิสก์** → บังคับเส้น **hash** (C7)
  **เหตุผลที่ต้องเขียนเอง (dry-run จับได้):** `pkgOld` = copy ของ `src/` **ปัจจุบัน** ซึ่ง ณ wave 1 **ยังไม่มีโค้ดเขียน manifest** ⇒ ถ้านิยาม fixture B ว่า "คง manifest ที่ pkg เก่าเขียนไว้" จะ **ไม่มี manifest เลย** ⇒ fixture B ตกไปเส้น known-stale เหมือน fixture A ⇒ **เคสที่ตั้งใจพิสูจน์เส้น hash จะพิสูจน์สิ่งตรงกันข้าม** (degenerate) และจะ degenerate ตลอด wave 1 · การเขียน manifest เองทำให้ fixture B **ไม่ขึ้นกับลำดับ merge ของ slice `prune`** และใช้ได้ทั้งสอง wave
- ห้ามแก้ `.warnyin/.warnyin-version` ให้เป็นรุ่นใหม่ในเคส fixture A (จะปิด C14 เงียบ ⇒ เทสเขียวโดยไม่ทดสอบอะไร)

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
| `writeManifest(target, lines)` | เขียน manifest ปลอมตามเคส (LF, header 1 บรรทัด) — ใช้แต่ง manifest adversarial |
| `writeSyntheticManifest(target, roots)` | **★ ของ fixture B** — เดินทุกไฟล์ใต้ `roots` (default = 5 prunable root ของ project mode ตาม C11) → `<sha256>␠␠<path POSIX>` เรียง A→Z + header `# warnyin manifest v1 — เขียนโดย installer 0.29.9 · ห้ามแก้มือ` · LF เสมอ · sha256 คำนวณจาก **byte บนดิสก์** ซึ่งเป็น LF อยู่แล้วหลังติดตั้ง ⇒ ตรงกับนิยาม "hash หลัง `normalizeEol`" ใน `design.md §3` |
| `addStaleEntry(target, rel, {content})` | เขียนไฟล์ stale เพิ่ม (ไม่มีใน payload ใหม่) + **ต่อ entry ที่ hash ตรงจริง** เข้า manifest — ใช้ในเคส cap / EACCES / symlink |
| `rmKnownStale(target)` | ลบ `.warnyin/template/stages/[topic]/{test,verify}.md` ออกจากดิสก์ เพื่อให้ stale set ของเคส boundary เป็นตัวเลขที่ตั้งใจล้วน ๆ (ดู U10/U11) |
| `sha256OfFile(abs)` | `createHash('sha256')` บนเนื้อไฟล์ — ใช้แต่ง entry ที่ hash **ตรง** |
| `realHomeSnapshot()` | คืน `{'.warnyin': string[]\|null, '.claude': string[]\|null}` ของ **`os.homedir()` จริง** (sorted `listFiles` หรือ `null` ถ้าไม่มี dir) — ใช้เทียบ **set** ก่อน/หลังในเคส `--global` (ดู U8) |

### 7.2 เคส black-box (U1–U20)

| # | เคส | Setup | Expected |
|---|---|---|---|
| **U1** | known-stale ถูกลบ (fixture A) | fixture A | `[topic]/test.md` + `verify.md` **หายทั้งคู่** · stdout มีบรรทัด `  − ` ระบุทั้ง 2 path (POSIX form) · สรุปมี `ลบ 2` · exit 0 |
| **U2** | เส้น hash ถูกลบ (fixture B) | fixture B (**synthetic manifest** ที่มี entry ของทั้ง 2 ไฟล์ พร้อม hash ตรง) | เหมือน U1 แต่ผ่าน C7 · ยืนยันว่า **ไม่ได้พึ่ง known-stale** โดย assert เพิ่มว่า `manifestPath(target)` **มีอยู่จริงและไม่ว่าง** ก่อนรัน (ถ้าไม่มี = fixture degenerate ⇒ assert ต้องแดงพร้อมข้อความ "fixture B ไม่มี manifest") และไฟล์ payload ปกติอื่นยังครบ |
| **U3** | ของผู้ใช้รอดทุกไฟล์ | fixture B + เพิ่ม `.claude/agents/my-agent.md`, `.claude/skills/playwright-cli/SKILL.md`, `docs/stages/demo/x.md`, แก้ `docs/project.md`, สร้าง **dir ว่างของผู้ใช้** `.warnyin/workflow/user-empty/` | ไฟล์ผู้ใช้อยู่ครบ + เนื้อ `docs/project.md` ไม่เปลี่ยน + **dir ว่างยังอยู่** (C10) · **diff `listFiles` ก่อน/หลัง: ไฟล์ที่หาย = เฉพาะ 2 known-stale** (ไม่ assert รายตัวอย่างเดียว) |
| **U4** | hash mismatch ไม่ถูกลบเงียบ | fixture B + append ข้อความลง `[topic]/test.md` **หลัง** `writeSyntheticManifest` (entry จึงถือ hash เก่า) | `test.md` **ยังอยู่** · stdout มี `⚠` + `[hash:mismatch]` + path นั้น · `verify.md` ถูกลบ · สรุป `ลบ 1` (พิสูจน์ว่ารอบเดียวกัน prune ทำงานจริง ไม่ใช่ตายทั้งเฟส) |
| **U5** | manifest ปลอมชี้นอกขอบเขต/ไฟล์ผู้ใช้ | fixture B + **เขียนทับ** manifest เองที่มี entry 7 รูป (ดู §7.2.1) — สร้างไฟล์เหยื่อจริงทุกตัวเท่าที่ platform ทำได้ | **ไม่มีไฟล์เหยื่อหายแม้แต่ตัวเดียว** · exit 0 · ทุก reason ที่พิมพ์ต้องอยู่ใน **เซตปิด C15** (assert ด้วย `Set` ของ reason ที่ copy คำต่อคำจาก C15) · มี reason อย่างน้อย `path:dot-segment`, `path:absolute`, `path:backslash`, `path:control-char`, `scope:outside-root`, `scope:not-allowlisted` |
| **U6** | symlink **ancestor** | fixture B + `<outsideDir>/victim.md` + `symlinkSync(<outsideDir>, <target>/.warnyin/template/linked, 'dir')` + manifest entry `.warnyin/template/linked/victim.md` (**hash = `sha256OfFile(<outsideDir>/victim.md)`** ⇒ ผ่าน C7 แล้วไปตายที่ C8) | `victim.md` **ยังอยู่** · reason `prune:not-contained` · **ไฟล์ตกรุ่นปกติในรันเดียวกันยังถูกลบ** · Windows สร้าง symlink ไม่ได้ → `console.error(...) + return` (**ห้าม `t.skip`**) |
| **U7** | symlink **leaf** | fixture B + ลบ `[topic]/test.md` ทิ้งแล้วแทนด้วย `symlinkSync(<outsideDir>/leaf-victim.md, <target>/.warnyin/template/stages/[topic]/test.md)` + **แก้ entry ของ path นั้นในmanifest ให้ hash = `sha256OfFile(<outsideDir>/leaf-victim.md)`** | **★ hash ต้องตรงกับ _ปลายทาง_ symlink** — ถ้าปล่อยเป็น hash เดิมของไฟล์ที่ถูกแทน C7 จะ reject ก่อน แล้ว reason ที่ได้จะเป็น `hash:mismatch` ไม่ใช่ `prune:symlink` ⇒ เคสพิสูจน์ผิดชั้น · Expected: ทั้ง **symlink และปลายทางยังอยู่** · reason `prune:symlink` · guard เดียวกับ U6 เรื่อง Windows |
| **U8** | `--global` ครึ่งที่ต้องรอด | temp HOME (`makeTempProject` อีกใบ) + `globalEnv(home)` · install เก่าแบบ `--global` (**ไม่มี manifest ⇒ เดินเส้น known-stale**) · เพิ่ม `~/.claude/agents/my.md` + `~/.claude/skills/mine/SKILL.md` | ไฟล์ทั้งสอง **ยังอยู่** (C11: global ไม่มี dir แชร์ใน `prunableRoots`) · `existsSync(path.join(home,'.warnyin','workflow'))` เป็นจริง · **★ assert ต่างชั้น (ไม่ใช่ tautology):** `realHomeSnapshot()` ก่อน/หลัง **เท่ากันแบบ set** (`deepEqual` ของ array ที่ sort แล้ว) — ถ้า dev/CI มี global install อยู่จริง set จะไม่ว่างแต่ต้อง **ไม่เปลี่ยน**; ถ้าไม่มีต้องยังเป็น `null` ทั้งก่อนและหลัง · **C16:** manifest ที่ถูกเขียนใน `~/.warnyin/.warnyin-manifest` ต้อง **ไม่มี entry ใดขึ้นต้น `.claude/agents/` หรือ `.claude/skills/`** · _(หมายเหตุ: `assert(p.startsWith(home))` เป็น tautology เพราะ `p` มาจาก `path.join(home, …)` ของเราเอง — เก็บไว้ได้เป็น sanity แต่ **ห้ามนับเป็นหลักฐานว่า override ติด**)_ |
| **U9** | `--global` ครึ่งที่ต้องลบ | ต่อจาก U8 (setup เดียวกัน คนละเคส) — มี stale ใต้ `~/.warnyin/template/stages/[topic]/{test,verify}.md` จาก pkg เก่า | ไฟล์ใต้ `.warnyin/template` **หาย** · สรุปมี `ลบ 2` · exit 0 |
| **U10** | blast cap boundary — 50 (ผ่านพอดี) | fixture B → **`rmKnownStale(target)` ก่อน** (ตัด stale พื้นฐาน 2 ตัวออกจากสมการ) → `addStaleEntry` ไฟล์ใต้ `.warnyin/workflow/legacy/f00..f49.md` **50 ตัว** (hash ตรงจริง, ไม่มีใน payload ใหม่) | ลบครบ **50** · ไม่มี `[prune:blast-cap]` · สรุป `ลบ 50` |
| **U11** | blast cap boundary — 51 (ชน cap) | เหมือน U10 แต่ `f00..f50.md` = **51 ตัว** | **ไม่มีไฟล์ใดหายเลย** (assert ครบทั้ง 51) · stdout มี `[prune:blast-cap]` + จำนวน · exit 0 |
| **U12** | `--dry-run` ยกเว้น cap | state 51 ตัวของ U11 + `--update --dry-run` | stdout มีหัวข้อ `จะลบ:` + บรรทัด `  − ` **ครบ 51** · ไม่มีไฟล์ใดหาย · exit 0 |
| **U13** | `--no-prune` แล้วรอบหน้ายังเห็น stale (C13) | fixture B → `--update --no-prune` → ตรวจ → `--update` | รอบแรก: ไม่มีไฟล์หาย + ไม่มีบรรทัด `−` · **manifest หลังรอบแรกยังมี entry ของ 2 ไฟล์ตกรุ่นพร้อม hash เดิม** (assert บรรทัดตรง ๆ เทียบกับ entry ใน synthetic manifest) · รอบสอง: ถูกลบครบ + `ลบ 2` |
| **U14** | `--dry-run` ไม่แตะ manifest | fixture B + อ่าน manifest เก็บ buffer → `--update --dry-run` | manifest **byte-equal** กับก่อนรัน · ไฟล์ payload ครบเท่าเดิม (`listFiles` เท่ากัน) |
| **U15** | **T1 payloadNew semantics** | temp เปล่า → install ด้วย **cli จริง** → `--update` ทันที | `listFiles` ก่อน/หลัง **เท่ากันทุกตัว** (sort แล้วเทียบ) · **ไม่มีบรรทัด `−` เลย** · สรุปมี `ลบ 0` — เคสนี้จับ "payloadNew ผิด ⇒ ลบไฟล์ของตัวเอง" ซึ่งเป็น failure mode ที่แพงที่สุด |
| **U16** | idempotent หลัง prune | fixture B → `--update` (ลบ 2) → `--update` อีกครั้ง | รอบสอง: `ลบ 0` · `listFiles` เท่ากับหลังรอบแรก · manifest **byte-equal** กับหลังรอบแรก |
| **U17** | manifest เสีย (บรรทัดใช้ไม่ได้) + duplicate | fixture B + เขียนทับ manifest ที่มี: (ก) บรรทัดขยะไม่มี separator · (ข) `sha256` ไม่ใช่ hex64 · (ค) **duplicate 2 บรรทัดของ `.warnyin/template/stages/[topic]/verify.md` ที่ hash ต่างกัน** · (ง) **entry ที่ถูกต้องอย่างน้อย 1 ตัวของไฟล์ payload ที่ยังใช้อยู่** | exit 0 · ไฟล์ payload ที่ใช้อยู่ **ครบ** · **`verify.md` ยังอยู่** และ **ไม่มีบรรทัด `−` ที่ระบุ `verify.md`** (duplicate → ทิ้งทั้งคู่ = fail-closed C1) · มี `⚠` · **manifest ถูกเขียนทับเป็นรูปแบบถูกต้อง** — assert ว่าทุกบรรทัดที่ไม่ใช่ `#`/ว่าง match `/^[0-9a-f]{64} {2}\S/` · **★ ทำไมต้องมี (ง):** ถ้าทุกบรรทัดถูก reject จนเหลือ 0 entry จะกำกวมว่า `manifestOld` นับว่า "ว่าง" ตาม C2 หรือไม่ — ถ้านับว่าว่าง known-stale จะเปิดแล้วลบ `verify.md` (C14 ยกเว้น hash) ทำให้เคสพิสูจน์คนละเรื่อง · entry ที่ถูกต้อง 1 ตัวปิดความกำกวมนี้ · **ห้ามใช้ duplicate ของไฟล์ที่ยังอยู่ใน payload ใหม่** — C2 นิยาม `stale = (ที่รวมแล้ว) − payloadNew` ⇒ ไฟล์นั้นไม่มีทางเป็น stale ⇒ assert "ไม่ถูกลบ" ผ่านเสมอ (tautology) |
| **U18** | manifest เกินเพดาน | 2 sub-assert ในเคสเดียว: (ก) manifest > **1 MB** (pad ด้วยบรรทัด comment) · (ข) manifest > **5000 entry** | ทั้งสองกรณี: exit 0 · **ไฟล์ payload ที่ยังใช้อยู่ไม่หายแม้แต่ตัวเดียว** (assert ด้วย diff `listFiles` ไม่ใช่คำว่า "ไม่มีไฟล์ payload หาย" ลอย ๆ) · มี `⚠` · manifest ถูกเขียนทับใหม่ · **★ และ `[topic]/test.md` + `verify.md` _ถูกลบจริง_ พร้อมสรุป `ลบ 2`** — เพราะ C1 ทิ้งทั้งไฟล์ ⇒ `manifestOld` ว่าง ⇒ C2 เปิด known-stale ⇒ C14 (stamp `0.29.9` < `0.30.1`) ลบ 2 path นี้โดยยกเว้น hash · **นี่คือพฤติกรรมที่ถูกต้องตาม contract ไม่ใช่บั๊ก** — เขียน expected ให้ตรงความจริง ห้ามเขียนกำกวม |
| **U19** | EACCES ระหว่างลบ | fixture B (POSIX) — **stale 3 ตัว:** `[topic]/test.md` + `[topic]/verify.md` (อยู่ dir เดียวกัน) และ **`addStaleEntry` ตัวที่ 3 ที่ `.warnyin/workflow/legacy-io/gone.md` (คนละ dir, hash ตรงจริง)** · `chmod 0o500` เฉพาะ dir `.warnyin/template/stages/[topic]/` · `t.after` **restore 0o700 ก่อน rm** | stdout มี `⚠` + `[prune:io]` ระบุ 2 path ใน dir ที่ล็อก · ทั้งสองไฟล์ **ยังอยู่** · **`.warnyin/workflow/legacy-io/gone.md` ถูกลบสำเร็จ** (มีบรรทัด `  − ` ของ path นี้) · สรุป `ลบ 1` · exit 0 · **★ ต้องมี stale ตัวที่ 3 คนละ dir** ไม่งั้นไม่มีอะไรพิสูจน์ประโยค "ไฟล์อื่นยังถูกลบสำเร็จ" เพราะ known-stale 2 ตัวอยู่ dir เดียวกันทั้งคู่ · **guard:** `process.platform==='win32'` หรือ `process.getuid?.()===0` → `console.error(...) + return` (ห้าม `t.skip`) |
| **U20** | install สดไม่ลบอะไร + manifest ถูกสร้าง | temp เปล่า → install ด้วย cli จริง (ไม่มี `--update`) | ไม่มีบรรทัด `−` · สรุปมี `ลบ 0` · มี `.warnyin/.warnyin-manifest` · ทุกบรรทัด entry match `/^[0-9a-f]{64} {2}\S/` · **ไม่มี entry ที่ขึ้นต้น `docs/`** และไม่มี entry ของตัว manifest เอง (C13 ขอบเขต) |

#### 7.2.1 entry 7 รูปของ U5 (manifest adversarial)

| รูป | entry ที่เขียนลง manifest | ไฟล์เหยื่อที่ต้องสร้างจริง | reason ที่คาด (C15) |
|---|---|---|---|
| `..`-segment | `.warnyin/workflow/../../outside/victim.md` | `<outsideDir>/victim.md` | `path:dot-segment` |
| absolute | `<outsideDir>/abs.md` (absolute POSIX) | `<outsideDir>/abs.md` | `path:absolute` |
| backslash | `.warnyin\workflow\bs.md` | `<target>/.warnyin/workflow/bs.md` | `path:backslash` |
| **control char** | `.warnyin/workflow/vic\x01tim.md` — **★ ต้องมี byte `\x01` จริงในสตริง** | `<target>/.warnyin/workflow/vic\x01tim.md` **สร้างเฉพาะ POSIX**; Windows ตั้งชื่อไฟล์แบบนี้ไม่ได้ → `console.error(...)` แล้ว **ข้ามเฉพาะการสร้างไฟล์** (entry ยังต้องอยู่ในmanifest เพราะ C4 เป็น pure guard ที่รันก่อน `statOnDisk` ⇒ reason ถูกพิมพ์ไม่ว่าไฟล์มีจริงหรือไม่) | `path:control-char` |
| root คล้ายกัน | `.warnyin/workflow-evil/x.md` | `<target>/.warnyin/workflow-evil/x.md` | `scope:outside-root` |
| นอก allowlist | `.claude/agents/my-agent.md` | ไฟล์ผู้ใช้จาก U3 pattern | `scope:not-allowlisted` |
| นอก prunableRoots | `docs/project.md` | มีอยู่แล้วจาก install | `scope:outside-root` |

> **★ ที่แก้จากฉบับก่อน:** แถว control char เดิมเขียน entry เป็น `.warnyin/workflow/victim.md` ซึ่ง **ไม่มี control char เลย** ⇒ `path:control-char` ไม่มีวันถูกพิมพ์ ⇒ assert แดงตลอดโดยไม่ใช่ความผิดของ implementation

### 7.3 กติกาข้ามแพลตฟอร์ม / gate
- **ห้าม `t.skip` ทุกกรณี** — `check-test-count.mjs` fail เมื่อ `pass !== tests`; เคสที่ทำไม่ได้บน platform → `console.error('  ⚠ ข้าม… — platform ไม่รองรับ; CI ubuntu ครอบ') ; return` (pattern `installer.test.mjs:596-607`)
- ทุก path ประกอบด้วย `path.join`; assert ข้อความ stdout ใช้ **POSIX form** ตาม C15
- `cliPath` ต้องมาจาก `fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))` — **ห้าม `.pathname`**
- ห้าม `import` logic จาก `cli.mjs` ในไฟล์นี้ (black-box ล้วน)
- **จำนวนเคสของไฟล์นี้ = 20 (`U1`–`U20`)** — ตัวเลขที่รายงานต้องวัดจาก output ของ `node --test` จริง ไม่ใช่นับจากเอกสาร
