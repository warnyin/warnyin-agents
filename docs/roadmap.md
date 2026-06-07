# Roadmap — การพัฒนา Warnyin Standard Workflow

> แผนพัฒนา **ตัว tool Warnyin เอง** (ไม่ใช่ docs ของโปรเจกต์ปลายทาง)
> ไฟล์นี้ไม่ถูก publish ขึ้น npm — `package.json` `files` ไม่รวม `docs/` (เจาะจงเฉพาะ `bin`/`.warnyin`/`.claude` + root docs); scaffold `docs/stages` installer สร้างเองตอนติดตั้ง
> อัปเดต: 2026-06-07 · ทยอยติ๊ก `- [ ]` เมื่อทำเสร็จ

## หลักการชี้นำ (กันเดินผิดทาง)

ทุกข้อใน roadmap ต้องผ่าน 3 เกณฑ์นี้ ไม่งั้นตัดทิ้ง:
- **กระทัดรัด opinionated** — เลือก 5 stage + role จำกัดเป็นจุดแข็ง ห้ามไหลเป็น catalog (บทเรียนจาก ECC ที่จมกับ skill 251 ตัว overlap กันเอง)
- **tool-agnostic** — แก่นเป็น `.md` กลางที่ทุก harness อ่านได้ (`.warnyin/workflow/`) อะไรที่ผูก Claude (hook/skill) ต้องเป็น *adapter บาง* ชี้กลับแก่นกลาง ไม่ย้ายแก่นไปผูก tool
- **ห้ามเดา** — ไม่ชัดถาม user; enforce ด้วย rule/checklist ในตัว playbook

---

## P0 — ความแข็งแรงพื้นฐาน (ทำก่อน — เพิ่งปล่อย 0.6.0 breaking แต่ยังไม่มี test/CI)

### 1. Test ของ installer (`bin/cli.mjs`) ✅ (ship 2026-06-06 · topic `installer-test-ci`)
- [x] test: วางโครงถูกตำแหน่ง (`.warnyin/{workflow,template}`, `docs/stages`, seed `docs/`)
- [x] test: **idempotent** — รันซ้ำไม่พัง ไม่ทับซ้ำ
- [x] test: `--update` เขียนทับเฉพาะ CORE ไม่แตะ `docs/` และงานจริง
- [x] test: legacy detection เตือนถูกเมื่อเจอ `warnyin/` เก่า (และ ≤0.2.x)
- **ทำไม:** installer คือหัวใจที่คนติดตั้งจริง แต่ตอนนี้ทดสอบด้วยมือล้วน
- **เสร็จแล้ว:** `tests/installer.test.mjs` black-box 9 เคส (เกิน 4 — เพิ่ม installRootDoc/seedDocs/--dry-run/scaffold-leak), `npm test` เขียวใน temp จริง

### 2. CI (`.github/workflows`) ✅ (ship 2026-06-06 · topic `installer-test-ci`)
- [x] รัน test ข้อ 1 ทุก PR (matrix: **node 20/22/24** — node 18 EOL, drop)
- [x] **`npm pack` + ยืนยัน `.warnyin/` dotfolder ติดไปจริง** + ไม่มี `docs/`/`tests`/`.github` รั่ว (`scripts/verify-pack.mjs`)
- [ ] (ทำต่อจากข้อ 12) lint/format check
- **เสร็จแล้ว:** `.github/workflows/ci.yml` (test matrix + job pack-verify, security baseline); ยืนยัน CI เขียวบน PR จริงทำตอนเปิด PR/merge

### 3. CHANGELOG.md + migration note 0.6.0 ✅ (topic `roadmap-sync-p0`)
- [x] สร้าง `CHANGELOG.md` (รูปแบบ Keep a Changelog)
- [x] บันทึก 0.6.0: ย้าย `warnyin/` → `.warnyin/` (core) + `docs/stages/` (งานจริง) — **breaking** (รวมใน Migration guide section)
- [x] เขียน migration ที่ผู้ใช้เดิมต้องทำ
- [x] **(ปิดแล้ว · topic `cli-legacy-warning-fix` 2026-06-07)** แก้ legacy warning ใน `src/bin/cli.mjs` ให้ตรง Migration guide robust (`git mv .../* docs/stages/` + `rm -rf` core เก่า) — 3-way consistency (cli/CHANGELOG/test) + executable migration proof ผ่านทั้ง 2 รุ่น
- **เสร็จแล้ว:** Migration guide section ใน `CHANGELOG.md` ครอบ ≤0.2.x / 0.3–0.5.x + ระบุ 0.6.0→0.7.0 ไม่กระทบผู้ใช้ปลายทาง; คำสั่ง verify จริงแล้วทั้งกรณี migrate-ก่อน/หลัง-install (VERIFY)

### 4. ตรวจ/เสริม README ✅ (topic `roadmap-sync-p0`)
- [x] เช็คว่าทุก path/โครงใน README ตรงโครง (อัปเดตเป็น 0.7.0 layout `.warnyin/` + `src/` แล้ว — topic `src-bootstrap`)
- [x] มี quickstart (`npx @warnyin/agents` → `/warnyin:init` → stage แรก)
- [x] ลิงก์ไป migration ใน CHANGELOG (section "ติดตั้ง" → `CHANGELOG.md#migration-guide`)
- **เสร็จแล้ว:** อ่าน README แล้วเริ่มใช้ + อัปเกรดจากรุ่นเก่าได้โดยไม่ต้องเปิดซอร์ส

---

## P1 — เพิ่มคุณค่า workflow (ไอเดียจาก ECC ที่ผ่านเกณฑ์ปรัชญา)

### 5. Context profiles (คุ้มสุด — แทบฟรี) ✅ DONE (2026-06-07 · topic `context-profiles`)
- [x] เพิ่ม `.warnyin/workflow/contexts/{research,build,review,README}.md` — **session-level mode** (คนละมิติกับ role card ที่เป็น task-level lens)
- [x] ผูกเข้าแต่ละ stage ใน playbook (callout: Discovery→research · DESIGN→research+build · BUILD→build · VERIFY→review · SHIP→review)
- **ที่มา:** ECC `contexts/` · `.md` ล้วน ไม่ผูก tool ตรงปรัชญา · ดู `docs/features/context-profiles/`
- **ต่อยอด (future):** auto-activation ตาม stage (รอบนี้ manual); context เพิ่มเกิน 3 ตัวถ้าจำเป็น

### 6. Defensive rules ใน BUILD/VERIFY playbook ✅ DONE (2026-06-07 · topic `defensive-rules`)
- [x] **investigate-before-edit** — ก่อนแก้ไฟล์ ต้องเข้าใจ (ใครใช้ไฟล์นี้ / schema/contract / เจตนา) ก่อน
- [x] **ห้ามแก้ config linter/formatter ให้ผ่าน** แทนการแก้โค้ดจริง (config-protection)
- **ที่มา:** ECC hook `gateguard-fact-force` + `config-protection` — แต่เราทำเป็น **rule ใน playbook** (portable) ไม่ใช่ vendor hook (Claude-only) = เวอร์ชัน enforce ของ "ห้ามเดา"
- **ผล:** 2 operating principle ใน build.md/verify.md §3 + checklist ใน developer.md/qa.md + global `docs/rule.md` §1

### 7. Security checklist รูปธรรม ✅ DONE (2026-06-07)
- [x] เสริม `.warnyin/workflow/roles/security.md` + VERIFY: section "Runtime / operational security" (P1 secret isolation / P2 no-egress / P3 identity separation + Claude adapter note `Read(**/.env*)`/`~/.ssh`); `verify.md` §2 อ้างตอนรัน local env
- [x] **supply-chain ของ MCP/skill** — `install-skill.md` step 4 เสริม warning prompt-injection + checklist item S1 ใน security.md
- [x] global: `docs/rule.md` §3 ขยายเป็น Security baseline 2 มิติ (3.1 CI + 3.2 agent-runtime)
- **ที่มา:** ECC `the-security-guide.md` — หยิบเฉพาะสาระ portable · **ลงที่:** role card + VERIFY playbook + install-skill command + global rule §3.2

### 8. Learned-rule artifact ใน SHIP (instinct แบบ manual) ✅ DONE (2026-06-07)
- [x] SHIP เพิ่ม learned-rule capture: `rule (generalize) + evidence (บังคับ) + scope (component/project)` ที่ **user ยืนยัน per-rule** — fold เข้า approval เดิม (`ship.md` §4 step 1/3/5 + §6 gate)
- [x] ต่อยอดกลไก promote เดิม (unify — note "รอ SHIP" = subset planned ของ learned-rule); mirror command + template section "Learned rules"
- [x] global: `docs/rule.md` §1 + continuous-learning discipline + unify-in-place (dogfood: SHIP ของ topic นี้ promote 2 learned-rule เอง)
- **ที่มา:** ECC instinct/continuous-learning — ยืมแค่*แก่น* manual ~80% โดยไม่มี runtime observer (hook+SQLite) · **ลงที่:** `ship.md` playbook + command + template `[topic]/ship.md` + global rule §1

### 9. Skill-format สำหรับ utility ที่ปลอดภัย
- [ ] `update-codemaps` → skill-format (script ในโฟลเดอร์ + auto-invoke เมื่อโครงโค้ดเปลี่ยน)
- [ ] `explore` / `next` → auto-invoke (read-only ปลอดภัย)
- [ ] ใส่ `disable-model-invocation: true` ให้ `build` / `ship` (irreversible — ต้อง user สั่งชัด)
- **หมายเหตุ:** คง playbook กลางไว้ skill แค่ชี้ไป + คง `AGENTS.md` adapter สำหรับ Codex

---

## P2 — ความครบถ้วน/ประสบการณ์ผู้ใช้ (ทำเมื่อ workflow นิ่ง)

### 10. `examples/` — topic ตัวอย่างเดินครบ 5 stage
- [ ] 1 ตัวอย่างจริง (discovery→ship) ให้ผู้ใช้ใหม่เห็นของจริง
- **ระวัง:** ดูแลให้ทันโครงที่เปลี่ยน — ทำเมื่อ workflow นิ่งแล้ว

### 11. Selective install (manifest-driven)
- [ ] เฉพาะถ้าจะรองรับ "เลือกติดตั้งบาง stage/role" — แพทเทิร์น `install-modules.json` + JSON Schema validate
- **ระวัง:** **อย่าเอา SQLite state store** ของ ECC มา (over-engineer)

### 12. Lint/format ของ repo เอง
- [ ] markdownlint + prettier สำหรับ playbook `.md` หลายสิบไฟล์ (ความสม่ำเสมอ)
- [ ] เชื่อมเข้า CI (ข้อ 2)

---

## 🐛 Core bug ที่เจอ+แก้ระหว่าง dogfood (2026-06-06 · topic `installer-test-ci`)
> รัน workflow ตัวเองทำ P0#1-2 จริง → จับ bug ที่ test/design มองไม่เห็น (พิสูจน์คุณค่า BUILD/VERIFY)
- [x] **`build-wave.mjs` รับ `args` เป็น string** — harness ส่ง `args` ของ Workflow เป็น JSON string → defensive parse (commit `0770104`); ดู `troubleshooting.md` #5
- [x] **scaffold leak** — installer `copyTree(docs/stages)` ลากงานจริงของ repo ต้นทางไป target + ติด published package → เปลี่ยนเป็น generate scaffold เอง (commit `e3c0074`); ดู `troubleshooting.md` #1, `rule.md` §4

## ❌ Non-goals — ตัดสินใจไม่ทำ (กันบวมตาม ECC)

- **catalog skill/agent จำนวนมาก** — opinionated คือจุดแข็ง
- **runtime instinct observer** (hook + background agent + SQLite + CLI หลายตัว) — หนักเกิน ขัดปรัชญา → ใช้ข้อ 8 แทน
- **รองรับ harness จำนวนมาก** (12+ แบบ ECC) — โฟกัส Claude Code + Codex/Antigravity ที่ parity เต็ม
- **Rust control-plane / dashboard / billing** — นอก scope "ways-of-work"

---

## ที่มา

- สำรวจ `affaan-m/ecc` (2026-06-06) — kitchen-sink harness system; หยิบเฉพาะแก่นที่ผ่านเกณฑ์ปรัชญา
- ยืนยันจาก ECC: ปรัชญา cross-harness "reusable layer + thin adapters" = ทิศทาง playbook-กลาง + adapter-บาง ของ Warnyin **มาถูกทางแล้ว**
