# Discovery — Feature behavior spec + delta discipline (ยืมเทคนิคจาก OpenSpec)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `feature-spec-delta` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | `2026-06-07` |
| **ผู้ร่วมตัดสินใจ** | Rujiroj |
| **เริ่มจาก** | `docs/project.md` — workflow standard กลาง (playbook + template ใน `src/`); `docs/roadmap.md` หลักการชี้นำ 3 ข้อ |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> เพิ่ม **living behavior spec** (`spec.md` ต่อ feature ใน `docs/features/`) + **delta discipline** (ADDED/MODIFIED/REMOVED ใน DESIGN → SHIP merge กึ่ง mechanical) เข้า Warnyin Standard Workflow — ยืมเทคนิคจาก OpenSpec (Fission-AI) เฉพาะส่วนที่ผ่านเกณฑ์ปรัชญา

## 2. Problem & Why now
- **ปัญหา (2 ด้านเท่ากัน — Decision #1):**
  1. **VERIFY ไม่มี regression baseline** — `docs/features/<name>/` มีแค่ `feature.md`+`business.md` (narrative) ไม่มี spec พฤติกรรมปัจจุบันที่ testable → วางแผนเทสตามความเข้าใจของ model ล้วน
  2. **SHIP promote ด้วย judgment ล้วน** — distill ความรู้ขึ้น docs กลางไม่มีปลายทาง/รูปแบบชัดสำหรับ "พฤติกรรมของระบบ" → เสี่ยง drift ระหว่าง design กับ docs กลาง
- **ทำไมตอนนี้:** เพิ่งวิเคราะห์ OpenSpec (2026-06-07, ดู `research.md`) พบ 2 เทคนิคที่เราขาดและผ่านเกณฑ์ roadmap (.md ล้วน, tool-agnostic, เสริม "ห้ามเดา" ด้วย evidence จาก spec)
- **ผูกกับโปรเจกต์:** แก้ที่ source `src/.warnyin/` (playbook + template) → publish ไปทุกโปรเจกต์ปลายทาง; ตรงเป้า "ติดตั้งแล้วใช้ได้ครบ 5 stage โดยไม่ต้องตั้งค่าเพิ่ม"

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)** — แก้ที่ `src/` ทั้งหมด (source of workflow)
- เพิ่ม template `src/.warnyin/template/docs/features/[feature-name]/spec.md` — living behavior spec แบบ lean (Requirement + Scenario GIVEN/WHEN/THEN, ไม่บังคับ RFC 2119, token-lean)
- DESIGN playbook + template: เพิ่ม section "Spec delta" ใน `design.md` (ADDED/MODIFIED/REMOVED เทียบ feature spec ปัจจุบัน) + gate item
- SHIP playbook: เพิ่มขั้น merge delta → `docs/features/<name>/spec.md` แบบกึ่ง mechanical (ADDED ต่อท้าย / MODIFIED แทนที่ / REMOVED ลบ) ใน promotion plan เดิม + กติกา "พฤติกรรมเพี้ยนจาก delta ระหว่าง BUILD/VERIFY → อัปเดต delta ก่อน merge"
- VERIFY playbook: เพิ่มขั้นอ่าน feature spec ของ feature ที่ถูกแตะ เป็น regression baseline ตอนวางแผนเทส (scenario = test case ตั้งต้น)
- Mirror ใน Claude adapter (`src/.claude/commands/warnyin/{design,verify,ship}.md`) เท่าที่เกี่ยว — ไม่ duplicate logic
- Dogfood: backfill `spec.md` ให้ `docs/features/{context-profiles,utility-skills}/` ของ repo นี้ (2 ตัว) เป็นตัวอย่างจริง
- Convention ลง `docs/rule.md` ผ่าน learned-rule ตอน SHIP (ตามกลไกเดิม)

**Out of scope (จะไม่ทำในรอบนี้)**
- ข้อ 3 จากการวิเคราะห์ OpenSpec (structural validator + status script แบบ zero-dep) → **topic แยกขนาดเล็ก** ต่างหาก (เปิดหลัง topic นี้ ship — validator จะได้เช็คโครง spec/delta ที่นิ่งแล้ว)
- `/warnyin:init` generate spec ให้ feature เดิมทั้งโปรเจกต์ (เลือก organic — Decision #6)
- Schema-driven YAML engine (OPSX), การเลิก phase gate, workspaces, adapter 30+ tools — ตัดทิ้งตั้งแต่ชั้นวิเคราะห์ (ขัดปรัชญา/ยัง beta — ดู `research.md` RQ3)

## 4. Decision Log (เดินทีละกิ่งของ decision tree)
> หนึ่งแถว = หนึ่งการตัดสินใจ บันทึกทันทีที่ตกลงได้

| # | คำถาม / ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| 1 | ปัญหาหลักที่ต้องแก้คืออะไร | ทั้งสองเท่ากัน / เน้น VERIFY baseline / เน้น SHIP drift | ทั้งสองเท่ากัน — สองอย่างเสริมกัน (spec มีค่าเพราะถูก update มีวินัย, delta มีความหมายเพราะมี spec ให้เทียบ) | **ทั้งสองเท่ากัน** | ตาม recommend |
| 2 | รูปแบบ `spec.md` เข้มข้นแค่ไหน | lean แบบ Warnyin / เต็มสูตร OpenSpec (RFC 2119) / อิสระ | lean — เอาโครง Requirement + Scenario (GIVEN/WHEN/THEN) แต่ไม่บังคับ RFC 2119, ไทย/อังกฤษผสมได้, token-lean cap | **Lean แบบ Warnyin** | rigorous พอให้ delta ยึด requirement ได้ โดยไม่เพิ่ม ceremony — ตรงหลักกระทัดรัด opinionated |
| 3 | spec พฤติกรรมปัจจุบันอยู่ที่ไหน | `docs/features/<name>/spec.md` / ทรีแยก `docs/specs/<capability>/` / ฝังใน feature.md | ฝังในโครง features เดิม — feature ละไฟล์ spec.md คู่ feature.md+business.md ไม่เพิ่มแกนใหม่ | **`docs/features/<name>/spec.md`** | ไม่ duplicate กับแกน features, SHIP มีปลายทางเดียวชัด |
| 4 | delta เขียนที่ไหนใน topic | section ใน design.md / ไฟล์แยก spec-delta.md / ฝังใน spec ของแต่ละ task | section "Spec delta" ใน design.md — ไม่เพิ่ม artifact, อ่าน how+delta ที่เดียว, SHIP อ่าน section นี้ไป merge | **Section ใน design.md** | ไม่เพิ่ม ceremony — template topic มี 9 ไฟล์พออยู่แล้ว |
| 5 | SHIP merge delta เข้มแค่ไหน | กึ่ง mechanical + approve รวม / mechanical เต็มขั้น (OpenSpec) / approve รายrequirement | กึ่ง mechanical — delta ผ่าน approve มาแล้วตั้งแต่ DESIGN gate; SHIP โชว์ delta ใน promotion plan เดิม (approve ครั้งเดียว) แล้ว merge ตามกติกา ADDED ต่อท้าย/MODIFIED แทนที่/REMOVED ลบ; ถ้าพฤติกรรมเพี้ยนจาก delta ระหว่าง BUILD/VERIFY ต้องอัปเดต delta ก่อน merge (docs-match-code) | **กึ่ง mechanical + approve รวม** | ได้ความ deterministic ของ OpenSpec โดยไม่ทิ้งหลัก user approve + docs ต้องตรง code |
| 6 | feature เดิมได้ spec.md มายังไง (brownfield) | organic + dogfood 2 ตัว / init generate ให้ / organic ล้วน | organic — spec เกิดตอน SHIP แตะ feature นั้นครั้งแรก (จากพฤติกรรมจริง+delta) ไม่บังคับ backfill; repo นี้ backfill 2 feature เป็นตัวอย่างจริง | **Organic + dogfood 2 ตัว** | ไม่เพิ่มภาระ init, เลี่ยง spec ที่เดาจากโค้ด (ห้ามเดา), มีตัวอย่างจริงทดสอบ format |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:**
  - "feature" ใน `docs/features/` เป็นหน่วยเดียวกับ capability ที่ delta อ้างถึงได้ — ไม่ต้องมีแกน capability แยก (Decision #3)
  - topic ส่วนใหญ่แตะ 1-2 feature → delta ต่อ topic มีขนาดเล็ก อ่าน/approve ใน promotion plan เดิมไหว
  - scenario แบบ GIVEN/WHEN/THEN ละเอียดพอให้ VERIFY แปลงเป็น test case ได้โดยไม่ต้องมี runtime
- **ข้อจำกัด:**
  - เกณฑ์ roadmap 3 ข้อ: กระทัดรัด opinionated / tool-agnostic (.md กลางใน `.warnyin/workflow/`) / ห้ามเดา
  - แก้ที่ `src/` (source) — root เป็น dogfood gitignored ห้ามแก้ตรง
  - zero-dependency — กลไกทั้งหมดเป็น playbook/template `.md` ไม่ใช่ runtime
  - ต้อง backward-compatible: topic เก่า/feature ที่ยังไม่มี spec.md ต้องไม่ทำให้ stage ไหนพัง (spec ไม่มี = สร้างใหม่ตอน SHIP)

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- template `docs/features/[feature-name]/` มี `spec.md` และ playbook DESIGN/VERIFY/SHIP อ้างถึงสอดคล้องกันครบ 3 จุด (delta section + regression baseline + merge step) — wording canonical ชุดเดียว
- เดิน workflow จริง 1 topic (dogfood) แล้ว: DESIGN มี Spec delta, VERIFY อ้าง scenario จาก spec เป็น test case, SHIP merge delta เข้า feature spec สำเร็จโดย user approve ครั้งเดียว
- `docs/features/{context-profiles,utility-skills}/` มี spec.md ที่ผ่านการ review ว่าตรงพฤติกรรมจริง
- `npm test` + `npm run lint:md` + `verify:pack` เขียว (ไฟล์ template ใหม่ติด package)

## 7. Feature ideas / ทางเลือกของวิธีแก้ (ส่งต่อ DESIGN)
- เพิ่ม `spec.md` ใน template `docs/features/[feature-name]/` — Requirement + Scenario (GIVEN/WHEN/THEN) แบบ lean
- DESIGN: section "Spec delta" ใน design.md (ADDED/MODIFIED/REMOVED ต่อ requirement เทียบ feature spec ปัจจุบัน) + gate item
- VERIFY: อ่าน spec ของ feature ที่ถูกแตะเป็น regression baseline — scenario เดิม = regression case, scenario ใน delta = test case ใหม่
- SHIP: merge delta เข้า feature spec กึ่ง mechanical หลัง approve รวมใน promotion plan; feature ใหม่ = สร้าง spec.md จาก delta ทั้งก้อน
- วงจรเต็ม: spec ปัจจุบัน → DESIGN delta → BUILD ตาม spec ของ task → VERIFY เทียบทั้ง baseline+delta → SHIP merge → spec ใหม่เป็นปัจจุบันรอบถัดไป

## 8. Open questions (ที่ยังค้าง)
- [x] รูปแบบ spec → Decision #2 (lean)
- [x] ตำแหน่งที่ spec อยู่ → Decision #3 (`docs/features/<name>/spec.md`)
- [x] delta เขียนที่ไหนใน topic → Decision #4 (section ใน design.md)
- [x] ความเข้มของ SHIP merge → Decision #5 (กึ่ง mechanical + approve รวม)
- [x] backfill/brownfield → Decision #6 (organic + dogfood 2 ตัว)
- [x] ขอบเขตไฟล์ที่ต้องแก้ → ตอบจาก code inspection (ดู §3 In scope + `research.md` §4) — รายละเอียดระดับบรรทัดเป็นงาน DESIGN
- รายละเอียดที่จงใจยกไป DESIGN: token-lean cap ตัวเลขเท่าไหร่, โครง section ภายใน spec.md, wording canonical ของ delta

## 9. ความเสี่ยงหลัก
- **spec บวม/รก เมื่อ feature โต** → mitigations: lean format + token-lean cap (กำหนดตัวเลขใน DESIGN ตาม precedent codemap), spec เก็บเฉพาะ observable behavior ไม่เก็บ implementation
- **ceremony เพิ่มต่อ topic** (ต้องเขียน delta ทุกครั้ง) → mitigation: delta เป็น section เดียวใน design.md ที่เขียนอยู่แล้ว; topic ที่ไม่แตะพฤติกรรม (refactor/docs) ระบุ "ไม่มี delta" บรรทัดเดียวได้
- **spec กับ code drift หลัง merge** (ปัญหาเดียวกับ docs ทุกชนิด) → mitigation: กติกา docs-match-code ใน SHIP (Decision #5) + validator topic ถัดไปช่วยเช็คโครง
- **backward compatibility** — topic/feature เก่าไม่มี spec → กติกา "ไม่มี spec = สร้างใหม่ตอน SHIP" ต้องเขียนชัดใน playbook

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- เอกสารโปรเจกต์: `docs/project.md`, `docs/roadmap.md` (หลักการชี้นำ), `docs/rule.md`
- โค้ด/ไฟล์ที่ตรวจสอบ: `src/.warnyin/template/docs/features/[feature-name]/` (ปัจจุบันมีแค่ `feature.md`+`business.md`), `src/.warnyin/workflow/stages/{design,verify,ship}.md`
- OpenSpec: https://github.com/Fission-AI/OpenSpec/

---

## ✅ Gate → DESIGN (ดู `.warnyin/workflow/stages/discovery.md` ข้อ 6)
- [x] Problem / why-now ชัด ผูกกับ project.md (§2)
- [x] Scope in/out ชัด (§3)
- [x] Decision log ปิดทุกประเด็นสำคัญ ไม่มี open question ที่ block (§4, §8 — 6 decisions)
- [x] success criteria วัดผลได้ (§6)
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ (§5, §9)
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (2026-06-07)
