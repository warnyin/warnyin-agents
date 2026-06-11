# Feature — Global install (Hybrid mode)

> ความรู้ถาวรระดับ feature · promote จาก topic `global-install` (achieved 2026-06-11)
> ติดตั้ง warnyin ครั้งเดียวใช้ได้ทุกโปรเจกต์ (opt-in) โดยคง per-project เป็น default

## คืออะไร
โหมดติดตั้ง **global (opt-in)** ของ `@warnyin/agents`: `npx @warnyin/agents --global` ติดตั้ง adapter (`~/.claude/`) + playbook (`~/.warnyin/`) **ครั้งเดียว** → `/warnyin:*` ใช้ได้ **ทุกโปรเจกต์** โดยไม่ต้องรัน installer ซ้ำต่อ repo. **Hybrid:** workspace (`docs/`) ยัง per-project; โปรเจกต์ที่มี `./.warnyin/` local → ใช้ local ก่อน (override → คง reproducibility ของทีมที่ vendor ลง git). **per-project ยังเป็น default** — global เป็นทางเลือกสำหรับคนทำหลาย repo

## องค์ประกอบ
| # | กลไก | layer | ทำอะไร |
|---|---|---|---|
| 1 | **mode resolution** | `cli.mjs` `resolveMode()` (pure-fn) | flag `--global`/`--project`; ไม่ระบุ+TTY → prompt; **non-TTY → project (CI-safe ไม่ค้าง)**; `--global --project` → error |
| 2 | **target branch** | `cli.mjs` | project=`cwd` (เดิม) · global=`os.homedir()` (mirror rel path, zero-mapping) + **homedir guard** (falsy/root → error) + first-install `overwrite:false` (ไม่ทับไฟล์ user) + skip scaffold (ยกให้ init) + echo target paths |
| 3 | **`installGlobalNote()`** | `cli.mjs` helper | เขียน resolution note → `~/.claude/CLAUDE.md` แบบ **append-with-marker `<!-- warnyin:global-note -->`** (ไม่แตะ personal global memory ของ user); defensive-skip ถ้า template ไม่มี |
| 4 | **resolution convention** | `CLAUDE.md`/`AGENTS.md`/`CLAUDE.global.md` | กฎ canonical: path `.warnyin/...` → หา `./.warnyin/` ก่อน, ไม่มี → `~/.warnyin/`; + workspace-guard (ไม่มี `docs/stages/` → `/warnyin:init`) — **อยู่ใน root doc ที่โหลด context เสมอ ไม่ duplicate ลงทุก adapter** |
| 5 | **init workspace bootstrap** | `init.md` | `/warnyin:init` สร้าง scaffold + seed `docs/` (อ่าน template local→global) — ทำให้ global mode มี workspace per-project |

## ทำงานยังไง (flow)
- **global install:** `--global` → copyTree CORE → `~/` → `installGlobalNote()` → `~/.claude/CLAUDE.md` → จบ (ไม่ scaffold)
- **ใช้ครั้งแรกในโปรเจกต์ใหม่:** `/warnyin:init` → สร้าง workspace → เริ่ม flow ปกติ; agent อ่าน resolution จาก `~/.claude/CLAUDE.md` → หา playbook local→global
- **per-project (default):** เหมือนเดิมทุกอย่าง (ไม่กระทบ)

## ขอบเขต / ข้อจำกัด (การตัดสินใจเชิงสถาปัตยกรรม)
- **per-project = default เสมอ** — global opt-in; เหตุผล: (1) reproducibility (vendored+committed = ทีม share เวอร์ชันเป๊ะผ่าน git), (2) **security/auditability** (per-project payload = reviewable ใน PR; global payload อยู่นอก git ของทุก repo → ไม่ถูก review)
- **version-skew:** global = single latest ที่ `~/.warnyin/`; โปรเจกต์ที่ต้อง pin → `npx @warnyin/agents@X --project` vendor ลง local (override ผ่าน local-first). **ไม่ทำ multi-version global**
- **Codex/Antigravity global = limitation** — global root doc รองรับเฉพาะ Claude (`~/.claude/CLAUDE.md`); Codex/Antigravity per-project ยังใช้ได้เต็ม (resolution note ใน AGENTS.md ได้ผลเฉพาะ per-project path)
- **blast-radius:** global เขียน `~/` (นอกโปรเจกต์) → opt-in + echo paths + first-install no-overwrite + idempotent (marker) กันทำลายงาน user

## ไฟล์ที่เกี่ยวข้อง
- `src/bin/cli.mjs` (`resolveMode`, `installGlobalNote`, mode branch) · `src/tests/installer.test.mjs` (17 เคส รวม 8 global)
- `src/.warnyin/installer/templates/{CLAUDE.md, CLAUDE.global.md}` + `src/AGENTS.md` (resolution convention) · `src/.warnyin/workflow/init.md` (workspace bootstrap)
- rule กลาง: `docs/techstack/installer/rule.md` (global-mode safety + payload-script no-export); env: `docs/infra.md` (HOME/USERPROFILE)
