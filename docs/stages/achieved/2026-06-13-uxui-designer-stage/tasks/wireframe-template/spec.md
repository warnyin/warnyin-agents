# Spec — wireframe-template

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> spec เฉพาะของ task นี้ — **ใส่เฉพาะหัวข้อที่เกี่ยวข้องกับชนิดของ task**

## 1. ชนิดของ task
`UX-UI` / `template` — สร้าง template artifact (scaffold placeholder) ไม่ใช่โค้ด runtime

> ★ **Blueprint พร้อมแล้ว:** `./wireframe.blueprint.md` คือไฟล์เต็มที่ DESIGN ร่างไว้ — **BUILD แค่ copy ลง `src/.warnyin/template/stages/[topic]/wireframe.md`** (ตรวจให้ตรง contract ด้านล่างก่อน commit). DESIGN ไม่แตะ `src/` (rule §6 source/dogfood แยกชั้น)

---

## 3. UX/UI SPEC

- Wireframe / Figma ref: _(ไม่มี — task นี้ **คือ** การสร้างโครง wireframe template เอง)_
- โครงไฟล์ `wireframe.md` มี 4 section ชื่อตายตัวตาม contract (design.md §3 + §8 T2):
  1. **§1 User flow** — เส้นทาง screen-to-screen (ASCII arrow flow)
  2. **§2 Wireframe ต่อ screen** — ASCII box ต่อหนึ่ง screen, render ได้, รองรับหลาย screen block
  3. **§3 Screen states** — empty / loading / error / success ต่อ screen
  4. **§4 Design-honor note** — สิ่งที่ design.md UI layer + task ต้องทำตาม wireframe
- States ที่ §3 ต้องครอบ: empty / loading / error / success (ต่อ screen)
- Metadata header: slug / วันที่ / **status: draft|approved** (approve gate)
- ASCII = low-fidelity (กล่อง/label generic) + placeholder `<...>`/`[LABEL]` + comment สอนกรอก

## 5. User-flow
> ผู้ใช้ของ template นี้เดินผ่านขั้นตอนไหนบ้าง

1. DESIGN step 4.5 → main loop copy `wireframe.md` ลง `docs/stages/<slug>/`
2. กรอก §1-§4 ตาม comment (แทนที่ placeholder, ใส่ ASCII จริง, ลบ comment คำสั่งกรอก)
3. ตั้ง status = `draft` → เสนอ user → user ยืนยัน → `approved` (approve gate)

## 6. Persona
> task นี้ทำเพื่อใคร

agent `warnyin-ux` (generator) + AI หลัก (fallback lens) + user — ทุกคนที่ต้องวาด/ยืนยัน wireframe ในขั้น DESIGN ของ change ที่มี UI surface

## 7. Test-flow
> จะทดสอบ/ยืนยันความถูกต้องยังไง (เคสที่ต้องผ่าน, edge case)
> _(lint-md EXCLUDE `template/` → ตรวจ structural ด้วยตา/grep โดย agent อิสระจากผู้เขียน)_

- [ ] **4 section ชื่อตรง contract** — grep เจอครบ: `## 1. User flow` · `## 2. Wireframe ต่อ screen` · `## 3. Screen states` · `## 4. Design-honor note` (ชื่อตรงเป๊ะ — T3 pointer มาที่นี่)
- [ ] **ASCII render ได้** — §1 มี arrow flow ใน code-block; §2 มี ASCII box ใน code-block ที่ปิด fence ครบ (` ``` ` คู่) + กล่องไม่เพี้ยน
- [ ] **หลาย screen** — §2 มี ≥ 2 block `### Screen:` + comment บอกว่า "ทำซ้ำ block ได้"
- [ ] **states ครบ** — §3 มี empty / loading / error / success ต่อ screen
- [ ] **metadata** — มี header table: slug · วันที่ · status = `draft` / `approved`
- [ ] **placeholder + สอนกรอก** — มี `<...>`/`[LABEL]` แทนที่ได้ + comment สอนวิธีกรอก
- [ ] **privacy** — มี note ห้ามใส่ secret/PII จริง (generic label เท่านั้น)
- [ ] **pointer header** — บรรทัด "> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`"
- [ ] **§4 honor** — ระบุสิ่งที่ design.md §5 UI layer + task ต้องทำตาม wireframe (ผูกกับ §1-§3)
