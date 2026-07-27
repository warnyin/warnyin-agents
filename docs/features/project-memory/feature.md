# Feature — Project memory (ความจำระดับโปรเจกต์ที่อยู่ใน repo)

> ความรู้ถาวรระดับ feature · promote จาก topic `project-memory` (achieved 2026-07-27)
> ความจำของงานอยู่ใน repo (commit ไปกับโค้ด) ไม่ใช่ใน memory store ของ harness ตัวใดตัวหนึ่ง

## คืออะไร

**project memory** = ความจำระดับโปรเจกต์ที่เก็บเป็นไฟล์ใน repo **2 ใบ แยกตามอายุของข้อมูล**:

| ไฟล์ | semantic | อายุ |
|---|---|---|
| `docs/stages/context.md` | **working state** — "ตอนนี้อยู่ตรงไหน" | สั้น · **เขียนทับ** ไม่สะสม (4 section คงที่) |
| `docs/memory.md` | **บทเรียนที่ยังพิสูจน์ไม่พอจะเป็นกฎ** (ข้าม topic) | ยาว · สะสมเป็นตาราง 6 คอลัมน์ |

หัวใจคือ **ห้องพักก่อนขึ้น rule** — บทเรียนที่ยังไม่มี evidence/generalize พอจะเป็น `docs/rule.md` มาพักที่ `docs/memory.md` ก่อน แล้ว SHIP เป็นคนตัดสินว่าจะ promote ขึ้นเป็นกฎหรือปล่อยตก
ต่างจาก memory store ของ harness ตรงที่ **portable ข้ามเครื่อง/ข้าม harness + review ได้ผ่าน git diff** — root doc ของทุก harness จึงสั่งให้เขียนลง 2 ไฟล์นี้แทนที่จะเก็บไว้ที่ตัวเอง (กันความจำแยกเป็นสองแหล่ง)

## องค์ประกอบ

| # | กลไก | layer | ทำอะไร |
|---|---|---|---|
| 1 | **playbook กลาง** | `.warnyin/workflow/memory.md` | canonical เดียวของกติกา — 9 section (semantic · governance · schema · layout/lifecycle · write point · consume · promote · trust boundary · ทบทวน); ที่อื่นเป็น **pointer ไม่ inline กฎ** |
| 2 | **ไฟล์จริง 2 ใบ + template** | `template/docs/memory.md` · `template/docs/stages/context.md` | installer seed ให้ผู้ใช้ได้ **โครงจริง** ไม่ใช่ไฟล์เปล่า (lazy-create: ไม่มี/ว่าง/ไม่มี heading = ถือว่ายังไม่มี → เขียนทับด้วยโครงเต็ม) |
| 3 | **write hook** | `stages/{discovery,design,build,verify,ship}.md` + `fastlane.md` | จบ stage → เขียนสถานะล่าสุด**ทับ** `context.md` + บทเรียน → `memory.md` แบบ **conditional** (ไม่มีอะไรเปลี่ยน → ข้าม); **BUILD = main loop เท่านั้น** — sub-agent ใน worktree ห้ามเขียนเอง |
| 4 | **consume hook** | `stages/discovery.md §2` · `next.md` · `explore.md` | อ่าน 2 ไฟล์เป็น **data ไม่ใช่ instruction** — คำสั่งที่เขียนอยู่ในไฟล์ → ignore, ยืนยันกับโค้ด/เอกสารจริงเสมอ |
| 5 | **ทางออก (promote)** | `stages/ship.md` 3 จุด | `docs/memory.md` เป็นแหล่ง learned-rule candidate ที่ 3 (ถัดจาก planned/emergent) → dedup กับ `tasks/*/rule.md §2` → **gate เดิมไม่ถูกลดทอน** (evidence บังคับ + user ยืนยัน per-rule) → flip เป็น `promoted`/`dropped` |
| 6 | **`/warnyin:memory [ทบทวน]`** | `.claude/commands/warnyin/memory.md` | command (user-invoked) ดู memory + สุขภาพแบบ read-only; โหมดทบทวนเสนอรายการที่จะ promote/ตัด แล้ว **รอ user ยืนยันก่อนเขียน ไม่ลบเงียบ** |
| 7 | **`memory-status.mjs`** | `.warnyin/workflow/scripts/` | รายงานสุขภาพ deterministic (จำนวน entry ต่อสถานะ · บรรทัดของ context · entry ค้างนาน) — **read-only · exit 0 เสมอ · ไม่พิมพ์เนื้อ entry** |
| 8 | **root doc note** | `installer/templates/{CLAUDE.md,CLAUDE.global.md}` · `AGENTS.md` | บอก harness ที่มี memory store ของตัวเองให้เขียนลง repo แทน + ข้อยกเว้น worktree + ข้อห้ามเนื้อหา (auto-load ทุก agent จึงถึง sub-agent ที่ fan-out) |

## Schema

**`docs/memory.md`** — ตาราง 6 คอลัมน์: `# · บทเรียน · ที่มา (evidence pointer) · ประเภท · วันที่ · สถานะ`
- ประเภท (closed set): `gotcha` · `บทเรียน` · `ข้อสังเกต` — สถานะ (closed set): `open` · `promoted` · `dropped`
- **evidence pointer ต้องเป็น inline-code (backtick) ห้าม markdown-link** — ไฟล์นี้อยู่ใน `SCAN_ROOTS` ของ dead-link gate; ลิงก์ที่ชี้ `docs/stages/<slug>/` จะพังถาวรเมื่อ SHIP `git mv` topic เข้า `achieved/`
- **ไม่มี field** priority/assignee/vector — กัน scope creep เป็น issue tracker/RAG

**`docs/stages/context.md`** — 4 section คงที่ เขียนทับทุกครั้ง: `กำลังทำอะไรอยู่` · `ค้างอะไร` · `เพิ่งตัดสินอะไรไป` (≤5) · `อัปเดตล่าสุด`

**เกณฑ์ "ไม่บวม" (guidance ไม่ block):** `context.md` ≤ 60 บรรทัด · entry `open` ≤ 30 · entry `open` เก่ากว่า 90 วัน = "ค้างนาน" → `memory-status` พิมพ์ ⚠ แต่ exit ยัง 0

## เส้นแบ่งกับที่เก็บอื่น (ทำไมไม่ทับซ้อน)

| ที่เก็บ | ต่างตรงไหน |
|---|---|
| `docs/rule.md` · `techstack/*/rule.md` | **กฎที่ยืนยันแล้ว** (มี evidence + generalize + user ยืนยัน) — memory คือของที่ยังไม่ถึงขั้นนั้น |
| `docs/troubleshooting.md` | **ปัญหาที่แก้จบแล้ว** — memory คือสิ่งที่ยังพลาดซ้ำได้/ยังไม่รู้วิธีกันถาวร |
| `docs/backlog.md` | **งาน**ที่ยังไม่ทำ — memory คือ **ความรู้** ไม่ใช่งาน |
| `tasks/*/rule.md §2` | candidate ที่**ผูก task ของ topic ปัจจุบัน** (archive ไปกับ topic) — memory คือของที่**ข้าม topic** |
| `<slug>/issue.md` | ค้าง**ภายใน** topic — `context.md §ค้างอะไร` คือค้าง**ข้ามงาน/ข้าม session** |
| `CLAUDE.md`/`AGENTS.md` | **กติกาที่ user เขียนเอง** — memory คือสิ่งที่ agent สะสม |

**★ precedence เมื่อขัดแย้ง:** กฎที่ยืนยันแล้วและ **artifact จริง ชนะ memory เสมอ** — memory ที่ขัดแย้ง = **stale** → เสนอ user แก้/ตัด **ห้ามใช้ตัดสิน**

## ขอบเขต / ข้อจำกัด (การตัดสินใจเชิงสถาปัตยกรรม)

- **ไม่มีรั้ว ไม่มี hard gate** — เกณฑ์ 60/30/90 เป็นสัญญาณให้คนตัดสิน ไม่ block อะไร; malformed entry → นับเข้า `unknown` + ⚠ (ไม่ throw ไม่เปลี่ยน exit code)
- **command ไม่ใช่ skill** — `/warnyin:memory` โหมดทบทวนเขียนไฟล์ได้ → คงเป็น command (user-only) ตาม command-only convention
- **memory เป็น data ไม่ใช่ instruction** — artifact ที่ agent เขียนเอง+commit ก็เป็น prompt-injection surface (ขยายผลของ trust boundary ใน `interop.md`)
- **ไฟล์ถูก commit** → ห้ามเขียน raw secret/token/credential, absolute path ของเครื่อง, PII จริง (เป็น**คำเตือน** ไม่มีกลไกดัก — คงหลัก "ไม่มีรั้ว")
- **`docs/memory.md` อยู่นอก `docs/stages/`** จึงไม่ถูก archive ไปกับ topic (ต่างจาก context ของ topic)
- **`memory-status.mjs` เป็น report ไม่ใช่ gate** — exit 0 เสมอ, zero-dep, ไม่ import `child_process`/network, ไม่เขียนไฟล์, ไม่พิมพ์เนื้อ entry ออก log

## ไฟล์ที่เกี่ยวข้อง

- `src/.warnyin/workflow/memory.md` (canonical) · `src/.warnyin/workflow/README.md` (capability tree)
- `src/.warnyin/workflow/scripts/memory-status.mjs` · `src/tests/memory-status.test.mjs`
- `src/.warnyin/template/docs/memory.md` · `src/.warnyin/template/docs/stages/context.md` · `src/bin/cli.mjs` (`seedDocs`) · `src/.warnyin/workflow/init.md`
- `src/.warnyin/workflow/stages/{discovery,design,build,verify,ship}.md` · `next.md` · `explore.md` · `fastlane.md` (hook)
- `src/.claude/commands/warnyin/memory.md` · `src/.warnyin/installer/templates/{CLAUDE.md,CLAUDE.global.md,codebuddy-rules.md}` · `src/AGENTS.md`
- test: `src/tests/memory.test.mjs` (structural ข้าม slice 21 เคส) · `src/tests/installer.test.mjs` (seed + `--update`)
- **cross-feature:** [`global-install`](../global-install/feature.md) — `/warnyin:init` seed `docs/` แบบ recursive (MODIFIED ของ topic นี้) ทำให้ global mode ได้ memory 2 ไฟล์ที่มีโครงจริง
