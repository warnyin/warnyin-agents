# Research — Project memory (เก็บ memory ของ agent ไว้ในไฟล์ของโปรเจกต์)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`
> ที่เก็บ "ข้อมูลที่ค้นมา + หลักฐาน" สนับสนุนการตัดสินใจใน `discovery.md`

| | |
|---|---|
| **Slug** | `project-memory` |
| **วันที่** | 2026-07-27 |
| **Mode** | `ละเอียด` (deep research + grill) |

---

## 1. คำถามวิจัย (research questions)

- [x] **RQ1:** วันนี้ warnyin เก็บ "ความรู้/ความจำ" ไว้ที่ไหนบ้าง และช่องว่างจริงอยู่ตรงไหน (code inspection)
- [x] **RQ2:** harness ที่รองรับ (Claude Code / Codex / Antigravity) เก็บ agent memory ไว้ที่ไหน — ใน repo หรือนอก repo
- [x] **RQ3:** prior art ของ "project-scoped memory file ที่ agent เขียนเอง" มีแบบไหนบ้าง โครงเป็นอย่างไร
- [x] **RQ4:** failure mode ที่รู้กันแล้วของ memory-file pattern คืออะไร (bloat / stale / cost / conflict)
- [x] **RQ5:** ข้อจำกัดเชิงปรัชญาของ repo นี้ที่ solution ต้องผ่าน (non-goal / rule กลาง)

## 2. วิธี & แหล่งข้อมูล

- [x] อ่านโค้ด/เอกสารในโปรเจกต์ (code inspection) — `docs/project.md`, `docs/rule.md`, `docs/roadmap.md`, `docs/codemap/index.md`, `src/.warnyin/workflow/stages/{ship,discovery}.md`, `src/bin/cli.mjs`
- [x] ค้นเว็บ / เอกสารภายนอก — Cline Memory Bank, Serena memories, Claude Code memory docs
- [x] prior art / วิธีที่ทีม/คนอื่นทำ + บทวิจารณ์ failure mode

---

## 3. Findings (ผลการค้นต่อคำถาม)

### RQ1: warnyin เก็บ "ความจำ" ไว้ที่ไหน + ช่องว่างจริง

- **พบว่า:** warnyin มี "ความจำถาวร" อยู่แล้วในรูป **เอกสาร committed** แต่ **ทางเข้ามีทางเดียวคือ SHIP** (promote ปลายทาง)
- **หลักฐาน:**
  - `src/.warnyin/workflow/stages/ship.md` §4 step 5 + §5 — ปลายทางถาวร 8 จุด: `docs/features/<f>/{feature,business,spec}.md`, `docs/techstack/<c>/{rule,standard,structure,test}.md`, `docs/rule.md`, `docs/troubleshooting.md`, `docs/backlog.md`, `docs/infra.md`, `docs/project.md`, `docs/codemap/`
  - `ship.md` §3 หลักการ 7 + §6 gate — learned-rule ต้องมี **evidence (บังคับ) + scope + user ยืนยัน** จึง promote ได้ (ไม่มี evidence = ไม่ promote)
  - `docs/roadmap.md` #8 — learned-rule = "instinct แบบ manual ~80% โดยไม่มี runtime observer"
  - `src/.warnyin/workflow/stages/discovery.md` §3.5.7 — **memory ระหว่างทางมีที่เดียว**: `docs/stages/<slug>/debate/{blue,red}-memory.md` และ **ผูกกับ mode `ไต่สวน` เท่านั้น** + archive หายไปพร้อม topic
  - `docs/stages/context.md` — **ไฟล์ว่าง** (ไม่มีเนื้อหา) ทั้งที่ `discovery.md §2` ข้อ 5 สั่งให้อ่านเป็น input → มีช่องที่ตั้งใจไว้แต่ไม่มีกลไกเติม
- **สรุป/นัยต่อการออกแบบ:** ช่องว่างไม่ใช่ "ไม่มีที่เก็บ" แต่คือ **ไม่มีที่เขียนระหว่างทาง (mid-flight) ที่อยู่ข้าม topic** — ความรู้ที่เกิดตอน BUILD/VERIFY ต้องรอ SHIP ถึงจะขึ้นถาวร; ถ้า topic ยังไม่ ship หรือถูก abandon ความรู้นั้นหายทั้งก้อน

### RQ2: harness เก็บ agent memory ไว้ที่ไหน — ใน repo หรือนอก repo

- **พบว่า:** Claude Code เก็บ memory ที่ agent เขียนเองไว้ **นอก repo** ที่ `~/.claude/projects/<project>/memory/` โดยมี `MEMORY.md` เป็น index ที่โหลดเข้า session (โหลดแค่ ~200 บรรทัดแรก) — แยกจาก `CLAUDE.md` ที่อยู่ใน repo และโหลดเต็มไฟล์
- **หลักฐาน:** [Claude Code docs — memory](https://code.claude.com/docs/en/memory) · [mem0 — How Memory Works in Claude Code](https://mem0.ai/blog/how-memory-works-in-claude-code) · [MEMORY.md for Claude Code projects](https://uxplanet.org/memory-md-for-claude-code-projects-93bc99e0551f)
- **หลักฐานในโปรเจกต์เอง:** session นี้เองมี memory dir อยู่ที่ `~/.claude/projects/C--Users-...-warnyin-agents/memory/` — **นอก git ของ repo นี้** → ทีมอื่น/เครื่องอื่น/harness อื่นมองไม่เห็น
- **สรุป/นัยต่อการออกแบบ:** ข้อสังเกตของผู้ใช้ถูกต้อง — memory ปัจจุบัน **per-user, per-machine, harness-specific**; ถ้าอยากให้เป็นความรู้ของ "โปรเจกต์" ต้องมีที่เก็บใน repo. แต่ **ห้าม design ผูกกับ memory tool ของ harness ใดตัวเดียว** (`docs/rule.md` §1 tool-agnostic — แก่นเป็น `.md` กลาง, ส่วนผูก tool เป็น adapter บาง)

### RQ3: prior art ของ project-scoped memory file

| ระบบ | ที่เก็บ | โครง | กลไกเขียน |
|---|---|---|---|
| **Cline Memory Bank** | `memory-bank/` ใน repo (committed) | 6 ไฟล์ลำดับชั้น: `projectbrief.md` (source of truth) → `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md` | บังคับ **อ่านทุกไฟล์ทุก task** ("not optional") + agent อัปเดตเมื่อจบงาน |
| **Serena** | `.serena/memories/` ใน repo | memory เป็นไฟล์ย่อยหลายใบ + `mem:core` เป็น reference model + `memory_maintenance` seed จาก template | onboarding เขียนครั้งแรก (core/tech_stack/suggested_commands/conventions/task_completion) + มี **maintenance convention** (add/update threshold, rename/delete/split) |
| **Claude Code memory** | `~/.claude/projects/<p>/memory/` **นอก repo** | `MEMORY.md` = index (โหลด 200 บรรทัดแรก) + ไฟล์ย่อย 1 ไฟล์ = 1 ข้อเท็จจริง | agent เขียนเองอัตโนมัติเมื่อเจอสิ่งที่ไม่มีใน `CLAUDE.md` |
| **warnyin (ปัจจุบัน)** | `docs/` ใน repo (committed) | features/rule/troubleshooting/codemap/backlog | **SHIP เท่านั้น** + evidence + user ยืนยัน |

- **หลักฐาน:** [Cline Memory Bank docs](https://docs.cline.bot/best-practices/memory-bank) · [cline/prompts .clinerules/memory-bank.md](https://github.com/cline/prompts/blob/main/.clinerules/memory-bank.md) · [Serena — Memories & Onboarding](https://oraios.github.io/serena/02-usage/045_memories.html)
- **สรุป/นัยต่อการออกแบบ:** ทั้ง 3 เจ้าใช้ **markdown หลายไฟล์เล็ก + index** ไม่ใช่ไฟล์เดียวโตไม่จำกัด; Serena เป็นตัวเดียวที่มี **maintenance convention เป็น artifact ในตัวเอง** (threshold + rename/delete/split) — สอดกับ failure mode ใน RQ4. warnyin มีของ 80% ของ Cline Memory Bank อยู่แล้ว (`project.md`≈projectbrief, `codemap/`≈systemPatterns, `techstack/`≈techContext, `rule.md`≈conventions) — **ขาดชิ้นเดียวคือ `activeContext`/`progress` (สถานะงานที่กำลังทำ) ซึ่งตรงกับ `docs/stages/context.md` ที่ยังว่าง**

### RQ4: failure mode ที่รู้กันแล้วของ memory-file pattern

- **พบว่า:** 4 โหมดพังหลัก — (1) **bloat จาก stale entry** ที่ไม่เคยถูกลบ กินโควตา context ทุก prompt, (2) **ข้อมูลขัดแย้งกันเอง** (ชอบ REST เดือน ม.ค. / GraphQL เดือน มี.ค.) → โมเดลต้องตัดสินเองตอน inference, (3) **ดึงเลือกไม่ได้ — ได้ทั้งก้อนหรือไม่ได้เลย** (ไฟล์ flat ไม่มี retrieval), (4) **ภาระ curation ตกที่คน** (ต้องมานั่งทำสวน markdown แทนเขียนฟีเจอร์)
- **หลักฐาน:** [The MEMORY.md Problem: Why Local Files Fail at Scale](https://dev.to/anajuliabit/the-memorymd-problem-why-local-files-fail-at-scale-58ae) · [mem0 — 2026 Token Optimization Playbook](https://mem0.ai/blog/the-2026-token-optimization-playbook-cut-ai-agent-memory-costs-3%E2%80%934x) · [Zylos — Agent Memory Compression & State Budget](https://zylos.ai/research/2026-06-30-agent-memory-compression-state-budget-management/)
- **สรุป/นัยต่อการออกแบบ:** ถ้าเพิ่ม memory ต้องมี **กลไก evict/cap/ทบทวน มาพร้อมกันตั้งแต่แรก** ไม่ใช่ทำทีหลัง; และ **ต้องตอบให้ได้ว่าใครลบ** — ไม่งั้นซ้ำรอย "ECC ที่จมกับ skill 251 ตัว" ที่ roadmap ยกเป็นบทเรียน. ข้อ (2) ขัดแย้งกันเอง = เหตุผลที่ SHIP บังคับ evidence + user ยืนยัน (กลไกกัน conflict ที่ warnyin มีอยู่แล้ว)

### RQ5: ข้อจำกัดเชิงปรัชญาที่ solution ต้องผ่าน

| ข้อจำกัด | ที่มา | ผลต่อ solution |
|---|---|---|
| **non-goal: runtime instinct observer** (hook + background agent + SQLite + CLI) | `docs/roadmap.md` §Non-goals | ห้ามทำ observer อัตโนมัติที่ต้องมี runtime — memory ต้องเป็น `.md` + วินัยใน playbook |
| **กระทัดรัด opinionated — ห้ามไหลเป็น catalog** | `docs/rule.md` §1, roadmap §หลักการ | ห้ามเพิ่มไฟล์/กลไกเยอะ; ถ้าขยายได้ในที่เดิม ต้องขยายในที่เดิม |
| **unify-in-place ไม่สร้างกลไกขนาน** | `docs/rule.md` §1 | ถ้าทับซ้อนกับ SHIP-promote/`docs/stages/context.md`/backlog → **ขยายของเดิม** ไม่สร้างระบบ memory คู่ขนาน |
| **tool-agnostic** | `docs/rule.md` §1 | ห้ามผูกกับ memory tool ของ harness ใดตัวเดียว; แก่นต้องอยู่ `.warnyin/workflow/` |
| **single source of truth / canonical-copy** | `docs/rule.md` §1 | memory ต้องไม่ duplicate สิ่งที่ `docs/rule.md`/`features/`/`codemap/` เก็บอยู่แล้ว |
| **security §3.2 + supply-chain** | `docs/rule.md` §3.2 | ไฟล์ที่ agent เขียนเอง + commit = surface ของ **secret leak** และเป็น **prompt-injection surface** (agent อ่านกลับทุก session) → ต้องมี guard เหมือน `interop.md` trust-boundary |
| **archive ≠ current state** | `docs/rule.md` §1 (interop #6) | memory ต้อง default-exclude `docs/stages/achieved/` และตัวมันเองต้องไม่กลายเป็น archive ที่โตไม่มีเพดาน |
| **zero-dependency** | `docs/rule.md` §2 | ถ้ามี tooling ต้องเป็น `node:*` script เขียนเอง (precedent: `validate-topic.mjs`, `lint-md.mjs`) |

---

## 4. Code inspection (สิ่งที่ตอบได้จากโค้ดเอง โดยไม่ต้องถาม user)

| ไฟล์ / ส่วนของโค้ด | สิ่งที่พบ | นัยต่องาน |
|---|---|---|
| `src/.warnyin/workflow/stages/ship.md` §4-§6 | promote ความรู้ 8 ปลายทาง + learned-rule (evidence บังคับ + user ยืนยัน per-rule) | ปลายทาง "ความจำถาวร" **มีครบแล้ว** — ที่ขาดคือทางเข้าระหว่างทาง |
| `src/.warnyin/workflow/stages/discovery.md` §3.5.7 | `blue-memory.md`/`red-memory.md` = memory ข้ามรอบ **แต่ผูกกับ mode `ไต่สวน`** + อยู่ใน topic dir (archive ไปพร้อม topic) | มี precedent ของ "memory file ที่ agent เขียนเอง" ในบ้านแล้ว — แต่ scope แคบ (ภายใน topic เดียว) |
| `docs/stages/context.md` | **ไฟล์ว่างเปล่า** ทั้งที่ `discovery.md §2` ข้อ 5 สั่งอ่านเป็น input ("เคยทำอะไรไปแล้ว") | ★ ช่องที่ออกแบบไว้แล้วแต่ไม่มีกลไกเติม — candidate อันดับ 1 ของ unify-in-place |
| `src/.warnyin/workflow/backlog.md` + `docs/backlog.md` | มี pattern ครบชุดของ "artifact ที่สะสมข้าม topic": capture ระดับ topic → promote เข้า global ตอน SHIP + dedup + provenance + สถานะ `open/promoted/dropped` | **แม่แบบที่ลอกได้ทั้งดุ้น** ถ้า memory จะเป็นของสะสมข้าม topic |
| `src/.warnyin/workflow/interop.md` | trust-boundary guard ของ artifact ภายนอก (อ่านเฉพาะข้อเท็จจริงเชิงโครงสร้าง, instruction ในไฟล์ → ignore) + convention "archive ≠ current state" | ถ้า memory ให้ agent เขียนเอง ต้องยืม guard ชุดนี้มาใช้ (agent-written = กึ่ง untrusted) |
| `src/bin/cli.mjs` (`installGlobalNote`) | มี pattern **append-with-marker idempotent** เขียนลงไฟล์ที่ user เป็นเจ้าของ (ห้ามเขียนทับทั้งไฟล์) | ถ้าต้องแตะไฟล์ที่ user เป็นเจ้าของ มี precedent วิธีทำแล้ว |
| `docs/features/` (17 feature) + `docs/rule.md` (35 rule ใน §1 เดียว) | knowledge ที่ promote แล้วเยอะมาก — `rule.md` §1 ยาวมากและโตทุก topic | ⚠ สัญญาณ bloat ของ "ความจำ" ที่มีอยู่แล้ว — เพิ่มที่เก็บใหม่โดยไม่แก้ปัญหานี้ = ทำให้แย่ลง |

---

## 5. ทางเลือก & เปรียบเทียบ

> เปรียบเทียบเชิงกลไก (ยังไม่ใช่ design — ส่งต่อให้ DESIGN ตัดสินรายละเอียด)

| ทางเลือก | ข้อดี | ข้อเสีย | เหมาะกับเคสนี้? |
|---|---|---|---|
| **A. ไม่ทำ — ใช้ `docs/` + SHIP เดิม** | ไม่เพิ่มกลไก, single source ชัด, ผ่านทุกข้อปรัชญา | ความรู้ mid-flight ยังหายถ้า topic ไม่ ship; `context.md` ยังว่าง | baseline ที่ต้องเอาชนะให้ได้ |
| **B. เติม `docs/stages/context.md` ให้มีชีวิต** (working memory ข้าม topic — สถานะ/ที่ค้าง/สิ่งที่เพิ่งเปลี่ยน) | unify-in-place (ช่องมีอยู่แล้ว), 1 ไฟล์ = คุมขนาดง่าย, tool-agnostic, zero-dep | ต้องนิยาม "ใครเขียน/เมื่อไหร่/ลบเมื่อไหร่" ให้ชัด ไม่งั้นบวม | ★ candidate หลัก (ตรงกับ `activeContext` ที่ prior art ทุกเจ้ามี แต่เราขาด) |
| **C. `.warnyin/memory/` ใหม่แบบ Serena** (หลายไฟล์ + index + maintenance convention) | ยืดหยุ่นสุด, ตรง prior art | สร้างกลไกขนานกับ `docs/` (ขัด unify-in-place), เสี่ยง catalog, ต้องมี evict/cap เต็มระบบ | ✗ ถ้าไม่มี demand ชัด — ราคาสูงเทียบปัญหา |
| **D. adapter ผูก memory tool ของ harness** (ให้ memory ของ harness ชี้เข้า repo) | ได้ auto-write ฟรีจาก harness | ผูก tool เดียว (ขัด tool-agnostic), ควบคุมเนื้อหา/ความปลอดภัยไม่ได้, harness อื่นไม่ได้ประโยชน์ | ✗ เป็นแกน; ✓ เป็น adapter บางเสริมทีหลังได้ |
| **E. mid-flight capture ต่อ topic** (`docs/stages/<slug>/memory.md` → promote ตอน SHIP แบบ backlog) | ลอก pattern backlog ที่พิสูจน์แล้ว, มี gate/dedup/provenance ครบ | เพิ่มไฟล์ต่อ topic (ceremony +1), ทับซ้อน `troubleshooting.md`/`rule.md` §2 ของ task ที่ทำหน้าที่นี้อยู่แล้ว | ⚠ ต้องพิสูจน์ว่าต่างจาก note "รอ SHIP" ที่มีอยู่จริง |

---

## 6. ความเสี่ยง / unknown ที่ยังเหลือ

- **U1 (ปิดแล้ว → D1):** ผู้ใช้หมายถึง memory แบบไหน — working state, project facts, หรือ preference ข้ามงาน
- **U2 (ปิดแล้ว → D2):** ผู้รับประโยชน์คือ repo นี้เอง หรือผู้ใช้ปลายทางที่ติดตั้ง warnyin (กระทบว่าโค้ดลง `src/` หรือแค่ `docs/`)
- **U3:** ถ้า memory เป็น committed file → conflict ตอนหลายคน/หลาย branch เขียนพร้อมกัน (โดยเฉพาะ BUILD ที่ fan-out หลาย worktree — `docs/rule.md` §1 build-orchestration เตือนเรื่อง topic-docs ที่ agent แก้ไม่ได้จาก worktree อยู่แล้ว)
- **U4:** เกณฑ์ตัดสิน "อะไรควรอยู่ memory vs ควรขึ้น `docs/rule.md` เลย" ถ้าคลุมเครือ → ของจะไปกองผิดที่
- **U5:** ไม่มีข้อมูล demand จากผู้ใช้ปลายทางจริง (เหมือนเคส selective-install ที่ roadmap #11 ตัดสิน DEFER เพราะ "ไม่มี demand")

---

## 7. ข้อสรุป → ส่งต่อ

- **คำแนะนำจาก research:**
  1. **ทำได้ และ "ทำอยู่แล้วบางส่วน"** — คำตอบตรงคำถามผู้ใช้คือ *ได้* แต่ warnyin เก็บความจำใน project file อยู่แล้ว (`docs/`) ผ่าน SHIP; สิ่งที่ขาดจริงคือ **working memory ระหว่างทางที่ข้าม topic**
  2. เริ่มจาก **ทางเลือก B (เติม `docs/stages/context.md` ให้มีชีวิต)** เพราะเป็น unify-in-place ของช่องที่ playbook อ้างถึงอยู่แล้วแต่ว่างเปล่า — ไม่สร้างกลไกขนาน
  3. **บังคับมีกลไกกันบวมตั้งแต่รอบแรก** (cap/evict/ทบทวน + "ของที่พิสูจน์แล้วต้องย้ายขึ้น `docs/` ไม่ค้างใน memory") — จาก failure mode RQ4 + สัญญาณ bloat ของ `docs/rule.md` §1 เอง
  4. **ห้ามผูก memory tool ของ harness เป็นแกน** — แก่นเป็น `.md` ใน `.warnyin/workflow/`, harness-specific เป็น adapter บางเสริมทีหลัง
- **การตัดสินใจที่ป้อนกลับเข้า `discovery.md`:** D1-D9 (ดู Decision Log)
