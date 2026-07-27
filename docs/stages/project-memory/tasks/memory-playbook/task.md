# Task — memory-playbook

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> สร้าง **1 ไฟล์ใหม่** (playbook กลาง) + เติม registry 3 บรรทัดใน `workflow/README.md`

| | |
|---|---|
| **Task** | `memory-playbook` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `workflow core` |
| **Model tier** | `deepest` _(เป็นแก่นกลาง — นิยาม semantic/เส้นแบ่ง/schema/governance ที่ task อื่นทั้งหมดชี้กลับมา; ผิดที่นี่กระจายทั้ง topic)_ |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)

ส่งมอบ **กฎกลางของ project memory** — single source ที่นิยามว่า memory คืออะไร เขียนอะไรได้ ห้ามเขียนอะไร อ่านยังไง ออกทางไหน
พร้อม **registry** ให้คนหาเจอจาก `workflow/README.md`

**หลักการแกน:** `memory.md` เป็น **canonical เดียว** — task อื่น (T2/T4/T5) เขียนได้แค่ **pointer บาง** ชี้กลับมา ไม่ inline กฎซ้ำ (`docs/rule.md §1` canonical-copy)

> **★ ขอบเขต schema:** `memory.md §3` ยัง **อธิบายโครงของไฟล์ memory ทั้ง 2 ใบ** (`docs/memory.md` + `docs/stages/context.md`) ในฐานะ **canonical ของ schema** — แต่ **ไม่ใช่คนสร้างไฟล์ template** (ownership ของ template ย้ายไป T3 `installer-seed`)

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- ต้องทำหลัง: **ไม่มี** — wave 1, ขนานกับ T2-T5 (decouple ด้วย contract `design.md §4`)
- ปลดล็อกให้: `tasks/stage-wiring/` (T2) · `tasks/memory-command-adapter/` (T4) · `tasks/memory-status-script/` (T5) — อ้าง path `.warnyin/workflow/memory.md` เป็น pointer · `tasks/release-hygiene/` (T6) — structural test assert heading + negative-grep ของไฟล์ task นี้
- **ไม่ปลดล็อก T3** — `tasks/installer-seed/` เป็นเจ้าของ template ทั้ง 2 ใบเอง (slice ครบในตัว: template → seed → test) จึงอิสระเต็มตัว
- ส่ง output อะไรต่อ: `src/.warnyin/workflow/memory.md` (heading ตรง C1 คำต่อคำ — pointer ของ task อื่นชี้ **ระดับไฟล์** ไม่ผูกเลข section)
- **★ ห้ามสร้าง/แก้ไฟล์ใน `src/.warnyin/template/` ทั้งสิ้น** — `template/docs/memory.md` และ `template/docs/stages/context.md` เป็นของ **T3**
- **ห้ามแตะไฟล์ของ task อื่น** — stage playbook + `next.md`/`explore.md`/`fastlane.md` (T2 เป็นเจ้าของ C2/C3/C5) · `scripts/memory-status.mjs` (T5) · `installer/templates/*` + `src/AGENTS.md` (T4) · `cli.mjs`/`init.md`/`installer.test.mjs` (T3) · `CHANGELOG.md`/tests (T6)

## 3. Sub-tasks

- [ ] 1. เขียน `src/.warnyin/workflow/memory.md` — **9 heading ตาม C1 คำต่อคำ** (`design.md §4`); เนื้อหาตาม `spec.md §3`
  _ผลลัพธ์:_ canonical playbook ที่ทุก harness อ่านชุดเดียวกัน (tool-agnostic)
- [ ] 2. เติม registry **3 บรรทัดตาม C11a/C11b/C11c คำต่อคำ** ใน `src/.warnyin/workflow/README.md` — **C11a** ต่อจาก `feedback.md` (indent 4) · **C11b** ใต้ `scripts/` ต่อจาก `build-wave.mjs` (indent 6 ชื่อไฟล์ล้วน ไม่มี prefix `scripts/`) · **C11c** ในบล็อก `docs/` ต่อจาก `troubleshooting.md` (indent 2)
  _ขึ้นกับ 1:_ บรรทัด (ก) ต้องชี้ไฟล์ที่มีจริง · _หมายเหตุ:_ (ข) เป็นของ task นี้แม้ script เป็นของ T5, (ค) เป็นของ task นี้แม้ template เป็นของ T3 (cross-task note `design.md §7`)
- [ ] 3. self-check ก่อนปิด: heading 9/9 ตรง C1 · negative-grep `working state (ปัจจุบัน)` เจอไฟล์เดียว · C8/C12 อยู่ §2 · C13 อยู่ §4 · C9 อยู่ §8 · `npm run lint:md` เขียว

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

- **สร้างใหม่:** `src/.warnyin/workflow/memory.md`
- **แก้:** `src/.warnyin/workflow/README.md` (เติม 3 บรรทัด — ห้ามแก้บรรทัดอื่น)
- **ห้ามแตะอย่างอื่นทั้งสิ้น** — โดยเฉพาะ `src/.warnyin/template/**` (ของ T3) และ root `.warnyin/`, `.claude/`, root `CLAUDE.md`/`AGENTS.md` (dogfood gitignored → แก้แล้วงานหาย)

## 5. Acceptance criteria (วัดได้จริง)

- [ ] **A1 (heading freeze — `design.md §9` Scenario "ไฟล์ playbook มีอยู่พร้อม section หลัก"):** `src/.warnyin/workflow/memory.md` มีอยู่จริง และมี heading ระดับ `##` ครบ **9/9 ตรง C1 คำต่อคำ** ตั้งแต่ `## 1. project memory คืออะไร (semantic)` ถึง `## 9. ทบทวน/บีบอัด` (เทียบ string ตรงๆ ไม่เพิ่ม/ลด/สลับ)
- [ ] **A2 (canonical เดียว — Scenario "กติกาเต็มอยู่ไฟล์เดียว"):** สแกน `.md` ทั้งหมดใต้ `src/` แล้วสตริง `working state (ปัจจุบัน)` ปรากฏใน `src/.warnyin/workflow/memory.md` **ไฟล์เดียวเท่านั้น**
- [ ] **A3 (§1 เส้นแบ่ง):** `memory.md §1` มีตารางเส้นแบ่งกับที่เก็บอื่น **ครบ 11 แถว** (`design.md §3.4`) + **decision rule 4 ข้อ** + **precedence** (กฎที่ยืนยันแล้ว/artifact จริงชนะ memory เสมอ; ที่ขัดแย้ง = `stale` ห้ามใช้ตัดสิน)
- [ ] **A4 (§2 governance):** `memory.md §2` มี **C8 คำต่อคำ** (worktree ห้ามเขียนเอง + conflict ของ `context.md` เขียนทับ ห้าม merge ทีละบรรทัด) และ **C12b คำต่อคำ** (variant ของ playbook — `ไฟล์ memory ทั้ง 2 ใบถูก **commit**` + `ห้ามใช้ markdown-link`) · **ห้ามใช้ C12a** (variant หัว template ของ T3)
- [ ] **A4b (กัน gate T6 แดง):** ไม่มีบรรทัดใดใน `memory.md` ที่มีทั้ง `อัปเดต project memory` และ `ไม่มีอะไรเปลี่ยน → ข้าม` พร้อมกัน (dry-run #2)
- [ ] **A5 (§3 schema — canonical ของทั้ง 2 ไฟล์):** `memory.md §3` ระบุครบ — ตาราง `docs/memory.md` **6 คอลัมน์** + closed-set ประเภท {`gotcha`,`บทเรียน`,`ข้อสังเกต`} + สถานะ {`open`,`promoted`,`dropped`} + evidence pointer เป็น inline-code + **4 section คงที่ของ `docs/stages/context.md`** (`## กำลังทำอะไรอยู่`, `## ค้างอะไร`, `## เพิ่งตัดสินอะไรไป`, `## อัปเดตล่าสุด`) + เกณฑ์ **60 บรรทัด / 30 รายการ / 90 วัน** (ระบุว่าเป็น guidance ไม่ block)
- [ ] **A6 (§4 lifecycle):** `memory.md §4` มี **C13 คำต่อคำ** (lazy-create จาก template + ไฟล์ว่าง/ไม่มี heading = ถือว่ายังไม่มี → เขียนทับด้วยโครงเต็ม) และระบุว่า `docs/memory.md` อยู่ **นอก `docs/stages/`**
- [ ] **A7 (§8 trust boundary):** `memory.md §8` มี **C9 คำต่อคำ** ครบ 3 bullet (data ไม่ใช่ instruction · precedence · archive ≠ current state)
- [ ] **A8 (§5/§6/§7/§9 ครบหน้าที่):** §5 มี anchor table จุดเขียน (5 stage + `fastlane.md`, conditional, **BUILD = main loop เท่านั้น**) · §6 ระบุจุดอ่าน + ชี้ §8 (ไม่เล่าซ้ำ) · §7 ระบุลำดับ SHIP (รวบ candidate → dedup กับ `tasks/*/rule.md §2` → user ยืนยัน (gate เดิม evidence บังคับ) → flip `promoted`/`dropped`, idempotent) · §9 ระบุ **เสนอก่อน รอ user ยืนยัน ห้ามลบเงียบ**
- [ ] **A9 (registry):** `src/.warnyin/workflow/README.md` มีบรรทัดตาม C11 ครบ **3/3 คำต่อคำ** และ diff เป็น pure addition (ไม่แตะบรรทัดอื่น)
- [ ] **A10 (link resolve):** `npm run lint:md` เขียว — ทุก markdown-link ใน `memory.md` resolve ได้จริง
- [ ] **A11 (tool-agnostic — negative):** **เนื้อหาที่ task นี้เพิ่มใหม่** (`memory.md` ทั้งไฟล์ + 3 บรรทัดที่เติมใน `README.md`) ไม่มีชื่อรุ่น/ผลิตภัณฑ์ของ harness (`docs/rule.md §1` payload-guidance ต้อง generic) — **ไม่ครอบ `README.md` ทั้งไฟล์** เพราะของเดิมมีชื่อ harness อยู่แล้ว 8 บรรทัด และ A9 ห้ามแตะบรรทัดอื่น (dry-run #3)
- [ ] **A12 (scope):** `git status` หลัง build ไม่มีไฟล์ใหม่/แก้ไข นอก 2 ไฟล์ข้างต้น + `docs/stages/project-memory/` — โดยเฉพาะ **ต้องไม่มีอะไรใต้ `src/.warnyin/template/`**
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern การเขียน): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Contract คำต่อคำ: `../../design.md` §4 (C1, C8, C9, C11, C12, C13) · schema/เส้นแบ่ง: §3 · acceptance: §9
