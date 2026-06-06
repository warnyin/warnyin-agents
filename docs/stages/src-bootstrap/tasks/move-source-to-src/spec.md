# Spec — move-source-to-src (slice #1)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — เน้นหัวข้อที่เกี่ยวกับชนิด `infra/logic`

## 1. ชนิดของ task
`infra` + `logic` — restructure โครงไฟล์ (git mv source → `src/`) + ปรับ logic ใน `src/bin/cli.mjs` (pkgRoot/guard) ให้ installer ยัง copy `src/* → target/*` ถูก
(ไม่ใช่ API/UX-UI/data → ข้าม §2/§3; "data model" ของ task นี้ = โครงไฟล์ ดู §4)

---

## 4. Data-flow (= โครงไฟล์ ก่อน → หลัง)
> ไม่มี DB — data ของ task นี้คือ **โครงไฟล์** (design §3)

### git mv mapping (ทำเป๊ะตาม design §3)
```
bin/                                  → src/bin/
tests/                                → src/tests/
scripts/                              → src/scripts/
.warnyin/                             → src/.warnyin/        (รวม installer/templates/CLAUDE.md)
.claude/commands/warnyin/             → src/.claude/commands/warnyin/
.claude/agents/                       → src/.claude/agents/
AGENTS.md                             → src/AGENTS.md
```
> root `CLAUDE.md` → `CONTRIBUTING.md` = ของ **T4** — task นี้แค่รับรู้ ไม่แตะ

### path resolution หลังย้าย (logic ที่ต้องยัง work)
```
src/bin/cli.mjs  →  pkgRoot = resolve(dirname(cli), '..')  →  src/
  CORE (relative กับ pkgRoot) คงเดิม:
    src/.warnyin/workflow   src/.warnyin/template
    src/.claude/commands/warnyin   src/.claude/agents
  installRootDoc src: src/.warnyin/installer/templates/CLAUDE.md, src/AGENTS.md
→ copyTree copy  src/<rel>  →  target/<rel>  (mirror layout — ไม่ต้องมี mapping table)
```

### state ของ payload (install จาก src/)
```
install สดจาก src/bin/cli.mjs ลง temp  →  target ได้:
  .warnyin/workflow .warnyin/template  ←  มาจาก src/.warnyin/*
  .claude/commands/warnyin .claude/agents  ←  มาจาก src/.claude/*
  CLAUDE.md (จาก src/.warnyin/installer/templates/CLAUDE.md)
  AGENTS.md (จาก src/AGENTS.md)
  docs/ scaffold + seed (ensureScaffold/seedDocs — logic เดิม ไม่แตะ)
```

## 7. Test-flow (เคสที่ต้องผ่าน)
> black-box เดิม 9 เคส ต้องเขียวบนโครงใหม่ — `cliPath = ../bin/cli.mjs` relative กับ `src/tests/` → resolve เป็น `src/bin/cli.mjs` (mirror รักษา relative path เดิม → **ไม่ต้องแก้ test**)

- [ ] `node --test` จาก **repo root** (bare, ไม่มี path arg) recurse เจอ `src/tests/installer.test.mjs` → เห็น **9 เคสเดิมผ่าน** (pass count 9 ไม่ใช่แค่ exit 0)
- [ ] เคส 1 (ติดตั้งสด): install จาก `src/bin/cli.mjs` ลง temp → มี `.warnyin/workflow`, `.warnyin/template`, `.claude/commands/warnyin`, `docs/stages`, `docs/project.md`, `CLAUDE.md`, `AGENTS.md` ครบ → ยืนยัน payload มาจาก `src/.warnyin`/`src/.claude` ถูก
- [ ] เคส 2 (idempotent): รัน 2 รอบ byte-equal + ไม่ append ซ้ำ
- [ ] เคส 3 (`--update` ไม่ทับ docs/), เคส 4 (append section CLAUDE.md), เคส 5/6 (legacy warn), เคส 7 (seedDocs ข้าม `[...]`), เคส 8 (`--dry-run` ไม่เขียน), เคส 9 (scaffold เปล่า ไม่ leak topic) — ผ่านเหมือนเดิม
- [ ] guard `pkgRoot===target` (= `src/` ===target) เป็น no-op โดยตั้งใจ — ไม่ trigger ในเคส install ปกติ/sandbox (design §4.1/§7); **edge** install ลงโฟลเดอร์ที่เป็น `src/` เองยังคง error ได้ (เก็บ guard ไว้)
- [ ] `package.json bin.warnyin-agents` = `src/bin/cli.mjs`; `scripts.test` = `node --test` (bare) รันได้
