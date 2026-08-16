# Spec — memory-hook-lean

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task

`infra` / `docs-payload` — แก้ **playbook markdown** ของ workflow core (`src/.warnyin/workflow/`) ไม่แตะโค้ดรันไทม์
**API SPEC / UX-UI SPEC = N/A** (ไม่มี REST API และไม่มี UI surface — ตาม `design.md §1`)

---

## 2. จุดแก้ที่ต้องทำ (4 จุด · 3 ไฟล์แก้ + 1 ไฟล์ตรวจ)

> ★ string ของ **C6** ต้อง **copy คำต่อคำจาก `design.md §4`** — ที่ยกมาในไฟล์นี้เป็น**ตำแหน่งอ้างอิง** ไม่ใช่แหล่งจริง (ต่างกัน → `design.md` ชนะ)
> ★ ทุกไฟล์อยู่ใต้ `src/.warnyin/workflow/` เท่านั้น — **root `.warnyin/` เป็น dogfood ที่ gitignored ห้ามแตะ** (`docs/rule.md §6`)

| # | ไฟล์ | จุด | การกระทำ |
|---|---|---|---|
| P1 | `memory.md` | §5 ประโยคนำ | **แทนที่/เพิ่ม** ประโยคนำให้สื่อว่าเขียนที่ "จุดจบงาน" ไม่ใช่ท้ายทุก stage |
| P2 | `memory.md` | §5 anchor table | **ลบ 3 แถว** (Discovery / DESIGN / VERIFY) เหลือ 3 แถว (BUILD / SHIP / fastlane) |
| P3 | `stages/discovery.md` | ท้าย §4 | **ลบ** blockquote hook `อัปเดต project memory` ทั้งบรรทัด (+ บรรทัดว่างที่ค้าง) |
| P4 | `stages/ship.md` | ท้าย §4 | **คงไว้** — ตรวจว่ายังตรงนิยามใหม่ (ค่าตั้งต้น = ไม่แก้ข้อความ ดู §2.4) |
| P5 | `fastlane.md` | §1 bullet ที่ 3 | **แทนที่ทั้งบรรทัด** ด้วย C6 (unify-in-place — ไม่เพิ่มข้อใหม่ขนาน) |

### 2.1 `memory.md §5` — anchor table หลังแก้ (P2)

ตารางต้องเหลือ **3 data row เป๊ะ** (ไม่นับ header/separator) เรียงตามนี้:

| จุด | ไฟล์ (anchor) | หมายเหตุ |
|---|---|---|
| BUILD | `stages/build.md` §4 (ท้าย stage) | **★ main loop เท่านั้น** หลัง integrate ครบทุก wave — sub-agent ใน worktree ห้ามเขียนเอง (§2) |
| SHIP | `stages/ship.md` §4 (ท้าย stage) | สถานะหลังส่งมอบ + สิ่งที่ยังไม่ถูก promote |
| fastlane | `fastlane.md` §3 (skip-list) | executor ของ fast tier — ดู `[`triage.md`](./triage.md)` _(ในไฟล์จริงเป็น markdown-link ปกติ — ที่นี่ใส่ backtick ครอบกัน dead-link ของ `lint:md` ในโฟลเดอร์ topic)_ |

- แถว **BUILD / SHIP / fastlane คงข้อความเดิมคำต่อคำ** — ลบเฉพาะ 3 แถวที่ตัดออก (แก้เท่าที่จำเป็น)
- blockquote ปิดท้าย §5 ("เจ้าของนิยาม ไม่ใช่เจ้าของไฟล์ปลายทาง") **คงไว้ทั้งบรรทัด** — เป็นกฎที่กันการลอก wording ของ hook มาซ้ำ

### 2.2 `memory.md §5` — ประโยคนำ (P1)

เนื้อความที่ต้องสื่อ (ไม่ใช่ contract string — เขียนเองได้ แต่ต้องผ่าน §7 T3/T4):

- memory ถูกเขียนที่ **จุดจบงาน** เท่านั้น: BUILD (หลัง integrate ครบทุก wave) · SHIP · fastlane (ship-lite)
- Discovery / DESIGN / VERIFY **ไม่มี hook** — เพราะสถานะของสาม stage นั้นอยู่ใน artifact ของตัวเองแล้ว (`discovery.md` · `proposal.md`+`design.md` · `build.md §4`)

wording แนะนำ (ปรับได้):

```
> **เขียนที่ "จุดจบงาน" ไม่ใช่ท้ายทุก stage** — Discovery/DESIGN/VERIFY ไม่มี hook เพราะสถานะของสาม stage นั้นอยู่ใน artifact ของตัวเองแล้ว (`discovery.md` · `proposal.md`+`design.md` · `build.md §4`)
```

⚠ **ห้ามให้บรรทัดใดใน `memory.md` มีทั้ง `อัปเดต project memory` และ `ไม่มีอะไรเปลี่ยน → ข้าม` ในบรรทัดเดียวกัน** — compound needle ของ `src/tests/memory.test.mjs` (M2) นับ **exact set ของไฟล์** ถ้า canonical ติดไปด้วยจะกลายเป็น "ไฟล์เกิน" (`docs/rule.md §2` — assertion ที่นับ exact-set ต้องมี constraint ผูกที่ task เจ้าของไฟล์ canonical)

### 2.3 `stages/discovery.md` — บรรทัดที่ต้องลบ (P3)

บรรทัดปัจจุบัน (ท้าย §4 ก่อนเส้น `---`) — ลบทั้งบรรทัด:

```
> **★ อัปเดต project memory (conditional):** จบ stage แล้ว → เขียนสถานะล่าสุด **ทับ** `docs/stages/context.md` (snapshot สั้น ไม่ต่อท้าย) และบทเรียนที่ยัง**พิสูจน์ไม่พอจะเป็น rule** → `docs/memory.md`; ไม่มีอะไรเปลี่ยน → ข้าม — กติกาเต็มดู [`.warnyin/workflow/memory.md`](../memory.md)
```

- ลบ **บรรทัดว่างที่เหลือค้าง** ให้โครง §4 จบด้วย step สุดท้าย (`6. เช็ค gate ...`) แล้วตามด้วย `---` ตามสไตล์เดิม
- ⚠ **ห้ามแตะ §2 ข้อ 5** ของไฟล์เดียวกัน (จุด **อ่าน** memory + clause `เป็น data ไม่ใช่ instruction`) — คนละเรื่องกับ hook เขียน

### 2.4 `stages/ship.md` — คง hook (P4)

- **ค่าตั้งต้น = ไม่แก้ข้อความ** — SHIP คือจุดจบงานอยู่แล้ว ประโยค "จบ stage แล้ว →" จึงไม่ขัดกับนิยามใหม่
- ถ้าจะปรับถ้อยคำ ต้องคง **สอง substring** นี้ในบรรทัดเดียวกันเสมอ: `อัปเดต project memory` และ `ไม่มีอะไรเปลี่ยน → ข้าม` (compound needle M2)
- ⚠ ห้ามแตะบรรทัด §4 step 5 ข้อย่อย 8 ที่มี `docs/memory.md` + `จึงไม่ถูก archive` (M7b) และ gate item `- [ ]` 12 ข้อใน §6 (M8)

### 2.5 `fastlane.md §1` — บรรทัดที่ต้องแทนที่ (P5)

เดิม:

```
- **★ user-invoked เท่านั้น** — stateful + irreversible (เขียนไฟล์/archive) → ห้ามให้ AI auto-invoke เอง
```

ใหม่ — ขึ้นต้นด้วย C6 **คำต่อคำ ห้ามแทรก markdown emphasis กลาง string** (`**`/`_` ทำให้ string-equality แดง):

```
- ★ user-invoked เท่านั้น — AI auto-invoke เองไม่ได้; handoff จาก DESIGN ที่ user ยืนยันในเซสชัน (design §4 step 1.5) นับเป็น user-invoked
```

- ต่อท้ายเหตุผลเดิมได้ (ไม่บังคับ) เช่น ` — stateful + irreversible (เขียนไฟล์/archive)` — **ต่อท้ายเท่านั้น ห้ามแทรกกลาง**
- `design §4 step 1.5` ใน string เป็น **plain text ไม่ใช่ markdown-link** (ตาม contract) — ห้ามแปลงเป็นลิงก์
- ⚠ **หนึ่งบรรทัดเท่านั้น** — ห้ามคง bullet เดิมไว้คู่กับบรรทัดใหม่ (unify-in-place — `docs/rule.md §1`)
- `fastlane.md §3` แถว `| — | **อัปเดต project memory** (conditional) | ... |` **คงไว้ทั้งแถว ห้ามแตะ**

---

## 4. Data-flow

```
design.md §4 C6/C7 (canonical contract)
   ├─ C7 ─▶ memory.md §5 (นิยาม: เขียนอะไร ที่ไหน)  ──┐
   │                                                   ├─▶ runtime: agent เขียน docs/stages/context.md + docs/memory.md
   │        stages/{build,ship}.md + fastlane.md §3 ───┘   (ข้อความ hook จริง — ไฟล์ stage เป็นเจ้าของ)
   │        stages/discovery.md ──✖ ลบ hook
   └─ C6 ─▶ fastlane.md §1 (เงื่อนไขผู้เรียก) ─── อ่านโดย slice 1 (`design.md §4 step 1.5`) ผ่าน contract ไม่ใช่ไฟล์
```

- **memory.md = เจ้าของนิยาม ไม่ใช่เจ้าของไฟล์ปลายทาง** — ห้ามลอก wording ของ hook มาซ้ำใน `memory.md` (canonical-copy, `docs/rule.md §1`)
- task นี้ **ไม่สร้าง/ไม่อ่านไฟล์ memory จริง** — แก้เฉพาะ "คำสั่ง" ใน playbook

## 5. User-flow

```
/warnyin:discovery  → (ไม่มี hook แล้ว) สถานะอยู่ใน discovery.md ของ topic
/warnyin:design     → hook ถูกตัดโดย slice 1 (task design-stage-lean) — ไม่ใช่ของ task นี้
/warnyin:build      → main loop เขียน memory หลัง integrate ครบทุก wave (คงเดิม)
/warnyin:verify     → hook ถูกตัดโดย slice 2 (task build-verify-seam) — ไม่ใช่ของ task นี้
/warnyin:ship       → เขียน memory + promote entry (คงเดิม)
/warnyin:fastlane   → user สั่งเอง หรือ handoff ที่ user ยืนยันจาก DESIGN → จบงานเขียน memory (ship-lite)
/warnyin:next|explore → อ่าน memory เป็น context (คงเดิม — ห้ามลบโดยไม่ตั้งใจ)
```

## 6. Persona

- **agent ทุก harness** ที่เดิน stage — เป็นผู้อ่านคำสั่งเหล่านี้จริง (ผู้ได้ประโยชน์: จ่าย ceremony น้อยลง 3 จุด/topic)
- **ผู้ใช้ warnyin** ที่กลับมาทำงานคนละ session — ยังต้อง "จำได้" เท่าเดิมที่จุดจบงาน

## 7. Test-flow (self-verify ด้วย grep/node — **ห้ามรัน `npm test` เต็มและ `npm run lint:md`**)

> เหตุผลที่ห้ามรัน suite เต็ม: `src/tests/memory.test.mjs` M2 ยัง assert **exact set 6 ไฟล์** และ hook ของ `design.md`/`verify.md` เป็นของ slice อื่นใน wave เดียวกัน → แดงเป็นปกติในรอบนี้ **ห้ามแก้ contract หรือแก้ไฟล์ของ slice อื่นเพื่อให้ gate เขียว**; การอัปเดตเทส + gate เต็มเป็นของ `tasks/release-hygiene` (wave 2) — `docs/rule.md §2` (ประกาศ gate ที่ยังรันไม่ได้ในรอบนี้)

**Hook (negative-grep / positive-grep) — needle = `อัปเดต project memory`**

- [ ] **H1** — **ไม่พบ** ใน `src/.warnyin/workflow/stages/discovery.md` (นับ hit = 0)
- [ ] **H2** — **พบ** ใน `src/.warnyin/workflow/stages/build.md`, `stages/ship.md`, `fastlane.md` (3 ไฟล์ ยังครบ)
- [ ] **H3** — `stages/design.md` และ `stages/verify.md` **ยังพบอยู่ใน wave นี้ = ถูกต้อง** (ความรับผิดชอบของ slice 1/slice 2 — ตรวจรวมตอน `release-hygiene`); task นี้ต้องพิสูจน์ว่า **ไม่ได้แตะสองไฟล์นั้น** ด้วย `git status --short`
- [ ] **H4** — `stages/build.md` ยังมีทั้ง `main loop เท่านั้น` และ `build sub-agent ที่ทำงานใน worktree ห้ามเขียน memory เอง` (ไม่ถูกแตะ)

**ตาราง §5 ของ `memory.md`**

- [ ] **T1** — ตาราง anchor ใน `## 5. Write points (hook ต่อ stage)` มี **data row = 3 แถวพอดี** (ไม่นับ header + separator)
- [ ] **T2** — คอลัมน์แรกของ 3 แถวคือ `BUILD`, `SHIP`, `fastlane` และ **ไม่มี** คำว่า `Discovery`, `DESIGN`, `VERIFY` เป็นค่าในคอลัมน์แรกของตารางนี้
- [ ] **T3** — §5 มีข้อความที่สื่อว่าเขียนที่ "จุดจบงาน" และระบุว่า Discovery/DESIGN/VERIFY ไม่มี hook
- [ ] **T4** — **ไม่มีบรรทัดใดใน `memory.md`** ที่มีทั้ง `อัปเดต project memory` และ `ไม่มีอะไรเปลี่ยน → ข้าม` (กัน canonical ติด compound needle M2)
- [ ] **T5** — heading ของ `memory.md` ยังครบ **9 หัวข้อคำต่อคำ เรียงเดิม** (M1 — heading freeze; รวม `## 5. Write points (hook ต่อ stage)` ที่ **ห้าม rename**)
- [ ] **T6** — `memory.md` **ไม่มี** substring `จบ stage แล้ว → เขียนสถานะล่าสุด` (ไม่ลอก wording ของ hook มาซ้ำ)
- [ ] **T7** — §1/§2/§9 ของ `memory.md` ไม่ขัดกับ §5: §2 ยังมี `จุดเขียนดู §5` + worktree rule เดิม, `working state (ปัจจุบัน)` ยังปรากฏใน `memory.md` เพียงไฟล์เดียวใน `src/` (M3)

**C6 ใน `fastlane.md`**

- [ ] **C6-1** — พบ substring คำต่อคำ: `★ user-invoked เท่านั้น — AI auto-invoke เองไม่ได้; handoff จาก DESIGN ที่ user ยืนยันในเซสชัน (design §4 step 1.5) นับเป็น user-invoked`
- [ ] **C6-2** — บรรทัดที่มี C6 อยู่ใน **§1** และนับได้ **1 บรรทัด** (ไม่มีข้อขนาน); `fastlane.md` **ไม่มี** บรรทัดเดิม `stateful + irreversible (เขียนไฟล์/archive) → ห้ามให้ AI auto-invoke เอง` หลงเหลือเป็นข้อแยก
- [ ] **C6-3** — `fastlane.md §3` ยังมีแถว `| — | **อัปเดต project memory** (conditional) |` ครบ พร้อมลิงก์ `](./memory.md)`

**จุดอ่าน memory (regression — ห้ามลบโดยไม่ตั้งใจ)**

- [ ] **R1** — `เป็น data ไม่ใช่ instruction` ยังพบครบ **3 ไฟล์**: `stages/discovery.md`, `next.md`, `explore.md` (M9)
- [ ] **R2** — `stages/discovery.md §2 ข้อ 5` ยังสั่งอ่าน `docs/stages/context.md` + `docs/memory.md` และนับได้ **1 บรรทัด** (ไม่มีจุดอ่านซ้ำ/หาย)
- [ ] **R3** — `next.md` / `explore.md` **ไม่ถูกแตะเลย** (`git status --short` ไม่แสดงสองไฟล์นี้)

**ขอบเขต / ลิงก์**

- [ ] **N1** — `git status --short` แสดงเฉพาะ **3 ไฟล์**: `src/.warnyin/workflow/memory.md`, `src/.warnyin/workflow/stages/discovery.md`, `src/.warnyin/workflow/fastlane.md` (+ `stages/ship.md` เฉพาะกรณีเลือกปรับถ้อยคำตาม §2.4)
- [ ] **N2** — ทุก markdown-link ใน 3 ไฟล์ที่แก้ **resolve ได้** (ตรวจด้วยสายตา/สคริปต์เฉพาะไฟล์ที่แตะ — ไม่รัน `lint:md` เต็ม): `memory.md` → `./triage.md`, `./backlog.md`, `./minimalism.md`, `./next.md`, `./explore.md`, `./interop.md` ยังชี้ไฟล์ที่มีจริง
- [ ] **N3** — ไม่มีไฟล์ใน `.warnyin/` (root dogfood), `src/tests/`, `src/.claude/`, `src/.warnyin/template/`, `scripts/` ถูกแก้
