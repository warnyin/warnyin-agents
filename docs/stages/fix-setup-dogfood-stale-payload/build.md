# Build Report — fix setup:dogfood stale-payload

> Output ของ BUILD stage · playbook: `.warnyin/workflow/stages/build.md`

| | |
|---|---|
| **Slug** | `fix-setup-dogfood-stale-payload` |
| **Build branch** | `build/fix-setup-dogfood-stale-payload` |
| **Isolation** | `worktree` |
| **วันที่** | `2026-06-13` |
| **ผลรวม** | ผ่าน 1 / ล้ม 0 / ทั้งหมด 1 task |

## 1. Execution plan
```
wave 1: fix-dogfood-stale-detection [sonnet]  (1 task — cohesive 1 ไฟล์)
```

## 2. ผลต่อ task
| Wave | Task | สถานะ | Test | ไฟล์ที่แก้ | หมายเหตุ |
|---|---|---|---|---|---|
| 1 | fix-dogfood-stale-detection | ✅ passed | 103/103 (+18) | `setup-dogfood.mjs` · `setup-dogfood.test.mjs` | 3 ชั้นครบ; checkTarballVersion รับ extractDir (testability — TS-1) |

## 3. Integration notes
- integrate scoped: `git checkout <worktree-branch> -- src/scripts/setup-dogfood.mjs src/tests/setup-dogfood.test.mjs`
- ไม่มี conflict (1 task); agent merge baseRef สำเร็จ

## 3.5 Full build & test gate
| Gate | ผล |
|---|---|
| `node --test \| check-test-count` | ✅ pass=103 tests=103 (เพิ่มจาก 85 — ADD 18 เคส, เคสเดิมไม่ flip) |
| `verify-pack` | ✅ 86 ไฟล์ |
| `lint-md` | ✅ 106 ไฟล์ 48 ลิงก์ |

- ไม่มี regression — เคสเดิม (drift/degrade/CRLF/transition<0.17.0/wire-proof) ผ่านครบ

## 4. fix ที่ลง (3 ชั้น)
- **ชั้น B (detection):** `STAMP_MIN_VERSION='0.17.0'` + export `semverGte(a,b)` (numeric tuple, NaN→0); `verifyInstalled` branch `stamp===null`: expected≥0.17.0→false (active per LR2), <0.17.0/non-semver→true (transition/degrade-safe)
- **ชั้น A (cache-bust):** `installViaPack` npm pack เพิ่ม `prefer-online` (symmetric กับ npx) + export `checkTarballVersion(extractDir, expected)` exact-equality เรียกก่อน `--update` (mismatch→return false)
- **ชั้น 1 (npx):** `installViaNpx` args = `['--yes','-p',spec,'warnyin-agents','--update']` (explicit bin แก้ scope-strip)

## 5. Rule/standard ใหม่ที่ note (รอ SHIP)
- LR2 implemented (active เริ่ม 0.17.0) — อัปเดต evidence ใน `techstack/installer/rule.md` §dev tooling
- "**dev-tooling fallback path ต้อง symmetric กับ primary**" (installViaPack ขาด prefer-online ที่ npx มี → regression รอบ 3) — จาก `tasks/.../rule.md` §2

## 6. ปัญหายาก/ซ้ำ
- ดู `./troubleshooting.md` (TS-1: pure fn testability — รับ path ไม่รับ parsed object)

## ✅ Gate → VERIFY
- [x] task implement + merge · [x] passed (103/103) · [x] ไม่มี conflict · [x] full build/test เขียว · [x] build.md ครบ · [x] ไม่แตะ rule กลาง
