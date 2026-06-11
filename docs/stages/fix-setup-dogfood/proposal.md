# Proposal — fix-setup-dogfood

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `fix-setup-dogfood` |
| **ประเภท** | `bugfix` (dev-tooling) |
| **ขนาด** | `standard` |
| **วันที่** | 2026-06-11 |
| **มาจาก Discovery?** | ไม่มี (root cause investigate จากโค้ดจริง — `setup-dogfood.mjs` + `cli.mjs`) |

## 1. สรุป change (what)
> แก้ `src/scripts/setup-dogfood.mjs` 2 จุดที่ทำให้ sync root dogfood ไม่สำเร็จ: (1) เพิ่ม `--update` ให้ install เขียนทับ CORE เดิม (2) เปลี่ยน success-detection จาก "เชื่อ exit 0" เป็น **verify side-effect** (เช็คว่าไฟล์ลง root จริง) — ไม่ผ่าน → fallback `installViaPack` + เพิ่ม unit test

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** หลัง publish release ใหม่ `setup:dogfood` ไม่ refresh root dogfood — (1) ไม่มี `--update` → cli `copyTree({overwrite:false})` **ข้าม CORE เดิม** (`cli.mjs:119`); (2) `installViaNpx` เชื่อ `exit 0` (`:48`) → npx exit 0 โดยไม่ install จริง (bin resolution เพี้ยน) → return true → **ไม่ fallback** → root ไม่เปลี่ยน แต่รายงาน "เสร็จ" (false-green)
- **ผลถ้าไม่ทำ:** ทุก release ต้อง manual mirror CORE → root เอง (workaround ที่เพิ่งทำใน topic `discovery-mode-selector`); dogfood ใช้ playbook เก่าเงียบๆ → dev เห็นพฤติกรรมผิดจากที่ publish

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A (แนะนำ): --update + verify side-effect + fallback** | แก้ทั้ง 2 root cause; robust ไม่พึ่งว่า npx bin จะ resolve ได้ (verify side-effect จับ false-green) | เพิ่ม logic detection | ✅ |
| B: แค่เพิ่ม --update | เล็กสุด | ไม่แก้ #2 (npx false-green ยังเงียบ) | ✗ |
| C: ทิ้ง npx ใช้ installViaPack อย่างเดียว | เลี่ยง npx bin issue | ช้ากว่า (npm pack ทุกครั้ง); npx เป็น happy-path ที่เร็ว | ✗ |
| D: สืบ/แก้ npx bin resolution ลึก | แก้ที่ต้นตอ npx | root cause env-specific (mac npx cache), อาจคุมไม่ได้; verify side-effect ครอบได้โดยไม่ต้องรู้ | ✗ |

- **เหตุผลที่เลือก A:** verify side-effect = robust ไม่ว่า npx bin จะ resolve ได้หรือไม่ (ถ้าไม่ install จริง → fallback); `--update` แก้ #1 ตรงตัว; คง npx happy-path (เร็ว) + pack fallback (เชื่อถือได้)

## 4. Scope
**In scope**
- `src/scripts/setup-dogfood.mjs` — เพิ่ม `--update` (npx + pack paths) + `verifyInstalled()` side-effect check + export/main-guard (testable)
- `src/tests/setup-dogfood.test.mjs` — unit test `verifyInstalled` (สร้างใหม่)
- `CHANGELOG.md` — entry Fixed

**Out of scope**
- ไม่แก้ `cli.mjs` (`--update`/`copyTree` ทำงานถูกแล้ว — setup-dogfood แค่ไม่ส่ง flag)
- ไม่สืบ/แก้ npx bin resolution ที่ระดับ npm/npx (env-specific — verify side-effect ครอบแล้ว)
- ไม่แตะ `setup-sandbox.mjs` (install src→temp, คนละ path ไม่มีปัญหานี้)

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** `setup-dogfood.mjs` (dev-only, ไม่ publish) — backward-compatible (เพิ่ม flag + verify); ไม่กระทบ installer behavior สาธารณะ
- **ความเสี่ยง + วิธีลด:**
  - *`--update` เขียนทับงานจริง?* → CORE เท่านั้น (playbook/command/template); `--update` ไม่แตะ `docs/`/scaffold (cli.mjs แยก CORE จาก seed/scaffold แล้ว)
  - *verify side-effect false-negative* (เช็คผิด path) → เลือก path ที่ install ลงแน่ (`.warnyin/workflow/stages/` + `.claude/commands/warnyin/`) ตาม CORE list
  - *test spawn npx จริง ช้า/flaky* → unit test เฉพาะ `verifyInstalled` (pure, ไม่ spawn); integration เชิง spawn = defer

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
