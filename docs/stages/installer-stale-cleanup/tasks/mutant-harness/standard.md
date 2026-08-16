# Standard — mutant-harness

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนเทสที่ task นี้ต้องยึด · **อิงจาก** `docs/techstack/installer/test.md` + `docs/techstack/installer/standard.md`
> ขอบเขต = **mutation testing เท่านั้น** (M0 + M1–M12) · black-box U1–U20 อยู่ที่ `tasks/upgrade-path-test/`

## 1. Standard กลางที่ยึด (จาก techstack)
- **black-box spawn จริง** — spawn cli ใน temp dir แล้ว assert side-effect (ไฟล์/exit code/stdout/stderr) · **ห้าม import logic จาก `cli.mjs`** (รัน side-effect ตอน import) · ห้าม refactor target เพื่อ testability
- **assert `code===0` ก่อนเสมอ + surface `stderr`** ใน assertion message (`ok(r, msg)`) · assert stream ให้ตรง (prune พิมพ์ที่ **stdout** ตาม C15) · เทียบไฟล์ด้วย **byte** ไม่ใช่ mtime
- **cross-platform:** `process.execPath` · `path.join` · `fileURLToPath(new URL('../bin/cli.mjs', import.meta.url))` (**ห้าม `.pathname`**) · spawn ด้วย array args **ห้าม `shell:true`**
- **cleanup `t.after()` ลงทะเบียนก่อน assert** (ลบ temp แม้ fail)
- **zero-dependency** — built-in `node:*` เท่านั้น (`node:test`, `node:assert/strict`, `node:child_process`, `node:fs`, `node:path`, `node:os`, `node:url`, `node:crypto`)
- **bare `node --test`** — ไฟล์ชื่อ `*.test.mjs` ใต้ `src/tests/` (auto-discover; ห้ามพึ่ง path arg เป็นหลักฐานปิด gate)
- **acceptance = pass count ไม่ใช่แค่ exit 0** (`check-test-count.mjs`: `fail!==0` **หรือ** `pass<MIN_PASS` **หรือ** `pass!==tests` → fail)

## 2. Pattern การเขียนโค้ดของ task นี้

### 2.1 Harness — copy รูป ไม่ import
`installer.test.mjs` **ไม่ export** อะไร และ **ห้ามแตะ** ⇒ ประกาศ helper ของตัวเองในไฟล์ใหม่ โดย **copy รูปแบบเดิมคำต่อคำ**:

| helper | ต้นแบบ | หน้าที่ในไฟล์นี้ |
|---|---|---|
| `makeTempProject(t)` | `installer.test.mjs:25-29` | `mkdtemp` + `t.after(rm)` — ใช้ทั้ง `<pkg>`, `<target>`, `<outsideDir>` |
| `runCli(cwd, args, env)` | `:31-39` | spawn **cli ใน `<pkg>` (mutant)** ไม่ใช่ `cliPath` ของ repo — ต้องรับ path ของ cli เป็นพารามิเตอร์ (`runMutant(cliAbs, cwd, args)`) |
| `ok(r, msg)` | `:54-56` | assert `code===0` + surface stdout/stderr |
| `listFiles(dir)` | `:59-66` | diff ไฟล์ก่อน/หลัง (co-assertion) |

- `copyDir(src, dest)` เขียนเอง zero-dep (`readdirSync withFileTypes` recursive) — **ห้าม `fs.cpSync`** (ไม่มีใน node 20 บาง minor)
- `sha256OfFile(abs)` / `addStaleEntry(target, rel, sha)` / `manifestPath(target)` — **ตั้งชื่อให้ตรงกับ `tasks/upgrade-path-test/`** เพื่อให้อ่านคู่กันได้ (คนละไฟล์ ห้าม import ข้ามกัน)

### 2.2 ประกอบ pkg ปลอมใน temp — **ยืมได้เฉพาะ _layout_ จาก `installer.test.mjs:676-709` เคส `EOLI.`**

> **★ คำเตือน (KB #32):** เคส `EOLI.` ใช้ **mini-payload 6 ไฟล์ที่แต่งเอง** (`package.json` · `src/bin/cli.mjs` · `crlf-probe.mjs` · `crlf-note.md` · `installer/templates/CLAUDE.md` · `src/AGENTS.md`) เพราะเป้าหมายของมันคือพิสูจน์ **EOL normalize** ล้วน ๆ
> ยืมได้เฉพาะ **layout ของ pkg ปลอม** — `pkgRoot = <pkg>/src` · `version` อ่านจาก `<pkg>/package.json` · spawn ด้วย `process.execPath` + array args
> **ห้ามใช้ mini-payload เป็น payload ของแถวใดแถวหนึ่ง** — mutation ทดสอบ prune บน payload จริง ถ้า payload เล็ก `payloadNew` จะผิดรูปและ stale set จะกลายเป็นทั้งโปรเจกต์

```js
const pkg = makeTempProject(t)
copyDir(repoSrc, path.join(pkg, 'src'))                                  // payload = ของจริง 100%
writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({ version: repoVersion }))
const pkgCli = path.join(pkg, 'src', 'bin', 'cli.mjs')

// 1) baseline install ด้วย cli ที่ "ยังไม่ mutate"
ok(runMutant(pkgCli, target, []), 'baseline install')
assertManifestUsable(target)                                              // fail-loud ตาม spec §4

// 2) mutate แล้วค่อยเขียนทับ
const original = readFileSync(cliPath, 'utf8')                            // repo cli = source อ่านอย่างเดียว
const mutated = original.replace(find, replace)
assert.notEqual(mutated, original, `${id}: mutation ไม่ติด — anchor เปลี่ยนไปแล้ว ให้ sync find/replace กับ cli.mjs ปัจจุบัน (KB #33)`)
writeFileSync(pkgCli, mutated)
```

### 2.3 กติกา fail-loud (บังคับ · ห้ามมีข้อยกเว้น)
- `assert.notEqual(mutated, original, …)` เป็น **บรรทัดแรกหลัง `replace`** — ห้าม `if (mutated === original) return` · ห้าม `console.warn` แล้วเดินต่อ · ห้าม `try/catch` ครอบ
- **M0 ตรวจ anchor ทั้งตารางก่อนทุกแถวจะรัน** (`MUTATIONS.length` + `split(find).length - 1 === 1`) ⇒ anchor หาย/กำกวม/แถวถูกถอด จะแดงที่ M0 พร้อมข้อความสั่งให้ไป sync **ไม่ใช่แดงกระจายที่แถวปลายทาง**
- `MUTATIONS` ต้องเป็น **array ค่าคงที่ตัวเดียวในไฟล์** (`{id, contract, find, replace, covers}`) — ทั้ง M0 และแต่ละแถวอ่านจากตัวเดียวกัน (single source; ห้ามพิมพ์ `find` ซ้ำในตัวเทส)
- `replace` ต้องเป็นสตริงที่ **ผลลัพธ์ยัง parse เป็น JS ได้** — ตรวจโดยให้ baseline ของแถวนั้น spawn แล้ว `exit 0` (ถ้า SyntaxError จะได้ exit ≠ 0 พร้อม stderr ที่ `ok()` surface ให้เห็น)

### 2.4 Assertion — ห้ามอ่อน
- `existsSync(x) === true` **ห้ามเป็น assertion เดียวของแถว** — เป็นจริงทุกครั้งที่ spawn ล้ม/args ผิด/fixture เพี้ยน ⇒ ทุกแถวต้องมี co-assertion ตาม `spec.md §6.2` (exit 0 · canary ถูกลบ · `ลบ N ≥ 2` · payload ที่ยังใช้อยู่ยังอยู่)
- ข้อความ assert ต้องบอก **"เคสไหนกำพร้า"** เช่น
  `` `M4: ปิด C5 (agents) แล้ว .claude/agents/my-agent.md ต้องหาย — ถ้ายังอยู่ แปลว่า assertion ของ U3 ไม่ได้พิสูจน์อะไร` ``
- ข้อความ stdout ที่ assert **copy codepoint ตรงจาก `design.md §4 C15`** — `−` = **U+2212** (เขียนเป็น `−` ในเทส ไม่ copy-paste ลอย) · `⚠` = U+26A0 · `·`
- reason ที่พิมพ์ต้องตรวจกับ **เซตปิด** `const REASONS = new Set([...13 ค่า…])` (copy จาก C15)

### 2.5 Cleanup / ความปลอดภัยของ repo
- **mutation เกิดใน `os.tmpdir()` เท่านั้น** — `cliPath` ของ repo ใช้เป็น **argument ของ `readFileSync` เท่านั้น** ห้ามปรากฏใน `writeFileSync`/`rmSync`/`cpSync` แม้แต่ครั้งเดียว (`docs/rule.md §1 config-protection`)
- `t.after(() => rmSync(dir, {recursive:true, force:true}))` ลงทะเบียน **ทันทีที่ `mkdtemp`** (ก่อน assert แรก) — ครอบทั้ง `<pkg>`, `<target>`, `<outsideDir>`
- ไม่มีการ backup/restore ไฟล์ใน repo (คนละกลไกกับ RED proof แบบแก้ไฟล์จริงของ KB #33) — เพราะไม่แตะ repo เลย
- ห้ามสร้าง fixture directory ถาวรใน repo

### 2.6 กติกา skip / platform
```js
try { symlinkSync(outsideDir, link, 'dir') } catch (e) {
  console.error(`  ⚠ ข้ามสร้าง symlink (${e.code || e.message}) — platform ไม่รองรับ; CI ubuntu ครอบ`)
  return   // ★ ห้าม t.skip — pass-count gate fail ถ้า pass !== tests
}
```
- ใช้ pattern เดียวกันกับแถวที่ต้องสร้าง **ชื่อไฟล์ที่มี `\`** (M1) และ **ชื่อไฟล์ที่มี control char** (M3):
  ```js
  try { writeFileSync(victimAbs, body) } catch (e) {
    console.error(`  ⚠ ข้ามสร้างไฟล์ชื่อพิเศษ (${e.code || e.message}) — platform ไม่รองรับ; CI ubuntu ครอบ`)
    return
  }
  ```
- **ห้าม `t.skip` ทุกกรณี** และห้ามใช้ `test(..., {skip: ...})`

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `makeTempProject` / `runCli` / `ok` / `listFiles` — **รูปแบบ** จาก `src/tests/installer.test.mjs` (copy เข้าไฟล์ใหม่ **ไม่ import**)
- `node:crypto createHash('sha256')` — ห้ามเขียน hash เอง
- `copyDir` / `sha256OfFile` / `addStaleEntry` / `manifestPath` — เขียนในไฟล์นี้ด้วย **ชื่อและรูปเดียวกับ `tasks/upgrade-path-test/`** (คนละไฟล์ ห้าม import ข้าม — `installer-upgrade.test.mjs` ไม่ export และ **ห้ามแตะ**)

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
> pattern ใหม่ที่เสนอให้เป็นมาตรฐานกลาง — note ไว้ที่ `rule.md §2` รอ SHIP
- **mutation matrix ต้องมี M0 structural self-check** (`length` + anchor พบพอดี 1 ครั้ง) — ทำให้ "การถอดแถวออกเพื่อให้เขียว" และ "anchor กำกวม" มองเห็นได้
- **mutation ทำได้เฉพาะ guard ที่เป็นชั้นเดียวที่บล็อกเหยื่อ** — guard ที่ซ้อนกันหลายชั้นต้องพิสูจน์ด้วย unit ของ pure fn ไม่ใช่ mutation ระดับ fs
- **ทุกแถวของ mutant harness ต้องมี canary stale ในรันเดียวกัน** — พิสูจน์ว่า mutant "ยังลบเป็น" ก่อนจะตีความว่าเหยื่อหายเพราะ guard ตาย
