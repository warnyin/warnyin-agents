# Verify Report — fix setup:dogfood stale-payload

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> role: strategy tester (QA lens) · component: `installer`

| | |
|---|---|
| **Slug** | `fix-setup-dogfood-stale-payload` |
| **วันที่** | `2026-06-13` |
| **ผล** | ✅ ผ่าน (พบ + แก้ root cause critical นอก scope เดิม — user อนุมัติขยาย scope) |
| **จำนวนรอบแก้** | 1 รอบ (root cause ชั้น 0 — fix 1 จุดใน cli.mjs + test) |

## 1. สรุปผล

VERIFY ทำ behavioral end-to-end (ที่ design §8 เลื่อนมาเพราะ "structural ไม่พอ — พลาด 2 รอบ") แล้ว **พบ root cause ที่แท้จริง** ซึ่ง DESIGN สมมติผิด

### ✅ fix เดิม 3 ชั้น — ทำงานถูก
| ชั้น | ผล verify |
|---|---|
| **B (detection)** | ✅ stamp ขาด + expected≥0.17.0 → **fail-loud** (ไม่ false-success); boundary 0.17.0→F, transition 0.16.0→T, non-semver→T |
| **A (cache-bust + version-check)** | ✅ `prefer-online` ดึง payload ใหม่; `checkTarballVersion` exact-equality (match/mismatch/falsy/CRLF) |
| **1 (npx explicit bin)** | ✅ args ถูกต้อง — แต่ไม่ใช่ root cause จริง (ดูชั้น 0) |

### 🔴→✅ root cause ชั้น 0 (พบใน VERIFY) — `cli.mjs` main-guard symlink
- **พบ:** `npx @warnyin/agents@0.18.0 --update` (sandbox สะอาด) → exit 0, **0 bytes, ไม่สร้างไฟล์เลย**; `setup:dogfood` ทั้ง npx + pack path เงียบ
- **สาเหตุ:** main-guard `path.resolve(argv[1]) === fileURLToPath(import.meta.url)` — argv[1] เป็น symlink path (npx `.bin`/symlinked `os.tmpdir`), import.meta.url เป็น realpath → mismatch → `main()` ไม่รัน
- **กระทบ:** ทั้ง **npx ผู้ใช้ปลายทาง** + setup:dogfood (DESIGN เคลม "ไม่กระทบผู้ใช้/cli.mjs ทำงานถูก" — **ผิด**; เคลม verify จาก test ที่ spawn ผ่าน real path เท่านั้น)
- **แก้:** `export function isEntrypoint(argv1, metaUrl, realpath)` — realpath ทั้งสองฝั่ง + fallback `path.resolve` เมื่อ realpath throw
- **พิสูจน์:**
  - RED: revert → black-box symlink + isEntrypoint-symlink unit **FAIL** (ยืนยันจับ regression จริง ไม่ false-green)
  - GREEN: fix → 109/109 เขียว
  - e2e local: pack local (fixed) → extract symlinked tmpdir → run cli → **ติดตั้ง 89 ไฟล์ + stamp 0.18.0 เขียนสำเร็จ**; `verifyInstalled(installed, 0.18.0)` → true
  - fail-loud: setup:dogfood ผ่าน registry เก่า → exit 1 ไม่ false-success (ถูกต้องจนกว่า publish)

## 2. รายการแก้ไข (VERIFY fix loop — 1 รอบ)
| # | ไฟล์ | แก้ |
|---|---|---|
| 1 | `src/bin/cli.mjs` | แยก `isEntrypoint(argv1, metaUrl, realpath=fs.realpathSync)` (pure, export, injectable) — realpath ทั้งสองฝั่ง + fallback; main-guard เรียก `isEntrypoint(process.argv[1], import.meta.url)` |
| 2 | `src/tests/installer.test.mjs` | +6 เคส: `isEntrypoint` truth table (5) + black-box spawn cli ผ่าน symlink → ติดตั้งสำเร็จ + stamp (1) |

## 3. ผลเทส
| Gate | ผล |
|---|---|
| `node --test \| check-test-count` | ✅ pass=109 tests=109 fail=0 (เพิ่มจาก 103 — +6 เคสชั้น 0) |
| `verify:pack` | ✅ 86 ไฟล์ |
| `lint:md` | ✅ 108 ไฟล์ 48 ลิงก์ |
| RED proof | ✅ revert → symlink unit + black-box FAIL (จับ regression จริง) |
| e2e fix proof (local payload) | ✅ ติดตั้งผ่าน symlinked tmpdir → 89 ไฟล์ + stamp 0.18.0 |
| fail-loud (registry เก่า) | ✅ exit 1 ไม่ false-success |
| regression (install/global/stamp เดิม 1-21) | ✅ ผ่านครบ (real-path spawn ยัง match) |

## 4. regression baseline (`installer-version-stamp`)
- scenario เดิม (stamp/drift/transition/degrade/CRLF/wire-proof) — ✅ ผ่าน (unit + black-box)
- Spec delta MODIFIED (stamp ขาด → active≥0.17.0) — ✅ verify ผ่าน
- Spec delta ADDED (npx bin / pack version-check / **★ cli ผ่าน symlink → main ทำงาน** / import → ไม่ trigger main) — ✅

## 5. UX/UI
N/A — dev-tooling/installer (ไม่มี FE)

## 6. ปัญหายาก/ซ้ำ → `troubleshooting.md`
- **TS-2:** ESM main-guard พังเมื่อรันผ่าน symlink (argv[1] ≠ realpath) — generalizable, ยกขึ้น KB ตอน SHIP

## 7. ★ หมายเหตุสำคัญสำหรับ SHIP
- fix ชั้น 0 (`cli.mjs`) เป็น **critical** กระทบ npx ผู้ใช้ปลายทาง — release ปัจจุบันบน registry (0.18.0) ยังมี bug
- **SHIP ควร bump version + publish** (เช่น v0.18.1) เพื่อปิด critical + ทำให้ setup:dogfood/npx ใช้งานได้จริง
- e2e ผ่าน registry จะสมบูรณ์หลัง publish (self-referential — VERIFY พิสูจน์ logic ด้วย local payload แล้ว)

## Gate → SHIP
- [x] เทสตามจุดประสงค์ครบ (3 ชั้น + ชั้น 0)
- [x] regression baseline ผ่าน
- [x] API contract — N/A (ไม่มี openapi.yaml)
- [x] ทุกข้อไม่ผ่านถูกแก้จนผ่าน (root cause ชั้น 0)
- [x] `test.md` + `verify.md` ครบ
- [x] ปัญหายากบันทึก `troubleshooting.md` (TS-2)

→ เสนอเข้า SHIP: `/warnyin:ship fix-setup-dogfood-stale-payload` (★ พร้อม bump+publish — critical fix)
