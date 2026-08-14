# Changelog

ทุกการเปลี่ยนแปลงที่สำคัญของโปรเจกต์นี้ถูกบันทึกในไฟล์นี้

รูปแบบอ้างอิง [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
และโปรเจกต์ยึด [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## Migration guide

อัปเกรดจากรุ่นเก่าที่ layout ต่างไป (installer จะ **เตือนให้ย้ายเอง ไม่แตะงานจริงของคุณ**):

> **ลำดับที่แนะนำ: ย้ายงานจริงก่อน แล้วค่อยรัน `npx @warnyin/agents`**
> คำสั่งย้ายด้านล่างใช้รูปแบบ `git mv <เก่า>/* docs/stages/` (ย้าย *เนื้อหา* ไม่ใช่ทั้งโฟลเดอร์) จึงปลอดภัยทั้งกรณีที่ยังไม่มี `docs/stages/` และกรณีที่เผลอรัน installer ไปก่อน (installer สร้าง `docs/stages/` เปล่าให้แล้ว) — กันงานจริงไปซ้อนเป็น `docs/stages/stages/`

| จากรุ่น | layout เดิม | ต้องทำเอง (งานจริงปลอดภัย ไม่ถูกแตะ) |
|---|---|---|
| **≤0.2.x** | core `workflow/` + งานจริง `warnyin-stages/` ที่ root | `mkdir -p docs/stages && git mv warnyin-stages/* docs/stages/` แล้วลบ core เก่า `rm -rf workflow warnyin-stages` |
| **0.3–0.5.x** | ทุกอย่างใต้ `warnyin/{workflow,template,installer,stages}` | `mkdir -p docs/stages && git mv warnyin/stages/* docs/stages/` แล้วลบ core เก่า `rm -rf warnyin` |

จากนั้นรัน installer อีกครั้ง — installer จะวาง `.warnyin/` (core) ชุดใหม่ + แยกงานจริงไว้ที่ `docs/stages/` ให้

> **0.6.0 → 0.7.0:** ผู้ใช้ปลายทาง (`npx @warnyin/agents`) **ไม่ต้องทำอะไร** — payload ที่ติดตั้งคงเดิม การเปลี่ยนแปลงทั้งหมด (bin path → `src/`, dogfood 2-layer) เป็นเรื่องภายใน repo เท่านั้น; ผู้พัฒนา repo เอง (contributor) ดู [`CONTRIBUTING.md`](CONTRIBUTING.md)

## [0.30.0] - 2026-08-14

> ลด ceremony ของ workflow 5 จุดที่วัดแล้วว่าซ้ำหรือไม่ถูกใช้ — **ไม่มี gate ใดถูกลด**: full build+test ยัง blocking, hard-floor 5 หมวดคงเดิม, evidence-before-promote ของ SHIP คงเดิม, approve gate ของ wireframe คงเดิม

### Added
- **`✖ [C7]` — validator บังคับ cap ขนาดเอกสารต่อ tier** — เดิม cap ใน `triage.md §2D` เป็นตัวเลขในเอกสารที่ไม่มีใครเช็ค (วัดจาก 39 topic: `design.md` เกิน cap 12 ไฟล์ สูงสุด 611 บรรทัด) ตอนนี้ `validate-topic.mjs` เช็คจริง: `fast` receipt ≤40 · `standard` proposal ≤60 / design ≤120 · `large` ไม่มี cap — เกิน = ✖ block (exit 1); tier อ่านจากช่อง `ขนาด` ใน `proposal.md` และถ้าอ่านไม่ได้ = ⚠ ข้ามเช็ค ไม่บังคับ (fail-safe) · `design.md` นับเฉพาะบรรทัด **ก่อน** `## 9. Spec delta` (delta เป็นเนื้อ spec ที่ถูก merge ออกตอน SHIP ไม่ใช่ narrative) — runbook ใน `docs/infra.md`
- **BUILD → VERIFY เดินต่อในเซสชันเดียว** — หลัง full-gate เขียว BUILD ถามยืนยันหนึ่งครั้งแล้วเดิน VERIFY ต่อ (ปฏิเสธ → หยุด ให้สั่ง `/warnyin:verify` เอง) — **VERIFY ไม่ถูกข้ามหรือลดทอน** และยังบังคับให้ตรวจโดย agent อิสระจากผู้เขียนโค้ด

### Changed
- ★ **DESIGN auto-route งาน fast → fastlane ในคำสั่งเดียว** — เดิม `tier=fast` จบที่ pre-flight receipt แล้วผู้ใช้ต้องพิมพ์ `/warnyin:fastlane` เอง (ผลจริง: fast tier ถูกใช้ 1 ใน 39 topic) ตอนนี้ DESIGN ถามยืนยัน **หนึ่งครั้ง** แล้วเดิน skip-list ครบ 4 row ต่อเลย — handoff ที่ user ยืนยันในเซสชันนับเป็น user-invoked ตามกฎเดิมของ `fastlane.md §1` (AI auto-invoke เองยังห้าม); ปฏิเสธ → หยุดที่ receipt เหมือนเดิม
- ★ **artifact ของ BUILD/VERIFY ยุบ 3 ไฟล์ → 1** — `build.md` + `test.md` + `verify.md` รวมเป็น `build.md` ไฟล์เดียว 4 section (`## 1. ผล build ต่อ task` · `## 2. Full build & test gate` · `## 3. แผนเทส (VERIFY)` · `## 4. ผล verify + การแก้`); template `[topic]/test.md` และ `[topic]/verify.md` ถูกลบ · validator เปลี่ยนการ infer stage VERIFY จาก "มีไฟล์" เป็น "มี section `## 4. ผล verify` ใน `build.md`"
- **review panel / dry-run เปลี่ยนจากถามทุกครั้งเป็น trigger by signal** — เสนอเฉพาะเมื่อ `tier=large` **หรือ** change แตะ hard-floor **หรือ** มี task ≥ 4; ไม่เข้าเงื่อนไข → ข้ามเงียบไม่ถาม (เมื่อเข้าเงื่อนไขยังถามก่อนเสมอ ไม่ fan-out เอง)
- **UX wireframe: detect ผ่าน → วาดเลย** — ตัดคำถาม "จะวาด wireframe ไหม" ออก (detect มี exclusion-ก่อน-signals อยู่แล้ว); **approve gate ของภาพยังอยู่** — ผู้ใช้ยังต้องยืนยัน/ปรับ wireframe ก่อนแตก task
- **จุดเขียน project memory 6 → 3** — เดิมเขียนท้ายทุก stage (`discovery/design/build/verify/ship` + `fastlane`) ตอนนี้เหลือ **จบ BUILD** (main loop เท่านั้น หลัง integrate ครบ) · **SHIP** · **fastlane** (ship-lite) — สถานะของ Discovery/DESIGN/VERIFY อยู่ใน artifact ของ stage นั้นบนดิสก์อยู่แล้ว
- **ตัดข้อความซ้ำระหว่าง `stages/build.md` กับ `stages/verify.md`** — step 0 (เช็ค context window), investigate-before-edit, config-protection และ loop-tuning report เคยเขียนเต็มทั้งสองไฟล์ ตอนนี้เหลือ canonical ที่เดียวและอีกฝั่งเป็น pointer พร้อมพิกัด

### Migration
- **topic ที่ค้างอยู่ไม่ต้องย้ายอะไร** — `test.md`/`verify.md` ที่มีอยู่แล้วไม่ทำให้ validator แดง (ย้ายเป็น optional ไม่ใช่ลบออกจากเช็ค) และ `docs/stages/achieved/` ไม่ถูกสแกนอยู่แล้ว — topic **ใหม่** จะได้ template `build.md` 4 section
- **เอกสารที่เกิน cap จะถูก block ด้วย `✖ [C7]`** — ทางแก้ตามลำดับที่แนะนำ: (1) ย่อเอกสารให้อยู่ใน cap (2) ตรวจว่าช่อง `ขนาด` ใน `proposal.md` ระบุ tier ถูกต้อง (3) ประกาศ `large` เมื่อ change ใหญ่จริง — **ห้ามแก้ตัวเลข cap ใน `triage.md §2D` เพื่อให้ผ่าน**; รายละเอียดอยู่ใน runbook ของ `docs/infra.md`
- **ผู้ใช้ที่พึ่งพา prompt "จะให้ panel รีวิวไหม" ทุก topic** — งานขนาด standard ที่ต่ำกว่า 4 task จะไม่ถูกถามอีก; ต้องการ panel → สั่งได้เองหรือยกระดับ tier

## [0.29.1] - 2026-08-14

### Fixed
- cli --help wording: `'ไม่แตะ docs/'` → `'docs/ ถูก seed จาก template ไม่ทับของเดิม'`

### Migration
> **⚠️ commit/stash งานที่ยังไม่ได้ commit ก่อน** — `git reset --hard` ลบงานค้างถาวร
>
> ผู้ใช้ที่ clone repo ก่อน 2026-07-14 (release 0.27.1 — ก่อนเพิ่ม `.gitattributes`) และยังไม่ได้ renormalize:
> ```bash
> git rm --cached -r .
> git reset --hard
> ```
> แล้ว `npm run verify:pack` จะผ่าน (payload กลับเป็น LF ทั้งหมด)
>
> dev ที่ clone หลัง 2026-07-14: ไม่ต้องทำอะไร (working tree = LF อยู่แล้ว)

## [0.29.0] - 2026-08-08

### Added
- **Skill เสริม role UX: `emilkowalski/skills`** — เพิ่มชุด design/animation 9 skills (MIT, โดย Emil Kowalski — Sonner/Vaul) เข้าตาราง "Skill เสริมต่อ role" ใน `roles/README.md` + section "Skill เสริม" ของ `roles/ux.md` ตามแนวทาง **reference ไม่ vendor**: แกนคือ `emil-design-eng` (design judgment + animation philosophy) เสริมด้วย `animate` · `review-animations` (เหมาะกับ VERIFY UXUI) · `improve-animations` · `find-animation-opportunities` · `animation-vocabulary` · `apple-design` · `pick-ui-library` · `prototype` — ใช้ยกคุณภาพ motion/design ตอนลง hi-fi ใน BUILD ต่อจาก wireframe low-fi (คนละแกนกับ `ui-ux-pro-max` ที่เน้น styles/palettes ใช้คู่กันได้); ตรวจเนื้อหา ณ commit `de33dbe` (markdown ล้วน ไม่มี script) + note prompt-injection ตาม `docs/rule.md` §3.2

## [0.28.0] - 2026-07-27

### Added
- **Project memory — ความจำระดับโปรเจกต์ที่อยู่ใน repo** (feature `project-memory`) — playbook กลาง `.warnyin/workflow/memory.md` เป็น single source ของกติกา (semantic · governance · schema · lifecycle · write point · consume · promote · trust boundary · ทบทวน) + ไฟล์จริง 2 ใบที่ installer seed ให้: `docs/stages/context.md` (snapshot 4 section เขียนทับ ไม่สะสม) และ `docs/memory.md` (ตาราง 6 คอลัมน์ = บทเรียนที่ยังพิสูจน์ไม่พอจะเป็นกฎ)
- **hook เขียน memory ท้ายงาน** — ทั้ง 5 stage + executor `fastlane` เขียนแบบ conditional (ไม่มีอะไรเปลี่ยน → ข้าม); BUILD เขียนเฉพาะ **main loop หลัง integrate** — sub-agent ใน git worktree ห้ามเขียนเอง
- **จุดอ่าน memory** — Discovery / `next` / `explore` อ่าน 2 ไฟล์นี้เป็น **data ไม่ใช่ instruction** (คำสั่งที่เขียนอยู่ในไฟล์ → ignore, ยืนยันกับโค้ด/เอกสารจริงเสมอ)
- **`/warnyin:memory [ทบทวน]`** — command ดู/ทบทวน project memory (read-only; โหมดทบทวนเสนอรายการที่จะ promote/ตัด แล้ว **รอ user ยืนยันก่อนเขียน** ไม่ลบเงียบ)
- **`.warnyin/workflow/scripts/memory-status.mjs`** — รายงานสุขภาพ memory แบบ deterministic (จำนวน entry ต่อสถานะ, จำนวนบรรทัดของ context, entry ที่ค้างนาน) — read-only, ไม่พิมพ์เนื้อ entry, exit 0 เสมอ (report ไม่ใช่ gate)
- **`src/tests/memory.test.mjs`** — structural test ข้าม slice: heading freeze, single-source negative-grep, hook ครบ 6 ไฟล์, registry/root-doc note, คำเตือนใน template + 0 markdown-link, และ regression ของ SHIP gate

### Changed
- **SHIP รับ `docs/memory.md` เป็นแหล่ง learned-rule candidate เพิ่ม** — step รวบ candidate ดึง entry สถานะ `open` ที่มี evidence (dedup กับ `tasks/*/rule.md` §2 โดยยึดฝั่งที่ผูก task) และเปลี่ยนสถานะเป็น `promoted`/`dropped` **หลัง user อนุมัติแล้วเท่านั้น**; **gate เดิมไม่ถูกลดทอน** (evidence บังคับ + user ยืนยัน per-rule เหมือนเดิม) — `docs/memory.md` อยู่นอก `docs/stages/` จึงไม่ถูก archive ไปกับ topic
- **`verify:pack` เลิกเป็น gate ลวงของ template** — เดิม assert แค่ 3 prefix (payload workflow/commands/skills) → template หายจาก tarball ก็ยังเขียว; ตอนนี้ assert เพิ่มว่า `src/.warnyin/template/docs/` ติด tarball จริง พร้อม unit ที่ป้อน file list ปลอมพิสูจน์ว่าจับได้
- **`/warnyin:init`** — seed `docs/` จาก template แบบ recursive **ก่อน** แล้วสร้างไฟล์เปล่าเป็น fallback เฉพาะเมื่อ template ไม่มี (เดิมสร้าง `docs/stages/context.md` เป็นไฟล์เปล่าเสมอ)

### Fixed
- **★ installer เขียน payload เป็น LF เสมอ — แก้ `/warnyin:build` พังบนเครื่องที่ payload เป็น CRLF** — `.warnyin/workflow/scripts/*.mjs` ถูกส่งผ่าน Workflow tool ที่ **ปัดตก script ที่มี control character**; CR (`\r`) ของ CRLF เป็น control char → BUILD ล้มทันทีตั้งแต่ยังไม่เริ่ม fan-out (`script contains control characters that would be hidden in the approval dialog`). ต้นเหตุ: `npm pack` แพ็คจาก **working tree** — checkout ที่เกิดก่อนมี `.gitattributes` ยังเป็น CRLF ทั้งชุด → tarball มี CRLF → installer copy แบบ byte ลง target ตรง ๆ. แก้ที่ **จุดเขียน**: `normalizeEol()` ใช้กับทุกจุดที่ installer เขียนเนื้อไฟล์จาก package ลง target (payload, seed `docs/`, root doc, adapter, CodeBuddy plugin) — ไฟล์ binary ไม่ถูกแตะ, byte-equal skip เทียบกับเนื้อที่ normalize แล้ว (ไม่เขียนซ้ำทุกรอบ)
  - **ผู้ใช้ที่ติดตั้งไว้แล้วและ BUILD พัง:** รัน `npx @warnyin/agents --update` — payload จะถูกเขียนทับเป็น LF
  - เทสคุม: unit ของ `normalizeEol` (string/Buffer · lone CR · utf-8 ไทย · binary ไม่แตะ) · black-box ที่ประกอบ package ปลอมเป็น CRLF แล้วยืนยันว่าไฟล์ที่ติดตั้งเป็น LF · gate ว่าไฟล์ text ทุกนามสกุลใต้ `src/` ไม่มี CR (เดิมครอบแค่ `.mjs`)

### Migration
- **ผู้ใช้เดิมที่รัน `npx @warnyin/agents --update` ได้ `docs/memory.md` อัตโนมัติ** — installer seed `docs/` ทุกครั้ง (ไม่ว่ามี `--update` หรือไม่) และ **ไม่ทับไฟล์ที่มีอยู่**
- **`docs/stages/context.md` ที่เป็นไฟล์ว่าง 0 byte อยู่แล้ว จะไม่ถูกทับ** (installer รุ่นก่อนสร้างไว้เป็นไฟล์เปล่า → seed มองว่า "มีแล้ว" จึงข้าม) — **ไม่ต้องทำอะไร**: stage แรกที่เขียน memory จะเติมโครง 4 section ให้เองตามกติกา `.warnyin/workflow/memory.md` §4 (ไฟล์ว่าง/ไม่มี heading = ถือว่ายังไม่มี → เขียนทับด้วยโครงเต็มจาก template); ถ้าอยากได้โครงทันที ให้ลบไฟล์ว่างนั้นแล้วรัน `npx @warnyin/agents --update` ซ้ำ

## [0.27.1] - 2026-07-14

### Fixed
- **BUILD พังด้วย `script contains control characters` — payload script เป็น CRLF** — `.warnyin/workflow/scripts/build-wave.mjs` (และ `.mjs` อื่น) ถูก checkout/pack เป็น CRLF บนเครื่อง Windows (`core.autocrlf`) → CR (`\r`, 0x0D) เป็น control char → Workflow tool ปัดตกตอน BUILD fan-out. แก้: เพิ่ม `.gitattributes` บังคับ `* eol=lf` + normalize payload เป็น LF ล้วน → payload สะอาดข้าม OS. เพิ่ม EOL regression gate (`src/tests/eol.test.mjs`) กัน CRLF หลุดกลับ

## [0.27.0] - 2026-07-13

### Added
- **`/warnyin:fastlane`** — executor ของ fast tier: รับ change ขนาดเล็กจาก user → บังคับ `tier=fast` → เดิน [fast-track skip-list](src/.warnyin/workflow/triage.md#fast-track-skip-list) ครบ 4 row จบในคำสั่งเดียว (pre-flight เขียน receipt → code-first → gate → เติม receipt → ship-lite + archive) — playbook `.warnyin/workflow/fastlane.md`, adapter `.claude/commands/warnyin/fastlane.md`; user-invoked เท่านั้น (ไม่ auto-invoke เป็น skill)

### Changed
- **hard-floor รับ explicit user override** — เดิม แตะ 5 หมวด hard-floor (auth/authz · data-migration/schema · secret/credential · public-API/contract · security-sensitive) บังคับ ≥ standard เสมอ; ตอนนี้ fast-track ที่เจอ hard-floor กลางทาง เตือนชัด + หยุดถาม user 2 ทาง (`upgrade เป็น standard` | `ยืนยันลุย fast ต่อ`) — ยืนยันลุยต่อ → บันทึก `override โดย user` ลง receipt meta (audit trail); ship-lite ยอม ship เฉพาะ receipt ที่มี override นี้เท่านั้น. `/warnyin:triage` ยัง read-only เหมือนเดิม — ยังห้ามแนะนำ fast เมื่อแตะ hard-floor

## [0.26.0] - 2026-07-09

### Added
- **Support CodeBuddy IDE** — installer (`npx @warnyin/agents`) ติดตั้ง CodeBuddy plugin ใน `.codebuddy/plugins/warnyin/` พร้อมกันอัตโนมัติ (zero-config, ทั้ง `--project` และ `--global` mode)
  - `.codebuddy-plugin/plugin.json` — plugin manifest (จาก `templates/codebuddy-plugin.json`)
  - `rules/warnyin_rules.md` — context/rules adapter (`alwaysApply: true`, จาก `templates/codebuddy-rules.md`)
  - `commands/warnyin/*.md` — slash commands ครบ 11 ตัว (share source จาก `.claude/commands/warnyin/` ไม่ duplicate)
  - strategy: overwrite เมื่อ `--update`, idempotent (byte-equal → skip), ไม่แตะงาน user
- `installCodeBuddyPlugin()` + `copyDirToTarget()` helper ใหม่ใน `cli.mjs`
- CLAUDE.md template + `src/AGENTS.md` อัปเดต mention CodeBuddy

## [0.25.0] - 2026-07-09

### Added
- **Support universal IDE — adapter install สำหรับทุก IDE ที่มี root instruction file pattern** (feature `support-universal-ide`) — installer (`npx @warnyin/agents`) ติดตั้ง adapter ทุกตัวพร้อมกันแบบ unconditional (zero-config): Cursor (`.cursor/rules/warnyin.mdc`), Windsurf (`.windsurf/rules/warnyin.md`), Copilot Chat (`.github/copilot-instructions.md`), Cline/Roo Code (`.clinerules`), Gemini CLI (`GEMINI.md`). strategy: Cursor/Windsurf ใช้ `installAdapterDoc` (overwrite-capable) · Copilot/Cline/Gemini ใช้ append-with-marker (idempotent, ไม่เขียนทับงาน user). ทำงานทั้ง `--project` และ `--global` mode. backward-compatible 100% (ไม่ลบหรือแก้ไฟล์เดิม). `verify-pack` รู้จัก adapter template paths ผ่าน `src/.warnyin/` prefix ที่มีอยู่แล้ว

## [0.24.0] - 2026-07-07

### Added
- **Fast-track receipt — code-first path สำหรับ change เล็ก** (feature `fast-track-receipt`) — `fast` tier topics ข้าม task-file folder → ใช้ receipt ที่เก็บ meta + acceptance + test result อย่างเดียว; lifecycle: pre-flight ก่อนแตะโค้ด (DESIGN code-first ตาม playbook) → BUILD+VERIFY ใน receipt §3+§4 → SHIP-lite; template `src/.warnyin/template/stages/receipt.md` ≤40 บรรทัด ตาม tier cap — backward-compatible (standard/large ใช้ task folder เดิม). payload ติดมากับ `--update` รอบถัดไป
- **Learning-loop-tuning orchestration guide** (feature `learning-loop-tuning-orchestration`) — `src/.warnyin/workflow/loop-tuning.md` เป็น single-source ของ loop tuning theory (credit horizon + experience batching) ย้ายจาก inline ใน `build.md`/`verify.md` → playbook ทั้งสอง stage ชี้ pointer บาง `../loop-tuning.md` (ไม่ duplicate theory) — gateway `triage.md` §2C ระบุ default-by-tier. backward-compatible (non-blocking guidance).

### Changed
- **Document length caps per tier** — `triage.md §2D` ระบุ cap: fast receipt ≤40 · standard proposal ≤60 / design ≤120 · large ไม่ cap (judgment); command adapter ชี้ cap ในรายงาน — ไม่ enforce automatic ให้ model judgment; `specs/` `design.md` ≤120 บรรทัดยืมตาม tier cap strategy
- **Build orchestration — wave policy ปรับแบบ mixed** — wave ≥2 task → `isolate:true` (separate worktree) · wave เดี่ยว → `isolate:false` shared tree + main loop **checkout build branch ก่อน** (กัน commit ตกลง main); `src/.warnyin/workflow/stages/build.md` §3 principle 3 ปรับใจความ + `build.md` command adapter step 6 ชี้ทุก mode
- **UX-detect exclusion precedence** — DESIGN wireframe auto-detect step 4.5 ข้อ 2 ปรับ signal hierarchy: docs-only/config-only/tooling change **จัดระดับเหนือ UI-surface signals** (จำหลัก "ถ้าไม่มี UI surface → ข้ามเงียบ"); `design.md` step 4.5 อัปเดต signal order ไม่ trigger wireframe
- **Validator fast-mode** — `validate-topic.mjs` ได้รู้จัก receipt-filled topic (stage=fast-track ไม่มี ✖ C1-C4) + mixed-state ⚠; output/status table show `fast-track` indicator; `next.md` suggest receipt-path + ตรวจ closure อยู่ receipt §4 ไม่ task folder

### Fixed
- **Prompt lean ใน BUILD/DESIGN/VERIFY/SHIP adapter** — `src/.claude/commands/warnyin/{build,design,verify,ship}.md` ลบ playbook full-text → เหลือ pointer ขั้นต่ำ (role card + 4 ไฟล์ task + techstack rule.md ของ component ที่แตะ) — token ประหยัด ≈20-30% ต่อ prompt ไม่ลด strategy (ทั้งหมดชี้ playbook กลาง); DESIGN adapter เพิ่ม fast-path pointer + receipt template

## [0.23.0] - 2026-07-06

### Added
- **learning-loop-tuning guidance ใน BUILD + VERIFY** (feature `learning-loop-tuning`) — เพิ่ม ★ loop tuning เมื่อ fix loop มี finding >1: **credit horizon** (สั้น = แก้ทีละ finding rerun ถี่ / ยาว = รวม failure วิเคราะห์ root cause ร่วมแล้วแก้เป็นชุด) + **experience batching** (group failure ตาม component/root-cause ตอน delegate fix) + **Loop-tuning report** (ระบุ choice + เหตุผล 1 บรรทัดก่อนแก้, เห็น ≥1 group boundary) — ปรับแค่ "ลำดับ/การจัดกลุ่ม" ของการแก้ ไม่ลด correctness/test-floor; `triage.md` เพิ่ม loop-tuning default-by-tier (ปรับได้ ไม่ lock); `design.md` เพิ่ม starting-artifact note. backward-compatible (guidance non-blocking)

### Fixed
- **กู้ payload feature `backlog` กลับเข้า repo (parity กับ npm)** — feature `backlog` เคย publish เป็น 0.22.0 จาก commit ที่**ไม่เคย push ขึ้น git** (`6634474d`) → payload ใน `src/` หลุดหายจาก history (main แตกจากฐาน 0.21.0 แล้วเริ่ม backlog ใหม่ที่ stage DESIGN). 0.23.0 **reconstruct payload จาก tarball 0.22.0** กลับเข้า `src/` (core `backlog.md` + template 2 ใบ + hook 8 ไฟล์: next/README/developer/discovery/ship) และ **3-way merge** (base = v0.21.0) hook ใน `stages/build.md` + `stages/verify.md` เข้ากับ learning-loop-tuning ให้ทั้งสอง feature อยู่ร่วมกัน. ยืนยัน: installer seed `docs/backlog.md` byte-equal กับ template + `npm pack` มี backlog 3 ไฟล์ + dev leak 0

## [0.22.0] - 2026-06-19

### Added
- **Feature backlog — ที่เก็บงาน deferred-out ตลอด workflow** (feature `backlog`) — capability ใหม่ `.warnyin/workflow/backlog.md` เป็น single source of truth (8 section: semantic / governance recommend-not-auto / schema 5-field / lifecycle / capture / consume / promote / archive≠current state); template 2 ใบ (`template/stages/[topic]/backlog.md` per-topic working + `template/docs/backlog.md` global seed); hook 5 stage + `developer.md` (conditional pointer + recommend token — enumerate 6 จุด); consume: `discovery.md §2 Input` + `§4 step 3 ground` เสนอ item เกี่ยวข้อง + `next.md` report "backlog: N รายการ"; SHIP promote (หลัง archive อ่าน achieved path → merge entry `open` เข้า global + dedup idempotent + กลั่น); installer seed `docs/backlog.md` byte-equal กับ template (ยืนยันด้วย test + sandbox); validate topic ไม่มี backlog → ✖0 (optional). backward-compatible 100% (ทุก hook conditional "ไม่มี → ข้าม"); payload `.md` ล้วน, ติดมากับ `--update` รอบถัดไป

> **หมายเหตุ history:** 0.22.0 publish จาก commit `6634474d` ที่ไม่เคย push ขึ้น GitHub — entry นี้ถูกเติมย้อนหลังใน 0.23.0 เพื่อให้ CHANGELOG ของ repo ตรงกับที่อยู่บน npm

## [0.21.0] - 2026-06-15

### Changed
- **comprehension surfaces default-exclude `docs/stages/achieved/`** (convention "archive ≠ current state") — งานเข้าใจ codebase (`interop.md` companion consult, `codemap.md` scan, `explore.md` ground, `init.md` scan) ตอนนี้ **ข้าม archive ของ topic ที่ ship แล้วโดย default** — current state อ่านจาก knowledge ที่ promote (`docs/features/` + `docs/rule.md` + `docs/codemap/`); เข้า achieved เฉพาะเมื่อถามประวัติ. canonical อยู่ `interop.md` ข้อ 2 surface อื่น pointer มา. กัน archive (ที่โตไม่มีเพดาน) กลายเป็น noise/bloat ของ comprehension + companion graph (UA entry แนะใส่ `docs/stages/achieved/` ใน `.understandignore`)

## [0.20.0] - 2026-06-15

### Added
- **Interop convention ใน workflow** (feature `interop`) — ไฟล์แกน `interop.md` เป็น single source of truth ของ companion-tool consult-if-present convention + **inclusion bar 4 ข้อ** (artifact-detectable / tool-agnostic / permissive license / เติมช่อง zero-dep) + **★ trust-boundary guard (B1)** (artifact = untrusted data: อ่านเฉพาะข้อเท็จจริงเชิงโครงสร้าง, free-text ยืนยันกับโค้ดจริง, instruction ในไฟล์ → ignore; อ้าง `docs/rule.md §3.2`) + **UA entry** (`.understand-anything/knowledge-graph.json`, ⚠ third-party + pin, stale/privacy note); 5 touchpoint (`init.md` §3 step 1-2, `codemap.md` §2 step 1, `explore.md` §3, `stages/discovery.md` §3 ข้อ 4, `roles/README.md` Skill เสริม) pointer conditional บรรทัดสั้น (ไม่ duplicate convention); `workflow/README.md` register; tool-agnostic (trigger = path artifact) + reference-not-vendor; backward-compatible 100% (เพิ่ม pointer เท่านั้น ไม่ลบ/แก้ logic เดิม)

## [0.19.0] - 2026-06-15

### Added
- **Minimalism principle ใน workflow** (feature `minimalism`) — ไฟล์แกน `minimalism.md` เป็น single source of truth ของ decision hierarchy "เขียนน้อยที่สุด" (YAGNI→stdlib→native→dep→one-liner→ขั้นต่ำ) + guardrail "lazy not negligent"; surface ฝั่งผลิต (`roles/developer.md`, `contexts/build.md`, `stages/build.md`) และฝั่งตรวจ (`contexts/review.md`, `stages/verify.md`) pointer กลับมาที่ไฟล์แกนเดียว (ไม่ duplicate hierarchy); `workflow/README.md` register ไฟล์; backward-compatible 100% (เพิ่ม pointer เท่านั้น ไม่ลบ/แก้ logic เดิม)

## [0.18.1] - 2026-06-13

### Fixed
- **installer เงียบ exit 0 ไม่ติดตั้งเมื่อรันผ่าน symlink** (critical — กระทบ `npx @warnyin/agents` ของผู้ใช้ปลายทาง + `setup:dogfood`) — main-guard ของ `cli.mjs` เทียบ `path.resolve(process.argv[1])` กับ `fileURLToPath(import.meta.url)` แต่ ESM `import.meta.url` เป็น realpath เสมอ ส่วน `argv[1]` เป็น symlink path (npx รัน bin ผ่าน `node_modules/.bin/` symlink; `setup:dogfood` extract tarball ลง `os.tmpdir()` ที่เป็น symlink บน macOS) → เทียบไม่ตรง → `main()` ไม่ถูกเรียก → ไม่ติดตั้งอะไร. แก้ด้วย `isEntrypoint()` ที่ realpath ทั้งสองฝั่ง (+ fallback `path.resolve`)
- **setup:dogfood ดึง payload เก่า + รายงานสำเร็จลวง (false-success)** — fix 3 ชั้น: `verifyInstalled` active เมื่อ stamp ขาด + version ≥ 0.17.0 (LR2), `installViaPack` เพิ่ม `prefer-online` สมมาตรกับ npx + `checkTarballVersion` เทียบ version ที่ source, `installViaNpx` ระบุ explicit bin `warnyin-agents`

## [0.18.0] - 2026-06-13

### Added
- **UX wireframe capability ใน DESIGN** (feature `uxui-wireframe`) — DESIGN auto-detect ว่า change มี UI surface ไหม → ถ้าใช่ generator agent `warnyin-ux` (read-only) วาด **ASCII low-fidelity wireframe** (user flow + screen + states) ให้ user **ยืนยันก่อนแตก task** (step 4.5 + approve gate + gate item conditional); ถ้าไม่มี UI surface → ข้ามเงียบ (backward compatible). เป็น stage-invoked capability **generator variant** (read-only generator + approve gate — ต่างจาก api-doc ที่เป็น doc-producer). template `wireframe.md` + role card `roles/ux.md` + 2 guard (prompt-injection/privacy).
- **skill เสริมประจำ role** (reference ไม่ vendor ใน `roles/README.md`) — UX: `ui-ux-pro-max` (Claude plugin, hi-fi design intelligence ต่อยอดจาก low-fi wireframe); QA: `@playwright/cli` (Microsoft official, FE e2e web test — ใช้คู่ VERIFY e2e smoke)

### Changed
- **`/warnyin:install-skill` รองรับหลาย install mechanism** — เดิม `npx skills add` แบบเดียว → generalize เป็น 4 แบบ (skills.sh · Claude plugin `/plugin marketplace` · repo-path · npm CLI `npm i -g` + post-install) โดยอ่าน install method จากคอลัมน์ "ที่มา" ของตาราง (ยังคง single-source ไม่ hardcode รายการ)

## [0.17.0] - 2026-06-12

### Added
- **installer version stamp** — installer เขียน `.warnyin/.warnyin-version` (= เวอร์ชันของ package ที่ติดตั้ง) ลง target ทุกครั้งที่ install/`--update` ทั้ง mode project + global → payload มี version identity ตรวจ drift ได้. ไฟล์ stamp: plain text บรรทัดเดียว = exact semver + trailing `\n` (เช่น `0.17.0\n`). เคารพ `--dry-run` (log แต่ไม่เขียนจริง).

### Fixed
- **`setup:dogfood` จับ version drift ได้ (false-green รอบ 2 / issue #3)** — แก้ root cause ที่ `verifyInstalled` ตรวจแค่ marker-existence (false-green เมื่อ npx cache ส่ง payload เก่า): (1) `resolveExpectedVersion()` query `npm view @warnyin/agents version` → pin exact version + `--prefer-online` (กัน stale npx cache); (2) `verifyInstalled(root, expected)` เทียบ `.warnyin/.warnyin-version` stamp กับ expected ตาม truth table (transition-safe: stamp ขาด → true, stamp ≠ expected → false, expected falsy → degrade); (3) normalize CRLF สองฝั่ง (กัน Windows false-drift). wire ทั้ง `installViaNpx` และ `installViaPack` ส่ง `expected` เข้า `verifyInstalled` (กัน drift ตายเงียบบน pack-path/Windows). _drift-guard active เต็มตัวตั้งแต่ release ถัดไป (transition window — รุ่นนี้คือ release แรกที่มี stamp writer)._

## [0.16.0] - 2026-06-12

### Added
- **Command `/warnyin:feedback:issue`** — เปิด GitHub issue ที่ `warnyin/warnyin-agents` เพื่อแจ้งปรับปรุง/ปัญหา/feature ใหม่ (gh + fallback URL)

### Fixed
- **`setup:dogfood` refresh root dogfood CORE ได้จริงทุก release** — แก้ 2 root cause: (1) เพิ่ม `--update` flag ใน `installViaNpx`/`installViaPack` → cli `copyTree({overwrite:true})` เขียนทับ CORE เดิม; (2) เปลี่ยน success-detection จาก "เชื่อ exit 0" เป็น `verifyInstalled(repoRoot)` — ตรวจ side-effect จริง (`.warnyin/workflow/stages/discovery.md` + `.claude/commands/warnyin`) กัน false-green (npx exit 0 โดยไม่ install จริง). เพิ่ม `export function verifyInstalled(root)` + main-guard (import ไม่ trigger install) + unit test 3 เคส พิสูจน์ false-green guard.
- **`build-wave.mjs` launch ผ่าน Workflow tool ได้** — ลบ top-level `export function normalizeTasks`/`buildOpts` (คง `export const meta`) ที่ทำให้ Workflow loader พังด้วย `SyntaxError: Unexpected keyword 'export'` (runtime wrap body เป็น async fn) → BUILD fan-out wave ทำงานผ่าน Workflow script ได้โดยไม่ต้อง fallback. **behavior identical** (function ใช้ภายใน script, unit test สกัดด้วย extraction ไม่ต้องแก้). ปิดบั๊กที่ documented ค้างไว้ (`installer/rule.md` §build orchestration · troubleshooting #16/#20).

### Changed
- **DESIGN stage — parallelize การสร้างเอกสาร (ลด wall-clock ไม่ลด correctness)** — เพิ่มหลักการแกน "Parallelize gathering, serialize judgment/narrative" ใน playbook `design.md` §3 + 3 จุด: (1) **parallel grounding** — fan-out อ่าน input หลายโดเมนขนาน (§4 step 2), (2) **task-file fan-out เป็น default สำหรับ standard/large** — หนึ่ง read-only agent ต่อหนึ่ง task ขนาน หลังผ่าน Gate §8 (§4 step 9; fast tier = 1 task เขียนเอง), (3) **design narrative = single-writer guardrail** — research เก็บ fact ขนานได้ แต่เขียน narrative โดย main loop คนเดียว (§4 step 5). ปรับ adapter `src/.claude/commands/warnyin/design.md` §5 สะท้อน fan-out default. **backward-compatible:** ทุกจุดมี fallback (เครื่องที่ fan-out ไม่ได้ทำตามลำดับเหมือนเดิม — tool-agnostic).

## [0.14.0] - 2026-06-11

### Added
- **DESIGN sizing gate — establish tier ก่อนจ่าย ceremony** (เสริม feature `change-sizing`) — เพิ่ม **step 1.5 "Establish tier"** ใน `src/.warnyin/workflow/stages/design.md §4` (ก่อน `business.md`/`proposal`): DESIGN **ประเมินขนาด change เบื้องต้นเอง** ตาม rubric (`triage.md` signals + hard-floor) → **มั่นใจ = กำหนด tier + บันทึก `proposal.md`**; **ไม่มั่นใจ/ก้ำกึ่ง = ถาม user เป็น options** (ประเมินด้วย `/warnyin:triage` ก่อน / user กำหนด tier เองถ้ารู้; ก้ำกึ่ง default = ปัดขึ้น `standard`); **hard-floor** (auth/migration/secret/public-API/security-sensitive) บังคับ ≥ standard เสมอ. อุดช่องว่างเดิมที่ `§7` **บริโภค** tier แต่ไม่มีตัวการันตีว่า established จริง (DESIGN เคยเดินโดยไม่รู้ขนาด). `§7` เพิ่มประโยคชี้ "tier ถูก established ที่ §4 step 1.5" (ไม่ inline rubric — ชี้ `triage.md`); ปรับช่อง `ขนาด` ใน proposal template `เล็ก/กลาง/ใหญ่` → `fast/standard/large` (vocab ตรง triage). tier = judgment (⚠ ไม่ใช่ validator). payload ติดมากับ `--update` รอบถัดไป

### Fixed
- **`docs/features/global-install/spec.md`** — เพิ่ม `WHEN` ที่ขาดใน scenario "--global + --project → error" (validate-topic C5)

## [0.13.0] - 2026-06-11

### Added
- **Global install mode — ติดตั้งครั้งเดียวใช้ได้ทุกโปรเจกต์ (opt-in)** (feature `global-install`) — `npx @warnyin/agents --global` ติดตั้ง adapter → `~/.claude/{commands/warnyin,agents,skills}` + playbook → `~/.warnyin/{workflow,template}` **ครั้งเดียว** → `/warnyin:*` ใช้ได้ทุกโปรเจกต์ (Claude Code โหลด user-level `~/.claude/`). **Hybrid:** workspace (`docs/`) ยัง per-project; โปรเจกต์ที่มี `./.warnyin/` local → ใช้ local ก่อน (override → คง reproducibility); **per-project ยังเป็น default**. **mode resolution** `resolveMode()` (pure-fn): flag `--global`/`--project`; ไม่ระบุ+TTY → prompt; **non-TTY → project (CI-safe ไม่ค้าง)**; `--global --project` → error. **ปลอดภัยต่อ homedir:** first-install `overwrite:false` (ไม่ทับไฟล์ user ใน `~/.claude/{agents,skills}`), `installGlobalNote()` เขียน `~/.claude/CLAUDE.md` แบบ **append-with-marker** (ไม่แตะ personal global memory), homedir guard (falsy/root → error), echo target paths. **resolve playbook local-first → global** ผ่าน convention canonical ใน `CLAUDE.md`/`AGENTS.md`/`CLAUDE.global.md` (ไม่ duplicate ลงทุก adapter). `/warnyin:init` รับ workspace bootstrap (scaffold + seed `docs/`, อ่าน template local→global). **backward compatible** (project mode = default ไม่เปลี่ยน; `--global` opt-in). **limitation:** Codex/Antigravity global root doc รอบนี้ยังไม่รองรับ (per-project ใช้ได้เต็ม). zero-dep + cross-platform (`os.homedir()`, HOME/USERPROFILE); payload ติดมากับ `--update` รอบถัดไป

## [0.12.0] - 2026-06-11

### Added
- **Change sizing — ประเมินขนาด change ก่อนจ่าย ceremony แล้วจ่ายให้พอดี** (feature `change-sizing`) — capability ใหม่ `/warnyin:triage` (read-only router) + playbook `src/.warnyin/workflow/triage.md`: รับคำอธิบาย change → จัดเป็น **3 tier `{fast, standard, large}`** ด้วย rubric (signals + tie-break ก้ำกึ่ง→standard + **hard-floor 5 หมวด** [auth/authz · data-migration/schema · secret/credential · public-API/contract(breaking) · security-sensitive] บังคับ ≥ standard เสมอ + escalation/downgrade symmetric) → **แนะนำ route แล้วหยุด** (ให้ user สั่ง command เอง — pattern เดียวกับ `next`; triage = request by size, next = topic by stage). **fast-track wiring ครบ 4 stage แบบ unify-in-place:** reframe `stages/design.md §7` (2-level → 3-tier ชี้ skip-list canonical, tier `large` บังคับ `/warnyin:discovery`) + pointer hook ใน `stages/verify.md` (verify-lite) + `stages/ship.md` (ship-lite) — **rubric canonical อยู่ที่ `triage.md` เดียว** ทุกที่ชี้ด้วย markdown-link/backtick runtime-ref ไม่ duplicate. **fast-track ลดเฉพาะ ceremony ไม่ลด correctness** (skip-list ต่อ stage แต่คง test-floor/archive); ต่อยอด `build-orchestration` (fast → model `cheap` + DAG width 1). adapter `src/.claude/commands/warnyin/triage.md` + register ใน slash-command list; tool-agnostic (playbook กลางทุก harness อ่านได้). payload ติดมากับ `--update` รอบถัดไป

## [0.11.0] - 2026-06-10

### Added
- **Build orchestration — BUILD เร็วขึ้นด้วย DAG กว้าง + model routing + lean verify** (feature `build-orchestration`) — แก้ root cause ที่ BUILD ช้า ("1 agent/wave, chain ยาว") โดยปรับ playbook 2 ชั้นแบบ **unify-in-place**: **(โครงสร้าง — DESIGN)** `src/.warnyin/workflow/stages/design.md` §3 เพิ่ม **DAG-width toolkit** (3 เทคนิคลด serialization: contract-first decouple / re-slice ต่างแกน / ยอม serialize เฉพาะ chain แท้ — toolkit optional คงนิยาม vertical slice เดิม) + **critical-path gate** (Gate §8 judgment: วัด critical-path depth + max wave width; chain เส้นตรงต้องมีเหตุผล explicit) + **task/context lean**; `roles/tech-lead.md` checklist + template `design.md` §7 (ช่อง depth/wave-width). **(กลไก — BUILD)** `src/.warnyin/workflow/scripts/build-wave.mjs` รับ `tasks: string[] | Array<{name, model?}>` — `model` per task แบบ **pass-through** เข้า `agent()` (ไม่ map/hardcode ชื่อรุ่น — payload generic); orchestrator `src/.claude/commands/warnyin/build.md` map tier→รุ่นจริง (Claude adapter); `stages/build.md` §3 ทำ **self-verify = scope component ตัวเอง** (integration เลื่อนไป full-gate ที่คง blocking). vocab tier generic `{cheap, balanced, deepest}` ใน `task.md` field `Model tier` (ไม่ระบุ = balanced; ไม่แตะ `balanced+` ของ review). **พิสูจน์เชิงประจักษ์:** งานอิสระ 4 task ขนาน 1 wave เทียบ chain 4 wave = **~3.95× เร็วขึ้น** (token เท่ากัน) + redesign DAG ของ scaffold-foundation chain depth 4 → wave width 2. **backward compatible** (`tasks: string[]` เดิม + ไม่ส่ง `model` → พฤติกรรมเดิม); payload ติดมากับ `--update` รอบถัดไป

## [0.10.0] - 2026-06-09

### Added
- **Adaptive API documentation (OpenAPI 3.1) ตลอด lifecycle** — capability กลางใหม่ `.warnyin/workflow/api-doc.md`: stage **auto-detect** ว่า topic แตะ backend/REST API ไหม (techstack/route/annotation/API task/endpoint change) ถ้าใช่ → ผลิต+ยืนยัน+ส่งมอบ **OpenAPI 3.1 contract** ให้อัตโนมัติ (ไม่ใช่ REST API → ข้ามเงียบ ไม่ยัดเยียด). เสียบ hook บางๆ เข้า 3 stage โดย **ไม่ duplicate logic**: **DESIGN** ผลิต `docs/stages/<slug>/openapi.yaml` (design-first/code-first/hybrid) + `spec.md` ของ API task ชี้มาที่ contract; **VERIFY** ยืนยัน implementation จริงตรง contract (regen+diff หรือยิง request จริง — mismatch = ไม่ผ่าน เข้า fix loop); **SHIP** promote/merge → `docs/techstack/<component>/openapi.yaml` (living API contract). เพิ่มเกณฑ์ Gate ทั้ง 3 stage (N/A ถ้าไม่ใช่ REST API). ยึดหลัก **reference ไม่ vendor**: ชี้ skill `openapi-spec-generation` (`wshobson/agents`) เป็น template library + เครื่องมือ (Spectral/Redocly/OpenAPI Generator) แบบติดตั้งเอง — เพิ่มแถว SA/Developer ใน `roles/README.md` §"Skill เสริม". tool-agnostic (Codex/Antigravity ใช้ playbook ชุดเดียวกัน); payload ติดมากับ `--update` รอบถัดไป

## [0.9.1] - 2026-06-08

### Fixed
- **BUILD worktree เห็น dependency ครบทุก wave (build-wave sync build branch)** — harness fork worktree จาก **main** (คุมไม่ได้) ทำให้ build sub-agent ไม่เห็น `docs/stages/<slug>/` (topic docs) + output ของ wave ก่อนหน้า แล้ว improvise (KB#14). แก้ที่ payload แบบ **unify-in-place**: `src/.warnyin/workflow/scripts/build-wave.mjs` รับ arg `baseRef?` (ชื่อ build branch) + แทรก prompt **step `0.`** ให้ agent `git merge <baseRef> --no-edit` เป็นงานแรกก่อนอ่าน task **เฉพาะ `isolate && baseRef`** (`!baseRef` → ไม่แทรก = backward compat ไม่ renumber step 1-9) — มี **abort-on-conflict** (`|| git merge --abort` กันค้าง MERGE state) + retry transient lock + **hard-stop** (merge สำเร็จแต่ `task.md` ไม่ปรากฏ → STOP failed ห้าม improvise) + บันทึกผล merge ใน `notes`; command `src/.claude/commands/warnyin/build.md` step 6 ส่ง `baseRef` + integrate ด้วย `git checkout <branch> -- <scoped src files>` (เลี่ยง topic-docs copy + ปลอด KB#11 tracked-deletion); playbook `src/.warnyin/workflow/stages/build.md` §3 principle 3 + §4 step 5 อธิบายกลไก. **backward compatible** (caller ไม่ส่ง `baseRef`/`isolate:false` → พฤติกรรมเดิม); payload ติดมากับ `--update` รอบถัดไป

## [0.9.0] - 2026-06-08

### Added
- **Structural validator + status script (`validate-topic.mjs`) wired เข้า workflow 3 จุด** — script เดียวใน payload (`src/.warnyin/workflow/scripts/validate-topic.mjs`, zero-dep ตาม pattern `lint-md.mjs`) 2 โหมด: **status** (ไม่ใส่ arg → ตารางทุก active topic, exit 0 เสมอ) · **validate** (`<slug>` → `✖`/`⚠` structural ละเอียด มี code C1–C5 กำกับ, exit 1 เมื่อมี ✖ · 0 เมื่อสะอาด/มีแค่ ⚠ · 2 slug ไม่ถูกต้อง/path traversal). wire เข้า playbook **3 จุดแบบ unify-in-place + node-guard ทุกจุด**: `next.md` (§2 step pre-scan โหมด status ก่อนอ่าน semantic — ตาราง heuristic เดิมคง fallback) · `stages/design.md` (§8 gate item "ทุก task มี 4 ไฟล์ครบ" → validate `<slug>` ควรไม่มี ✖, guidance ไม่ใช่ hard gate) · `stages/ship.md` (§4 step 1 → validate `<slug>` ก่อน promote, มี ✖ ควรแก้ก่อน) + command mirror `next/design/ship` (ชี้ playbook ไม่ duplicate รายการเช็ค). **structural เท่านั้น** — semantic ยังเป็นหน้าที่ model/ผู้ ship; **backward compatible** (เครื่องไม่มี node → playbook คง fallback เดิม); payload ติดมากับ `--update` รอบถัดไป
- **วงจร Feature spec delta ครบ 3 stage (DESIGN/VERIFY/SHIP)** — wiring discipline ของ behavior spec แบบ unify-in-place ลง playbook กลาง + template + command adapter: `src/.warnyin/workflow/stages/design.md` (§2 input อ่าน `docs/features/<name>/spec.md` · §4 step 5 + §5 + §8 gate ครอบ "Spec delta") · `verify.md` (feature spec = regression baseline — scenario เดิม = regression case, delta = test case ใหม่; §2/§3/§4/§6) · `ship.md` (§4 step 5.1 merge `spec.md` ตาม delta — ADDED ต่อท้าย/MODIFIED แทนที่/REMOVED ลบ + **read-modify-verify key ไม่เจอ → STOP** + rename `[เดิมชื่อ:]` + stale delta re-check; §3/§5/§6 gate) · template `stages/[topic]/design.md` (+section "9. Spec delta") + `ship.md` (+แถว `spec.md`) · `src/.warnyin/workflow/README.md` note `spec.md` (living behavior spec) · command mirror `design/verify/ship` (ชี้ playbook ไม่ duplicate logic). **backward compatible** (feature ไม่มี spec → วิธีเดิม; topic ไม่มี §9 delta → SHIP ทำแบบเดิม); payload `.md` ล้วน ติดมากับ `--update` รอบถัดไป

## [0.8.5] - 2026-06-07

### Added
- **Model-tier guidance ใน context profile** — `src/.warnyin/workflow/contexts/{research,build,review}.md` เพิ่มบรรทัด "Model tier" ใน section Tool preference (generic: `research`→`deepest reasoning` · `build`→`balanced`/fan-out worker เชิงกลไก→`cheap` · `review`→`balanced+`) + ตาราง legend ใน `contexts/README.md` — แนะนำ model tier ตาม posture เพื่อคุม token/cost; **tool-agnostic** ไม่ผูกชื่อรุ่น (harness map เอง) · global `docs/rule.md` §1 payload-guidance-generic — `.md` ล้วน, ติดมากับ `--update` รอบถัดไป
- **Worked-example pointer ใน README** — section "ตัวอย่างจริง (worked example)" ชี้ `docs/example-walkthrough.md` (เดิน topic จริง `cli-legacy-warning-fix` ครบ 5 stage บน repo) ให้ผู้ใช้ใหม่เห็น artifact จริง

## [0.8.4] - 2026-06-07

### Added
- **Utility skills (Claude adapter, auto-invocable)** — 3 safe utility skill ใหม่ `src/.claude/skills/{update-codemaps,explore,next}/SKILL.md` (`/update-codemaps`, `/explore`, `/next`): Claude project skill ที่ model **auto-invoke ได้เอง (description-driven)** body ชี้ playbook กลางเดิม (`.warnyin/workflow/{codemap,explore,next}.md`) ไม่ duplicate — auto-invoke เฉพาะ utility **read-only safe**; ผู้ใช้ปลายทางรับ skills อัตโนมัติตอน `npx @warnyin/agents` / `--update`. command `/warnyin:*` เดิม **ไม่เปลี่ยน** (non-breaking); build/ship คงเป็น command user-only (irreversible). global `docs/rule.md` §1 skill-adapter convention

### Changed
- **installer/packaging รองรับ skills** — `cli.mjs` CORE +`.claude/skills`; `package.json files` +`src/.claude/skills` (nested dotfolder ระบุชัด); `verify-pack` ALLOWED_PREFIX +`src/.claude/skills/` + R1 assert `hasSkills` (skills เป็น required payload กันหล่นเงียบ); test suite 18→19 (verify-pack 9→10)

## [0.8.3] - 2026-06-07

### Added
- **Learned-rule capture ใน SHIP** — `ship.md` playbook (§3 principle 7 ขยาย + §4 step 1/3/5 + §6 gate) + command + template `[topic]/ship.md` (section "Learned rules"): จับ rule ที่ได้จากการทำจริง (planned + emergent จาก build/verify/troubleshooting) ด้วย `rule + evidence(บังคับ) + scope` แล้ว user ยืนยัน per-rule ก่อน promote — unify กับกลไก "รอ SHIP" เดิม; global `docs/rule.md` §1 + continuous-learning discipline + unify-in-place — `.md` ล้วน, ติดมากับ `--update` รอบถัดไป

## [0.8.2] - 2026-06-07

### Added
- **Security checklist (agent-runtime + supply-chain)** — `roles/security.md` เพิ่ม section "Runtime / operational security" (secret isolation · no-egress · identity separation + Claude adapter note) + checklist item supply-chain/MCP (prompt-injection surface); `verify.md` §2 อ้าง runtime security ตอนรัน local env; `install-skill.md` step 4 เสริม warning prompt-injection; global `docs/rule.md` §3 ขยายเป็น Security baseline 2 มิติ (CI + agent-runtime) — `.md` ล้วน, ติดมากับ `--update` รอบถัดไป

## [0.8.1] - 2026-06-07

### Added
- **Defensive rules** ใน BUILD/VERIFY playbook (§3) + developer.md/qa.md checklist + global `docs/rule.md` §1 — เวอร์ชัน enforce ของ "ห้ามเดา": (1) **investigate-before-edit** ก่อนแก้ไฟล์ที่มีอยู่ต้องเข้าใจ (ใครใช้/contract/เจตนา), (2) **config-protection** ห้ามแก้ config/test "เพื่อให้ผ่าน" แทนแก้โค้ดจริง — `.md` ล้วน, ติดมากับ `--update` รอบถัดไป

## [0.8.0] - 2026-06-07

### Added
- **Context profiles** (`.warnyin/workflow/contexts/{research,build,review,README}.md`) — session-level posture 3 โหมด (สำรวจ/สร้าง/ตรวจ) คู่ขนานกับ role card (task-level lens); playbook แต่ละ stage มี callout ชี้ context ที่เข้าคู่ (Discovery→research · DESIGN→research+build · BUILD→build · VERIFY→review · SHIP→review) — `.md` ล้วน, ติดมากับ `--update` รอบถัดไป ไม่ต้องตั้งค่าเพิ่ม

### Fixed
- โครงสร้าง repo ใน `.warnyin/workflow/README.md` ให้ตรง layout จริงหลัง restructure 0.7.0 (`src/` layer + `.warnyin/`) — เดิมยังเป็น layout เก่า (`warnyin/`, `bin/cli.mjs`)

## [0.7.0] - 2026-06-07

### Added
- **Bootstrap / self-hosting (2-layer):** แยก source ของ warnyin ทั้งหมดเข้า `src/` (committed/publish layer); repo install release เสถียรไว้ root เป็น dogfood (`.warnyin/`/`.claude/`/`CLAUDE.md`/`AGENTS.md` — gitignored) เพื่อพัฒนา `src/` โดย workflow ที่ใช้ทำงานยังเสถียร
- `npm run setup:dogfood` — คืน dogfood env ที่ root จาก release (`npx @latest` + fallback `npm pack`→extract→node สำหรับ Windows), append pointer → `CONTRIBUTING.md` แบบ idempotent
- `npm run setup:sandbox` — install v-next จาก `src/` ลง temp dir (`os.tmpdir()`) เพื่อทดสอบ version skew โดยไม่แตะ dogfood ที่ root
- `CONTRIBUTING.md` — dev-instructions ของ repo (แยกจาก root `CLAUDE.md` เดิม)
- pass-count gate (`src/scripts/check-test-count.mjs`) — anti-false-green: fail ถ้า `fail≠0` / `pass<9` / `pass≠tests`
- Automated installer test suite (`node:test` black-box — spawn `src/bin/cli.mjs` จริงใน temp dir แล้ว assert side-effect) + unit test `checkFiles` รันด้วย `npm test`
- GitHub Actions CI (`.github/workflows/ci.yml`) — matrix node 20/22/24 + job `pack-verify`
- npm-pack verify (`src/scripts/verify-pack.mjs`) — testable `checkFiles(files)→errors[]`: allowlist granular + denylist (tooling/`docs/`/dogfood ที่ root) + tripwire (`settings.local.json`/`*.tgz`/`.env*`); assert `src/.warnyin/workflow/` + `src/.claude/commands/warnyin/` ติด tarball

### Changed
- **bin path** `bin/cli.mjs` → `src/bin/cli.mjs` (restructure source เข้า `src/`) — `pkgRoot` resolve เป็น `src/` อัตโนมัติ, payload คงเดิม
- `package.json files` เป็น allowlist granular — nested dotfolder ระบุชัด (`src/.warnyin`, `src/.claude/commands`, `src/.claude/agents`); ตัด `src/tests`/`src/scripts` (dev-only)
- test/scripts ย้ายไป `src/tests/` + `src/scripts/`; `npm test` = `node --test` bare (auto-discover, portable node 20/22/24)
- `engines.node` `>=18` → `>=20` (node 18 EOL)
- `.gitignore` เพิ่ม dogfood layer (root-anchored ทุกบรรทัด — กัน match `src/.claude`/`src/.warnyin`)

### Removed
- รองรับ node 18 (drop ตาม EOL)

[Unreleased]: https://github.com/warnyin/warnyin-agents/compare/v0.9.1...HEAD
[0.9.1]: https://github.com/warnyin/warnyin-agents/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/warnyin/warnyin-agents/compare/v0.8.5...v0.9.0
[0.8.5]: https://github.com/warnyin/warnyin-agents/compare/v0.8.4...v0.8.5
[0.8.4]: https://github.com/warnyin/warnyin-agents/compare/v0.8.3...v0.8.4
[0.8.3]: https://github.com/warnyin/warnyin-agents/compare/v0.8.2...v0.8.3
[0.8.2]: https://github.com/warnyin/warnyin-agents/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/warnyin/warnyin-agents/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/warnyin/warnyin-agents/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/warnyin/warnyin-agents/compare/v0.6.0...v0.7.0
