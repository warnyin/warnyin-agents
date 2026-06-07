# Proposal — Feature behavior spec + delta discipline

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `feature-spec-delta` |
| **ประเภท** | `feature` (workflow standard — docs/content ใน `src/`) |
| **ขนาด** | `กลาง` |
| **วันที่** | `2026-06-07` |
| **มาจาก Discovery?** | `./discovery.md` (ผ่าน gate 2026-06-07 — decision log 6 ข้อ) |

## 1. สรุป change (what)
ยืม 2 เทคนิคจาก OpenSpec เข้า Warnyin Standard Workflow:
1. **Living behavior spec** — เพิ่ม `spec.md` (Requirement + Scenario แบบ lean) ใน `docs/features/<name>/` เป็น source of truth ของพฤติกรรมปัจจุบัน
2. **Delta discipline** — DESIGN ระบุ "Spec delta" (ADDED/MODIFIED/REMOVED) ใน `design.md` ของ topic → VERIFY ใช้ spec เป็น regression baseline → SHIP merge delta เข้า feature spec แบบกึ่ง mechanical

## 2. ทำไม (why)
- **ปัญหา:** (1) VERIFY ไม่มี regression baseline — `docs/features/` เป็น narrative ล้วน ไม่ testable; (2) SHIP promote พฤติกรรมระบบด้วย judgment ล้วน → เสี่ยง drift ระหว่าง design กับ docs กลาง (ดู `discovery.md` §2)
- **ผลถ้าไม่ทำ:** ความรู้เชิงพฤติกรรมค้างอยู่ใน topic ที่ archive แล้ว (spec ของ task ตายไปพร้อม topic); ทุก VERIFY เริ่มจากศูนย์; docs กลางเล่าพฤติกรรมไม่ตรงของจริงสะสมขึ้นเรื่อยๆ

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| A (แนะนำ) — spec ใน `docs/features/<name>/spec.md` + delta เป็น section ใน `design.md` + merge กึ่ง mechanical | เข้าโครงเดิม ไม่เพิ่มแกน/artifact ใหม่; .md ล้วน tool-agnostic; คง user approve | ต้องนิยาม canonical format ให้ชัดกันเพี้ยน | ✅ |
| B — ทรีแยก `docs/specs/<capability>/` + ไฟล์ delta แยก (ตาม OpenSpec ตรงตัว) | ตรงต้นแบบ, merge ไฟล์ต่อไฟล์ | แกนความรู้ซ้อนกับ `docs/features/` + เพิ่ม artifact ที่ 10 — ขัด "กระทัดรัด opinionated" | ❌ |
| C — schema-driven engine (OPSX) / validator runtime | deterministic เต็มขั้น | over-engineer, ขัด zero-dep + playbook-first; validator แยกเป็น topic เล็กต่างหาก | ❌ |

- **เหตุผลที่เลือก:** ตาม decision log Discovery #2-#6 — lean format, ฝังโครงเดิม, ไม่เพิ่ม ceremony, ได้ความ deterministic ของ OpenSpec โดยไม่ทิ้งหลัก "ห้ามเดา + user approve"

## 4. Scope
**In scope** (แก้ที่ `src/` ทั้งหมด + dogfood ใน `docs/` ของ repo นี้)
- template ใหม่ `src/.warnyin/template/docs/features/[feature-name]/spec.md` (canonical lean format)
- playbook DESIGN/VERIFY/SHIP + template `stages/[topic]/{design,ship}.md` + command mirror 3 ไฟล์ — wiring ครบวงจร delta
- CHANGELOG entry (payload change — user-facing)
- dogfood: `docs/features/{context-profiles,utility-skills}/spec.md` ของ repo นี้ (2 ตัว)

**Out of scope**
- structural validator / status script → topic แยกขนาดเล็ก (เปิดหลัง topic นี้ ship)
- `/warnyin:init` generate spec (brownfield = organic ตาม Discovery #6)
- แก้ `src/bin/cli.mjs` — ไม่จำเป็น (ตรวจแล้ว: `CORE` รวม `.warnyin/template` ทั้งก้อน → ไฟล์ใหม่ติดอัตโนมัติ, `seedDocs` ข้ามโฟลเดอร์ `[...]` อยู่แล้ว — `src/bin/cli.mjs:66-68,128-137`)
- BUILD playbook — task มี spec ของตัวเองอยู่แล้ว ไม่เกี่ยว feature spec โดยตรง

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบ/ฟีเจอร์เดิมที่กระทบ:** stage playbook 3 ไฟล์ (design/verify/ship) + template 3 ไฟล์ + command 3 ไฟล์ — ทุกโปรเจกต์ที่ `--update` จะได้พฤติกรรมใหม่; backward compatible (feature ไม่มี spec = สร้างใหม่ตอน SHIP, topic ไม่แตะพฤติกรรม = เขียน "ไม่มี delta" บรรทัดเดียว)
- **ความเสี่ยง + วิธีลด:**
  - spec บวม → format กำหนด guidance: เก็บเฉพาะ observable behavior, ~≤100 บรรทัด/ไฟล์, requirement ละ 1-3 scenario (guidance ไม่ enforce — แบบเดียวกับ codemap)
  - wording เพี้ยนข้ามไฟล์ → นิยาม canonical ใน `design.md` §4 ของ topic นี้ ทุก task อ้างชุดเดียว (precedent: topic `learned-rule`)
  - ceremony เพิ่ม → delta เป็น section เดียว, มีทางลัด "ไม่มี delta"

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Business: ข้าม — change ระดับ workflow tooling, คุณค่าเชิงธุรกิจอยู่ใน `./discovery.md` §2 แล้ว
