# Task — ship-maintenance-wiring

> หน่วยที่โยนให้ sub-agent ทำใน BUILD ได้ — self-contained แต่เชื่อมกับ task อื่นผ่าน dependency

| | |
|---|---|
| **Task** | `ship-maintenance-wiring` |
| **Slice อ้างอิง** | `design.md` slice #2 |
| **Component** | `installer` (playbook กลาง `.warnyin/workflow/`) |
| **สถานะ** | `build เสร็จ — validate ✓ + test 58/58 เขียว` |

## 1. เป้าหมายของ task (vertical slice)
context.md ถูก **maintain จริง** — SHIP เป็น producer หลัก (append ไฮไลต์ตอน archive + อัปเดตโฟกัส) และ readers (next/discovery/explore) มี wording ชัดว่า context.md = **working-notes** ไม่ใช่ status board (end-to-end: ship topic → context.md ได้ trace)

## 2. Dependency (เชื่อมต่อกับ task อื่น)
- ต้องทำหลัง: `tasks/context-skeleton-seed` (อ้าง section ของ context.md ที่ task นั้นสถาปนาเป็น canonical)
- ปลดล็อกให้: — (task สุดท้ายของ topic)
- รับ input: canonical schema `design.md` §3 + template จาก task-1

## 3. Sub-tasks
- [x] 1. แก้ `src/.warnyin/workflow/stages/ship.md` — เพิ่มขั้น maintenance ของ context.md ใน process (§4 ข้อ 4) + เพิ่ม gate item: ตอน archive ให้ append แถว "เพิ่ง ship" (`วันที่|slug|ไฮไลต์`) + prune เหลือ N=5 + อัปเดต "โฟกัส/ธีมปัจจุบัน" ถ้าขยับ; section/ไฟล์ไม่มี → สร้างจาก canonical — _ผลลัพธ์:_ SHIP มี producer contract
- [x] 2. ปรับ wording readers ให้ชัดว่า context.md = working-notes (ไม่ใช่ status board): `next.md` (คง read-only — ขยายความว่าอ่าน working-notes; status มาจากการ scan ข้อ 3), `discovery.md` §2 ข้อ 5 (ใน task เขียน §2.5 แต่ไฟล์จริงมีแค่ §2 → แก้ที่ item context.md), `explore.md` §2 ข้อ 4 — ใช้คำตรง canonical
- [x] 3. ตรวจ consistency: ทุกจุดที่พูดถึง context.md ชี้ canonical เดียว (`.warnyin/template/stages/context.md`) — readers เป็น pointer บาง ไม่ duplicate กติกาเต็ม (ผู้ผลิตกติกาเต็ม = ship.md เท่านั้น)

## 4. ขอบเขตไฟล์/โค้ดที่จะแตะ
- **แก้:** `src/.warnyin/workflow/stages/ship.md` (เพิ่มขั้น + gate)
- **แก้ (wording เบา):** `src/.warnyin/workflow/next.md`, `src/.warnyin/workflow/stages/discovery.md`, `src/.warnyin/workflow/explore.md`
- **ห้ามแตะ:** `docs/rule.md` กลาง (rule ใหม่ note รอ SHIP), `validate-topic.mjs`, logic `next.md` ที่เป็น read-only (ห้ามเปลี่ยนให้ next เขียน context.md)

## 5. Acceptance criteria
- [x] `ship.md` ระบุชัดว่า SHIP append "เพิ่ง ship" + prune N=5 + อัปเดตโฟกัส ตอน archive — สอดคล้อง canonical `design.md` §3/§4 (ship.md §4 ข้อ 4 + gate §6)
- [x] `next.md` ยัง **read-only เด็ดขาด** ต่อ context.md (ไม่เพิ่มหน้าที่เขียน — §4.1 คงเดิม) — wording บอกว่า context.md = working-notes; status derive จากการ scan
- [x] ไม่มีจุดไหน duplicate "status board" ลง context.md (ไม่ขัด `unify-in-place`) — ship.md + readers ระบุชัด "ไม่ใช่ status board"; grep ยืนยัน
- [x] คำอธิบาย context.md ทุกไฟล์ชี้ canonical เดียว (`.warnyin/template/stages/context.md`) ไม่ขัดกัน
- [x] `node .warnyin/workflow/scripts/validate-topic.mjs context-working-memory` ไม่มี ✖ (exit 0, ✓ โครงครบ)
- [x] ทำตาม `rule.md` และ `standard.md` (tool-agnostic, canonical-copy pointer บาง, unify-in-place, next read-only invariant)

## 6. อ้างอิงในโฟลเดอร์ task นี้
- Spec: `./spec.md` · Standard: `./standard.md` · Rule: `./rule.md`
- Canonical schema + producer contract: `../../design.md` §3, §4
