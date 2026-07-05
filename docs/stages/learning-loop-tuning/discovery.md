# Discovery — Learning Loop Tuning (ปรับจูน learning loop ใน 5-stage workflow ตาม insight ของ paper)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `learning-loop-tuning` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | `2026-07-05` |
| **ผู้ร่วมตัดสินใจ** | `Rujiroj` + Claude (facilitator) |
| **Mode** | `ละเอียด` (deep + grill) |
| **เริ่มจาก** | `docs/project.md` (workflow เป็น playbook ที่ AI อ่าน) + paper arXiv:2603.23994v2 |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> เราจะทำ **อะไร** ให้ **ใคร** เพื่อแก้ปัญหา **อะไร** — สรุปได้ใน 1-3 บรรทัด

เอา insight จาก paper *"Understanding the Challenges in Iterative Generative Optimization with LLMs"* (3 hidden knob: starting artifact / credit horizon / experience batching + "no universal loop setup, task-dependent") มา **codify เป็น guidance ใน playbook ของ warnyin ที่มี learning loop จริง** (BUILD full-gate fix loop, VERIFY "แก้จนผ่าน" loop, triage tier) — เพื่อให้ agent ที่เดิน loop เหล่านี้ตัดสินใจได้ดีขึ้น แทนที่จะฝัง/เดาเอง

## 2. Problem & Why now
- **ปัญหา / โอกาส:** warnyin codify "โครงสร้าง 5 stage" ไว้ดีแล้ว แต่ **"ปุ่มปรับ loop" 3 ตัว** (จะแก้ที่ต้นตอ/feedback แค่ไหนต่อรอบ, batch failure กี่จุดต่อการแก้ 1 ครั้ง, จุดตั้งต้น/การหั่น task กำหนด solution ที่เอื้อมถึง) ยัง **ฝัง/hardcode โดยปริยาย** ในคำว่า "แก้จนผ่าน" — agent ต้องเดาเอง
- **ทำไมต้องทำตอนนี้:** paper (พ.ค. 2026) ยืนยันเชิงประจักษ์ว่า loop-setup ที่เดาเองคือสาเหตุหลักที่ generative optimization ไม่ถูก adopt (9%) — warnyin ซึ่งมี fix loop จริงอยู่แล้วมีโอกาสอุดช่องนี้ด้วยต้นทุนต่ำ (แก้ playbook ล้วน)
- **ผูกกับเป้าหมายโปรเจกต์:** project.md ตั้งเป้า "5 stage ใช้ได้โดยไม่ต้องตั้งค่าเพิ่ม" → ปุ่มปรับที่เดาเองสวนทางเป้านี้; การผูก default กับ tier ที่มีอยู่ = zero-config ตามสปิริตเดิม

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- เพิ่ม **guidance กระชับ** เรื่อง 2 knob (credit-horizon + experience-batching) เข้า fix-loop principle ของ `src/.warnyin/workflow/stages/build.md` + `verify.md` (ส่วน "why + วิธีตัดสิน")
- เพิ่ม **default-by-tier** ของ 2 knob เข้า `src/.warnyin/workflow/triage.md` (fast-track skip-list / tier section — canonical ของ tier)
- เพิ่ม **observable proxy table (falsifiable)** ให้ทั้ง 2 จุด เพื่อให้ VERIFY เช็กได้ (ตาม house style `discovery-mode-selector`)
- เพิ่ม **note starting-artifact** สั้นๆ ใน `design.md` (การหั่น task/slice = decomposition choice ที่กำหนด solution ที่เอื้อมถึง)
- ทุกการแก้ทำที่ `src/.warnyin/workflow/` เท่านั้น (v-next source)

**Out of scope (จะไม่ทำในรอบนี้)**
- explicit tunable knob ต่อ topic (field ใน design.md ที่ตั้ง horizon/batch เอง) — defer (setup burden, paper เตือน)
- telemetry: นับรอบ fix → promote สถิติขึ้น KB กลาง — defer (scope ใหญ่, เป็น topic แยกได้)
- แก้ root `.warnyin/` (dogfood) — ปล่อยให้ update ผ่าน release ปกติ
- ทำ knob starting-artifact เป็น guidance เต็ม (แค่ note)

## 3.1 Constraint สำคัญ
- **แก้ที่ `src/` เท่านั้น** — root ≠ src (dogfood release เก่า) ยืนยันด้วย diff
- **เขียนกระชับตาม minimalism** — repo ให้คุณค่า minimalism (topic `ponytail-minimalism`); guidance ต้องสั้น + reference ไม่ inline ซ้ำ (DRY: `★ canonical`)

## 4. Decision Log (เดินทีละกิ่งของ decision tree)
> หนึ่งแถว = หนึ่งการตัดสินใจ บันทึกทันทีที่ตกลงได้

| # | คำถาม / ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| D1 | ระดับความลึกของการเปลี่ยน | guidance-only / explicit knob / full | guidance-only | **guidance-only** | ตรง paper (เลี่ยง over-engineer knob = ซ้ำรอย adoption 9%), zero-config คงไว้ ต้นทุนต่ำ |
| D2 | ครอบ knob ไหน | 2 fix-loop+note / ครบ3 / credit เดี่ยว | 2 fix-loop+note | **2 fix-loop + note** | credit-horizon + batching actionable สูง; starting-artifact แค่ validate ของเดิม → note ใน design.md |
| D3 | canonical home + ผูก tier | แยก why/tier / รวมที่ triage / อยู่ build-verify | แยก why/tier | **แยก why/tier** | why+วิธีตัดสินอยู่จุดที่ loop รัน (build/verify); default-by-tier อยู่ triage skip-list (canonical ของ tier); reference กัน ไม่ duplicate |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** agent ที่เดิน fix loop จะทำตาม guidance ถ้ามัน (ก) กระชับ (ข) วัดได้ผ่าน observable proxy — เหมือน mode-selector ที่เวิร์กมาแล้ว
- **ข้อจำกัด:** แก้ src เท่านั้น · zero-dependency (ไม่แตะ tooling) · ต้องไม่ inline ซ้ำ (DRY) · ต้องกระชับ (minimalism) · guidance ต้องใช้ได้ทุกเครื่อง (Claude/Codex/Antigravity) ไม่ผูกชื่อ tool เฉพาะ

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- [ ] `build.md` + `verify.md` มี guidance credit-horizon + batching พร้อม **observable proxy ที่ VERIFY assert ได้** (เช่น "fix loop มี finding >1 → agent ระบุ horizon/batch choice + เหตุผล ก่อนแก้")
- [ ] `triage.md` skip-list มี default-by-tier ของ 2 knob (fast/standard/large) — ผูกกับ tier ที่มีอยู่ ไม่สร้างมิติใหม่
- [ ] ไม่มี duplication — why อยู่ build/verify, default อยู่ triage, reference กันด้วย `★ canonical`/anchor
- [ ] `design.md` มี note starting-artifact สั้น
- [ ] verify-pack / dogfood parity ไม่พัง (src ยัง publish ได้)

## 7. Feature ideas / ทางเลือกของวิธีแก้
- guidance credit-horizon: "แก้ทีละ finding (short) vs รวมวิเคราะห์ root cause แล้วแก้เป็นชุด (long)" + เตือน "update ถี่เกินอาจพังจุดอื่น"
- guidance batching (full-gate): "แบ่ง failure ตาม component/root-cause แล้ว delegate ทีละกลุ่ม" + เตือน "batch ใหญ่ ≠ ดีกว่าเสมอ"
- default-by-tier: fast → horizon สั้น/batch เล็ก · standard → group by root-cause · large → รวมวิเคราะห์ก่อนแก้
- note design.md: decomposition (one-task vs หลาย-slice) กำหนด solution ที่เอื้อมถึง

## 8. Open questions (ที่ยังค้าง)
- [ ] ~~ไม่มี open question ที่ block DESIGN~~ — รายละเอียดถ้อยคำ/ค่า default ต่อ tier ที่แน่นอน เป็นงานของ DESIGN (ปิดที่ระดับ Discovery แล้ว)

## 9. ความเสี่ยงหลัก
- **guidance บวมทำลาย minimalism** → mitigate: เขียนสั้น + reference, review เทียบ `ponytail-minimalism`
- **agent ไม่ทำตาม guidance subjective** → mitigate: observable proxy (D4)
- **default-by-tier ขัด hard-floor/philosophy ของ triage** → mitigate: default เป็นแค่ starting point ปรับได้ ไม่ lock (สอดกับปรัชญา triage "sizing ปรับได้ทุกเมื่อ")

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- เอกสารโปรเจกต์: `docs/project.md`
- Paper: arXiv:2603.23994v2 "Understanding the Challenges in Iterative Generative Optimization with LLMs"
- โค้ด/ไฟล์ที่ตรวจสอบ: `src/.warnyin/workflow/stages/build.md`, `verify.md`, `triage.md`, `design.md`; achieved `2026-06-11-discovery-mode-selector` (house style observable proxy)

---

## ✅ Gate → DESIGN (ดู `.warnyin/workflow/stages/discovery.md` ข้อ 6)
- [x] Problem / why-now ชัด ผูกกับ project.md
- [x] Scope in/out ชัด
- [x] Decision log ปิดทุกประเด็นสำคัญ ไม่มี open question ที่ block
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (2026-07-05)
