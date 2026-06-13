# Proposal — แก้ setup:dogfood ดึง/รายงาน payload เก่า (false-success)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Slug** | `fix-setup-dogfood-stale-payload` |
| **ประเภท** | `bugfix` |
| **ขนาด** | `standard` (logic fix 3 ชั้น + Spec delta MODIFIED + test; bootstrap-sensitive — regression รอบ 3 ของ setup-dogfood) |
| **วันที่** | `2026-06-13` |
| **มาจาก Discovery?** | `ไม่มี` (root cause confirmed ใน DESIGN ground) |

## 1. สรุป change (what)
แก้ `src/scripts/setup-dogfood.mjs` ที่ติดตั้ง **payload เก่า** ลง root dogfood แล้ว **รายงานสำเร็จ** (false-success) — เจอจริงตอนรัน setup:dogfood หลัง publish v0.18.0 (root ค้าง 0.17.0 ไม่มี UX). fix 3 ชั้น: detection (verifyInstalled), cache-bust (installViaPack), npx bin resolution

## 2. ทำไม (why)
- **ปัญหา:** ผู้พัฒนา (contributor) รัน `setup:dogfood` เพื่อ sync root กับ release ล่าสุด → ได้ payload เก่า + เครื่องมือรายงาน "เสร็จ" → เข้าใจผิดว่า sync แล้ว (dogfood env ไม่ตรง release จริง)
- **ผลถ้าไม่ทำ:** dogfood ที่ root ไม่เชื่อถือได้ — contributor test workflow บน payload เก่าโดยไม่รู้ตัว (เหมือนที่เพิ่งเจอ: root 0.17.0 ทั้งที่ release 0.18.0)
- **ไม่กระทบผู้ใช้ปลายทาง** — `setup-dogfood.mjs` เป็น dev-only (`src/scripts/`, ไม่อยู่ใน `package.json files`); `npx @warnyin/agents` / `--update` ของผู้ใช้ทำงานถูก (verified: cli.mjs --update เขียน core ใหม่ + stamp)

## 3. Root cause (confirmed — incomplete fix ของ TS#21 / regression v0.17.0)
| ชั้น | อาการ | root cause | code |
|---|---|---|---|
| **1 (trigger)** | `npx ... command not found` | bin name `warnyin-agents` ≠ scope-stripped `agents` → npx resolve เพี้ยน (ทุก OS) → fallback | `installViaNpx` line 128 |
| **A (why เก่า)** | fallback ดึง tarball เก่า | `installViaPack`'s `npm pack` **ขาด `npm_config_prefer_online`** ที่ `installViaNpx` มี → stale npm cache (asymmetry ขัด LR1 intent) | line 155 vs 133 |
| **B (false-success)** | รายงาน "สำเร็จ" ทั้งที่เก่า | `verifyInstalled` stamp ขาด → **blanket return true** (transition) — แต่ `expected` ≥ 0.17.0 (release ที่ 2 ที่มี stamp writer) → stamp ขาด = install ผิด ไม่ใช่ transition → **LR2 ไม่ถูก implement** | line 106-110 |

## 4. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A — fix 3 ชั้น (detection + cache-bust + npx bin)** (แนะนำ) | แก้ที่ root cause ทุกชั้น (defense-in-depth) + implement LR2 ที่ note ไว้ | แตะ 3 จุดใน 1 ไฟล์ | ✅ |
| B — fix แค่ชั้น B (detection) | เล็กสุด | ชั้น A ยังดึง payload เก่า (แค่ detect ได้ แล้ว fail) → setup ยัง fail บ่อย | |
| C — rewrite setup-dogfood | สะอาด | over-engineer; bug เฉพาะจุด | |

- **เหตุผลเลือก A:** ชั้น B (detect) อย่างเดียว = setup fail loud (ดีกว่า false-success แต่ยังใช้ไม่ได้); ต้อง + ชั้น A (cache-bust ให้ดึง payload ใหม่จริง) + ชั้น 1 (npx ให้ทาง fast กลับมาใช้ได้) → setup:dogfood ทำงานจริง. ตรง LR2 ที่ topic ก่อน note

## 5. Scope
**In scope**
- `src/scripts/setup-dogfood.mjs` — 3 fix:
  1. `installViaNpx` → explicit bin: `npx --yes -p <pkg>@<v> warnyin-agents --update` (ชั้น 1)
  2. `installViaPack` → npm pack เพิ่ม `npm_config_prefer_online` (symmetric) + extract `package.json` version เทียบ expected ก่อน `--update` (ชั้น A)
  3. `verifyInstalled` → stamp ขาด + `semverGte(expected, STAMP_MIN='0.17.0')` → **false** (active per LR2); expected < 0.17.0 → true (transition คงไว้) — เพิ่ม `semverGte()` pure helper (export, zero-dep) + `STAMP_MIN_VERSION` constant (ชั้น B)
- `src/tests/setup-dogfood.test.mjs` — เคสใหม่: stamp ขาด + expected≥0.17.0→false (active), expected<0.17.0→true (transition), `semverGte` unit
- Spec delta (feature `installer-version-stamp`) — **MODIFIED** scenario "stamp ขาด → transition"

**Out of scope**
- rewrite setup-dogfood / installer; packaging; ผู้ใช้ปลายทาง install path (ทำงานถูกแล้ว)

## 6. ผลกระทบ & ความเสี่ยง
- **กระทบ:** `verifyInstalled` (pure, export — มี unit เดิม); `installViaNpx`/`installViaPack` (spawn — black-box test)
- **ความเสี่ยง:**
  - *transition-safe regression* → ลดด้วย: คง transition true เมื่อ expected < 0.17.0 (semver-gated); unit ครอบทั้ง 2 ขั้ว (LR2 bootstrapping)
  - *semver compare zero-dep* → เขียน pure `semverGte` เอง + unit (numeric tuple compare, ทน prerelease ไม่ต้อง — internal version ล้วน)
  - *false-success เคยพลาด 2 รอบ (TS#21, version-check)* → panel + dry-run + test ครบ 2 ขั้ว

## 7. ลิงก์
- Design: `./design.md` · Tasks: `./tasks/` · Business: ข้าม (dev-tool bugfix)
