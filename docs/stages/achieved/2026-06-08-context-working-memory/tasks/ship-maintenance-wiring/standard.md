# Standard — ship-maintenance-wiring

> playbook authoring — แก่น `.warnyin/workflow/` (tool-agnostic)

## 1. Standard กลางที่ยึด (จาก docs/rule.md §1)
- **tool-agnostic** — แก่นเป็น `.md` กลางที่ทุก harness อ่านได้; ห้ามผูกชื่อ tool/model เฉพาะ
- **single source of truth / canonical-copy** — กติกาเต็มนิยามที่เดียว (canonical = `design.md` §3/§4); ไฟล์อื่นเป็น pointer บาง ห้ามแต่ง wording ใหม่ต่อไฟล์
- **context (session) ⊥ role (task)** — `docs/stages/context.md` (working-memory ของ workspace) คนละชั้นกับ `.warnyin/workflow/contexts/` (session posture) — ระวังคำว่า "context" ไม่ให้สับสน 2 ความหมาย
- **unify-in-place ไม่สร้างกลไกขนาน** — context.md เสริม next.md (ไม่ซ้ำ status board)
- ภาษาไทย, เขียนแบบ playbook (สั้น, ชี้กลับแก่น, เน้น decision/เหตุผล)

## 2. Pattern การเขียนของ task นี้
- แก้ `ship.md` แบบ **unify-in-place** — ขยายขั้น archive (§4 ข้อ 4) ที่มีอยู่ + เพิ่ม gate item เดียว ไม่สร้าง section กลไกใหม่ขนาน
- readers: แก้ wording ให้ชี้ความหมาย working-notes — **ไม่ copy** canonical schema เข้าไป (แค่ 1 บรรทัดชี้ว่าอ่านอะไร + ชี้ canonical)
- รักษา invariant ของ `next.md`: "Read-only เด็ดขาด รวมถึง context.md" — ห้ามแก้ให้ next เขียน

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- canonical schema เดียวใน `design.md` §3 — ทุกไฟล์ชี้กลับ
- โครงประโยค pointer แบบเดียวกับที่ playbook อื่นใช้อ้าง template/playbook

## 4. เพิ่มเติมเฉพาะ task
- ถ้าพบว่า maintenance context.md ควรมี discipline ระดับ project (ไม่ใช่แค่ ship) → note `rule.md` รอ SHIP (อย่าเพิ่ม global rule ตอนนี้)
