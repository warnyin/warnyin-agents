# Proposal — skill-format (3 safe utility → Claude skill auto-invocable)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`

| | |
|---|---|
| **Slug** | `skill-format` |
| **ประเภท** | `feature` (Claude adapter) + แตะ installer/packaging/test (code) |
| **ขนาด** | `กลาง` |
| **วันที่** | 2026-06-07 |
| **มาจาก Discovery?** | `./discovery.md` + `./research.md` |

## 1. สรุป change (what)
เพิ่ม **3 safe utility skill** (`update-codemaps` / `explore` / `next`) เป็น Claude Code project skill (`src/.claude/skills/<name>/SKILL.md` → `/<name>`) ที่ **auto-invocable (description-driven)** + body **ชี้ playbook กลางเดิม ไม่ duplicate**; **คง command `/warnyin:*` ทั้งหมด** (non-breaking) + **build/ship คงเป็น command** (user-only = บรรลุ intent "irreversible → user สั่ง"); ทำ plumbing ให้ skills ผ่าน installer/packaging — `cli.mjs` CORE + `package.json` allowlist + `verify-pack.mjs` (เปิด `src/.claude/skills/` ที่เดิมจงใจ exclude) + 2 test (verify-pack + installer); **ไม่ plugin** (เลี่ยง breaking namespace), **ไม่แตะ AGENTS.md**

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** utility read-only ปลอดภัย (codemap/explore/next) ตอนนี้เรียกมือล้วน — ทำเป็น skill ให้ model auto-invoke เมื่อ task ตรง ลดแรงเสียดทาน; build/ship (irreversible) ต้องกัน auto
- **ผลถ้าไม่ทำ:** roadmap P1 #9 (ตัวสุดท้าย) ค้าง
- **ทำไมตอนนี้:** ปิด P1; เป็น adapter Claude-specific บางที่ชี้ playbook กลาง (tool-agnostic core ไม่เปลี่ยน) — สอดปรัชญา

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A. Thin — 3 skill + คง command `/warnyin:*` | non-breaking, ได้ auto-invoke, adapter บาง ชี้ playbook | namespace ผสม (3 skill ไม่มี `warnyin:` prefix) | ✅ (D1) |
| B. Full plugin → `/warnyin-agents:*` | namespace สม่ำเสมอ | **breaking** ทุก command + งานใหญ่ + ขัด non-breaking | — |
| C. descope | ไม่แตะ installer | ไม่ได้คุณค่า #9 | — |

- **เหตุผลที่เลือก A:** skill เอา `/warnyin:` ไม่ได้ (verified — ต้อง plugin = breaking); thin ได้ auto-invoke โดยไม่รื้อ + คง stage command สำคัญ

## 4. Scope
**In scope**
- **NEW:** `src/.claude/skills/{update-codemaps,explore,next}/SKILL.md` — frontmatter auto-invoke (`name`/`description`/`when_to_use`/`allowed-tools` read-only) + body ชี้ playbook
- `src/bin/cli.mjs` CORE — +`.claude/skills`
- `package.json` files — +`src/.claude/skills`
- `src/scripts/verify-pack.mjs` — ALLOWED_PREFIX +`src/.claude/skills/` + R1 assert `hasSkills` (skills ต้องติด) + แก้ comment
- `src/tests/verify-pack.test.mjs` — GOOD +skill path; case 9 เขียนใหม่ (skills allowed → leak อื่น) + เคส R1 ขาด skills
- `src/tests/installer.test.mjs` — assert skills ลง (install + `--update`)
- `src/.claude/commands/warnyin/{build,ship}.md` — +note เหตุผล (คงเป็น command, user-only = intent ของ disable-model-invocation)
- global rule note (รอ SHIP): skill-adapter convention

**Out of scope**
- plugin conversion / `warnyin-agents:*` (breaking — D1)
- แปลง stage command เป็น skill; field `disable-model-invocation` (moot — D3)
- event/file-watch auto-trigger (Claude ไม่มี — D4)
- แตะ `AGENTS.md` (Codex adapter); `docs/rule.md` central (รอ SHIP)

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบเดิมที่กระทบ:** installer (cli.mjs CORE +1 path), packaging (allowlist), verify-pack guard, 2 test suite — **non-breaking** (เพิ่ม path, ไม่ลบ/เปลี่ยน command เดิม)
- **ความเสี่ยง + ลด (MEDIUM — code จริง):**
  - **leak-guard อ่อนลง** (เปิด skills) → *ลด:* คง denylist + allowlist อื่นแข็ง, เพิ่ม R1 `hasSkills`, test พิสูจน์ guard ยังจับ leak ชนิดอื่น (เขียน case 9 ใหม่)
  - **test count gate** → คง `pass==tests` + ≥ MIN_PASS (เพิ่มเคส — count ขึ้น ไม่ลด)
  - **namespace ผสม** → note ใน docs; stage command สำคัญยัง `/warnyin:*`

## 6. ลิงก์
- Design (how): `./design.md` · Tasks: `./tasks/`
- Discovery: `./discovery.md` · Research: `./research.md`
