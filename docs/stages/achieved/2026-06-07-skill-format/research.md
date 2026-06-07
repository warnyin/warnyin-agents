# Research — skill-format

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `skill-format` |
| **วันที่** | 2026-06-07 |

---

## 1. คำถามวิจัย
- [x] RQ1: Claude Code skill format + auto-invocation ทำงานยังไง (frontmatter, path)
- [x] RQ2: skill เอา namespace `/warnyin:` ได้ไหม (เทียบ command folder-namespace)
- [x] RQ3: `disable-model-invocation` คืออะไร + จำเป็นกับ build/ship ไหม
- [x] RQ4: packaging/installer surface ที่ต้องแก้ (allowlist/verify-pack/cli/test)

## 2. วิธี & แหล่งข้อมูล
- [x] claude-code-guide agent (fetch Claude Code docs `skills.md` — verified) × 2 รอบ (format + namespace)
- [x] code inspection — `src/scripts/verify-pack.mjs`, `src/tests/verify-pack.test.mjs`, `src/bin/cli.mjs` (CORE), `src/.claude/`

## 3. Findings

### RQ1: skill format + auto-invocation (verified docs)
- **พบว่า:** skill อยู่ `.claude/skills/<name>/SKILL.md` → เรียก `/<name>`; frontmatter: `name`, `description`, `when_to_use`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, ฯลฯ; body เป็น markdown เหมือน command
- **auto-invocation = description-driven ล้วน** — model เลือก invoke เมื่อ request ตรง `description`/`when_to_use`; **ไม่มี** event/file-watch trigger built-in (ต้องใช้ hook ถ้าต้องการ event จริง)
- **นัย:** "auto-invoke เมื่อโครงโค้ดเปลี่ยน" (roadmap) → เขียนเป็น `when_to_use` ("หลังเพิ่ม/ย้ายไฟล์ → refresh codemap") ให้ model เรียกเอง — ไม่ใช่ event (D4)

### RQ2: namespace — skill เอา `/warnyin:` ไม่ได้ (crux)
- **พบว่า:** command name มาจากชื่อ **folder**; `.claude/commands/warnyin/build.md` → `/warnyin:build` (folder `warnyin/` = namespace). แต่ **skill ไม่รองรับ nested-folder namespace** — `.claude/skills/warnyin/update-codemaps/` ก็ได้แค่ `/update-codemaps`
- **ทางเดียวได้ prefix:** ทำทั้ง package เป็น **plugin** (`.claude-plugin/plugin.json`) → `/warnyin-agents:<name>` (คนละ prefix กับ `warnyin:` + **breaking** ทุก command เดิม); `name` frontmatter = display label ไม่คุม invoke name
- **นัย:** thin approach (D1) — 3 skill เป็น `/update-codemaps`/`/explore`/`/next` (ไม่มี prefix), คง command `/warnyin:*` ไว้ (non-breaking); ยอมรับ namespace ผสมเพื่อไม่ breaking

### RQ3: disable-model-invocation — moot สำหรับ command
- **พบว่า:** `disable-model-invocation: true` จริง — ทำให้ skill user-only (description ไม่ load, model ไม่ auto). **แต่ command เป็น user-only โดยธรรมชาติอยู่แล้ว** (ไม่เคย auto-invoke)
- **นัย:** build/ship คงเป็น command = บรรลุ intent roadmap ("irreversible → user สั่งชัด") โดยไม่ต้องใส่ field; field มีผลก็ต่อเมื่อแปลง build/ship เป็น skill (ซึ่งไม่ทำ — D3)

### RQ4: packaging/installer surface (code inspection)
- **`verify-pack.mjs`:** `ALLOWED_PREFIX` = `src/bin/`, `src/.warnyin/`, `src/.claude/commands/`, `src/.claude/agents/` — **ไม่มี skills**; comment: "narrow src/.claude/ → 2 subdir... กัน `src/.claude/skills` หลุดอนาคต" (จงใจ exclude!) → ต้องเพิ่ม `src/.claude/skills/`
- **`verify-pack.test.mjs` case 9:** assert `src/.claude/skills/x.md` ต้องถูกจับเป็น leak (ไฟล์นอก allowlist) → **ต้องเขียนใหม่** (skills allowed แล้ว — ใช้ leak ตัวอย่างอื่น เช่น `src/.vscode/` หรือ `src/.claude/settings.local.json`)
- **`cli.mjs` CORE:** `['.warnyin/workflow', '.warnyin/template', '.claude/commands/warnyin', '.claude/agents']` → เพิ่ม `.claude/skills` (copyTree recursive อยู่แล้ว); `--update` overwrite CORE
- **`package.json files`:** allowlist granular — เพิ่ม `src/.claude/skills`
- **`installer.test.mjs`:** 9 เคส black-box → เพิ่ม assert skills ลง (install + idempotent/update)
- **นัย:** D5 — แก้ 5 จุด (skills + cli + package.json + verify-pack + 2 test); risk MEDIUM (เปิด leak-guard ต้องระวัง)

## 4. Code/doc inspection
| ไฟล์ | พบ | นัย |
|---|---|---|
| `verify-pack.mjs` ALLOWED_PREFIX | exclude skills (จงใจ) | +`src/.claude/skills/` + R1 assert |
| `verify-pack.test.mjs` case 9 | assert skills = leak | เขียนใหม่ (skills allowed) + เคส leak อื่น |
| `cli.mjs` CORE | 4 path ไม่มี skills | +`.claude/skills` |
| `package.json files` | granular allowlist | +`src/.claude/skills` |
| `commands/warnyin/{update-codemaps,explore,next}.md` | command ชี้ playbook อยู่แล้ว | skill ชี้ playbook เดียวกัน (ไม่ duplicate) |

## 5. ทางเลือก & เปรียบเทียบ
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| thin (3 skill + คง command) | non-breaking, ได้ auto-invoke, adapter บาง | namespace ผสม (`/update-codemaps` ไม่มี prefix) | ✅ (D1) |
| full plugin (`warnyin-agents:*`) | namespace สม่ำเสมอ | **breaking** ทุก command + งานใหญ่ | — |
| descope | ไม่แตะ installer | ไม่ได้คุณค่า #9 | — |

## 6. ความเสี่ยง / unknown
- ไม่มี unknown ที่ block — namespace/format ปิดด้วย docs (verified) + code inspection
- ระวัง: เปิด `src/.claude/skills/` ใน allowlist = ลด leak guard → ต้องคง guard อื่น + test พิสูจน์

## 7. ข้อสรุป → ส่งต่อ
- **คำแนะนำ:** thin — 3 safe skill (ชี้ playbook, auto-invoke via description) + plumbing ครบ (cli/allowlist/verify-pack/2 test); คง command + build/ship เป็น command (note); ไม่ plugin, ไม่แตะ AGENTS.md; global rule note skill-adapter convention
- **ป้อนกลับ discovery.md:** D1-D5 ยืนยัน — skill เอา `/warnyin:` ไม่ได้ (ต้อง plugin breaking), auto-invoke = description-driven, disable-model-invocation moot กับ command, packaging surface 5 จุด
