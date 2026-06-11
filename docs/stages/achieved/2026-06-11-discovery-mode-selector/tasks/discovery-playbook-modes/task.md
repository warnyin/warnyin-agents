# Task — discovery-playbook-modes

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `discovery-playbook-modes` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (payload playbook) |
| **Model tier** | `deepest` _(เขียน behavior 4 mode + debate orchestration + auto-suggest — logic หนัก, pattern ใหม่)_ |
| **สถานะ** | `รอ build` _(amend: build รอบ 1 ครบ 4 mode; รอ build รอบ 2 = +mode 5 ไต่สวน)_ |

## 1. เป้าหมายของ task (vertical slice)
> เพิ่ม section canonical **"Discovery modes (ความเข้มของ Discovery)"** ใน playbook `src/.warnyin/workflow/stages/discovery.md` ให้ AI อ่านแล้วเดิน Discovery ได้ครบ 4 mode (`ไว/สมดุล/ละเอียด/โต้วาที`) + auto-suggest + debate — end-to-end จาก playbook เดียว

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: _(ไม่มี)_ — พึ่ง **mode taxonomy contract `design.md §4`** (ชื่อ mode + section anchor) ที่ fix แล้ว ไม่ใช่ runtime ของ task อื่น
- ปลดล็อกให้: `discovery-command-adapter` พึ่ง contract เดียวกัน → **ขนานได้** (file-ownership disjoint); VERIFY เดินทุก mode
- ส่ง output: section anchor "Discovery modes (ความเข้มของ Discovery)" (Task B ชี้มา) — ตรง `design.md §4.2`

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
- [ ] 1. เพิ่ม section "Discovery modes" — taxonomy **5 ค่า** + **behavior contract ต่อ mode** (`design.md §4.3`) + **ตารางเทียบ 3 แกน** (mode ≠ tier ≠ context-profile, `design.md §6` note) — _ผลลัพธ์:_ canonical taxonomy
- [ ] 2. auto-suggest layer (`design.md §4.4` + §4.4.1 precedence + 5 เคส fixture) — _ขึ้นกับ 1:_ อ้าง mode names
- [ ] 3. **debate orchestration** (`design.md §5.2`): fan-out persona (Agent tool, read-only, artifact-level context) + skeptic บังคับ + converge ≤2 รอบ + synthesize (judgment ไม่ delegate) + fallback (เต็ม/partial/skeptic-หาย) + hard cap ≤4/≤2 + decision-log scrub + sensitivity warning — _ขึ้นกับ 1:_ โต้วาที = 1 ใน 4 mode
- [ ] 4. grill fold — แปลง section "ซักถามฉันหน่อย (grill mode)" เดิม (playbook §3) เป็น **alias ของ ละเอียด** (ไม่เหลือ behavior grill ซ้ำแยก) — _ขึ้นกับ 1:_ ละเอียด นิยามก่อน
- [ ] 5. wire จุดแทรก — operating principles/process loop เดิมอ้าง mode (mode = dial ปรับพารามิเตอร์ ไม่ใช่ flow ใหม่) — additive คงโครงเดิม
- [ ] 6. **ไต่สวน orchestration** (`design.md §5.3`): Blue/Red iterative — Blue discovery+research→`blue-memory.md`; Red fan-out role audit ครบ 5 มุม→`debate-round-NN.md`+`red-memory.md`; grill user ทุก finding; Blue update→ถาม user รอบต่อ; converge 0 finding/user หยุด; memory ที่ `docs/stages/<slug>/debate/`; explicit-only (auto-suggest ไม่แนะ); fallback degrade→ละเอียด — _ขึ้นกับ 1:_ ไต่สวน = mode 5

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **owns:** `src/.warnyin/workflow/stages/discovery.md` (เท่านั้น)
- **ห้ามแตะ:** command, README (Task B owns), playbook stage อื่น, `cli.mjs`

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] section "Discovery modes" ครบ: taxonomy **5** + behavior contract + ตารางเทียบ 3 แกน + auto-suggest precedence + 5 fixture + debate flow + **ไต่สวน flow (Blue/Red iterative + memory)** + fallback + hard cap
- [ ] ไต่สวน: Blue/Red iterative + memory artifact (`debate/{blue-memory,red-memory,debate-round-NN}.md`) + grill ทุก finding + ถาม user ก่อนรอบใหม่ + converge + explicit-only
- [ ] grill เดิม fold เข้า ละเอียด — grep ไม่เหลือ section grill แยก ("ซักถามฉันหน่อย"/"grill me" → ละเอียด)
- [ ] observable proxy ต่อ mode (`design.md §8.1`) ชัดพอ verify นับได้
- [ ] ไม่มี behavior duplicate (canonical single-source)
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
