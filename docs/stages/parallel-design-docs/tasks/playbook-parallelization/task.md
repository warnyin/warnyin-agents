# Task — playbook-parallelization

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> หน่วยที่ **โยนให้ sub-agent ทำใน BUILD ได้** — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `playbook-parallelization` |
| **Slice อ้างอิง** | `design.md` slice #1 |
| **Component** | `installer` (workflow payload — `src/.warnyin/workflow/`) |
| **Model tier** | `deepest` _(guidance ละเอียดอ่อน: tool-agnostic vocab + fallback ครบ + ห้าม break cross-ref/หลักการเดิม — งานคิดหนัก)_ |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
แก้ playbook กลาง `src/.warnyin/workflow/stages/design.md` ให้มี guidance parallelization ครบ 3 capability (C1 grounding · C2 task-fanout-default · C3 narrative-guardrail) + หลักการแกน 1 ข้อใน §3 — เมื่อ AI อ่าน playbook นี้ DESIGN run จะ parallelize งานที่ independent ได้จริง และมี fallback ครบทุกจุด (tool-agnostic) — **end-to-end:** อ่าน playbook → ทำตาม → เร็วขึ้นจริง โดย correctness floor (Gate §8) ไม่ลด

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: ไม่มี (wave 1)
- ปลดล็อกให้: ไม่มี (T2 ขนานได้ผ่าน contract-first — อ้าง `design.md §3` behavior contract ไม่ใช่ text จริงของ task นี้)
- ส่ง output อะไรต่อ: พฤติกรรมตาม behavior contract `design.md §3` (C1/C2/C3/C-common) — T2 อ้าง contract เดียวกัน

## 3. Sub-tasks (แตกย่อยถ้าซับซ้อน)
- [ ] 1. **§3 หลักการแกน** — เพิ่ม 1 principle "Parallelize gathering, serialize judgment/narrative" (เนื้อหา `design.md §1`/C-common) — ขยายในที่เดิม ผูกกับ §3 ข้อ 2 (DAG-width) + ข้อ 7 (panel fan-out), ไม่สร้างข้อขนานซ้ำซ้อน _ผลลัพธ์:_ กรอบรวมของ C1/C2/C3
- [ ] 2. **C1 — §4 step 2 "Ground"** — เพิ่ม guidance parallel grounding (fan-out read-only ต่อโดเมน → summary+path, main loop สังเคราะห์+ถาม user เอง) + fallback _ขึ้นกับ 1_
- [ ] 3. **C3 — §4 step 5 (design.md narrative)** — เพิ่ม research-fan-out + **single-writer guardrail** (ห้ามแตก narrative ให้หลาย agent) + fallback _ขึ้นกับ 1_
- [ ] 4. **C2 — §4 step 9 + line 79 + §7 tier table** — ยก task-file fan-out เป็น **default** สำหรับ standard/large (หลังผ่าน Gate §8), ระบุ "ไม่ต้อง worktree (task คนละโฟลเดอร์)" + main loop review coherence + fallback; ปรับ line 79 จาก "ทำได้" → "default (standard/large)"; เพิ่มในแถว §7 standard/large
- [ ] 5. **self-consistency pass** — ตรวจ cross-ref/เลข step/anchor ในไฟล์ตรงหลังแก้, ไม่ขัด §3 ข้อ 2/7/8 + Gate §8, ไม่มีชื่อรุ่น (tool-agnostic)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **แก้:** `src/.warnyin/workflow/stages/design.md` (canonical — **ห้ามแตะ root `.warnyin/`** ที่ gitignored; rule.md §6)
- **ไม่แตะ:** adapter command, CHANGELOG (= T2), `validate-topic.mjs`, template

## 5. Acceptance criteria (เกณฑ์ว่า task เสร็จ)
- [ ] §3 มี principle แกนใหม่ (กรอบรวม C1/C2/C3) — ขยายในที่เดิม ไม่ duplicate ของเดิม
- [ ] C1/C2/C3 ปรากฏใน §4 step 2/5/9 (+ line 79 + §7) **ตรง behavior contract `design.md §3`**
- [ ] **fallback "fan-out ไม่ได้ → ทำตามลำดับเหมือนเดิม" ครบทั้ง C1/C2/C3** (tool-agnostic)
- [ ] **Gate §8 ไม่ถูกลด** — C2 ระบุชัด "ผ่าน Gate ก่อน fan-out"
- [ ] ไม่มีชื่อรุ่น/ผลิตภัณฑ์ (vocab generic; rule.md §1 payload-guidance ต้อง generic)
- [ ] cross-ref ในไฟล์ resolve (เลข step/§/anchor ตรงหลังแก้) — ผ่าน `node src/scripts/lint-md.mjs` (dead-link) ของ component นั้น
- [ ] ผ่าน test ตาม `spec.md` (test-flow)
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md`
- Standard (pattern โค้ด): `./standard.md`
- Rule ที่ต้อง follow: `./rule.md`
