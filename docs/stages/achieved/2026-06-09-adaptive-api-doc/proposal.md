# Proposal — Adaptive API documentation (OpenAPI 3.1)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `adaptive-api-doc` |
| **ประเภท** | `feature` |
| **ขนาด** | `กลาง` |
| **วันที่** | `2026-06-09` |
| **มาจาก Discovery?** | `ไม่มี` (มาจากคำถาม user เรื่องนำ skill `openapi-spec-generation` มาใช้กับ workflow) |

> **หมายเหตุ retrofit:** change นี้ถูก implement ลง `src/` ไปก่อนแล้ว (แก้ playbook ตรงๆ) — DESIGN ฉบับนี้เขียนย้อนหลังเพื่อจัดงานให้เข้า Warnyin workflow ให้ถูก process (proposal/design/tasks → VERIFY → SHIP) ตาม `CONTRIBUTING.md` §"การเปลี่ยนพฤติกรรม stage ใดๆ ให้ user ยืนยันก่อน"

## 1. สรุป change (what)
เพิ่ม **capability กลางใหม่** `.warnyin/workflow/api-doc.md` ที่ทำให้ stage **auto-detect** ว่า topic แตะ backend/REST API ไหม — ถ้าใช่ ผลิต + ยืนยัน + ส่งมอบ **OpenAPI 3.1 contract** อัตโนมัติตลอด lifecycle (DESIGN ผลิต → VERIFY validate → SHIP promote); ถ้าไม่ใช่ → ข้ามเงียบ ไม่ยัดเยียด

## 2. ทำไม (why)
- **ปัญหา/โอกาส:** workflow มี hook รออยู่แล้ว — `design.md` §6 ระบุ "API task → API SPEC (endpoint/schema/error/auth/status)" แต่เขียนเป็น prose ลอย ไม่มีรูปแบบมาตรฐาน, ไม่ถูกยืนยันตอน VERIFY, ไม่ถูก promote เป็น contract ถาวร → API design กระจัดกระจาย ตรวจสอบ/ส่งต่อยาก
- **ผลถ้าไม่ทำ:** โปรเจกต์ backend ที่ใช้ workflow ไม่ได้ contract ที่ machine-readable (gen SDK/lint/diff ไม่ได้), spec กับโค้ดจริง drift โดยไม่มีจุด verify

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A — ฝัง playbook + reference skill** | tool-agnostic (ทุก harness ได้), adaptive จริง (detect ทุก topic), ไม่ duplicate, ตรงปรัชญา "reference ไม่ vendor" | ต้องแตะ playbook 3 stage | ✅ |
| B — Warnyin slash command (`/warnyin:api-doc`) | เรียกใช้ชัดเจน | ผูก Claude Code, ไม่ adaptive อัตโนมัติ, เพิ่ม surface ใน namespace (ขัด "กระทัดรัด") | |
| C — vendor skill เข้า repo | template สำเร็จรูปติดมาเลย | ผูก Claude เจ้าเดียว, ขัด "reference ไม่ vendor", เพิ่ม payload/supply-chain surface | |

- **เหตุผลที่เลือก A:** สอดคล้อง rule แก่น — **tool-agnostic** (`docs/rule.md` §1), **skill-adapter convention** (adapter บาง ชี้ playbook ไม่ duplicate), **reference ไม่ vendor** (`roles/README.md` §Skill เสริม); adaptive แบบ detect-in-playbook ใช้ได้กับ Codex/Antigravity ด้วย ไม่ใช่แค่ description-trigger ของ skill

## 4. Scope
**In scope**
- capability doc กลาง `src/.warnyin/workflow/api-doc.md` (detect / 3 mode / per-stage / tooling / artifact location)
- hook บางๆ เข้า `design.md` (§6 + output + gate), `verify.md` (input + process + gate), `ship.md` (process + output + gate)
- adapter: แถว SA/Developer ใน `roles/README.md` §"Skill เสริม"; รายการไฟล์ใน `workflow/README.md`
- CHANGELOG entry

**Out of scope**
- ไม่ vendor skill/template ของ wshobson เข้า repo (อ้างอิงเท่านั้น)
- ไม่สร้าง slash command ใหม่
- ไม่บังคับติดตั้งเครื่องมือ (Spectral/Redocly/openapi-generator) — optional ของโปรเจกต์ปลายทาง
- ไม่แตะ root dogfood (`.warnyin/`) — ติดมาเองตอน release + `--update` รอบถัดไป

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** playbook 3 stage (เพิ่ม gate item ใหม่ — แต่ทุกข้อ **N/A เมื่อไม่ใช่ REST API** → topic ที่ไม่ใช่ backend ไม่กระทบ); ไม่แตะ installer/test logic
- **ความเสี่ยง:**
  - *false-positive detection* (จับว่าเป็น API ทั้งที่ไม่ใช่) → ลด: signal ต้อง "ชัดเจนอย่างน้อยหนึ่ง" + ไม่แน่ใจให้ถาม user (ตามหลัก "ห้ามเดา")
  - *bloat/catalog* (ขัด "กระทัดรัด opinionated") → ลด: capability เดียว, gate ด้วย auto-detect, ไม่เพิ่ม command/dependency
  - *duplication* ของ detect-logic ข้าม 3 stage → ลด: นิยาม canonical ที่ `api-doc.md` ที่เดียว, hook เป็น pointer บาง (canonical-copy convention)

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Business: — (ข้าม — เป็น dev-tooling capability, คุณค่า/เหตุผลครบใน §2-§3)
