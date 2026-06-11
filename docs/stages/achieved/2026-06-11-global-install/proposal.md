# Proposal — global-install

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Slug** | `global-install` |
| **ประเภท** | `feature` (installer capability ใหม่) |
| **ขนาด** | `กลาง (standard)` — แตะ cli.mjs + templates + init playbook + test; blast-radius เขียน `~/` แต่ flag additive |
| **วันที่** | 2026-06-11 |
| **มาจาก Discovery?** | `./discovery.md` (ผ่าน gate 2026-06-11, D1-D6) — business context ครบใน Discovery จึง **ข้าม business.md** (§7) |

## 1. สรุป change (what)
> เพิ่ม **โหมดติดตั้ง global** (opt-in) ให้ `@warnyin/agents`: `npx @warnyin/agents --global` ติดตั้ง adapter (`~/.claude/`) + playbook (`~/.warnyin/`) ครั้งเดียว → `/warnyin:*` ใช้ได้ **ทุกโปรเจกต์**; adapter resolve playbook แบบ **local-first (`./.warnyin/`) → global fallback (`~/.warnyin/`)** (กฎ canonical ใน CLAUDE.md/AGENTS.md); workspace (`docs/`) ยัง per-project โดย **`/warnyin:init` รับผิดชอบสร้าง**; **per-project ยังเป็น default** (คง reproducibility)

## 2. ทำไม (why)
- **ปัญหา:** ทุกโปรเจกต์ต้องรัน `npx @warnyin/agents` ติดตั้ง payload ซ้ำ — คนทำหลาย repo อยากติดตั้งครั้งเดียวใช้ทุกที่
- **ผลถ้าไม่ทำ:** friction การติดตั้งซ้ำต่อ repo (โดยเฉพาะหลัง 0.12.0 ที่ workflow โตขึ้น คนใช้หลายโปรเจกต์มากขึ้น)
- **ผูก project.md:** ตรงเป้าหมาย "ติดตั้งแล้ว `/warnyin:*` ใช้ได้โดยไม่ต้องตั้งค่าเพิ่ม" — global = ตั้งค่าครั้งเดียวใช้ทุก repo

## 3. ทางเลือกที่พิจารณา (อ้าง Discovery decision log)
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **Hybrid (global adapter+playbook, workspace per-project, local override)** | install ครั้งเดียวใช้ทุก repo, คง reproducibility | resolve playbook ต้องมี convention | ✅ (D1) |
| Adapter-only global (playbook ยัง per-project) | เบาสุด | ครึ่งทาง — command โผล่แต่หา playbook ไม่เจอ | ✗ (D1) |
| Central ทั้งหมด (ไม่ vendor ต่อ repo) | สุดทาง | เสีย per-project reproducibility + version skew | ✗ (D1) |

## 4. Scope
**In scope**
- `cli.mjs`: flag `--global`/`--project` + prompt ถ้า TTY (non-TTY → default project, CI-safe) + branch target → `os.homedir()` (CORE) + เขียน resolution root doc `~/.claude/CLAUDE.md`
- resolution convention (local-first → global) canonical ใน template `CLAUDE.md` + `AGENTS.md`
- `/warnyin:init` รับผิดชอบ workspace bootstrap (scaffold `docs/stages/` + seed `docs/` อ่าน template local→global) + safety-net note
- test: `installer.test.mjs` เคส global mode

**Out of scope (Discovery D6 + §8)**
- multi-version global · auto-migrate per-project→global · version-check/per-project state tracking
- Codex/Antigravity **global** root doc (per-project ยังใช้ได้ — documented limitation, DQ3)
- เปลี่ยน namespace `/warnyin:*` / ทำเป็น Claude plugin

## 5. ผลกระทบ & ความเสี่ยง
- **กระทบเดิม:** `cli.mjs` (เพิ่ม branch — per-project mode เดิมไม่เปลี่ยน), template `CLAUDE.md`/`AGENTS.md` (+ resolution note), `init.md` (+ workspace bootstrap)
- **ความเสี่ยง:** blast-radius เขียน `~/` → คุมด้วย opt-in + idempotent + ไม่ทับงาน user · non-TTY ค้าง → default project · version skew → local override (vendor local) · drift จาก vendored-per-project → per-project ยัง default

## 6. ลิงก์
- Design: `./design.md` · Tasks: `./tasks/` · Discovery: `./discovery.md` · Research: `./research.md`
