# Proposal — Project memory (ความจำระดับโปรเจกต์เป็นไฟล์ใน repo)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `project-memory` |
| **ประเภท** | `feature` |
| **ขนาด** | `large` (cross-cutting หลาย component: workflow playbook · template · installer · adapter docs · command · script — Discovery บังคับก่อน ✅ ทำแล้ว) |
| **วันที่** | 2026-07-27 |
| **มาจาก Discovery?** | `./discovery.md` (mode `ละเอียด`, decision D1-D9 ปิดครบ) |

## 1. สรุป change (what)

เพิ่ม **project memory** — ความจำระดับโปรเจกต์ที่เก็บเป็นไฟล์ committed 2 ใบ พร้อมกลไกอ่าน/เขียน/ทางออกใน playbook กลาง:

| ไฟล์ | เก็บอะไร | อายุ |
|---|---|---|
| `docs/stages/context.md` *(มีอยู่แล้ว — เติมชีวิตให้)* | **working state** — งานที่ค้าง, สิ่งที่เพิ่งตัดสิน, บริบทที่ยังไม่เป็น artifact | เขียนทับให้สั้นเสมอ (snapshot) |
| `docs/memory.md` *(ใหม่)* | **บทเรียนสะสมระดับโปรเจกต์ที่ไม่ผูก topic** — gotcha/บทเรียนที่ยังพิสูจน์ไม่พอจะเป็น learned-rule | สะสม → ถูกดูดออกตอน SHIP |

พร้อม: playbook กลาง `memory.md` (canonical) · wiring เข้า 5 stage + `next`/`explore`/`init` · installer seed · adapter note ให้ harness ที่มี memory ของตัวเอง · command `/warnyin:memory` · script `memory-status.mjs`

## 2. ทำไม (why)

- **ปัญหา/โอกาส:**
  1. ความจำที่ agent เขียนเองวันนี้อยู่ **นอก repo** (per-user/per-machine/per-harness) → ทีม/เครื่องอื่น/AI เจ้าอื่นไม่เห็น
  2. ความรู้ระหว่างทาง **ผูกกับ topic** → ถูก archive ไปพร้อม topic (`docs/rule.md §1`: archive ≠ current state); topic ที่ถูกทิ้ง = ความรู้หายทั้งก้อน
  3. **★ หลักฐานเชิงโครงสร้าง:** `docs/stages/context.md` มี **4 จุดอ่าน / 0 จุดเขียน** — `workflow/explore.md:22`, `workflow/next.md:20`, `workflow/stages/discovery.md:28` สั่งอ่าน; `workflow/init.md:37` + `src/bin/cli.mjs:98` สร้างไฟล์เปล่า → ไฟล์ว่างถาวรในทุกโปรเจกต์ที่ติดตั้ง
- **ผลถ้าไม่ทำ:** ผู้ใช้ยังต้องเล่าบริบทซ้ำทุก session; workflow ยังอ้างถึงไฟล์ที่ไม่มีวันมีเนื้อหา (สัญญาที่ผิดในตัว payload เอง); บทเรียนที่ยังไม่ถึงระดับ rule ยังหายเรื่อยๆ

## 3. ทางเลือกที่พิจารณา

| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A (แนะนำ) — เติม `context.md` ให้มีชีวิต + เพิ่ม `docs/memory.md` แบบ pattern `backlog.md`** | unify-in-place ของช่องที่มีอยู่แล้ว · ลอกกลไกที่พิสูจน์แล้ว (capture→promote→global) · 2 ไฟล์คุมขนาดง่าย · tool-agnostic · zero-dep | ต้องนิยาม governance ให้คมพอ ไม่งั้นของกองผิดที่ | ✅ |
| B — ไม่ทำ ใช้ `docs/` + SHIP เดิม | ไม่เพิ่ม surface | ไม่แก้ปัญหาทั้ง 3 ข้อ; `context.md` ยังว่างถาวร | |
| C — `docs/memory/` โฟลเดอร์ (index + ไฟล์ย่อย แบบ Serena/Claude memory) | ยืดหยุ่น, ตรง prior art | สร้างกลไกขนานกับ `docs/` (ขัด unify-in-place) · เสี่ยงกลายเป็น catalog (ขัด "กระทัดรัด opinionated") · ต้องมี evict เต็มระบบ | |
| D — ผูก memory tool ของ harness เต็มรูปแบบ | ได้ auto-write ฟรี | ผูก tool เดียว (ขัด tool-agnostic §1) · Codex/Antigravity ไม่ได้ประโยชน์ | (หยิบมาแค่ **adapter note บาง** — ดู in scope) |
| E — capture ต่อ topic (`docs/stages/<slug>/memory.md`) | ลอก backlog ตรงๆ | **ผูก topic** = ไม่แก้ปัญหาข้อ 2 (Discovery D3b ตัดทิ้งแล้ว) · ทับซ้อน `tasks/*/rule.md §2` ที่ทำหน้าที่นี้อยู่ | |

- **เหตุผลที่เลือก A:** เป็นทางเดียวที่ปิดปัญหาทั้ง 3 ข้อพร้อมกันโดย **ไม่สร้างกลไกขนาน** — `context.md` มีอยู่แล้วและถูกอ้าง 4 จุด (แค่ไม่มีคนเขียน), ส่วน `docs/memory.md` ลอกสถาปัตยกรรมที่ repo พิสูจน์แล้วกับ `backlog.md`/`troubleshooting` (per-scope → promote → global) จึงไม่ต้องประดิษฐ์ governance ใหม่

## 4. Scope

**In scope**
1. **playbook กลาง** `src/.warnyin/workflow/memory.md` — canonical single-source (semantic / schema / governance / write point / promote / archive-boundary)
2. **template 2 ใบ** — `template/docs/memory.md`, `template/docs/stages/context.md`
3. **wiring:** จุดเขียนท้าย 5 stage **+ `fastlane.md`** (executor ของ fast tier ที่ข้าม stage playbook) + จุดอ่าน (`discovery.md §2`, `next.md`, `explore.md` — **ขยายบรรทัดเดิม ไม่เพิ่มข้อใหม่**) + ทางออกที่ `ship.md`
4. **installer:** ย้าย `docs/stages/context.md` จาก `SCAFFOLD_FILES` (ไฟล์เปล่า) → seed จาก template (มีโครง) + `init.md` step 0 + test
5. **adapter (บาง):** note ใน `installer/templates/CLAUDE.md`, `installer/templates/CLAUDE.global.md`, `src/AGENTS.md` — บอก harness ที่มี memory store ของตัวเองให้เขียนลงไฟล์ใน repo (กันความจำ 2 แหล่ง) + registry line ใน `installer/templates/CLAUDE.md` **และ `codebuddy-rules.md`** (registry คู่จริง — `src/AGENTS.md` ไม่มี slash-command list)
6. **command** `/warnyin:memory` — ไม่มี arg = แสดง memory + สุขภาพ (read-only); มี arg = ทบทวน/บีบอัด **โดยเสนอก่อนแล้วรอ user ยืนยัน ไม่ลบเงียบ** (stateful → เป็น command ไม่ใช่ skill ตาม `docs/rule.md §1` skill-adapter convention)
7. **script** `src/.warnyin/workflow/scripts/memory-status.mjs` — zero-dep read-only รายงานจำนวน entry/ขนาด/entry ที่ค้างนาน (exit 0 เสมอ ไม่ block) + hook ใน `next.md`
8. **คำเตือนเนื้อหาต้องห้าม** ในหัว template ทั้ง 2 ใบ + `memory.md §2` — ข้อความเตือนเฉยๆ (ไม่มีกลไกดัก ไม่ block การเขียน) ว่าไฟล์ถูก commit จึงห้ามใส่ raw secret/absolute path/PII และให้อ้าง path เป็น inline-code
9. **release hygiene + invariant lock:** `src/tests/memory.test.mjs` (structural ข้าม slice) + assert template ติด tarball ใน `verify-pack` + CHANGELOG + full gate (`npm test`, `lint:md`, `verify:pack`, `setup:sandbox`)

**Out of scope**
- **runtime observer / hook / background agent / SQLite** — `docs/roadmap.md §Non-goals`
- **preference ของ user/ทีม** → `CLAUDE.md`/`AGENTS.md` (Discovery D3)
- **project facts (คำสั่ง/path/convention)** → `docs/codemap/`, `docs/techstack/` (Discovery D3)
- **แก้ gate ของ SHIP** — learned-rule ยังต้อง evidence + user ยืนยัน (Discovery D7)
- **guardrail เชิงกลไกของ auto-write** (cap ขนาด / scrub อัตโนมัติ / approve ก่อนเขียน) — user ตัดออกโดยเจตนา (Discovery D5b); รอบนี้มีเพียง **ข้อความเตือน** (in-scope ข้อ 8) และ **เกณฑ์รายงาน** ที่ `memory-status` พิมพ์ ⚠ โดยไม่ block
- **ขยาย `allowed-tools` ของ `next` skill** — ยอมรับ degrade (skill เรียก node ไม่ได้ → ข้ามรายงานสุขภาพ) เหมือนสภาพเดิมของ `validate-topic.mjs`
- **skill auto-invocable** — เป็น command เพราะเขียนไฟล์ (stateful)
- **retrieval engine / embedding / memory หลายไฟล์ย่อย**
- **กระจาย adapter note ลง IDE adapter ทั้ง 9 ไฟล์** — `installer/rule.md` "resolution convention อยู่ root doc ไม่ใช่ทุก adapter"

> **deferred-out ที่เสนอเก็บเข้า `backlog.md` ของ topic** (user ยืนยันก่อนเขียน — ยังไม่ได้ยืนยันในรอบ Discovery): รั้วของ auto-write (`รอเงื่อนไข` — เปิดเมื่อเจอ leak/bloat จริง) · preference memory (`ทำทีหลัง`) · memory หลายไฟล์ย่อย + index (`รอเงื่อนไข`)

## 5. ผลกระทบ & ความเสี่ยง

- **ระบบ/ฟีเจอร์เดิมที่กระทบ:**
  - `global-install` feature — requirement เรื่อง `/warnyin:init` สร้าง scaffold เปลี่ยนจาก "สร้างไฟล์เปล่า" → "seed จาก template" (**Spec delta MODIFIED** — ดู `design.md §9`)
  - `installer` — `SCAFFOLD_FILES` ลดลง 1 บรรทัด, `seedDocs` รับหน้าที่แทน (ลำดับใน `main()` คือ `ensureScaffold()` → `seedDocs()` และ seed **ไม่ทับไฟล์ที่มีอยู่** จึงต้องเอา `context.md` ออกจาก scaffold ไม่งั้น template ไม่มีวันลง)
  - `utility-skills` feature — **ไม่กระทบ** (ไม่เพิ่ม skill)
  - `discovery-modes` — **ไม่กระทบ** (`blue-memory`/`red-memory` ของ mode `ไต่สวน` ยังผูกกับ topic ตามเดิม; `memory.md` ต้องอธิบายเส้นแบ่งเพื่อไม่ให้สับสน)
- **ความเสี่ยง + วิธีลดความเสี่ยง:**

| # | ความเสี่ยง | ระดับ | วิธีลด |
|---|---|---|---|
| R1 | memory บวม/stale (ไม่มี cap ตาม D5b) | สูง | ออกแบบ `context.md` เป็น **snapshot เขียนทับ** (ไม่ต่อท้าย) + `memory.md` มีทางออกจริงที่ SHIP + `/warnyin:memory` มีโหมดทบทวน/บีบอัด + `memory-status.mjs` รายงาน ⚠ ตามเกณฑ์เชิงตัวเลข (`design.md §3.3`) |
| R2 | ของกองผิดที่ / 2 แหล่งความจริงกับ `docs/rule.md` | สูง | `memory.md` §"เส้นแบ่งกับที่เก็บอื่น" เป็นตาราง **11 แถว** + **decision rule 4 ข้อ** + **precedence** (กฎ/artifact จริงชนะ memory เสมอ) — `design.md §3.4` |
| R3 | secret/internal path หลุดขึ้น repo + prompt-injection surface | กลาง-สูง (ยอมรับแล้ว D5b) | ไม่มี scrub อัตโนมัติตามมติ user — ลดด้วย **คำเตือนในหัว template + `memory.md §2`** (C12) และ **trust-boundary clause ที่จุดอ่านทุกจุด** (C3a/b/c + C9). ⚠ `verify-pack` denylist กันแค่ **tarball ของ warnyin เอง** ไม่ได้กัน `docs/memory.md` ใน repo ของผู้ใช้ (คนละ scope) |
| R4 | ceremony creep (7 ชิ้นในรอบเดียว) | กลาง | ทุกชิ้นต้องผ่าน `minimalism.md` ขั้น 1; command/script เป็น read-mostly ชิ้นเล็ก; ไม่เพิ่ม hard gate item ใด |
| R5 | BUILD fan-out หลาย worktree เขียน memory ชนกัน | กลาง | ตาม `docs/rule.md §1` build-orchestration — **agent ใน worktree ห้ามเขียน memory; main loop เขียนตอน integrate** (เขียนเป็นกฎใน `memory.md`) |
| R6 | ★ **แก้แล้วตาม panel** — ข้อเท็จจริงเดิมผิด: `--update` **seed `docs/` ด้วย** (`cli.mjs` เรียก `ensureScaffold()`+`seedDocs()` ทุกครั้ง) → ผู้ใช้เดิม **ได้ `docs/memory.md` ทันที** แต่ `docs/stages/context.md` ที่เป็นไฟล์ 0 byte อยู่แล้วจะ **ถูก skip ตลอดกาล** | กลาง | กติกา **"ไฟล์ว่าง/ไม่มี heading = ถือว่ายังไม่มี → เขียนทับด้วยโครงเต็ม"** (`design.md §4` C13) + เคสเทสใน T3 + migration note ใน CHANGELOG |

## 6. ลิงก์

- Design (how): `./design.md`
- Discovery: `./discovery.md` · Research: `./research.md`
- Tasks: `./tasks/`
- Business: `./business.md`
