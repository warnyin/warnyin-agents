# Task — design-stage-integration (T3)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `design-stage-integration` |
| **Slice อ้างอิง** | `design.md` slice #3 (DESIGN integration — wiring capability เข้า flow จริง) |
| **Component** | `installer` (payload markdown ใน `src/`) |
| **Model tier** | `deepest` _(judgment หนัก: แก้ playbook กลางที่ตัวเอง dogfood + anchor precision เป๊ะ + canonical-copy คำต่อคำ)_ |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
> task นี้ส่งมอบคุณค่า end-to-end อะไร

**Wiring UX wireframe capability เข้า DESIGN flow จริง** — เดิม T1 ผลิต role/agent (`roles/ux.md` + `warnyin-ux.md`), T2 ผลิต template (`wireframe.md`) แต่ playbook DESIGN **ยังไม่เรียกใช้**. T3 ทำให้ capability ถูก invoke ได้จริงตาม **stage-invoked capability convention** (`docs/rule.md` §1): playbook DESIGN ตรวจ (detect) ว่า change มี UI surface ไหม → ถ้าใช่ทำ step 4.5 UX wireframe (fan-out generator → approve gate) → gate item conditional ที่ §8 → ถ้าไม่ใช่ข้ามเงียบ (backward compatible). end-to-end = อ่าน playbook ที่แก้แล้ว แล้วเดิน flow ครบทั้ง 2 ขั้ว (FE require / backend N/A) ได้.

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- **ต้องทำหลัง:** `tasks/ux-role-and-agent` (T1) + `tasks/wireframe-template` (T2) — **chain แท้ ไม่ใช่ contract** (design.md §7): pointer/cross-reference ใน playbook ต้องอ้าง **ไฟล์จริง**ของ T1 (`src/.warnyin/workflow/roles/ux.md`) และ T2 (`src/.warnyin/template/stages/[topic]/wireframe.md`) — ต้องเห็น artifact จริงเพื่อให้ path/ชื่อ section ตรง (ไม่ใช่แค่ contract; verify pointer ตรงต้องเห็นของจริง)
- **ปลดล็อกให้:** — (T3 เป็น node สุดท้าย wave 2; ไม่มี task ตามหลัง)
- **ส่ง output อะไรต่อ:** playbook DESIGN ที่ invoke capability ได้จริง → พร้อม VERIFY (เดิน flow ทั้ง 2 ขั้ว) + SHIP (สร้าง feature `uxui-wireframe`)

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
> แก้ source 2 ไฟล์ตามลำดับ — ทุก wording copy จาก design.md §10 **คำต่อคำ ห้ามแต่งใหม่** (canonical-copy)

- [ ] 1. **`src/.warnyin/workflow/stages/design.md` — step 4.5 + detect block** — แทรก step 4.5 "UX wireframe" ใน §4 (process) ระหว่าง **step 4 (proposal) กับ step 5 (design.md how)** ตาม precedent **step 1.5 "Establish tier"** (flat numbering ใช้ .5 ได้); ใต้ step 4.5 วาง block "UX wireframe — detect". _wording:_ §10B (step) + §10A (detect). _ผลลัพธ์:_ step ใหม่ + detect/skip อยู่ใน playbook
- [ ] 2. **design.md §4 step 6 + §3 ข้อ 7 — panel note + clarity fix** — เติม note "UX = generator ไม่ใช่ reviewer" ใน **§4 step 6 (Review panel)** + **§3 ข้อ 7** (principle). _wording:_ §10D. _★ anchor:_ panel = **step 6 + §3 ข้อ 7** ไม่ใช่ "§4.6/§7" (ground truth — ดู rule.md ข้อ 1). _ขึ้นกับ 1:_ ต้องมี step 4.5 ก่อนเพื่อ note อ้างถึงได้
   - **★ clarity fix (dry-run BLOCKER-1 — ดู `./issue.md`):** ในขณะแตะ §3 ข้อ 7/8 — แก้ legacy pointer **format กำกวม** ให้ชัด: `(ดูขั้นตอนข้อ 4.6)` → `(ดู §4 step 6)` ที่ §3 ข้อ 7 · `(ดูขั้นตอนข้อ 4.10)` → `(ดู §4 step 10)` ที่ §3 ข้อ 8 — **เปลี่ยน format เท่านั้น ความหมายเดิม** (4.6 = §4 ข้อ 6, 4.10 = §4 ข้อ 10 ถูกอยู่แล้ว) เพื่อให้ panel note ใหม่ไม่ขัดสายตากับ pointer เดิม + กัน reader ตีความเป็น sub-step "4.6". **ห้ามแก้อย่างอื่นใน 2 ข้อนี้**
- [ ] 3. **design.md §3 ข้อ 6 — role lens** — **ขยายประโยคเดิม** "ออกแบบด้วยมุม SA ... แตก/ตรวจ task ด้วยมุม Tech Lead" ต่อท้ายด้วย wording §10C (เป็นการต่อประโยค **ไม่ใช่เพิ่ม list item**). _ผลลัพธ์:_ role lens ครอบ UX
- [ ] 4. **design.md §8 — gate item conditional** — เติม gate item ใหม่ (conditional/N-A) **วางติด API-contract gate item** (capability conditional gates = family เดียว). _wording:_ §10E. _ผลลัพธ์:_ gate enforce wireframe เฉพาะ change มี UI surface, backend → N/A
- [ ] 5. **`src/.warnyin/workflow/README.md` บรรทัด ~69** — enumerate agent list (`warnyin-{sa,tech-lead,qa,security,infra}`) เพิ่ม `ux` พร้อมระบุว่าเป็น **generator แยกจาก reviewer 5 ตัว** (ไม่ใช่ reviewer ที่ 6). _ขึ้นกับ:_ ไฟล์ `warnyin-ux.md` ของ T1 ต้องมีจริงก่อน

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- `src/.warnyin/workflow/stages/design.md` — §4 (step 4.5 + detect), §4 step 6 + §3 ข้อ 7 (panel note), §3 ข้อ 6 (role lens), §8 (gate item), **§3 ข้อ 7/8 legacy pointer format fix** (4.6→§4 step 6, 4.10→§4 step 10 — clarity เท่านั้น)
- `src/.warnyin/workflow/README.md` — บรรทัด ~69 (agent enumerate)
- **ห้ามแตะ:** root `.warnyin/`/`.claude/` (dogfood gitignored — แก้ที่ `src/` เท่านั้น, `docs/rule.md` §6); `roles/ux.md`/`warnyin-ux.md`/`wireframe.md` (เป็นของ T1/T2 — T3 อ้างถึง ไม่แก้)

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] `src/.warnyin/workflow/stages/design.md` มี **step 4.5 "UX wireframe"** แทรกระหว่าง step 4–5 + block "UX wireframe — detect" (มี "ไม่เข้าเงื่อนไข → ข้าม" ชัด); wording = §10B/§10A คำต่อคำ (diff ว่าง)
- [ ] **panel note** อยู่ที่ **§4 step 6 + §3 ข้อ 7** (anchor ตรง ground truth ไม่ใช่ §4.6/§7); **role lens** ขยายประโยค **§3 ข้อ 6** (ไม่ใช่ list); wording = §10D/§10C คำต่อคำ
- [ ] **gate item conditional** อยู่ใน **§8** ติด API-contract gate item; wording = §10E คำต่อคำ; ระบุ N/A สำหรับ change ไม่มี UI surface (backward compatible)
- [ ] `src/.warnyin/workflow/README.md` บรรทัด ~69 enumerate เพิ่ม `ux` (ระบุ generator แยก reviewer)
- [ ] **clarity fix (BLOCKER-1):** §3 ข้อ 7 = `(ดู §4 step 6)`, §3 ข้อ 8 = `(ดู §4 step 10)` — ไม่เหลือ format กำกวม "ข้อ 4.6/4.10"; ไม่แก้อย่างอื่นใน 2 ข้อ (diff scoped)
- [ ] **markdown-link ทุกตัว resolve** — `node src/scripts/lint-md.mjs` เขียว (gate นี้จับเฉพาะ markdown-link path; T3 เป็น task เดียวที่ enforce ได้)
- [ ] **anchor/canonical wording** ตรวจ structural + อิสระจากผู้เขียน (ไม่พึ่ง lint-md) — ดู `spec.md` §7 Test-flow
- [ ] **gate item 2 ขั้ว** ทดสอบได้ (positive: FE → require wireframe.md ครบ; negative: backend-only → N/A ไม่ block) — empirical demo (pattern change-sizing)
- [ ] **full-gate เขียว:** `node src/scripts/*` (test suite + verify-pack + lint-md) ผ่าน — ไม่มี regression
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
- Canonical wording (ต้นฉบับ copy): `../../design.md` §10A–§10F
- Anchor ground truth + B1/B2/B3: `../../design.md` §4 + §11
