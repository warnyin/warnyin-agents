# Test plan — installer-test-ci

> Output ของ VERIFY stage · playbook: `.warnyin/workflow/stages/verify.md`
> strategy tester · วันที่: 2026-06-06 · ผู้เทส: VERIFY (role QA)

## 1. จุดประสงค์ที่ต้อง verify (จาก proposal/design)
topic นี้ส่งมอบ **ความมั่นใจว่า installer (`bin/cli.mjs`) ถูกต้อง** ผ่าน 2 slice:
1. รัน `npm test` แล้วยืนยัน installer ถูก 8 พฤติกรรม — local รันได้จริง
2. เปิด PR แล้ว CI เขียวอัตโนมัติ + ยืนยัน package พร้อม publish (`.warnyin/` ติด, `tests`/`.github` ไม่ติด)

> ไม่ใช่ FE — **ไม่มี UX/UI ให้ verify** · guideline: ไม่มี `docs/techstack/`/`infra.md` (tooling repo) → เขียนแผนเอง

## 2. วิธีเทส (เลือกเอง — ไม่มี techstack guideline)
| # | สิ่งที่ verify | วิธี (local env จริง) | เกณฑ์ผ่าน |
|---|---|---|---|
| V1 | test harness ทำงานจริง (slice 1) | `npm test` บนเครื่อง dev (Windows, node 24) | 8/8 pass, 0 fail |
| V2 | package พร้อม publish (slice 2) | `npm pack --dry-run --json` + apply allowlist เหมือน `verify-pack.mjs` | `.warnyin/` ติด · ไม่มีไฟล์นอก allowlist · `tests`/`.github`/`scripts` ไม่รั่ว |
| V3 | CI contract (slice 2) | อ่านทาน `ci.yml` ตาม security contract (design §5/§9) | `permissions: contents:read` · ไม่มี `pull_request_target` · ไม่มี `secrets.*` · SHA-pin · matrix [20,22,24] · ไม่มี `npm ci`/cache |
| V4 | CI เขียวจริงบน PR | push + เปิด PR ดู GitHub Actions | matrix เขียวทุก node — **outward-facing, ต้องขออนุมัติ** |
| V5 | **เจตนา "package สะอาด" (จุดประสงค์ slice 2)** | dry-run installer ใน temp → ตรวจว่า copy อะไรไป target | ผู้ใช้ปลายทางได้เฉพาะ scaffold เปล่า ไม่ได้งานจริงของ repo |

## 3. ผลเทส

### รอบ 1 — เจอ finding
- **V1 ✅** — `npm test` 8/8 เขียว (node v24.14.0), ~1.75s
- **V2 ✅** — pack 84 ไฟล์, `.warnyin/workflow/` ติด, `unexpected: []`, ไม่มี `tests`/`.github`/`scripts` รั่ว → PASS
- **V3 ✅** — `ci.yml` ตรง contract ทุกข้อ
- **V4 ⏸** — ต้อง push (outward) รอตัดสินใจ user
- **V5 ✖ พบ finding (scaffold leak)** — installer copy `docs/stages/installer-test-ci/**` (16 ไฟล์ dogfood) ลง target ผู้ใช้ + ติด published package — pack-verify เดิมจับไม่ได้ (allowlist อนุญาต `docs/stages/` ทั้ง prefix)

### รอบ 2 — หลังแก้ (user decision: "สร้างไฟล์แทน ไม่ copy") · **จำนวนรอบแก้ = 1**
แก้ 4 ไฟล์: `bin/cli.mjs` (`ensureScaffold()` generate เปล่าแทน `copyTree`), `package.json` (ตัด `docs/stages` จาก `files`), `scripts/verify-pack.mjs` (ตัด `docs/stages/` จาก allowlist + guard `docs/` leak), `tests/installer.test.mjs` (+เคส 9)
- **V1 ✅** — `npm test` **9/9** เขียว
- **V2 ✅** — pack **68 ไฟล์** (ตัด docs/stages 16 ออก), `docs/` leak `[]`, `unexpected: []` → PASS
- **V3 ✅** — `ci.yml` contract ไม่เปลี่ยน
- **V5 ✅** — ติดตั้งจริงใน temp → สร้างแค่ `docs/stages/context.md` + `achieved/.gitkeep`, **topic leak = 0**
- **V4 ⏸** — ยังรอ user (push + PR + ดู CI เขียวจริง — outward-facing)
