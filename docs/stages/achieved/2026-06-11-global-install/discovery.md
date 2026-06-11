# Discovery — global-install

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `global-install` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-11 |
| **ผู้ร่วมตัดสินใจ** | smf.claude (เจ้าของโปรเจกต์) |
| **เริ่มจาก** | `docs/project.md` (เป้าหมาย "ติดตั้งลงโปรเจกต์ปลายทางแล้ว `/warnyin:*` ใช้ได้") + `docs/rule.md §6` (2-layer) |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> เพิ่ม **โหมดติดตั้ง global** ให้ `@warnyin/agents` — ติดตั้ง adapter (`~/.claude/`) + playbook (`~/.warnyin/`) ครั้งเดียวแล้ว `/warnyin:*` ใช้ได้ **ทุกโปรเจกต์** โดยไม่ต้องรัน installer ซ้ำต่อ repo; คง **local override** (โปรเจกต์ที่มี `./.warnyin/` ใช้ของ local ก่อน) เพื่อรักษา reproducibility; workspace (`docs/`) ยัง per-project เสมอ

## 2. Problem & Why now
- **ปัญหา:** ทุกโปรเจกต์ต้องรัน `npx @warnyin/agents` ติดตั้ง payload ซ้ำ (vendored per-project) — ผู้ใช้ที่ทำหลาย repo อยากติดตั้งครั้งเดียวใช้ได้ทุกที่
- **ทำไมตอนนี้:** เพิ่ง ship `change-sizing` (0.12.0) — workflow โตพอที่คนใช้หลายโปรเจกต์เริ่มเจอ friction การติดตั้งซ้ำ
- **ผูก project.md:** ตรงเป้าหมาย "ติดตั้งแล้ว `/warnyin:*` ใช้ได้โดยไม่ต้องตั้งค่าเพิ่ม" — global ทำให้ "ตั้งค่าครั้งเดียว ใช้ได้ทุก repo"

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- โหมดติดตั้ง global ใน `src/bin/cli.mjs`: flag `--global`/`--project` + prompt ถ้า TTY (non-TTY → default project)
- global target: adapter → `~/.claude/{commands/warnyin,skills,agents}`, playbook → `~/.warnyin/workflow` (+ template)
- adapter resolve playbook แบบ local-first (`./.warnyin/`) → global fallback (`~/.warnyin/`)
- workspace bootstrap per-project (กลไกที่ Discovery กำลังปิด — Q1)
- update/version-skew model (Q2)

**Out of scope (จะไม่ทำในรอบนี้)**
- **multi-version global** (`~/.warnyin/<version>/`) — pin ใช้ vendor local แทน (D6)
- **auto-migrate** per-project install เดิม → global (ผู้ใช้รัน `--global` เองเมื่อต้องการ)
- **version-check / per-project state tracking** (D6 — local override พอ)
- ทำ `/warnyin:*` เป็น Claude plugin / เปลี่ยน namespace (คง `/warnyin:*` เดิม)

## 4. Decision Log (เดินทีละกิ่งของ decision tree)
> หนึ่งแถว = หนึ่งการตัดสินใจ บันทึกทันทีที่ตกลงได้

| # | คำถาม / ประเด็น | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|
| D1 | "global" ระดับไหน | Hybrid | **Hybrid** | adapter+playbook ไป global, workspace per-project, **local override ได้** → คง reproducibility |
| D2 | resolve playbook ยังไง | local-first → global fallback | **local-first → global fallback** | ได้ local override อัตโนมัติ + tool-agnostic (wording ใน adapter ไม่ใช่ code resolver) |
| D3 | UX เลือก mode ตอนติดตั้ง | flag + prompt ถ้า TTY | **flag `--global`/`--project` + prompt ถ้า TTY, non-TTY → default project** | ตรงที่ user อยาก (ถามตอนติดตั้ง) + scriptable + CI-safe (npx non-TTY ไม่ค้าง) |
| D4 | go/no-go + route | Discovery ก่อน | **ทำ — Discovery ก่อน** | design coherent แล้ว แต่มี 2 open question (workspace bootstrap + version-skew) ต้องปิดก่อน design |
| D5 | workspace bootstrap | `/warnyin:init` รับผิดชอบ + safety net | **`/warnyin:init` สร้าง scaffold+seed (อ่าน template จาก local→global) + ทุก stage command เช็ค "ไม่มี docs/stages/ → สร้างให้"** | init เป็น onboarding entry ต่อโปรเจกต์อยู่แล้ว ไม่เพิ่ม CLI surface; safety net กันลืม init |
| D6 | update/version-skew | local override พอ | **global = single latest ที่ `~/.warnyin/`; pin = `npx @warnyin/agents@X --project` vendor ลง local (override ผ่าน local-first); `--update --global` แสดง version ก่อน/หลัง; ไม่ทำ multi-version global** | กระทัดรัด opinionated; pin = vendor local (default mode เดิม) — ไม่เพิ่มกลไกใหม่ |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** Claude Code อ่าน `~/.claude/{commands,skills,agents}/` ที่ user-level → command/skill โผล่ทุกโปรเจกต์ (ต้อง verify ตอน VERIFY)
- **ข้อจำกัด:** zero-dep + cross-platform (`os.homedir()`, path.join; ระวัง Windows) · installer รันผ่าน npx non-interactive บ่อย (prompt ห้ามค้าง) · payload generic tool-agnostic (Codex/Antigravity อ่าน path เดียวกัน — global path ต้องสื่อความหมายข้าม harness)

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- `npx @warnyin/agents --global` ติดตั้ง adapter+playbook ลง `~/.claude`+`~/.warnyin` ได้; `/warnyin:*` ใช้ได้ในโปรเจกต์ที่ไม่มี `./.warnyin/`
- โปรเจกต์ที่มี `./.warnyin/` local → ใช้ local (override) — พิสูจน์ด้วยตัวอย่าง
- non-TTY (CI/pipe) → ไม่ค้าง, default project; per-project install เดิมไม่พัง (backward compat)

## 7. Feature ideas / ทางเลือกของวิธีแก้
- flag-driven branch ใน cli.mjs + `os.homedir()` target resolver
- adapter path wording: "อ่าน playbook — local `./.warnyin/` ก่อน, fallback `~/.warnyin/`"
- workspace bootstrap ผ่าน `/warnyin:init` (lazy) — รอ Q1

## 8. Open questions (ที่ยังค้าง)
- [x] **Q1 — workspace bootstrap:** ปิดแล้ว (D5) → `/warnyin:init` รับผิดชอบ + stage-command safety net
- [x] **Q2 — update/version-skew:** ปิดแล้ว (D6) → local override พอ (global single latest; pin = vendor local)
- **ไม่มี open question ที่ block การออกแบบ** — พร้อมเข้า DESIGN

> ส่งต่อ DESIGN (ไม่ block — ตัดสินตอนออกแบบ): global path ที่ tool-agnostic (`~/.warnyin/` vs `~/.claude/warnyin/`) ให้ Codex/Antigravity เข้าใจ; `installRootDoc` (CLAUDE.md pointer) ใน global mode เขียนที่ไหน (per-project ตอน init?)

## 9. ความเสี่ยงหลัก
- **blast radius กว้างขึ้น** — เขียนไฟล์ลง `~/` (นอกโปรเจกต์); ต้องชัดเจน + ปลอดภัย (ไม่ทับงาน user)
- **version skew** — โปรเจกต์ต่าง version ใช้ global ร่วมกัน → ต้องมีทาง pin (local override)
- **drift จาก philosophy เดิม** (vendored per-project committed) — ต้องคง per-project mode เป็น default

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- เอกสารโปรเจกต์: `docs/project.md`, `docs/rule.md §6` (2-layer), `docs/techstack/installer/structure.md`
- โค้ด/ไฟล์ที่ตรวจสอบ: `src/bin/cli.mjs` (target=cwd, CORE copyTree, ensureScaffold, seedDocs, installRootDoc)

---

## ✅ Gate → DESIGN (ดู `.warnyin/workflow/stages/discovery.md` ข้อ 6)
- [x] Problem / why-now ชัด ผูกกับ project.md
- [x] Scope in/out ชัด
- [x] Decision log ปิดทุกประเด็นสำคัญ (D1-D6) ไม่มี open question ที่ block
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] **user ยืนยัน "เข้าใจตรงกันแล้ว"** (2026-06-11 — เคาะ D1-D6 ครบ)
