# Proposal — แยก source ไป `src/` + dogfood ด้วย release (bootstrap)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **สถานะ: CONFIRMED** — 5 open questions ปิดครบแล้ว (ดู §5)

| | |
|---|---|
| **Slug** | `src-bootstrap` |
| **ประเภท** | `chore / architecture (internal restructure)` |
| **ขนาด** | `ใหญ่` |
| **วันที่** | `2026-06-06` |
| **มาจาก Discovery?** | `ไม่มี` (มาจากคำถามเชิงสถาปัตยกรรมของ user) |

## 1. สรุป change (what)
แยก **source ของ warnyin ทั้งหมด (v-next ที่กำลังพัฒนา = สิ่งที่ publish)** ไปไว้ใน `src/` แล้วให้ repo นี้ **install warnyin release เสถียร** ที่ root (`.warnyin/`, `.claude/`, `CLAUDE.md`, `AGENTS.md` — gitignored) เพื่อใช้ dogfood พัฒนา `src/` เอง — เป็น **bootstrapping / self-hosting pattern** (เทียบ: compiler ที่ compile ตัวเองด้วยเวอร์ชันก่อนหน้า)

## 2. ทำไม (why)
- **ปัญหาปัจจุบัน:** repo ปนกัน 2 บทบาท — source ของ tool **กับ** workflow ที่ใช้พัฒนา เป็นไฟล์ชุดเดียวกันที่ root (`.warnyin/`, `.claude/` เป็นทั้ง source และตัวที่ dogfood ใช้)
- **โอกาส:** แยกชัด → พัฒนา v-next ที่ "อาจพัง" ได้โดย workflow ที่ใช้ทำงานยังเสถียร + dogfood ด้วย **ประสบการณ์ผู้ใช้จริง** (ผู้ใช้ก็ install release มาใช้)
- **ผลถ้าไม่ทำ:** ทุกการแก้ตัว workflow เสี่ยงกระทบงานที่กำลังทำใน session เดียวกัน (แก้ playbook ผิด = workflow ตัวเองพังทันที)

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. self-host จาก source (สถานะปัจจุบัน) | เรียบง่าย source เดียว, เห็นผลแก้ workflow ทันที | dogfood ด้วยตัวที่กำลังแก้ (เสี่ยงพังกลางงาน) | — (baseline) |
| B. bootstrap — `src/` แยก + install release dogfood | แยกชัด, เสถียรระหว่างพัฒนา, dogfood = UX จริง | ซับซ้อนขึ้น (2 layer), version skew, collision ที่ root | ✅ **เลือก** |
| C. ใช้ branch แยกพัฒนา v-next (ไม่ restructure) | เบาสุด ไม่แตะโครง | ไม่ได้ "src แยก" เชิงโครงสร้างที่ user ต้องการ | — |

## 4. โครงเป้าหมาย (CONFIRMED)
```
src/                                    ← SOURCE warnyin v-next ทั้งหมด (mirror target paths)
  bin/cli.mjs                           ← installer (npm bin → src/bin/cli.mjs)
  tests/installer.test.mjs              ← black-box test (dev-only, ห้ามหลุด package)
  scripts/verify-pack.mjs               ← pack-verify gate (dev-only, ห้ามหลุด package)
  .warnyin/workflow/  .warnyin/template/
  .warnyin/installer/templates/CLAUDE.md
  .claude/commands/warnyin/  .claude/agents/
  AGENTS.md                             ← payload adapter (Codex/Antigravity)
package.json  README.md  CHANGELOG.md  LICENSE   ← repo meta (root)
CONTRIBUTING.md                         ← dev-instructions ของ repo เอง (จาก root CLAUDE.md เดิม)
docs/                                   ← ความรู้ถาวร repo (rule/troubleshooting/techstack/codemap)
.github/workflows/ci.yml                ← CI (ต้องอยู่ root — GitHub อ่านเฉพาะ .github/ ที่ root)

▼ installed จาก release (gitignored, regenerate ด้วย `npm run setup:dogfood`):
.warnyin/  .claude/{commands/warnyin,agents}  CLAUDE.md  AGENTS.md
```

## 5. ✅ Decisions (open questions ปิดครบ — 2026-06-06)
1. **installed artifacts ที่ root:** `gitignore` + `npm run setup:dogfood` regenerate (repo สะอาด เหลือ `src/` เป็น source จริง; แลกกับ bootstrap step ตอน clone)
2. **dev-instructions ของ repo:** ย้ายไป **`CONTRIBUTING.md`** (committed, installer ไม่แตะ); `setup:dogfood` regenerate `CLAUDE.md` (workflow section จาก release) + ชี้ให้อ่าน `CONTRIBUTING.md`
3. **bin/cli.mjs + tests/ + scripts/:** **ย้ายเข้า `src/`** ทั้งหมด — `src/` = ทุกอย่างของ warnyin จริง; npm `bin` ชี้ `src/bin/cli.mjs`; `files` allowlist ต้อง exclude `src/tests` + `src/scripts`
4. **dogfood install:** จาก **npm release `npx @warnyin/agents@latest`** (เสถียรจริง = UX ผู้ใช้)
5. **src/ layout:** **mirror target paths** — `src/.warnyin/`, `src/.claude/`, `src/AGENTS.md` (installer copy `src/* → target/*`; `pkgRoot` resolve เป็น `src/` อัตโนมัติ)
6. **test v-next (version skew):** `npm run setup:sandbox` — install จาก `src/` ลง temp dir แยก แล้วลอง session ใน sandbox (dogfood env ที่ root ไม่โดนแตะ); automated test (`src/tests/`) install ลง temp อยู่แล้ว

## 6. Scope
**In scope:** ย้าย source→`src/` (รวม bin/tests/scripts), ปรับ `src/bin/cli.mjs` (pkgRoot/guard) + `package.json` (bin/files/scripts) + `src/scripts/verify-pack.mjs` allowlist ให้ตรงโครงใหม่, กลไก dogfood (`.gitignore` + `setup:dogfood` + `setup:sandbox`), แยก `CONTRIBUTING.md` จาก root CLAUDE.md, transition plan (git mv + bootstrap install ครั้งแรก), อัปเดต test suite (9 เคสเดิม) + `docs/techstack/installer/` + `docs/codemap` ให้ตรงโครงใหม่
**Out of scope:** ไม่เปลี่ยนเนื้อหา playbook/workflow เอง (แค่ย้ายที่อยู่), ไม่ publish เวอร์ชันใหม่ขึ้น npm ใน topic นี้ (แต่ต้อง bump version + CHANGELOG ตาม rule)

## 7. ความเสี่ยงที่ design ต้องคุม
- **R1 — dotfolder ใน `src/` ตอน pack** (บทเรียน 0.6.0): `src/.warnyin/` + `src/.claude/` เป็น dotfolder nested ใต้ `src/` — npm อาจตกหล่น → `verify-pack` ต้อง assert ติดครบ
- **R2 — `src/tests` + `src/scripts` หลุดขึ้น package**: tooling ปนใน `src/` → `files` allowlist ต้อง granular (เลือก subpath) + `verify-pack` denylist
- **R3 — bootstrap gap ตอน transition**: git mv `.warnyin`/`.claude` ออกจาก root → dogfood พังชั่วคราวจน `setup:dogfood` รันเสร็จ (one-time, ต้อง document ลำดับ)
- **R4 — `node --test` discovery หลังย้าย tests ไป `src/tests`**: ต้องผ่าน node 20/22/24 (บทเรียน troubleshooting #3 — เลี่ยง path arg)

## 8. ลิงก์
- บริบทที่ ship แล้ว: `docs/techstack/installer/`, `docs/rule.md`, `docs/codemap/`, achieved `2026-06-06-installer-test-ci`
- Design (how): `./design.md`
