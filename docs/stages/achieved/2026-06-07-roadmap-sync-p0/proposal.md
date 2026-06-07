# Proposal — roadmap-sync-p0 (ปิด gap P0 เอกสาร + sync roadmap)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `roadmap-sync-p0` |
| **ประเภท** | `docs` |
| **ขนาด** | `เล็ก` |
| **วันที่** | 2026-06-07 |
| **มาจาก Discovery?** | `./discovery.md` |

## 1. สรุป change (what)
> เพิ่ม Migration guide section ใน `CHANGELOG.md` (mirror legacy warning ใน `cli.mjs`), เพิ่มลิงก์จาก `README.md` ชี้ไป section นั้น, และ sync checkbox P0 #3/#4 ใน `docs/roadmap.md` ให้ตรงสถานะจริงหลัง ship 0.7.0

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** ผู้ใช้ npm ที่ค้างรุ่นเก่า (≤0.2.x / 0.3–0.5.x) `npx` มาเจอ legacy warning จาก `cli.mjs` แต่ไม่มีเอกสาร migration รองรับ; roadmap แสดงสถานะ P0 ไม่ตรงจริง
- **ผลถ้าไม่ทำ:** P0 ค้างไม่ปิด, ผู้ใช้รุ่นเก่า migrate ผิด/ต้องเดา (ขัด `docs/rule.md` §2 "migrate เองได้โดยไม่ต้องเดา"), roadmap ชี้ทางผิดในงานถัดไป

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A (แนะนำ) Migration guide section รวมใน CHANGELOG + README ลิงก์ | single source, อ่าน migration ทุก breaking ที่เดียว, ไม่ duplicate | ไม่ canonical แบบ per-version | ✅ |
| B entry `[0.6.0]` ย้อนหลังแยก version | ตรง Keep-a-Changelog | migration กระจายหลาย version, ต้องไล่ย้อน | |
| C migration ใน README เต็ม | ผู้ใช้เห็นเร็ว | duplicate กับ CHANGELOG, README บวม | |

- **เหตุผลที่เลือก:** A — ตรง decision D2/D3 ใน Discovery; CHANGELOG = ที่ผู้ใช้ npm มองหา migration; README ลิงก์สั้นกัน duplicate

## 4. Scope
**In scope**
- `CHANGELOG.md` — Migration guide section (≤0.2.x / 0.3–0.5.x → ปัจจุบัน; 0.6.0→0.7.0 ระบุไม่กระทบผู้ใช้ปลายทาง)
- `README.md` — ลิงก์ 1 บรรทัดชี้ `CHANGELOG#migration`
- `docs/roadmap.md` — sync checkbox P0 #3/#4 + วันที่

**Out of scope**
- #12 lint/format (P2), entry 0.6.0 แยก version, แตะ `src/` (โค้ด/payload), P1 อื่น

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** ไม่มี runtime/payload/CI — เอกสารล้วน
- **ความเสี่ยง + วิธีลด:** ต่ำ; ความเสี่ยงเดียว = migration content คลาดจาก legacy warning จริง → mitigate: copy codepoint ตรงจาก `cli.mjs` (en-dash U+2013, `≤` U+2264) + ตรวจ anchor link ใช้งานได้

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Business: ข้าม (change เล็ก — docs)
