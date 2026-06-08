# Discovery — Memory/Identity + Observability: ปรับใช้เข้ากับ product เรา

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `memory-identity-observability` |
| **สถานะ** | `ผ่าน gate แล้ว` → next: `/warnyin:design context-working-memory` (Gap A) |
| **วันที่** | 2026-06-08 |
| **ผู้ร่วมตัดสินใจ** | rujiroj.ta |
| **เริ่มจาก** | `docs/project.md` (นิยาม product), ต่อยอดจาก product thesis "กองเรือ" (brainstorm ก่อนหน้า) |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> วิเคราะห์ว่าจะนำแนวคิด **Memory/Identity** (agent มีตัวตน + จำงานสะสม) และ **Observability ที่คนดูรู้เรื่อง** (เห็น real-time ว่า agent คิด/คุย/ตัดสินใจอะไร) มาปรับใช้กับ product เราได้อย่างไร — โดยทั้งสองถูกระบุเป็น 2 wedge หลักของ thesis

## 2. Problem & Why now
- ปัญหา / โอกาส: @warnyin/agents มี **project-memory แข็ง** (docs/ + SHIP + achieved/ + learned-rule) และ **observability แบบ static** (stage artifacts) อยู่แล้ว — แต่ยังขาด 3 จุด: working-memory ข้าม topic, narrative ตอน multi-agent ทำงาน, และ memory ที่ผูกกับ role
- ทำไมต้องทำตอนนี้: workflow ใช้จริงจน achieved 16 topics แล้ว → pain เรื่อง "ความต่อเนื่องข้าม topic" และ "มองไม่เห็นตอน fan-out" เริ่มชัด
- ผูกกับเป้าหมายโปรเจกต์: ตรงกับ success metric "งานถัดไปเริ่มจากความรู้ล่าสุดทุกครั้ง" (README) — gap เหล่านี้คือรอยรั่วของคำสัญญานั้น

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำใน Discovery นี้)**
- วิเคราะห์ gap ทั้ง 3 (A/B/C) แบบ PO: คุณค่า, effort, priority, MVP, scope-out, risk
- เสนอลำดับการทำ (sequencing) + recommend ตัวที่ควร design ก่อน

**Out of scope (จะไม่ทำในรอบนี้)**
- การ build จริง (Discovery = วิเคราะห์ + ตี scope เท่านั้น)
- **real-time dashboard / runtime UI** — ขัด scope-out ของ `docs/project.md` (product เป็น markdown playbook ไม่ใช่ runtime) → observability ต้องเป็น artifact-based
- dependency ภายนอก (คง zero-dep)

## 4. Decision Log
| # | คำถาม / ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| 1 | target product ของการวิเคราะห์นี้คืออะไร | A) กองเรือ orchestrator B) @warnyin/agents C) typmem | รอ user | **B) @warnyin/agents** | user เลือก — เอา wedge มาเสริม workflow installer ที่มีอยู่จริง |
| 2 | angle ที่จะตี scope ใน discovery นี้ | A) gap เดียว B) ทั้ง 3 | ทั้ง 3 (วิเคราะห์รวม) | **ทั้ง 3** | user เลือก — ต้องการภาพรวมก่อนเลือกตัวทำ |
| 3 | ลำดับการทำ + ตัวที่ design ก่อน | A→B→C variants | A → B → (C ดอง), design A ก่อน | **A → B → (C ดอง), design A ก่อน** | A คุ้ม value/effort + in-constraint; C ทับ learned-rule |

## 5. สมมติฐาน & ข้อจำกัด
- สมมติฐาน: thesis ที่ว่า Memory + Observability คือ "1 wedge มองคนละมุม" → ในบริบท repo นี้แปลว่า **stage artifact = ทั้ง observability (narrative) และ memory (พอ SHIP ก็กลายเป็น docs/)**; SHIP คือจุดที่ "observability กลายเป็น memory"
- ข้อจำกัด: zero-dep, tool-agnostic (markdown playbook), **ไม่ใช่ runtime** → solution ทุกตัวต้อง markdown/artifact-native

## 6. เกณฑ์ความสำเร็จ (ของ Discovery นี้ — วัดผลได้)
- มีบทวิเคราะห์ครบทั้ง 3 gap พร้อม priority + MVP + scope-out ต่อ gap
- มี recommendation ลำดับการทำที่ user เห็นด้วย → ระบุได้ว่า "design ตัวไหนก่อน"
- ผ่าน gate → เข้า `/warnyin:design <gap ที่เลือก>` ได้ทันที

## 7. Feature ideas — วิเคราะห์ 3 gap (PO + architect lens)

### 🧠 Insight รวม: เติม "ปลายสองข้าง" ของ memory loop ที่มีอยู่
ปัจจุบัน loop = `stage artifact (observability) → SHIP → docs/ (long-term memory)`
- **Gap A** เติมปลาย **short-term** (working memory ระหว่างทาง)
- **Gap B** เติมปลาย **real-time** (narrative ตอน run จริง) — แล้วป้อนกลับเข้า A ได้
- **Gap C** = เปลี่ยน "แกน" ของ memory จาก component/project → role (ทับซ้อน learned-rule สูง)

### Gap A — `context.md` working-memory (cross-topic)
- **ปัญหา:** `docs/stages/context.md` ว่างเปล่า ทั้งที่ discovery playbook §2 สั่งให้อ่านเป็น input → "ความจำระยะสั้นข้าม topic" ตายอยู่ ทุก session ต้อง re-orient เอง
- **คืออะไร:** ไฟล์สถานะสด ๆ — topic ที่ in-flight ตอนนี้, อะไรเพิ่ง ship, ธีม/โฟกัสปัจจุบัน, decision ข้าม topic ที่ไม่สังกัด topic ใด (แยกชัดจาก `docs/` = semantic, `achieved/` = episodic)
- **MVP:** กำหนด schema สั้น ๆ ของ context.md + rule "ใคร update เมื่อไหร่" (เสนอ: SHIP append 1 บรรทัด + DESIGN/BUILD แตะเมื่อ scope ขยับ)
- **คุณค่า:** 🟢 สูง (orient เร็ว, ต่อเนื่องข้าม session) · **effort:** 🟢 ต่ำ · **constraint fit:** 🟢 perfect (markdown ล้วน)
- **risk:** staleness — ถ้าไม่มีวินัย update จะเน่า แล้วแย่กว่าไม่มี → หัวใจคือ "maintenance rule" ไม่ใช่ schema

### Gap B — narrative build-log (observability ตอน fan-out)
- **ปัญหา:** ตอน BUILD fan-out parallel ใน worktree (build.md §4) user เห็นแค่ structured report ตอนจบ wave — ช่วงกลางเป็น blackbox (เห็นไม่ออกว่า agent ไหนติด/ตัดสินใจอะไร)
- **คืออะไร (เวอร์ชันที่อยู่ใน scope):** ไม่ใช่ dashboard แต่เป็น **`build-log.md` แบบ narrative** ที่ sub-agent append เหตุการณ์สำคัญ (start/decision/error/done) → อ่านเหมือน timeline เรื่องเล่าของการ run
- **MVP:** build-wave.mjs ให้แต่ละ agent emit log บรรทัดสำคัญ → main loop รวมเป็น `build-log.md` 1 ไฟล์ต่อ slug
- **คุณค่า:** 🟡 กลาง-สูง (trust + debug ตอน build ล่ม) · **effort:** 🟡 กลาง · **constraint fit:** 🟡 ได้ถ้าเป็น artifact (ถ้าดัน real-time = หลุด scope)
- **risk:** noise — log เยอะเกินไม่มีใครอ่าน → ต้อง "narrative ไม่ใช่ raw dump"; (เกร็ด: Claude Code มี `/workflows` live อยู่แล้ว → gap จริงคือ "สรุปเป็นเรื่อง + cross-tool" ไม่ใช่ stream)

### Gap C — role → identity ที่สะสมได้
- **ปัญหา:** role cards (`roles/*.md`) เป็นนิยาม static — ไม่มีการสะสม "บทเรียนของ role นี้ในโปรเจกต์นี้"
- **คืออะไร:** role card ที่พอก lessons ตามเวลา ("ในฐานะ Developer โปรเจกต์นี้ เคยพลาด X → เช็คเสมอ")
- **⚠️ ทับซ้อนสูง:** learned-rule + troubleshooting KB **สะสมประสบการณ์อยู่แล้ว** เพียงแต่ scope เป็น component/project — delta จริงของ gap นี้คือแค่ "เพิ่ม scope=role" ให้ learned-rule
- **คุณค่า:** 🔴 ต่ำ-กลาง (abstract สุด, ผลไม่ชัดสำหรับ installer; concept "identity เพื่อผูกใจ" เหมาะกับ orchestrator มากกว่า) · **effort:** 🟡 กลาง · **constraint fit:** 🟢 markdown ได้
- **risk:** สร้างความซ้ำซ้อนกับ learned-rule → ระบบ memory งงว่ากฎอยู่ที่ไหน

### 🎯 Recommendation (sequencing)
1. **Gap A ก่อน** — value/effort ดีสุด, in-constraint, อุดรอยที่ playbook คาดหวังว่ามีอยู่แล้ว
2. **Gap B ตาม** — wedge value จริง (trust/debug), ทำได้ถ้าเฟรมเป็น artifact; ต่อยอดป้อน A ได้
3. **Gap C ทีหลัง/อาจตัด** — ทับ learned-rule มาก, revisit เมื่อมี need ชัด

## 8. Open questions
- [x] Q1: target product = @warnyin/agents (ปิดแล้ว)
- [x] Q2: sequencing A → B → (C ดอง), design A ก่อน — ปิดแล้ว (user เห็นด้วย)
- [~] Q3: Gap A — "maintenance rule" (ใคร update เมื่อไหร่) คือหัวใจ → **ยกเข้า DESIGN ของ Gap A** (ไม่ block gate)

## 9. ความเสี่ยงหลัก
- **scope creep ไป runtime/dashboard** — ขัด product identity (markdown installer) → ต้องกันด้วย scope-out ชัด
- **Gap A เน่า** — working memory ที่ไม่มีวินัย update แย่กว่าไม่มี
- **Gap C ซ้ำซ้อน** — ถ้าทำมั่ว จะชน learned-rule ที่มีอยู่

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- เอกสารโปรเจกต์: `docs/project.md`

---

## ✅ Gate → DESIGN  (ผ่านครบ 2026-06-08)
- [x] Problem / why-now ชัด ผูกกับ project.md (success metric "เริ่มจากความรู้ล่าสุด")
- [x] Scope in/out ชัด (วิเคราะห์ 3 gap; out = build จริง + runtime/dashboard + dep)
- [x] Decision log ปิดทุกประเด็นสำคัญ (Q1 target, Q2 sequencing, Q3 ยกเข้า DESIGN)
- [x] success criteria วัดผลได้ (มีบทวิเคราะห์ + recommendation ที่ user เห็นด้วย)
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (เลือก design Gap A ก่อน)
