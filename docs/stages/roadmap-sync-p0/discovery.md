# Discovery — roadmap-sync-p0 (ปิด gap P0 ที่เหลือ + sync roadmap)

> Output ของ Discovery stage · playbook: `.warnyin/workflow/stages/discovery.md`

| | |
|---|---|
| **Slug** | `roadmap-sync-p0` |
| **สถานะ** | `ผ่าน gate แล้ว` |
| **วันที่** | 2026-06-07 |
| **ผู้ร่วมตัดสินใจ** | user (smf.claude) + AI |
| **เริ่มจาก** | `docs/project.md` (success metric: publish แล้วผู้ใช้ migrate เองได้) · `docs/roadmap.md` P0 #3/#4 |

---

## 1. สรุปความเข้าใจร่วมกัน (one-liner)
> ปิด gap P0 ที่ยังค้างจริง (CHANGELOG ขาด migration ของ breaking changes + README ไม่มีลิงก์ไป migration) และ sync checkbox ใน `roadmap.md` ให้ตรงสถานะจริงหลัง ship 0.7.0 — เพื่อให้ผู้ใช้ npm รุ่นเก่า migrate เองได้โดยไม่ต้องเดา

## 2. Problem & Why now
- **ปัญหา:** roadmap P0 #3 (CHANGELOG + migration 0.6.0) ทำไม่ครบ — `CHANGELOG.md` มีแค่ `[0.7.0]` ไม่มี migration ของ breaking change `warnyin/` → `.warnyin/` (0.6.0) ที่ publish ไปแล้ว; P0 #4 README ขาดลิงก์ไป migration; `roadmap.md` checkbox ไม่ sync กับงานจริง (อัปเดตล่าสุด 2026-06-06 ก่อน 0.7.0 ship)
- **ทำไมตอนนี้:** เพิ่ง ship 0.7.0 (src-bootstrap) — เป็นจังหวะปิด P0 ให้ครบก่อนขยับไป P1; ผู้ใช้ที่ค้าง 0.5.x/≤0.2.x ยัง `npx` มาเจอ legacy warning ใน `cli.mjs` แต่ไม่มีเอกสาร migration รองรับ
- **ผูกกับเป้าหมายโปรเจกต์:** `docs/project.md` success metric — "publish แล้ว payload ติดครบ + ผู้ใช้ migrate เองได้"; `docs/rule.md` §2 — "CHANGELOG ทุก user-facing change ... ให้ผู้ใช้ npm migrate เองได้โดยไม่ต้องเดา"

## 3. Scope (กว้าง → แคบ)
**In scope (จะทำ)**
- เพิ่ม **Migration guide section** ใน `CHANGELOG.md` — รวม breaking migration ทุกช่วง (≤0.2.x / 0.3–0.5.x → ปัจจุบัน; 0.6.0→0.7.0) ให้สอดคล้อง legacy warning ใน `src/bin/cli.mjs`
- `README.md` เพิ่ม **ลิงก์สั้น** ชี้ไป `CHANGELOG#migration` (single source — ไม่ duplicate เนื้อหา)
- **Sync `docs/roadmap.md`** — ติ๊ก checkbox P0 #3/#4 ตามจริง + อัปเดตวันที่ + หมายเหตุสถานะ

**Out of scope (จะไม่ทำในรอบนี้)**
- **#12 lint/format** (markdownlint + prettier เข้า CI) — เป็น P2 แยก scope ชัด
- เขียน entry `[0.6.0]` แยก version ย้อนหลังแบบ Keep-a-Changelog (เลือก Migration guide section รวมแทน — D2)
- แตะโค้ด installer / payload / โครง `src/` ใดๆ (งานเอกสารล้วน)
- P1 (#5–9) และ P2 อื่น

## 4. Decision Log (เดินทีละกิ่งของ decision tree)

| # | คำถาม / ประเด็น | ทางเลือก | คำตอบที่แนะนำ | ที่เลือกจริง | เหตุผล |
|---|---|---|---|---|---|
| 1 | ขอบเขต topic | ปิด gap P0 / +#12 lint / แค่ sync roadmap | ปิด gap P0 + sync roadmap | **ปิด gap P0 + sync roadmap** | #12 เป็น P2 แยก scope; โฟกัสปิด P0 ให้ครบก่อน |
| 2 | จัดการ CHANGELOG 0.6.0 ที่ขาด | entry 0.6.0 ย้อนหลัง / Migration guide section รวม / ข้าม | Migration guide section รวม | **Migration guide section รวม** | รวม breaking ทุกช่วง (0.5.x→0.6.0→0.7.0) ที่ section เดียว อ่านง่ายกว่าไล่ย้อน version |
| 3 | Migration อยู่ที่ไหน + README link | CHANGELOG+README link / README เต็ม / CHANGELOG เท่านั้น | CHANGELOG + README ลิงก์ไป | **CHANGELOG + README ลิงก์ไป** | CHANGELOG = ที่ผู้ใช้ npm มองหา migration (single source); README ลิงก์สั้นกัน duplicate |
| 4 | 0.6.0→0.7.0 กระทบผู้ใช้ปลายทางไหม | กระทบ / ไม่กระทบ | ไม่กระทบ (code inspection) | **ไม่กระทบ** | bin path/dogfood เป็นเรื่อง repo เอง payload คงเดิม → migration guide ระบุชัดว่า contributor เท่านั้นที่กระทบ (ดู `research.md`) |

## 5. สมมติฐาน & ข้อจำกัด
- **สมมติฐาน:** 0.6.0 publish ขึ้น npm จริง (เป็น dogfood baseline ตาม `docs/infra.md` Runbook ข้อ 1) → ผู้ใช้บางส่วนอาจค้างรุ่นนี้
- **ข้อจำกัด:** งานเอกสารล้วน — ห้ามแตะ `src/` (โค้ด/payload); migration content ต้อง **สอดคล้องกับ legacy warning string จริง** ใน `cli.mjs` (en-dash `0.3–0.5.x` U+2013, `≤` U+2264) ไม่ใช่แต่งใหม่
- เนื้อหาเป็นภาษาไทย ตามสไตล์ repo (`docs/rule.md` §2)

## 6. เกณฑ์ความสำเร็จ (วัดผลได้)
- `CHANGELOG.md` มี Migration guide section ครอบ migration path ครบทุกช่วง breaking ที่ `cli.mjs` ตรวจจับ (≤0.2.x / 0.3–0.5.x) + ระบุ 0.6.0→0.7.0 ว่าผู้ใช้ปลายทางไม่กระทบ
- `README.md` มีลิงก์ใช้งานได้ชี้ไป Migration guide ใน CHANGELOG
- `docs/roadmap.md` P0 #3/#4 checkbox ตรงสถานะจริง (ติ๊กส่วนที่เสร็จ + ระบุส่วนที่ยังค้างถ้ามี) + วันที่อัปเดตเป็น 2026-06-07
- ไม่มีการแตะ `src/` — `git diff --stat` แสดงเฉพาะ `CHANGELOG.md`, `README.md`, `docs/roadmap.md` (+ artifact topic)

## 7. Feature ideas / ทางเลือกของวิธีแก้
- Migration guide เขียนเป็นตาราง `จากรุ่น → ทำอะไร → คำสั่ง git mv` mirror legacy warning ใน `cli.mjs` (ผู้ใช้เทียบกับที่ installer เตือนได้ตรง)
- README link: เพิ่มบรรทัดใต้ section "ติดตั้ง" หรือ "เริ่มใช้งาน" — `> อัปเกรดจากรุ่นเก่า? ดู [Migration guide](CHANGELOG.md#migration)`

## 8. Open questions (ที่ยังค้าง)
- ไม่มี open question ที่ block การออกแบบ — scope + technical ปิดครบแล้ว

## 9. ความเสี่ยงหลัก
- **ต่ำ** — งานเอกสารล้วน ไม่กระทบ runtime/payload/CI; ความเสี่ยงเดียวคือ migration content คลาดเคลื่อนจาก legacy warning จริง → mitigate ด้วยการ copy codepoint ตรงจาก `cli.mjs` (verified ใน `research.md`)

## 10. ลิงก์ที่เกี่ยวข้อง
- Research: `./research.md`
- เอกสารโปรเจกต์: `docs/project.md`, `docs/rule.md` §2, `docs/infra.md` (Runbook), `docs/roadmap.md` P0 #3/#4
- โค้ด/ไฟล์ที่ตรวจสอบ: `src/bin/cli.mjs` (legacy warning L43–58), `CHANGELOG.md`, `README.md`, `.github/workflows/ci.yml`

---

## ✅ Gate → DESIGN (ดู `.warnyin/workflow/stages/discovery.md` ข้อ 6)
- [x] Problem / why-now ชัด ผูกกับ project.md
- [x] Scope in/out ชัด
- [x] Decision log ปิดทุกประเด็นสำคัญ ไม่มี open question ที่ block
- [x] success criteria วัดผลได้
- [x] สมมติฐาน/ข้อจำกัด/ความเสี่ยง บันทึกครบ
- [x] user ยืนยัน "เข้าใจตรงกันแล้ว" (2026-06-07)
