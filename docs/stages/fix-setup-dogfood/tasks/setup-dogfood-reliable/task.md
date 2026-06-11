# Task — setup-dogfood-reliable

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained

| | |
|---|---|
| **Task** | `setup-dogfood-reliable` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (dev-tooling `src/scripts/`) |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
> ทำให้ `npm run setup:dogfood` refresh root dogfood CORE ได้จริงทุก release — เขียนทับ CORE (`--update`) + จับ false-green ด้วย verify side-effect + fallback; พิสูจน์ด้วย unit test

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: _(ไม่มี)_ — task เดียว
- ปลดล็อกให้: VERIFY
- ส่ง output: setup-dogfood ที่ reliable + `verifyInstalled` export

## 3. Sub-tasks
- [ ] 1. **`--update`** — `installViaNpx` args `['--yes', PKG, '--update']`; `installViaPack` node args `[cli, '--update']` — _ผลลัพธ์:_ เขียนทับ CORE
- [ ] 2. **`verifyInstalled(repoRoot)`** — export function เช็ค root CORE markers (`.warnyin/workflow/stages/discovery.md` + `.claude/commands/warnyin` dir) exists → boolean — _ขึ้นกับ:_ ใช้ใน 3
- [ ] 3. **wire verify เข้า success-detection** — `installViaNpx` return `status===0 && !shimMissing && verifyInstalled(repoRoot)`; `installViaPack` return `run.status===0 && verifyInstalled(repoRoot)` — _ขึ้นกับ 2_
- [ ] 4. **main-guard** — ห่อ install flow ใน `main()`; `if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()` (import ไม่ trigger install) — _ขึ้นกับ 2:_ export ได้
- [ ] 5. **unit test** `src/tests/setup-dogfood.test.mjs` — import `verifyInstalled` ตรง, temp dir, 3 เคส (ไม่มี CORE→false / ครบ→true / บางส่วน→false) — _ขึ้นกับ 4_
- [ ] 6. **CHANGELOG** entry Fixed

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **owns:** `src/scripts/setup-dogfood.mjs` · `src/tests/setup-dogfood.test.mjs` (ใหม่) · `CHANGELOG.md`
- **ห้ามแตะ:** `cli.mjs` (ทำงานถูกแล้ว), `setup-sandbox.mjs`, payload `.warnyin/.claude`

## 5. Acceptance criteria
- [ ] `installViaNpx`/`installViaPack` ส่ง `--update` + return true เฉพาะเมื่อ `verifyInstalled` ผ่าน (ไม่เชื่อ exit 0 อย่างเดียว)
- [ ] `verifyInstalled` export + main-guard (import จาก test ไม่ spawn install)
- [ ] unit test 3 เคส (false/true/partial→false) ผ่าน — พิสูจน์ false-green guard
- [ ] `npm test` ทั้ง suite เขียว (รวม count gate `pass===tests`, `pass≥9`) + `lint:md` ผ่าน
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
