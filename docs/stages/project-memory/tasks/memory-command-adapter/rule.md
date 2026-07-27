# Rule — memory-command-adapter

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> rule ที่ task นี้ต้อง **focus/follow** + rule ใหม่ที่อยากเสนอเพิ่ม

## 1. Rule ที่ต้อง follow (จาก techstack)

> ดึงจาก `docs/rule.md` และ `docs/techstack/installer/{rule,standard}.md` — เฉพาะข้อที่เกี่ยวกับ task นี้

- [ ] **★ registry-target ของ root dogfood file = installer template ไม่ใช่ root** — `CLAUDE.md`/`AGENTS.md` ที่ root เป็น dogfood install **gitignored (not tracked)**; canonical ที่ ship จริงอยู่ `src/.warnyin/installer/templates/CLAUDE.md` และ `src/AGENTS.md` — ก่อนแก้ registry/slash-command list **เช็ค `git check-ignore <file>` เสมอ** (`docs/techstack/installer/rule.md` §packaging · `docs/rule.md §6` · `docs/troubleshooting.md` #18/#22 · TS-1 ของ topic `feedback-issue-command`)
- [ ] **★ skill-adapter convention — stateful ต้องเป็น command ไม่ใช่ skill** (`docs/rule.md §1`) — โหมดทบทวนของ `/warnyin:memory` **เขียนไฟล์ได้** → irreversible/stateful → **user-invoked เท่านั้น**; auto-invocable skill สงวนไว้ให้ utility **read-only safe** เท่านั้น (explore/next/update-codemaps) — **ห้ามสร้าง `src/.claude/skills/memory/`**
- [ ] **★ action-utility = confirm ก่อน side-effect** (`docs/rule.md §1`, evidence: topic `feedback-issue-command`) — utility ที่มี side-effect ต้อง **preview + confirm ก่อน execute ไม่ยิงอัตโนมัติ**; ที่นี่ side-effect = แก้ไฟล์ memory → **เสนอ → รอ user ยืนยัน → ค่อยเขียน; ห้ามลบเงียบ**
- [ ] **adapter บาง ชี้ playbook กลาง ไม่ duplicate** (`docs/rule.md §1` tool-agnostic) — command เก็บแค่ orchestration (อ่าน playbook ไหน / โหมดอะไร / ลำดับ) — **กติกาของ memory (schema, เกณฑ์, lifecycle, promote) อยู่ `.warnyin/workflow/memory.md` ที่เดียว**
- [ ] **canonical-copy** (`docs/rule.md §1` + `contract-as-copy-source` §2) — **C6/C7 copy คำต่อคำจาก `design.md §4`** ไม่ย่อ ไม่เกลา ไม่แปลง backtick/emphasis/วงเล็บ — T6 assert แบบ string-equality (precedent `src/tests/fastlane.test.mjs` D1-D3)
- [ ] **แก้เฉพาะใต้ `src/`** — mirror layout `src/` = target path (installer copy `src/<rel> → target/<rel>` ไม่มี mapping) → ไฟล์ command ใหม่ไปโผล่ที่ `.claude/commands/warnyin/` ของ target เอง
- [ ] **`package.json files` เป็น allowlist / packaging ไม่ต้องแก้** — `src/.claude/commands/` อยู่ใน allowlist + `verify-pack` prefix ครอบแล้ว; CodeBuddy commands copy จาก shared source เดียวกัน → **ห้ามแตะ `package.json` / `verify-pack.mjs` / `cli.mjs`**
- [ ] **ห้ามแตะ marker ของ root doc** — `CLAUDE.md` ต้องคง marker `warnyin/workflow/stages/`, `CLAUDE.global.md` ต้องคง `<!-- warnyin:global-note -->` (บรรทัดแรก) — เป็น idempotent guard ของ installer (`docs/techstack/installer/rule.md` §resolution convention)
- [ ] **markdown-link ต้อง resolve ได้ (lint-md gate)** — `lint-md.mjs` มี `SCAN_ROOTS=['src','docs']` → ไฟล์ทั้ง 5 ถูกสแกน; ไฟล์ปลายทางของ task อื่น (`workflow/memory.md`, `scripts/memory-status.mjs`) **ยังไม่มีตอน build task นี้** → **อ้างเป็น inline-code (backtick) เท่านั้น ห้าม markdown-link** (`CODE_RE` strip inline-code ก่อนเช็ค → ปลอดภัย 100%)
- [ ] **anchor-immutability** (`docs/rule.md §2`) — ห้ามเปลี่ยน/ลบ heading เดิมของ 4 ไฟล์ที่แก้; เพิ่ม heading ใหม่ได้เฉพาะ `## Project memory`
- [ ] **investigate-before-edit** — เลขบรรทัดใน `task.md §4` เป็นจุดอ้างอิง ณ วันเขียน; ไม่ตรง → ค้นจากข้อความเดิมก่อนแก้
- [ ] **ห้ามลด bar ของ gate (config-protection)** — ห้ามแก้ `lint-md.mjs` / `check-test-count.mjs` / MIN_PASS เพื่อให้เขียว
- [ ] **BUILD ห้ามแตะ rule/standard/docs กลาง** — `docs/rule.md`, `docs/features/**`, `docs/techstack/**` ห้ามแก้ใน stage นี้ (note ไว้ §2 รอ SHIP)
- [ ] **ภาษาไทย + tool-agnostic** — เนื้อ playbook-facing อ้าง path กลาง (`.warnyin/workflow/...`) และ command กลาง (`/warnyin:*`); ไม่ผูกชื่อรุ่น/ผลิตภัณฑ์ของ harness ใด (`docs/rule.md §1` payload-guidance ต้อง generic)

## 2. เสนอเพิ่ม rule ใหม่ (⏳ รอ SHIP ค่อยอัปเดต rule กลาง)

> ห้ามแก้ `docs/rule.md` / `docs/techstack/*/rule.md` / `docs/features/**` ตอนนี้ — แค่ note ไว้ก่อน ถึง SHIP ค่อยพิจารณาย้ายขึ้นไป

- [ ] rule ที่เสนอ: **root-doc note = จุดกระจายกฎที่ถึง sub-agent ได้จริง** — กติกาที่ต้องถึง **agent ที่ถูก fan-out** (เช่น "worktree agent ห้ามเขียน memory") ต้องอยู่ใน **root doc (auto-load ทุก agent)** ไม่ใช่แค่ capability playbook — เหตุผล: `build-wave.mjs` prompt สั่ง sub-agent อ่านแค่ role card + 4 ไฟล์ task + techstack rule → playbook กลางไปไม่ถึง (evidence: design panel Sec-B3 → C6 ทวนข้อยกเว้น worktree โดยเจตนา)
- [ ] rule ที่เสนอ: **registry-surface ต้องระบุต่อไฟล์ ไม่เหมา "root doc ทุกใบ"** — `src/AGENTS.md` **ไม่มี** slash-command list ส่วน `CLAUDE.md`/`codebuddy-rules.md` มี → contract ต้องบอกชัดว่าไฟล์ไหนรับ registry line ไฟล์ไหนรับแค่ note — เหตุผล: กันเพิ่ม registry ที่ 3 ที่ไม่มีใครดูแล/หลุด sync (evidence: design panel TL-B2/Infra-B3)
- [ ] rule ที่เสนอ: **contract string ที่ถูก assert คำต่อคำ ชนะ pattern ประจำไฟล์** — เมื่อ contract (`design.md §4`) กำหนดบรรทัดที่ต้อง copy ลงหลายไฟล์ ให้ copy เหมือนกันทุกไฟล์ **แม้ไฟล์นั้นมี pattern ของตัวเอง** (เช่น `codebuddy-rules.md` ปกติตัด path ในวงเล็บออก) — เหตุผล: "จัดให้เข้า pattern" = paraphrase → test string-equality แดง และเกิด wording drift 2 ที่
