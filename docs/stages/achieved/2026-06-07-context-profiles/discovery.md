# Discovery — context-profiles (session-level mode สำหรับ workflow)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `context-profiles` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-07 |
| **ผู้ร่วมตัดสินใจ** | user (smf.claude) + AI |
| **เริ่มจาก** | `docs/roadmap.md` P1 #5 · `docs/project.md` (ปรัชญา tool-agnostic, opinionated) |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> เพิ่ม **context profiles** = session-level mode 3 ตัว (`research`/`build`/`review`) เป็น `.md` บางๆ ใน `.warnyin/workflow/contexts/` ที่ AI อ่านตอนต้น session เพื่อปรับ posture/mindset ของทั้ง session — คนละมิติกับ role card (task-level lens) — แล้วให้ playbook แต่ละ stage อ้างถึง context ที่เข้าคู่

## 2. Problem & Why now
- **ปัญหา/โอกาส:** workflow มี role card (task-level) แต่ไม่มีกลไกกำหนด "โหมดการทำงานทั้ง session" — เช่น session ที่เน้นสำรวจ (research) vs ลงมือ (build) vs ตรวจ (review) ต้องการ posture/default behavior ต่างกัน; ตอนนี้ AI ไม่มีตัวชี้นำระดับ session
- **ทำไมตอนนี้:** P0 ปิดครบแล้ว — P1 #5 roadmap ระบุ "คุ้มสุด — แทบฟรี" (`.md` ล้วน ตรงปรัชญา); เป็นก้าวเสริมคุณค่าที่ risk ต่ำสุดใน P1
- **ผูกกับเป้าหมายโปรเจกต์:** `docs/project.md` + `roadmap.md` หลักการ — **tool-agnostic** (`.md` กลางที่ทุก harness อ่าน), **opinionated กระทัดรัด** (3 ตัวพอ ไม่บวมเป็น catalog)

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- สร้าง `.warnyin/workflow/contexts/{research,build,review}.md` — context card **บาง** (mindset/posture + do/don't + tool preference + ชี้ stage playbook ที่เกี่ยว) ทั้งใน `src/` (publish) + dogfood root
- `.warnyin/workflow/contexts/README.md` — อธิบายภาพรวม context vs role + วิธี activate (manual)
- ผูกเข้า playbook stages — แต่ละ `stages/*.md` (+ `discovery.md`) เพิ่มบรรทัดอ้าง context ที่เข้าคู่ (mapping เป็น design detail)
- อัปเดต `.warnyin/workflow/README.md` (ตาราง/โครง) + `roadmap.md` P1 #5 (ตอน SHIP)

**Out of scope (จะไม่ทำในรอบนี้)**
- **auto-activation** ตาม stage (D1 เลือก manual — auto = ต้องคิด adapter/hook มากขึ้น, ไว้รอบหน้า)
- context เพิ่มเกิน 3 ตัว (plan/debug/ship ฯลฯ — opinionated, เพิ่มทีหลังถ้าจำเป็น)
- แตะ `cli.mjs`/installer (contexts ใต้ `.warnyin/workflow/` → ship อัตโนมัติผ่าน CORE — ดู `research.md`)
- skill-format / hook (P1 #9 แยก)

## 4. Decision Log
| # | ประเด็น | ทางเลือก | แนะนำ | เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| 1 | จำนวน + activation | 3 manual / 3 auto / ปรับจำนวน | 3 (research/build/review) manual | **3 manual + playbook อ้างถึง** | ตรง roadmap; auto ต้องคิด adapter มากขึ้น (out); 3 ตัว opinionated |
| 2 | โครง context card | บาง (mindset+ชี้ stage) / ละเอียด / ทีละตัว | บาง | **บาง — mindset + do/don't + ชี้ stage** | ตรงปรัชญา adapter บาง ไม่ duplicate logic ของ stage playbook |
| 3 | installer กระทบไหม | กระทบ / ไม่ | ไม่ (code inspection) | **ไม่กระทบ** | `contexts/` ใต้ `.warnyin/workflow/` → CORE copyTree + files allowlist + verify-pack ครอบอยู่แล้ว (`research.md`) |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** AI harness อ่าน context card ได้เมื่อ user ชี้ (manual) — เหมือน role card ที่เป็น lens
- **ข้อจำกัด:** 2-layer bootstrap — สร้างใน `src/.warnyin/workflow/contexts/` (publish) **และ** root dogfood `.warnyin/workflow/contexts/` (gitignored — regen ได้ด้วย `setup:dogfood` แต่ควรสร้างให้ใช้ทันที); `.md` ล้วน ตรงปรัชญา tool-agnostic
- contexts ต้อง **ไม่ duplicate** เนื้อหา role card / stage playbook — เป็น posture layer เหนือขึ้นมา

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- มี `.warnyin/workflow/contexts/{research,build,review,README}.md` ครบ (src + dogfood) เนื้อหาบางตามโครง D2
- playbook stages อ้างถึง context ที่เข้าคู่ (ตรวจได้ว่าแต่ละ stage มีบรรทัดอ้าง)
- `.warnyin/workflow/README.md` สะท้อน contexts/ ใหม่
- `npm test` + `verify:pack` เขียว (ยืนยัน contexts ติด payload โดยไม่ต้องแก้ installer)
- ไม่แตะ `cli.mjs`/`package.json`/`verify-pack.mjs`

## 7. Feature ideas / ทางเลือกของวิธีแก้
- context card โครง: `## Mindset` · `## Do / Don't` · `## Tool preference` · `## ใช้คู่ stage ไหน (→ ชี้ playbook)`
- mapping context↔stage (design detail): Discovery→research, DESIGN→research+build, BUILD→build, VERIFY→review, SHIP→review

## 8. Open questions
- ไม่มี open question ที่ block — scope + technical ปิดครบ (mapping เป็น design detail)

## 9. ความเสี่ยงหลัก
- **ต่ำ** — `.md` ล้วน ไม่แตะ runtime/installer; ความเสี่ยงเดียว = contexts ซ้ำซ้อน role/stage → mitigate: โครงบาง + ชี้กลับ playbook (ไม่ duplicate)

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- `docs/roadmap.md` P1 #5 · `docs/project.md` · `.warnyin/workflow/roles/README.md` (เทียบ role vs context) · `.warnyin/workflow/README.md`

---

## ✅ Gate → DESIGN
- [x] Problem / why-now ชัด ผูกกับ project.md/roadmap
- [x] Scope in/out ชัด
- [x] Decision log ปิดประเด็นสำคัญ ไม่มี open question block
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (2026-06-07 — "ดีไซน์ต่อเลย")
