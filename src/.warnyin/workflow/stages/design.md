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
   - **DAG-width toolkit (เทคนิคเสริม optional ลด serialization)** — คงนิยาม vertical slice เดิม (slice ตัดทุก layer end-to-end); toolkit เป็นเทคนิคเสริม เลือกตามเคส ไม่ใช่ข้อบังคับ — ใช้เมื่อแตก slice แล้วได้ dependency chain ลึก:
     1. **Contract-first decouple** — เมื่อ task B ต้องการแค่ **interface/contract** ของ A (ไม่ใช่ runtime จริง) → ให้ B พึ่ง **contract artifact** (type/schema/openapi/ไฟล์กลางที่ตกลงใน design) แทน → A‖B ขนาน; integration พิสูจน์ที่ **full-gate** (`build.md` §3 ข้อ 8) — slice ยัง end-to-end แค่ stub ฝั่ง dependency ชั่วคราว
     2. **Re-slice ต่างแกน** — ถ้าแตกตาม component-layer แล้วได้ chain → ลองแตกตาม **feature/capability ที่ independent** แทน
     3. **ยอม serialize เฉพาะ chain แท้** — dependency ที่เลี่ยงไม่ได้ (foundation ต้องก่อน / doc ต้องอ้าง code) → ยอมรับ แล้วโฟกัส **ลดเวลา node บน critical path** (model tier + task-lean)
   - **Parallelize gathering, serialize judgment/narrative (หลักการแกนของการ fan-out ใน stage นี้)** — fan-out read-only sub-agent เพื่อ **"เก็บข้อมูล / เขียนหน่วยที่ independent"** ได้ (เร็วขึ้นฟรีเพราะงาน independent) แต่ **"การตัดสิน scope + เขียน narrative ที่ต้อง coherent"** คงเป็น **single-writer** (main loop):
     - ✅ ขนานได้ (gathering/independent unit): grounding อ่าน input หลายโดเมน (step 2), research เก็บ fact ก่อนเขียน design (step 5), เขียนไฟล์ task แต่ละใบที่อยู่คนละโฟลเดอร์ (step 9)
     - ❌ ห้ามขนาน (judgment/narrative): การตัดสิน scope + ถาม user, การเขียน narrative ของ `proposal.md`/`design.md` (แตกให้หลาย agent เขียนคนละ section → ต่อไม่เนียน → review+rewrite แพงกว่าเขียนรอบเดียว)
     - หลักการนี้ **ขยายของเดิมในที่เดิม ไม่ใช่กลไกใหม่ขนาน** — เป็นกรอบร่วมของ DAG-width toolkit (ข้อ 2 ข้างบน) + review panel fan-out (ข้อ 7) + task-file fan-out (step 9); ทุกจุด fan-out ต้องมี **fallback** "เครื่องที่ fan-out ไม่ได้ → ทำตามลำดับเหมือนเดิม" (tool-agnostic)
3. **task = หน่วยที่โยนให้ sub-agent ได้** — แต่ละ task self-contained (มี spec + standard + rule ของตัวเอง) **กระชับพอ agent ทำจบ ไม่ฟุ่มเฟือย** (brief ยาวผิดปกติ → recheck dependency/re-slice) แต่ **เชื่อมต่อกัน** ผ่าน dependency/ลำดับที่ระบุชัด — เมื่อแตก task ต้อง **วาด DAG แล้ววัด critical-path depth (longest chain) + max wave width**: ถ้า DAG เป็น chain เส้นตรง (ทุก wave มี 1 task) ต้องมี **เหตุผล explicit** ว่าทำไม decouple ด้วย toolkit ข้อ 2 (3 เทคนิค) ไม่ได้ (กัน chain เผลอ)
4. **สอดคล้องมาตรฐานเสมอ** — อิง rule + standard ของ techstack; ถ้าจะเพิ่ม rule/standard ใหม่ ให้ **note ไว้ก่อน** (ยังไม่แก้ไฟล์กลาง — รอ SHIP)
5. **Gate ก่อนเขียนไฟล์ task จริง** — ต้องผ่านเกณฑ์ข้อ 8 ก่อนจะ generate ไฟล์ task และก่อนโยนให้ sub-agent
6. **ใช้ role lens** — ออกแบบ (design.md) ด้วยมุม **SA** (`.warnyin/workflow/roles/sa.md`) และแตก/ตรวจ task ด้วยมุม **Tech Lead** (`.warnyin/workflow/roles/tech-lead.md`); วาด wireframe ด้วยมุม **UX/UI** (`.warnyin/workflow/roles/ux.md`) เมื่อ change มี UI surface (step 4.5)
7. **Review panel ก่อนแตก task (optional — ถาม user ก่อนเสมอ)** — ให้หลาย role (SA / Tech Lead / QA / Security / Infra ตาม `.warnyin/workflow/roles/`) รีวิว design ขนานแบบอิสระ (read-only) แล้วแก้ blocker ให้ครบก่อนแตก task (ดู §4 step 6)
   > หมายเหตุ: UX/UI (`warnyin-ux`) เป็น **generator** (วาด wireframe ที่ step 4.5) **ไม่ใช่ reviewer** ของ panel — อย่า fan-out เป็น reviewer ตัวที่ 6
8. **Dry-run ก่อนเข้า BUILD (optional — ถาม user ก่อนเสมอ)** — หลังเขียนไฟล์ task ครบ เสนอ user ว่าจะ dry-run ทั้งหมดเพื่อหาจุดบกพร่องไหม ถ้า ok → สแกนทุก task แบบขนาน (read-only) หา **defer/blocker** แล้วแก้ DESIGN จนไม่มี blocker ค้าง (ดู §4 step 10) — การแก้ **ห้ามเดา ห้ามคิดขึ้นเอง**

---

## 4. ลำดับขั้นการทำงาน (process)

1. **เตรียมพื้นที่:** ใช้/สร้างโฟลเดอร์ `docs/stages/<slug>/` (ถ้ามาจาก Discovery ใช้อันเดิม)
2. **Ground + เคลียร์ความไม่ชัด:** อ่าน Input; ทุกจุดกำกวมเรื่อง design → ถามทีละข้อ + recommended answer จนชัด (ถ้าใหญ่/ไม่ชัดมาก → แนะนำ Discovery ก่อน)
   - **อ่าน Input §2 หลายโดเมนทำขนานได้ (gathering — §3 หลักการแกน)** — fan-out read-only sub-agent หนึ่งตัวต่อหนึ่งโดเมน แล้วแต่ละตัวคืน **summary สั้น + path/บรรทัดอ้างอิง** แบ่งตามโดเมน: (ก) `project.md` + `rule.md` · (ข) `techstack/<component>/{rule,standard,about,structure,test}.md` + `codemap` · (ค) โค้ดจริงที่ change แตะ · (ง) discovery/feature-spec (ถ้ามี)
   - main loop **สังเคราะห์ผลทุกโดเมน + ตัดสิน scope + ถาม user จุดกำกวมเอง** — ไม่ delegate การตัดสิน scope/การถาม user ให้ sub-agent (judgment = single-writer)
   - **fallback:** เครื่องที่ fan-out ขนานไม่ได้ (ไม่มี sub-agent tool) → อ่าน Input ตามลำดับเหมือนเดิม
1.5 **Establish tier (ก่อนจ่าย ceremony):** ประเมินขนาด change เบื้องต้นตาม rubric (`triage.md` §2 — signals + hard-floor)
   - **มั่นใจ** → กำหนด tier + บันทึก `proposal.md` ช่อง `ขนาด`
   - **ไม่มั่นใจ/ก้ำกึ่ง** → ถาม user (options): (ก) ประเมินด้วย `/warnyin:triage` ก่อน · (ข) user กำหนด tier เองถ้ารู้  [ก้ำกึ่ง default = ปัดขึ้น standard]
   - **hard-floor** (auth/migration/secret/public-API/security-sensitive) → ≥ standard เสมอ
   - tier → drive ceremony ตาม §7
3. **business.md** *(optional — ข้ามได้ถ้า change เล็ก เช่น fix bug นิดหน่อย)*: what & why เชิงธุรกิจ — goal, คุณค่า, persona, success metric
4. **proposal.md** (what & why): สรุป change ที่จะทำ, เหตุผล, ทางเลือกที่พิจารณา/ตัดทิ้ง, scope in/out
4.5 **UX wireframe (optional — ถาม user ก่อน; เฉพาะ change มี UI surface):**
   - รัน detect (§ "UX wireframe — detect"); ไม่เข้าเงื่อนไข → **ข้าม step นี้ทั้งหมด**
   - เข้าเงื่อนไข → เสนอ user ว่าจะวาด wireframe ก่อนเขียน technical design ไหม (ให้เห็นภาพหน้าจอ+ยืนยันก่อนแตก task) — user ปฏิเสธ → บันทึกว่าข้าม แล้วไปต่อ
   - ตกลง → fan-out sub-agent `warnyin-ux` **ขนาน read-only** (หนึ่งตัวต่อหนึ่งกลุ่มหน้าจอถ้าหลายจอ) ตาม role card `roles/ux.md` → คืน **ASCII wireframe + user flow + screen states** เป็น text
   - **main loop เขียนลง `docs/stages/<slug>/wireframe.md`** (single-writer) → เสนอ user
   - **★ approve gate:** user ยืนยัน/ปรับ wireframe ก่อนไปต่อ (วน rerun/แก้จนพอใจ) — ห้ามเดา ปรับตาม feedback user
   - design.md §5 (UI layer ของ vertical slice) **อ้าง wireframe ที่ approve**
   - **fallback** (fan-out ไม่ได้): AI หลักสวม lens `roles/ux.md` วาด wireframe เองตามลำดับ

   ### UX wireframe — detect ว่า change มี UI surface ไหม?
   ดูสัญญาณ (เจอ **อย่างน้อยหนึ่ง** ที่ชัด = ใช่):
   1. **techstack** — `docs/techstack/<component>/about.md` ระบุว่าเป็น frontend/web/mobile/desktop (มีหน้าจอที่ user เห็น)
   2. **change แตะหน้าจอ** — เพิ่ม/แก้ page · route · screen · view · component ที่ผู้ใช้มองเห็น/โต้ตอบ
   3. **flow ใหม่** — user flow / navigation / form / interaction ที่ออกแบบได้

   > สัญญาณคลุมเครือ (backend/REST API · CLI · library · migration · docs/tooling ล้วน — ไม่มีหน้าจอ) → **ไม่ใช่** → ข้าม UX step ทั้งหมด
   > ไม่แน่ใจจริง → ถาม user ทีละข้อ + เสนอคำตอบที่แนะนำ (หลัก "ห้ามเดา")
5. **design.md** (how): ออกแบบเชิงเทคนิคแบบ vertical slice — slice มีอะไรบ้าง, แต่ละ slice ตัดผ่าน layer ไหน, data model, interface/contract, flow, ผลกระทบต่อระบบเดิม (ใช้ lens `.warnyin/workflow/roles/sa.md`) — **ครอบ "Spec delta" ด้วย**: เทียบพฤติกรรมที่ change นี้แตะกับ `docs/features/<name>/spec.md` ปัจจุบัน แล้วเขียน ADDED/MODIFIED/REMOVED (SHIP merge ตามนี้); change ไม่แตะพฤติกรรม feature → ระบุ "ไม่มี delta"
   - **เก็บ fact ก่อนเขียนทำขนานได้ (gathering — §3 หลักการแกน)** — ถ้าต้องรวบรวมข้อเท็จจริงจากหลายจุด (โค้ด/contract/impact analysis) ก่อนเขียน → fan-out **research** sub-agent ขนาน (read-only) คืน fact + path/บรรทัด
   - **single-writer guardrail (narrative = serialize):** การเขียน narrative ของ `design.md` ทำโดย main loop คนเดียว — **ห้ามแตก narrative ให้หลาย agent เขียนคนละ section** (coherence cost: เอกสารต่อกันไม่เนียน → review+rewrite แพงกว่าเขียนรอบเดียว)
   - **fallback:** เครื่องที่ fan-out ขนานไม่ได้ → main loop อ่าน + เขียนเองตามลำดับเหมือนเดิม
6. **Review panel (optional — ถาม user ก่อน):** เสนอ user ว่าจะให้ panel หลาย role รีวิว design ก่อนแตก task ไหม — ถ้า ok:
   > หมายเหตุ: UX/UI (`warnyin-ux`) เป็น **generator** (วาด wireframe ที่ step 4.5) **ไม่ใช่ reviewer** ของ panel — อย่า fan-out เป็น reviewer ตัวที่ 6
   1. fan-out sub-agent reviewer **ขนาน (read-only)** ตาม role card: **SA** (architecture/data model/contract), **Tech Lead** (feasibility/ขนาด task/dependency), **QA** (testability/acceptance), **Security** (ช่องโหว่/ข้อมูลอ่อนไหว), **Infra** (env/config/migration) — แต่ละตัวอ่าน `proposal.md` + `design.md` + โค้ดจริงที่เกี่ยว แล้วให้ความเห็นตาม checklist ใน `.warnyin/workflow/roles/<role>.md` แบ่งเป็น **blocker / suggestion**
   2. รวมความเห็นทุก role → สรุปให้ user เห็นภาพ
   3. **blocker → แก้ design ให้ครบ** โดยห้ามเดา — ติดจริงถาม user ทีละข้อ + เสนอคำตอบแนะนำ; suggestion → พิจารณา/บันทึกเหตุผลถ้าไม่ทำ
   4. บันทึกสรุปผล panel + สิ่งที่แก้ ลงท้าย `design.md` (section "Design review")
   5. เครื่องที่ fan-out ไม่ได้ → รีวิวทีละ role ด้วย checklist เดียวกัน
7. **แตก tasks:** แปลง design เป็น task (= vertical slice / step ที่แก้); task ซับซ้อน → แตก **sub-task** ย่อย; **วาด DAG** + ระบุ **critical-path depth (longest chain) + max wave width + เหตุผลถ้า task ใดถูก serialize** — ถ้าได้ chain ลึก ลอง DAG-width toolkit (§3 ข้อ 2) ก่อนยอม serialize; เขียน **dependency graph / ลำดับ** ให้ sub-task เชื่อมกัน
8. **rule check ต่อ task:** เปิด `docs/techstack/<component>/rule.md` หา rule ที่ task นี้ต้องโฟกัส → ใส่ใน `tasks/<task>/rule.md`; rule ใหม่ที่อยากเพิ่ม → note ใน section "เสนอเพิ่ม (รอ SHIP)"
9. **เช็ค Gate (ข้อ 8)** → เมื่อผ่าน จึง **เขียนไฟล์ task ครบทุกใบ** (แตก task ด้วย lens `.warnyin/workflow/roles/tech-lead.md`)
   - **standard/large tier → fan-out task-file generation เป็น default** (gathering/independent unit — §3 หลักการแกน): หลัง **ผ่าน Gate ข้อ 8 ก่อนเสมอ** → spawn read-only-capable sub-agent หนึ่งตัวต่อหนึ่ง task เขียน 4 ไฟล์ (`spec/standard/rule/task`) **ขนาน**
     - **ไม่ต้องใช้ worktree** — แต่ละ task อยู่คนละโฟลเดอร์ `tasks/<task>/` → ไม่มี file conflict (ต่างจาก BUILD ที่ agent แก้ source ชนกัน); spawn agent ขนานตรงๆ ได้ (แนวเดียวกับ wave fan-out ของ BUILD ที่ `build-wave.mjs` — อ้างเป็น reference ไม่ duplicate logic)
     - หลัง fan-out → main loop **review coherence ข้าม task** (dependency/contract/naming สอดคล้องกัน) — single-writer ตรวจเอง ไม่ delegate (judgment = serialize)
   - **fast tier → 1 task เขียนเอง ไม่ fan-out** (คงเดิม)
   - **fan-out คือวิธีเขียนเร็วขึ้น ไม่ใช่ข้าม Gate** — Gate ข้อ 8 ยังต้องผ่านก่อน fan-out เสมอ
   - **fallback:** เครื่องที่ fan-out ขนานไม่ได้ → เขียนไฟล์ task ทีละใบตามลำดับเหมือนเดิม
10. **Dry-run (optional — ถาม user ก่อน):** ถาม user ว่าต้องการ dry-run ทั้งหมดเพื่อหาจุดบกพร่องก่อนเข้า BUILD ไหม — ถ้า ok:
   1. **fan-out agent หนึ่งตัวต่อหนึ่ง task แบบขนาน (read-only — ห้ามแก้โค้ด/ไฟล์ design)** — แต่ละตัวอ่าน task ทั้ง 4 ไฟล์ + `design.md`/`proposal.md` + โค้ดจริงที่เกี่ยว แล้ว "เดิน implement ในหัว" เพื่อหา:
      - **blocker** — สิ่งที่ทำให้ implement ตาม spec ไม่ได้ (ขัดแย้งกับโค้ดจริง/กับ task อื่น, ข้อมูล/spec ขาด, dependency ผิด) — BUILD จะล้มถ้าไม่แก้
      - **defer** — จุดที่ตัดสินใจ/ทำทีหลังได้ ไม่ block การเริ่ม BUILD แต่ต้องบันทึกและ track
   2. task ไหนพบ issue → เขียน `tasks/<task>/issue.md` (template `.warnyin/template/stages/[topic]/tasks/[task-name]/issue.md`); ไม่พบ → ไม่ต้องสร้างไฟล์
   3. รันครบทุก task แล้ว → **สรุปผลรวม** (จำนวน blocker/defer ต่อ task) ให้ user เห็นภาพ
   4. **หาวิธีแก้ DESIGN ตาม issue** (แก้ `design.md` / task ที่กระทบ) โดย **ห้ามเดา ห้ามคิดขึ้นเอง** — ติดจริงๆ ให้สัมภาษณ์ user **ถามทีละข้อ + เสนอคำตอบแนะนำทุกครั้ง**; คำถามที่โค้ดตอบได้ → ไปอ่านโค้ดเอง
   5. แก้แล้ว rerun dry-run เฉพาะ task ที่กระทบ วนจน **ไม่มี blocker ค้าง** (อัปเดตสถานะใน `issue.md` — defer ที่เหลือให้ user รับทราบ)
11. **เสนอเข้า BUILD:** พร้อม implement ด้วย `/warnyin:build`

> generate ไฟล์ task หลายใบพร้อมกันด้วย sub-agent (หนึ่ง agent ต่อหนึ่ง task) เป็น **default สำหรับ standard/large** (step 9) — แต่ต้องผ่าน Gate ก่อนเสมอ; fast tier (1 task) เขียนเอง
> เครื่องที่ fan-out ขนานไม่ได้ (ไม่มี sub-agent tool) → เขียน task / dry-run สแกนทีละ task ตามลำดับด้วยหลักการเดียวกัน

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

## 7. ปรับความละเอียดตามขนาด change (3-tier)

**tier ถูก established ที่ §4 step 1.5** (ประเมินเอง / มั่นใจกำหนด / ไม่มั่นใจถาม options / hard-floor บังคับ ≥ standard) — ส่วน §7 นี้อธิบาย ceremony ที่ drive โดย tier ที่ established

ปรับ ceremony ตาม **tier** (canonical rubric ดู `.warnyin/workflow/triage.md`) — fast/standard/large:

- **fast** (bugfix, typo, config tweak, wording-guidance สั้น, 1-2 ไฟล์ modify ของเดิม ไม่ cross-cutting): **fast-track** — ข้าม `business.md`, proposal/design สั้น, **ไม่ panel ไม่ dry-run**, 1 task; ทำตาม [fast-track skip-list](../triage.md#fast-track-skip-list) (canonical ใน `triage.md` — ไม่ลอก rubric มาที่นี่). **คง correctness floor:** spec/acceptance ขั้นต่ำของ task ยังต้องครบ
- **standard** (feature ปกติ, modify หลายไฟล์/หลาย component, มี logic ใหม่): flow เต็ม — ครบทุก artifact, แตก vertical slice หลาย task + sub-task, dependency ชัด, panel/dry-run ตามเหมาะ; **task-file generation = fan-out default** (หนึ่ง agent ต่อหนึ่ง task หลังผ่าน Gate §8 — step 9)
- **large** (greenfield/project ใหม่, cross-cutting หลาย component, mega): **บังคับ `/warnyin:discovery` ก่อน** แล้วค่อยกลับมา DESIGN → decompose เต็ม; **task-file generation = fan-out default** เช่นเดียวกับ standard (step 9)

> hard-floor (auth/migration/secret/public-API/security-sensitive) บังคับ ≥ standard เสมอ — ดู [triage rubric](../triage.md#fast-track-skip-list) (`triage.md` §3B); fast-track ลดเฉพาะ ceremony ไม่ลด correctness — Gate §8 ของ standard/large คงเดิม

---

## 8. Gate → เข้า BUILD (`/warnyin:build`) ได้เมื่อ

- [ ] proposal.md (+ business.md ถ้าจำเป็น) + design.md ครบ และ user เห็นชอบ
- [ ] **ไม่มีการเดา** — ทุกจุดที่ไม่ชัดถูกถาม (ทีละข้อ + recommended answer) และปิดแล้ว
- [ ] design เป็น vertical slice ชัด — แต่ละ task/slice ส่งมอบคุณค่า end-to-end ได้
- [ ] **Spec delta ครบ** — เทียบ `docs/features/<name>/spec.md` ของ feature ที่แตะ (ADDED/MODIFIED/REMOVED) หรือระบุ "ไม่มี delta"
- [ ] **API contract (ถ้าแตะ REST API)** — topic ที่ auto-detect ว่าแตะ backend/REST API มี `openapi.yaml` (OpenAPI 3.1) ครบ + `spec.md` ของ API task ชี้มาที่ contract (ตาม `.warnyin/workflow/api-doc.md`); ไม่ใช่ REST API → ข้อนี้ N/A
- [ ] **UX wireframe (ถ้า change มี UI surface)** — `wireframe.md` ครบ (user flow + ASCII screen + states) **และ user ยืนยันแล้ว**; design.md UI layer อ้าง wireframe ที่ approve — ไม่มี UI surface → ข้อนี้ N/A
- [ ] ทุก task มี `spec.md` + `standard.md` + `rule.md` + `task.md` ครบ (ถ้ารัน node ได้: `node .warnyin/workflow/scripts/validate-topic.mjs <slug>` ควรไม่มี ✖ — เช็คโครง ไม่แทนการอ่าน semantic)
- [ ] dependency / ลำดับระหว่าง task และ sub-task ชัดเจน เชื่อมต่อกัน — **critical-path gate (judgment, ไม่ใช่ mechanical check):** ระบุ critical-path depth + max wave width; ถ้า DAG เป็น chain เส้นตรง (ทุก wave มี 1 task) → ต้องมี **เหตุผล explicit** ว่าทำไม decouple ด้วย DAG-width toolkit (§3 ข้อ 2) ไม่ได้ (กัน chain เผลอ)
- [ ] rule ที่ต้อง follow ถูกระบุครบ; rule/standard ใหม่ที่อยากเพิ่มถูก note ไว้ (รอ SHIP)
- [ ] ถ้าทำ review panel: **blocker จากทุก role ถูกแก้/ปิดครบ** — สรุปผลบันทึกใน `design.md` section "Design review"
- [ ] ถ้าทำ dry-run: **ไม่มี blocker ค้าง** — ทุก issue ถูกแก้/ปิดใน `issue.md`, defer ที่เหลือ user รับทราบแล้ว

ยังไม่ครบ → ห้ามเขียนไฟล์ task / ห้ามโยน sub-agent / ห้ามข้ามไป BUILD
