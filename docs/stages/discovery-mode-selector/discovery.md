# Discovery — discovery-mode-selector

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `discovery-mode-selector` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-11 |
| **ผู้ร่วมตัดสินใจ** | Rujiroj (maintainer) |
| **เริ่มจาก** | `docs/project.md` (playbook 5-stage, contributor scope) |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> เพิ่มความสามารถให้ `/warnyin:discovery` เลือก **mode ความเข้มของ Discovery** ได้ 4 แบบ (`ไว / สมดุล / ละเอียด / โต้วาที`) เพื่อให้ผู้ใช้ควบคุมเองว่ารอบนี้อยากให้ Discovery ขุดลึก/challenge หนักแค่ไหน — โดย **ไม่ชน** 3 แกนเดิม (tier `change-sizing` × context-profile × grill)

## 2. Problem & Why now
- **ปัญหา / โอกาส:** ปัจจุบัน Discovery มีความเข้มเดียว (สัมภาษณ์ทีละข้อ + research พอประมาณ) — งานบางอย่างอยากได้เร็วกว่า (ถามน้อย รีบสรุป) บางอย่างอยากได้ลึก/มีการ challenge สมมติฐานหนักก่อนเข้า DESIGN เพื่อลดความเสี่ยงออกแบบผิด
- **ทำไมต้องทำตอนนี้:** ผู้ใช้ควรคุมระดับ ceremony ของ Discovery เองได้ แทน fix ตายตัว — ต่อยอดจาก philosophy "sizing-aware ceremony" ที่เพิ่งวางใน `change-sizing`
- **ผูกกับเป้าหมายโปรเจกต์:** workflow ที่ปรับ ceremony ตามงานจริง = ลด overhead งานเล็ก / เพิ่มความมั่นใจงานเสี่ยง (สอดกับ `docs/project.md` zero-config, ใช้ได้ครบ 5 stage)

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- เพิ่ม **mode taxonomy 4 ค่า** (`ไว / สมดุล / ละเอียด / โต้วาที`) เป็น canonical ใน playbook `discovery.md` เดียว (no-duplicate)
- **auto-suggest layer**: Discovery ground บริบทก่อน → ประเมิน+แนะนำ mode พร้อมเหตุผล → user ยืนยัน/override (pattern `establish-tier`)
- **โต้วาที (เต็ม)**: fan-out multi sub-agents เสนอ/แย้งหลายมุม → หลายรอบจน converge → main loop สังเคราะห์/ตัดสิน (single judgment) + fallback degrade → "ละเอียด"
- ยุบ **grill → alias "ละเอียด"**; wire mode เข้า command + skill `discovery` (adapter บาง ชี้ playbook)
- **สะพาน tier→mode**: tier:large เป็น signal แนะ "ละเอียด" (ไม่บังคับ)

**Out of scope (จะไม่ทำในรอบนี้)**
- ไม่แตะ tier `change-sizing` / context-profile catalog (orthogonal — ไม่เพิ่ม profile ที่ 4)
- ไม่ทำ mode ให้ stage อื่น (DESIGN/BUILD/VERIFY) — Discovery เท่านั้น
- ไม่ auto-execute mode โดยข้ามการยืนยัน user (auto-suggest ≠ auto-run)
- ไม่ผูกชื่อรุ่น model ใน payload (คง generic tier vocab ถ้าต้อง route)

## 4. Decision Log (เดินทีละกิ่งของ decision tree)
> หนึ่งแถว = หนึ่งการตัดสินใจ บันทึกทันทีที่ตกลงได้

| # | คำถาม / ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| 1 | Problem/why-now ของ mode selector | (ก) fix เข้มเดียวพอ / (ข) ให้ผู้ใช้คุมความเข้มเอง | (ข) | **(ข) ✅ ยืนยัน** | Discovery เข้มเดียวไม่พอ — งานเร็ว vs งานเสี่ยงต้องการความลึกต่างกัน |
| 2 | "โต้วาที" คืออะไร | multi-agent แย้งจริง / AI เล่นบทเดียว | multi-agent แย้งจริง | **multi-agent แย้งจริง ✅** | ยืนยันก่อนเข้า Discovery (spawn sub-agents เสนอ/แย้ง/สังเคราะห์) |
| 3 | mode ↔ tier (`change-sizing`) สัมพันธ์กันยังไง | แยกอิสระ+สะพาน / mode เป็น override ของ tier / ยุบรวมแกนเดียว | แยกอิสระ+สะพาน | **แยกอิสระ + สะพาน ✅** | mode คุมความเข้ม Discovery, tier คุมขนาด change — orthogonal; tier:large *แนะนำ* mode เริ่มต้นแต่ไม่บังคับ, user override ได้เสมอ |
| 4 | mode เป็นแกนอะไร (vs context-profile) | context-profile ที่ 4 / sub-axis ใต้ research / แกนใหม่ระดับ Discovery | แกนใหม่ระดับ Discovery | **แกนใหม่ระดับ Discovery ✅** | mode = parameter ของ discovery playbook เอง; ทั้ง 4 mode ยังสวม research profile เดิม — ไม่แตะ "3 context พอ" |
| 5 | `grill mode` เดิม สัมพันธ์กับ mode ใหม่ยังไง | alias ของ "ละเอียด" / flag แยก / คงไว้แยก | alias ของ "ละเอียด" | **grill = alias "ละเอียด" ✅** | "ซักถามฉันหน่อย/grill me" → trigger mode ละเอียด; ไม่มี grill เป็นแกนลอยแยก (ลด surface) |
| 6 | default mode เมื่อไม่ระบุ | static "สมดุล" / AI-suggest จากบริบท | static สมดุล | **AI-suggest จากบริบท ✅** | Discovery ground ข้อมูลก่อน → ประเมิน+**แนะนำ mode พร้อมเหตุผล** → user ยืนยัน/เปลี่ยน (mode ยังเป็น option ของ user); pattern เดียวกับ "DESIGN sizing gate" ของ `change-sizing` (assess→recommend→ยืนยัน) |
| 7 | tier:large แนะนำ mode ไหน (สะพาน) | ละเอียด / โต้วาที / ไม่แนะ | ละเอียด | **ละเอียด ✅** | งานใหญ่ = ควรขุดลึก+grill; เป็น *signal หนึ่ง* ในการ auto-suggest (ไม่บังคับ — user override ได้) |
| 8 | ขอบเขต MVP | 4 mode โต้วาที minimal / 3 mode เฟส / 4 mode โต้วาทีเต็ม | 4 mode โต้วาที minimal | **4 mode โต้วาทีเต็ม ✅** | user เลือก feature สมบูรณ์ — โต้วาทีทำเต็ม (dynamic agent + หลายรอบจน converge); reuse pattern "Parallelize gathering, serialize judgment" + fallback |
| 9 | เพิ่ม mode 5 `ไต่สวน` (amend หลัง VERIFY) | แทนโต้วาที / mode 5 ใหม่ / เสริมโต้วาที | mode 5 ใหม่ | **mode 5 ใหม่ ✅** | Blue/Red adversarial iterative + memory + grill ทุก finding + user-in-loop; โต้วาทีเดิมคงไว้ (quick); amend topic เดิม (ดู `design.md §11`) |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** mode = แกนคุม "ความเข้มของ Discovery stage เดียว" คนละมิติกับ tier (ขนาด change ข้าม stage)
- **ข้อจำกัด:** zero-dep, cross-platform, 2-layer bootstrap (`src/` ↔ root); playbook กลางห้าม duplicate logic; opinionated "ไม่ไหลเป็น catalog"

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- เรียก `/warnyin:discovery` แล้วเลือก/ถูกแนะนำได้ครบ 4 mode และพฤติกรรมต่างกันจริง (ไว=ถามน้อย/รีบสรุป, สมดุล=ปัจจุบัน, ละเอียด=ลึก+grill, โต้วาที=multi-agent)
- ไม่ระบุ mode → Discovery แนะนำ mode พร้อมเหตุผล + user override ได้ (สังเกตได้)
- "โต้วาที" spawn sub-agents จริง + สังเคราะห์เป็นข้อสรุปเดียว + มี fallback เมื่อ spawn ไม่ได้
- backward-compatible: flow Discovery เดิม (รวม "ซักถามฉันหน่อย") ยังทำงานผ่าน mode ที่ map ให้
- canonical taxonomy อยู่ที่ `discovery.md` เดียว — command/skill ชี้มา ไม่ duplicate (ตรวจด้วย grep)

## 7. Feature ideas / ทางเลือกของวิธีแก้
- mode = **dial ปรับพารามิเตอร์ของ loop เดิม** (จำนวน/ความลึกคำถาม · ความเข้ม research · spawn debate?) ไม่ใช่ flow ใหม่ 4 ชุด
- โต้วาที reuse หลักการ **"Parallelize gathering, serialize judgment"** (`build-orchestration`) + persona lens (BA/PO/SA/security) เป็นมุมแย้ง
- auto-suggest ใช้ signals: ความกำกวมของ request, tier (large→ละเอียด), จำนวน trade-off/decision ที่คาด, ความอ่อนไหว (hard-floor หมวด)
- trigger: arg `--mode=` (explicit) **หรือ** AI auto-suggest แล้วถาม (default) — DESIGN เลือก syntax

## 8. Open questions (ที่ยังค้าง)
- [x] **Q2:** mode ↔ tier → **แกนแยกอิสระ + สะพาน** (tier:large แนะนำ mode ไม่บังคับ)
- [x] **Q3:** mode = **แกนใหม่ระดับ Discovery** (ทั้ง 4 mode สวม research profile เดิม)
- [x] **Q4:** grill = **alias ของ "ละเอียด"** (ยุบเข้า ไม่มีแกนลอยแยก)
- [x] **Q5:** default = **AI-suggest จากบริบท** (user override ได้) · tier:large → แนะนำ **ละเอียด**
- [x] **Q6:** MVP = **ครบ 4 mode โต้วาทีเต็ม** (dynamic agent + converge + fallback)
- _เหลือเป็น design detail (ไม่ block gate):_ debate mechanics รายละเอียด · mode trigger syntax · debate token budget — ส่งต่อ DESIGN (`research.md §6`)

## 9. ความเสี่ยงหลัก
- **ความหมายชน 3 แกนเดิม** (tier × context-profile × grill) → ผู้ใช้สับสน "ไว" vs "fast"
- **catalog creep** — เพิ่ม mode แล้วขัด philosophy "opinionated, ไม่ไหลเป็น catalog"
- **โต้วาที = multi-agent** → ต้นทุน token/ความซับซ้อน orchestration สูง

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- เอกสารโปรเจกต์: `docs/project.md`, `docs/features/{context-profiles,change-sizing,utility-skills}/feature.md`
- โค้ด/ไฟล์ที่ตรวจสอบ: `.warnyin/workflow/stages/discovery.md`, `.warnyin/workflow/contexts/research.md`, `.claude/commands/warnyin/discovery.md`

---

## ✅ Gate → DESIGN (ดู `.warnyin/workflow/stages/discovery.md` ข้อ 6)
- [x] Problem / why-now ชัด ผูกกับ project.md
- [x] Scope in/out ชัด
- [x] Decision log ปิดทุกประเด็นสำคัญ (1-8) — ไม่มี open question ที่ block (เหลือเฉพาะ design detail)
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (สั่ง `/warnyin:design` = ยืนยัน เข้า DESIGN)
