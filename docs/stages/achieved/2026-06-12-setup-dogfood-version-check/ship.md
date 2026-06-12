# Ship report — setup-dogfood-version-check

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md` · ship date: 2026-06-12
> ที่มา: GitHub issue #3 (false-green รอบ 2) · follow-up ของ topic `fix-setup-dogfood`

## 1. สรุปส่งมอบ
ปิดวงจร topic — promote ความรู้ขึ้น `docs/` + archive. แก้ false-green รอบ 2: payload มี version identity (stamp) + `setup:dogfood` verify เทียบค่า version (transition-safe) แทน marker-existence

## 2. Feature
- **ใหม่:** `docs/features/installer-version-stamp/` (feature.md + business.md + spec.md) — "Installer version stamp + drift-aware dogfood verify"
  - spec.md: 2 Requirement — (1) installer เขียน version stamp (5 scenario: project/update/dry-run/global/no-leak) · (2) setup:dogfood จับ drift ด้วย stamp (6 scenario: match/drift/transition/degrade/normalize/wire-proof)
- **Spec delta:** ADDED only (ไม่มี MODIFIED/REMOVED → ไม่มี STOP)

## 3. Learned-rule (promote — user ยืนยันทั้ง 2)
| # | rule | scope | ปลายทาง |
|---|---|---|---|
| LR1 | install-verification: verify เทียบ **ค่า version** (stamp identity) ไม่ใช่แค่ existence; external-version query parse ทน noise (pure fn) + degrade graceful + warn loud; pin-exact กัน stale | component:installer | `docs/techstack/installer/rule.md` (ขยาย bullet "verify side-effect" — unify-in-place) |
| LR2 | bootstrapping transition-safe: feature ที่ verify ด้วย artifact ที่ตัวเองสร้าง → รุ่นเก่าไม่ false-fail (degrade); active เต็มหลัง ≥2 release; บันทึก snapshot จริง | component:installer | `docs/techstack/installer/rule.md` (bullet ใหม่) |

## 4. เอกสารกลางที่อัปเดต
| ไฟล์ | สาระ |
|---|---|
| `docs/features/installer-version-stamp/` | **สร้างใหม่** — feature.md + business.md + spec.md |
| `docs/techstack/installer/rule.md` | LR1 (ขยาย verify-side-effect) + LR2 (transition-safe) |
| `docs/techstack/installer/structure.md` | verifyInstalled(root,expected) + stamp helpers (writeVersionStamp/readPkgVersion/readStamp/parseNpmViewVersion/resolveExpectedVersion); test counts (installer 21, verify-pack 11, setup-dogfood 14); cli flow + writeVersionStamp |
| `docs/techstack/installer/test.md` | counts อัปเดต + section "verify version-stamp / drift-aware install" (behavioral via setup:sandbox/verifyInstalled, drift true/false คู่, transition snapshot) |
| `docs/infra.md` | network-to-registry req ของ setup:dogfood · env `npm_config_prefer_online` · version stamp artifact note |
| `docs/troubleshooting.md` | เสริม KB#4 (verify:pack ENOENT Windows) — unit gate + npm pack เป็น gate หลัก + stamp-deny เคส |
| `docs/codemap/{architecture,index}.md` | writeVersionStamp ใน cli flow · version-aware setup-dogfood |

## 5. Note ที่ตัดทิ้ง / ไม่ promote (พร้อมเหตุผล)
- **TS-2 (degrade warn ใน test output)** — เป็น **expected behavior** (design §4B warn loud) ไม่ใช่ปัญหา → ไม่ promote เป็น troubleshooting
- **TS-1 (verify:pack ENOENT)** — KB#4 มีอยู่แล้ว → เสริม pointer เท่านั้น ไม่สร้าง entry ใหม่ (เจอซ้ำ)
- **CHANGELOG merge conflict (2 worktree)** — integration mechanics ที่ build-orchestration rule ครอบแล้ว → ไม่ promote เป็น rule ใหม่

## 6. Defer ที่เหลือ (รับทราบ)
- **integration end-to-end** (`setup:dogfood` จริงจับ drift) — รอ publish ≥2 release ที่มี stamp (transition window); snapshot บันทึกใน verify.md/feature.md/rule.md LR2
- **GitHub issue #3** — comment "fix อยู่ใน branch build/setup-dogfood-version-check รอ merge+publish" (ยังไม่ปิด — ปิดตอน release จริง)

## 7. Archive
`docs/stages/setup-dogfood-version-check/` → `docs/stages/achieved/2026-06-12-setup-dogfood-version-check/` (git mv)

---
**topic ปิดสมบูรณ์** (เอกสาร + archive) · โค้ดอยู่ branch `build/setup-dogfood-version-check` (merge → main + publish จัดการนอก workflow)
