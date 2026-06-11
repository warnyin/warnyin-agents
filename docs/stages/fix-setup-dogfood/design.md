# Design (How) — fix-setup-dogfood

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> ออกแบบเชิงเทคนิคแบบ **vertical slice architecture**
> **tier:** `standard` · lens: `.warnyin/workflow/roles/sa.md`

## 1. ภาพรวมสถาปัตยกรรม
- **component:** `installer` — dev-tooling `src/scripts/setup-dogfood.mjs` (zero-dep, ESM, cross-platform, ไม่ publish)
- **แนวทางหลัก:** แก้ 2 root cause + ทำให้ testable
  1. **`--update`** — ส่ง flag ให้ install เขียนทับ CORE (cli `copyTree({overwrite:true})`)
  2. **verify side-effect** — เลิกเชื่อ `exit 0`; เช็คไฟล์ลง root จริง → ไม่ผ่าน → fallback `installViaPack`
  3. **export `verifyInstalled` + main-guard** (pattern `verify-pack.mjs`/`lint-md.mjs`) → unit test ได้โดยไม่ spawn

## 2. Vertical slices
| # | Slice (ส่งมอบคุณค่าอะไร) | ตัดผ่าน layer ไหน | Model tier | → task |
|---|---|---|---|---|
| 1 | **setup-dogfood reliable sync** — install เขียนทับ CORE จริง + จับ false-green ด้วย verify side-effect + fallback; พิสูจน์ด้วย unit test | logic (script fix) · test (unit `verifyInstalled`) · doc (CHANGELOG) | `balanced` | `tasks/setup-dogfood-reliable/` |

## 3. Data model / schema
- **N/A** — ไม่มี state/entity; เป็น install flow + filesystem side-effect

## 4. Interface / contract
- **`verifyInstalled(root) → boolean`** (export, pure-ish — อ่าน fs):
  - **★ รับ param `root`** (ไม่ hardcode module-level `repoRoot`) — เพื่อ unit test ส่ง temp dir ได้; success-detection เรียก `verifyInstalled(repoRoot)` ด้วย module var
  - return `true` เมื่อ root มี **CORE markers ครบ:** `path.join(root, '.warnyin/workflow/stages/discovery.md')` **และ** `path.join(root, '.claude/commands/warnyin')` (dir) exists
  - เลือก marker ที่อยู่ใน CORE list ของ cli (`.warnyin/workflow` + `.claude/commands/warnyin`) — install สำเร็จต้องมีแน่
- **install args:** npx → `['--yes', PKG, '--update']` · pack → `[cli, '--update']`
- **main-guard:** `if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()` — import จาก unit ไม่ trigger install

## 5. Flow
```
main():
  ok = installViaNpx() || installViaPack()      ← แต่ละตัว return true เฉพาะเมื่อ "exit ok AND verifyInstalled()"
  if (!ok) exit(1)
  appendContributingPointer()

installViaNpx():
  spawn npx --yes <PKG> --update                ← +--update
  if (status===0 && !shimMissing && verifyInstalled(repoRoot)) return true   ← +verify
  return false                                  ← false-green/shim → fallback

installViaPack():
  npm pack → extract → spawn node <cli> --update   ← +--update
  return run.status===0 && verifyInstalled(repoRoot)   ← +verify
```
- **data-flow:** release tarball → cli.mjs `--update` → `copyTree(overwrite:true)` → root CORE; `verifyInstalled` อ่าน root fs ยืนยัน

## 6. ผลกระทบต่อระบบเดิม
- `setup-dogfood.mjs` (dev-only) — backward-compatible: เพิ่ม flag + verify, flow เดิม (npx→pack fallback) คงไว้
- **`--update` ปลอดภัย:** เขียนทับเฉพาะ CORE (playbook/command/template); cli แยก CORE จาก seed-docs/scaffold (`docs/`/งานจริง ไม่โดน — `copyTree` CORE vs `seedDocs`)
- ไม่กระทบ `cli.mjs`, `setup-sandbox.mjs`, installer behavior สาธารณะ

## 7. Dependency ระหว่าง slice/task
```
task-1 (setup-dogfood-reliable) — เดี่ยว
```
- **critical-path depth:** 1
- **max wave width:** 1
- **เหตุผลที่ serialize (width 1):** เป็น bugfix **ไฟล์ source เดียว** (`setup-dogfood.mjs`) + test คู่กัน = vertical slice เดียว; ไม่มีหน่วยคุณค่า independent ให้ขนาน (DAG-width toolkit ไม่ applicable — script เดียว). 1 task เขียนเอง (ไม่ fan-out)

## 8. Test strategy ระดับ design
- **unit (`verifyInstalled`):** สร้าง temp dir → ไม่มี CORE → `false`; สร้าง `.warnyin/workflow/stages/discovery.md` + `.claude/commands/warnyin/` → `true`; มีแค่บางส่วน → `false` (pattern verify-pack: import ตรง + main-guard ไม่ trigger install)
- **integration (executable, manual/defer):** จริง `npm run setup:dogfood` → verify root CORE = release version (เปลี่ยนจริงเมื่อ release ใหม่) — defer ถ้า spawn จริงช้า/ต้อง network
- **regression:** `npm test` ทั้ง suite ไม่พัง; `lint:md` (CHANGELOG entry)
- **false-green guard:** unit ยืนยัน `verifyInstalled` คืน `false` เมื่อ CORE ขาด — พิสูจน์ว่า "เชื่อ exit 0 อย่างเดียวพลาด" ถูกแก้

## 9. Spec delta (เทียบ docs/features/<name>/spec.md ปัจจุบัน)
**ไม่มี delta** — เป็น bugfix dev-tooling (`setup-dogfood.mjs` reliability) ไม่แตะพฤติกรรม feature สาธารณะ; ไม่มี `docs/features/*/spec.md` ที่ครอบ setup-dogfood (dev-only script). ความรู้ที่ได้ = learned-rule (รอ SHIP): "dev-tooling install ต้อง verify side-effect + ส่ง --update — ไม่เชื่อ exit 0"
