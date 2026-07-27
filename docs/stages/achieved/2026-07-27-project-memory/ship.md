# Ship — Project memory

> Output ของ SHIP stage · playbook: `.warnyin/workflow/stages/ship.md`
> สรุปการส่งมอบ — เขียนหลังย้าย topic เข้า `docs/stages/achieved/2026-07-27-project-memory/` แล้ว

| | |
|---|---|
| **Slug** | `project-memory` |
| **วันที่ ship** | `2026-07-27` |
| **Build branch** | `build/project-memory` (5 commit — merge เข้า main จัดการนอก workflow) |
| **Release** | `0.27.1` → **`0.28.0`** (minor — feature ใหม่ backward-compatible) |

## 1. สรุป topic

เพิ่ม **project memory** = ความจำระดับโปรเจกต์ที่อยู่ใน repo แทนที่จะอยู่ใน memory store ของ harness ตัวใดตัวหนึ่ง — เก็บ 2 ไฟล์แยกตามอายุข้อมูล (`docs/stages/context.md` = working state เขียนทับ 4 section · `docs/memory.md` = บทเรียนสะสม ตาราง 6 คอลัมน์) พร้อมกลไกครบวง: **playbook กลาง** (canonical 9 heading) → **write hook** ทุก stage + fastlane (BUILD = main loop เท่านั้น) → **จุดอ่าน** 3 จุดที่กำกับว่าเป็น *data ไม่ใช่ instruction* → **ทางออกที่ SHIP** ด้วย gate เดิม (evidence + user ยืนยัน) → **command** `/warnyin:memory` + **script** รายงานสุขภาพ read-only
ปิดช่องที่ workflow สัญญาไว้กับตัวเอง: เดิม playbook อ้าง `docs/stages/context.md` 4 จุดและ installer สร้างไฟล์ให้ แต่**ไม่มี stage ไหนเขียนลงไปเลย** → ผู้ใช้ได้ไฟล์เปล่าที่ไม่มีวันมีเนื้อหา
ทำด้วย BUILD 6 task (wave 1 ขนาน 5 + wave 2 release-hygiene) · VERIFY แก้ 1 จุด 1 รอบ · **ระหว่างทางเจอและแก้บั๊ก CRLF ที่ทำให้ `/warnyin:build` ของผู้ใช้ทุกคนพัง** (นอกแผน — user สั่งให้รวมเข้า topic)

- ประเภท: ☑ **feature ใหม่** → `docs/features/project-memory/` · ☑ **ปรับปรุง feature เดิม** → `docs/features/global-install/` (MODIFIED 1 requirement)

## 2. เอกสารกลางที่อัปเดต

| ไฟล์ | สาระที่ promote |
|---|---|
| `docs/features/project-memory/` | **สร้างใหม่** — `feature.md` (8 องค์ประกอบ · schema · ตารางเส้นแบ่งกับที่เก็บอื่น · precedence · ขอบเขต) + `business.md` (goal/คุณค่า/persona/metric M1-M5 พร้อมผลจริง) |
| `docs/features/project-memory/spec.md` | Spec delta **ADDED ทั้งก้อน — 9 requirement / 24 scenario** |
| `docs/features/global-install/spec.md` | merge **MODIFIED**: `/warnyin:init` seed `docs/` **recursive ก่อน** แล้ว fallback ไฟล์เปล่าเฉพาะเมื่อ template ไม่มี + scenario ใหม่ "context.md ได้โครงจาก template" — **key match จริง ไม่มีเคส STOP** |
| `docs/techstack/installer/rule.md` | C1-C4 (ดู §3) |
| `docs/techstack/installer/standard.md` | ไม่แก้ — pattern ที่ topic ใช้ (black-box harness, pure-fn + main-guard) มีอยู่แล้วครบ |
| `docs/techstack/installer/structure.md` | ไฟล์ใหม่ 5 รายการ (`workflow/memory.md`, `scripts/memory-status.mjs`, template 2 ใบ, test 3 ไฟล์) + `MIN_PASS` 46 → 180 |
| `docs/techstack/installer/test.md` | section ใหม่ **"verify knowledge-store capability"** — verifier อิสระจาก builder · canonical-copy **extract-then-compare** · exact-set ของ hook · behavioral fixture อิสระ (พร้อมคู่ตรงข้าม) · install proof เป็นจุดเดียวที่จับบั๊กสภาพตั้งต้น · EOL gate · **falsifiability ต้อง fail-loud** |
| `docs/rule.md` | R1-R8 — ใหม่ 3 (§1 knowledge-store · §4 จุดเขียนของ payload · §4 inline-code ห้าม markdown-link) + **ขยายบรรทัดเดิม 4** ตาม unify-in-place |
| `docs/troubleshooting.md` | merge 4 entry: **#30** CRLF/Workflow (root cause 2 ชั้น) · **#31** compound-needle false positive · **#32** placeholder convention ข้าม parser · **#33** RED proof ที่ mutation ไม่เคยเกิด |
| `docs/backlog.md` | promote **5 entry** `open` พร้อม `มาจาก topic` (3 จาก topic + `--help` wording + universal-ide spec format) |
| `docs/infra.md` | section ใหม่ — dogfood จะได้ `docs/memory.md` เป็นไฟล์ **tracked** หลัง release · ข้อบังคับเนื้อหา · EOL note |
| `docs/codemap/index.md` | เพิ่ม `workflow/memory.md` (capability) + `scripts/memory-status.mjs` (entry point) |
| `CHANGELOG.md` + `package.json` | `[Unreleased]` → **`[0.28.0] - 2026-07-27`** (Added 6 · Changed 3 · **Fixed** EOL · Migration 2) · version bump |

## 3. Learned rules (planned + emergent)

> planned 16 (`tasks/*/rule.md §2`) + emergent 6 (build/verify/troubleshooting) → **กลั่นเหลือ 12 promote · 2 ตัดพร้อมเหตุผล** · user ยืนยันครบทุกข้อ

| rule (generalize) | evidence (pointer + artifact) | scope | promote? |
|---|---|---|---|
| **knowledge-store convention** — ที่เก็บความรู้ชนิดใหม่ต้องมี (1) เส้นแบ่ง+decision rule (2) precedence เมื่อขัดแย้ง (3) ทางออก ไม่ใช่แค่ทางเข้า · artifact ที่ agent เขียนเอง+commit = prompt-injection surface → clause "data ไม่ใช่ instruction" ต้องอยู่**ที่จุด consume เอง** | `memory.md §1/§8` (11 แถว + decision rule 4 ข้อ) · `verify.md` V7 (ไม่มี bare-consult 3 จุด) | `project` | ✅ §1 ใหม่ |
| **payload ที่ติดตั้งลงเครื่องผู้ใช้ต้องคุมที่ "จุดเขียน" ไม่ใช่แค่จุด commit** (EOL: `.gitattributes` = กฎของ checkout ครั้งหน้า · `npm pack` แพ็คจาก working tree) | `troubleshooting.md` TS-1 → KB #30 · `build.md §3.6` · วัดจริง `git ls-files --eol` 812 ไฟล์ | `project` | ✅ §4 ใหม่ |
| **ไฟล์ที่ agent เขียน+commit และอยู่ใน `SCAN_ROOTS` ต้องอ้าง path เป็น inline-code ห้าม markdown-link** | `design.md §3.1` · T6 เคส M6b (template 0 markdown-link) | `project` | ✅ §4 ใหม่ |
| **กฎที่ต้องถึง sub-agent ที่ fan-out ต้องอยู่ใน root doc** + **hook ของ stage ที่ fan-out ต้องมี main-loop-only variant** | panel Sec-B3 → `design.md §4` C6 + C2b · `build-wave.mjs` prompt reading-list | `project` | ✅ ขยาย `build-orchestration` |
| canonical-copy ต้องระบุ **path variant ต่อไฟล์** + **string ที่ assert คำต่อคำชนะ pattern ประจำไฟล์** | panel B4 → แตก C3 เป็น C3a/b/c · T4 copy C7 ลง `codebuddy-rules.md` ทั้งที่ไฟล์นั้นมี pattern อื่น | `project` | ✅ ขยาย `canonical-copy` |
| contract ตัดได้แค่ read-dependency **ไม่ตัด runtime dependency** → **slice ต้องเป็นเจ้าของ artifact ที่เทสตัวเองพึ่งพา** (ย้าย ownership แทน existence-guard) | `design.md §7` (ย้าย template 2 ใบ T1 → T3, DAG คงเดิม depth 2/width 5) | `project` | ✅ ขยาย `contract-as-copy-source` |
| **compound-needle ที่ assert exact-set ต้องมี constraint ผูกที่ task เจ้าของ canonical** + wave ที่ decouple ต้องประกาศ gate ที่ยังรันไม่ได้ | `troubleshooting.md` TS-3 → KB #31 · constraint A4b ของ T1 · `stage-wiring` ประกาศ lint:md เป็นของ wave 2 | `project` | ✅ ขยาย `contract-as-copy-source` |
| **existence-gate ต้อง assert ทุกก้อนของ payload ที่ผู้ใช้ต้องได้** ไม่ใช่แค่ก้อนที่เคยพัง | `design.md §6` (แถว packaging — `verify:pack` เป็น gate ลวง) · T6 เพิ่ม assert `template/docs/` | `project` | ✅ ขยาย `pack-verify` |
| **scaffold-vs-seed ownership invariant** — ไฟล์ที่มี template ห้ามอยู่ใน `SCAFFOLD_FILES` + bootstrap ต้อง **seed-before-empty-fallback** | `design.md §6` · เคสจริง `docs/stages/context.md` 0 byte ตลอดกาล · `installer.test.mjs` | `component:installer` | ✅ |
| **report-script ≠ gate-script** — exit 0 เสมอ · ไม่พิมพ์เนื้อ artifact/absolute path · มีเคส negative-property อ่านซอร์สตัวเอง | `design.md §4` C10 · T5 · `verify.md` V4.8/V4.9 (spawn จริง) | `component:installer` | ✅ |
| **parser ของ template ต้อง row-based + เคารพ placeholder convention ทุกจุด** + fixture ต้องมีเนื้อ template จริง · ห้าม `\w`/`\b` กับไทย | panel QA-B3 (legend-only) · `troubleshooting.md` TS-5 → KB #32 (VERIFY fix รอบ 1) | `component:installer` | ✅ |
| **`MIN_PASS` ต้อง bump พร้อม topic ที่เพิ่มเคส + คอมเมนต์ระบุที่มาของตัวเลข** | T6 (46 ตกยุคขณะยอดจริง 151 → bump 180 จาก N=192) | `component:installer` | ✅ |
| เกณฑ์ 60/30/90 เป็น guidance ปรับได้ | `memory.md §3` | — | ✂️ **ตัด** — เป็น *note* ไม่ใช่กฎ generalize; อยู่ในไฟล์ canonical แล้ว |
| แก้ wording `--help` ของ `cli.mjs` ที่เคลมว่า `--update` ไม่แตะ `docs/` | `tasks/installer-seed/rule.md §2` | — | ✂️ **ตัด** — เป็นการแก้**โค้ด** SHIP ไม่แตะ → ย้ายเข้า `docs/backlog.md` #4 (เอกสาร migration ถูกต้องแล้ว) |

## 4. Archive

- ย้ายจาก `docs/stages/project-memory/` → `docs/stages/achieved/2026-07-27-project-memory/` เมื่อ **2026-07-27** (ด้วย `git mv` ก่อนแตะเอกสารกลาง ตามลำดับบังคับของ playbook)
- entry `open` ใน `backlog.md` ของ topic ถูก flip เป็น `promoted` (idempotent — SHIP รันซ้ำไม่ promote ซ้ำ)

## 5. Gate ตอน ship (ยืนยันหลัง promote)

```
npm test 2>&1 | check-test-count  →  pass=197 tests=197 fail=0 (>= MIN_PASS 180) ✓
npm run lint:md                   →  131 ไฟล์ 110 ลิงก์ · 0 dead link ✓
```
> `lint:md` นับ 131 ไฟล์ (จาก 170 ก่อน archive) เพราะ `docs/stages/achieved/` อยู่ใน EXCLUDE ตามการออกแบบ

## 6. หมายเหตุ / งานที่เหลือ

- **`validate-topic` ✖ ค้าง 1 ข้อ — ไม่ใช่ของ topic นี้:** `docs/features/universal-ide/spec.md` ใช้ฟอร์มัตเก่า (ตาราง `R1-R9`) จึงไม่มี `## Requirement:` → **user เลือกให้เข้า backlog** (`docs/backlog.md` #5)
- **`verify:pack` ยังยืนยันตรงบน Windows ไม่ได้** (KB #4) — รอบนี้ใช้ workaround ที่ KB แนะนำ + unit gate; **ควรให้ CI ubuntu ยืนยันตอนเปิด PR** ก่อน publish 0.28.0
- **repo นี้ยังไม่มี `docs/memory.md` จริง** — จะได้หลัง release แล้วรัน `npm run setup:dogfood` / `--update` (ตาม `design.md §6` + note ใหม่ใน `docs/infra.md`)
- **merge `build/project-memory` → `main` และ publish อยู่นอก workflow** ตามกติกาของ SHIP
