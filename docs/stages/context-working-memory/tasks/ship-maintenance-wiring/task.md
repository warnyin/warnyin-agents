# Task — ship-maintenance-wiring

> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `ship-maintenance-wiring` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (playbook กลาง `.warnyin/workflow/`) |
| **สถานะ** | `รอ build` |

## 1. เป้าหมายของ task (vertical slice)
context.md ถูก **maintain จริง** — SHIP เป็น producer หลัก (append ไฮไลต์ตอน archive + อัปเดตโฟกัส) และ readers (next/discovery/explore) มี wording ชัดว่า context.md = **working-notes** ไม่ใช่ status board (end-to-end: ship topic → context.md ได้ trace)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: `tasks/context-skeleton-seed` (อ้าง section ของ context.md ที่ task นั้นสถาปนาเป็น canonical)
- ปลดล็อกให้: — (task สุดท้ายของ topic)
- รับ input: canonical schema `design.md` §3 + template จาก task-1

## 3. Sub-tasks
- [ ] 1. แก้ `src/.warnyin/workflow/stages/ship.md` — เพิ่มขั้น maintenance ของ context.md ใน process (§4) + เพิ่ม gate item: ตอน archive ให้ append แถว "เพิ่ง ship" (`วันที่|slug|ไฮไลต์`) + prune เหลือ N=5 + อัปเดต "โฟกัส/ธีมปัจจุบัน" ถ้าขยับ; section/ไฟล์ไม่มี → สร้างจาก canonical — _ผลลัพธ์:_ SHIP มี producer contract
- [ ] 2. ปรับ wording readers ให้ชัดว่า context.md = working-notes (ไม่ใช่ status board): `src/.warnyin/workflow/next.md` (คง read-only — แค่ขยายความว่าอ่าน working-notes; status มาจากการ scan), `src/.warnyin/workflow/stages/discovery.md` §2.5, `src/.warnyin/workflow/explore.md` — _ขึ้นกับ 1:_ ใช้คำให้ตรง canonical
- [ ] 3. ตรวจ consistency: คำอธิบาย context.md ทุกจุดต้องชี้ canonical เดียว (`canonical-copy`) — ไม่ duplicate กติกาเต็ม

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **แก้:** `src/.warnyin/workflow/stages/ship.md` (เพิ่มขั้น + gate)
- **แก้ (wording เบา):** `src/.warnyin/workflow/next.md`, `src/.warnyin/workflow/stages/discovery.md`, `src/.warnyin/workflow/explore.md`
- **ห้ามแตะ:** `docs/rule.md` กลาง (rule ใหม่ note รอ SHIP), `validate-topic.mjs`, logic `next.md` ที่เป็น read-only (ห้ามเปลี่ยนให้ next เขียน context.md)

## 5. Acceptance criteria
- [ ] `ship.md` ระบุชัดว่า SHIP append "เพิ่ง ship" + prune N=5 + อัปเดตโฟกัส ตอน archive — สอดคล้อง canonical `design.md` §3/§4
- [ ] `next.md` ยัง **read-only เด็ดขาด** ต่อ context.md (ไม่เพิ่มหน้าที่เขียน) — wording บอกว่า context.md = working-notes
- [ ] ไม่มีจุดไหน duplicate "status board" ลง context.md (ไม่ขัด `unify-in-place`)
- [ ] คำอธิบาย context.md ทุกไฟล์ชี้ canonical เดียว ไม่ขัดกัน
- [ ] (ถ้ารัน node ได้) `node .warnyin/workflow/scripts/validate-topic.mjs context-working-memory` ไม่มี ✖
- [ ] ทำตาม `rule.md` และ `standard.md`

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical schema + producer contract: `../../design.md` §3, §4
