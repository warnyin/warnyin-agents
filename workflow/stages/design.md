# Stage: DESIGN

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: เสนอ **change ใหม่** พร้อมผลิต artifact ครบในขั้นเดียว — proposal (what & why) → design (how) → tasks (พร้อม execute)

---

## 1. DESIGN คืออะไร / ใช้เมื่อไหร่

ใช้เมื่อ user อยากอธิบายสิ่งที่จะสร้าง/แก้แบบเร็วๆ แล้วได้ **ข้อเสนอที่สมบูรณ์** — มีทั้งการออกแบบ, spec, และ task ที่พร้อมลงมือทำ
ครอบคลุม: build change, fix bug, แก้อะไรก็ตามที่เกี่ยวกับ **code / docs**

- **ถ้าเป็นคำถาม หรือยังไม่มั่นใจเรื่อง design → แนะนำให้ใช้ `/warnyin:discovery` ก่อน** แล้วค่อยกลับมา DESIGN
- ปรับความละเอียด artifact ตามขนาด change (ดูข้อ 7)

---

## 2. Input ที่ต้องอ่านก่อนเริ่ม

1. `docs/project.md` — เป้าหมาย/ขอบเขตโปรเจกต์
2. `docs/rule.md` + `docs/techstack/<component>/rule.md` — ★ กฎที่ต้อง follow
3. `docs/techstack/<component>/standard.md` — ★ pattern/มาตรฐานการเขียนโค้ด
4. `docs/techstack/<component>/{about,structure,test}.md`, `docs/codemap/index.md` — โครงสร้าง/วิธีเทสต์
5. ถ้ามี Discovery → `warnyin-stages/<slug>/discovery.md`, `research.md`
6. โค้ดจริงที่เกี่ยวข้อง (inspect เพื่อตอบคำถามแทนการเดา)

---

## 3. หลักการทำงาน (operating principles)

1. **ห้ามเดาเอง** — จุดที่ไม่มั่นใจ ให้ **ถามทีละข้อ + เสนอคำตอบที่แนะนำ (recommended answer) ทุกข้อ** (เหมือน Discovery) คำถามที่ตอบได้ด้วยโค้ด/เอกสาร → ไปอ่านเอง
2. **Vertical slice architecture** — ออกแบบและแตก task เป็น "slice ที่ตัดผ่านทุก layer" (UI → API → domain → data → test) ทำงาน end-to-end ได้ในตัว **ไม่แบ่งตาม layer แนวนอน**
3. **task = หน่วยที่โยนให้ sub-agent ได้** — แต่ละ task self-contained (มี spec + standard + rule ของตัวเอง) แต่ **เชื่อมต่อกัน** ผ่าน dependency/ลำดับที่ระบุชัด
4. **สอดคล้องมาตรฐานเสมอ** — อิง rule + standard ของ techstack; ถ้าจะเพิ่ม rule/standard ใหม่ ให้ **note ไว้ก่อน** (ยังไม่แก้ไฟล์กลาง — รอ SHIP)
5. **Gate ก่อนเขียนไฟล์ task จริง** — ต้องผ่านเกณฑ์ข้อ 8 ก่อนจะ generate ไฟล์ task และก่อนโยนให้ sub-agent

---

## 4. ลำดับขั้นการทำงาน (process)

1. **เตรียมพื้นที่:** ใช้/สร้างโฟลเดอร์ `warnyin-stages/<slug>/` (ถ้ามาจาก Discovery ใช้อันเดิม)
2. **Ground + เคลียร์ความไม่ชัด:** อ่าน Input; ทุกจุดกำกวมเรื่อง design → ถามทีละข้อ + recommended answer จนชัด (ถ้าใหญ่/ไม่ชัดมาก → แนะนำ Discovery ก่อน)
3. **business.md** *(optional — ข้ามได้ถ้า change เล็ก เช่น fix bug นิดหน่อย)*: what & why เชิงธุรกิจ — goal, คุณค่า, persona, success metric
4. **proposal.md** (what & why): สรุป change ที่จะทำ, เหตุผล, ทางเลือกที่พิจารณา/ตัดทิ้ง, scope in/out
5. **design.md** (how): ออกแบบเชิงเทคนิคแบบ vertical slice — slice มีอะไรบ้าง, แต่ละ slice ตัดผ่าน layer ไหน, data model, interface/contract, flow, ผลกระทบต่อระบบเดิม
6. **แตก tasks:** แปลง design เป็น task (= vertical slice / step ที่แก้); task ซับซ้อน → แตก **sub-task** ย่อย; เขียน **dependency graph / ลำดับ** ให้ sub-task เชื่อมกัน
7. **rule check ต่อ task:** เปิด `docs/techstack/<component>/rule.md` หา rule ที่ task นี้ต้องโฟกัส → ใส่ใน `tasks/<task>/rule.md`; rule ใหม่ที่อยากเพิ่ม → note ใน section "เสนอเพิ่ม (รอ SHIP)"
8. **เช็ค Gate (ข้อ 8)** → เมื่อผ่าน จึง **เขียนไฟล์ task ครบทุกใบ** แล้วเสนอ: พร้อม implement ด้วย `/warnyin:build`

> generate ไฟล์ task หลายใบพร้อมกันได้โดยใช้ sub-agent (เช่น fan-out หนึ่ง agent ต่อหนึ่ง task) — แต่ต้องผ่าน Gate ก่อนเสมอ

---

## 5. Output (สร้างที่ `warnyin-stages/<slug>/`)

| ไฟล์ | เนื้อหา | optional? | template |
|---|---|---|---|
| `business.md` | what & why เชิงธุรกิจ (goal, persona, success metric) | ✅ ข้ามได้ถ้า change เล็ก | `[topic]/business.md` |
| `proposal.md` | what & why ของ change + ทางเลือก + scope | จำเป็น | `[topic]/proposal.md` |
| `design.md` | how — vertical slice, data model, contract, flow | จำเป็น | `[topic]/design.md` |
| `tasks/<task-name>/spec.md` | spec เฉพาะ task (ดูข้อ 6) | จำเป็นต่อ task | `[topic]/tasks/[task-name]/spec.md` |
| `tasks/<task-name>/standard.md` | pattern โค้ด/shared component อิง techstack standard | จำเป็นต่อ task | `[topic]/tasks/[task-name]/standard.md` |
| `tasks/<task-name>/rule.md` | rule ที่ต้อง follow + rule ที่เสนอเพิ่ม (รอ SHIP) | จำเป็นต่อ task | `[topic]/tasks/[task-name]/rule.md` |
| `tasks/<task-name>/task.md` | รายละเอียด task + sub-tasks + dependency + acceptance | จำเป็นต่อ task | `[topic]/tasks/[task-name]/task.md` |

---

## 6. spec.md — กำหนด spec ตามชนิดของ task

ใส่เฉพาะหัวข้อที่เกี่ยวกับ task นั้น:
- **API task** → API SPEC ตามมาตรฐาน (endpoint, method, request/response schema, error, auth, status code)
- **UX/UI task** → UXUI SPEC (wireframe หรือ figma ref ถ้ามี), states, responsive
- **data-flow** — ข้อมูลไหลจากไหนไปไหน
- **user-flow** — ผู้ใช้เดินผ่านขั้นตอนไหน
- **persona** — ทำเพื่อใคร
- **test-flow** — จะทดสอบ/ยืนยันความถูกต้องยังไง

## 7. ปรับความละเอียดตามขนาด change

- **เล็ก** (fix bug นิดหน่อย): ข้าม `business.md`, `proposal.md`/`design.md` แบบสั้น, 1 task ก็พอ
- **กลาง/ใหญ่**: ครบทุก artifact, แตก vertical slice หลาย task + sub-task, dependency ชัด

---

## 8. Gate → เข้า BUILD (`/warnyin:build`) ได้เมื่อ

- [ ] proposal.md (+ business.md ถ้าจำเป็น) + design.md ครบ และ user เห็นชอบ
- [ ] **ไม่มีการเดา** — ทุกจุดที่ไม่ชัดถูกถาม (ทีละข้อ + recommended answer) และปิดแล้ว
- [ ] design เป็น vertical slice ชัด — แต่ละ task/slice ส่งมอบคุณค่า end-to-end ได้
- [ ] ทุก task มี `spec.md` + `standard.md` + `rule.md` + `task.md` ครบ
- [ ] dependency / ลำดับระหว่าง task และ sub-task ชัดเจน เชื่อมต่อกัน
- [ ] rule ที่ต้อง follow ถูกระบุครบ; rule/standard ใหม่ที่อยากเพิ่มถูก note ไว้ (รอ SHIP)

ยังไม่ครบ → ห้ามเขียนไฟล์ task / ห้ามโยน sub-agent / ห้ามข้ามไป BUILD
