# Standard — embed-minimalism-principle

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> pattern การเขียน playbook doc ที่ task นี้ต้องยึด
> **อิงจาก** `docs/rule.md` (repo-level) + `docs/techstack/installer/` + convention ใน `.warnyin/workflow/`

## 1. Standard กลางที่ยึด
- **top-level capability/principle doc convention** — `minimalism.md` วางระดับเดียวกับ `triage.md`, `api-doc.md`, `explore.md`, `next.md` ใน `src/.warnyin/workflow/` (ไม่สร้าง folder ใหม่)
- **canonical-copy** — นิยาม hierarchy/guardrail เต็มที่ไฟล์แกนเดียว; surface อื่น = pointer บรรทัดสั้น ห้ามแต่ง/ลอกเนื้อหา hierarchy ใหม่ต่อไฟล์
- **payload-guidance generic vocab** — ห้ามอ้างชื่อรุ่น/tool/ผลิตภัณฑ์ (รวมในประโยคปฏิเสธ); เป็น guidance ไม่ enforce
- **context ⊥ role / 3 context พอ** — ไม่เพิ่ม context ตัวที่ 4; minimalism เป็น principle ไม่ใช่ posture
- **investigate-before-edit** — ก่อนเติม pointer ในไฟล์เดิม อ่านโครง section ของไฟล์นั้นก่อน วางให้ตรงที่ (เช่น §3 operating principles ของ stage, Lens/Checklist ของ role)
- **ภาษาไทย** — เนื้อหา/คอมเมนต์เป็นภาษาไทยตามสไตล์ payload เดิม

## 2. Pattern การเขียนของ task นี้
- **โครง minimalism.md:** หัว+เจตนา → guardrail box (ก่อน) → hierarchy 6 ขั้น (checklist สั้น) → ใช้ในแต่ละ stage (pointer-style) → before/after 1 เคส → ขอบเขตกัน over-cut — เลียนโครงกระชับของ `triage.md`
- **pointer pattern:** บรรทัดเดียว ชี้ relative path + เหตุผลสั้น เช่น
  `- เขียนน้อยที่สุดตาม decision hierarchy (YAGNI→stdlib→native→dep→one-liner) — ดู [`minimalism`](../minimalism.md)`
- **relative path ถูกต้อง:** จาก `roles/` และ `contexts/` และ `stages/` ใช้ `../minimalism.md`; จาก `README.md` (อยู่ราก workflow/) ใช้ `minimalism.md`
- **before/after:** ใช้เคส generic (เช่น เขียน helper รวม array ที่ stdlib ทำได้) — โค้ดสั้น, ไม่ผูกภาษา/framework เฉพาะ (หรือใช้ pseudo/ภาษากลาง)

## 3. Shared component / utility ที่ต้องใช้ (อย่าเขียนซ้ำ)
- `npm run setup:dogfood` (`src/scripts/setup-dogfood.mjs`) — sync src→root, **อย่าแก้ root โดยตรง**
- `npm run lint:md`, `npm run verify:pack`, `npm test`, `node .warnyin/workflow/scripts/validate-topic.mjs` — gate ที่มีอยู่แล้ว
- โครง doc อ้างอิง: `.warnyin/workflow/triage.md`, `api-doc.md` (แม่แบบ top-level doc กระชับ)

## 4. เพิ่มเติมเฉพาะ task
- เนื้อหา canonical ของ minimalism.md = single source ของ topic นี้ (ตาม canonical-copy: ถ้าจะอ้างในไฟล์อื่นให้ copy เป็น pointer ไม่แต่งใหม่)
- ถ้าพบว่า seed เดิม (เช่น "reuse ก่อนเขียนใหม่" ใน build.md, "ไม่แถม" ใน developer.md) ทับซ้อน → **unify-in-place**: คงบรรทัดเดิม + เติม pointer ให้ของเดิมกลายเป็น subset ของแกน ไม่สร้างข้อความขนาน
