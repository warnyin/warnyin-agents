# Rule — Warnyin Standard Workflow (repo เอง)

> กฎระดับโปรเจกต์ของ repo มาตรฐานนี้ (ไม่ผูกกับ component เดียว) · SHIP promote rule ใหม่เข้ามาที่นี่
> rule ที่ผูกกับ component เฉพาะ → อยู่ใน `docs/techstack/<component>/rule.md`

## 1. ปรัชญาแก่น (จาก CLAUDE.md + roadmap)
- **กระทัดรัด opinionated** — 5 stage + role จำกัด เป็นจุดแข็ง ห้ามไหลเป็น catalog
- **tool-agnostic** — แก่นเป็น `.md` กลางที่ทุก harness อ่านได้ (`.warnyin/workflow/`); ส่วนที่ผูก tool (hook/skill) เป็น *adapter บาง* ชี้กลับแก่น
  - **skill-adapter convention** (enforce ของ "adapter บาง") — Claude skill (`.claude/skills/<name>/SKILL.md`) = adapter บาง **ชี้ playbook กลาง ไม่ duplicate** (เหมือน command); ทำ **auto-invocable เฉพาะ utility read-only safe** (ไม่ใส่ `disable-model-invocation`) เพื่อคุม blast radius; **irreversible/stateful (build/ship/design ฯลฯ) คงเป็น command** (user-only — ต้อง user สั่งชัด); **ไม่แปลง package เป็น plugin** (รักษา namespace `/warnyin:*` ของ command = non-breaking; skill ยอมรับ `/<name>` ไม่มี prefix) — auto-invoke เป็น description-driven (ไม่มี event/file-watch)
- **ห้ามเดา** — ไม่ชัดถาม user; enforce ด้วย rule/checklist ใน playbook
  - **investigate-before-edit** (enforce ของ "ห้ามเดา") — ก่อนแก้ไฟล์ที่มีอยู่ ต้องเข้าใจก่อน: **ใครใช้/อ่านไฟล์นี้, schema/contract/สัญญาของมัน, เจตนาเดิม**; แก้โดยไม่เข้าใจ = เดา (ไม่ชัด → ถาม user / อ่านโค้ดที่อ้างถึง ก่อนแก้) — อยู่ใน BUILD/VERIFY playbook §3 + developer.md/qa.md checklist
  - **config-protection** (enforce ของ "ห้ามเดา") — ห้ามแก้ config (linter/formatter/test threshold) หรือ disable rule **"เพื่อให้ build/test ผ่าน"** แทนการแก้โค้ดจริง; config ผิดจริงแก้ได้แต่ต้องมี **เหตุผลชัด + note** (ไม่ใช่เพื่อเลี่ยง finding) — สำคัญสุดตอน VERIFY fix loop ("แก้จนผ่าน" = แก้ root cause ไม่ลด bar)
- **context (session) ⊥ role (task) — คนละชั้น ห้าม duplicate** — `contexts/` = session-level posture (โหมดทั้ง session: research/build/review), `roles/` = task-level lens (บทบาทต่องาน); context อยู่ `.warnyin/workflow/contexts/` โครงบาง **ชี้กลับ playbook ไม่ copy checklist** ของ stage/role (single source of truth); เพิ่ม context = เพิ่มไฟล์ + callout ใน stage ที่เข้าคู่ + ตารางใน `contexts/README.md` — เก็บ opinionated (3 ตัวพอ ไม่เป็น catalog)
- **ทุก stage playbook ชี้ context ที่เข้าคู่** — แต่ละ `stages/*.md` มี callout `Context profile` ใต้ title (Discovery→research · DESIGN→research+build · BUILD→build · VERIFY→review · SHIP→review); เพิ่ม stage ใหม่ต้องระบุ context posture ของมัน
- **continuous-learning discipline** (คู่ "ห้ามเดา") — ความรู้/บทเรียนที่ได้ **ตอนทำจริง** (BUILD/VERIFY) ไม่ใช่แค่ตอนวางแผน → จับเป็น **learned-rule ที่ SHIP** ด้วย `rule (generalize) + evidence (บังคับ) + scope (component/project)` แล้ว **user ยืนยัน** ก่อน promote (กลไกใน `stages/ship.md` §3-§6 — unify กับ note "รอ SHIP"); learned-rule = กฎ generalize **ไม่ใช่ incident** (troubleshooting = incident ที่อ้างเป็น evidence ได้) — ยืมแก่น instinct แบบ manual ไม่มี runtime observer
- **unify-in-place ไม่สร้างกลไกขนาน** — เมื่อเสริม mechanism ที่ **ทับซ้อนกับของเดิม** ให้ **ขยายในที่เดิม** (เช่น ขยาย principle/gate item เดิม ให้ของเก่ากลายเป็น subset) แทนการเพิ่มข้อ/สร้างกลไกใหม่ขนานกัน — กัน bloat + สับสน (สอด "กระทัดรัด opinionated"); หลักฐาน: #6/#7/#8 ขยาย playbook §3/§6 ในที่เดิมทุกครั้ง
- **worked-example convention** (enforce ของ "tool-agnostic / ไม่ duplicate") — เอกสารตัวอย่างสอนผู้ใช้ (เช่น `docs/example-walkthrough.md`) ต้อง (1) **surface achieved topic จริง — ชี้กลับ ไม่ duplicate** เนื้อหา (เหมือน command/skill ชี้ playbook), (2) มี **disclaimer snapshot + pointer ไป playbook source** (`src/.warnyin/workflow/stages/`) กัน narrative drift เมื่อโครงเปลี่ยน, (3) **ไม่ ship npm** (อยู่ `docs/` นอก `files` — ผู้ใช้ดูบน repo), (4) **ลิงก์ playbook ชี้ `src/.warnyin/`** (committed source) ไม่ใช่ root `.warnyin/` (dogfood gitignored → ไม่ resolve บน GitHub); เน้นเล่า **decision/เหตุผล** ไม่ใช่ลอกขั้นตอน — maintenance ต่ำ + กัน staleness

## 2. Engineering rules
- **zero-dependency** — `devDependencies` ต้องว่างเสมอ; ทุกเครื่องมือใช้ built-in `node:*` (test = `node:test`) — เหตุผล: กระทัดรัด + ไม่มี supply-chain risk (จุดขายของ tool)
- **ESM** — repo `type: module`; ใช้ `import`/`export`, `import.meta.url` ไม่ใช่ `__dirname`/`require`
- **ภาษา:** คอมเมนต์/ข้อความผู้ใช้เป็นภาษาไทย ตามสไตล์ `src/bin/cli.mjs`
- **CHANGELOG ทุก user-facing change** — bump `engines`, breaking, เปลี่ยนพฤติกรรม installer → ต้องมี entry ใน `CHANGELOG.md` (Keep a Changelog) ให้ผู้ใช้ npm migrate เองได้โดยไม่ต้องเดา
- **npm scripts (dev tooling) ต้อง cross-platform** — เป็น **node script** (`node src/scripts/*.mjs`) ไม่ใช่ shell oneliner ที่ผูก POSIX; ใช้ `os.tmpdir()`/`path.join` (ห้าม hardcode `/tmp`, `/`), spawn array args ห้าม `shell:true` (ยกเว้น npx บน win32 ที่เป็น `.cmd`); เผื่อ Windows npx bin-shim resolve ไม่ได้ → ต้องมี fallback หรือ exit error ชัดเจน

## 3. Security baseline
> security 2 มิติ: **CI/pipeline** (3.1) + **การรัน AI agent ในเครื่อง** (3.2) — payload ของ workflow ถูก agent execute ต่อ จึงเป็น surface ทั้งคู่

### 3.1 CI security baseline (บังคับทุก workflow ใน `.github/workflows/`)
> ถ้าผิดหลายข้อพร้อมกัน = pwn-request / supply-chain risk
- `permissions: contents: read` ที่ top-level (least-privilege)
- trigger `pull_request` — **ห้าม `pull_request_target`** (job รันโค้ดจาก PR)
- **ไม่มี `secrets.*`** เว้นจำเป็นจริง (เพิ่ม publish/token ต้องผ่าน review แยก)
- pin action ด้วย commit SHA (+ คอมเมนต์เวอร์ชัน)
- **ไม่ตั้ง `npm ci`/`cache: npm`** ตราบที่ repo zero-dep (ไม่มี lockfile → จะ fail)

### 3.2 Agent-runtime security baseline (การรัน AI agent ในเครื่อง — guidance portable)
> tool-agnostic principle; รายละเอียด + Claude adapter note ใน `roles/security.md` section "Runtime / operational security" · ไล่เช็คตอน DESIGN panel + VERIFY (รัน local env ที่มี secret จริง)
- **secret isolation** — agent ไม่ควรเข้าถึง secret นอก scope งาน (`.env`, `~/.ssh`, credential/token, keychain); least-privilege ระดับ filesystem
- **no unnecessary egress** — payload/skill ที่ agent execute ต่อ จำกัด egress เท่าที่งานต้องใช้ (sandbox/network restriction)
- **identity separation** — ไม่ใช้ credential ส่วนตัว/prod ใน session ที่รัน automation/agent; แยก scoped identity
- **supply-chain** — third-party skill/MCP/payload `.md` = prompt-injection surface (โค้ด+instruction ที่ AI execute ต่อ) → ตรวจเนื้อหาก่อนติดตั้ง, ติด global ไม่ vendor เข้า repo, จำกัดสิทธิ์

## 4. Installer / packaging rules
- **installer สร้าง scaffold เอง — ห้าม copy พื้นที่ทำงานจาก repo ต้นทาง** — workspace ที่ผู้ใช้เป็นเจ้าของ (`docs/stages/`) ต้อง generate ใน target ไม่ลากของ repo ต้นทางไป (กัน scaffold leak → ดู `troubleshooting.md` #1)
- **pack-verify เป็น gate ก่อน publish + testable** — assert payload ติด tarball **และ** ไม่มีงานจริง/ไฟล์รั่ว (`docs/`, `src/tests/`, `src/scripts/`, `.github/`, installed dogfood ที่ root) หลุดขึ้น package; แยก pure `checkFiles(files)→errors[]` + unit พิสูจน์ denylist จับได้จริง (กัน gate ลวง)
- **`package.json files` เป็น allowlist (granular)** — เพิ่ม path ใหม่ต้องคิดว่า publish ไปด้วยไหม; **nested dotfolder ต้องระบุชัดทุกก้อน** (npm ไม่รวมให้อัตโนมัติ — แม้ไม่ใช่ top-level)

## 5. Testing rules
- **test installer = black-box spawn** — spawn `src/bin/cli.mjs` จริงใน temp dir แล้ว assert side-effect (ไฟล์/exit code/stdout/stderr); **ห้าม refactor target เพื่อ testability** + ห้าม import logic จาก `cli.mjs` (มันรัน side-effect ตอน import)
- **harness กลาง** — `makeTempProject(t)` + `runCli(cwd, args)` เป็น test pattern กลางของ repo ใช้ซ้ำทุก test ของ CLI (ดู `docs/techstack/installer/standard.md`)
- assert `code===0` ก่อนเสมอ + surface `stderr` ใน assertion message; assert stream ให้ตรง (`console.warn`→stderr); spawn array args ห้าม `shell:true`
- **acceptance = pass count ไม่ใช่แค่ exit 0** — `node --test` คืน exit ที่หลอกได้ (tests=1 pass=0) → gate ต้อง assert pass count บน CI matrix (ดู `check-test-count.mjs`; `troubleshooting.md` #3)
- **ห้ามใส่ path/glob arg ให้ `node --test`** ถ้าต้อง portable ข้าม node major — ใช้ bare `node --test` (auto-discover); node 24 ตี path เป็น module, glob `**` ใช้ได้แค่ node 21+ (`troubleshooting.md` #3)
- **verify เอกสาร narrative = accuracy เทียบ source** — เอกสารที่ "เล่าเรื่อง" จาก source อื่น (เช่น worked-example เล่า achieved topic) มีความเสี่ยงเฉพาะ = **misrepresent** (เล่าผิด/แต่งให้ดูดี); VERIFY ต้อง (1) เทส **dead-link** ทุกลิงก์ resolve, (2) เทส **claim ทุกข้อตรงกับ source จริง** (เทียบ build/verify/proposal/ship), (3) **snapshot honesty** — ถ้าตัวเลข/สถานะเปลี่ยนไปแล้ว เอกสารต้องรายงาน **ค่าประวัติ ณ ตอนนั้น** ไม่ใช่ค่าปัจจุบัน (กันเข้าใจผิด)

## 6. Bootstrap / self-hosting (2-layer)
> repo นี้ dogfood ตัวเองด้วย release เสถียร (เทียบ compiler ที่ compile ตัวเองด้วยเวอร์ชันก่อน) — ดู `docs/project.md`, `docs/infra.md`
- **source/dogfood แยกชั้นเด็ดขาด** — source ของ warnyin v-next อยู่ `src/**` (committed, publish) เท่านั้น; root `.warnyin/`/`.claude/{commands/warnyin,agents}`/`CLAUDE.md`/`AGENTS.md` เป็น **dogfood ที่ install จาก release และ gitignored** — ห้าม commit (กันแก้ workflow แล้วพังกลางงาน)
- **`.gitignore` ของ dogfood ต้อง root-anchored (`/` นำหน้าทุกบรรทัด)** — เช่น `/.warnyin/` ไม่ใช่ `.warnyin/` ลอย ๆ. git: pattern **trailing-slash อย่างเดียว** (เช่น `.warnyin/`, `.claude/`) match ที่ **ทุก depth** → จะโดน `src/.warnyin/`, `src/.claude/` (source) ด้วย → **source หายจาก git**; ส่วน pattern ที่มี separator **กลาง** (เช่น `.claude/agents/`) git anchor to repo root ให้อยู่แล้ว (ไม่ leak src) — แต่ยัง **anchor `/` ทุกบรรทัดให้ explicit** เพื่อกันพลาด (ดู `docs/troubleshooting.md` #11). ตรวจด้วย `git check-ignore src/...` ว่า source ไม่โดน ignore เสมอ
- **regen dogfood ด้วย `npm run setup:dogfood`** (install release ลง root) · **test v-next ด้วย `npm run setup:sandbox`** (install `src/` ลง temp, ไม่แตะ root dogfood)
