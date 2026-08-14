# Task — memory-hook-lean (ยุบ memory hook 6→3 จุด + fastlane รับ handoff)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `memory-hook-lean` |
| **Slice อ้างอิง** | `design.md` slice #4 |
| **Component** | `workflow core` (`src/.warnyin/workflow/`) |
| **Model tier** | `balanced` |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)

ทำให้ **project memory ถูกเขียนที่ "จุดจบงาน" เท่านั้น** และ **fastlane รับ handoff ที่ user ยืนยันได้** — ครบทั้ง canonical + ไฟล์ปลายทางในสไลซ์เดียว:

- **นิยาม:** `workflow/memory.md §5` anchor table เหลือ **3 แถว** — `BUILD` (main loop เท่านั้น หลัง integrate ครบทุก wave) · `SHIP` · `fastlane` (ship-lite) — พร้อมประโยคนำที่สอดคล้อง (contract **C7**)
- **ปลายทางที่ตัด:** `stages/discovery.md` ไม่มี hook เขียน memory อีกต่อไป
- **ปลายทางที่คง:** `stages/ship.md` (+ `stages/build.md`, `fastlane.md §3` ที่ไม่ต้องแตะ) ยังมี hook ครบ
- **fastlane:** `workflow/fastlane.md §1` ระบุชัดว่า handoff จาก DESIGN ที่ user ยืนยันในเซสชัน **นับเป็น user-invoked** (contract **C6** — copy คำต่อคำ)
- **ไม่ถดถอย:** จุด **อ่าน** memory 3 จุด (`stages/discovery.md §2` · `next.md` · `explore.md`) ยังครบพร้อม clause `เป็น data ไม่ใช่ instruction`

งานนี้คือ **การลบ/แทนที่บรรทัดตาม contract** ไม่ใช่การประดิษฐ์ wording ใหม่ (ยกเว้นประโยคนำ §5 ที่ระบุกรอบไว้ใน `spec.md §2.2`)

## 2. Dependency (เชื่อมต่อกับ task อื่น)

- **ต้องทำหลัง:** _ไม่มี_ — อยู่ **wave 1** ขนานกับ `design-stage-lean` · `build-verify-seam` · `validator-cap-gate` (`design.md §7`)
- **ปลดล็อกให้:**
  - `tasks/design-stage-lean` (slice 1) — เป็น **consumer ของ C6** แต่ **copy จาก `design.md §4` ไม่อ่านไฟล์ของ task นี้** (contract-first)
  - `tasks/release-hygiene` (wave 2) — เป็นคนอัปเดต `src/tests/memory.test.mjs` + รัน gate เต็ม
- **ส่ง output อะไรต่อ:** ไฟล์ playbook 3 ใบที่ hook/นิยามถูกตัดตาม C7 + C6 ปรากฏใน `fastlane.md §1`

**★ gate ที่ยังรันไม่ได้ในรอบนี้ (ประกาศตาม `docs/rule.md §2`)**

| gate | สถานะใน wave 1 | เจ้าของ |
|---|---|---|
| `src/tests/memory.test.mjs` **M2** (compound needle = exact set **6 ไฟล์**) | **แดงแน่นอน** — hook ของ `design.md`/`verify.md` เป็นของ slice 1/2 ที่ตัดขนานกัน | `tasks/release-hygiene` (แก้ expected 6 → 3: `build.md`, `ship.md`, `fastlane.md`) |
| `npm test` เต็ม · `npm run lint:md` · pass-count gate | รันหลัง integrate ครบ | `tasks/release-hygiene` |

> ⚠ **ห้ามแก้ contract / ห้ามแตะไฟล์ของ slice อื่น / ห้ามแก้ไฟล์เทส เพื่อให้ gate เขียวในรอบนี้** — self-verify ใช้ `spec.md §7` เท่านั้น

**★ ห้ามแตะไฟล์ของ task อื่น (file ownership)**

- ✖ `src/.warnyin/workflow/stages/design.md` (slice 1) · `stages/build.md`, `stages/verify.md` (slice 2)
- ✖ `src/.claude/commands/warnyin/*` (adapter — slice 1/2)
- ✖ `src/.warnyin/workflow/scripts/validate-topic.mjs` + `src/tests/**` (slice 3 / release-hygiene)
- ✖ `src/.warnyin/template/**` · `src/.warnyin/workflow/triage.md` · `CHANGELOG.md`
- ✖ root `.warnyin/` และ root `.claude/` (dogfood **gitignored** — แก้แล้ว git ไม่เห็น; `docs/rule.md §6`)
- ✔ อ่านได้อย่างเดียว: `docs/stages/lean-ceremony/design.md §4` (แหล่ง contract) · `docs/features/{project-memory,fastlane}/spec.md` (baseline)

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)

- [ ] 1. **อ่าน contract + baseline** — `design.md §4` (C6, C7) + `design.md §9 MODIFIED` ของ feature `project-memory`/`fastlane`; ยืนยันสถานะปัจจุบันด้วย grep `อัปเดต project memory` ใน `src/.warnyin/workflow/` (ต้องเจอ 6 ไฟล์ก่อนเริ่ม) — _ผลลัพธ์:_ รู้ string เป๊ะ + จุดแก้
- [ ] 2. **`memory.md §5` — ตัดตารางเหลือ 3 แถว (C7)** — ลบแถว `Discovery` / `DESIGN` / `VERIFY`; แถว `BUILD`/`SHIP`/`fastlane` **คงคำต่อคำ**; header + separator + blockquote ปิดท้าย §5 คงเดิม — _ขึ้นกับ 1_
- [ ] 3. **`memory.md §5` — ประโยคนำ** — เพิ่ม/ปรับให้สื่อว่าเขียนที่ **"จุดจบงาน"** + ระบุว่า Discovery/DESIGN/VERIFY ไม่มี hook เพราะสถานะอยู่ใน artifact ของตัวเอง (`spec.md §2.2`) — ⚠ **ห้ามให้บรรทัดใดมีทั้ง `อัปเดต project memory` และ `ไม่มีอะไรเปลี่ยน → ข้าม`** — _ขึ้นกับ 2 (ไฟล์เดียวกัน)_
- [ ] 4. **coherence check ภายใน `memory.md`** — อ่าน §1 / §2 / §9 แล้วยืนยันว่าไม่ขัดกับ §5 ใหม่ (§2 ยังชี้ "จุดเขียนดู §5" + worktree rule เดิม; §9 ไม่พูดถึง hook ต่อ stage) — พบข้อขัดแย้ง → **แก้ให้น้อยที่สุดและรายงาน** ไม่ rewrite section — _ขึ้นกับ 3_
- [ ] 5. **`stages/discovery.md` — ลบ hook** — ลบ blockquote `อัปเดต project memory` ท้าย §4 ทั้งบรรทัด + บรรทัดว่างที่ค้าง; ⚠ **ห้ามแตะ §2 ข้อ 5** (จุดอ่าน + clause data-ไม่ใช่-instruction) — _อิสระจาก 2-4_
- [ ] 6. **`stages/ship.md` — ตรวจ hook (ค่าตั้งต้น: ไม่แก้)** — ยืนยันว่าประโยค hook ยังตรงนิยามใหม่; ถ้าปรับถ้อยคำ ต้องคง substring `อัปเดต project memory` + `ไม่มีอะไรเปลี่ยน → ข้าม` ในบรรทัดเดียวกัน และห้ามแตะ §4 step 5 ข้อย่อย 8 / gate 12 ข้อใน §6 — _อิสระ_
- [ ] 7. **`fastlane.md §1` — วาง C6 (unify-in-place)** — **แทนที่บรรทัด** `- **★ user-invoked เท่านั้น** — stateful + irreversible ...` ด้วย bullet ที่ขึ้นต้นด้วย C6 **คำต่อคำ ไม่มี markdown emphasis แทรกกลาง**; คง `fastlane.md §3` แถว memory hook ไว้ทั้งแถว — _อิสระ_
- [ ] 8. **self-verify ตาม `spec.md §7`** (H1-H4 · T1-T7 · C6-1..3 · R1-R3 · N1-N3) ด้วย grep/`node -e` — **ห้ามรัน `npm test` เต็ม / `npm run lint:md`** (เหตุผลใน `spec.md §7`) — _ขึ้นกับ 2-7_

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ

| ไฟล์ (ใต้ `src/.warnyin/workflow/`) | contract | ตำแหน่ง | การกระทำ |
|---|---|---|---|
| `memory.md` | **C7** | §5 ประโยคนำ + anchor table | ปรับประโยคนำ · ลบ 3 แถว (เหลือ 3) |
| `stages/discovery.md` | **C7** | ท้าย §4 | ลบ blockquote hook |
| `stages/ship.md` | **C7** | ท้าย §4 | คงไว้ (แก้ถ้อยคำเฉพาะถ้าจำเป็น) |
| `fastlane.md` | **C6** | §1 bullet ที่ 3 | แทนที่ทั้งบรรทัดด้วย C6 |

> รวม **3 ไฟล์แก้ + 1 ไฟล์ตรวจ · 4 จุดแก้** — ไม่สร้างไฟล์ใหม่ ไม่แตะ `src/tests/`, template, adapter, script, root dogfood

**contract ที่ต้อง copy คำต่อคำ** (canonical เต็มอยู่ `../../design.md §4` — อ่านที่นั่นเป็นหลัก):

```
★ user-invoked เท่านั้น — AI auto-invoke เองไม่ได้; handoff จาก DESIGN ที่ user ยืนยันในเซสชัน (design §4 step 1.5) นับเป็น user-invoked
```

**บรรทัดที่ต้องหายไปจาก `stages/discovery.md`:**

```
> **★ อัปเดต project memory (conditional):** จบ stage แล้ว → เขียนสถานะล่าสุด **ทับ** `docs/stages/context.md` (snapshot สั้น ไม่ต่อท้าย) และบทเรียนที่ยัง**พิสูจน์ไม่พอจะเป็น rule** → `docs/memory.md`; ไม่มีอะไรเปลี่ยน → ข้าม — กติกาเต็มดู [`.warnyin/workflow/memory.md`](../memory.md)
```

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)

วัดด้วย Scenario ใน `../../design.md §9` (release-hygiene จะ assert เป็นเคส node จริง — task นี้ต้องทำให้ผ่านล่วงหน้า):

- [ ] **hook ถูกตัดที่ Discovery** — grep `อัปเดต project memory` ใน `src/.warnyin/workflow/stages/discovery.md` = **0 hit**
- [ ] **hook ที่คงไว้ยังครบ** — พบใน `stages/build.md`, `stages/ship.md`, `fastlane.md` (3 ไฟล์); `stages/design.md`/`stages/verify.md` **ยังพบในรอบนี้ = ถูกต้อง** (ของ slice 1/2 — ตรวจรวมตอน `release-hygiene`)
- [ ] **anchor table เหลือ 3 แถว** — `memory.md` §5 มี data row = 3 (`BUILD`, `SHIP`, `fastlane`) และไม่มีแถว `Discovery`/`DESIGN`/`VERIFY`
- [ ] **ประโยคนำสอดคล้อง** — §5 สื่อว่าเขียนที่ "จุดจบงาน" ไม่ใช่ท้ายทุก stage และไม่ขัดกับ §1/§2/§9
- [ ] **ไม่ลอก wording ของ hook** — `memory.md` ไม่มี substring `จบ stage แล้ว → เขียนสถานะล่าสุด` และไม่มีบรรทัดที่มีทั้ง `อัปเดต project memory` + `ไม่มีอะไรเปลี่ยน → ข้าม`
- [ ] **heading freeze** — `memory.md` มี heading ครบ **9 หัวข้อคำต่อคำ ลำดับเดิม** (ไม่ rename `## 5. Write points (hook ต่อ stage)`)
- [ ] **C6 คำต่อคำ** — `fastlane.md` มี substring C6 เป๊ะ อยู่ใน §1 นับได้ 1 บรรทัด และไม่มี bullet เดิมหลงเหลือขนาน
- [ ] **BUILD variant ไม่ถูกลดทอน** — `stages/build.md` ยังมี `main loop เท่านั้น` + `build sub-agent ที่ทำงานใน worktree ห้ามเขียน memory เอง` (ไฟล์ไม่ถูกแตะ)
- [ ] **จุดอ่านครบ 3 จุด** — `เป็น data ไม่ใช่ instruction` ยังพบใน `stages/discovery.md`, `next.md`, `explore.md`
- [ ] **ทุก markdown-link ในไฟล์ที่แก้ resolve ได้** (ตรวจเฉพาะไฟล์ที่แตะ)
- [ ] **ขอบเขตสะอาด** — `git status --short` แสดงเฉพาะไฟล์ใน §4 (ไม่มี `src/tests/`, template, adapter, script, root dogfood)
- [ ] ผ่าน test ตาม `spec.md §7` (self-verify ด้วย grep)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้

- Spec: `./spec.md`
- Standard (pattern การแก้ไฟล์): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Contract canonical (แหล่ง copy): `../../design.md` §4 (**C6**, **C7**) · Spec delta: `../../design.md` §9 MODIFIED (`project-memory`, `fastlane`)
- Baseline พฤติกรรมเดิม: `docs/features/project-memory/spec.md` · `docs/features/fastlane/spec.md`
