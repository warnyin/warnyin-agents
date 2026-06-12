# Proposal — setup:dogfood version-aware verify (กัน false-green รอบ 2)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `setup-dogfood-version-check` |
| **ประเภท** | `bugfix` |
| **ขนาด** | `standard` (logic ใหม่ + แตะ 2 ไฟล์ source: `cli.mjs` + `setup-dogfood.mjs`; ก้ำกึ่ง fast/standard → ปัดขึ้น) |
| **วันที่** | `2026-06-12` |
| **มาจาก Discovery?** | `ไม่มี` (มาจาก GitHub issue #3 เปิดผ่าน `/warnyin:feedback:issue`) |

## 1. สรุป change (what)
ทำให้ `npm run setup:dogfood` จับ **version drift** ได้จริง: (1) `cli.mjs` เขียน version stamp (`.warnyin/.warnyin-version`) ลง target ตอน install/`--update`; (2) `setup-dogfood.mjs` query latest จาก registry → pin exact version + `--prefer-online` (กัน stale npx cache) → `verifyInstalled()` เทียบ stamp กับ expected แทนการเช็คแค่ marker มีอยู่.

## 2. ทำไม (why)
- **ปัญหา (issue #3 — false-green รอบ 2):** `npx --yes @warnyin/agents@latest --update` resolve dist-tag `latest` จาก **npx cache เก่า** → cli copy CORE จาก tarball เวอร์ชันเก่า → payload ใหม่ของ release ล่าสุดไม่ลง root จริง. `verifyInstalled()` เช็คแค่ CORE marker *มีอยู่* (`discovery.md` + `.claude/commands/warnyin` dir) ซึ่ง**เวอร์ชันเก่าก็มี** → ผ่าน → ไม่ fallback → รายงาน "เสร็จ" ทั้งที่ stale.
- **ทำไมรอบแก้เดิม (TS-1) ไม่ครอบ:** topic `fix-setup-dogfood` แก้เคส "ไม่ install เลย / ไม่มี `--update`" ด้วย marker-existence check — แต่ **marker-existence จับ version drift ไม่ได้** (เวอร์ชันเก่าก็มี marker ครบ).
- **root cause ที่แท้:** payload ที่ root **ไม่มี version identity เลย** (`cli.mjs --update` ไม่เขียน stamp; `.warnyin/`/`.claude/` ไม่มี `package.json`) → "ตรวจ drift ที่ root ไม่ได้" โดยโครงสร้าง.
- **ผลถ้าไม่ทำ:** ทุก release ใหม่ เสี่ยง dogfood env ที่ root เป็นเวอร์ชันเก่าเงียบๆ → ทำงาน/ทดสอบ workflow บน payload ผิดเวอร์ชันโดยไม่รู้ตัว (เสีย trust ของ setup:dogfood ในฐานะ regen gate).

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A — version stamp ใน installer** (cli เขียน `.warnyin/.warnyin-version`; setup-dogfood pin exact + verify stamp) | verify drift ที่ root จริง (ตรง proposed fix); แก้ root cause "payload ไม่มี version identity"; generalize — ผู้ใช้ `--update` ทั่วไปก็รู้เวอร์ชันที่ติดตั้ง | แตะ installer สาธารณะ (+1 ไฟล์ทุก install); ต้องเพิ่ม CHANGELOG/verify-pack-awareness/test | ✅ |
| B — เฉพาะ setup-dogfood (pin exact + `--prefer-online` + assert tarball version ก่อน copy) | scope แคบ ไม่แตะ installer | verify ไม่ลึกถึง "version ที่ root หลัง copy" (เชื่อว่า pin exact → ลงตรง); ไม่ generalize | |
| C — content marker เพิ่ม (เช็คไฟล์ใหม่เฉพาะ release) | ไม่แตะ installer | เปราะ — ต้อง maintain รายการ "ไฟล์ใหม่" ต่อ release; verifyInstalled ต้องรู้ payload เฉพาะ | |

- **เหตุผลที่เลือก A:** ตรง proposed fix ของ issue (เทียบ version จริง) + แก้ root cause ที่ระดับโครงสร้าง (version identity) + เป็นประโยชน์กว้าง (version stamp = standard practice ของ installer). ผู้ใช้ยืนยันเลือก A.

## 4. Scope
**In scope**
- `src/bin/cli.mjs` — เขียน `.warnyin/.warnyin-version` (= `package.json` version) ลง target หลัง copy CORE ทั้ง mode `project` + `global`; เคารพ `--dry-run`; idempotent
- `src/scripts/setup-dogfood.mjs` — `resolveExpectedVersion()` (`npm view`), pin exact version + `--prefer-online`, `verifyInstalled(root, expected)` เทียบ stamp
- unit test: `cli.mjs` เขียน stamp (black-box spawn) · `verifyInstalled` stamp match/mismatch/missing/degrade
- `CHANGELOG.md` — Added (version stamp) + Fixed (false-green รอบ 2)

**Out of scope**
- ไม่เปลี่ยนพฤติกรรม install mode (project/global resolution), `seedDocs`, `installRootDoc`, scaffold
- ไม่เพิ่ม dependency (zero-dep คงเดิม — ใช้ `npm view`/`npx` ที่มีอยู่)
- ไม่ทำ auto-migration ของ payload เก่าที่ไม่มี stamp (จัดการด้วย transition-safe semantics — ดู design §6)
- ไม่แตะ `setup-sandbox.mjs`

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** installer install/`--update` (เพิ่มไฟล์ stamp — user-facing, ต้อง CHANGELOG); `verify-pack` denylist (ยืนยัน stamp เป็น install-time artifact ที่ target ไม่หลุดขึ้น tarball); `verifyInstalled` signature (เพิ่ม optional param — backward compatible)
- **ความเสี่ยง + วิธีลด:**
  - **Bootstrapping/transition** — registry `@latest` ปัจจุบัน (≤0.16.0) **ยังไม่มี stamp writer** → ถ้า verify บังคับ stamp จะทำ dogfood พังช่วง dev release ถัดไป → **ลด:** transition-safe semantics — stamp *ขาด* → marker-only (degrade + warn); stamp *มีแต่ค่าไม่ตรง* → fail (= drift จริง) — ดู design §6
  - **Network dependency** — `npm view` ต้อง network → **ลด:** query fail → degrade เป็น `@latest` + marker-only + warn (ไม่ block; offline = install ก็ fail เองอยู่แล้ว)
  - **`npm view`/`npx` cross-platform (win .cmd)** — **ลด:** reuse pattern เดิม (`isWin ? 'npm.cmd' : 'npm'`, `shell:isWin` เฉพาะ npx)

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- ที่มา: GitHub issue #3 · follow-up ของ `docs/stages/achieved/2026-06-11-fix-setup-dogfood/`
