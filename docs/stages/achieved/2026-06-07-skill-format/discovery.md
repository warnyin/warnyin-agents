# Discovery — skill-format (utility command → skill auto-invocable)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `skill-format` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-07 |
| **ผู้ร่วมตัดสินใจ** | user (smf.claude) + AI |
| **เริ่มจาก** | `docs/roadmap.md` P1 #9 · `src/.claude/` · `verify-pack.mjs` · `cli.mjs` |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> เพิ่ม **3 safe utility skill** (update-codemaps / explore / next) เป็น Claude Code project skill (`.claude/skills/<name>/SKILL.md` → `/update-codemaps` ฯลฯ) ที่ **auto-invocable (description-driven)** + body **ชี้ playbook กลางเดิม ไม่ duplicate**; **คง command `/warnyin:*` ทั้งหมดไว้** (non-breaking) + **คง build/ship เป็น command** (user-only โดยธรรมชาติ = บรรลุ intent "irreversible → user สั่งชัด"); ทำ plumbing ให้ skills ผ่าน installer/packaging (cli.mjs CORE + allowlist + verify-pack + tests) — **ไม่แปลงเป็น plugin** (เลี่ยง breaking namespace), **คง AGENTS.md** (Codex adapter)

## 2. Problem & Why now
- **ปัญหา/โอกาส:** utility ที่ read-only ปลอดภัย (update-codemaps/explore/next) ตอนนี้เป็น command เรียกมือล้วน — ทำเป็น skill ให้ model **auto-invoke** เมื่อ task ตรง ลดแรงเสียดทาน; ส่วน build/ship (irreversible) ต้องกันไม่ให้ auto
- **ทำไมตอนนี้:** roadmap P1 #9 (ตัวสุดท้าย P1)
- **ผูกเป้าหมายโปรเจกต์:** `docs/project.md` — installer ติดตั้ง `.claude/` adapter; เพิ่ม skills เป็น **adapter Claude-specific บาง** ที่ชี้กลับ playbook กลาง (tool-agnostic core ไม่เปลี่ยน); zero-dep, verify-pack เป็น gate ยังคุม

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- **NEW skills:** `src/.claude/skills/{update-codemaps,explore,next}/SKILL.md` — frontmatter (`name`, `description`, `when_to_use`, `allowed-tools` read-only) + body **ชี้ playbook** (`.warnyin/workflow/{codemap,explore,next}.md`) ไม่ duplicate
- **packaging:** `package.json` files +`src/.claude/skills`; `src/scripts/verify-pack.mjs` ALLOWED_PREFIX +`src/.claude/skills/` (เดิม**จงใจ exclude** เป็น leak guard — ต้องเปิดอย่างระวัง) + R1 assertion ว่า skills ติด
- **tests:** `src/tests/verify-pack.test.mjs` case 9 (เดิม assert `src/.claude/skills/` = leak → ต้องเขียนใหม่ ใช้ leak ตัวอย่างอื่น + เพิ่มเคส assert skills ติดได้); `src/tests/installer.test.mjs` +assert skills ลง (install + `--update`)
- **installer:** `src/bin/cli.mjs` CORE +`.claude/skills`
- **build/ship:** คงเป็น command + **note เหตุผล** (user-only = บรรลุ intent; ไม่ใส่ disable-model-invocation)
- global rule note (รอ SHIP): convention skill-format adapter (Claude-specific, ชี้ playbook, read-only เท่านั้น auto-invoke)

**Out of scope (จะไม่ทำในรอบนี้)**
- **plugin conversion** / namespace `warnyin-agents:*` (breaking ทุก command เดิม — D1)
- แปลง stage command (build/ship/design/discovery/verify/init/install-skill) เป็น skill
- field `disable-model-invocation` (moot — build/ship เป็น command อยู่แล้ว user-only — D3)
- event/file-watch auto-trigger (Claude Code ไม่มี — auto-invoke เป็น description-driven ล้วน — D4)
- แตะ `AGENTS.md` (คง Codex adapter — roadmap note)
- แตะ `docs/rule.md` central ตอน BUILD (รอ SHIP)

## 4. Decision Log
| # | ประเด็น | ทางเลือก | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|
| 1 | ทิศ #9 (namespace tension) | thin / full plugin / descope | **Thin — 3 safe skill, คง command `/warnyin:*`** | non-breaking; skill เอา `/warnyin:` ไม่ได้ (ต้อง plugin = breaking); thin ได้ค่า auto-invoke โดยไม่รื้อ |
| 2 | utility ที่มี command อยู่แล้ว | คง command + skill / แทน command | **คง command + เพิ่ม skill thin** | non-breaking; ทั้งคู่ชี้ playbook เดียว (ไม่ duplicate logic) |
| 3 | build/ship safety | command+note / แปลง skill+field | **คง command + note เหตุผล** | command = user-only โดยธรรมชาติ บรรลุ intent "irreversible → user สั่ง"; field ซ้ำซ้อน |
| 4 | "auto-invoke เมื่อโครงเปลี่ยน" | event trigger / description-driven | **description-driven (`when_to_use`)** | Claude Code ไม่มี event auto-trigger — เขียน description ให้ model เรียกเมื่อ task ตรง (เช่น หลังเพิ่ม/ย้ายไฟล์) |
| 5 | plumbing installer/packaging | ทำครบ / minimal | **ทำครบ (cli.mjs CORE + allowlist + verify-pack + 2 test)** | จำเป็น — ไม่ทำ skills ไม่ติด tarball/ไม่ถูกติดตั้ง; verify-pack เดิม exclude skills ต้องเปิด + แก้ test ที่ assert ตรงข้าม |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** Claude Code project skill ที่ `.claude/skills/<name>/SKILL.md` ติดตั้งลง target แล้ว auto-invocable ได้ (verified กับ docs); skill body ชี้ playbook ได้ (reference/`!cmd` injection); skills + commands อยู่ร่วมได้ถ้าชื่อไม่ชน
- **ข้อจำกัด:** 2-layer — แก้ `src/**` (skills + cli + verify-pack + tests) เท่านั้น; **zero-dep** คงไว้; **verify-pack เป็น gate** — เปิด skills แล้วต้องคง denylist/guard อื่นแข็ง (กัน leak ชนิดอื่น); namespace ของ 3 skill จะ**ไม่มี** `warnyin:` prefix (เป็น `/update-codemaps` ฯลฯ) — ยอมรับเพื่อ non-breaking

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- 3 skill (`update-codemaps`/`explore`/`next`) ติดตั้งผ่าน `cli.mjs` → มีที่ target `.claude/skills/<name>/SKILL.md`; frontmatter auto-invocable + body ชี้ playbook (ไม่ duplicate)
- `npm run verify:pack` เขียว + skills ติด tarball; denylist/guard อื่นยังจับ leak ได้ (test ยังพิสูจน์)
- `verify-pack.test.mjs` case 9 เขียนใหม่ (skills allowed) + ยังมีเคส assert "ไฟล์นอก allowlist อื่น" จับได้
- `installer.test.mjs` assert skills ลงตอน install + `--update`
- build/ship คงเป็น command (ไม่แตะพฤติกรรม) + note เหตุผล
- `npm test` เขียวทั้ง suite (pass==tests, ≥ MIN_PASS); `AGENTS.md` ไม่แตะ
- global rule note ใน `tasks/*/rule.md` §2 (รอ SHIP)

## 7. Feature ideas / ทางเลือกของวิธีแก้
- skill body แบบ thin: frontmatter + "ทำตาม playbook `.warnyin/workflow/<x>.md`" (เหมือน command ที่ชี้ playbook อยู่แล้ว) — SSOT คือ playbook
- `when_to_use` ของ update-codemaps: "หลังเพิ่ม/ย้าย/ลบไฟล์ หรือเปลี่ยนโครงสร้างโปรเจกต์ → refresh codemap"
- slice: อาจ 2 task — (A) skill files + cli.mjs CORE + installer test · (B) packaging (allowlist + verify-pack + test) — เป็น design detail (มี dependency: B กัน leak ของ A)

## 8. Open questions (ที่ยังค้าง)
- ไม่มี open question ที่ block — ทิศ/scope/namespace tension ปิดครบ (slice + skill body format เป็น design detail)

## 9. ความเสี่ยงหลัก
- **MEDIUM** (ไม่ใช่ doc-only — แตะ installer/packaging/tests):
  - **verify-pack leak-guard อ่อนลง** — เปิด `src/.claude/skills/` ทำให้ guard เดิมที่กัน skills leak หาย → *ลด:* คง denylist + allowlist อื่นแข็ง, เพิ่ม R1 assert skills ติด, test พิสูจน์ guard ยังจับ leak ชนิดอื่น
  - **test count gate** — เพิ่ม/แก้เคส test ต้องคง `pass==tests` + ≥ MIN_PASS (เพิ่มเคสได้ ห้าม net ลดต่ำกว่า 9)
  - **namespace inconsistency** — 3 skill ไม่มี `warnyin:` (ยอมรับตาม D1 non-breaking) → *ลด:* note ใน docs ให้ผู้ใช้เข้าใจ; stage command สำคัญยังคง `/warnyin:*`

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- `docs/roadmap.md` P1 #9 · `src/.claude/commands/warnyin/{update-codemaps,explore,next}.md` · `src/scripts/verify-pack.mjs` (ALLOWED_PREFIX) · `src/tests/verify-pack.test.mjs` (case 9) · `src/bin/cli.mjs` (CORE) · `src/tests/installer.test.mjs`

---

## ✅ Gate → DESIGN
- [x] Problem / why-now ชัด ผูกกับ project.md/roadmap
- [x] Scope in/out ชัด (รวม namespace tension + สิ่งที่ descope พร้อมเหตุผล)
- [x] Decision log ปิดครบ 5 ประเด็น ไม่มี open question block
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (2026-06-07)
