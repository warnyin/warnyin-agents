# Proposal — Structural validator + status script

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `validator-status` |
| **ประเภท** | `feature` (dev tooling ใน payload — script + playbook wiring) |
| **ขนาด** | `เล็ก-กลาง` |
| **วันที่** | `2026-06-07` |
| **มาจาก Discovery?** | ไม่มี Discovery แยก — scope ตกลงไว้แล้วใน `docs/roadmap.md` ข้อ 14 + discovery ของ topic `feature-spec-delta` (achieved 2026-06-07, out-of-scope §3) |

## 1. สรุป change (what)
เพิ่ม `validate-topic.mjs` (zero-dep `node:*`) ลง payload `.warnyin/workflow/scripts/` — **ไฟล์เดียว 2 โหมด**: รันไม่ใส่ arg = **status** สแกนทุก topic (ตาราง slug|stage|โครงขาด, exit 0 เสมอ) · ใส่ `<slug>` = **validate** ละเอียด (exit≠0 เมื่อโครงขาด) แล้ว wiring เข้า playbook 3 จุด: `/warnyin:next` (structural pre-scan) · DESIGN gate (หลังเขียนไฟล์ task) · SHIP step แรก (ก่อน promote)

## 2. ทำไม (why)
- **ปัญหา:** งาน structural (เช็ค artifact ครบ, task มี 4 ไฟล์, โครง spec/delta ถูก, สแกนงานค้าง) ปัจจุบันใช้ model ทำทั้งหมด — เปลือง token, ไม่ deterministic, พลาดได้ (เทียบ `openspec validate`/`status` ของ OpenSpec ที่เป็น CLI)
- **ผลถ้าไม่ทำ:** `/warnyin:next` อ่านทุกไฟล์ด้วย model ทุกครั้ง; gate checklist เช็คโครงด้วยตาคน/model ซ้ำๆ ทุก topic — ความผิดพลาดสะสมเมื่อ topic เยอะขึ้น

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A (แนะนำ) — ไฟล์เดียว 2 โหมด ใน payload + wiring 3 จุด (next/DESIGN gate/SHIP) | logic เดียวไม่ซ้ำ, ทุกโปรเจกต์ปลายทางได้ไปด้วย, จุด wiring เฉพาะที่โครงเป็นประเด็น | — | ✅ (user ยืนยัน Q1+Q2) |
| B — แยก validate + status 2 ไฟล์ | หน้าที่ชัด | logic สแกนโครงซ้ำกันสองที่ — ขัดกระทัดรัด | ❌ |
| C — wiring ทุก stage gate | ครอบสุด | เพิ่ม ceremony ใน BUILD/VERIFY ที่ gate เป็นเรื่อง test ไม่ใช่โครงเอกสาร | ❌ |
| D — JSON Schema / validation framework | rule เยอะได้ | ทำลาย zero-dep (บทเรียน selective-install roadmap #11) | ❌ |

- **เหตุผลที่เลือก:** ตามเกณฑ์ roadmap — เขียนเอง zero-dep เฉพาะ high-signal (precedent `lint-md.mjs`), opinionated ไม่ไหลเป็น framework

## 4. Scope
**In scope** (แก้ที่ `src/`)
- `src/.warnyin/workflow/scripts/validate-topic.mjs` ใหม่ — pure function + injectable IO + main-guard (pattern เดียวกับ `lint-md.mjs`/`verify-pack.mjs`) + unit tests `src/tests/validate-topic.test.mjs`
- wiring playbook: `next.md` (pre-scan) · `stages/design.md` (gate item — unify เข้าข้อ "ทุก task มี 4 ไฟล์" เดิม) · `stages/ship.md` (step 1 รัน validate ก่อน promote) + command mirror ที่เกี่ยว (บาง)
- CHANGELOG entry (payload change)

**Out of scope**
- semantic validation (เนื้อหาถูก/claim ตรง source) — เป็นหน้าที่ model ตาม gate เดิม; script เช็คเฉพาะ **โครง**
- CI job แยก — unit tests เข้า suite เดิม (`npm test` รันใน CI อยู่แล้ว); validator ใช้กับ active topic ซึ่ง transient
- npm script ใหม่ — playbook เรียกผ่าน `node .warnyin/workflow/scripts/validate-topic.mjs` ตรง (target ไม่มี package.json การันตี)
- แก้ `cli.mjs`/verify-pack — `.warnyin/workflow/scripts/` อยู่ใน CORE + allowlist แล้ว (precedent `build-wave.mjs`)

## 5. ผลกระทบ & ความเสี่ยง
- **กระทบ:** playbook 3 ไฟล์ (เพิ่ม pointer/gate item — ไม่เปลี่ยน logic stage), ทุกโปรเจกต์ที่ `--update` ได้ script ใหม่
- **ความเสี่ยง + วิธีลด:**
  - false-fail กับ topic เก่า (ไม่มี §9 Spec delta) → ระดับ **warn ไม่ fail** สำหรับเช็คที่ format เพิ่งเกิด (backward compat)
  - "filled vs template" ตีความพลาด → ใช้ marker ชัด (placeholder จาก template จริง) — deterministic, มี unit test ครอบ
  - validator เข้มเกินจนเป็น ceremony → เช็คเฉพาะ high-signal ตาม roadmap #14 (4 กลุ่ม) ไม่เพิ่มเอง

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Business: ข้าม — tooling ภายใน, คุณค่าอยู่ใน §2 + roadmap #14
