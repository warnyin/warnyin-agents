# CONTRIBUTING — @warnyin/agents

คู่มือสำหรับ **contributor / maintainer** ของ repo `@warnyin/agents` (Warnyin Standard Workflow installer)

> นี่คือเอกสารพัฒนา **ตัว repo เอง** — ไม่ใช่ playbook ที่ผู้ใช้ปลายทางได้ตอน `npx @warnyin/agents`
> ภาพรวมสถาปัตยกรรม + how-to ของ workflow อยู่ใน `src/.warnyin/workflow/README.md` และ `docs/`

## repo นี้คืออะไร (สถาปัตยกรรม bootstrap / self-hosting)
repo นี้แยกเป็น **2 layer ขาดจากกัน**:

- **SOURCE layer — `src/`** (committed, publish): warnyin v-next ที่กำลังพัฒนา = สิ่งที่ publish ขึ้น npm
  - `src/bin/cli.mjs` — installer (npm `bin` ชี้มาที่นี่)
  - `src/.warnyin/workflow/`, `src/.warnyin/template/` — playbook กลาง + template
  - `src/.claude/commands/warnyin/`, `src/.claude/agents/` — slash command + reviewer subagent
  - `src/AGENTS.md` — payload adapter สำหรับ Codex/Antigravity
  - `src/tests/`, `src/scripts/` — test + dev tooling (**dev-only, ไม่ publish**)
- **DOGFOOD layer — root** (`.warnyin/`, `.claude/{commands/warnyin,agents}`, `CLAUDE.md`, `AGENTS.md`): **gitignored** — ติดตั้งจาก **release เสถียร** ด้วย `npm run setup:dogfood` เพื่อใช้ workflow ทำงานพัฒนา `src/` เอง (เทียบ compiler ที่ compile ตัวเองด้วยเวอร์ชันก่อนหน้า)

แนวคิด: แก้ v-next ที่ "อาจพัง" ได้ โดย workflow ที่ใช้ทำงานยังเสถียร (เป็น release จริงที่ผู้ใช้ก็ได้ → dogfood = UX จริง)

## เริ่มต้น (clone ใหม่)
```bash
git clone <repo>
cd warnyin-teams
npm run setup:dogfood      # ติดตั้ง release เสถียรลง root (gitignored) → เปิด Claude Code ที่ root ใช้ /warnyin:* ได้
```
> หลัง clone ต้อง `setup:dogfood` ก่อน ถึงจะมี `.warnyin/`/`.claude/` ที่ root ให้ workflow ทำงาน
> **review payload diff** ของ root `.warnyin`/`.claude`/`CLAUDE.md` ก่อนเปิด session ทุกครั้ง (payload ถูก agent execute ต่อ)

## หลักการพัฒนา (rule)
- **zero-dependency** — ใช้เฉพาะ built-in `node:*` (ไม่มี runtime/dev dependency); `package.json` ไม่มี `dependencies`/`devDependencies`
- **ESM** — `import`/`export`, หา path ด้วย `fileURLToPath(import.meta.url)` (ห้าม `__dirname`/`require`)
- **cross-platform** — `path.join` ทุกที่ (ห้าม `/` literal), `os.tmpdir()` (ห้าม hardcode `/tmp`), spawn ด้วย array args ห้าม `shell:true` (ยกเว้น `npx` บน Windows ที่เป็น `.cmd`)
- **idempotent** — installer/setup script รันซ้ำต้องไม่พัง/ไม่ append ซ้ำ (marker check ก่อน append)
- **ข้อความผู้ใช้/คอมเมนต์ภาษาไทย**
- **`package.json files` = allowlist** — `src/tests/`, `src/scripts/` ห้ามหลุด publish (ยืนยันด้วย `npm run verify:pack`)
- **CHANGELOG ทุก user-facing change** + bump version (`CHANGELOG.md`)
- รายละเอียดเต็ม: `docs/rule.md` + `docs/techstack/installer/`

## พัฒนา v-next ใน `src/`
1. แก้ไฟล์ใน `src/` (playbook ใน `src/.warnyin/workflow/`, installer ใน `src/bin/cli.mjs` ฯลฯ)
2. รัน test: `npm test` (black-box install ลง temp dir — ไม่แตะ root)
3. ลอง v-next แบบ end-to-end ด้วย `npm run setup:sandbox` (ดูด้านล่าง)

## ทดสอบ v-next (version skew) — `setup:sandbox`
```bash
npm run setup:sandbox      # ติดตั้ง src/ (v-next) ลง temp dir แยก → print path
```
- script `mkdtemp` ใน `os.tmpdir()` แล้วรัน `node src/bin/cli.mjs` install v-next ลง sandbox นั้น
- เปิด Claude Code ที่ path ที่ print ออกมา → ลอง `/warnyin:*` ด้วย v-next โดย **dogfood ที่ root ไม่โดนแตะ**
- automated: `npm test` ก็ install ลง temp อยู่แล้ว (black-box เคส)

## npm scripts
| script | ทำอะไร |
|---|---|
| `npm test` | black-box test installer (`node --test`, discover `src/tests/*.test.mjs`) |
| `npm run verify:pack` | ตรวจ tarball: payload ติดครบ + tooling/docs ไม่หลุด (gate ก่อน publish) |
| `npm run setup:dogfood` | ติดตั้ง release เสถียรลง root (gitignored) — คืน dogfood env |
| `npm run setup:sandbox` | ติดตั้ง v-next จาก `src/` ลง temp dir — ทดสอบ version skew |

## โครงสร้าง workflow (5 stage)
`Discovery (optional) ▶ DESIGN ▶ BUILD ▶ VERIFY ▶ SHIP` — ครบทั้ง 5 stage
playbook กลางอยู่ที่ `src/.warnyin/workflow/stages/` (single source of truth)
**การเปลี่ยนพฤติกรรม stage ใดๆ ให้ user เป็นคนอธิบาย/ยืนยันก่อน อย่าเดาเอง**

## release flow
1. แก้ `src/` + เพิ่ม test + อัปเดต `docs/`
2. `npm test` เขียว + `npm run verify:pack` ผ่าน
3. bump version + เพิ่ม entry ใน `CHANGELOG.md`
4. `npm publish` (CI gate: `.github/workflows/ci.yml` รัน test matrix node 20/22/24 + pack-verify)
