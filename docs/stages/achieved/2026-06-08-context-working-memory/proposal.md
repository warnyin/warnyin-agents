# Proposal — context.md working-memory (Gap A)

> Output ของ DESIGN stage · playbook: `.warnyin/workflow/stages/design.md`
> **what & why** ของ change นี้

| | |
|---|---|
| **Slug** | `context-working-memory` |
| **ประเภท** | `feature` (เสริม workflow + installer) |
| **ขนาด** | `กลาง` |
| **วันที่** | 2026-06-08 |
| **มาจาก Discovery?** | `../memory-identity-observability/discovery.md` (Gap A) |

## 1. สรุป change (what)
ทำให้ `docs/stages/context.md` เป็น **working-memory ข้าม topic** ที่ใช้งานได้จริง — โดย (1) ให้มันมี **skeleton/template** ตอน installer scaffold (ปัจจุบันเขียนเป็นไฟล์เปล่า) และ (2) เพิ่ม **producer (maintenance rule)**: SHIP เป็นคนเขียน/อัปเดตเป็นหลัก

## 2. ทำไม (why)
- **ปัญหา:** `docs/stages/context.md` ถูก *อ่าน* 3 ที่ (`discovery.md` §2.5, `explore.md`, `next.md`) แต่ **ไม่มี stage ไหนเขียน** — installer ก็ scaffold เป็นไฟล์เปล่า (`cli.mjs:121` `writeFileSync(dest,'')`) + ไม่มี template → เป็น "input ที่ไม่มี producer" จึงว่างเปล่ามาตลอด
- **ผลถ้าไม่ทำ:** คำสัญญา "งานถัดไปเริ่มจากความรู้ล่าสุดทุกครั้ง" (README success metric) มีรอยรั่ว — ทุก session/agent ต้อง re-orient เองจาก folder ดิบ; ความจำระยะสั้นข้าม topic (โฟกัส/ธีม/decision ข้าม topic) หายทุกครั้ง

## 3. ทางเลือกที่พิจารณา
| ทางเลือก | ข้อดี | ข้อเสีย | เลือก? |
|---|---|---|---|
| **A — Working-notes (ไม่ derive)** | เก็บเฉพาะส่วนที่ folder อนุมานไม่ได้ (โฟกัส/decision ข้าม topic/parking-lot/ไฮไลต์ ship); เบา, staleness ต่ำ, **ไม่ซ้ำ next.md** | ต้องมีวินัย maintain (แก้ด้วย: SHIP เป็น producer) | ✅ |
| B — Generated board (script) | deterministic ไม่มี staleness | **ซ้ำ next.md scan** (ละเมิด `unify-in-place`) + ผูก node + ไม่มีที่จด note | |
| C — Hybrid (board+notes) | ครบสุด | surface เยอะ + ยังซ้ำ next.md บางส่วน | |

- **เหตุผลที่เลือก A:** `next.md` §2 **derive "topic ไหนอยู่ stage ไหน" อยู่แล้ว** จาก folder/artifact → ถ้า context.md เก็บ status board = ซ้ำ = ละเมิด rule `unify-in-place` (docs/rule.md §1). context.md จึงควรเก็บ **เฉพาะส่วนที่ derive ไม่ได้** = working-notes (ยืนยันโดย user)

## 4. Scope
**In scope**
- skeleton template ของ context.md + ให้ installer seed จาก template (seed-if-absent, **ห้ามทับของเดิม**)
- maintenance rule: SHIP เป็น producer หลัก (append ไฮไลต์ที่ ship + อัปเดตโฟกัส) — wire ลง `ship.md` playbook
- ปรับ wording readers (`next.md`/`discovery.md`/`explore.md`) ให้ชัดว่า context.md = working-notes (ไม่ใช่ status board)

**Out of scope**
- status board / topic-stage derivation — เป็นหน้าที่ `next.md` (คงเดิม)
- script generator (ทางเลือก B) — ตัดทิ้ง
- Gap B (build-log) / Gap C (role-identity) — topic แยก
- เปลี่ยน `validate-topic.mjs` — มัน`SKIP context.md` อยู่แล้ว (ถูกต้อง: context.md ไม่ใช่ topic)

## 5. ผลกระทบ & ความเสี่ยง
- **ระบบเดิมที่กระทบ:** `cli.mjs` `ensureScaffold()` + `SCAFFOLD_FILES`; `ship.md` playbook; readers 3 ไฟล์ (wording); installer test
- **ความเสี่ยง + การลด:**
  - *staleness* (Gap A เน่า) → ผูก producer กับ **SHIP** (จุดที่แก้ docs/ อยู่แล้ว = natural, ไม่เพิ่มภาระ) + เนื้อหาเป็น append-mostly สั้น
  - *ทับงาน user ตอน --update* → context.md ต้อง **seed-if-absent เท่านั้น ห้ามอยู่ใน CORE ที่ overwrite** (อยู่ใน ensureScaffold path)
  - *ละเมิด unify-in-place* → scope-out status board ชัด (ให้ next.md derive)
  - *scaffold leak* (rule installer §4) → seed จาก `.warnyin/template/` (scaffold material) **ไม่ใช่** copy `docs/stages/` ของ repo ต้นทาง

## 6. ลิงก์
- Design (how): `./design.md`
- Tasks: `./tasks/`
- Discovery (umbrella): `../memory-identity-observability/discovery.md`
