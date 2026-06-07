# Task — validator-script

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `validator-script` |
| **Slice อ้างอิง** | `design.md` slice #1 (validator ใช้งานได้จริง — script 2 โหมด + unit) |
| **Component** | installer/dev-tooling (`docs/techstack/installer/`) + workflow payload (`src/.warnyin/workflow/scripts/`) |
| **Wave** | 1 (ไม่มี dependency — ปลดล็อก `playbook-wiring`) |
| **สถานะ** | `build เสร็จ ✅ (test 53/53 + self-validate + lint:md + verify:pack เขียว)` |

## 1. เป้าหมายของ task (vertical slice)
สร้าง **`src/.warnyin/workflow/scripts/validate-topic.mjs`** (zero-dep `node:*`, ไฟล์เดียว 2 โหมด status/validate ตาม design §4.1) + **`src/tests/validate-topic.test.mjs`** (ตามเคส design §8) — pure fn `checkTopic(files)→{issues:[{code,level,msg}],stage}` + `checkFeatureSpec(name,content)→issues[]` + `main()` walk + main-guard; **copy contract จาก design §4 เท่านั้น** (CLI contract + C1–C5 + stage→artifact + security invariant). โครงตรวจได้ end-to-end: รันได้จริงในโปรเจกต์ปลายทาง + พิสูจน์ด้วย unit+executable.

## 2. Dependency
- **ต้องทำก่อน:** ไม่มี (wave 1 — เริ่มได้ทันที)
- **ปลดล็อก:** `tasks/playbook-wiring` (wiring อ้าง CLI contract §4.1 ของ script ที่มีจริง — ชื่อ/คำสั่ง/exit code)
- **ขนานกับ:** — (wave 1 มี task เดียว)
- **ส่ง output ต่อ:** script ที่ wiring 3 จุด (next/DESIGN/SHIP) จะชี้ถึง + VERIFY ของ topic ใช้ self-validate เป็น proof

## 3. Sub-tasks
> อ่าน precedent + template artifact จริงก่อนเขียน (ห้ามเดา) — contract copy จาก design §4

- [x] 1. **อ่าน precedent + source** — `src/scripts/lint-md.mjs` (pure fn + injectable + walk + main-guard) · `src/tests/lint-md.test.mjs` (unit feed ปลอม) · `src/tests/installer.test.mjs` (`makeTempProject`/spawn) · template artifact จริง `src/.warnyin/template/stages/[topic]/{ship,design}.md` (ดู H1 + section) · `docs/features/spec-delta/spec.md` (baseline format C5)
- [x] 2. **เขียน pure fn `checkTopic(files)`** — รับ `Map<relPath,content>` คืน `{issues:[{code,level,msg}], stage}`; C2 (existence 4 ไฟล์, ข้าม `[...]`) · C3 (ship filled-trigger + ≥1 data row จริง) · C1/C4 (⚠ ตาม `isFilled`/stage→artifact §5) · stage inference _(design §4.2–4.3)_
- [x] 3. **เขียน pure fn `checkFeatureSpec(name, content)`** — C5: `## Requirement:` ≥1 · ทุก Requirement มี `### Scenario:` · ทุก Scenario มี GIVEN+WHEN+THEN (case-insensitive, ไม่ enforce order) _(design §4.2)_
- [x] 4. **เขียน `main()` + main-guard** — walk `docs/stages/` (ข้าม `achieved/`+`context.md`) สร้าง Map ต่อ topic + walk `docs/features/*/spec.md`; โหมด status (ไม่มี arg, ตารางทุก topic, exit 0) / validate (1 arg, slug whitelist จาก `readdirSync` → exit 2 ถ้าไม่ตรง, ✖→exit 1) / >1 arg→exit 2; ENOENT guard; ไม่ echo เนื้อ artifact _(design §4.1, §4.4 / B7)_
- [x] 5. **เขียน unit** (`validate-topic.test.mjs`) — feed `Map`/string ปลอม positive+negative ต่อเช็ค (design §8 list): C2 ครบ/ขาด/ว่าง/skip`[...]` · C3 template-skip/header-only/data-row · C5 no-scenario/no-WHEN/ครบ · C1/C4 ⚠ · stage inference · structured `code`
- [x] 6. **เขียน executable spawn** (ใน temp, harness จาก `installer.test`) — slug invalid/`../`→exit 2 · fixture ขาดไฟล์→exit 1 · status หลาย topic→ตารางถูก+exit 0 · skip `achieved/`+`context.md` (spawn array args, ไม่ shell, ไม่รัน cwd=repo root)
- [x] 7. **gate + self-validate** — `npm test` เขียว (suite โตจาก 26) · `npm run lint:md` · `npm run verify:pack` (script ใหม่ติด tarball) · รัน validate กับ topic `validator-status` เองได้ (ผลตรงสถานะจริง)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ — **สร้างใหม่ 2 ไฟล์เท่านั้น**
- **สร้าง:** `src/.warnyin/workflow/scripts/validate-topic.mjs` · `src/tests/validate-topic.test.mjs`
- **ห้ามแตะ:**
  - `src/bin/cli.mjs` · `src/scripts/verify-pack.mjs` — **ไม่ต้องแก้** (Infra ยืนยัน CORE ครอบ `.warnyin/workflow` + allowlist `src/.warnyin/` ครอบ path ใหม่แล้ว — precedent `build-wave.mjs`)
  - playbook/command — `src/.warnyin/workflow/*.md`, `src/.claude/commands/` (เป็นของ task `playbook-wiring`)
  - docs/ กลาง — `docs/rule.md`, `docs/techstack/`, `docs/features/` · CHANGELOG (ของ wiring task)
  - root dogfood — `.warnyin/`, `.claude/` ที่ root

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [x] 2 ไฟล์มีจริง: `validate-topic.mjs` (pure fn `checkTopic`/`checkFeatureSpec` export + `main()` + main-guard `argv[1]` comparison) + `validate-topic.test.mjs`
- [x] CLI contract ตรง design §4.1: status (ไม่มี arg → ตาราง/`"ไม่มีงานค้าง"` + exit 0) · validate (`<slug>` → `✖[Cx]`/`⚠[Cx]` มี code + exit 1 เมื่อมี ✖, 0 เมื่อ ⚠/สะอาด) · slug ผิด/`../`/arg เกิน → exit 2
- [x] **(B1)** filled = H1-placeholder heuristic (`/<[^>]+>/`) — ไม่มี `const FILLED_MARKERS`
- [x] **(B2)** C1 ใช้ตาราง stage→artifact §4.3 (required/optional — business/discovery optional)
- [x] **(B3)** C3 เช็ค ≥1 data row จริง (ไม่นับ header/separator/row ว่าง)
- [x] **(B4)** C3 ข้ามเมื่อ `ship.md` ยัง template H1 (self-validate ตอน DESIGN ไม่ false-fail)
- [x] **(B5)** error เป็น `{code,level,msg}` → test assert structured
- [x] **(B7)** slug whitelist จาก `readdirSync('docs/stages/')` → path traversal = exit 2
- [x] ✖ checks (C2/C3/C5) ไม่พึ่ง filled; C1/C4 = ⚠ เท่านั้น
- [x] **security:** เฉพาะ `node:fs`/`node:path`/`node:url` — ไม่มี `child_process`/network/write; report structural เท่านั้น (ไม่ echo เนื้อ artifact); ENOENT/EACCES guard ไม่พ่น absolute path
- [x] unit positive+negative ต่อเช็ค (design §8) ครบ + executable 4 เคส (slug invalid→2, fixture→1, status→0, skip achieved)
- [x] `npm test` เขียว (pass count โตจาก 26) + `npm run lint:md` + `npm run verify:pack` เขียว
- [x] self-validate topic `validator-status` ได้ (ผลตรงสถานะจริง)
- [x] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical source: `../../design.md` §4.1 (CLI) + §4.2 (C1–C5) + §4.3 (stage→artifact) + §4.4 (โครงโค้ด+security) + §8 (test) + "Design review" (B1–B7)
- Precedent: `src/scripts/lint-md.mjs` + `src/tests/lint-md.test.mjs` + `src/tests/installer.test.mjs` + `src/.warnyin/workflow/scripts/build-wave.mjs`
