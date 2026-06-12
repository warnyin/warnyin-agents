# Standard — setup-dogfood-verify

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียนโค้ด / shared component ที่ task นี้ต้องยึด
> **อิงจาก** `docs/techstack/installer/standard.md` (dev tooling section)

## 1. Standard กลางที่ยึด (จาก techstack)
- **dev tooling cross-platform** — `npm`/`npx` บน win เป็น `.cmd`: `const npm = isWin ? 'npm.cmd' : 'npm'` (reuse pattern `installViaPack:75`); `npx` คง `shell:isWin` (มี user input = ไม่มี → ปลอดภัย); spawn array args ห้าม `shell:true` ยกเว้น npx/win
- **export pure fn + main-guard** (pattern `verify-pack.mjs`/`lint-md.mjs`) — `verifyInstalled` (+`readStamp`/`parseNpmViewVersion` ถ้าแยก) export ให้ unit import ตรง; main-guard `argv[1]` comparison เดิมกัน install trigger ตอน import
- **zero-dep** — `npm view`/`npx`/`npm pack` เป็น external process (`spawnSync`) ไม่ใช่ npm dependency
- **ภาษาไทย** ในคอมเมนต์/ข้อความ; log `+`/`↻`/`✖`/`⚠` ตามสไตล์เดิม
- **negative fixture เลี่ยง trigger phrase** (`docs/rule.md §5`) — ไม่เกี่ยวตรงนี้ (ไม่ใช่ keyword parser) แต่ test fixture stamp ต้องใช้ค่าชัด

## 2. Pattern การเขียนโค้ดของ task นี้
- **`parseNpmViewVersion(stdout) → string|null`** (★ แยกเป็น pure fn เพื่อ testability — เลี่ยง spawn จริงใน unit):
  ```js
  export function parseNpmViewVersion(stdout) {
    const last = (stdout || '').trim().split(/\r?\n/).pop()?.trim()
    return last && /^\d+\.\d+\.\d+/.test(last) ? last : null
  }
  ```
- **`resolveExpectedVersion()`** = spawn `npm view` → `parseNpmViewVersion(r.status===0 ? r.stdout : '')`; `{ timeout: 15000, encoding:'utf8' }`; degrade (`null`) → warn loud `⚠ npm view ล้มเหลว → ข้าม version check รอบนี้`
- **`readStamp(root) → string|null`:**
  ```js
  function readStamp(root) {
    try {
      const s = fs.readFileSync(path.join(root, '.warnyin', '.warnyin-version'), 'utf8').trim()
      return s || null            // empty/whitespace → null (ตกแถว transition)
    } catch { return null }
  }
  ```
- **`verifyInstalled(root, expected)`** — markers ก่อน (เดิม) → falsy expected = return markers-only → stamp = readStamp → ตาม truth table §4B; การ warn ให้ caller ทำ (verifyInstalled คืน bool บริสุทธิ์ — testable) หรือคืนเหตุผลผ่าน closure ที่ caller log (impl เลือกได้ ตราบที่ message §4B ครบ)
- **install spec:** `PKG_NAME = '@warnyin/agents'`; `const spec = expected ? `${PKG_NAME}@${expected}` : `${PKG_NAME}@latest``
- **env prefer-online:** `spawnSync('npx', [...], { ..., env: { ...process.env, npm_config_prefer_online: 'true' } })`
- **wire ทั้ง 2 path:** `installViaNpx` (L63) **และ** `installViaPack` (L126) → `verifyInstalled(repoRoot, expected)` (อย่าลืม pack)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `repoRoot`, `isWin`, `spawnSync`, fs/path/os — มีอยู่แล้วใน `setup-dogfood.mjs`
- `installViaPack` extract/resolve-cli logic — **คงเดิม** แค่เพิ่ม `expected` param + spec + verify arg
- test harness: `makeTempProject(t)` ใน `setup-dogfood.test.mjs` (มีแล้ว) — reuse สร้าง temp root + เขียน stamp ปลอม

## 4. เพิ่มเติมเฉพาะ task (ถ้ามี)
- **`parseNpmViewVersion` เป็น pure fn แยก** = pattern testability เดียวกับ `checkFiles`/`checkLinks` (zero-dep lint-gate convention `docs/rule.md §2`) — ทำให้ unit ไม่ต้อง spawn `npm view` จริง (flaky/network) → เสนอเป็น standard ใน `rule.md §2` ถ้าควร generalize
