# Feature — Spec delta (living behavior spec)

> ความรู้ถาวรระดับ feature · promote จาก topic `feature-spec-delta` (achieved 2026-06-07)

## คืออะไร
**living behavior spec + delta discipline** — ยืม 2 เทคนิคจาก OpenSpec (Fission-AI) เฉพาะส่วนที่ผ่านเกณฑ์ปรัชญา:
1. **behavior spec ต่อ feature** — `docs/features/<name>/spec.md` เก็บ "พฤติกรรมปัจจุบัน" ที่ testable (Requirement + Scenario GIVEN/WHEN/THEN แบบ lean — ไม่บังคับ RFC 2119, ไทย/อังกฤษผสมได้)
2. **delta discipline** — DESIGN ระบุพฤติกรรมที่เปลี่ยนเป็น section "9. Spec delta" (ADDED/MODIFIED/REMOVED) ใน `design.md` ของ topic → SHIP merge เข้า spec แบบกึ่ง mechanical

## ทำงานยังไง (วงจรเต็ม)
```
docs/features/<name>/spec.md (ปัจจุบัน)
  → DESIGN อ่านเป็น input + เขียน Spec delta (§9) — approve พร้อม design gate
  → VERIFY: scenario เดิมใน spec = regression case · scenario ใน delta = test case ใหม่
  → SHIP merge: ADDED ต่อท้าย · MODIFIED แทนที่ (rename → [เดิมชื่อ:]) · REMOVED ลบ
  → spec ใหม่ = baseline ของ topic ถัดไป
```
- **read-modify-verify:** MODIFIED/REMOVED ที่หา key ไม่เจอ → **STOP ถาม user ห้าม merge เงียบ** (key = feature ปลายทาง + ชื่อ requirement)
- **docs-match-code:** พฤติกรรมจริงต่างจาก delta → อัปเดต delta ก่อน merge + re-check เทียบ spec ณ เวลา ship (กัน stale)
- **brownfield = organic:** feature ไม่มี spec → สร้างตอน SHIP แตะครั้งแรก; ไม่ backfill ทั้งโปรเจกต์ ไม่ผูก init
- **backward compatible:** topic ไม่มี §9 → SHIP ทำแบบเดิม; topic ไม่แตะพฤติกรรม → เขียน "ไม่มี delta" บรรทัดเดียว

## ขอบเขต / ข้อจำกัด
- spec = **descriptive ไม่ใช่ imperative** (data ให้ VERIFY derive test — ไม่ใช่คำสั่ง agent) · placeholder เท่านั้น ห้าม secret/PII · ~≤100 บรรทัด/ไฟล์
- feature เอกสาร/playbook (ไม่มี runtime) → THEN ต้องเป็น observable artifact (grep/อ่านไฟล์ตรวจได้)
- จงใจ **ไม่เอา** จาก OpenSpec: schema-driven engine (OPSX), เลิก phase gate, ทรีแยก `specs/`, adapter 30+ tools — ขัดปรัชญากระทัดรัด/tool-agnostic
- structural validator/status script → topic แยก (ดู `docs/roadmap.md` ข้อ 14)

## ไฟล์ที่เกี่ยวข้อง
- template: `src/.warnyin/template/docs/features/[feature-name]/spec.md` (canonical format) + `src/.warnyin/template/stages/[topic]/design.md` §9
- playbook wiring: `src/.warnyin/workflow/stages/design.md` (§2/§4/§5/§8) · `verify.md` (§2/§3/§4/§6) · `ship.md` (§3/§4 step 5.1/§5/§6 — กติกา merge เต็มอยู่ที่นี่ที่เดียว)
- command mirror: `src/.claude/commands/warnyin/{design,verify,ship}.md` (บาง — ชี้ playbook)
- ตัวอย่างจริง: `docs/features/{context-profiles,utility-skills}/spec.md` (dogfood backfill)
