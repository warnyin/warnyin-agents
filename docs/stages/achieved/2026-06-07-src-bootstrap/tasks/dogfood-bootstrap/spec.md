# Spec — dogfood-bootstrap

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะ task นี้ — กลไก dogfood/bootstrap (slice #4) · อ้าง `design.md` §3/§4.2/§4.5/§5.1-5.3/§9 BL-3

## 1. ชนิดของ task
`infra` (dev tooling + packaging/scaffold) — ไม่มี API/UI; เน้น §4 data-flow, §5 user-flow (contributor clone→setup), §7 test-flow

---

## 4. Data-flow
> โครงไฟล์ + การไหลของ payload ระหว่าง 2 layer (SOURCE `src/` ↔ DOGFOOD root) — ดู design §3

```
SOURCE (committed)                          DOGFOOD (root, gitignored)
src/.warnyin, src/.claude, src/AGENTS.md ──[release npx]──▶ /.warnyin /.claude/{commands/warnyin,agents} /CLAUDE.md /AGENTS.md
src/bin/cli.mjs ───────────────[setup:sandbox]──────────▶ <os.tmpdir()>/wy-sandbox-xxxx/  (v-next)
CONTRIBUTING.md (git mv จาก root CLAUDE.md) ◀── dev อ่าน
root CLAUDE.md (release payload) ──[setup:dogfood append pointer idempotent]──▶ "...ดู CONTRIBUTING.md"
```

- **`.gitignore` ใหม่ (root-anchored ทุกบรรทัด — design §3, SA S2/Infra S4):**
  `/​.warnyin/` · `/​.claude/commands/warnyin/` · `/​.claude/agents/` · `/CLAUDE.md` · `/AGENTS.md`
  > ★ ทุกบรรทัดต้องนำหน้า `/` (anchor root) — ถ้าเขียนลอย ๆ จะ match `src/.claude/agents/` ด้วย → **source หายจาก git** (denylist verify-pack ก็จับไม่ทันเพราะ git ไม่ track แล้ว)
- **docs collision (BL-3 / design §3,§4.5 ข้อ 4):** release installer รัน `seedDocs()` + `ensureScaffold()` ลง root ด้วย → seed จะวาง `docs/project.md`, `docs/infra.md` (จาก `.warnyin/template/docs/`) + scaffold วาง `docs/stages/achieved/.gitkeep` → เปื้อน committed `docs/`
  → **กันโดยสร้างไฟล์ทั้ง 3 เป็น repo doc จริงใน task นี้** → seedDocs/ensureScaffold เจอว่ามีอยู่แล้ว → **skip หมด** → `git status --porcelain docs/` ว่างหลัง setup:dogfood
  > seedDocs skip ทุกชื่อขึ้นต้น `[` (features/techstack template) + ไฟล์ที่มี อยู่แล้ว → เปื้อนจริงแค่ 3 ไฟล์นี้

## 5. User-flow
> contributor clone repo → ใช้งานได้ (design §5.1) · test v-next (design §5.2)

**A. dogfood (clone ใหม่):**
```
git clone → npm run setup:dogfood
  → npx --yes @warnyin/agents@latest (ลง root: .warnyin .claude CLAUDE.md AGENTS.md — ติด .gitignore)
  → append pointer "ดู CONTRIBUTING.md" ต่อท้าย root CLAUDE.md (idempotent — รันซ้ำไม่ซ้อน)
→ เปิด Claude Code ที่ repo root → /warnyin:* ทำงานด้วย workflow release เสถียร
→ พัฒนา v-next ใน src/ · อ่านวิธีพัฒนาใน CONTRIBUTING.md
```

**B. test v-next (version skew):**
```
แก้ src/.warnyin/workflow/... → npm run setup:sandbox
  → node src/bin/cli.mjs install → <os.tmpdir()>/wy-sandbox-xxxx/ (print path)
→ เปิด session ที่ sandbox ลอง /warnyin:* ด้วย v-next (dogfood ที่ root ไม่โดนแตะ)
```

## 6. Persona
> **contributor / maintainer** ของ repo `@warnyin/agents` — clone แล้วต้อง dogfood ด้วย release เสถียร เพื่อพัฒนา v-next ใน `src/` โดยไม่เสี่ยง workflow ตัวเองพังกลางงาน

## 7. Test-flow
> ยืนยันด้วย flow จริง (design §8 bootstrap) — ทำใน VERIFY/หลัง transition

- [ ] **`npm run setup:dogfood`** จาก repo root → root มี `.warnyin/`, `.claude/commands/warnyin/`, `.claude/agents/`, `CLAUDE.md`, `AGENTS.md`
- [ ] artifact dogfood ทั้งหมด **ติด `.gitignore`** (`git status --porcelain` ไม่โชว์ที่ root layer)
- [ ] **`git status --porcelain docs/` ว่าง** หลัง setup:dogfood (BL-3 ปิด — seed/scaffold skip เพราะมี project.md/infra.md/achieved/.gitkeep แล้ว)
- [ ] `/warnyin:*` ใช้ได้ (มี `.claude/commands/warnyin/*.md` ที่ root)
- [ ] **รัน `setup:dogfood` ซ้ำ** → pointer ใน root CLAUDE.md **ไม่ append ซ้อน** (idempotent marker)
- [ ] **`npm run setup:sandbox`** → สร้าง temp dir (`os.tmpdir()` ไม่ hardcode `/tmp`) มี v-next ครบ + print path; รันบน Windows ได้ (cross-platform)
- [ ] **`CONTRIBUTING.md`** มีจริงที่ root (committed) เนื้อหา dev-instructions (zero-dep/ESM, พัฒนา v-next ใน src/, test ผ่าน setup:sandbox)
- [ ] cross-platform: `setup-sandbox.mjs` spawn array args ไม่ `shell:true`; `setup-dogfood.mjs` ใช้ `shell` เฉพาะ npx บน win32
