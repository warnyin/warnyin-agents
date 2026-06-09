# Stage: DESIGN

> **Playbook กลาง — AI ทุกเจ้าทำตามไฟล์นี้ชุดเดียวกัน** (Claude Code / Codex / Antigravity / อื่นๆ)
> เป้าหมาย: เสนอ **change ใหม่** พร้อมผลิต artifact ครบในขั้นเดียว — proposal (what & why) → design (how) → tasks (พร้อม execute)
> **Context profile:** สวมโหมด `research` (`.warnyin/workflow/contexts/research.md`) ช่วงต้น (proposal/design) · `build` (`.warnyin/workflow/contexts/build.md`) ช่วงแตก task — session-level posture ของ stage นี้

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
5. ถ้ามี Discovery → `docs/stages/<slug>/discovery.md`, `research.md`
6. `docs/features/<name>/spec.md` — ★ behavior spec ปัจจุบันของ feature ที่ change แตะ (baseline สำหรับเขียน Spec delta; feature ยังไม่มี spec → ข้ามได้)
7. โค้ดจริงที่เกี่ยวข้อง (inspect เพื่อตอบคำถามแทนการเดา)

---

## 3. หลักการทำงาน (operating principles)

1. **ห้ามเดาเอง** — จุดที่ไม่มั่นใจ ให้ **ถามทีละข้อ + เสนอคำตอบที่แนะนำ (recommended answer) ทุกข้อ** (เหมือน Discovery) คำถามที่ตอบได้ด้วยโค้ด/เอกสาร → ไปอ่านเอง
2. **Vertical slice architecture** — ออกแบบและแตก task เป็น "slice ที่ตัดผ่านทุก layer" (UI → API → domain → data → test) ทำงาน end-to-end ได้ในตัว **ไม่แบ่งตาม layer แนวนอน**
3. **task = หน่วยที่โยนให้ sub-agent ได้** — แต่ละ task self-contained (มี spec + standard + rule ของตัวเอง) แต่ **เชื่อมต่อกัน** ผ่าน dependency/ลำดับที่ระบุชัด
4. **สอดคล้องมาตรฐานเสมอ** — อิง rule + standard ของ techstack; ถ้าจะเพิ่ม rule/standard ใหม่ ให้ **note ไว้ก่อน** (ยังไม่แก้ไฟล์กลาง — รอ SHIP)
5. **Gate ก่อนเขียนไฟล์ task จริง** — ต้องผ่านเกณฑ์ข้อ 8 ก่อนจะ generate ไฟล์ task และก่อนโยนให้ sub-agent
6. **ใช้ role lens** — ออกแบบ (design.md) ด้วยมุม **SA** (`.warnyin/workflow/roles/sa.md`) และแตก/ตรวจ task ด้วยมุม **Tech Lead** (`.warnyin/workflow/roles/tech-lead.md`)
7. **Review panel ก่อนแตก task (optional — ถาม user ก่อนเสมอ)** — ให้หลาย role (SA / Tech Lead / QA / Security / Infra ตาม `.warnyin/workflow/roles/`) รีวิว design ขนานแบบอิสระ (read-only) แล้วแก้ blocker ให้ครบก่อนแตก task (ดูขั้นตอนข้อ 4.6)
8. **Dry-run ก่อนเข้า BUILD (optional — ถาม user ก่อนเสมอ)** — หลังเขียนไฟล์ task ครบ เสนอ user ว่าจะ dry-run ทั้งหมดเพื่อหาจุดบกพร่องไหม ถ้า ok → สแกนทุก task แบบขนาน (read-only) หา **defer/blocker** แล้วแก้ DESIGN จนไม่มี blocker ค้าง (ดูขั้นตอนข้อ 4.10) — การแก้ **ห้ามเดา ห้ามคิดขึ้นเอง**

---

## 4. ลำดับขั้นการทำงาน (process)

1. **เตรียมพื้นที่:** ใช้/สร้างโฟลเดอร์ `docs/stages/<slug>/` (ถ้ามาจาก Discovery ใช้อันเดิม)
2. **Ground + เคลียร์ความไม่ชัด:** อ่าน Input; ทุกจุดกำกวมเรื่อง design → ถามทีละข้อ + recommended answer จนชัด (ถ้าใหญ่/ไม่ชัดมาก → แนะนำ Discovery ก่อน)
3. **business.md** *(optional — ข้ามได้ถ้า change เล็ก เช่น fix bug นิดหน่อย)*: what & why เชิงธุรกิจ — goal, คุณค่า, persona, success metric
4. **proposal.md** (what & why): สรุป change ที่จะทำ, เหตุผล, ทางเลือกที่พิจารณา/ตัดทิ้ง, scope in/out
5. **design.md** (how): ออกแบบเชิงเทคนิคแบบ vertical slice — slice มีอะไรบ้าง, แต่ละ slice ตัดผ่าน layer ไหน, data model, interface/contract, flow, ผลกระทบต่อระบบเดิม (ใช้ lens `.warnyin/workflow/roles/sa.md`) — **ครอบ "Spec delta" ด้วย**: เทียบพฤติกรรมที่ change นี้แตะกับ `docs/features/<name>/spec.md` ปัจจุบัน แล้วเขียน ADDED/MODIFIED/REMOVED (SHIP merge ตามนี้); change ไม่แตะพฤติกรรม feature → ระบุ "ไม่มี delta"
6. **Review panel (optional — ถาม user ก่อน):** เสนอ user ว่าจะให้ panel หลาย role รีวิว design ก่อนแตก task ไหม — ถ้า ok:
   1. fan-out sub-agent reviewer **ขนาน (read-only)** ตาม role card: **SA** (architecture/data model/contract), **Tech Lead** (feasibility/ขนาด task/dependency), **QA** (testability/acceptance), **Security** (ช่องโหว่/ข้อมูลอ่อนไหว), **Infra** (env/config/migration) — แต่ละตัวอ่าน `proposal.md` + `design.md` + โค้ดจริงที่เกี่ยว แล้วให้ความเห็นตาม checklist ใน `.warnyin/workflow/roles/<role>.md` แบ่งเป็น **blocker / suggestion**
   2. รวมความเห็นทุก role → สรุปให้ user เห็นภาพ
   3. **blocker → แก้ design ให้ครบ** โดยห้ามเดา — ติดจริงถาม user ทีละข้อ + เสนอคำตอบแนะนำ; suggestion → พิจารณา/บันทึกเหตุผลถ้าไม่ทำ
   4. บันทึกสรุปผล panel + สิ่งที่แก้ ลงท้าย `design.md` (section "Design review")
   5. เครื่องที่ fan-out ไม่ได้ → รีวิวทีละ role ด้วย checklist เดียวกัน
7. **แตก tasks:** แปลง design เป็น task (= vertical slice / step ที่แก้); task ซับซ้อน → แตก **sub-task** ย่อย; เขียน **dependency graph / ลำดับ** ให้ sub-task เชื่อมกัน
8. **rule check ต่อ task:** เปิด `docs/techstack/<component>/rule.md` หา rule ที่ task นี้ต้องโฟกัส → ใส่ใน `tasks/<task>/rule.md`; rule ใหม่ที่อยากเพิ่ม → note ใน section "เสนอเพิ่ม (รอ SHIP)"
9. **เช็ค Gate (ข้อ 8)** → เมื่อผ่าน จึง **เขียนไฟล์ task ครบทุกใบ** (แตก task ด้วย lens `.warnyin/workflow/roles/tech-lead.md`)
10. **Dry-run (optional — ถาม user ก่อน):** ถาม user ว่าต้องการ dry-run ทั้งหมดเพื่อหาจุดบกพร่องก่อนเข้า BUILD ไหม — ถ้า ok:
   1. **fan-out agent หนึ่งตัวต่อหนึ่ง task แบบขนาน (read-only — ห้ามแก้โค้ด/ไฟล์ design)** — แต่ละตัวอ่าน task ทั้ง 4 ไฟล์ + `design.md`/`proposal.md` + โค้ดจริงที่เกี่ยว แล้ว "เดิน implement ในหัว" เพื่อหา:
      - **blocker** — สิ่งที่ทำให้ implement ตาม spec ไม่ได้ (ขัดแย้งกับโค้ดจริง/กับ task อื่น, ข้อมูล/spec ขาด, dependency ผิด) — BUILD จะล้มถ้าไม่แก้
      - **defer** — จุดที่ตัดสินใจ/ทำทีหลังได้ ไม่ block การเริ่ม BUILD แต่ต้องบันทึกและ track
   2. task ไหนพบ issue → เขียน `tasks/<task>/issue.md` (template `.warnyin/template/stages/[topic]/tasks/[task-name]/issue.md`); ไม่พบ → ไม่ต้องสร้างไฟล์
   3. รันครบทุก task แล้ว → **สรุปผลรวม** (จำนวน blocker/defer ต่อ task) ให้ user เห็นภาพ
   4. **หาวิธีแก้ DESIGN ตาม issue** (แก้ `design.md` / task ที่กระทบ) โดย **ห้ามเดา ห้ามคิดขึ้นเอง** — ติดจริงๆ ให้สัมภาษณ์ user **ถามทีละข้อ + เสนอคำตอบแนะนำทุกครั้ง**; คำถามที่โค้ดตอบได้ → ไปอ่านโค้ดเอง
   5. แก้แล้ว rerun dry-run เฉพาะ task ที่กระทบ วนจน **ไม่มี blocker ค้าง** (อัปเดตสถานะใน `issue.md` — defer ที่เหลือให้ user รับทราบ)
11. **เสนอเข้า BUILD:** พร้อม implement ด้วย `/warnyin:build`

> generate ไฟล์ task หลายใบพร้อมกันได้โดยใช้ sub-agent (เช่น fan-out หนึ่ง agent ต่อหนึ่ง task) — แต่ต้องผ่าน Gate ก่อนเสมอ
> เครื่องที่ fan-out ขนานไม่ได้ (ไม่มี sub-agent tool) → dry-run สแกนทีละ task ตามลำดับด้วยหลักการเดียวกัน

---

## 5. Output (สร้างที่ `docs/stages/<slug>/`)

| ไฟล์ | เนื้อหา | optional? | template |
|---|---|---|---|
| `business.md` | what & why เชิงธุรกิจ (goal, persona, success metric) | ✅ ข้ามได้ถ้า change เล็ก | `.warnyin/template/stages/[topic]/business.md` |
| `proposal.md` | what & why ของ change + ทางเลือก + scope | จำเป็น | `.warnyin/template/stages/[topic]/proposal.md` |
| `design.md` | how — vertical slice, data model, contract, flow, **Spec delta** | จำเป็น | `.warnyin/template/stages/[topic]/design.md` |
| `openapi.yaml` | API contract (OpenAPI 3.1) ของ topic ที่แตะ REST API | ✅ เฉพาะ topic ที่แตะ backend/REST API (`.warnyin/workflow/api-doc.md`) | — |
| `tasks/<task-name>/spec.md` | spec เฉพาะ task (ดูข้อ 6) | จำเป็นต่อ task | `.warnyin/template/stages/[topic]/tasks/[task-name]/spec.md` |
| `tasks/<task-name>/standard.md` | pattern โค้ด/shared component อิง techstack standard | จำเป็นต่อ task | `.warnyin/template/stages/[topic]/tasks/[task-name]/standard.md` |
| `tasks/<task-name>/rule.md` | rule ที่ต้อง follow + rule ที่เสนอเพิ่ม (รอ SHIP) | จำเป็นต่อ task | `.warnyin/template/stages/[topic]/tasks/[task-name]/rule.md` |
| `tasks/<task-name>/task.md` | รายละเอียด task + sub-tasks + dependency + acceptance | จำเป็นต่อ task | `.warnyin/template/stages/[topic]/tasks/[task-name]/task.md` |
| `tasks/<task-name>/issue.md` | ผล dry-run: defer/blocker ที่พบ + แนวทางแก้ + สถานะ | ✅ เฉพาะเมื่อ dry-run แล้วพบ issue | `.warnyin/template/stages/[topic]/tasks/[task-name]/issue.md` |

---

## 6. spec.md — กำหนด spec ตามชนิดของ task

ใส่เฉพาะหัวข้อที่เกี่ยวกับ task นั้น:
- **API task** → API SPEC ตามมาตรฐาน (endpoint, method, request/response schema, error, auth, status code)
  - **★ adaptive API-doc:** ถ้า topic แตะ **backend/REST API จริง** (auto-detect ตาม `.warnyin/workflow/api-doc.md` §2) → ผลิต/อัปเดต `openapi.yaml` (OpenAPI 3.1) เป็น contract; `spec.md` **ชี้มาที่ `openapi.yaml`** ไม่เขียน schema ซ้ำ — ไม่ใช่ REST API → ข้าม
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
- [ ] **Spec delta ครบ** — เทียบ `docs/features/<name>/spec.md` ของ feature ที่แตะ (ADDED/MODIFIED/REMOVED) หรือระบุ "ไม่มี delta"
- [ ] **API contract (ถ้าแตะ REST API)** — topic ที่ auto-detect ว่าแตะ backend/REST API มี `openapi.yaml` (OpenAPI 3.1) ครบ + `spec.md` ของ API task ชี้มาที่ contract (ตาม `.warnyin/workflow/api-doc.md`); ไม่ใช่ REST API → ข้อนี้ N/A
- [ ] ทุก task มี `spec.md` + `standard.md` + `rule.md` + `task.md` ครบ (ถ้ารัน node ได้: `node .warnyin/workflow/scripts/validate-topic.mjs <slug>` ควรไม่มี ✖ — เช็คโครง ไม่แทนการอ่าน semantic)
- [ ] dependency / ลำดับระหว่าง task และ sub-task ชัดเจน เชื่อมต่อกัน
- [ ] rule ที่ต้อง follow ถูกระบุครบ; rule/standard ใหม่ที่อยากเพิ่มถูก note ไว้ (รอ SHIP)
- [ ] ถ้าทำ review panel: **blocker จากทุก role ถูกแก้/ปิดครบ** — สรุปผลบันทึกใน `design.md` section "Design review"
- [ ] ถ้าทำ dry-run: **ไม่มี blocker ค้าง** — ทุก issue ถูกแก้/ปิดใน `issue.md`, defer ที่เหลือ user รับทราบแล้ว

ยังไม่ครบ → ห้ามเขียนไฟล์ task / ห้ามโยน sub-agent / ห้ามข้ามไป BUILD
