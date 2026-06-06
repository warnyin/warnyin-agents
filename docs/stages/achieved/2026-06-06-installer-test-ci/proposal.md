# Proposal — Test ของ installer + GitHub Actions CI

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `installer-test-ci` |
| **ประเภท** | `test / infra (chore)` |
| **ขนาด** | `กลาง` |
| **วันที่** | `2026-06-06` |
| **มาจาก Discovery?** | `ไม่มี` (มาจาก `docs/roadmap.md` P0 ข้อ 1-2) |

## 1. สรุป change (what)
> เราจะเปลี่ยน/สร้าง/แก้อะไร — 1-3 บรรทัด

เพิ่ม **automated test ของ installer** (`bin/cli.mjs`) ด้วย `node:test` (zero-dep) ที่ spawn CLI จริงในโฟลเดอร์ชั่วคราว แล้วตรวจพฤติกรรม 4 อย่าง + เพิ่ม **GitHub Actions CI** ที่รัน test ทุก PR (matrix node 20/22/24) และ `npm pack` ยืนยันว่า `.warnyin/` dotfolder ติดไปใน package จริง

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** `bin/cli.mjs` คือหัวใจที่ผู้ใช้ทุกคนรันตอนติดตั้ง แต่ปัจจุบันทดสอบ**ด้วยมือล้วน** ไม่มี test/CI เลย — เพิ่งปล่อย **0.6.0 ซึ่งเป็น breaking change** (ย้ายโครง `warnyin/`→`.warnyin/`+`docs/stages`) ความเสี่ยง regression สูง
- **กับดักที่เจอจริง:** ตอนย้ายโครง พบว่า dotfolder `.warnyin/` เกือบหลุดจาก `npm pack` (npm รวม dotfolder ก็ต่อเมื่อระบุใน `files` ชัด) — ถ้าพลาดคือ published package ไม่มี playbook = ใช้ไม่ได้เลย ต้องมี check อัตโนมัติดักจุดนี้
- **ผลถ้าไม่ทำ:** ทุกการแก้ installer / โครงไฟล์ ต้องทดสอบมือซ้ำ ๆ เสี่ยงปล่อย package เสียขึ้น npm โดยไม่รู้ตัว

## 3. ทางเลือกที่พิจารณา

**3.1 Test runner**
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. `node:test` (built-in) | zero-dependency (คง devDeps ว่าง), ตรงปรัชญากระทัดรัด, ไม่มี supply-chain risk | DX น้อยกว่า vitest (ไม่มี watch UI สวย ๆ) | ✅ |
| B. vitest | DX ดี (watch/snapshot) | เพิ่ม devDependency ก้อนใหญ่ + ตอกราคา install ขัดปรัชญา zero-dep | |

**3.2 วิธี test**
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. black-box spawn `node bin/cli.mjs` | ทดสอบพฤติกรรมจริง, ไม่ต้องแตะ `cli.mjs`, robust ต่อการ refactor ภายใน | ช้ากว่า unit (spawn process + I/O จริง) | ✅ |
| B. refactor cli.mjs ให้ export function แล้ว unit test | เร็วกว่า | ต้องรื้อ `cli.mjs` (เพิ่ม scope + เสี่ยง regression ในตัวที่จะทดสอบ) | |

- **เหตุผลที่เลือก:** ทั้งสองข้อยึดปรัชญา **กระทัดรัด + ไม่เพิ่มความเสี่ยง** — zero-dep และไม่แตะโค้ดที่กำลังจะทดสอบ

## 4. Scope
**In scope**
- `tests/installer.test.mjs` — test พฤติกรรมหลักของ installer (วางโครง, idempotent, `--update` ไม่ทับงานจริง, `installRootDoc` append, legacy 2 branch, `seedDocs` ข้าม `[...]`, `--dry-run` ไม่เขียน — ดูเคสครบใน `design.md` §4)
- `package.json` — เพิ่ม `scripts.test` = `node --test tests/` + bump `engines.node` → `>=20`
- `.github/workflows/ci.yml` — รัน test (matrix 20/22/24, **ไม่ใช้ `npm ci`/cache** — zero-dep) + pack-verify (`.warnyin/` ติด & `tests`/`.github` ไม่ติด); `permissions: contents: read`, `on: pull_request`
- `CHANGELOG.md` — บันทึกขั้นต่ำของ topic นี้ (engines >=20, +test/CI) — decision จาก review panel

**Out of scope**
- ไม่ทดสอบ logic ภายใน playbook/stage (เป็น .md ไม่ใช่โค้ดรัน)
- ไม่ตั้ง release automation / publish workflow (เป็น roadmap แยก)
- ไม่ refactor `cli.mjs`

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** `package.json` (เพิ่ม `scripts.test`, bump `engines.node` `>=18`→`>=20`) — node 18 EOL แล้ว ไม่กระทบผู้ใช้ที่ maintained
- **ความเสี่ยง + วิธีลด:**
  - test spawn process จริงบน Windows + Linux → ต้องใช้ path-cross-platform (`process.execPath`, `path.join`) ไม่ hardcode `node`/`/`
  - temp dir ต้อง cleanup เสมอแม้ test fail → ใช้ `t.after()` / try-finally
  - bump `engines.node` เป็น breaking เล็ก ๆ → ระบุใน CHANGELOG (roadmap P0 ข้อ 3) ภายหลัง

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Roadmap ต้นเรื่อง: `../../roadmap.md` (P0 ข้อ 1-2)
