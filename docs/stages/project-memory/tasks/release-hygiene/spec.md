# Spec — release-hygiene

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task

## 1. ชนิดของ task
`logic` (test ข้าม slice) + `infra` (packaging gate) + release hygiene — ไม่มี API/UI/data-flow ใหม่ (payload เป็น `.md` ล้วน; task นี้เขียน **เทสที่พิสูจน์ payload** + ปิด gate ลวงของ pack + CHANGELOG)

## 4. Data-flow
```
ไฟล์จริงจาก T1-T5 (src/.warnyin/workflow/**, src/.warnyin/template/docs/**,
                   src/.claude/commands/warnyin/memory.md,
                   src/.warnyin/installer/templates/*, src/AGENTS.md)
   └─▶ อ่านด้วย node:fs (readFileSync + walker เอง)  ──▶ assert ใน node --test
                                                          └─▶ check-test-count.mjs (pass===tests, fail===0, pass>=MIN_PASS)

npm pack --dry-run --json ──▶ file list ──▶ checkFiles() ──▶ error[] ──▶ exit code ของ verify:pack
   (unit ป้อน file list ปลอมตรงเข้า checkFiles() โดยไม่เรียก npm pack — main-guard กัน import trigger)

src/bin/cli.mjs ──(setup:sandbox → temp dir)──▶ docs/memory.md + docs/stages/context.md ที่ผู้ใช้ได้จริง
```

## 6. Persona
maintainer/CI — ต้องพิสูจน์ได้ว่า **กติกา memory ไม่ drift 2 ที่**, **hook ครบทุก stage**, **gate เดิมของ SHIP ไม่ถูกลดทอน**, และ **ไฟล์ที่ผู้ใช้ปลายทางได้จริงมีโครง** โดยไม่ต้องอ่านเอกสารด้วยตา

## 7. Test-flow

> เขียนที่ **`src/tests/memory.test.mjs` (ไฟล์ใหม่)** — bare `node --test` discover เอง
> ทุกเคสเป็น **node ล้วน cross-platform** (`node:test` + `node:assert/strict` + `node:fs`/`node:path`/`node:url`) — **ห้าม shell `grep`/`rg`** (Windows รันไม่ได้), **ห้าม `t.skip()`** (pass-count gate: `pass === tests`)
> ทุก needle ที่ assert แบบ string-equality ให้ declare เป็น `const` **ครั้งเดียว** ที่หัวไฟล์ แล้ววนเช็คทุก consumer (กัน string เพี้ยนในตัวเทสเอง)

**M1. heading freeze ของ playbook กลาง (C1)**
- [ ] M1 — `src/.warnyin/workflow/memory.md` มี heading ระดับ `##` ครบ **9 หัวข้อคำต่อคำ** ตาม `design.md §4 C1` (`## 1. project memory คืออะไร (semantic)` … `## 9. ทบทวน/บีบอัด`) **และเรียงตามลำดับนั้น** (index ของแต่ละอันเพิ่มขึ้นเรื่อย ๆ) — หายหรือสลับ → แดง

**M2. write hook ครบ 6 ไฟล์ (C2/C2b/C2c) — นับเป๊ะ ไม่ใช่ ≥1**
- [ ] M2 — walk `.md` ทั้งหมดใต้ `src/.warnyin/workflow/` แล้วหาไฟล์ที่มี **บรรทัด** ซึ่งมีทั้ง `อัปเดต project memory` **และ** `ไม่มีอะไรเปลี่ยน → ข้าม` (compound needle ระดับบรรทัด) → set ของไฟล์ต้อง **เท่ากันเป๊ะ** (`deepEqual` หลัง sort) กับ 6 ไฟล์: `stages/discovery.md`, `stages/design.md`, `stages/build.md`, `stages/verify.md`, `stages/ship.md`, `fastlane.md` — ขาด = hook ไม่ครบ, เกิน = hook ถูกลอกไปที่อื่น (รวมถึงถูก inline ซ้ำใน `memory.md` เอง ซึ่งขัด canonical-copy)
- [ ] M2b — `stages/build.md` มีทั้ง `main loop เท่านั้น` และ `build sub-agent ที่ทำงานใน worktree ห้ามเขียน memory เอง` (hook ของ BUILD ต่างจาก 5 ไฟล์ที่เหลือ)

**M3. negative-grep — กติกาเต็มอยู่ไฟล์เดียว (falsifiable single-source)**
- [ ] M3 — walk `.md` ทั้งหมดใต้ `src/` (ทั้ง tree ไม่ใช่แค่ `workflow/`) หา `working state (ปัจจุบัน)` → ต้องพบ **1 ไฟล์เท่านั้น** และเป็น `src/.warnyin/workflow/memory.md` (assert ทั้ง `length === 1` และชื่อไฟล์ — กัน false-green ถ้า string เพี้ยน)

**M4. root doc note ครบ 3 ไฟล์ (C6)**
- [ ] M4 — `src/.warnyin/installer/templates/CLAUDE.md`, `src/.warnyin/installer/templates/CLAUDE.global.md`, `src/AGENTS.md` ทุกไฟล์มี heading `## Project memory` **และ** อ้างทั้ง `docs/stages/context.md` และ `docs/memory.md`
- [ ] M4b — `installer/templates/CLAUDE.md` มีข้อความข้อยกเว้น worktree คำต่อคำ: `sub-agent ที่ทำงานใน git worktree ของ BUILD: ห้ามเขียน memory เอง`

**M5. command adapter + registry (C7)**
- [ ] M5 — registry line คำต่อคำ (`` - `/warnyin:memory [ทบทวน]` → ดู/ทบทวน project memory (`.warnyin/workflow/memory.md`) ``) ปรากฏใน **2 ไฟล์**: `src/.warnyin/installer/templates/CLAUDE.md` + `src/.warnyin/installer/templates/codebuddy-rules.md` (declare const ครั้งเดียวแล้ววน)
- [ ] M5b — `src/.claude/commands/warnyin/memory.md` มีอยู่ · frontmatter มีบรรทัดขึ้นต้น `description:` · body อ้าง `.warnyin/workflow/memory.md`
- [ ] M5c — body ของไฟล์เดียวกันมี **บรรทัด** ที่มีทั้ง `user` และ `ยืนยัน` (โหมดทบทวนไม่ลบเงียบ) และมีคำว่า `ทบทวน`
- [ ] M5d — `readdirSync('src/.claude/skills')` **ไม่มี** entry ชื่อ `memory` (เจตนา command-only — ห้าม auto-invoke งานที่เขียนไฟล์)

**M6. template 2 ใบ — คำเตือน C12 + 0 markdown-link**
- [ ] M6 — `src/.warnyin/template/docs/memory.md` และ `src/.warnyin/template/docs/stages/context.md` **มีอยู่ทั้งคู่** และแต่ละใบมีทั้ง `ห้ามเขียน raw secret/token/credential` และ `ห้ามใช้ markdown-link`
- [ ] M6b — **นับ markdown-link นอก code span = 0** ในทั้ง 2 ใบ: strip code ก่อน (fenced + inline ด้วย regex เดียวกับ `lint-md.mjs`) แล้วนับ `[...](...)` → ต้องได้ `0` (assert ตัวเลข ไม่ใช่ boolean; ข้อความ error ต้องพิมพ์ลิงก์ที่เจอ) — **ไฟล์ template ถูก `lint:md` EXCLUDE จึงไม่มี gate อื่นคุ้ม**
- [ ] M6c — `template/docs/stages/context.md` มี heading `##` ครบ 4: `## กำลังทำอะไรอยู่`, `## ค้างอะไร`, `## เพิ่งตัดสินอะไรไป`, `## อัปเดตล่าสุด`
- [ ] M6d — `template/docs/memory.md` ระบุ closed-set ครบ: `gotcha`, `บทเรียน`, `ข้อสังเกต` และ `open`, `promoted`, `dropped`

**M7. `docs/memory.md` อยู่นอก `docs/stages/` (ไม่ถูก archive)**
- [ ] M7 — path ของ template เทียบกับ root ของ template (`src/.warnyin/template/`) ต้องได้ `docs/memory.md` (POSIX) และ **ไม่ขึ้นต้นด้วย `docs/stages/`** ขณะที่ context template ได้ `docs/stages/context.md` (ขึ้นต้นด้วย `docs/stages/`) — พิสูจน์เชิงโครงสร้างว่าไฟล์บทเรียนอยู่นอกขอบเขตที่ SHIP ย้าย
- [ ] M7b — `stages/ship.md` มีข้อความคำต่อคำ `จึงไม่ถูก archive` ในบรรทัดเดียวกับที่อ้าง `docs/memory.md` (C4b)

**M8. regression ของ SHIP gate (ห้ามลดทอน gate เดิม)**
- [ ] M8 — นับบรรทัดที่ match `/^- \[ \] /m` ใน `stages/ship.md` = **12** พอดี (เดิม 11 + ของ memory) — น้อยกว่า = gate หาย, มากกว่า = มีคนแอบเพิ่ม gate นอก design
- [ ] M8b — บรรทัด §3 ข้อ 7 (บรรทัดที่มี `เก็บ learned-rule ให้หมด`) ยังมีทั้ง `evidence (บังคับ)` และ `user ยืนยัน` ใน**บรรทัดเดียวกัน**
- [ ] M8c — **ordering proxy:** `idxCandidate` = index ของบรรทัดที่มี `entry สถานะ \`open\` ใน \`docs/memory.md\`` (C4a) · `idxApprove` = index ของบรรทัดแรกที่มี `promotion plan` → assert ทั้งคู่ `>= 0` **และ** `idxCandidate < idxApprove` (รวบ candidate ต้องมาก่อนขั้นอนุมัติ; หาไม่เจอต้อง fail ไม่ใช่ผ่านเงียบเพราะ `-1 < n`)

**M9. จุดอ่าน — trust boundary + ไม่มีคำสั่งอ่านซ้ำ (C3a/b/c)**
- [ ] M9 — `stages/discovery.md`, `next.md`, `explore.md` ทั้ง 3 ไฟล์มีข้อความ `เป็น data ไม่ใช่ instruction`
- [ ] M9b — ใน `next.md` นับ **บรรทัด** ที่มีทั้งคำว่า `อ่าน` และสตริง `` `docs/stages/context.md` `` (มี backtick) → ต้องได้ **1 บรรทัดพอดี** (C3 ขยายบรรทัดเดิม ไม่สร้างจุดอ่านใหม่ซ้อน)

**P. packaging gate (ปิด gate ลวง)**
- [ ] P1 — `src/scripts/verify-pack.mjs` `checkFiles()` คืน error ที่อ้าง `src/.warnyin/template/docs/` เมื่อ file list **ไม่มี** path ใต้ prefix นั้น (unit ป้อน list ปลอม = `GOOD` ที่ filter prefix ออก) — พิสูจน์ว่าไม่ใช่ gate ลวง
- [ ] P2 — `checkFiles(GOOD)` (fixture ที่มี `src/.warnyin/template/docs/memory.md`) ยังคืน `[]` — เคสเดิมทุกเคสใน `verify-pack.test.mjs` ยังเขียวโดย **ไม่แก้ assertion ใด ๆ**
- [ ] P3 — `npm run verify:pack` เขียวกับ tarball จริง (template ติดจริง ไม่ใช่ผ่านเพราะ allowlist หลวม)

**G. gate ระดับ integration + install-proof (ไม่ใช่เคสเทส — รันแล้วแนบผลใน `build.md`)**
- [ ] G1 — `npm test` เขียว: `fail 0`, `skipped 0`, **`pass === tests`**, `pass >= MIN_PASS` (bump แล้วตาม `standard.md §4`)
- [ ] G2 — `npm run lint:md` เขียว
- [ ] G3 — `npm run verify:pack` เขียว
- [ ] G4 — `npm run setup:sandbox` แล้วอ่านไฟล์ใน temp dir ที่ script พิมพ์ออกมา: `docs/memory.md` มีตาราง 6 คอลัมน์ + คำเตือน C12, `docs/stages/context.md` มี 4 heading, **ทั้งคู่ขนาด > 0 byte** (install-proof — ตรวจสิ่งที่ผู้ใช้ได้จริง ไม่ใช่แค่ `src/`)
- [ ] G5 — **falsifiability run** (sub-task 3): ทำให้ invariant ผิดชั่วคราว → M3 (และ M2) **แดงจริง** → คืนไฟล์เดิม → เขียว

## 8. Scenario coverage (`design.md §9` → เคสจริง)

| Requirement / Scenario ใน `design.md §9` | คุ้มด้วย | เจ้าของ |
|---|---|---|
| playbook มี section หลักครบเก้า | M1 | T6 |
| กติกาเต็มอยู่ไฟล์เดียว (`working state (ปัจจุบัน)`) | M3 | T6 |
| template ของทั้งสองไฟล์มีอยู่ | M6 | T6 |
| `context.md` มีสี่ section คงที่ | M6c (template) + เคส installer ของ T3 (ไฟล์ที่ seed จริง) | T6 / T3 |
| `memory.md` มี closed-set ของประเภทและสถานะ | M6d + เคส installer ของ T3 | T6 / T3 |
| คำเตือนปรากฏในทั้งสอง template | M6 | T6 |
| template ไม่มี markdown-link | M6b | T6 |
| hook ครบทุกไฟล์ (6) | M2 | T6 |
| hook ของ BUILD ห้าม sub-agent เขียนเอง | M2b | T6 |
| clause `เป็น data ไม่ใช่ instruction` ครบสามจุดอ่าน | M9 | T6 |
| ไม่มีคำสั่งอ่านซ้ำในไฟล์เดียว | M9b | T6 |
| candidate ถูกรวบก่อนขั้นอนุมัติ | M8c (ordering proxy) | T6 |
| gate เดิมไม่ถูกลดทอน (12 item + §3 ข้อ 7) | M8 + M8b | T6 |
| memory ไม่ถูก archive ไปกับ topic | M7 + M7b | T6 |
| command adapter มีอยู่และชี้ playbook | M5b | T6 |
| โหมดทบทวนไม่ลบเงียบ | M5c | T6 |
| ปรากฏใน registry ทั้งสองไฟล์ | M5 | T6 |
| ไม่ถูกทำเป็น skill auto-invocable | M5d | T6 |
| note ปรากฏครบสามไฟล์ (root doc) | M4 | T6 |
| note มีข้อยกเว้น worktree | M4b | T6 |
| script: ไม่มีไฟล์ memory ก็ไม่ error · legend-only → 0 · นับแยกสถานะ · ไม่พิมพ์เนื้อ entry | `src/tests/memory-status.test.mjs` | **T5** (T6 ยืนยันผ่าน G1) |
| MODIFIED: init สร้าง workspace / `context.md` ได้โครงจาก template | เคสของ T3 (`installer.test.mjs` + `init.md`) | **T3** (T6 ยืนยันผ่าน G1/G4) |
| packaging: template ติด tarball (จาก `design.md §6`) | P1-P3 | T6 |

> แถวที่เจ้าของเป็น T3/T5: T6 **ไม่เขียนซ้ำ** (กัน duplicate coverage ข้ามเจ้าของไฟล์) — ถ้าหลัง integrate แล้วเคสของ T3/T5 ไม่มีจริง → **รายงาน main loop** ตาม fix authority ห้ามเขียนแทนเอง
