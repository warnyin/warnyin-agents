# Discovery — Project memory (เก็บ memory ของ agent ไว้ในไฟล์ของโปรเจกต์)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `project-memory` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-07-27 |
| **ผู้ร่วมตัดสินใจ** | rujiroj.ta |
| **Mode** | `ละเอียด` (auto-suggest → user ยืนยัน) — เดินครบทุกกิ่ง + grill 2 turn + role lens BA/PO + deep research |
| **เริ่มจาก** | `docs/project.md` §เป้าหมาย (ติดตั้งแล้วใช้ได้ครบ 5 stage โดยไม่ต้องตั้งค่าเพิ่ม) + §ข้อจำกัด (zero-dep, tool-agnostic) · `docs/rule.md` §1 (unify-in-place, single-source, tool-agnostic) · `docs/roadmap.md` §Non-goals |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)

> ทำ **project memory — ที่เก็บความจำระดับโปรเจกต์เป็นไฟล์ committed ใน repo** (2 ไฟล์: สถานะปัจจุบัน + บทเรียนสะสม) ให้ **agent ทุก harness ที่เดิน warnyin workflow** เพื่อแก้ปัญหา **ความจำของ agent วันนี้อยู่นอก repo (per-user/per-machine/per-harness) และความรู้ระหว่างทางผูกกับ topic — เปิด session ใหม่ต้องเล่าใหม่ และทีม/harness อื่นมองไม่เห็น**

## 2. Problem & Why now

- **ปัญหา / โอกาส:**
  1. **working memory ข้าม session หายไป** — เปิด session ใหม่ agent ไม่รู้ว่าเมื่อวานทำอะไรค้าง/เพิ่งตัดสินอะไรไป ต้องเล่าใหม่ทุกครั้ง
  2. **memory อยู่นอก repo** — ความจำที่ agent เขียนเองอยู่ในเครื่องตัวเอง (เช่น `~/.claude/projects/<p>/memory/`) → per-user, per-machine, per-harness; ทีม/เครื่องอื่น/AI เจ้าอื่นไม่เห็น และไม่ถูก commit
  3. **บทเรียนระหว่างทางผูกกับ topic** — `tasks/*/rule.md §2`, `troubleshooting.md`, `build.md`/`verify.md` เก็บบทเรียนได้ แต่ทั้งหมดอยู่ใต้ topic → ถูก archive ไปพร้อม topic (และ `docs/rule.md §1` interop #6 ระบุว่า **archive ≠ current state**); topic ที่ถูกทิ้งกลางทาง = ความรู้หายทั้งก้อน
  4. **★ ช่องที่ออกแบบไว้แต่ไม่มีใครเติม (falsifiable)** — `docs/stages/context.md` มี **4 จุดที่อ่าน แต่ 0 จุดที่เขียน**:
     - อ่าน: `workflow/explore.md:22` · `workflow/next.md:20` · `workflow/stages/discovery.md:28`
     - สร้างไฟล์เปล่า: `workflow/init.md:37` · `src/bin/cli.mjs:98` (`SCAFFOLD_FILES`)
     - → ไฟล์นี้ว่างเปล่าถาวรในทุกโปรเจกต์ที่ติดตั้ง warnyin ไม่ใช่แค่ repo นี้
- **ทำไมต้องทำตอนนี้:** repo ship มาแล้ว 36 topic และ `docs/rule.md §1` ยาวขึ้นทุกครั้ง — ต้นทุน "เล่าบริบทซ้ำ" กับความเสี่ยง context bloat โตพร้อมกัน; ยิ่งเลื่อน ของยิ่งกองผิดที่แล้วต้องย้อนไปแก้
- **ผูกกับเป้าหมายโปรเจกต์:** `docs/project.md` — "ติดตั้งลงโปรเจกต์ปลายทางแล้ว `/warnyin:*` ใช้ได้ครบ 5 stage โดยไม่ต้องตั้งค่าเพิ่ม"; memory ที่อยู่ใน repo = ส่วนหนึ่งของ ways-of-work ที่ติดไปกับ workflow ไม่ใช่ของที่ผู้ใช้ต้องตั้งเอง

## 3. Scope (กว้าง → แคบ)

**In scope (จะทำ)**
- **แก่น:** playbook กลาง `.warnyin/workflow/memory.md` — canonical single-source ของกลไก project memory (นิยาม/อะไรเข้า-ไม่เข้า/ใครเขียน/ทางออก) แนวเดียวกับ `backlog.md`, `minimalism.md`, `interop.md`
- **2 artifact (committed ทั้งคู่):**
  - `docs/stages/context.md` — **working state** (สรุป session ที่แล้ว, งานค้าง, ตัดสินอะไรไปที่ยังไม่เป็น artifact) · เขียนทับให้สั้นเสมอ · ไฟล์นี้**มีอยู่แล้ว** (unify-in-place — เติมชีวิตให้ช่องที่ 4 จุดอ่านอยู่แล้ว)
  - `docs/memory.md` — **บทเรียนสะสมระดับโปรเจกต์ ไม่ผูก topic** (gotcha/บทเรียนที่ยังพิสูจน์ไม่พอจะเป็น learned-rule หรือข้ามหลาย topic) · ลอก pattern ของ `docs/backlog.md` (entry + สถานะ + provenance + promote)
- **wiring:** จุดอ่าน (`discovery.md §2`, `next.md`, `explore.md`, `init.md`) + **จุดเขียน (ใหม่)** ในแต่ละ stage + ทางออกที่ SHIP
- **installer/packaging:** template 2 ไฟล์ + `SCAFFOLD_FILES`/`seedDocs` + `package.json files` + `verify-pack`
- **adapter บาง:** note ใน `CLAUDE.md` / `AGENTS.md` ให้ harness ที่มี memory tool ของตัวเองเขียนลงไฟล์ใน repo แทน (กันความจำ 2 แหล่ง)
- **command `/warnyin:memory`** (+ skill ถ้าเข้าเกณฑ์ read-only) — ให้ user สั่งดู/ทบทวน/บีบอัด memory เองได้
- **zero-dep script** (`node:*`) — เช็คสถานะ/ขนาด memory ต่อยอด precedent `validate-topic.mjs`

**Out of scope (จะไม่ทำในรอบนี้)**
- **runtime observer / hook / background agent / SQLite** — `docs/roadmap.md §Non-goals` ตัดไว้ (ยืนยันซ้ำรอบนี้)
- **preference ของ user/ทีม** — ไปอยู่ `CLAUDE.md`/`AGENTS.md` ตามเดิม (D3)
- **project facts (คำสั่งรัน/path/convention)** — มี `docs/codemap/` + `docs/techstack/` อยู่แล้ว (D3)
- **แก้ gate ของ SHIP** — learned-rule ยังต้อง evidence + user ยืนยันเหมือนเดิม (D7)
- **guardrail ของ auto-write** (cap ขนาด / scrub secret / approve ก่อนเขียน) — user ตัดออกโดยเจตนา (D5b) → บันทึกเป็นความเสี่ยงที่ยอมรับ R3/R1
- **retrieval engine / embedding / memory หลายไฟล์ย่อยแบบ Serena** — เกินความจำเป็นรอบแรก

## 4. Decision Log (เดินทีละกิ่งของ decision tree)

| # | คำถาม / ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| D1 | ปัญหาจริงที่อยากแก้คืออะไร | (a) working memory ข้าม session · (b) portability (อยู่ใน repo) · (c) ทั้งสอง · (d) ความรู้ระหว่างทางหาย | (a) | **(c) ทั้งสอง** | ต้องได้ทั้งความต่อเนื่องข้าม session และการที่ทีม/harness อื่นเห็นของชิ้นเดียวกัน — location เป็นเงื่อนไขของคุณค่า ไม่ใช่แค่รสนิยม |
| D2 | ของชิ้นนี้เป็นของใคร | (a) feature ของ warnyin (`src/`) · (b) dogfood-first · (c) เฉพาะ repo นี้ | (a) | **(a) feature ของ warnyin** | "memory อยู่นอก repo" เป็นปัญหาสากลของทุกโปรเจกต์ที่ติดตั้ง warnyin; repo นี้ dogfood เองจึงได้ทดลองจริงโดยไม่ต้องแยกเฟส |
| D3 | อะไรบ้างที่ควรอยู่ใน memory | (a) สรุป session/สถานะ · (b) บทเรียนก่อน SHIP · (c) preference · (d) project facts | (a)+(b) | **(a)+(b)** | (c) มีที่อยู่แล้วที่ `CLAUDE.md`/`AGENTS.md` · (d) ทับ `codemap/`+`techstack/` → ตัดออกเพื่อคง single-source |
| D3b | **[grill]** "บทเรียนก่อน SHIP" ต่างจาก 3 จุดเดิมตรงไหน (`tasks/*/rule.md §2`, `troubleshooting.md`, SHIP emergent scan) | (a) ต้องไม่ผูกกับ topic · (b) ปัญหาคือไม่มีใครอ่าน · (c) ทั้งสอง · (d) ของเดิมพอแล้ว | (a) | **(a) ต้องไม่ผูกกับ topic** | ของเดิมทั้ง 3 จุดอยู่ใต้ topic → archive ไปพร้อม topic (`docs/rule.md §1` archive ≠ current state); บทเรียนที่ยังพิสูจน์ไม่พอ/ข้ามหลาย topic ต้องอยู่ระดับโปรเจกต์ |
| D4 | เก็บที่ไหน | (a) 2 ไฟล์แยกตามอายุ · (b) 1 ไฟล์รวม · (c) `docs/memory/` โฟลเดอร์ · (d) `.warnyin/memory/` | (a) | **(a) 2 ไฟล์แยกตามอายุ** | สถานะ (เขียนทับ/หมดอายุเร็ว) กับบทเรียน (สะสม/ถูกดูดออก) มี lifecycle ต่างกัน — รวมไฟล์เดียวจะบวมทั้งคู่; (c)/(d) ขัด unify-in-place + เสี่ยง catalog |
| D5a | ใครเขียน + เมื่อไหร่ | (a) ผสมตามความเสี่ยง · (b) user สั่งเท่านั้น · (c) agent เขียนเองทั้งหมด · (d) ตอนจบ stage ทั้งหมด | (a) | **(c) agent เขียนเองทั้งหมด** | user ต้องการให้ memory เกิดเองโดยไม่มีภาระถาม/ยืนยันระหว่างทาง |
| D5b | **[grill]** auto-write มีรั้วไหม (cap ขนาด · scrub secret · approve ตอน promote) | (a) มีรั้ว 3 ชั้น · (b) ไม่มีรั้ว · (c) มีรั้วเฉพาะ memory.md | (a) | **(b) ไม่มีรั้ว** (user ยืนยันหลังรับทราบความเสี่ยง) | user รับความเสี่ยงเอง คุมด้วยการ review git diff; ⚠ สวน 3 precedent ในบ้าน (backlog/learned-rule/feedback = recommend-not-auto) → บันทึกเป็น R1/R3 ให้ DESIGN panel (`warnyin-security`) หยิบขึ้นมาตัดสินซ้ำได้ |
| D6 | committed หรือ gitignored | (a) committed ทั้งคู่ · (b) context ignored + memory committed · (c) ignored ทั้งคู่ | (a) | **(a) committed ทั้งคู่** | portability คือครึ่งหนึ่งของ D1 — gitignored = เท่ากับย้าย `~/.claude/` มาไว้ใน repo เฉยๆ ไม่แก้ปัญหา |
| D7 | ทางออก `memory.md` → `docs/rule.md` ใช้ gate ไหน | (a) คง gate เดิมของ SHIP · (b) agent promote เอง · (c) ไม่ promote เลย | (a) | **(a) คง gate เดิมของ SHIP** | ไม่แตะ `ship.md §3 ข้อ 7`/§6 ที่บังคับ evidence + user ยืนยัน → non-breaking กับทุกโปรเจกต์ที่ติดตั้งอยู่; memory เป็น "ห้องพักของ candidate" ไม่ใช่ทางลัดขึ้น rule |
| D8 | ผูกกับ memory tool ของ harness แค่ไหน | (a) แก่น `.md` + adapter บาง · (b) ไม่ผูกเลย · (c) ผูกเต็ม | (a) | **(a) แก่น `.md` + adapter บาง** | ตรง convention `docs/rule.md §1` (แก่นกลาง + adapter บาง); ถ้าไม่มี adapter harness จะเขียน memory ของตัวเองคู่ขนาน → ความจำ 2 แหล่งที่ไม่ตรงกัน |
| D9 | ขนาดของรอบแรก | (a) เอกสารล้วน · (b) + command · (c) + script · (d) เต็มชุด | (a) | **(d) เต็มชุด** (playbook + template + wiring + installer + adapter + command + script) | user ต้องการให้ใช้งานได้จริงครบตั้งแต่รอบแรก; ⚠ ขนาดนี้ = tier `standard`+ → DESIGN ต้องระวัง DAG-width และ `minimalism.md` (ทุกชิ้นต้องตอบได้ว่า "ต้องมีไหม") |

## 5. สมมติฐาน & ข้อจำกัด

- **สมมติฐาน:**
  - **A1** ผู้ใช้ปลายทางเจอปัญหาเดียวกัน — ยังไม่มี demand จากผู้ใช้จริงยืนยัน (เทียบ roadmap #11 selective-install ที่ DEFER เพราะ "ไม่มี demand"); รอบนี้ยอมรับเพราะ **มีหลักฐานเชิงโครงสร้างแทน** (4 จุดอ่าน/0 จุดเขียน = ช่องว่างในตัว payload เอง ไม่ใช่แค่ความรู้สึก)
  - **A2** agent (ทุก harness) เขียนไฟล์ `.md` ตามคำสั่งใน playbook ได้สม่ำเสมอพอ โดยไม่ต้องมี runtime enforcement
- **ข้อจำกัด:**
  - **C1 zero-dependency** — script ต้องเป็น `node:*` เขียนเอง (precedent `validate-topic.mjs`, `lint-md.mjs`)
  - **C2 tool-agnostic** — แก่นอยู่ `.warnyin/workflow/`; harness-specific เป็น adapter บาง
  - **C3 unify-in-place** — ห้ามสร้างระบบ memory ขนานกับ `docs/` + SHIP promote
  - **C4 กระทัดรัด opinionated** — ห้ามไหลเป็น catalog ของไฟล์ memory
  - **C5 security §3.2** — ไฟล์ที่ agent เขียนเอง + commit = surface ของ secret leak + prompt injection (agent อ่านกลับทุก session)
  - **C6 non-goal** — ห้ามมี runtime observer (hook/background/SQLite)
  - **C7 canonical-copy** — กติกาต้องนิยามที่ `memory.md` ที่เดียว; stage อื่นเป็น pointer ไม่ inline
  - **C8 stage-invoked capability convention** — ถ้า wiring เข้า stage ต้อง conditional/N-A (backward compatible กับ topic ที่ไม่เกี่ยว)

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)

- **S1 (falsifiable):** `docs/stages/context.md` มี **จุดเขียนใน playbook ≥1 จุด** (จากเดิม 0) — พิสูจน์ด้วย grep ใน `src/.warnyin/workflow/`
- **S2:** เปิด session ใหม่ในโปรเจกต์ที่ติดตั้ง warnyin → agent ตอบได้ว่า "งานล่าสุดค้างอะไร / เพิ่งตัดสินอะไรไป" จากการอ่าน 2 ไฟล์ **โดย user ไม่ต้องเล่าซ้ำ**
- **S3:** บทเรียนที่ยังพิสูจน์ไม่พอ **อยู่รอดหลัง topic ถูก archive** (มี entry ใน `docs/memory.md` ที่ไม่หายไปกับ `docs/stages/achieved/`)
- **S4 (regression):** `ship.md §3 ข้อ 7` + §6 gate **ไม่เปลี่ยน** — learned-rule ยังต้อง evidence + user ยืนยัน
- **S5:** `npx @warnyin/agents` ในโปรเจกต์ใหม่ได้ทั้ง 2 ไฟล์พร้อมโครงตั้งต้น (ไม่ใช่ไฟล์เปล่า) + `verify-pack` ยังเขียว
- **S6 (tool-agnostic):** Codex/Antigravity ที่ไม่มี memory tool ใช้กลไกนี้ได้ครบจาก playbook กลางอย่างเดียว
- **S7 (ไม่บวม):** ผ่านการใช้จริง ≥3 topic แล้ว 2 ไฟล์ยังอ่านจบในระดับที่โหลดเข้า session ได้โดยไม่กิน context เกินควร _(เกณฑ์เชิงปริมาณให้ DESIGN กำหนด)_

## 7. Feature ideas / ทางเลือกของวิธีแก้

> เปรียบเทียบเต็มอยู่ `research.md` §5 — เลือกทางเลือก **B (เติม `docs/stages/context.md` ให้มีชีวิต)** เป็นแกน แล้วต่อด้วยไฟล์สะสมระดับโปรเจกต์แบบ pattern `backlog.md`

- ไอเดียที่ส่งต่อให้ DESIGN พิจารณา:
  1. `memory.md` ยืมโครง entry ของ `backlog.md` (รายการ + ประเภท + สถานะ `open/promoted/dropped` + `มาจาก topic`) — ได้ dedup/provenance/idempotent ฟรี
  2. `context.md` เป็น **snapshot สั้น** (เขียนทับ) ไม่ใช่ log ต่อท้าย — กัน R1 โดยไม่ต้องมี cap
  3. ทางออกของ `memory.md` = fold เข้า SHIP step 1 (รวบ learned-rule candidate) ที่มีอยู่แล้ว — ไม่เพิ่ม step ใหม่
  4. adapter note ใน `CLAUDE.md`/`AGENTS.md` ใช้ pattern `installGlobalNote` (append-with-marker idempotent) ที่ `src/bin/cli.mjs` มีอยู่แล้ว

## 8. Open questions (ที่ยังค้าง — ไม่ block DESIGN)

- [ ] **U3 → ส่งต่อ DESIGN:** memory เป็น committed file → conflict ตอน BUILD fan-out หลาย worktree เขียนพร้อมกัน (`docs/rule.md §1` build-orchestration เตือนเรื่อง topic-docs ที่ agent แก้ไม่ได้จาก worktree อยู่แล้ว) — เป็นเรื่องกลไก แก้ที่ DESIGN ได้
- [ ] **U4 → ส่งต่อ DESIGN:** เกณฑ์คมๆ ของ "อะไรอยู่ `memory.md` vs ขึ้น `docs/rule.md` เลย" — ต้องเขียนเป็นกติกาใน `memory.md` (ไม่ใช่ปล่อยให้ agent เดา)
- [ ] **U6 → ส่งต่อ DESIGN:** เกณฑ์เชิงปริมาณของ S7 (ขนาด/จำนวน entry ที่ยังถือว่าไม่บวม) — user เลือกไม่มี hard cap (D5b) จึงเป็น guidance

## 9. ความเสี่ยงหลัก

- **R1 (สูง · ยอมรับแล้วโดย D5b) — bloat/stale:** ไม่มี cap/evict → memory กลายเป็นสุสานบริบทเก่าที่กินโควตา context ทุก session (`research.md` RQ4: stale entry = ต้นเหตุ bloat อันดับ 1); ทางบรรเทาที่ยังทำได้โดยไม่ผิด D5b = ออกแบบ `context.md` เป็น snapshot เขียนทับ + `memory.md` มี "ทางออก" ที่ SHIP ใช้จริง
- **R2 (สูง) — ทับซ้อน/กองผิดที่:** ถ้าเกณฑ์ U4 ไม่คม จะเกิด 2 แหล่งความจริงกับ `docs/rule.md`/`codemap/` (ขัด single-source) และความรู้จะค้างไม่ถูก promote
- **R3 (กลาง-สูง · ยอมรับแล้วโดย D5b) — security:** auto-write + committed โดยไม่มี scrub → secret/internal path อาจขึ้น repo; และไฟล์ที่ agent อ่านกลับทุก session = prompt-injection surface (`docs/rule.md §3.2`, เทียบ trust-boundary guard ของ `interop.md`)
- **R4 (กลาง) — ceremony creep:** D9 เต็มชุด (playbook + command + script + adapter) เพิ่ม surface หลายจุดในรอบเดียว — เสี่ยงขัด "กระทัดรัด opinionated" ถ้าบางชิ้นไม่มีคนใช้จริง; DESIGN ต้องให้แต่ละชิ้นผ่าน `minimalism.md` ขั้น 1 ("ต้องมีไหม")
- **R5 (ต่ำ-กลาง) — ไม่มี demand จากผู้ใช้ปลายทางจริง** (A1) — บรรเทาด้วยหลักฐานเชิงโครงสร้าง 4-อ่าน/0-เขียน
- **R6 (กลาง) — worktree conflict** (U3) — BUILD fan-out หลาย agent เขียน memory พร้อมกัน

## 10. ลิงก์ที่เกี่ยวข้อง

- Research: `./research.md`
- เอกสารโปรเจกต์: `docs/project.md`, `docs/rule.md` §1/§2/§3.2, `docs/roadmap.md` §8/§Non-goals, `docs/codemap/index.md`
- Playbook ที่เกี่ยวข้อง: `src/.warnyin/workflow/stages/ship.md` §3-§6 · `stages/discovery.md` §2/§3.5.7 · `workflow/backlog.md` · `workflow/interop.md` · `workflow/minimalism.md`
- ไฟล์ที่ตรวจแล้ว: `docs/stages/context.md` (ว่างเปล่า) · `src/bin/cli.mjs:98` (`SCAFFOLD_FILES`), `:337` (`installGlobalNote` append-with-marker) · `src/.warnyin/template/docs/` (มี `backlog.md` เป็นแม่แบบ)

---

## ✅ Gate → DESIGN (ดู `.warnyin/workflow/stages/discovery.md` ข้อ 6)
- [x] Problem / why-now ชัด ผูกกับ project.md
- [x] Scope in/out ชัด
- [x] Decision log ปิดทุกประเด็นสำคัญ ไม่มี open question ที่ block (U3/U4/U6 เป็นเรื่องกลไก → ส่งต่อ DESIGN)
- [x] success criteria วัดผลได้ (S1-S7)
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ (A1-A2 · C1-C8 · R1-R6)
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (2026-07-27)
